import {
    facebookOAuthCallbackHandler,
    facebookOAuthHandler,
    facebookOAuthRiderCallbackHandler,
    facebookOAuthRiderHandler,
    finishSignupHandler_Customer,
    finishSignupHandler_Rider,
    googleOAuthCallbackRiderHandler,
    googleOAuthCallbackhHandler,
    googleOAuthHandler,
    googleOAuthRiderHandler,
    instagramOAuthCallbackHandler,
    instagramOAuthHandler,
    instagramOAuthRiderCallbackHandler,
    instagramOAuthRiderHandler,
    signInHandler_Admin,
    signInHandler_Customer,
    signInHandler_Rider,
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
        name: 'google OAuth Customer',
        method: 'get',
        path: '/google',
        handler: googleOAuthHandler
    },
    {
        name: 'google OAuth callback customer',
        method: 'get',
        path: '/google/callback',
        handler: googleOAuthCallbackhHandler
    },
    {
        name: 'google OAuth rider',
        method: 'get',
        path: '/rider/google',
        handler: googleOAuthRiderHandler
    },
    {
        name: 'google OAuth callback rider',
        method: 'get',
        path: '/rider/google/callback',
        handler: googleOAuthCallbackRiderHandler
    },
    {
        name: 'facebook OAuth customer',
        method: 'get',
        path: '/facebook',
        handler: facebookOAuthHandler
    },
    {
        name: 'facebook OAuth callback customer',
        method: 'get',
        path: '/facebook/callback',
        handler: facebookOAuthCallbackHandler
    },
    {
        name: 'facebook OAuth rider',
        method: 'get',
        path: '/rider/facebook',
        handler: facebookOAuthRiderHandler
    },
    {
        name: 'facebook OAuth callback rider',
        method: 'get',
        path: '/rider/facebook/callback',
        handler: facebookOAuthRiderCallbackHandler
    },
    {
        name: 'instagram OAuth customer',
        method: 'get',
        path: '/instagram',
        handler: instagramOAuthHandler
    },
    {
        name: 'instagram OAuth callback customer',
        method: 'get',
        path: '/instagram/callback',
        handler: instagramOAuthCallbackHandler
    },
    {
        name: 'instagram OAuth rider',
        method: 'get',
        path: '/rider/instagram',
        handler: instagramOAuthRiderHandler
    },
    {
        name: 'instagram OAuth callback rider',
        method: 'get',
        path: '/rider/instagram/callback',
        handler: instagramOAuthRiderCallbackHandler
    }
]

export default authEndpoints;