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
import { INIT_TRANSACTION, PAYMENT_CHANNELS, VERIFY_TRANSACTION } from "../config/constants";
import { IWalletModel } from "../models/Wallet";
import { appEventEmitter } from "../services/AppEventEmitter";
import { CUSTOMER_PERMISSION, MANAGE_ALL, MANAGE_SOME, READ_TRANSACTION } from "../config/settings";

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

        // appEventEmitter.emit(VERIFY_TRANSACTION, { customer, transaction: $transaction });
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
}