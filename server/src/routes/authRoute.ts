import { NextFunction, Request, Response } from "express";
import AuthenticationController from "../controller/AuthenticationController";
import PasswordEncoder from "../utils/PasswordEncoder";
import settings from "../config/settings";
import authenticateRouteWrapper from "../middleware/authenticateRouteWrapper";
import { Socket } from "socket.io";

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

export const signInHandler_Customer = async (req: Request, res: Response, socket: Socket) => {
    const response = await authController.sign_in_customer(req, socket);

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

export const signOutHandler = authenticateRouteWrapper(async (req: Request, res: Response) => {
    const response = await authController.signOut(req);
  
    res.clearCookie(settings.cookie.name, {
      sameSite: 'none',
      secure: true,
      signed: true,
      httpOnly: true,
    });
  
    res.status(response.code).json(response);
});

export const googleOAuthHandler = async (req: Request, res: Response, next: NextFunction) => {
    await authController.googleOAuth(req, res, next)
};

export const googleOAutCallbackhHandler = async (req: Request, res: Response) => {
    await authController.googleOAuthCallback(req, res)
};

export const facebookOAuthHandler = async (req: Request, res: Response, next: NextFunction) => {
    await authController.facebookOAuth(req, res, next)
};

export const facebookOAutCallbackhHandler = async (req: Request, res: Response, next: NextFunction) => {
    await authController.facebookOAuthCallback(req, res, next)
};

export const googleOAuthFailedHandler = async (req: Request, res: Response) => {
    await authController.googleOAuthFailed(req, res)
}