import { Request } from "express";
import { HasPermission, TryCatch } from "../decorators";
import HttpStatus from "../helpers/HttpStatus";
import CustomAPIError from "../exceptions/CustomAPIError";
import datasources from  '../services/dao';
import { appCommonTypes } from '../@types/app-common';
import Joi from 'joi';
import HttpResponse = appCommonTypes.HttpResponse;
import { appEventEmitter } from '../services/AppEventEmitter';
import BcryptPasswordEncoder = appCommonTypes.BcryptPasswordEncoder;
import RedisService from "../services/RedisService";
import SendMailService from "../services/SendMailService";
import Generic from "../utils/Generic";
import formidable, { File } from 'formidable';
import { CHANGE_RIDER_PASSWORD, DELETE_RIDER_, HOME_ADDRESS, OFFICE_ADDRESS, RIDER_STATUS_OFFLINE, RIDER_STATUS_ONLINE, RIDER_STATUS_PENDING, UPDATE_RIDER_, UPDATE_RIDER_STATUS_, UPLOAD_BASE_PATH } from "../config/constants";
import settings, { CUSTOMER_PERMISSION, DELETE_CUSTOMER, MANAGE_ALL, MANAGE_SOME, READ_RIDER, RIDER_PERMISSION } from "../config/settings";
import { UPDATE_RIDER } from "../config/settings";
import { $changePassword, $resetPassword, $savePasswordAfterReset, $updateRiderSchema, IRiderModel } from "../models/Rider";
import { $saveRiderAddress, $updateRiderAddress, IRiderAddressModel } from "../models/RiderAddress";
import { IRiderLocationModel } from "../models/RiderLocation";

const redisService = new RedisService();
const sendMailService = new SendMailService();
const form = formidable({ uploadDir: UPLOAD_BASE_PATH });

export default class RiderController {
    private declare readonly passwordEncoder: BcryptPasswordEncoder;

    constructor(passwordEncoder: BcryptPasswordEncoder) {
        this.passwordEncoder = passwordEncoder
    }

     /**
     * @name updateRider
     * @param req
     * @desc Updates the customer
     * only users with customer or update_customer permission
     * can do this 
     */
     @TryCatch
     @HasPermission([RIDER_PERMISSION, UPDATE_RIDER])
     public async updateRider (req: Request) {
         const rider = await this.doUpdateRider(req);
     
         appEventEmitter.emit(UPDATE_RIDER_, rider)
 
         const response: HttpResponse<any> = {
             code: HttpStatus.OK.code,
             message: 'Successfully updated',
             result: rider
         };
       
         return Promise.resolve(response);
     };

      /**
     * @name updateRiderStatus
     * @param request rider id
     * @desc Updates the customer status
     * only user with super admin manage all and update customer
     * permission can do this 
     */
    @TryCatch
    @HasPermission([MANAGE_ALL, UPDATE_RIDER])
    public  async updateRiderStatus (req: Request) {
        const rider = await this.doUpdateRiderStatus(req);

        appEventEmitter.emit(UPDATE_RIDER_STATUS_, rider)

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully updated status'
        };
      
        return Promise.resolve(response);
    };

     /**
     * @name deleteRider
     * @param request rider id
     * @desc deletes the rider
     * only user with super admin manage all and delete rider
     * permission can do this 
     */
     @TryCatch
     @HasPermission([MANAGE_ALL, DELETE_CUSTOMER])
     public  async deleteRider (req: Request) {
         const rider = await this.doDeleteRider(req);
 
         appEventEmitter.emit(DELETE_RIDER_, rider)
 
         const response: HttpResponse<any> = {
             code: HttpStatus.OK.code,
             message: 'Successfully deleted'
         };
       
         return Promise.resolve(response);
     };

      /**
     * @name rider
     * @param req
     * @desc Gets a single rider
     * only user with super admin manage all and read rider
     * permission can do this 
     */
    @TryCatch
    @HasPermission([MANAGE_ALL, MANAGE_SOME, RIDER_PERMISSION, READ_RIDER])
    public  async rider (req: Request) {
        const riderId = req.params.riderId;
        
        const rider = await datasources.riderDAOService.findById(riderId);
        if(!rider) return Promise.reject(CustomAPIError.response(`Rider with Id: ${riderId} does not exist`, HttpStatus.BAD_REQUEST.code));

        const response: HttpResponse<IRiderModel> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: rider,
        };
      
        return Promise.resolve(response);
    };

     /**
     * 
     * @name saveLocation
     * @req
     * @desc this method creates 
     * location for a rider
     */
     @TryCatch
     @HasPermission([RIDER_PERMISSION])
     public async saveLocation(req: Request) {
 
        //@ts-ignore
        const riderId = req.user._id;
  
        const { latitude, longitude } = req.body;

        const rider = await datasources.riderDAOService.findById(riderId);
        if(!rider)
            return Promise.reject(CustomAPIError.response('Rider does not exist', HttpStatus.NOT_FOUND.code));
 
        const locationValues: Partial<IRiderLocationModel> = {
            location: {
            type: 'Point',
            coordinates: [longitude, latitude],
            },
            rider: rider._id
        }
 
        await datasources.riderLocationDAOService.create(locationValues as IRiderLocationModel)
     
         const response: HttpResponse<IRiderLocationModel> = {
            code: HttpStatus.OK.code,
            message: 'Location created successfully'
         };
 
         return Promise.resolve(response);
     };

     @TryCatch
     @HasPermission([RIDER_PERMISSION, CUSTOMER_PERMISSION])
     public async updateLocation(req: Request) {
 
         const riderId = req.params.riderId;
  
         const { latitude, longitude } = req.body;

         const rider = await datasources.riderDAOService.findById(riderId);
         if(!rider)
            return Promise.reject(CustomAPIError.response('Rider does not exist', HttpStatus.NOT_FOUND.code));
 
         const findLocation = await datasources.riderLocationDAOService.findByAny({rider: rider._id});
         
         const locationUpdateValues = {
            ...req.body,
            location: {
               type: 'Point',
               coordinates: [longitude, latitude],
            }
        }
        
        await datasources.riderLocationDAOService.update(
            {rider: rider._id},
            locationUpdateValues
        )

         const response: HttpResponse<IRiderLocationModel> = {
            code: HttpStatus.OK.code,
            message: 'Location updated successfully'
         };
 
         return Promise.resolve(response);
     };
 
     /**
      * 
      * @param req
      * @name getLocation
      * @desc finds location of all the riders
      * 
      */
     @TryCatch
     @HasPermission([MANAGE_ALL])
     public async getRiderLocation(req: Request) {
 
         const findLocation = await datasources.riderLocationDAOService.findAll({})

         const response: HttpResponse<any> = {
             code: HttpStatus.OK.code,
             message: 'Successful',
             results: findLocation
         };
 
         return Promise.resolve(response);
     }

    /**
     * @name riders
     * @param req
     * @desc Gets all riders, its also search and retrieves 
     * riders according to customer first name, last name and status
     * only users with super admin manage all and read customer
     * permission can do this 
     */
    @TryCatch
    @HasPermission([MANAGE_ALL, MANAGE_SOME, READ_RIDER])
    public  async riders (req: Request) {

        const options = {
            sort: { createdAt: -1 }
        };

        const riders = await datasources.riderDAOService.findAll(options);

        if(!riders) return Promise.reject(CustomAPIError.response('No rider is available at this time', HttpStatus.BAD_REQUEST.code));

        const response: HttpResponse<IRiderModel> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: riders,
        };
      
        return Promise.resolve(response);
    };

     /**
     * @name changePassword
     * @param req
     * @desc Changes rider password
     * only users with rider permission and update rider
     * permission can do this 
     */
    @TryCatch
    @HasPermission([RIDER_PERMISSION, UPDATE_RIDER])
    public  async changePassword (req: Request) {
        const rider = await this.doChangePassword(req);

        appEventEmitter.emit(CHANGE_RIDER_PASSWORD, rider)

        const response: HttpResponse<IRiderModel> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: rider,
        };
      
        return Promise.resolve(response);
    };

    /**
     * @name resetPassword
     * @param req
     * @desc
     * Sends password reset link to rider email
     * and also cached the reset token, email and
     * rider id
     * to redis for 3 minutes
     * 
     */
    public async resetPassword (req: Request) {
        try {
            const { error, value } = Joi.object<IRiderModel>($resetPassword).validate(req.body);

            if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
            
            const rider = await datasources.riderDAOService.findByAny({
                email: value.email
            });
            if(!rider) return Promise.reject(CustomAPIError.response('Rider not found', HttpStatus.BAD_REQUEST.code));

            const token = Generic.generateRandomStringCrypto(10);
            const data = {
                token: token,
                email: value.email,
                rider_id: rider._id
            };
            const actualData = JSON.stringify(data);

            redisService.saveToken(`tikLog_app_${value.email}`, actualData, 900);

            sendMailService.sendMail({
                from: settings.nodemailer.email,
                to: value.email,
                subject: 'Password Reset',
                text: `Your password reset link is: ${process.env.CLIENT_URL}/${rider._id}`,
            });

            const response: HttpResponse<any> = {
                code: HttpStatus.OK.code,
                message: 'If your mail is registered with us, you will receive a password reset link.'
            };
        
            return Promise.resolve(response);
        
        } catch (error) {
            console.error(error, 'token error when setting');
            Promise.reject(CustomAPIError.response('Failed to send the password reset token. Please try again later.', HttpStatus.BAD_REQUEST.code));
        }
        
    };

     /**
     * @name savePassword
     * @param req
     * @desc
     * checks if data exist with the provided key in redis
     * fetch the token in redis and compare with  
     * the token rider id and the req.params if true it
     * Saves the new password for the rider
     * else it returns an error
     */
     public async savePassword (req: Request) {
        try {
            const riderId = req.params.riderId as string;
            
            const { error, value } = Joi.object<IRiderModel>($savePasswordAfterReset).validate(req.body);

            if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
        
            const rider = await datasources.riderDAOService.findById({
                _id: riderId
            });
            if(!rider) return Promise.reject(CustomAPIError.response('Rider not found', HttpStatus.BAD_REQUEST.code));
            
            const keys = `tikLog_app_${rider.email}`;
            const redisData = await redisService.getToken(keys);

            if (redisData) {
                const { rider_id }: any = redisData;
                
                if(riderId !== rider_id)
                    return Promise.reject(CustomAPIError.response('Failed to save password, please try later', HttpStatus.BAD_REQUEST.code));
                
                const password = await this.passwordEncoder.encode(value.password as string);
                const riderValues = {
                    password: password,
                    confirm_password: password
                };
               
                await datasources.riderDAOService.update(
                    { _id: riderId },
                    riderValues
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
    @TryCatch
    public async checkRedisKey(req: Request) {
        const riderId = req.params.riderId;

        const rider = await datasources.riderDAOService.findById(riderId);

        const keys = `tikLog_app_${rider?.email}`;
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
    @HasPermission([RIDER_PERMISSION])
    public async saveRiderAddress(req: Request) {

        //@ts-ignore
        const riderId = req.user._id

        const { error, value } = Joi.object<IRiderAddressModel>($saveRiderAddress).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
                    
        const rider = await datasources.riderDAOService.findById(riderId);
        if(!rider)
            return Promise.reject(CustomAPIError.response('Rider not found', HttpStatus.NOT_FOUND.code));

        const addressValues: Partial<IRiderAddressModel> ={
            ...value,
            rider: riderId,
            favorite: Generic.generateSlug(value.address_type) === HOME_ADDRESS
                        || Generic.generateSlug(value.address_type) === OFFICE_ADDRESS
                            ? true
                            : false
        };

        const address = await datasources.riderAddressDAOService.create(addressValues as IRiderAddressModel);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Address created successfully',
            result: address
        };

        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([RIDER_PERMISSION, MANAGE_ALL, MANAGE_SOME, READ_RIDER])
    public async getSingleAddress(req: Request) {
        
        const address = await datasources.riderAddressDAOService.findById(req.params.id);
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
    @HasPermission([RIDER_PERMISSION])
    public async getAddresses(req: Request) {
        
        //@ts-ignore
        const riderId = req.user._id;

        const address = await datasources.riderAddressDAOService.findAll({
            rider: riderId
        });
        
        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successful',
            results: address
        };

        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([RIDER_PERMISSION])
    public async updateAddress(req: Request) {

        const { error, value } = Joi.object<IRiderAddressModel>($updateRiderAddress).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

        const address = await datasources.riderAddressDAOService.findById(req.params.id);
        if(!address)
            return Promise.reject(CustomAPIError.response('Address not found', HttpStatus.NOT_FOUND.code));

        const values = {
            ...value
        }
        
        await datasources.riderAddressDAOService.update(
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
    @HasPermission([RIDER_PERMISSION])
    public async deleteAddress(req: Request) {

        const address = await datasources.riderAddressDAOService.findById(req.params.id);
        if(!address)
            return Promise.reject(CustomAPIError.response('Address not found', HttpStatus.NOT_FOUND.code));

        await datasources.riderAddressDAOService.deleteById(address._id)

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully deleted'
        };

        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, MANAGE_SOME])
    public async changeToOnline(req: Request) {
        const riderId = req.params.riderId;

        const rider = await datasources.riderDAOService.findById(riderId);
        if(!rider) return Promise.reject(CustomAPIError.response('rider not found', HttpStatus.BAD_REQUEST.code));

        let newStatus;
        if (rider.status === RIDER_STATUS_PENDING) {
            if(!rider.firstName || !rider.lastName || !rider.phone || !rider.email || !rider.gender) {
                newStatus = RIDER_STATUS_OFFLINE
            } else {
                newStatus = RIDER_STATUS_ONLINE
            }
        } else {
            return Promise.reject(CustomAPIError.response('Rider is either online or offline already', HttpStatus.BAD_REQUEST.code));
        }

        const updatedRider = await datasources.riderDAOService.updateByAny(
            {_id: riderId},
            {status: newStatus}
        );

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Rider is now online',
            result: updatedRider
        };

        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([RIDER_PERMISSION])
    public async toggleOnlineOffline(req: Request) {
        const riderId = req.params.riderId;

        const rider = await datasources.riderDAOService.findById(riderId);
        if(!rider) return Promise.reject(CustomAPIError.response('rider not found', HttpStatus.BAD_REQUEST.code));
        if(!rider.firstName || !rider.lastName || !rider.phone || !rider.email || !rider.gender)
            return Promise.reject(CustomAPIError.response('Please complete your profile', HttpStatus.BAD_REQUEST.code));

        let newStatus;
        let updateStatus = false;
        if (rider.status === RIDER_STATUS_ONLINE) {
            newStatus = RIDER_STATUS_OFFLINE;
        } else {
            newStatus = RIDER_STATUS_ONLINE;
            updateStatus = true
        }
        const updatedRider = await datasources.riderDAOService.updateByAny(
            {_id: riderId},
            {status: newStatus}
        );

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: updateStatus ? 'Rider is now online' : 'Rider is now offline',
            result: updatedRider
        };

        return Promise.resolve(response);
    };

    private async doUpdateRider(req: Request): Promise<HttpResponse<IRiderModel>> {
        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {

                const riderId = req.params.riderId;

                const { error, value } = Joi.object<IRiderModel>($updateRiderSchema).validate(fields);
                if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
                
                const rider = await datasources.riderDAOService.findById(riderId);
                if(!rider) return Promise.reject(CustomAPIError.response('Rider not found', HttpStatus.NOT_FOUND.code));

                const rider_email = await datasources.riderDAOService.findByAny({
                    email: value.email
                });

                if(value.email && rider.email !== value.email){
                    if(rider_email) {
                        return Promise.reject(CustomAPIError.response('Rider with this email already exists', HttpStatus.NOT_FOUND.code))
                    }
                };

                const rider_phone = await datasources.riderDAOService.findByAny({
                    phone: value.phone
                });

                if(value.phone && rider.phone !== value.phone){
                    if(rider_phone) {
                        return Promise.reject(CustomAPIError.response('Rider with this phone number already exists', HttpStatus.NOT_FOUND.code))
                    }
                };

                let _email = ''
                if(!rider.googleId || !rider.facebookId) {
                    _email = value.email
                };

                let _phone = ''
                if(rider.googleId || rider.facebookId) {
                    _phone = value.phone
                };

                const profile_image = files.profileImageUrl as File;
                const basePath = `${UPLOAD_BASE_PATH}/rider`;

                let _profileImageUrl = '';
                if(profile_image) {
                    // File size validation
                    const maxSizeInBytes = 1000 * 1024; // 1MB
                    if (profile_image.size > maxSizeInBytes) {
                        return reject(CustomAPIError.response('Image size exceeds the allowed limit', HttpStatus.BAD_REQUEST.code));
                    }
            
                    // File type validation
                    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                    if (!allowedFileTypes.includes(profile_image.mimetype as string)) {
                        return reject(CustomAPIError.response('Invalid image format. Only JPEG, PNG, and JPG images are allowed', HttpStatus.BAD_REQUEST.code));
                    }
            
                    _profileImageUrl = await Generic.getImagePath({
                        tempPath: profile_image.filepath,
                        filename: profile_image.originalFilename as string,
                        basePath,
                    });
                };

                const riderValues = {
                    ...value,
                    email: _email ? _email : rider.email,
                    profileImageUrl: profile_image && _profileImageUrl,
                    phone: _phone ? _phone : rider.phone
                };

                const updatedRider = await datasources.riderDAOService.updateByAny(
                    {_id: riderId},
                    riderValues
                );
                
                //@ts-ignore
                return resolve(updatedRider);
            })
        })
    };

    private async doUpdateRiderStatus(req: Request) {
        const riderId = req.params.riderId;

        const rider = await datasources.riderDAOService.findById(riderId);
        if(!rider) return Promise.reject(CustomAPIError.response('rider not found', HttpStatus.BAD_REQUEST.code));

        const updatedRider = await datasources.riderDAOService.updateByAny(
            {_id: riderId},
            {active: !rider.active}
        );

        return updatedRider;

    };

    private async doDeleteRider(req: Request) {
        const riderId = req.params.riderId;

        return await datasources.riderDAOService.deleteById(riderId);

    };

    private async doChangePassword(req: Request) {
        const riderId = req.params.riderId;
        
        const { error, value } = Joi.object<IRiderModel>($changePassword).validate(req.body);

        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
      
        const rider = await datasources.riderDAOService.findById(riderId);
        if(!rider) return Promise.reject(CustomAPIError.response('Rider not found', HttpStatus.BAD_REQUEST.code));
    
        const hash = rider.password as string;
        const password = value.previous_password;

        const isMatch = await this.passwordEncoder.match(password.trim(), hash.trim());
        if(!isMatch) return Promise.reject(CustomAPIError.response('Password in the database differ from the password entered as current  password', HttpStatus.UNAUTHORIZED.code));

        const _password = await this.passwordEncoder.encode(value.password as string);

        const riderValues = {
            password: _password,
            confirm_password: _password
        };

        await datasources.riderDAOService.update(
            {_id: riderId},
            riderValues
        );

        return rider;

    };

}