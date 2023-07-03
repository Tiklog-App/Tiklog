import { appCommonTypes } from '../@types/app-common';
import AppSettings = appCommonTypes.AppSettings;

export const MANAGE_ALL = 'manage_all';
export const MANAGE_SOME = 'manage_some';
export const CUSTOMER_PERMISSION = 'customer_permission'
export const RIDER_PERMISSION = 'rider_permission';

export const CREATE_USER = 'create_user';
export const READ_USER = 'read_user';
export const UPDATE_USER = 'update_user';
export const DELETE_USER = 'delete_user';

export const CREATE_CUSTOMER = 'create_customer';
export const READ_CUSTOMER = 'read_customer';
export const UPDATE_CUSTOMER = 'update_customer';
export const DELETE_CUSTOMER = 'delete_customer';

export const CREATE_RIDER = 'create_rider';
export const READ_RIDER = 'read_rider';
export const UPDATE_RIDER = 'update_rider';
export const DELETE_RIDER = 'delete_rider';

export const CREATE_PACKAGE = 'create_package';
export const DELETE_PACKAGE = 'delete_package';

export const READ_TRANSACTION = 'read_transaction'

export const READ_DELIVERY = 'read_delivery';
export const DELETE_DELIVERY = 'delete_delivery';

export const READ_VEHICLE = 'read_vehicle';
export const CREATE_VEHICLE_TYPE = 'create_vehicle_type';
export const DELETE_VEHICLE_TYPE = 'delete_vehicle_type';
export const READ_VEHICLE_TYPE = 'read_vehicle_type';

export const CREATE_VEHICLE_NAME = 'create_vehicle_name';
export const DELETE_VEHICLE_NAME = 'delete_vehicle_name';
export const READ_VEHICLE_NAME = 'read_vehicle_name';
export const UPDATE_VEHICLE_NAME = 'update_vehicle_name';

const settings: AppSettings = {
  twilio: {
    twilioSid: <string>process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: <string>process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: <string>process.env.TWILIO_PHONE_NUMBER
  },
  nodemailer: {
    email: <string>process.env.NODEMAILER_EMAIL_ADDRESS,
    password: <string>process.env.NODEMAILER_EMAIL_PASSWORD,
    service: <string>process.env.NODEMAILER_SERVICE
  },
  googleOAuth: {
    google_client_id: <string>process.env.GOOGLE_CLIENT_ID,
    google_client_secret: <string>process.env.GOOGLE_CLIENT_SECRET,
    google_callbackURL: <string>process.env.GOOGLE_AUTH_CALLBACKURL
  },
  appleAuth: {
    client_ID: <string>process.env.APPLE_CLIENT_ID,
    team_ID: <string>process.env.APPLE_TEAM_ID,
    apple_callbackURL: <string>process.env.APPLE_CALLBACKURL,
    key_ID: <string>process.env.APPLE_KEY_ID,
    private_key_location: <string>process.env.PRIVATE_KEY_LOCATION
  },
  facebookAuth: {
    client_ID: <string>process.env.FACEBOOK_CLIENT_ID,
    client_secret: <string>process.env.FACEBOOK_CLIENT_SECRET,
    facebook_callbackURL: <string>process.env.FACEBOOK_CALLBACKURL
  },
  googleOAuthRider: {
    google_client_r_id: <string>process.env.GOOGLE_CLIENT_ID,
    google_client_r_secret: <string>process.env.GOOGLE_CLIENT_SECRET,
    google_r_callbackURL: <string>process.env.GOOGLE_AUTH_CALLBACKURL_RIDER
  },
  facebookAuthRider: {
    client_r_ID: <string>process.env.FACEBOOK_CLIENT_ID,
    client_r_secret: <string>process.env.FACEBOOK_CLIENT_SECRET,
    facebook_r_callbackURL: <string>process.env.FACEBOOK_CALLBACKURL_RIDER
  },
  rabbitMq: {
    connection: <string>process.env.AMQP_CONNECT
  },
  cookie: { name: process.env.COOKIE_AUTH as string, secret: process.env.COOKIE_AUTH as string },
  permissions: [
    MANAGE_ALL,
    MANAGE_SOME,

    CUSTOMER_PERMISSION,
    RIDER_PERMISSION,

    CREATE_USER,
    READ_USER,
    UPDATE_USER,
    DELETE_USER,

    CREATE_CUSTOMER,
    READ_CUSTOMER,
    UPDATE_CUSTOMER,
    DELETE_CUSTOMER,

    CREATE_RIDER,
    READ_RIDER,
    UPDATE_RIDER,
    DELETE_RIDER,
    
    CREATE_PACKAGE,
    DELETE_PACKAGE,

    READ_TRANSACTION,
    DELETE_DELIVERY,

    READ_VEHICLE,
    CREATE_VEHICLE_TYPE,
    DELETE_VEHICLE_TYPE,
    READ_VEHICLE_TYPE,

    CREATE_VEHICLE_NAME,
    DELETE_VEHICLE_NAME,
    READ_VEHICLE_NAME,
    UPDATE_VEHICLE_NAME
  ],
  roles: [
    'SUPER_ADMIN_ROLE',
    'ADMIN_ROLE',
    'CUSTOMER_ROLE',
    'RIDER_ROLE'
  ],
  queue: {
    development: {
      host: <string>process.env.QUEUE_CONN_URL,
    },
    production: {
      host: <string>process.env.QUEUE_CONN_URL,
    },
    test: {
      host: <string>process.env.QUEUE_CONN_URL,
    },
  },
  jwt: {
    key: <string>process.env.JWT_KEY,
    expiry: <string>process.env.JWT_EXPIRY,
  },
  redis: {
    development: {
      database: <string>process.env.REDIS_DEV_DB_NAME,
      host: <string>process.env.REDIS_HOST,
      username: <string>process.env.REDIS_USERNAME,
      password: <string>process.env.REDIS_PASSWORD,
      port: <string>process.env.REDIS_PORT,
    },
    production: {
      database: <string>process.env.REDIS_PROD_DB_NAME,
      host: <string>process.env.REDIS_HOST,
      username: <string>process.env.REDIS_USERNAME,
      password: <string>process.env.REDIS_PASSWORD,
      port: <string>process.env.REDIS_PORT,
    },
    test: {
      database: <string>process.env.REDIS_TEST_DB_NAME,
      host: <string>process.env.REDIS_HOST,
      username: <string>process.env.REDIS_USERNAME,
      password: <string>process.env.REDIS_PASSWORD,
      port: <string>process.env.REDIS_PORT,
    },
  },
  mongo: {
    development: {
      host: <string>process.env.MONGO_DEV_HOST,
      port: process.env.MONGO_PORT
    },
    production: {
      host: <string>process.env.MONGO_PROD_HOST,
      port: process.env.MONGO_PORT
    },
    test: {
      host: <string>process.env.MONGO_TEST_HOST,
      port: process.env.MONGO_PORT
    },
  },
  service: {
    env: <string>process.env.NODE_ENV,
    port: <string>process.env.PORT,
    apiRoot: <string>process.env.ROOT_API,
  },
};

export default settings;
