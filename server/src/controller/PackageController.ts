import { appCommonTypes } from "../@types/app-common";
import HttpResponse = appCommonTypes.HttpResponse;
import { HasPermission, TryCatch } from "../decorators";
import HttpStatus from "../helpers/HttpStatus";
import datasources from '../services/dao';
import { Request } from "express";
import Joi from "joi";
import { $savePackage, IPackageModel } from "../models/Package";
import CustomAPIError from "../exceptions/CustomAPIError";
import Generic from "../utils/Generic";
import { CREATE_PACKAGE, DELETE_PACKAGE, MANAGE_ALL, MANAGE_SOME } from "../config/settings";

export default class PackageController {

    @TryCatch
    @HasPermission([CREATE_PACKAGE, MANAGE_ALL, MANAGE_SOME])
    public async savePackage(req: Request) {

        //@ts-ignore
        const adminId = req.user._id as string;
            
        const { error, value } = Joi.object<IPackageModel>($savePackage).validate(req.body);
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
        
        const findPackage = await datasources.packageDAOService.findByAny({
            slug: Generic.generateSlug(value.type)
        });
        if(findPackage)
            return Promise.reject(CustomAPIError.response('Package already exist', HttpStatus.BAD_REQUEST.code))

        const packageValue: Partial<IPackageModel> = {
            ...value,
            adminId: adminId,
            slug: Generic.generateSlug(value.type)
        }

        const _package = await datasources.packageDAOService.create(packageValue as IPackageModel);

        const response: HttpResponse<IPackageModel> = {
            code: HttpStatus.OK.code,
            message: '',
            result: _package
        };
        
        return Promise.resolve(response)
    };

    @TryCatch
    @HasPermission([MANAGE_ALL, MANAGE_SOME, DELETE_PACKAGE])
    public async deletePackage(req: Request) {
        const packageId = req.params.packageId;

        await datasources.packageDAOService.deleteById(packageId)

        const response: HttpResponse<any> = {
            code: HttpStatus.OK.code,
            message: HttpStatus.OK.value,
            result: 'Successfully deleted',
        };
      
        return Promise.resolve(response);
    
    }
}