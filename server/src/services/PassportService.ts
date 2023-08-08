import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as InstagramStrategy } from 'passport-instagram';
import settings from '../config/settings';
import datasources from '../services/dao';
import Rider, { IRiderModel } from '../models/Rider';
import { ICustomerModel } from '../models/Customer';

/** GOOGLE STRATEGY START**/
//Customer
passport.use(
    new GoogleStrategy(
    {
        clientID: settings.googleOAuth.google_client_id,
        clientSecret: settings.googleOAuth.google_client_secret,
        callbackURL: settings.googleOAuth.google_callbackURL,
        passReqToCallback: true,
    },
    function(request: any, accessToken: any, refreshToken: any, profile: any, cb: any) {
        datasources.customerDAOService.findByAny({ googleId: profile.id })
        .then (async (customer: ICustomerModel | null) => {
            if (customer) {
        
                const role = await datasources.roleDAOService.findByIdPopulatePermissions(customer.roles);
                if(!role){
                    return cb(null, false, { message: 'Role is not found.' });
                }
        
                return cb(null, customer._id, {newReg: false});
            } else {
                // User does not exist, create a new user
                const role = await datasources.roleDAOService.findByAnyPopulatePermissions({
                    slug: settings.roles[2]
                });

                if (!role) {
                    return cb(null, false, { message: 'Role is not found.' });
                };
        
                const customerValues: Partial<ICustomerModel> = {
                    googleId: profile.id,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    roles: role._id,
                    active: true,
                    email: profile.email,
                    level: 1
                };
        
                const customer = await datasources.customerDAOService.create(
                    customerValues as ICustomerModel
                );
        
                role.users.push(customer._id);
                await role.save();

                return cb(null, customer._id, {newReg: true});
            }
        })
        .catch((error: any) => {
            return cb(error.message);
        });
    }
));

//Rider
passport.use(
    new GoogleStrategy(
    {
        clientID: settings.googleOAuthRider.google_client_r_id,
        clientSecret: settings.googleOAuthRider.google_client_r_secret,
        callbackURL: settings.googleOAuthRider.google_r_callbackURL,
        passReqToCallback: true,
    },
    function(request: any, accessToken: any, refreshToken: any, profile: any, cb: any) {
        datasources.riderDAOService.findByAny({ googleId: profile.id })
        .then (async (rider: IRiderModel | null) => {
            if (rider) {
        
                const role = await datasources.roleDAOService.findByIdPopulatePermissions(rider.roles);
                if(!role){
                    return cb(null, false, { message: 'Role is not found.' });
                }
        
                return cb(null, rider._id, {newReg: false});
            } else {
                // User does not exist, create a new user
                const role = await datasources.roleDAOService.findByAnyPopulatePermissions({
                    slug: settings.roles[3]
                });

                if (!role) {
                    return cb(null, false, { message: 'Role is not found.' });
                };
        
                const riderValues: Partial<IRiderModel> = {
                    googleId: profile.id,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    roles: role._id,
                    active: true,
                    email: profile.email,
                    level: 1
                };
        
                const rider = await datasources.riderDAOService.create(
                    riderValues as IRiderModel
                );
        
                role.users.push(rider._id);
                await role.save();

                return cb(null, rider._id, {newReg: true});
            }
        })
        .catch((error: any) => {
            return cb(error.message);
        });
    }
));
/** GOOGLE STRATEGY END**/

/** FACEBOOK STRATEGY START**/
//Customer
passport.use(
    new FacebookStrategy(
    {
        clientID: settings.facebookAuth.client_ID,
        clientSecret: settings.facebookAuth.client_secret,
        callbackURL: settings.facebookAuth.facebook_callbackURL,
        passReqToCallback: true,
    },
    function(request: any, accessToken: any, refreshToken: any, profile: any, cb: any) {
        datasources.customerDAOService.findByAny({ facebookId: profile.id })
        .then (async (customer: ICustomerModel | null) => {
            if (customer) {
        
                const role = await datasources.roleDAOService.findByIdPopulatePermissions(customer.roles);
                if(!role){
                    return cb(null, false, { message: 'Role is not found.' });
                }
        
                return cb(null, customer._id, {newReg: false});
            } else {
                // User does not exist, create a new user
                const role = await datasources.roleDAOService.findByAnyPopulatePermissions({
                    slug: settings.roles[2]
                });

                if (!role) {
                    return cb(null, false, { message: 'Role is not found.' });
                };
        
                const customerValues: Partial<ICustomerModel> = {
                    googleId: profile.id,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    roles: role._id,
                    active: true,
                    email: profile.email ? profile.email : '',
                    level: 1
                };
        
                const customer = await datasources.customerDAOService.create(
                    customerValues as ICustomerModel
                );
        
                role.users.push(customer._id);
                await role.save();

                return cb(null, customer._id, {newReg: true});
            }
        })
        .catch((error: any) => {
            return cb(error.message);
        });
    }
));

//Rider
passport.use(
    new FacebookStrategy(
    {
        clientID: settings.facebookAuthRider.client_r_ID,
        clientSecret: settings.facebookAuthRider.client_r_secret,
        callbackURL: settings.facebookAuthRider.facebook_r_callbackURL,
        passReqToCallback: true,
    },
    function(request: any, accessToken: any, refreshToken: any, profile: any, cb: any) {
        datasources.riderDAOService.findByAny({ facebookId: profile.id })
        .then (async (rider: IRiderModel | null) => {
            if (rider) {
        
                const role = await datasources.roleDAOService.findByIdPopulatePermissions(rider.roles);
                if(!role){
                    return cb(null, false, { message: 'Role is not found.' });
                }
        
                return cb(null, rider._id, {newReg: false});
            } else {
                // User does not exist, create a new user
                const role = await datasources.roleDAOService.findByAnyPopulatePermissions({
                    slug: settings.roles[3]
                });

                if (!role) {
                    return cb(null, false, { message: 'Role is not found.' });
                };
        
                const riderValues: Partial<IRiderModel> = {
                    googleId: profile.id,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    roles: role._id,
                    active: true,
                    email: profile.email ? profile.email : '',
                    level: 1
                };
        
                const rider = await datasources.riderDAOService.create(
                    riderValues as IRiderModel
                );
        
                role.users.push(rider._id);
                await role.save();

                return cb(null, rider._id, {newReg: true});
            }
        })
        .catch((error: any) => {
            return cb(error.message);
        });
    }
));
/** FACEBOOK STRATEGY END**/

/** INSTAGRAM STRATEGY START**/
//Customer
passport.use(
    new InstagramStrategy(
    {
        clientID: settings.instagramAuthRider.client_r_ID,
        clientSecret: settings.instagramAuthRider.client_r_secret,
        callbackURL: settings.instagramAuthRider.instagram_r_callbackURL,
        passReqToCallback: true,
    },
    function(request: any, accessToken: any, refreshToken: any, profile: any, cb: any) {
        datasources.customerDAOService.findByAny({ instagramId: profile.id })
        .then (async (customer: ICustomerModel | null) => {
            if (customer) {
        
                const role = await datasources.roleDAOService.findByIdPopulatePermissions(customer.roles);
                if(!role){
                    return cb(null, false, { message: 'Role is not found.' });
                }
        
                return cb(null, customer._id, {newReg: false});
            } else {
                // User does not exist, create a new user
                const role = await datasources.roleDAOService.findByAnyPopulatePermissions({
                    slug: settings.roles[2]
                });

                if (!role) {
                    return cb(null, false, { message: 'Role is not found.' });
                };
        
                const customerValues: Partial<ICustomerModel> = {
                    googleId: profile.id,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    roles: role._id,
                    active: true,
                    email: profile.email ? profile.email : '',
                    level: 1
                };
        
                const customer = await datasources.customerDAOService.create(
                    customerValues as ICustomerModel
                );
        
                role.users.push(customer._id);
                await role.save();

                return cb(null, customer._id, {newReg: true});
            }
        })
        .catch((error: any) => {
            return cb(error.message);
        });
    }
));

//Rider
passport.use(
    new InstagramStrategy(
    {
        clientID: settings.instagramAuth.client_ID,
        clientSecret: settings.instagramAuth.client_secret,
        callbackURL: settings.instagramAuth.instagram_callbackURL,
        passReqToCallback: true,
    },
    function(request: any, accessToken: any, refreshToken: any, profile: any, cb: any) {
        datasources.riderDAOService.findByAny({ instagramId: profile.id })
        .then (async (rider: IRiderModel | null) => {
            if (rider) {
        
                const role = await datasources.roleDAOService.findByIdPopulatePermissions(rider.roles);
                if(!role){
                    return cb(null, false, { message: 'Role is not found.' });
                }
        
                return cb(null, rider._id, {newReg: false});
            } else {
                // User does not exist, create a new user
                const role = await datasources.roleDAOService.findByAnyPopulatePermissions({
                    slug: settings.roles[3]
                });

                if (!role) {
                    return cb(null, false, { message: 'Role is not found.' });
                };
        
                const riderValues: Partial<IRiderModel> = {
                    googleId: profile.id,
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    roles: role._id,
                    active: true,
                    email: profile.email ? profile.email : '',
                    level: 1
                };
        
                const rider = await datasources.riderDAOService.create(
                    riderValues as IRiderModel
                );
        
                role.users.push(rider._id);
                await role.save();

                return cb(null, rider._id, {newReg: true});
            }
        })
        .catch((error: any) => {
            return cb(error.message);
        });
    }
));
/** INSTAGRAM STRATEGY END**/

passport.serializeUser(function(id, done) {
    done(null, id)
});

passport.deserializeUser((id: any, done) => {
    Rider.findById(id)
        .then((response: any) => {
            if (response) {
                done(null, response);
            } else {
                done(new Error('Rider not found'), null);
            }
        })
        .catch((err: any) => {
            done(err, null);
        });
});
