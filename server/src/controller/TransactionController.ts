import { appCommonTypes } from "../@types/app-common";
import HttpResponse = appCommonTypes.HttpResponse;
import HttpStatus from "../helpers/HttpStatus";
import datasources from '../services/dao';
import { Request } from "express";
import Joi from "joi";
import CustomAPIError from "../exceptions/CustomAPIError";
import { HasPermission, TryCatch } from "../decorators";
import { ITransactionModel } from "../models/Transaction";
import axiosClient from '../services/api/axiosClient';
import { INIT_TRANSACTION, PAYMENT_CHANNELS, PAYMENT_DONE, PAYMENT_IN_PROGRESS, SEVEN_DAYS_IN_MS } from "../config/constants";
import { IWalletModel } from "../models/Wallet";
import { appEventEmitter } from "../services/AppEventEmitter";
import { CUSTOMER_PERMISSION, MAKE_PAYMENT, MANAGE_ALL, MANAGE_SOME, READ_ADMIN_FEES, READ_PAYMENT_REQUEST, READ_TRANSACTION, RIDER_PERMISSION } from "../config/settings";
import PaystackService from "../services/PaystackService";
import Generic from "../utils/Generic";
import RedisService from "../services/RedisService";

const redisService = new RedisService();
const paystackService = new PaystackService();

interface IAddToWallet {
    customer: string,
    amount: number
}

export default class TransactionController {

    /**
   * @name addToWallet
   * @description The method a customer calls when they are ready to fund their wallet/create a wallet if it does not exist.
   * @description The first payment by the customer creates a wallet and the subsequent adds to the wallet amount
   * @description via a payment gateway (paystack). Here we initialize a transaction.
   * @description The callback response from the payment gateway, is sent back to the server, the {@method initTransactionCallback }
   * @description verifies the transaction and close the transaction.
   * @param req {
       @field customerId:string,
       @field amount: number,
   * }
   */
    @TryCatch
    public async addToWallet(req: Request) {

        //@ts-ignore
        const customerId = req.user._id

        const { error, value } = Joi.object<IAddToWallet>({
            amount: Joi.number().required().label('Amount')
        }).validate(req.body);
      
        if (error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
        if (!value)
            return Promise.reject(CustomAPIError.response(HttpStatus.BAD_REQUEST.value, HttpStatus.BAD_REQUEST.code));

        if(value.amount <= 500) 
            return Promise.reject(CustomAPIError.response('Amount is too low, you can only deposit N500 and above', HttpStatus.NOT_FOUND.code));

        const customer = await datasources.customerDAOService.findById(customerId);
        if(!customer)
            return Promise.reject(CustomAPIError.response('Customer does not exist', HttpStatus.NOT_FOUND.code));

        if(!customer.email || !customer.phone) {
            return Promise.reject(CustomAPIError.response('Please complete customer profile, before initiating a transaction', HttpStatus.NOT_FOUND.code));
        }

        //initialize payment
        const metadata = {
            cancel_action: `${process.env.PAYMENT_GW_CB_URL}/transactions?status=cancelled`,
        };

        axiosClient.defaults.baseURL = `${process.env.PAYMENT_GW_BASE_URL}`;
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${process.env.PAYMENT_GW_SECRET_KEY}`;
    
        let endpoint = '/balance';

        const balanceResponse = await axiosClient.get(endpoint);
        if (balanceResponse.data.data.balance === 0)
        return Promise.reject(
            CustomAPIError.response('Insufficient Balance. Please contact support.', HttpStatus.BAD_REQUEST.code),
        );

        endpoint = '/transaction/initialize';

        const callbackUrl = `${process.env.PAYMENT_GW_CB_URL}/`;
        const amount = value.amount;
        let serviceCharge = 0.015 * amount;

        if (amount >= 2500) {
            serviceCharge = 0.015 * amount + 100;
        }

        if (serviceCharge >= 2000) serviceCharge = 2000;

        const _amount = Math.round((serviceCharge + amount) * 100);

        const initResponse = await axiosClient.post(`${endpoint}`, {
            email: customer.email,
            amount: _amount,
            callback_url: callbackUrl,
            metadata,
            channels: PAYMENT_CHANNELS,
        });

        const data = initResponse.data.data;

        const txnValues: Partial<ITransactionModel> = {
            reference: data.reference,
            authorizationUrl: data.authorization_url,
            type: 'Payment',
            status: initResponse.data.message,
            amount: value.amount,
            customer: customer._id
        };

        const transaction = await datasources.transactionDAOService.create(txnValues as ITransactionModel);
        
        appEventEmitter.emit(INIT_TRANSACTION, { customer, data });

        const response: HttpResponse<ITransactionModel> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: transaction,
          };
      
        return Promise.resolve(response);

    };

      /**
   * @name initTransactionCallback
   * @description This method handles verification of the transactions
   * @description and updating the transaction table accordingly.
   * @param req
   */
    @TryCatch
    public async initTransactionCallback(req: Request) {
        const { reference } = req.query as unknown as { reference: string };

        const transaction = await datasources.transactionDAOService.findByAny({
           reference: reference
        });
        
        if (!transaction) {
            return Promise.reject(CustomAPIError.response('Transaction Does not exist.', HttpStatus.NOT_FOUND.code));
        }

        const customer = transaction.customer;
        if (!customer) {
            return Promise.reject(CustomAPIError.response('Customer Does not exist.', HttpStatus.NOT_FOUND.code));
        }
        
        //verify payment
        axiosClient.defaults.baseURL = `${process.env.PAYMENT_GW_BASE_URL}`;
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${process.env.PAYMENT_GW_SECRET_KEY}`;

        const endpoint = `/transaction/verify/${reference}`;

        const axiosResponse = await axiosClient.get(endpoint);

        const data = axiosResponse.data.data;

        const findWallet = await datasources.walletDAOService.findByAny({
            customer: customer
        });

        // create wallet/update wallet
        if(!findWallet) {

            const walletValue: Partial<IWalletModel> = {
                balance: transaction.amount,
                customer: customer
            }

            const wallet = await datasources.walletDAOService.create(walletValue as IWalletModel)

            wallet.transactions.push(transaction._id);
            await wallet.save();
        
        } else {
            const walletValue = {
                balance: findWallet.balance + transaction.amount
            }

            const wallet = await datasources.walletDAOService.updateByAny(
                {_id: findWallet._id},
                walletValue
            );

            wallet?.transactions.push(transaction._id);
            await wallet?.save();
        }
        
        const $transaction = {
            reference: data.reference,
            channel: data.authorization.channel,
            cardType: data.authorization.card_type,
            bank: data.authorization.bank,
            last4: data.authorization.last4,
            expMonth: data.authorization.exp_month,
            expYear: data.authorization.exp_year,
            countryCode: data.authorization.country_code,
            brand: data.authorization.brand,
            currency: data.currency,
            status: data.status,
            paidAt: data.paid_at,
            type: transaction.type,
        };

        await datasources.transactionDAOService.update(
            {_id: transaction._id},
            $transaction
        );

        const response: HttpResponse<void> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
        };

        return Promise.resolve(response);
    };

    @TryCatch
    public async updateTransaction(req: Request) {
        const value = req.body;

        const transaction = await datasources.transactionDAOService.findByAny({
            reference: value.reference,
        });

        if (!transaction) {
            return Promise.reject(CustomAPIError.response('Transaction Does not exist.', HttpStatus.NOT_FOUND.code));
        }

        const transactionValues = {
            channel: value.channel,
            cardType: value.cardType,
            bank: value.bank,
            last4: value.last4,
            expMonth: value.expMonth,
            expYear: value.expYear,
            countryCode: value.countryCode,
            brand: value.brand,
            currency: value.currency,
            status: value.status,
            paidAt: value.paidAt,
        };

        await datasources.transactionDAOService.update(
            {_id: transaction._id},
            transactionValues
        );

        return Promise.resolve({
            code: HttpStatus.OK.code,
            message: 'Transaction updated successfully',
            result: transaction,
        } as HttpResponse<ITransactionModel>);
    }

    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION, READ_TRANSACTION])
    public async getCustomerTransactions(req: Request) {

        //@ts-ignore
        const customerId = req.user._id;

        const transactions = await datasources.transactionDAOService.findAll({ customer: customerId });

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: transactions 
        };

        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([MANAGE_ALL, MANAGE_SOME, READ_TRANSACTION])
    public async getTransactions(req: Request) {

        const transactions = await datasources.transactionDAOService.findAll({});

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: transactions 
        };

        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION])
    public async getTransactionsByRef(req: Request) {
        const { reference } = req.body;
        const transaction = await datasources.transactionDAOService.findByAny({
            reference: reference
        });

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: transaction
        };

        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([RIDER_PERMISSION])
    public async riderWallet(req: Request) {
        
        //@ts-ignore
        const riderId = req.user._id

        const wallet = await datasources.riderWalletDAOService.findByAny({ rider: riderId });
        if(!wallet)
            return Promise.reject(CustomAPIError.response('Wallet not found', HttpStatus.NOT_FOUND.code));
 
        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: wallet
        };

        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION])
    public async getCustomerWallet(req: Request) {

        //@ts-ignore
        const customerId = req.user._id 
        ;
        const wallet = await datasources.walletDAOService.findByAny({
            customer: customerId
        });

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: wallet
        };

        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([MANAGE_ALL, READ_ADMIN_FEES])
    public async fetchAdminFees(req: Request) {

        const fees = await datasources.adminFeeDAOService.findAll({});

        let total: number = 0;
        for(let fee of fees){
            total += fee.adminFee
        }

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: { fees, total }
        };

        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([MANAGE_ALL, READ_PAYMENT_REQUEST])
    public async fetchPaymentRequest(req: Request) {

        let activeFilter = false;
        let _filter = '';

        if (req.query.search === PAYMENT_IN_PROGRESS) {
            activeFilter = true;
            _filter = 't'
        } else if (req.query.search === PAYMENT_DONE) {
            activeFilter = false;
            _filter = 't'
        }

        const filter = _filter === ''
                        ? {} 
                        : activeFilter ? { status: PAYMENT_IN_PROGRESS } : { status: PAYMENT_DONE };

        const paymentReq = await datasources.paymentRequestDAOService.findAll(filter);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: paymentReq
        };

        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([RIDER_PERMISSION])
    public async requestPayment(req: Request) {

        const value = req.body;
        //@ts-ignore
        const riderId = req.user._id;
        const rider = await datasources.riderDAOService.findById(riderId);
        if(!rider)
        return Promise.reject(CustomAPIError.response("Rider not found", HttpStatus.NOT_FOUND.code));

        const riderWallet = await datasources.riderWalletDAOService.findByAny(
            { rider: riderId }
        )
        if(!riderWallet)
            return Promise.reject(CustomAPIError.response("Wallet not found", HttpStatus.NOT_FOUND.code));

        if(value.amountRequested > riderWallet.balance)
            return Promise.reject(CustomAPIError.response("Amount requested is greater than wallet balance", HttpStatus.NOT_FOUND.code));

        const paymentReq = await datasources.paymentRequestDAOService.findByAny(
            { rider: riderId }
        );

        if(paymentReq && paymentReq?.status === PAYMENT_IN_PROGRESS)
            return Promise.reject(CustomAPIError.response("You have a pending payment request.", HttpStatus.NOT_FOUND.code));
        
        //@ts-ignore
        if (paymentReq && paymentReq.status === PAYMENT_DONE) {
            const currentDate = new Date();
            //@ts-ignore
            const createdAtDate = new Date(paymentReq.createdAt);
          
            const timeDifference = currentDate.getTime() - createdAtDate.getTime();
            if (timeDifference >= SEVEN_DAYS_IN_MS && createdAtDate.getDay() === 1) {
                const values = {
                    rider: riderId,
                    amountRequested: value.amountRequested,
                    status: PAYMENT_IN_PROGRESS,
                    refNumber: Generic.generatePaymentRefNumber(6)
                }
        
                const payment = await datasources.paymentRequestDAOService.create(values as any);
        
                await datasources.riderWalletDAOService.update(
                    { rider: riderId },
                    { balance: riderWallet.balance - payment.amountRequested }
                )
              
            } else {
                return Promise.reject(CustomAPIError.response("Your withdrawal duration is not complete", HttpStatus.INTERNAL_SERVER_ERROR.code))
            }
        }

        //@ts-ignore
        if (!paymentReq && rider.createdAt) {
            const currentDate = new Date();
            //@ts-ignore
            const createdAtDate = new Date(rider.createdAt);
          
            const timeDifference = currentDate.getTime() - createdAtDate.getTime();
            if (timeDifference >= SEVEN_DAYS_IN_MS && currentDate.getDay() === 1) {
                const values = {
                    rider: riderId,
                    amountRequested: value.amountRequested,
                    status: PAYMENT_IN_PROGRESS,
                    refNumber: Generic.generateRandomStringCrypto(6)
                }
        
                const payment = await datasources.paymentRequestDAOService.create(values as any);
        
                await datasources.riderWalletDAOService.update(
                    { rider: riderId },
                    { balance: riderWallet.balance - payment.amountRequested }
                )
              
            } else {
                return Promise.reject(CustomAPIError.response("Your withdrawal duration is not complete", HttpStatus.INTERNAL_SERVER_ERROR.code))
            }
        }
    
        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: "Payment request was successful"
            // result: payment
        };

        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([MANAGE_ALL, MAKE_PAYMENT])
    public async makePayment(req: Request) {
        const riderId = req.params.riderId;
        const rider = await datasources.riderDAOService.findById(riderId);
        const paymentReq = await datasources.paymentRequestDAOService.findByAny({
            rider: riderId,
            status: PAYMENT_IN_PROGRESS,
        });

        if (!paymentReq) {
            return Promise.reject(
            CustomAPIError.response("Payment request not found", HttpStatus.NOT_FOUND.code)
            );
        }

        try {
            if (rider) {
                const accNum = rider.accountNumber;
                const bank = await datasources.bankDAOService.findByAny({ name: rider?.bankName });
                const bankCode = bank && bank?.code;

                const verificationData = await paystackService.verifyBankAccount(accNum, bankCode);

                if (verificationData.data.account_name !== rider.accountName) {
                    return Promise.reject(
                    CustomAPIError.response(
                        "Name on account doesn't match the account name you provided in your profile bank account section.",
                        HttpStatus.BAD_REQUEST.code
                    )
                    );
                }

                const amountInKobo = paymentReq.amountRequested * 100;
                await paystackService.sendMoneyToAccount(accNum, bankCode, amountInKobo, "Payment");

                const paid = await datasources.paymentRequestDAOService.updateByAny(
                    { _id: paymentReq._id },
                    { status: PAYMENT_DONE }
                );

                //Send notification to rider phone as text
                if(paid) {
                    await redisService.sendNotification(
                        rider.phone,
                        `You have been credited NGN${Generic.formatNumberToIntl(+paid?.amountRequested)}.`
                    )
                }
                
            }

            const response: HttpResponse<any> = {
                code: HttpStatus.OK.code,
                message: HttpStatus.OK.value,
                result: "Payment sent to rider",
            };

            return Promise.resolve(response);
        } catch (error: any) {
            return Promise.reject(CustomAPIError.response(error.message, HttpStatus.INTERNAL_SERVER_ERROR.code));
        }
    }

}