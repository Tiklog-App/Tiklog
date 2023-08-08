import { NextFunction, Request, Response } from "express";
import AuthenticationController from "../controller/AuthenticationController";
import PasswordEncoder from "../utils/PasswordEncoder";
import settings, { HOME_URL, LOGIN_ERROR, LOGIN_FAILED_URL, LOGIN_TOKEN, SIGN_IN_SUCCESS_URL } from "../config/settings";
import authenticateRouteWrapper from "../middleware/authenticateRouteWrapper";
import passport from "passport";
import datasources from '../services/dao';
import Generic from "../utils/Generic";

const passwordEncoder = new PasswordEncoder();
const authController = new AuthenticationController(passwordEncoder);

export const signupHandler_Customer = async (req: Request, res: Response) =>  {
    const response = await authController.signup_customer(req);

    res.status(response.code).json(response);
};

export const finishSignupHandler_Customer = async  (req: Request, res: Response) =>  {
    const response = await authController.finish_customer_signup(req);

    res.status(response.code).json(response);
};

export const finishSignupHandler_Rider = async  (req: Request, res: Response) =>  {
    const response = await authController.finish_rider_signup(req);

    res.status(response.code).json(response);
};

export const signupHandler_Rider = async  (req: Request, res: Response) =>  {
    const response = await authController.signup_rider(req);

    res.status(response.code).json(response);
};

export const signInHandler_Admin = async (req: Request, res: Response) => {
    const response = await authController.admin_login(req);

    res.cookie(settings.cookie.name, response.result, {
        sameSite: 'none',
        secure: true,
        signed: true,
        httpOnly: true
    });

    res.status(response.code).json(response)
};

export const signInHandler_Customer = async (req: Request, res: Response) => {
    const response = await authController.sign_in_customer(req);

    res.cookie(settings.cookie.name, response.result, {
        sameSite: 'none',
        secure: true,
        signed: true,
        httpOnly: true
    });

    res.status(response.code).json(response)
};

export const signInHandler_Rider = async (req: Request, res: Response) => {
    const response = await authController.sign_in_rider(req);

    res.cookie(settings.cookie.name, response.result, {
        sameSite: 'none',
        secure: true,
        signed: true,
        httpOnly: true
    });

    res.status(response.code).json(response)
};

export const googleOAuthHandler = (passport.authenticate("google", { scope: ["email", "profile"] }))
export const googleOAuthCallbackhHandler = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/error' }, async (err: any, customerId: any, newReg: any) => {
    if (err) {
      const error = 'An error occurred. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }
    if (!customerId) {
      const error = 'User not authenticated. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }

    const customer = await datasources.customerDAOService.findById(customerId);

    if(!customer?.active) {
      const error = 'Account is disabled. Please contact the administrator.'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL)
    }
    const role = newReg.newReg
                  ? await datasources.roleDAOService.findByAnyPopulatePermissions({
                      slug: settings.roles[2],
                    })
                  : await datasources.roleDAOService.findByIdPopulatePermissions(customer.roles)

    if(customer) {
      //generate JWT
      const jwt = Generic.generateJwt({
        userId: customer._id,
        permissions: role?.permissions
      });
      res.cookie(LOGIN_TOKEN, jwt);

      const updateValues = {
        loginDate: new Date(),
        loginToken: jwt
      };
  
      await datasources.customerDAOService.update({_id: customer._id}, updateValues);
    };

    return res.redirect(newReg.newReg === false ? HOME_URL : SIGN_IN_SUCCESS_URL);
  })(req, res, next);
};

export const googleOAuthRiderHandler = (passport.authenticate("google", { scope: ["email", "profile"] }))
export const googleOAuthCallbackRiderHandler = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/error' }, async (err: any, riderId: any, newReg: any) => {
    if (err) {
      const error = 'An error occurred. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }
    if (!riderId) {
      const error = 'User not authenticated. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }

    const rider = await datasources.riderDAOService.findById(riderId);

    if(!rider?.active) {
      const error = 'Account is disabled. Please contact the administrator.'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL)
    }
    const role = newReg.newReg
                  ? await datasources.roleDAOService.findByAnyPopulatePermissions({
                      slug: settings.roles[3],
                    })
                  : await datasources.roleDAOService.findByIdPopulatePermissions(rider.roles)

    if(rider) {
      //generate JWT
      const jwt = Generic.generateJwt({
        userId: rider._id,
        permissions: role?.permissions
      });
      res.cookie(LOGIN_TOKEN, jwt);

      const updateValues = {
        loginDate: new Date(),
        loginToken: jwt
      };
  
      await datasources.riderDAOService.update({_id: rider._id}, updateValues);
    };

    return res.redirect(newReg.newReg === false ? HOME_URL : SIGN_IN_SUCCESS_URL);
  })(req, res, next);
};

export const facebookOAuthHandler = (passport.authenticate("facebook", { scope: ["profile"] }))
export const facebookOAuthCallbackHandler = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/error' }, async (err: any, customerId: any, newReg: any) => {
    if (err) {
      const error = 'An error occurred. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }
    if (!customerId) {
      const error = 'User not authenticated. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }

    const customer = await datasources.customerDAOService.findById(customerId);

    if(!customer?.active) {
      const error = 'Account is disabled. Please contact the administrator.'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL)
    }
    const role = newReg.newReg
                  ? await datasources.roleDAOService.findByAnyPopulatePermissions({
                      slug: settings.roles[2],
                    })
                  : await datasources.roleDAOService.findByIdPopulatePermissions(customer.roles)

    if(customer) {
      //generate JWT
      const jwt = Generic.generateJwt({
        userId: customer._id,
        permissions: role?.permissions
      });
      res.cookie(LOGIN_TOKEN, jwt);

      const updateValues = {
        loginDate: new Date(),
        loginToken: jwt
      };
  
      await datasources.customerDAOService.update({_id: customer._id}, updateValues);
    };

    return res.redirect(newReg.newReg === false ? HOME_URL : SIGN_IN_SUCCESS_URL);
  })(req, res, next);
};

export const facebookOAuthRiderHandler = (passport.authenticate("facebook", { scope: ["profile"] }))
export const facebookOAuthRiderCallbackHandler = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/error' }, async (err: any, riderId: any, newReg: any) => {
    if (err) {
      const error = 'An error occurred. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }
    if (!riderId) {
      const error = 'User not authenticated. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }

    const rider = await datasources.riderDAOService.findById(riderId);

    if(!rider?.active) {
      const error = 'Account is disabled. Please contact the administrator.'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL)
    }
    const role = newReg.newReg
                  ? await datasources.roleDAOService.findByAnyPopulatePermissions({
                      slug: settings.roles[3],
                    })
                  : await datasources.roleDAOService.findByIdPopulatePermissions(rider.roles)

    if(rider) {
      //generate JWT
      const jwt = Generic.generateJwt({
        userId: rider._id,
        permissions: role?.permissions
      });
      res.cookie(LOGIN_TOKEN, jwt);

      const updateValues = {
        loginDate: new Date(),
        loginToken: jwt
      };
  
      await datasources.riderDAOService.update({_id: rider._id}, updateValues);
    };

    return res.redirect(newReg.newReg === false ? HOME_URL : SIGN_IN_SUCCESS_URL);
  })(req, res, next);
};

export const instagramOAuthHandler = (passport.authenticate("instagram", { scope: ["profile"] }))
export const instagramOAuthCallbackHandler = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/error' }, async (err: any, customerId: any, newReg: any) => {
    if (err) {
      const error = 'An error occurred. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }
    if (!customerId) {
      const error = 'User not authenticated. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }

    const customer = await datasources.customerDAOService.findById(customerId);

    if(!customer?.active) {
      const error = 'Account is disabled. Please contact the administrator.'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL)
    }
    const role = newReg.newReg
                  ? await datasources.roleDAOService.findByAnyPopulatePermissions({
                      slug: settings.roles[1],
                    })
                  : await datasources.roleDAOService.findByIdPopulatePermissions(customer.roles)

    if(customer) {
      //generate JWT
      const _jwt = Generic.generateJwt({
        userId: customer._id,
        permissions: role?.permissions,
      });
      res.cookie(LOGIN_TOKEN, _jwt);

      const updateValues = {
        loginDate: new Date(),
        loginToken: _jwt
      };
  
      await datasources.customerDAOService.update({_id: customer._id}, updateValues);
    };

    return res.redirect(newReg.newReg === false ? HOME_URL : SIGN_IN_SUCCESS_URL);
  })(req, res, next);
};

export const instagramOAuthRiderHandler = (passport.authenticate("instagram", { scope: ["profile"] }))
export const instagramOAuthRiderCallbackHandler = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/error' }, async (err: any, riderId: any, newReg: any) => {
    if (err) {
      const error = 'An error occurred. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }
    if (!riderId) {
      const error = 'User not authenticated. Please try again'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL);
    }

    const rider = await datasources.riderDAOService.findById(riderId);

    if(!rider?.active) {
      const error = 'Account is disabled. Please contact the administrator.'
      res.cookie(LOGIN_ERROR, error)
      return res.redirect(LOGIN_FAILED_URL)
    }
    const role = newReg.newReg
                  ? await datasources.roleDAOService.findByAnyPopulatePermissions({
                      slug: settings.roles[1],
                    })
                  : await datasources.roleDAOService.findByIdPopulatePermissions(rider.roles)

    if(rider) {
      //generate JWT
      const _jwt = Generic.generateJwt({
        userId: rider._id,
        permissions: role?.permissions,
      });
      res.cookie(LOGIN_TOKEN, _jwt);

      const updateValues = {
        loginDate: new Date(),
        loginToken: _jwt
      };
  
      await datasources.riderDAOService.update({_id: rider._id}, updateValues);
    };

    return res.redirect(newReg.newReg === false ? HOME_URL : SIGN_IN_SUCCESS_URL);
  })(req, res, next);
};

export const signOutHandler = authenticateRouteWrapper(async (req: Request, res: Response) => {
    const response = await authController.signOut(req);
  
    // res.clearCookie(settings.cookie.name, {
    //   sameSite: 'none',
    //   secure: true,
    //   signed: true,
    //   httpOnly: true,
    // });
  
    res.status(response.code).json(response);
});