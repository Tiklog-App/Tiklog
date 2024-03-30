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
import { ALLOWED_FILE_TYPES, CHANGE_RIDER_PASSWORD, MAX_SIZE_IN_BYTE, MESSAGES, RIDER_STATUS_OFFLINE, RIDER_STATUS_ONLINE, RIDER_STATUS_PENDING, UPLOAD_BASE_PATH } from "../config/constants";
import settings, { CUSTOMER_PERMISSION, DELETE_CUSTOMER, FETCH_LICENSE, MANAGE_ALL, MANAGE_SOME, READ_RIDER, READ_RIDER_REQUEST, RIDER_PERMISSION } from "../config/settings";
import { UPDATE_RIDER } from "../config/settings";
import { $bankDetailRider, $changePassword, $editRiderProfileSchema, $resetPassword, $savePasswordAfterReset, $updateRiderSchema, IRiderModel } from "../models/Rider";
import { $saveRiderAddress, $updateRiderAddress, IRiderAddressModel } from "../models/RiderAddress";
import { IRiderLocationModel } from "../models/RiderLocation";
import { $licenseSchema, IRiderLicenseModel } from "../models/RiderLicense";

const redisService = new RedisService();
const sendMailService = new SendMailService();
const form = formidable({ uploadDir: UPLOAD_BASE_PATH });

export const riderRequestSchema: Joi.SchemaMap<any> =
  {
    riderId: Joi.string().required().label("rider id"),
  };

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
 
         const response: HttpResponse<any> = {
             code: HttpStatus.OK.code,
             message: 'Successfully updated',
             result: rider
         };
       
         return Promise.resolve(response);
     };

     @TryCatch
     @HasPermission([RIDER_PERMISSION, UPDATE_RIDER])
     public async editRiderProfile (req: Request) {
         const rider = await this.doEditRiderProfile(req);
 
         const response: HttpResponse<any> = {
             code: HttpStatus.OK.code,
             message: 'Successfully updated',
             result: rider
         };
       
         return Promise.resolve(response);
     };

     @TryCatch
     @HasPermission([RIDER_PERMISSION])
     public async bankDetails (req: Request) {

        //@ts-ignore
        const riderId = req.user._id

        const { error, value } = Joi.object<IRiderModel>($bankDetailRider).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
            
        const rider = await datasources.riderDAOService.findById(riderId);
        if(!rider)
            return Promise.reject(CustomAPIError.response("Rider not found", HttpStatus.NOT_FOUND.code));
        
        const updateValue: Partial<any> = {
            bankName: value.bankName,
            accountName: value.accountName?.toUpperCase(),
            accountNumber: value.accountNumber
        }

        await datasources.riderDAOService.update(
            { _id: riderId },
            updateValue
        )

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully updated'
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
        await this.doUpdateRiderStatus(req);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully updated status'
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([RIDER_PERMISSION])
    public async riderLicense(req: Request) {
        const {license, rider_level}: any = await this.doCreateRiderLicense(req)

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: rider_level === 5
                        ? 'Verification of your license is ongoing this would take 2 working days'
                        : HttpStatus.OK.value,
            result: license
        };
      
        return Promise.resolve(response);

    };

    @TryCatch
    @HasPermission([RIDER_PERMISSION, MANAGE_ALL])
    public async getRiderLicense(req: Request) {
        const riderId = req.params.riderId;

        const license = await datasources.riderLicenseDAOService.findByAny({
            rider: riderId
        });
        if(!license)
            return Promise.reject(CustomAPIError.response('License does not exist', HttpStatus.NOT_FOUND.code));

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: license
        };
        
        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([RIDER_PERMISSION])
    public async deleteLicense(req: Request) {

        //@ts-ignore
        const riderId = req.user._id;

        const findLicense = await datasources.riderLicenseDAOService.findByAny({
            rider: riderId
        });
        if(!findLicense)
            return Promise.reject(CustomAPIError.response('License not found', HttpStatus.NOT_FOUND.code));

        await datasources.riderLicenseDAOService.deleteById(findLicense._id);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: 'License deleted successfully'
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, UPDATE_RIDER])
    public async isExpiredLicense(req: Request) {

        const licenseId = req.params.licenseId;

        const findLicense = await datasources.riderLicenseDAOService.findById(licenseId);
        if(!findLicense)
            return Promise.reject(CustomAPIError.response('License not found', HttpStatus.NOT_FOUND.code));

        
        await datasources.riderLicenseDAOService.update(
            { _id: findLicense._id },
            { isExpired: false }
        )

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: "Rider license successfully updated"
        };
      
        return Promise.resolve(response);
        
    }

    @TryCatch
    @HasPermission([MANAGE_ALL, FETCH_LICENSE])
    public async fetchRiderLicenses(req: Request) {

        const fetchLicenses = await datasources.riderLicenseDAOService.findAll({})

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: fetchLicenses
        };
      
        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([RIDER_PERMISSION])
    public async updateRiderLicense(req: Request) {
        const license = await this.doUpdateRiderLicense(req)

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: license
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
         await this.doDeleteRider(req);
 
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
 
         const riderLoc = await datasources.riderLocationDAOService.findByAny({rider: rider._id});

        if(riderLoc) {
            const locationUpdateValues = {
                location: {
                   type: 'Point',
                   coordinates: [longitude, latitude],
                }
            }
            
            await datasources.riderLocationDAOService.update(
                {rider: rider._id},
                locationUpdateValues
            )

        } else if(!riderLoc) {
            const locationValues: Partial<IRiderLocationModel> = {
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                },
                rider: rider._id
            }
     
            await datasources.riderLocationDAOService.create(locationValues as IRiderLocationModel)
        }

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

            // const token = Generic.generateRandomStringCrypto(10);
            // const data = {
            //     token: token,
            //     email: value.email,
            //     rider_id: rider._id
            // };
            // const actualData = JSON.stringify(data);

            // redisService.saveToken(`tikLog_app_${value.email}`, actualData, 900);
            const token = Generic.generatePasswordResetCode(4);
            await datasources.riderDAOService.update(
                {_id: rider._id},
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
                message: `If your email is registered with us, you will receive a password reset code. ${token}`
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

        const rider = await datasources.riderDAOService.findByAny({
            email: email
        });

        if(!rider)
            return Promise.reject(CustomAPIError.response('Rider not found', HttpStatus.BAD_REQUEST.code));

        if(rider.passwordResetCode !== passwordResetCode)
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
     * the token rider id and the req.params if true it
     * Saves the new password for the rider
     * else it returns an error
     */
    @TryCatch
     public async savePassword (req: Request) {
        // try {
            const { error, value } = Joi.object<IRiderModel>($savePasswordAfterReset).validate(req.body);

            if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
        
            const rider = await datasources.riderDAOService.findByAny({
                email: value.email
            });
            if(!rider) return Promise.reject(CustomAPIError.response('Rider not found', HttpStatus.BAD_REQUEST.code));
            
            // const keys = `tikLog_app_${rider.email}`;
            // const redisData = await redisService.getToken(keys);

            // if (redisData) {
            //     const { rider_id }: any = redisData;
                
            //     if(riderId !== rider_id)
            //         return Promise.reject(CustomAPIError.response('Failed to save password, please try later', HttpStatus.BAD_REQUEST.code));
                
                const password = await this.passwordEncoder.encode(value.password as string);
                const riderValues = {
                    password: password,
                    confirm_password: password
                };
               
                await datasources.riderDAOService.update(
                    { _id: rider._id },
                    riderValues
                );

                const response: HttpResponse<any> = {
                    code: HttpStatus.OK.code,
                    message: 'Password reset successfully.',
                };

                // redisService.deleteRedisKey(keys)
                return Promise.resolve(response);

            // } else {
            //     // Token not found in Redis
            //     return Promise.reject(CustomAPIError.response('Token has expired', HttpStatus.BAD_REQUEST.code))
            // }
            
        // } catch (error) {
        //     console.error(error, 'token error when getting');
        //     return Promise.reject(CustomAPIError.response('Failed to retrieve token please try again later', HttpStatus.BAD_REQUEST.code))
        // }
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
            rider: riderId
        };

        await datasources.riderDAOService.update(
            { _id: riderId },
            { level: 5 }
        )
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

        const riderLicense = await datasources.riderLicenseDAOService.findByAny({
            rider: riderId
        })
        if(!riderLicense)
            return Promise.reject(CustomAPIError.response('License is required to go online', HttpStatus.BAD_REQUEST.code));
            


        let newStatus;
        let updateStatus = false;
        if (rider.status === RIDER_STATUS_ONLINE) {
            newStatus = RIDER_STATUS_OFFLINE;
        } else {
            if(riderLicense.isExpired)
                return Promise.reject(CustomAPIError.response('Your vehicle license has expired please renew license', HttpStatus.BAD_REQUEST.code));
            
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

    @TryCatch
    @HasPermission([CUSTOMER_PERMISSION])
    public async rating(req: Request) {
        
        const { error, value } = Joi.object<any>({
            riderId: Joi.string().required().label("Rider id"),
            rating: Joi.number().required().label("Rating")
        }).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

        const rider = await datasources.riderDAOService.findById(value.riderId);
        if(!rider)
            return Promise.reject(CustomAPIError.response("Customer not found", HttpStatus.NOT_FOUND.code));

        await datasources.riderDAOService.updateByAny(
            {_id: rider._id},
            {rating: value.rating}
        )

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: "Successfully rated rider"
        };

        return Promise.resolve(response);
    }

    private async doCreateRiderLicense(req: Request): Promise<HttpResponse<IRiderLicenseModel>> {
        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {

                //@ts-ignore
                const riderId = req.user._id

                const { error, value } = Joi.object<IRiderLicenseModel>($licenseSchema).validate(fields);
                if(error) return reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
                
                const rider = await datasources.riderDAOService.findById(riderId);

                const riderLicense = await datasources.riderLicenseDAOService.findByAny(
                    { rider: riderId }
                );
                if(riderLicense)
                    return reject(CustomAPIError.response('License for this rider already exist', HttpStatus.BAD_REQUEST.code));
                
                const issuedDate = new Date(value.issuedDate);
                const expiryDate = new Date(value.expiryDate);

                if(issuedDate > expiryDate)
                    return reject(CustomAPIError.response('License issued date can not be greater than expiry date', HttpStatus.BAD_REQUEST.code));

                // find license by license number
                const _licenseNumber = Generic.generateSlug(value.licenseNumber)
                const licenseNumber = await datasources.riderLicenseDAOService.findByAny(
                    { slug: _licenseNumber }
                );
                if(licenseNumber)
                    return reject(CustomAPIError.response(`License number: ${_licenseNumber} already exist`, HttpStatus.BAD_REQUEST.code));

                // check if image is part of the body payload
                if(Object.keys(files).length === 0)
                    return reject(CustomAPIError.response('License image is required', HttpStatus.BAD_REQUEST.code));
                
                const license_image = files.licenseImageUrl as File;
                const basePath = `${UPLOAD_BASE_PATH}/license`;

                let licenseImageUrl = ''
                if(license_image) {
                    // File size validation
                    const maxSizeInBytes = MAX_SIZE_IN_BYTE
                    if (license_image.size > maxSizeInBytes) {
                        return reject(CustomAPIError.response(MESSAGES.image_size_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    // File type validation
                    const allowedFileTypes = ALLOWED_FILE_TYPES;
                    if (!allowedFileTypes.includes(license_image.mimetype as string)) {
                        return reject(CustomAPIError.response(MESSAGES.image_type_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    licenseImageUrl = await Generic.getImagePath({
                        tempPath: license_image.filepath,
                        filename: license_image.originalFilename as string,
                        basePath,
                    });
                };

                const licenseValues: Partial<IRiderLicenseModel> = {
                    ...value,
                    issuedDate,
                    expiryDate,
                    licenseImageUrl: license_image && licenseImageUrl,
                    slug: _licenseNumber,
                    rider: riderId,
                    isExpired: rider?.level === 5 ? true : false
                };

                if(rider && rider.level < 4) {
                    await datasources.riderDAOService.update(
                        { _id: riderId },
                        { level: 4 }
                    )
                }
                
                const rider_level = rider && rider.level
                const license = await datasources.riderLicenseDAOService.create(licenseValues as IRiderLicenseModel);

                //@ts-ignore
                return resolve({license, rider_level})
                
            })
        })

    };

    private async doUpdateRiderLicense(req: Request): Promise<HttpResponse<IRiderLicenseModel>> {
        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {

                const licenseId = req.params.licenseId

                const { error, value } = Joi.object<IRiderLicenseModel>($licenseSchema).validate(fields);
                if(error) return reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
                    
                const rider = await datasources.riderLicenseDAOService.findById(licenseId);
                if(!rider)
                    return reject(CustomAPIError.response('License for this rider does not exist', HttpStatus.BAD_REQUEST.code));
                
                const _license = await datasources.riderLicenseDAOService.findByAny({
                    slug: Generic.generateSlug(value.licenseNumber)
                });

                const issuedDate = new Date(value.issuedDate);
                const expiryDate = new Date(value.expiryDate);
                if(issuedDate > expiryDate)
                    return reject(CustomAPIError.response('License issued date can not be greater than expiry date', HttpStatus.BAD_REQUEST.code));
    
                const licenseNumber = Generic.generateSlug(value.licenseNumber)
                if(licenseNumber && _license?.slug !== licenseNumber){
                    if(_license) {
                        return reject(CustomAPIError.response(`License with this ${licenseNumber} already exists`, HttpStatus.NOT_FOUND.code))
                    }
                };

                // check if image is part of the body payload
                if(Object.keys(files).length === 0)
                    return reject(CustomAPIError.response('License image is required', HttpStatus.BAD_REQUEST.code));
                
                const license_image = files.licenseImageUrl as File;
                const basePath = `${UPLOAD_BASE_PATH}/license`;

                let licenseImageUrl = ''
                if(license_image) {
                    // File size validation
                    const maxSizeInBytes = MAX_SIZE_IN_BYTE
                    if (license_image.size > maxSizeInBytes) {
                        return reject(CustomAPIError.response(MESSAGES.image_size_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    // File type validation
                    const allowedFileTypes = ALLOWED_FILE_TYPES;
                    if (!allowedFileTypes.includes(license_image.mimetype as string)) {
                        return reject(CustomAPIError.response(MESSAGES.image_type_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    licenseImageUrl = await Generic.getImagePath({
                        tempPath: license_image.filepath,
                        filename: license_image.originalFilename as string,
                        basePath,
                    });
                };

                const licenseValues = {
                    ...value,
                    licenseImageUrl: license_image && licenseImageUrl
                };
                console.log(licenseValues)
                const license = await datasources.riderLicenseDAOService.updateByAny(
                    { _id: rider?._id },
                    licenseValues
                );

                //@ts-ignore
                return resolve(license)
                
            })
        })

    };

    private async doUpdateRider(req: Request): Promise<HttpResponse<IRiderModel>> {
        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {

                const riderId = req.params.riderId;

                const { error, value } = Joi.object<IRiderModel>($updateRiderSchema).validate(fields);
                if(error) return reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
                
                const rider = await datasources.riderDAOService.findById(riderId);
                if(!rider) return reject(CustomAPIError.response('Rider not found', HttpStatus.NOT_FOUND.code));

                const rider_email = await datasources.riderDAOService.findByAny({
                    email: value.email
                });

                if(value.email && rider.email !== value.email){
                    if(rider_email) {
                        return reject(CustomAPIError.response('Rider with this email already exists', HttpStatus.NOT_FOUND.code))
                    }
                };

                const rider_phone = await datasources.riderDAOService.findByAny({
                    phone: value.phone
                });

                if(value.phone && rider.phone !== value.phone){
                    if(rider_phone) {
                        return reject(CustomAPIError.response('Rider with this phone number already exists', HttpStatus.NOT_FOUND.code))
                    }
                };

                let _email = ''
                if(!rider.googleId || !rider.facebookId || !rider.instagramId) {
                    _email = value.email as string
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

                const riderValues = {
                    ...value,
                    email: _email ? _email : rider.email,
                    profileImageUrl: profile_image && _profileImageUrl,
                    phone: _phone ? _phone : rider.phone,
                    dob: new Date(value.dob),
                    level: 2
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

    private async doEditRiderProfile(req: Request): Promise<HttpResponse<IRiderModel>> {
        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {

                const riderId = req.params.riderId;

                const { error, value } = Joi.object<IRiderModel>($editRiderProfileSchema).validate(fields);
                if(error) return reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
                
                const rider = await datasources.riderDAOService.findById(riderId);
                if(!rider) return reject(CustomAPIError.response('Rider not found', HttpStatus.NOT_FOUND.code));

                const rider_email = await datasources.riderDAOService.findByAny({
                    email: value.email
                });

                if(value.email && rider.email !== value.email){
                    if(rider_email) {
                        return reject(CustomAPIError.response('Rider with this email already exists', HttpStatus.NOT_FOUND.code))
                    }
                };

                const rider_phone = await datasources.riderDAOService.findByAny({
                    phone: value.phone
                });

                if(value.phone && rider.phone !== value.phone){
                    if(rider_phone) {
                        return reject(CustomAPIError.response('Rider with this phone number already exists', HttpStatus.NOT_FOUND.code))
                    }
                };

                let _email = ''
                if(!rider.googleId || !rider.facebookId || !rider.instagramId) {
                    _email = value.email as string
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

                const riderValues = {
                    ...value,
                    email: _email ? _email : rider.email,
                    profileImageUrl: _profileImageUrl ? _profileImageUrl : '',
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

    @TryCatch
    @HasPermission([MANAGE_ALL, RIDER_PERMISSION, READ_RIDER_REQUEST])
    public async getRequests(req: Request) {
        // const { error, value } = Joi.object<any>(
        //     riderRequestSchema
        //   ).validate(req.body);
      
        //   if (error)
        //     return Promise.reject(
        //       CustomAPIError.response(
        //         error.details[0].message,
        //         HttpStatus.BAD_REQUEST.code
        //       )
        //     );
        const riderId = req.params.riderId

        const rider = await datasources.riderDAOService.findById(riderId);

        if(!rider)
            return Promise.reject(CustomAPIError.response('Rider does not exist', HttpStatus.BAD_REQUEST.code));

        const options = {
            search: req.query.search,
            searchFields: ['deliveryRefNumber']
        };
        const riderRequests = await datasources.notificationDAOService.findAllRiderRequest({rider: rider._id});

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successful.',
            results: riderRequests
        };
        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([MANAGE_ALL, RIDER_PERMISSION, READ_RIDER_REQUEST])
    public async getSingleRequest(req: Request) {
        const requestId = req.params.requestId;

        const request = await datasources.notificationDAOService.findById(requestId);

        if(!request)
            return Promise.reject(CustomAPIError.response('Request does not exist', HttpStatus.BAD_REQUEST.code));

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successful.',
            result: request
        };
        return Promise.resolve(response);
    }


}