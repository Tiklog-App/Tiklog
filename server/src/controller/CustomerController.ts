import { Request } from "express";
import { HasPermission, TryCatch } from "../decorators";
import HttpStatus from "../helpers/HttpStatus";
import CustomAPIError from "../exceptions/CustomAPIError";
import datasources from  '../services/dao';
import { appCommonTypes } from '../@types/app-common';
import Joi from 'joi';
import HttpResponse = appCommonTypes.HttpResponse;
import { appEventEmitter } from '../services/AppEventEmitter';
import { $changePassword, $editCustomerProfileSchema, $resetPassword, $savePasswordAfterReset, $updateCustomerSchema, ICustomerModel } from "../models/Customer";
import {
    ALLOWED_FILE_TYPES,
    CHANGE_CUSTOMER_PASSWORD,
    DELETE_CUSTOMER_,
    HOME_ADDRESS,
    MAX_SIZE_IN_BYTE,
    MESSAGES,
    OFFICE_ADDRESS,
    UPDATE_CUSTOMER_,
    UPDATE_CUSTOMER_STATUS_,
    UPLOAD_BASE_PATH
} from "../config/constants";
import settings, { CUSTOMER_PERMISSION, DELETE_CUSTOMER, MANAGE_ALL, MANAGE_SOME, READ_CUSTOMER, UPDATE_CUSTOMER } from "../config/settings";
import BcryptPasswordEncoder = appCommonTypes.BcryptPasswordEncoder;
import RedisService from "../services/RedisService";
import SendMailService from "../services/SendMailService";
import Generic from "../utils/Generic";
import formidable, { File } from 'formidable';
import { $saveCustomerAddress, $updateCustomerAddress, ICustomerAddressModel } from "../models/CustomerAddress";
import moment = require("moment");

const redisService = new RedisService();
const sendMailService = new SendMailService();
const form = formidable({ uploadDir: UPLOAD_BASE_PATH });

export default class CustomerController {
    private declare readonly passwordEncoder: BcryptPasswordEncoder;

    constructor(passwordEncoder: BcryptPasswordEncoder) {
        this.passwordEncoder = passwordEncoder
    }

    /**
     * @name updateCustomer
     * @param req
     * @desc Updates the customer
     * only users with customer or update_customer permission
     * can do this 
     */
    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION, UPDATE_CUSTOMER])
    public async updateCustomer (req: Request) {
        const customer = await this.doUpdateCustomer(req);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully updated',
            result: customer
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION, UPDATE_CUSTOMER])
    public async editCustomerProfile (req: Request) {
        const customer = await this.doEditCustomerProfile(req);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully updated',
            result: customer
        };
      
        return Promise.resolve(response);
    };

    /**
     * @name updateCustomerStatus
     * @param req
     * @desc Updates the customer status
     * only user with super admin manage all and update customer
     * permission can do this 
     */
    @TryCatch
    @HasPermission([MANAGE_ALL, UPDATE_CUSTOMER])
    public  async updateCustomerStatus (req: Request) {
        await this.doUpdateCustomerStatus(req);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully updated status'
        };
      
        return Promise.resolve(response);
    };

    /**
     * @name deleteCustomer
     * @param req
     * @desc deletes the customer
     * only user with super admin manage all and delete customer
     * permission can do this 
     */
    @TryCatch
    @HasPermission([MANAGE_ALL, DELETE_CUSTOMER])
    public  async deleteCustomer (req: Request) {
        const customer = await this.doDeleteCustomer(req);

        appEventEmitter.emit(DELETE_CUSTOMER_, customer)

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully deleted'
        };
      
        return Promise.resolve(response);
    };

    /**
     * @name customer
     * @param req
     * @desc Gets a single customer
     * only user with super admin manage all and read customer
     * permission can do this 
     */
    @TryCatch
    @HasPermission([MANAGE_ALL, MANAGE_SOME, CUSTOMER_PERMISSION, READ_CUSTOMER])
    public  async customer (req: Request) {
        const customerId = req.params.customerId;
        
        const customer = await datasources.customerDAOService.findById(customerId);
        if(!customer) return Promise.reject(CustomAPIError.response(`Customer with Id: ${customerId} does not exist`, HttpStatus.BAD_REQUEST.code));

        const response: HttpResponse<ICustomerModel> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: customer,
        };
      
        return Promise.resolve(response);
    };

    /**
     * @name customers
     * @param req
     * @desc Gets all customers, its also search and retrieves 
     * customers according to customer first name, last name and status
     * only users with super admin manage all and read customer
     * permission can do this 
     */
    @TryCatch
    @HasPermission([MANAGE_ALL, MANAGE_SOME, READ_CUSTOMER])
    public  async customers (req: Request) {

        let activeFilter = false;
        let _filter = '';

        if (req.query.active === 'true') {
            activeFilter = true;
            _filter = 't'
        } else if (req.query.active === 'false') {
            activeFilter = false;
            _filter = 't'
        }
    
        const filter = _filter === ''
                        ? {} 
                        : activeFilter ? { active: true } : { active: false };
        
        const options = {
            search: req.query.search,
            searchFields: ['firstName', 'lastName', 'gender', 'other_names']
        };

        const customers = await datasources.customerDAOService.findAll(filter, options);

        if(!customers) return Promise.reject(CustomAPIError.response('No customer is available at this time', HttpStatus.BAD_REQUEST.code));

        const response: HttpResponse<ICustomerModel> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: customers,
        };
      
        return Promise.resolve(response);
    };

    /**
     * @name changePassword
     * @param req
     * @desc Changes customer password
     * only users with customer permission and update customer
     * permission can do this 
     */
    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION, UPDATE_CUSTOMER])
    public  async changePassword (req: Request) {
        const customer = await this.doChangePassword(req);

        const response: HttpResponse<ICustomerModel> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: customer,
        };
      
        return Promise.resolve(response);
    };

    /**
     * @name resetPassword
     * @param req
     * @desc
     * Sends password reset link to customer email
     * and also cached the reset token, email and
     * customer id
     * to redis for 1 hour
     * 
     */
    public async resetPassword (req: Request) {
        try {
            const { error, value } = Joi.object<ICustomerModel>($resetPassword).validate(req.body);

            if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
            
            const customer = await datasources.customerDAOService.findByAny({
                email: value.email
            });
            if(!customer) return Promise.reject(CustomAPIError.response('Customer not found', HttpStatus.BAD_REQUEST.code));
            
            const token = Generic.generatePasswordResetCode(4);
            
            const data = {
                token: token
            };
            const actualData = JSON.stringify(data);

            redisService.saveToken(`tikLog_app_${value.email}`, actualData, 3600);

            

            await datasources.customerDAOService.update(
                {_id: customer._id},
                {passwordResetCode: token}
            )

            sendMailService.sendMail({
                from: settings.nodemailer.email,
                to: value.email,
                subject: 'Password Reset',
                text: `Your password reset code is: ${token}`,
            });

            const response: HttpResponse<any> = {
                code: HttpStatus.OK.code,
                message: `If your email is registered with us, you will receive a password reset code.`
            };
        
            return Promise.resolve(response);
        
        } catch (error) {
            console.error(error, 'token error when setting');
            Promise.reject(CustomAPIError.response('Failed to send the password reset token. Please try again later.', HttpStatus.BAD_REQUEST.code));
        }
        
    };

    @TryCatch
    public async enterPasswordResetCode (req: Request) {

        const { email, passwordResetCode } = req.body;

        const customer = await datasources.customerDAOService.findByAny({
            email: email
        });

        if(!customer)
            return Promise.reject(CustomAPIError.response('Customer not found', HttpStatus.BAD_REQUEST.code));

        if(customer.passwordResetCode !== passwordResetCode)
            return Promise.reject(CustomAPIError.response('Password reset code do not match', HttpStatus.BAD_REQUEST.code));


        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value
        };

        return Promise.resolve(response);

    }

    /**
     * @name savePassword
     * @param req
     * @desc
     * checks if data exist with the provided key in redis
     * fetch the token in redis and compare with  
     * the token customer id and the req.params if true it
     * Saves the new password for the customer
     * else it returns an error
     */
    // @TryCatch
    public async savePassword (req: Request) {
        try {

            const { error, value } = Joi.object<ICustomerModel>($savePasswordAfterReset).validate(req.body);

            if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
        
            const customer = await datasources.customerDAOService.findByAny({
                email: value.email
            });
            if(!customer)
                return Promise.reject(CustomAPIError.response('Customer not found', HttpStatus.BAD_REQUEST.code));
            
            const keys = `tikLog_app_${value.email}`;
            const redisData = await redisService.getToken(keys);

            if (redisData) {
                const { token }: any = redisData;
                
                if(token !== customer.passwordResetCode)
                    return Promise.reject(CustomAPIError.response('Failed to save password, please try resetting password again', HttpStatus.BAD_REQUEST.code));
            
                const password = await this.passwordEncoder.encode(value.password as string);
                const customerValues = {
                    password: password,
                    confirm_password: password
                };
                
                await datasources.customerDAOService.update(
                    { _id: customer._id },
                    customerValues
                );

                const response: HttpResponse<any> = {
                    code: HttpStatus.OK.code,
                    message: 'Password reset successfully.',
                };

                redisService.deleteRedisKey(keys)
                return Promise.resolve(response);

            } else {
                // Token not found in Redis
                return Promise.reject(CustomAPIError.response('Token has expired', HttpStatus.BAD_REQUEST.code))
            }
            
        } catch (error) {
            console.error(error, 'token error when getting');
            return Promise.reject(CustomAPIError.response('Failed to retrieve token please try again later', HttpStatus.BAD_REQUEST.code))
        }
    }

    /***
     * @name checkRedisKey
     * checks if key is available in redis
     */
    public async checkRedisKey(req: Request) {
        const customerId = req.params.customerId;

        const customer = await datasources.customerDAOService.findById(customerId);

        const keys = `tikLog_app_${customer?.email}`;
        const redis = await redisService.checkRedisKey(keys);

        if(redis === '1') {
            const response: HttpResponse<any> = {
                code: HttpStatus.OK.code,
                message: 'Redis data is available.'
            }
            return Promise.resolve(response);
        } else {
            const response: HttpResponse<any> = {
                code: HttpStatus.OK.code,
                message: 'No redis data is available.',
            };
            return Promise.resolve(response);
        }
        
    };

    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION])
    public async saveCustomerAddress(req: Request) {

        //@ts-ignore
        const customerId = req.user._id

        const { error, value } = Joi.object<ICustomerAddressModel>($saveCustomerAddress).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
                    
        const customer = await datasources.customerDAOService.findById(customerId);
        if(!customer)
            return Promise.reject(CustomAPIError.response('Customer not found', HttpStatus.NOT_FOUND.code));

        //find address with type home
        const homeAddress = await datasources.customerAddressDAOService.findByAny(
            {address_type: HOME_ADDRESS}
        )
        if(homeAddress && value.address_type === HOME_ADDRESS)
            return Promise.reject(CustomAPIError.response('Address of type home already exist', HttpStatus.BAD_REQUEST.code));

        //find address with type office
        const officeAddress = await datasources.customerAddressDAOService.findByAny(
            {address_type: OFFICE_ADDRESS}
        )
        if(officeAddress && value.address_type === OFFICE_ADDRESS)
            return Promise.reject(CustomAPIError.response('Address of type office already exist', HttpStatus.BAD_REQUEST.code));
    
        const addressValues: Partial<ICustomerAddressModel> ={
            ...value,
            customer: customerId,
            favorite: Generic.generateSlug(value.address_type) === HOME_ADDRESS
                        || Generic.generateSlug(value.address_type) === OFFICE_ADDRESS
                            ? true
                            : false
        };

        await datasources.customerDAOService.update(
            { _id: customerId },
            { level: 3 }
        )
        const address = await datasources.customerAddressDAOService.create(addressValues as ICustomerAddressModel);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Address created successfully',
            result: address
        };

        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, MANAGE_SOME, READ_CUSTOMER])
    public async getSingleAddress(req: Request) {
        
        const address = await datasources.customerAddressDAOService.findByAny({customer: req.params.id});
        if(!address)
            return Promise.reject(CustomAPIError.response('Address not found', HttpStatus.NOT_FOUND.code));

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successful',
            result: address
        };

        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION])
    public async getAddresses(req: Request) {
        
        //@ts-ignore
        const customerId = req.user._id;

        const address = await datasources.customerAddressDAOService.findAll({
            customer: customerId
        });
        
        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successful',
            results: address
        };

        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION])
    public async updateAddress(req: Request) {

        const { error, value } = Joi.object<ICustomerAddressModel>($updateCustomerAddress).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
         

        const address = await datasources.customerAddressDAOService.findById(req.params.id);
        if(!address)
            return Promise.reject(CustomAPIError.response('Address not found', HttpStatus.NOT_FOUND.code));

        const values = {
            ...value
        }
        
        await datasources.customerAddressDAOService.update(
            {_id: address._id},
            values
        );

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully updated'
        };

        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION])
    public async deleteAddress(req: Request) {

        const address = await datasources.customerAddressDAOService.findById(req.params.id);
        if(!address)
            return Promise.reject(CustomAPIError.response('Address not found', HttpStatus.NOT_FOUND.code));

        await datasources.customerAddressDAOService.deleteById(address._id)

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully deleted'
        };

        return Promise.resolve(response);
    };

    private async doUpdateCustomer(req: Request): Promise<HttpResponse<ICustomerModel>> {
        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                const customerId = req.params.customerId;

                const { error, value } = Joi.object<ICustomerModel>($updateCustomerSchema).validate(fields);
                if(error) return reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
                
                const customer = await datasources.customerDAOService.findById(customerId);
                if(!customer) return reject(CustomAPIError.response('Customer not found', HttpStatus.NOT_FOUND.code));

                const customer_email = await datasources.customerDAOService.findByAny({
                    email: value.email
                });

                if(value.email && customer.email !== value.email){
                    if(customer_email) {
                        return reject(CustomAPIError.response('Customer with this email already exists', HttpStatus.NOT_FOUND.code))
                    }
                };

                const customer_phone = await datasources.customerDAOService.findByAny({
                    phone: value.phone
                });

                if(value.phone && customer.phone !== value.phone){
                    if(customer_phone) {
                        return reject(CustomAPIError.response('Customer with this phone number already exists', HttpStatus.NOT_FOUND.code))
                    }
                };

                let _email = ''
                if(!customer.googleId || !customer.facebookId || !customer.instagramId) {
                    _email = value.email as string
                };

                let _phone = ''
                if(customer.googleId || customer.facebookId || customer.instagramId) {
                    _phone = value.phone
                };

                const profile_image = files.profileImageUrl as File;
                const basePath = `${UPLOAD_BASE_PATH}/customer`;

                let _profileImageUrl = ''
                if(profile_image) {
                    // File size validation
                    const maxSizeInBytes = MAX_SIZE_IN_BYTE
                    if (profile_image.size > maxSizeInBytes) {
                        return reject(CustomAPIError.response(MESSAGES.image_size_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    // File type validation
                    const allowedFileTypes = ALLOWED_FILE_TYPES;
                    if (!allowedFileTypes.includes(profile_image.mimetype as string)) {
                        return reject(CustomAPIError.response(MESSAGES.image_type_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    _profileImageUrl = await Generic.getImagePath({
                        tempPath: profile_image.filepath,
                        filename: profile_image.originalFilename as string,
                        basePath,
                    });
                };

                const date = moment(value.dob, 'DD-MM-YYYY', true);

                const customerValues = {
                    ...value,
                    email: _email ? _email : customer.email,
                    profileImageUrl: profile_image && _profileImageUrl,
                    phone: _phone ? _phone : customer.phone,
                    level: 2,
                    dob: date.isValid() ? value.dob : moment(date)
                };

                const updatedCustomer = await datasources.customerDAOService.updateByAny(
                    {_id: customerId},
                    customerValues
                );
                
                //@ts-ignore
                return resolve(updatedCustomer);
            })
        })
    }

    private async doEditCustomerProfile(req: Request): Promise<HttpResponse<ICustomerModel>> {
        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                const customerId = req.params.customerId;

                const { error, value } = Joi.object<ICustomerModel>($editCustomerProfileSchema).validate(fields);
                if(error) return reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
                
                const customer = await datasources.customerDAOService.findById(customerId);
                if(!customer) return reject(CustomAPIError.response('Customer not found', HttpStatus.NOT_FOUND.code));

                const customer_email = await datasources.customerDAOService.findByAny({
                    email: value.email
                });

                if(value.email && customer.email !== value.email){
                    if(customer_email) {
                        return reject(CustomAPIError.response('Customer with this email already exists', HttpStatus.NOT_FOUND.code))
                    }
                };

                const customer_phone = await datasources.customerDAOService.findByAny({
                    phone: value.phone
                });

                if(value.phone && customer.phone !== value.phone){
                    if(customer_phone) {
                        return reject(CustomAPIError.response('Customer with this phone number already exists', HttpStatus.NOT_FOUND.code))
                    }
                };

                let _email = ''
                if(!customer.googleId || !customer.facebookId || !customer.instagramId) {
                    _email = value.email as string
                };

                let _phone = ''
                if(customer.googleId || customer.facebookId || customer.instagramId) {
                    _phone = value.phone
                };

                const profile_image = files.profileImageUrl as File;
                const basePath = `${UPLOAD_BASE_PATH}/customer`;

                let _profileImageUrl = ''
                if(profile_image) {
                    // File size validation
                    const maxSizeInBytes = MAX_SIZE_IN_BYTE
                    if (profile_image.size > maxSizeInBytes) {
                        return reject(CustomAPIError.response(MESSAGES.image_size_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    // File type validation
                    const allowedFileTypes = ALLOWED_FILE_TYPES;
                    if (!allowedFileTypes.includes(profile_image.mimetype as string)) {
                        return reject(CustomAPIError.response(MESSAGES.image_type_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    _profileImageUrl = await Generic.getImagePath({
                        tempPath: profile_image.filepath,
                        filename: profile_image.originalFilename as string,
                        basePath,
                    });
                };

                const customerValues = {
                    ...value,
                    email: _email ? _email : customer.email,
                    profileImageUrl: profile_image && _profileImageUrl,
                    phone: _phone ? _phone : customer.phone
                };

                const updatedCustomer = await datasources.customerDAOService.updateByAny(
                    {_id: customerId},
                    customerValues
                );
                
                //@ts-ignore
                return resolve(updatedCustomer);
            })
        })
    }

    private async doUpdateCustomerStatus(req: Request) {
        const customerId = req.params.customerId;

        const customer = await datasources.customerDAOService.findById(customerId);
        if(!customer) return Promise.reject(CustomAPIError.response('Customer not found', HttpStatus.BAD_REQUEST.code));

        const updatedCustomer = await datasources.customerDAOService.update(
            {_id: customerId},
            {active: !customer.active}
        );

        return updatedCustomer;

    };

    private async doDeleteCustomer(req: Request) {
        const customerId = req.params.customerId;

        return await datasources.customerDAOService.deleteById(customerId);

    };

    private async doChangePassword(req: Request) {
        const customerId = req.params.customerId;
        
        const { error, value } = Joi.object<ICustomerModel>($changePassword).validate(req.body);

        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
      
        const customer = await datasources.customerDAOService.findById(customerId);
        if(!customer) return Promise.reject(CustomAPIError.response('Customer not found', HttpStatus.BAD_REQUEST.code));
    
        const hash = customer.password as string;
        const password = value.previous_password;

        const isMatch = await this.passwordEncoder.match(password.trim(), hash.trim());
        if(!isMatch) return Promise.reject(CustomAPIError.response('Password in the database differ from the password entered as current  password', HttpStatus.UNAUTHORIZED.code));

        const _password = await this.passwordEncoder.encode(value.password as string);

        const customerValues = {
            password: _password,
            confirm_password: _password
        };

        await datasources.customerDAOService.update(
            {_id: customerId},
            customerValues
        );

        return customer;

    };

}