import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import datasources from '../services/dao';
import CustomAPIError from '../exceptions/CustomAPIError';
import settings from '../config/settings';
import HttpStatus from '../helpers/HttpStatus';
import { ICustomerModel } from '../models/Customer';
import Generic from '../utils/Generic';
import { Request, Response } from 'express';
import { IRiderModel } from '../models/Rider';
// import { Strategy as OAuth2Strategy } from 'passport-oauth2';

// class AppleStrategy extends OAuth2Strategy {
//   constructor(options: any, verify: any) {
//     const appleOptions = {
//       authorizationURL: 'https://appleid.apple.com/auth/authorize',
//       tokenURL: 'https://appleid.apple.com/auth/token',
//       ...options,
//     };

//     super(appleOptions, verify);
//     this.name = 'apple';
//   }
// }

class AuthService {
  initialize() {
    // Google Strategy
    passport.use(
      new GoogleStrategy(
        {
          clientID: settings.googleOAuth.google_client_id,
          clientSecret: settings.googleOAuth.google_client_secret,
          callbackURL: settings.googleOAuth.google_callbackURL,
          passReqToCallback: true,
        },
        this.googleAuthHandler
      )
    );

    passport.use(
      new GoogleStrategy(
        {
          clientID: settings.googleOAuth.google_client_id,
          clientSecret: settings.googleOAuth.google_client_secret,
          callbackURL: settings.googleOAuth.google_callbackURL,
          passReqToCallback: true,
        },
        this.googleAuthHandlerRider
      )
    );

    //Apple Strategy
    // passport.use(
    //     new AppleStrategy(
    //       {
    //         clientID: settings.appleAuth.client_ID,
    //         authorizationURL: 'https://appleid.apple.com/auth/authorize',
    //         tokenURL: 'https://appleid.apple.com/auth/token',
    //         callbackURL: settings.appleAuth.apple_callbackURL,
    //         keyID: settings.appleAuth.key_ID,
    //         privateKeyLocation: settings.appleAuth.private_key_location,
    //         passReqToCallback: false
    //       },
    //       this.appleAuthHandler
    //     )
    //   );

    // Facebook Strategy
    passport.use(
      new FacebookStrategy(
        {
          clientID: settings.facebookAuth.client_ID,
          clientSecret: settings.facebookAuth.client_secret,
          callbackURL: settings.facebookAuth.facebook_callbackURL,
          passReqToCallback: true,
        },
        this.facebookAuthHandler
      )
    );

    passport.use(
      new FacebookStrategy(
        {
          clientID: settings.facebookAuth.client_ID,
          clientSecret: settings.facebookAuth.client_secret,
          callbackURL: settings.facebookAuth.facebook_callbackURL,
          passReqToCallback: true,
        },
        this.facebookAuthHandlerRider
      )
    );

    passport.serializeUser((user: any, done) => {
      // Serialize the user object and store it in the session
      done(null, user._id);
    });

    passport.deserializeUser(async (_id, done) => {
      try {
        const user = await datasources.customerDAOService.findById(_id);
        done(null, user);
      } catch (error) {
        done(error);
      }
    });
  }

  //customer
  googleAuthHandler = async (request: any, accessToken: any, refreshToken: any, profile: any, done: any) => {
    // Google authentication logic
    try {
        const user = await datasources.customerDAOService.findByAny({ googleId: profile.id });
        if (user) {
          // User already exists, return the user
          if(!user.active) {
            return done(null, false, { message: 'Account is disabled. Please contact the administrator.' });
          }

          const role = await datasources.roleDAOService.findByIdPopulatePermissions(user.roles);
          if(!role){
            return done(null, false, { message: 'Role is not found.' });
          }

          const permissions: any = [];
          
          for (const _permission of role.permissions) {
            permissions.push(_permission)
          }
      
          //generate JWT
          const jwt = Generic.generateJwt({
              userId: user._id,
              permissions
          });
          
          //update user authentication date and authentication token
          const updateValues = {
              loginDate: new Date(),
              loginToken: jwt
          };
      
          await datasources.customerDAOService.update({_id: user._id}, updateValues);

          return done(null, user);
        } else {
          // User does not exist, create a new user
          const role = await datasources.roleDAOService.findByAny({
            slug: settings.roles[2],
          });
          if (!role) {
            return done(null, false, { message: 'Role is not found.' });
          };

          const _customer = await datasources.customerDAOService.findByAny({email: profile.email})
          if (_customer) {
            return done(null, false, {
              message: 'A user with the email already exists. Please use a different email.'
            });
          };

          const customerValues: Partial<ICustomerModel> = {
            googleId: profile.id,
            roles: role._id,
            active: true,
            email: profile.email
          };

          const customer = await datasources.customerDAOService.create(
            customerValues as ICustomerModel
          );

          role.users.push(customer._id);
          await role.save();

          const permissions: any = [];
          
          for (const _permission of role.permissions) {
            permissions.push(_permission)
          }
      
          //generate JWT
          const jwt = Generic.generateJwt({
              userId: customer._id,
              permissions
          });
          
          //update user authentication date and authentication token
          const updateValues = {
              loginDate: new Date(),
              loginToken: jwt
          };
          await datasources.customerDAOService.update({_id: customer._id}, updateValues);

          return done(null, customer);
        }
      } catch (error: any) {
        return done(error.message);
      }
  };

  //rider
  googleAuthHandlerRider = async (request: any, accessToken: any, refreshToken: any, profile: any, done: any) => {
    // Google authentication logic
    try {
        const rider = await datasources.riderDAOService.findByAny({ googleId: profile.id });
        if (rider) {
          // rider already exists, return the rider
          if(!rider.active) {
            return done(null, false, { message: 'Account is disabled. Please contact the administrator.' });
          }

          const role = await datasources.roleDAOService.findByIdPopulatePermissions(rider.roles);
          if(!role){
            return done(null, false, { message: 'Role is not found.' });
          }

          const permissions: any = [];
          
          for (const _permission of role.permissions) {
            permissions.push(_permission)
          }
      
          //generate JWT
          const jwt = Generic.generateJwt({
              userId: rider._id,
              permissions
          });
          
          //update rider authentication date and authentication token
          const updateValues = {
              loginDate: new Date(),
              loginToken: jwt
          };
      
          await datasources.riderDAOService.update({_id: rider._id}, updateValues);

          return done(null, rider);
        } else {
          // Rider does not exist, create a new rider
          const role = await datasources.roleDAOService.findByAny({
            slug: settings.roles[3],
          });
          if (!role) {
            return done(null, false, { message: 'Role is not found.' });
          };

          const _rider = await datasources.riderDAOService.findByAny({email: profile.email})
          if (_rider) {
            return done(null, false, {
              message: 'A rider with the email already exists. Please use a different email.'
            });
          };

          const riderValues: Partial<IRiderModel> = {
            googleId: profile.id,
            roles: role._id,
            active: true,
            email: profile.email
          };

          const rider = await datasources.riderDAOService.create(
            riderValues as IRiderModel
          );

          role.users.push(rider._id);
          await role.save();

          const permissions: any = [];
          
          for (const _permission of role.permissions) {
            permissions.push(_permission)
          }
      
          //generate JWT
          const jwt = Generic.generateJwt({
              userId: rider._id,
              permissions
          });
          
          //update rider authentication date and authentication token
          const updateValues = {
              loginDate: new Date(),
              loginToken: jwt
          };
          await datasources.riderDAOService.update({_id: rider._id}, updateValues);

          return done(null, rider);
        }
      } catch (error: any) {
        return done(error.message);
      }
  };

//   appleAuthHandler = async (request: any, accessToken: any, refreshToken: any, profile: any, done: any) => {
//     // Apple authentication logic
//     try {
//         const user = await datasources.customerDAOService.findByAny({ googleId: profile.id });
//         if (user) {
//           // User already exists, return the user
//           if(!user.active) {
//             return done(null, false, { message: 'Account is disabled. Please contact the administrator.' });
//           }

//           const role = await datasources.roleDAOService.findByIdPopulatePermissions(user.roles);
//           if(!role){
//             return done(null, false, { message: 'Role is not found.' });
//           }

//           const permissions: any = [];
          
//           for (const _permission of role.permissions) {
//             permissions.push(_permission)
//           }
      
//           //generate JWT
//           const jwt = Generic.generateJwt({
//               userId: user._id,
//               permissions
//           });
          
//           //update user authentication date and authentication token
//           const updateValues = {
//               loginDate: new Date(),
//               loginToken: jwt
//           };
      
//           await datasources.customerDAOService.update({_id: user._id}, updateValues);

//           return done(null, user);
//         } else {
//           // User does not exist, create a new user
//           const role = await datasources.roleDAOService.findByAny({
//             slug: settings.roles[2],
//           });
//           if (!role) {
//             return done(null, false, { message: 'Role is not found.' });
//           };

//           const _customer = await datasources.customerDAOService.findByAny({email: profile.email})
//           if (_customer) {
//             return done(null, false, {
//               message: 'A user with the email already exists. Please use a different email.'
//             });
//           };

//           const customerValues: Partial<ICustomerModel> = {
//             googleId: profile.id,
//             roles: role._id,
//             active: true,
//             email: profile.email
//           };

//           const customer = await datasources.customerDAOService.create(
//             customerValues as ICustomerModel
//           );

//           role.users.push(customer._id);
//           await role.save();

//           const permissions: any = [];
          
//           for (const _permission of role.permissions) {
//             permissions.push(_permission)
//           }
      
//           //generate JWT
//           const jwt = Generic.generateJwt({
//               userId: customer._id,
//               permissions
//           });
          
//           //update user authentication date and authentication token
//           const updateValues = {
//               loginDate: new Date(),
//               loginToken: jwt
//           };
//           await datasources.customerDAOService.update({_id: customer._id}, updateValues);

//           return done(null, customer);
//         }
//       } catch (error: any) {
//         return done(error.message);
//       }
//   };


  facebookAuthHandler = async (accessToken: any, refreshToken: any, profile: any, cb: any) => {
    // Facebook authentication logic
    try {
        console.log(cb(), 'function cb')
        const user = await datasources.customerDAOService.findByAny({ facebookId: profile.id });
        if (user) {
          // User already exists, return the user
          if(!user.active) {
            return cb(null, false, { message: 'Account is disabled. Please contact the administrator.' });
          }

          const role = await datasources.roleDAOService.findByIdPopulatePermissions(user.roles);
          if(!role){
            return cb(null, false, { message: 'Role is not found.' });
          }

          const permissions: any = [];
          
          for (const _permission of role.permissions) {
            permissions.push(_permission)
          }
      
          //generate JWT
          const jwt = Generic.generateJwt({
              userId: user._id,
              permissions
          });
          
          //update user authentication date and authentication token
          const updateValues = {
              loginDate: new Date(),
              loginToken: jwt
          };
      
          await datasources.customerDAOService.update({_id: user._id}, updateValues);

          return cb(null, user);
        } else {
          // User does not exist, create a new user
          const role = await datasources.roleDAOService.findByAny({
            slug: settings.roles[2],
          });
          if (!role) {
            // return cb(null, false, { message: 'Role is not found.' });
            return console.log('role not found')
          };

          const _customer = await datasources.customerDAOService.findByAny({email: profile.email})
          if (_customer) {
            // return cb(null, false, {
            //   message: 'A user with the email already exists. Please use a different email.'
            // });
            return console.log('A user exist')
          };

          const customerValues: Partial<ICustomerModel> = {
            facebookId: profile.id,
            roles: role._id,
            active: true,
            email: profile.email
          };

          const customer = await datasources.customerDAOService.create(
            customerValues as ICustomerModel
          );

          role.users.push(customer._id);
          await role.save();

          const permissions: any = [];
          
          for (const _permission of role.permissions) {
            permissions.push(_permission)
          }
      
          //generate JWT
          const jwt = Generic.generateJwt({
              userId: customer._id,
              permissions
          });
          
          //update user authentication date and authentication token
          const updateValues = {
              loginDate: new Date(),
              loginToken: jwt
          };
          await datasources.customerDAOService.update({_id: customer._id}, updateValues);

          return cb(null, customer);
        }
      } catch (error: any) {
        return cb(error.message);
      }
  };

  //rider
  facebookAuthHandlerRider = async (accessToken: any, refreshToken: any, profile: any, cb: any) => {
    // Facebook authentication logic
    try {
        const rider = await datasources.riderDAOService.findByAny({ facebookId: profile.id });
        if (rider) {
          // rider already exists, return the rider
          if(!rider.active) {
            return cb(null, false, { message: 'Account is disabled. Please contact the administrator.' });
          }

          const role = await datasources.roleDAOService.findByIdPopulatePermissions(rider.roles);
          if(!role){
            return cb(null, false, { message: 'Role is not found.' });
          }

          const permissions: any = [];
          
          for (const _permission of role.permissions) {
            permissions.push(_permission)
          }
      
          //generate JWT
          const jwt = Generic.generateJwt({
              userId: rider._id,
              permissions
          });
          
          //update rider authentication date and authentication token
          const updateValues = {
              loginDate: new Date(),
              loginToken: jwt
          };
      
          await datasources.riderDAOService.update({_id: rider._id}, updateValues);

          return cb(null, rider);
        } else {
          // Rider does not exist, create a new rider
          const role = await datasources.roleDAOService.findByAny({
            slug: settings.roles[3],
          });
          if (!role) {
            // return cb(null, false, { message: 'Role is not found.' });
            return console.log('role not found')
          };

          const _rider = await datasources.riderDAOService.findByAny({email: profile.email})
          if (_rider) {
            return cb(null, false, {
              message: 'A rider with the email already exists. Please use a different email.'
            });
            // return console.log('A user exist')
          };

          const riderValues: Partial<IRiderModel> = {
            facebookId: profile.id,
            roles: role._id,
            active: true,
            email: profile.email
          };

          const rider = await datasources.riderDAOService.create(
            riderValues as IRiderModel
          );

          role.users.push(rider._id);
          await role.save();

          const permissions: any = [];
          
          for (const _permission of role.permissions) {
            permissions.push(_permission)
          }
      
          //generate JWT
          const jwt = Generic.generateJwt({
              userId: rider._id,
              permissions
          });
          
          //update user authentication date and authentication token
          const updateValues = {
              loginDate: new Date(),
              loginToken: jwt
          };
          await datasources.riderDAOService.update({_id: rider._id}, updateValues);

          return cb(null, rider);
        }
      } catch (error: any) {
        return cb(error.message);
      }
  };

  authenticateGoogle() {
    return passport.authenticate('google', { scope: ['email', 'profile'] });
  }

//   authenticateApple() {
//     return passport.authenticate('apple');
//   }

  authenticateFacebook() {
    return passport.authenticate('facebook', { scope: ['email'] });
  }

  handleGoogleCallback() {
    return passport.authenticate('google', {
      successRedirect: '/success',
      failureRedirect: '/api/v1/google/failed',
    });
  }

//   handleAppleCallback() {
//     return passport.authenticate('apple', { failureRedirect: '/api/v1/google/failed' }),
//     function(req: Request, res: Response) {
//         // Successful authentication, redirect home.
//         res.redirect('/apple-success');
//     };
//   }

  handleFacebookCallback() {
    return passport.authenticate('facebook', {
      failureRedirect: '/api/v1/google/failed',
      successRedirect: '/facebook-success',
    });
  }
  
}

const authService = new AuthService();
export default authService;
