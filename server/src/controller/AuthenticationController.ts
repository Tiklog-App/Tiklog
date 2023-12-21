import { appCommonTypes } from "../@types/app-common";
import HttpResponse = appCommonTypes.HttpResponse;
import BcryptPasswordEncoder = appCommonTypes.BcryptPasswordEncoder;
import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../decorators";
import Joi from "joi";
import { $finishSavingCustomer, $loginSchemaCustomer, $saveCustomerSchema, ICustomerModel } from "../models/Customer";
import CustomAPIError from "../exceptions/CustomAPIError";
import HttpStatus from "../helpers/HttpStatus";
import datasources from '../services/dao';
import settings, { CUSTOMER_PERMISSION, MANAGE_ALL, RIDER_PERMISSION } from "../config/settings";
import Generic from "../utils/Generic";
import { $finishSavingRider, $loginSchemaRider, $saveRiderSchema, IRiderModel } from "../models/Rider";
import { $loginSchema, IUserModel } from "../models/User";
import RedisService from "../services/RedisService";
import { RIDER_STATUS_PENDING } from "../config/constants";
import RabbitMqService from "../services/RabbitMqService";
import { decode } from 'jsonwebtoken';
import { IWalletModel } from "../models/Wallet";

const redisService = new RedisService();
const rabbitMqService = new RabbitMqService();

export default class AuthenticationController {
    private declare readonly passwordEncoder: BcryptPasswordEncoder;

    constructor(passwordEncoder: BcryptPasswordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 
     * @name customer_signup
     * @param req
     * customer signup
     */
    @TryCatch
    public async admin_login(req: Request) {
        const { error, value } = Joi.object<IUserModel>($loginSchema).validate(req.body);
        
        if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

        const user = await datasources.userDAOService.findByAny({email: value.email});
        if(!user) return Promise.reject(CustomAPIError.response(HttpStatus.UNAUTHORIZED.value, HttpStatus.BAD_REQUEST.code));

        const hash = user.password;
        const password = value.password;

        const isMatch = await this.passwordEncoder.match(password.trim(), hash.trim());
        if(!isMatch) return Promise.reject(CustomAPIError.response(HttpStatus.UNAUTHORIZED.value, HttpStatus.UNAUTHORIZED.code));

        if(!user.active)
        return Promise.reject(
          CustomAPIError.response('Account is disabled. Please contact administrator', HttpStatus.UNAUTHORIZED.code)
        );

        const role = await datasources.roleDAOService.findByIdPopulatePermissions(user.roles);
        if(!role) return Promise.reject(CustomAPIError.response('Role is not found', HttpStatus.UNAUTHORIZED.code));

        const permissions: any = [];
        
        for (const _permission of role.permissions) {
          permissions.push(_permission)
        }

        //generate JWT
        const jwt = Generic.generateJwt({
          userId: user.id,
          permissions
        });

        //update user authentication date and authentication token
        const updateValues = {
          loginDate: new Date(),
          loginToken: jwt
        };

        await datasources.userDAOService.updateByAny({_id: user.id}, updateValues);

        const response: HttpResponse<string> = {
          code: HttpStatus.OK.code,
          message: 'Login successful',
          result: jwt
        };

        return Promise.resolve(response);
    }

    /**
     * 
     * @name customer_signup
     * @param req
     * customer signup, this will send a 4 digit
     * token to the customer's phone number
     */
    @TryCatch
    public async signup_customer(req: Request) {
      const { error, value } = Joi.object<ICustomerModel>($saveCustomerSchema).validate(req.body);

      if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

      const phone = await datasources.customerDAOService.findByAny({phone: value.phone});
      if(phone) return Promise.reject(CustomAPIError.response('Phone number already in use', HttpStatus.BAD_REQUEST.code));

      const token = redisService.generateToken();

      const data = {
        password: value.password,
        token: token,
        phone: value.phone
      };
      const actualData = JSON.stringify(data);

      redisService.saveToken(value.phone, actualData, 180);
      // redisService.sendNotification(
      //   value.phone,
      //   `Your token is: ${token}`
      // )
      
      const response: HttpResponse<any> = {
        code: HttpStatus.OK.code,
        message: `Account creation token has been sent to your phone number. ${token}`
      };
  
      return Promise.resolve(response);

    }

    /**
     * 
     * @name finish_customer_signup
     * @param req
     * customer finish signup, this will req for the
     * numbers and the customer phone number, then
     * finally creates the customer account
     */
    @TryCatch
    public async finish_customer_signup(req: Request) {

      const { error, value } = Joi.object<ICustomerModel>($finishSavingCustomer).validate(req.body);

      if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

      const role = await datasources.roleDAOService.findByAny({
        slug: settings.roles[2]
      });
      if(!role) return Promise.reject(CustomAPIError.response('Role not found', HttpStatus.BAD_REQUEST.code));

      //VALUE.PHONE NUMBER SHOULD BE PROVIDED FROM FE.
      const redisData = await redisService.getToken(value.phone);

      if (redisData) {
        const { password, phone, token }: any = redisData;

        if(token !== value.token) 
          return Promise.reject(CustomAPIError.response('Token is incorrect', HttpStatus.BAD_REQUEST.code));
        
        const _password = await this.passwordEncoder.encode(password);

        const customerValues: Partial<ICustomerModel> = {
          active: true,
          password: _password,
          confirm_password: _password,
          phone: phone,
          roles: role._id,
          level: 1
        };

        const customer = await datasources.customerDAOService.create(customerValues as ICustomerModel);
        
        //create wallet
        const walletValue: Partial<IWalletModel> = {
          customer: customer._id
        }
        await datasources.walletDAOService.create(walletValue as IWalletModel);

        role.users.push(customer._id);
        await role.save();

        const _role = await datasources.roleDAOService.findByIdPopulatePermissions(customer.roles);

        if(!_role) return Promise.reject(CustomAPIError.response('Role is not found', HttpStatus.UNAUTHORIZED.code));

        const permissions: any = [];
        
        for (const _permission of _role.permissions) {
          permissions.push(_permission)
        }

        //generate JWT
        const jwt = Generic.generateJwt({
          userId: customer.id,
          level: customer.level,
          permissions,
          type: "customer",
        });

        //update user authentication date and authentication token
        const updateValues = {
          loginDate: new Date(),
          loginToken: jwt
        };

        await datasources.customerDAOService.updateByAny({customer}, updateValues);
        
        const response: HttpResponse<string> = {
          code: HttpStatus.OK.code,
          message: HttpStatus.OK.value,
          result: jwt,
        };
        
        redisService.deleteRedisKey(customer.phone)
        return Promise.resolve(response);

      } else {
        return Promise.reject(CustomAPIError.response('Token has expired', HttpStatus.BAD_REQUEST.code))
      }

    }

    @TryCatch
    public async sign_in_customer(req: Request) {
      await rabbitMqService.connectToRabbitMQ()

      const { error, value } = Joi.object<ICustomerModel>($loginSchemaCustomer).validate(req.body);

      if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

      const user = await datasources.customerDAOService.findByAny({
        phone: value.phone
      });
      if(!user) return Promise.reject(CustomAPIError.response(HttpStatus.UNAUTHORIZED.value, HttpStatus.NOT_FOUND.code));
      if(user.googleId || user.facebookId || user.instagramId) {
        return Promise.reject(
          CustomAPIError
          .response(`You tried signing in as ${value.phone} using a password, which is not the authentication method you used during sign up. Try again using the authentication method you used during sign up.`, HttpStatus.BAD_REQUEST.code))
      };
      
      const hash = user.password as string;
      const password = value.password as string;
     
      const isMatch = await this.passwordEncoder.match(password.trim(), hash ? hash.trim() : '');
      if(!isMatch) return Promise.reject(CustomAPIError.response(HttpStatus.UNAUTHORIZED.value, HttpStatus.UNAUTHORIZED.code));

      if(!user.active)
        return Promise.reject(
            CustomAPIError.response('Account is disabled. Please contact administrator', HttpStatus.UNAUTHORIZED.code)
        );

      const role = await datasources.roleDAOService.findByIdPopulatePermissions(user.roles);
      if(!role) return Promise.reject(CustomAPIError.response('Role is not found', HttpStatus.UNAUTHORIZED.code));

      const permissions: any = [];
      
      for (const _permission of role.permissions) {
        permissions.push(_permission)
      }

      //generate JWT
      const jwt = Generic.generateJwt({
        userId: user._id,
        level: user.level,
        type: "customer",
        permissions
      });

      //update user authentication date and authentication token
      const updateValues = {
        loginDate: new Date(),
        loginToken: jwt
      };

      await datasources.customerDAOService.updateByAny({user}, updateValues);

      const response: HttpResponse<string> = {
        code: HttpStatus.OK.code,
        message: 'Login successful',
        result: jwt
      };

      return Promise.resolve(response);
    }

    /**
     * 
     * @name rider_signup
     * @body req for phone number, password and confirm password
     * @desc rider signup
     * @desc rider signup, this will send a 4 digit
     * @desc token to the rider's phone number
     */
    @TryCatch
    public async signup_rider(req: Request) {
      const { error, value } = Joi.object<IRiderModel>($saveRiderSchema).validate(req.body);

      if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

      const phone = await datasources.riderDAOService.findByAny({phone: value.phone});
      if(phone) return Promise.reject(CustomAPIError.response('Phone number already in use', HttpStatus.BAD_REQUEST.code));

      const token = redisService.generateToken();

      const data = {
        password: value.password,
        token: token,
        phone: value.phone
      };
      const actualData = JSON.stringify(data);

      redisService.saveToken(value.phone, actualData, 180);
      // redisService.sendNotification(
      //   value.phone,
      //   `Your token is: ${token}`
      // )

      const response: HttpResponse<any> = {
        code: HttpStatus.OK.code,
        message: `Account creation token has been sent to your phone number. ${token}`
      };

      return Promise.resolve(response);

    }

    /**
    * 
    * @name finish_rider_signup
    * @body req token from redis and phone number
    * rider finish signup, this will req for the
    * numbers and the rider phone number, then
    * finally creates the rider account
    */
    @TryCatch
    public async finish_rider_signup(req: Request) {
   
      const { error, value } = Joi.object<IRiderModel>($finishSavingRider).validate(req.body);
   
      if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));
   
      const role = await datasources.roleDAOService.findByAny({
        slug: settings.roles[3]
      });
      if(!role) return Promise.reject(CustomAPIError.response('Role not found', HttpStatus.BAD_REQUEST.code));
   
      //VALUE.PHONE NUMBER SHOULD BE PROVIDED FROM FE.
      const redisData = await redisService.getToken(value.phone);
   
      if (redisData) {
        const { password, phone, token }: any = redisData;
   
        if(token !== value.token) 
          return Promise.reject(CustomAPIError.response('Token is incorrect', HttpStatus.BAD_REQUEST.code));
        
        const _password = await this.passwordEncoder.encode(password);
   
        const riderValues: Partial<IRiderModel> = {
          active: true,
          status: RIDER_STATUS_PENDING,
          password: _password,
          confirm_password: _password,
          phone: phone,
          roles: role._id,
          level: 1
        };
   
        const rider = await datasources.riderDAOService.create(riderValues as IRiderModel);
   
        role.users.push(rider._id);
        await role.save();

        const _role = await datasources.roleDAOService.findByIdPopulatePermissions(rider.roles);
        if(!_role) return Promise.reject(CustomAPIError.response('Role is not found', HttpStatus.UNAUTHORIZED.code));

        const permissions: any = [];
        
        for (const _permission of _role.permissions) {
          permissions.push(_permission)
        }

        //generate JWT
        const jwt = Generic.generateJwt({
          userId: rider.id,
          level: rider.level,
          permissions,
          type: "rider",
        });

        //update user authentication date and authentication token
        const updateValues = {
          loginDate: new Date(),
          loginToken: jwt
        };

        await datasources.riderDAOService.updateByAny({rider}, updateValues);
        
        const response: HttpResponse<string> = {
          code: HttpStatus.OK.code,
          message: HttpStatus.OK.value,
          result: jwt,
        };
        
        redisService.deleteRedisKey(rider.phone)
        return Promise.resolve(response);
   
      } else {
        return Promise.reject(CustomAPIError.response('Token has expired', HttpStatus.BAD_REQUEST.code))
      }
   
    }

    @TryCatch
    public async sign_in_rider(req: Request) {
      const { error, value } = Joi.object<IRiderModel>($loginSchemaRider).validate(req.body);

      if(error) return Promise.reject(CustomAPIError.response(error.details[0].message, HttpStatus.BAD_REQUEST.code));

      const rider = await datasources.riderDAOService.findByAny({phone: value.phone});
      if(!rider) return Promise.reject(CustomAPIError.response(HttpStatus.UNAUTHORIZED.value, HttpStatus.BAD_REQUEST.code));
      if(rider.googleId || rider.facebookId || rider.instagramId) {
        return Promise.reject(
          CustomAPIError
          .response(`You tried signing in as ${value.phone} using a password, which is not the authentication method you used during sign up. Try again using the authentication method you used during sign up.`, HttpStatus.BAD_REQUEST.code))
      };

      const hash = rider.password as string;
      const password = value.password as string;

      const isMatch = await this.passwordEncoder.match(password.trim(), hash ? hash.trim() : '');
      if(!isMatch) return Promise.reject(CustomAPIError.response(HttpStatus.UNAUTHORIZED.value, HttpStatus.UNAUTHORIZED.code));

      if(!rider.active)
        return Promise.reject(
            CustomAPIError.response('Account is disabled. Please contact administrator', HttpStatus.UNAUTHORIZED.code)
        );

      const role = await datasources.roleDAOService.findByIdPopulatePermissions(rider.roles);
      if(!role) return Promise.reject(CustomAPIError.response('Role is not found', HttpStatus.UNAUTHORIZED.code));

      const permissions: any = [];
      
      for (const _permission of role.permissions) {
        permissions.push(_permission)
      }

      //generate JWT
      const jwt = Generic.generateJwt({
        userId: rider._id,
        level: rider.level,
        type: "rider",
        permissions
      });

      //update user authentication date and authentication token
      const updateValues = {
        loginDate: new Date(),
        loginToken: jwt
      };

      await datasources.riderDAOService.updateByAny({rider}, updateValues);

      const response: HttpResponse<string> = {
        code: HttpStatus.OK.code,
        message: 'Login successful',
        result: jwt
      };

      return Promise.resolve(response);
    }

    public async signOut(req: Request) {
      try {
        //@ts-ignore
        const { loginToken, _id } = req.user;
        const decoded = decode(loginToken);
        //@ts-ignore
        const firstPermission = decoded.permissions.find(() => true);

        if (firstPermission) {
          if (firstPermission.name === CUSTOMER_PERMISSION) {

            await datasources.customerDAOService.update(
              { _id: _id },
              { loginToken: '', loginDate: null }
            );
          } else if (firstPermission.name === RIDER_PERMISSION) {
            await datasources.riderDAOService.update(
              { _id: _id },
              { loginToken: '', loginDate: null }
            );
          } else {
            await datasources.userDAOService.update(
              { _id: _id },
              { loginToken: '', loginDate: null }
            );
          }
        }
        

        const response: HttpResponse<null> = {
            code: HttpStatus.OK.code,
            message: "Signed out successfully"
        };

        return Promise.resolve(response)
  
      } catch (error) {
          return Promise.reject(error)
      }
    };
}