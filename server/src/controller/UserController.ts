import { Request } from 'express';
import { HasPermission, TryCatch } from '../decorators';
import HttpStatus from '../helpers/HttpStatus';
import CustomAPIError from '../exceptions/CustomAPIError';
import { $changePassword, $saveUserSchema, $updateUserSchema, IUserModel } from '../models/User';
import datasources from  '../services/dao';
import { appCommonTypes } from '../@types/app-common';
import Joi from 'joi';

import HttpResponse = appCommonTypes.HttpResponse;
import BcryptPasswordEncoder = appCommonTypes.BcryptPasswordEncoder;
import { appEventEmitter } from '../services/AppEventEmitter';
import { CHANGE_USER_PASSWORD, CREATE_USER_, DELETE_USER_, UPDATE_USER_, UPDATE_USER_STATUS_ } from '../config/constants';
import settings, { MANAGE_ALL, CREATE_USER, UPDATE_USER, DELETE_USER, READ_CUSTOMER, READ_USER, MANAGE_SOME } from '../config/settings';
import Generic from '../utils/Generic';

export default class UserController {
  private declare readonly passwordEncoder: BcryptPasswordEncoder;

  constructor(passwordEncoder: BcryptPasswordEncoder) {
    this.passwordEncoder = passwordEncoder;
  }


  @TryCatch
  // @HasPermission([MANAGE_ALL, CREATE_USER])
  public async createUser (req: Request) {
    const user = await this.doCreateUser(req);

    appEventEmitter.emit(CREATE_USER_, {user});

    const response: HttpResponse<IUserModel> = {
        code: HttpStatus.OK.code,
        message: HttpStatus.OK.value,
        result: user,
      };
  
    return Promise.resolve(response);
  };

    /**
   * @name updateUser
   * @param req
   * @desc Updates the user
   * only users with manage_all or update_user permission
   * can do this 
   */
  @TryCatch
  @HasPermission([MANAGE_ALL, UPDATE_USER])
  public async updateUser (req: Request) {
      const customer = await this.doUpdateUser(req);
  
      appEventEmitter.emit(UPDATE_USER_, customer)

      const response: HttpResponse<any> = {
          code: HttpStatus.OK.code,
          message: 'Successfully updated',
          result: customer
      };
    
      return Promise.resolve(response);
  };

  /*
  * @name changePassword
  * @param req
  * @desc Changes user password
  * only users with manage all permission and update user
  * permission can do this 
  */
  @TryCatch
  @HasPermission([MANAGE_ALL, UPDATE_USER])
  public  async changePassword (req: Request) {
    const user = await this.doChangePassword(req);

    appEventEmitter.emit(CHANGE_USER_PASSWORD, user)

    const response: HttpResponse<IUserModel> = {
      code: HttpStatus.OK.code,
      message: HttpStatus.OK.value,
      result: user,
    };
  
    return Promise.resolve(response);
  };

    /**
   * @name updateUserStatus
   * @param req
   * @desc Updates the user status
   * only user with super admin manage all and update user
   * permission can do this 
   */
  @TryCatch
  @HasPermission([MANAGE_ALL, UPDATE_USER])
  public  async updateUserStatus (req: Request) {
    const user = await this.doUpdateUserStatus(req);

    appEventEmitter.emit(UPDATE_USER_STATUS_, user)

    const response: HttpResponse<any> = {
        code: HttpStatus.OK.code,
        message: 'Successfully updated status'
    };
  
    return Promise.resolve(response);
  };
  
  /**
   * @name deleteUser
   * @param req
   * @desc deletes the user
   * only user with super admin manage all and delete user
   * permission can do this 
   */
  @TryCatch
  @HasPermission([MANAGE_ALL, DELETE_USER])
  public  async deleteUser (req: Request) {
    const user = await this.doDeleteUser(req);

    appEventEmitter.emit(DELETE_USER_, user)

    const response: HttpResponse<any> = {
        code: HttpStatus.OK.code,
        message: 'Successfully deleted'
    };
  
    return Promise.resolve(response);
  };
  
  /**
   * @name user
   * @param req
   * @desc Gets a single user
   * only user with super admin manage all and read user
   * permission can do this 
   */
  @TryCatch
  @HasPermission([MANAGE_ALL, MANAGE_SOME, READ_USER])
  public  async user (req: Request) {
    const userId = req.params.userId;
    
    const user = await datasources.userDAOService.findById(userId);
    if(!user) return Promise.reject(CustomAPIError.response(`User with Id: ${userId} does not exist`, HttpStatus.BAD_REQUEST.code));

    const response: HttpResponse<IUserModel> = {
        code: HttpStatus.OK.code,
        message: HttpStatus.OK.value,
        result: user,
    };
  
    return Promise.resolve(response);
  };

  @TryCatch
  @HasPermission([MANAGE_ALL, MANAGE_SOME, READ_USER])
  public  async ownUserDetail (req: Request) {

    //@ts-ignore
    const userId = req.user._id;
    
    const user = await datasources.userDAOService.findById(userId);
    if(!user) return Promise.reject(CustomAPIError.response(`User with Id: ${userId} does not exist`, HttpStatus.BAD_REQUEST.code));
    
    const response: HttpResponse<IUserModel> = {
        code: HttpStatus.OK.code,
        message: HttpStatus.OK.value,
        result: user
    };
  
    return Promise.resolve(response);
  };
  
  /**
   * @name users
   * @param req
   * @desc Gets all users, its also search and retrieves 
   * users according to user first name, last name and status
   * only users with super admin manage all and read user
   * permission can do this 
   */
  @TryCatch
  @HasPermission([MANAGE_ALL, READ_USER])
  public  async users (req: Request) {

    const role = await datasources.roleDAOService.findByAny({
      slug: settings.roles[0]
    })

    const options = {
        sort: { createdAt: -1 },
        roles: { $ne: role?._id }
    };

    const users = await datasources.userDAOService.findAll(options);

    if(!users) return Promise.reject(CustomAPIError.response('No user is available at this time', HttpStatus.BAD_REQUEST.code));

    const response: HttpResponse<IUserModel> = {
        code: HttpStatus.OK.code,
        message: HttpStatus.OK.value,
        results: users,
    };
  
    return Promise.resolve(response);
  };

  private async doCreateUser(req: Request){
    const { error, value } = Joi.object<IUserModel>($saveUserSchema).validate(req.body);

    if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
    
    const role = await datasources.roleDAOService.findByAny({
      slug: Generic.generateSlug(value.role)
    });
    if(!role) return Promise.reject(CustomAPIError.response('Role not found', HttpStatus.BAD_REQUEST.code));

    const email = await datasources.userDAOService.findByAny({email: value.email});
    if(email) return Promise.reject(CustomAPIError.response('Email already in use', HttpStatus.BAD_REQUEST.code));

    const phone = await datasources.userDAOService.findByAny({email: value.email});
    if(phone) return Promise.reject(CustomAPIError.response('Phone number already in use', HttpStatus.BAD_REQUEST.code));

    const password = await this.passwordEncoder.encode(value.password)
    
    const userValues: Partial<IUserModel> = {
      ...value,
      roles: role._id,
      active: true,
      password: password,
      confirm_password: password
    };

    const user = await datasources.userDAOService.create(userValues as IUserModel);

    role.users.push(user._id);
    await role.save();

    return user;
  }

  private async doUpdateUser(req: Request){

    const userId = req.params.userId;

    const { error, value } = Joi.object<IUserModel>($updateUserSchema).validate(req.body);

    if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
    
    const user = await datasources.userDAOService.findById(userId);
    if(!user) return Promise.reject(CustomAPIError.response('User not found', HttpStatus.NOT_FOUND.code));

    const user_email = await datasources.userDAOService.findByAny({
        email: value.email
    });

    if(value.email && user.email !== value.email){
        if(user_email) {
          return Promise.reject(CustomAPIError.response('User with this email already exists', HttpStatus.NOT_FOUND.code))
        }
    };

    const user_phone = await datasources.userDAOService.findByAny({
      phone: value.phone
    });

    if(value.phone && user.phone !== value.phone){
        if(user_phone) {
          return Promise.reject(CustomAPIError.response('User with this phone number already exists', HttpStatus.NOT_FOUND.code))
        }
    };

    const userValues: Partial<IUserModel> = {
      ...value
    };

    const _user = await datasources.userDAOService.updateByAny(
      {_id: user._id},
      userValues
    );

    return _user;
  }

  private async doChangePassword(req: Request) {
      const userId = req.params.userId;
      
      const { error, value } = Joi.object<IUserModel>($changePassword).validate(req.body);

      if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
    
      const user = await datasources.userDAOService.findById(userId);
      if(!user) return Promise.reject(CustomAPIError.response('User not found', HttpStatus.BAD_REQUEST.code));
  
      const hash = user.password as string;
      const password = value.previous_password;

      const isMatch = await this.passwordEncoder.match(password.trim(), hash.trim());
      if(!isMatch) return Promise.reject(CustomAPIError.response('Password in the database differ from the password entered as current password', HttpStatus.UNAUTHORIZED.code));

      const _password = await this.passwordEncoder.encode(value.password as string);

      const userValues = {
          password: _password,
          confirm_password: _password
      };

      await datasources.userDAOService.update(
          {_id: userId},
          userValues
      );

      return user;

  };

  private async doUpdateUserStatus(req: Request) {
    const userId = req.params.userId;

    const user = await datasources.userDAOService.findById(userId);
    if(!user) return Promise.reject(CustomAPIError.response('User not found', HttpStatus.BAD_REQUEST.code));

    const updateUser = await datasources.userDAOService.update(
        {_id: userId},
        {active: !user.active}
    );

    return updateUser;

  };

private async doDeleteUser(req: Request) {
  const userId = req.params.userId;

  return await datasources.userDAOService.deleteById(userId);

};
  
}