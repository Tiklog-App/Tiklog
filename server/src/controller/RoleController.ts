import { Request } from 'express';
import { HasPermission, TryCatch } from '../decorators';
import HttpStatus from '../helpers/HttpStatus';
import CustomAPIError from '../exceptions/CustomAPIError';
import Permission, { IPermissionModel } from '../models/Permission';
import datasources from  '../services/dao';
import { appCommonTypes } from '../@types/app-common';

import HttpResponse = appCommonTypes.HttpResponse;
import { $saveRoleSchema, $updateRoleSchema, IRoleModel } from '../models/Role';
import Joi from 'joi';
import Generic from '../utils/Generic';
import { appEventEmitter } from '../services/AppEventEmitter';
import { CREATE_ROLE } from '../config/constants';
import { MANAGE_ALL } from '../config/settings';

export default class RoleController {
  @TryCatch
  @HasPermission([MANAGE_ALL])
  public async createRole(req: Request) {

    const role = await this.createRoleAndPermission(req);

    appEventEmitter.emit(CREATE_ROLE, {role});
  
    const response: HttpResponse<IRoleModel> = {
      code: HttpStatus.OK.code,
      message: HttpStatus.OK.value,
      result: role,
    };
  
    return Promise.resolve(response);
  };

  @TryCatch
  @HasPermission([MANAGE_ALL])
  public async deleteRole(req: Request) {

    const roleId = req.params.roleId;

    const role = await datasources.roleDAOService.findById(roleId);
    if(!role)
      Promise.reject(CustomAPIError.response('Role does not exist', HttpStatus.NOT_FOUND.code));

    await datasources.roleDAOService.deleteById(roleId);

    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: 'Role deleted successfully'
    };
  
    return Promise.resolve(response);
    
  };

  @TryCatch
  @HasPermission([MANAGE_ALL])
  public async getAllRoles(req: Request) {
    
    const roles = await datasources.roleDAOService.findAll({});

    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: HttpStatus.OK.value,
      results: roles
    };
  
    return Promise.resolve(response);
    
  };

  @TryCatch
  @HasPermission([MANAGE_ALL])
  public async getRole(req: Request) {

    const roleId = req.params.roleId
    
    const role = await datasources.roleDAOService.findById(roleId);

    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: HttpStatus.OK.value,
      result: role
    };
  
    return Promise.resolve(response);
    
  };

  @TryCatch
  @HasPermission([MANAGE_ALL])
  public async updateRole(req: Request) {
    const roleId = req.params.roleId;

    const { error, value } = Joi.object<IRoleModel>($updateRoleSchema).validate(req.body);

    if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

    const exist_role = await datasources.roleDAOService.findById(roleId);
    if(!exist_role) return Promise.reject(CustomAPIError.response('Role does not exist', HttpStatus.BAD_REQUEST.code));

    const role_name = await datasources.roleDAOService.findByAny({
      name: value.name
    });

    if(value.name && exist_role.name !== value.name){
      if(role_name) {
        return Promise.reject(CustomAPIError.response('Role with this name already exists', HttpStatus.NOT_FOUND.code))
      }
    };

    const roleValues: Partial<IRoleModel> = {
      ...value,
      slug: Generic.generateSlug(value.name)
    };

    const role = await datasources.roleDAOService.updateByAny(
      //@ts-ignore
      {_id: exist_role?._id},
      roleValues
    )

    //@ts-ignore
    for (const permissionName of value.permit) {
      const permission = await datasources.permissionDAOService.findByAny({ name: permissionName });
      if (permission) {
        role?.permissions.push(permission._id);
      } else {
        // Handle the case when a permission is not found
        return Promise.reject(CustomAPIError.response(`Permission not found.`, HttpStatus.NOT_FOUND.code));
      }
    };
    
    await role?.save();

    const response: HttpResponse<any> = {
      code: HttpStatus.OK.code,
      message: 'Role update successfully'
    };
  
    return Promise.resolve(response);
  }
  

  private async createRoleAndPermission(req: Request) {

    const { error, value } = Joi.object<IRoleModel>($saveRoleSchema).validate(req.body);

    if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

    const exist_role = await datasources.roleDAOService.findByAny({name: value.name});
    if(exist_role) return Promise.reject(CustomAPIError.response('Role name already exist', HttpStatus.BAD_REQUEST.code));

    const roleValues: Partial<IRoleModel> = {
      name: value.name,
      slug: Generic.generateSlug(value.name)
    };

    const role = await datasources.roleDAOService.create(roleValues as IRoleModel);

    //@ts-ignore
    for (const permissionName of value.permit) {
      const permission = await datasources.permissionDAOService.findByAny({ name: permissionName });
      if (permission) {
        role.permissions.push(permission._id);
      } else {
        // Handle the case when a permission is not found
        return Promise.reject(CustomAPIError.response(`Permission not found.`, HttpStatus.NOT_FOUND.code));
      }
    };
    
    await role.save();

    return role;
  }

}