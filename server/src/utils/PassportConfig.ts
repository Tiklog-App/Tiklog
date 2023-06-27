import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import datasources from '../services/dao';
import CustomAPIError from '../exceptions/CustomAPIError';
import settings from '../config/settings';
import HttpStatus from '../helpers/HttpStatus';
import { ICustomerModel } from '../models/Customer';
import Generic from './Generic';

passport.use(
  new GoogleStrategy(
    {
      clientID: settings.googleOAuth.google_client_id,
      clientSecret: settings.googleOAuth.google_client_secret,
      callbackURL: 'http://localhost:5050/api/v1/google/callback',
      passReqToCallback: true,
    },
    function (request: any, accessToken: any, refreshToken: any, profile: any, done: any) {
      // Wrap the callback function in an async function
      // and use await for asynchronous operations
      (async () => {
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

            return done(null, customer);
          }
        } catch (error: any) {
          return done(error.message);
        }
      })().catch(done);
    }
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

export default passport;