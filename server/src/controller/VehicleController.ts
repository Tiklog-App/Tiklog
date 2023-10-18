import { Request } from "express";
import { HasPermission, TryCatch } from "../decorators";
import HttpStatus from "../helpers/HttpStatus";
import CustomAPIError from "../exceptions/CustomAPIError";
import datasources from  '../services/dao';
import { appCommonTypes } from '../@types/app-common';
import Joi from 'joi';
import HttpResponse = appCommonTypes.HttpResponse;
import { appEventEmitter } from '../services/AppEventEmitter';
import formidable, { File } from 'formidable';
import {
    ALLOWED_FILE_TYPES,
    CREATE_VEHICLE,
    MAX_SIZE_IN_BYTE,
    MESSAGES,
    UPDATE_VEHICLE,
    UPLOAD_BASE_PATH,
} from "../config/constants";
import { $updateVehicleSchema, IVehicleModel } from "../models/Vehicle";
import { $saveVehicleSchema } from "../models/Vehicle";
import Generic from "../utils/Generic";
import {
    MANAGE_ALL,
    READ_VEHICLE,
    RIDER_PERMISSION,
    CREATE_VEHICLE_NAME,
    DELETE_VEHICLE_NAME,
    READ_VEHICLE_NAME,
    UPDATE_VEHICLE_NAME,
    READ_VEHICLE_TYPE,
    DELETE_VEHICLE_TYPE,
    CREATE_VEHICLE_TYPE,
    UPDATE_VEHICLE_TYPE
} from "../config/settings";
import { $saveVehicleNameSchema, IVehicleNameModel } from "../models/VehicleName";
import { $saveVehicleTypeSchema, $updateVehicleTypeSchema, IVehicleTypeModel } from "../models/VehicleType";

const form = formidable({ uploadDir: UPLOAD_BASE_PATH });

export default class VehicleController {

    @TryCatch
    @HasPermission([RIDER_PERMISSION])
    public async newVehicle(req: Request) {
        const vehicle = await this.doNewVehicle(req)

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully updated',
            result: vehicle
        };
      
        return Promise.resolve(response);

    };

    @TryCatch
    @HasPermission([RIDER_PERMISSION])
    public async updateVehicle(req: Request) {
        const vehicle = await this.doUpdateVehicle(req)

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully updated',
            result: vehicle
        };
      
        return Promise.resolve(response);

    };

    @TryCatch
    @HasPermission([RIDER_PERMISSION, MANAGE_ALL])
    public async getSingleVehicle(req: Request) {

        const riderId = req.params.riderId

        const vehicle = await datasources.vehicleDAOService.findByAny({
            rider: riderId
        });
        if(!vehicle)
            return Promise.reject(CustomAPIError.response('Vehicle does not exist', HttpStatus.NOT_FOUND.code));

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: vehicle
        };
      
        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([MANAGE_ALL, READ_VEHICLE])
    public async getVehicles(req: Request) {

        const vehicles = await datasources.vehicleDAOService.findAll({});

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: vehicles
        };
      
        return Promise.resolve(response);
    }

    @TryCatch
    @HasPermission([MANAGE_ALL, READ_VEHICLE])
    public async deleteVehicle(req: Request) {

        const vehicleId = req.params.vehicleId

        await datasources.vehicleDAOService.deleteById(vehicleId);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Successfully deleted'
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, CREATE_VEHICLE_NAME])
    public async newVehicleName(req: Request) {

        const { error, value } = Joi.object<IVehicleNameModel>($saveVehicleNameSchema).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
        
        const _vehicleName = await datasources.vehicleNameDAOService.findByAny({
            slug: Generic.generateSlug(value.vehicleName)
        })
        if(_vehicleName)
            return Promise.reject(CustomAPIError.response('Vehicle name already exist', HttpStatus.BAD_REQUEST.code));

        const uniqueArray = [...new Set(value.vehicleModel)];

        const vehicleNameValues: Partial<IVehicleNameModel> = {
            ...value,
            slug: Generic.generateSlug(value.vehicleName),
            vehicleModel: uniqueArray
        }

        const vehicleName = await datasources.vehicleNameDAOService.create(vehicleNameValues as IVehicleNameModel);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Vehicle name created successfully.',
            result: vehicleName
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, DELETE_VEHICLE_NAME])
    public async deleteVehicleName(req: Request) {

        const vehicleNameId = req.params.vehicleNameId;

        const _vehicleName = await datasources.vehicleNameDAOService.findById(vehicleNameId);
        if(!_vehicleName)
            return Promise.reject(CustomAPIError.response('Vehicle name does not exist', HttpStatus.BAD_REQUEST.code));
        

        await datasources.vehicleNameDAOService.deleteById(vehicleNameId);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Vehicle name deleted successfully.'
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, UPDATE_VEHICLE_NAME])
    public async updateVehicleName(req: Request) {

        const { vehicleModel } = req.body;

        const vehicleNameId = req.params.vehicleNameId;

        const _vehicleName = await datasources.vehicleNameDAOService.findById(vehicleNameId);
        if(!_vehicleName)
            return Promise.reject(CustomAPIError.response('Vehicle does not exist', HttpStatus.BAD_REQUEST.code));
        
        const uniqueArray = [...new Set(vehicleModel)];

        const updateValue = {
            ...req.body,
            vehicleModel: uniqueArray
        }

        const updated = await datasources.vehicleNameDAOService.updateByAny(
            {_id: vehicleNameId},
            updateValue
        );

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Vehicle name updated successfully.',
            result: updated
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, READ_VEHICLE_NAME, RIDER_PERMISSION])
    public async getVehicleName(req: Request) {

        const vehicleNames = await datasources.vehicleNameDAOService.findAll({});

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: vehicleNames
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, CREATE_VEHICLE_TYPE])
    public async newVehicleType(req: Request) {

        const { error, value } = Joi.object<IVehicleTypeModel>($saveVehicleTypeSchema).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
        
        const _vehicleType = await datasources.vehicleTypeDAOService.findByAny({
            slug: Generic.generateSlug(value.vehicleType)
        })
        if(_vehicleType)
            return Promise.reject(CustomAPIError.response('Vehicle type already exist', HttpStatus.BAD_REQUEST.code));
        
        const vehicleTypeValues: Partial<IVehicleTypeModel> = {
            ...value,
            slug: Generic.generateSlug(value.vehicleType)
        }

        const vehicleType = await datasources.vehicleTypeDAOService.create(vehicleTypeValues as IVehicleTypeModel);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Vehicle type created successfully.',
            result: vehicleType
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, UPDATE_VEHICLE_TYPE])
    public async editVehicleType(req: Request) {

        const vehicleTypeId = req.params.vehicleTypeId;

        const { error, value } = Joi.object<IVehicleTypeModel>($updateVehicleTypeSchema).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
        
        const vehicle_type = await datasources.vehicleTypeDAOService.findById(vehicleTypeId);
        if(!vehicle_type)
            return Promise.reject(CustomAPIError.response('Vehicle type not found', HttpStatus.NOT_FOUND.code));

        const slug = Generic.generateSlug(value.vehicleType)

        const _vehicleType = await datasources.vehicleTypeDAOService.findByAny({
            slug 
        })
        if(value.vehicleType && vehicle_type?.vehicleType !== value.vehicleType) {
            if(_vehicleType) {
                return Promise.reject(CustomAPIError.response('Vehicle type already exist', HttpStatus.BAD_REQUEST.code));
            }
        };
        
        const vehicleTypeValues: Partial<any> = {
            ...value,
            slug: Generic.generateSlug(value.vehicleType)
        }

        await datasources.vehicleTypeDAOService.update(
            { _id: vehicleTypeId },
            vehicleTypeValues
        );

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Vehicle type updated successfully.'
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, DELETE_VEHICLE_TYPE])
    public async deleteVehicleType(req: Request) {

        const vehicleTypeId = req.params.vehicleTypeId;

        const _vehicleType = await datasources.vehicleTypeDAOService.findById(vehicleTypeId);
        if(!_vehicleType)
            return Promise.reject(CustomAPIError.response('Vehicle type does not exist', HttpStatus.BAD_REQUEST.code));
        

        await datasources.vehicleTypeDAOService.deleteById(vehicleTypeId);

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: 'Vehicle type deleted successfully.'
        };
      
        return Promise.resolve(response);
    };

    @TryCatch
    // @HasPermission([MANAGE_ALL, READ_VEHICLE_TYPE, RIDER_PERMISSION])
    public async getVehicleType(req: Request) {

        const vehicleTypes = await datasources.vehicleTypeDAOService.findAll({});

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            results: vehicleTypes
        };
      
        return Promise.resolve(response);
    }

    private async doNewVehicle(req: Request): Promise<HttpResponse<IVehicleModel>> {
        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {

                //@ts-ignore
                const riderId = req.user._id

                const { error, value } = Joi.object<IVehicleModel>($saveVehicleSchema).validate(fields);
                if(error) return reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
                    
                const _vehicle = await datasources.vehicleDAOService.findByAny({
                    $or: [
                        { rider: riderId },
                        { licencePlateNumber: value.licencePlateNumber }
                    ]
                });
                if(_vehicle)
                    return reject(CustomAPIError.response('Vehicle already exist', HttpStatus.BAD_REQUEST.code));

                const vehicle_image = files.vehicleImageUrl as File;
                const basePath = `${UPLOAD_BASE_PATH}/vehicle`;

                let _vehicleImageUrl = ''
                if(vehicle_image) {
                    // File size validation
                    const maxSizeInBytes = MAX_SIZE_IN_BYTE
                    if (vehicle_image.size > maxSizeInBytes) {
                        reject(CustomAPIError.response(MESSAGES.image_size_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    // File type validation
                    const allowedFileTypes = ALLOWED_FILE_TYPES;
                    if (!allowedFileTypes.includes(vehicle_image.mimetype as string)) {
                        reject(CustomAPIError.response(MESSAGES.image_type_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    _vehicleImageUrl = await Generic.getImagePath({
                        tempPath: vehicle_image.filepath,
                        filename: vehicle_image.originalFilename as string,
                        basePath,
                    });
                };

                const vehicleValues: Partial<IVehicleModel> = {
                    ...value,
                    vehicleImageUrl: vehicle_image && _vehicleImageUrl,
                    rider: riderId,
                    slug: Generic.generateSlug(value.vehicleName)
                };

                await datasources.riderDAOService.update(
                    { _id: riderId },
                    { level: 3 }
                )
                const vehicle = await datasources.vehicleDAOService.create(vehicleValues as IVehicleModel);

                //@ts-ignore
                return resolve(vehicle)
                
            })
        })

    };

    private async doUpdateVehicle(req: Request): Promise<HttpResponse<IVehicleModel>> {
        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {

                const vehicleId = req.params.vehicleId

                const { error, value } = Joi.object<IVehicleModel>($updateVehicleSchema).validate(fields);
                if(error) return reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
                    
                const _vehicle = await datasources.vehicleDAOService.findById(vehicleId)
                if(!_vehicle)
                    return reject(CustomAPIError.response('Vehicle does not exist', HttpStatus.NOT_FOUND.code));

                const vehicle_image = files.vehicleImageUrl as File;
                const basePath = `${UPLOAD_BASE_PATH}/vehicle`;

                let _vehicleImageUrl = ''
                if(vehicle_image) {
                    // File size validation
                    const maxSizeInBytes = MAX_SIZE_IN_BYTE
                    if (vehicle_image.size > maxSizeInBytes) {
                        return reject(CustomAPIError.response(MESSAGES.image_size_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    // File type validation
                    const allowedFileTypes = ALLOWED_FILE_TYPES;
                    if (!allowedFileTypes.includes(vehicle_image.mimetype as string)) {
                        return reject(CustomAPIError.response(MESSAGES.image_type_error, HttpStatus.BAD_REQUEST.code));
                    }
            
                    _vehicleImageUrl = await Generic.getImagePath({
                        tempPath: vehicle_image.filepath,
                        filename: vehicle_image.originalFilename as string,
                        basePath,
                    });
                };

                const vehicleValues: Partial<IVehicleModel> = {
                    ...value,
                    vehicleImageUrl: vehicle_image && _vehicleImageUrl,
                    slug: Generic.generateSlug(value.vehicleName)
                };

                const vehicle = await datasources.vehicleDAOService.updateByAny(
                    {_id: _vehicle._id},
                    vehicleValues
                );

                //@ts-ignore
                return resolve(vehicle)
                
            })
        })

    }
}