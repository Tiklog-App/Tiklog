import {
    facebookOAutCallbackhHandler,
    facebookOAuthHandler,
    finishSignupHandler_Customer,
  finishSignupHandler_Rider,
  googleOAutCallbackhHandler,
  googleOAuthFailedHandler,
  googleOAuthHandler,
  signInHandler_Admin,
  signInHandler_Customer,
  signInHandler_Rider,
  signOutHandler,
  signupHandler_Customer,
  signupHandler_Rider  
} from '../../routes/authRoute';

import { appCommonTypes } from '../../@types/app-common';
import RouteEndpoint = appCommonTypes.RouteEndpoints;

const authEndpoints: RouteEndpoint  = [
    {
        name: 'signIn-admin',
        method: 'post',
        path: '/sign-in-admin',
        handler: signInHandler_Admin
    },
    {
        name: 'signIn-customer',
        method: 'post',
        path: '/sign-in-customer',
        handler: signInHandler_Customer
    },
    {
        name: 'signIn-rider',
        method: 'post',
        path: '/sign-in-rider',
        handler: signInHandler_Rider
    },
    {
        name: 'signUp-customer',
        method: 'post',
        path: '/sign-up-customer',
        handler: signupHandler_Customer
    },
    {
        name: 'finish-customer_signUp',
        method: 'post',
        path: '/finish-customer-sign-up',
        handler: finishSignupHandler_Customer
    },
    {
        name: 'finish-rider_signUp',
        method: 'post',
        path: '/finish-rider-sign-up',
        handler: finishSignupHandler_Rider
    },
    {
        name: 'signUp-rider',
        method: 'post',
        path: '/sign-up-rider',
        handler: signupHandler_Rider
    },
    {
        name: 'signOut',
        method: 'put',
        path: '/sign-out',
        handler: signOutHandler
    },
    {
        name: 'google OAuth rider',
        method: 'get',
        path: '/rider/google',
        handler: googleOAuthHandler
    },
    {
        name: 'google OAuth callback rider',
        method: 'get',
        path: '/rider/google/callback',
        handler: googleOAutCallbackhHandler
    },
    {
        name: 'facebook OAuth rider',
        method: 'get',
        path: '/rider/facebook',
        handler: facebookOAuthHandler
    },
    {
        name: 'facebook OAuth callback rider',
        method: 'get',
        path: '/rider/facebook/callback',
        handler: facebookOAutCallbackhHandler
    },
    {
        name: 'google OAuth',
        method: 'get',
        path: '/google',
        handler: googleOAuthHandler
    },
    {
        name: 'google OAuth callback',
        method: 'get',
        path: '/google/callback',
        handler: googleOAutCallbackhHandler
    },
    {
        name: 'facebook OAuth',
        method: 'get',
        path: '/facebook',
        handler: facebookOAuthHandler
    },
    {
        name: 'facebook OAuth callback',
        method: 'get',
        path: '/facebook/callback',
        handler: facebookOAutCallbackhHandler
    },
    {
        name: 'google OAuth failed',
        method: 'get',
        path: '/google/failed',
        handler: googleOAuthFailedHandler
    }
]

export default authEndpoints;