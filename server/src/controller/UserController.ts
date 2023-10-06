import { Request } from 'express';
import { HasPermission, TryCatch } from '../decorators';
import HttpStatus from '../helpers/HttpStatus';
import CustomAPIError from '../exceptions/CustomAPIError';
import { $changePassword, $resetPassword, $savePasswordAfterReset, $saveUserSchema, $updateUserSchema, IUserModel } from '../models/User';
import datasources from  '../services/dao';
import { appCommonTypes } from '../@types/app-common';
import Joi from 'joi';
import formidable, { File } from 'formidable';
import HttpResponse = appCommonTypes.HttpResponse;
import BcryptPasswordEncoder = appCommonTypes.BcryptPasswordEncoder;
import settings, { MANAGE_ALL, CREATE_USER, UPDATE_USER, DELETE_USER, READ_CUSTOMER, READ_USER, MANAGE_SOME } from '../config/settings';
import Generic from '../utils/Generic';
import { ALLOWED_FILE_TYPES, MAX_SIZE_IN_BYTE, MESSAGES, UPLOAD_BASE_PATH } from '../config/constants';
import RedisService from '../services/RedisService';
import SendMailService from '../services/SendMailService';

const form = formidable({ uploadDir: UPLOAD_BASE_PATH });
const redisService = new RedisService();
const sendMailService = new SendMailService();

export default class UserController {
  private declare readonly passwordEncoder: BcryptPasswordEncoder;

  constructor(passwordEncoder: BcryptPasswordEncoder) {
    this.passwordEncoder = passwordEncoder;
  }


  @TryCatch
  @HasPermission([MANAGE_ALL, CREATE_USER])
  public async createUser (req: Request) {
    const user = await this.doCreateUser(req);

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
  // @HasPermission([MANAGE_ALL, UPDATE_USER])
  public async updateUser (req: Request) {
      const customer = await this.doUpdateUser(req);

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
  // @HasPermission([MANAGE_ALL, UPDATE_USER])
  public  async changePassword (req: Request) {
    const user = await this.doChangePassword(req);

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
    await this.doUpdateUserStatus(req);

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
    await this.doDeleteUser(req);

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
    if(!user) return Promise.reject(
      CustomAPIError.response(`User with Id: ${userId} does not exist`,
      HttpStatus.BAD_REQUEST.code));

    const role = await datasources.roleDAOService.findById(user.roles[0]);

    const result = {
      user,
      roleName: role?.name
    };

    const response: HttpResponse<any> = {
        code: HttpStatus.OK.code,
        message: HttpStatus.OK.value,
        result
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

    /**
   * @name resetPassword
   * @param req
   * @desc
   * Sends password reset link to user email
   * and also cached the reset token, email and
   * user id
   * to redis for 1 hour
   * 
   */
    public async resetPassword (req: Request) {
      try {
          const { error, value } = Joi.object<IUserModel>($resetPassword).validate(req.body);
          if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
          
          const user = await datasources.userDAOService.findByAny({
              email: value.email
          });
          if(!user) return Promise.reject(CustomAPIError.response('User not found', HttpStatus.BAD_REQUEST.code));
          
          const token = Generic.generatePasswordResetCode(4);
          
          const data = {
            token: token
          };
          const actualData = JSON.stringify(data);

          redisService.saveToken(`tikLog_app_${value.email}`, actualData, 3600);

          

          await datasources.userDAOService.update(
              {_id: user._id},
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
   * the token user id and the req.params if true it
   * Saves the new password for the user
   * else it returns an error
   */
  // @TryCatch
  public async savePassword (req: Request) {
      try {

          const { error, value } = Joi.object<IUserModel>($savePasswordAfterReset).validate(req.body);
          if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
      
          const user = await datasources.userDAOService.findByAny({
              email: value.email
          });
          if(!user)
              return Promise.reject(CustomAPIError.response('User not found', HttpStatus.BAD_REQUEST.code));
          
          const keys = `tikLog_app_${value.email}`;
          const redisData = await redisService.getToken(keys);

          if (redisData) {
              const { token }: any = redisData;
              
              if(token !== user.passwordResetCode)
                  return Promise.reject(CustomAPIError.response('Failed to save password, please try resetting password again', HttpStatus.BAD_REQUEST.code));
          
              const password = await this.passwordEncoder.encode(value.password as string);
              const userValues = {
                  password: password,
                  confirm_password: password
              };
              
              await datasources.userDAOService.update(
                  { _id: user._id },
                  userValues
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

  private async doCreateUser(req: Request){
    const { error, value } = Joi.object<IUserModel>($saveUserSchema).validate(req.body);

    if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
    
    const role = await datasources.roleDAOService.findByAny({
      slug: Generic.generateSlug(value.role)
    });
    if(!role) return Promise.reject(CustomAPIError.response('Role not found', HttpStatus.BAD_REQUEST.code));
    if((role.slug === settings.roles[0])) return Promise.reject(CustomAPIError.response('Super admin user already exist', HttpStatus.BAD_REQUEST.code));

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

  private async doUpdateUser(req: Request): Promise<HttpResponse<IUserModel>> {
    return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
            const userId = req.params.userId;

            const { error, value } = Joi.object<IUserModel>($updateUserSchema).validate(fields);
            if(error) return reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
            
            const user = await datasources.userDAOService.findById(userId);
            if(!user) return reject(CustomAPIError.response('User not found', HttpStatus.NOT_FOUND.code));


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

            const role = await datasources.roleDAOService.findByAny({
              name: value.role
            });
            if(!role)
              return Promise.reject(CustomAPIError.response("Role not found", HttpStatus.NOT_FOUND.code));

            const profile_image = files.profileImageUrl as File;
            const basePath = `${UPLOAD_BASE_PATH}/user`;

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

            const userValues = {
                ...value,
                profileImageUrl: profile_image && _profileImageUrl,
                role: role._id
            };

            const updatedUser = await datasources.userDAOService.updateByAny(
                {_id: userId},
                userValues
            );
            
            //@ts-ignore
            return resolve(updatedUser);
        })
    })
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