import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

import { appCommonTypes } from '../@types/app-common';
import AppLogger from '../utils/AppLogger';
import settings from '../config/settings';
import cookieParser = require('cookie-parser');
import CustomJwtPayload = appCommonTypes.CustomJwtPayload;
import AsyncWrapper = appCommonTypes.AsyncWrapper;
import CustomAPIError from '../exceptions/CustomAPIError';
import HttpStatus from '../helpers/HttpStatus';
import CustomerRepository from '../repositories/CustomerRepository';
import UserRepository from '../repositories/UserRepository';
import RiderRepository from '../repositories/RiderRepository';

const customerRepository = new CustomerRepository();
const userRepository = new UserRepository();
const riderRepository = new RiderRepository();

const logger = AppLogger.init(authenticateRouteWrapper.name).logger;

export default function authenticateRouteWrapper(handler: AsyncWrapper) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const headers = req.headers;

    const authorization = headers.authorization;
    const cookies = req.signedCookies;
    const key = settings.jwt.key;
    const cookieName = settings.cookie.name;
    const cookie = cookies[cookieName];

    if (cookie) {
      const jwt = cookieParser.signedCookie(cookie, settings.cookie.secret);

      if (false === jwt) {
        logger.error(`malformed authorization: invalid cookie`);

        return next(CustomAPIError.response(HttpStatus.UNAUTHORIZED.value, HttpStatus.UNAUTHORIZED.code));
      }

      const payload = verify(jwt, key) as CustomJwtPayload;

      req.permissions = payload.permissions;
      req.jwt = jwt;
      
      if (payload.userId) {
        const { userId } = payload;

        const user = await userRepository.findById(userId)
        if (user) {
          req.user = user;
          
          return await handler(req, res, next);
        }

        const customer = await customerRepository.findById(userId)
        if (customer) {
          req.user = customer;

          return await handler(req, res, next);
        }

        const rider = await riderRepository.findById(userId)
        if (rider) {
          req.user = rider;

          return await handler(req, res, next);
        }
      }
    }

    if (authorization) {
      if (!authorization.startsWith('Bearer')) {
        logger.error(`malformed authorization: 'Bearer' missing`);

        return next(CustomAPIError.response(HttpStatus.UNAUTHORIZED.value, HttpStatus.UNAUTHORIZED.code));
      }

      const jwt = authorization.split(' ')[1].trim();

      const payload = verify(jwt, key) as CustomJwtPayload;

      req.permissions = payload.permissions;
      req.jwt = jwt;

      if (payload.userId) {
        const { userId } = payload;

        const user = await userRepository.findById(userId);
        
        if (user) {
          req.user = user;
          
          return await handler(req, res, next);
        }

        const customer = await customerRepository.findById(userId);
        if (customer) {
          req.user = customer;

          return await handler(req, res, next);
        }

        const rider = await riderRepository.findById(userId);
        if (rider) {
          req.user = rider;

          return await handler(req, res, next);
        }
      }
    }

    return next(CustomAPIError.response(HttpStatus.UNAUTHORIZED.value, HttpStatus.UNAUTHORIZED.code));
  };
}
