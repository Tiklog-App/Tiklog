import { appCommonTypes } from '../@types/app-common';
import QueueEvents = appCommonTypes.QueueEvents;

  export const MESSAGES = {
    http: {
      200: 'Ok',
      201: 'Accepted',
      202: 'Created',
      400: 'Bad Request. Please Contact Support.',
      401: 'You Are Not Authenticated. Please Contact Support.',
      403: 'You Are Forbidden From Accessing This Resource.',
      404: 'Not Found. Please Contact Support.',
      500: 'Something Went Wrong. Please Contact Support.',
    },
  };

  export const LOG_LEVEL_COLORS = {
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
  };

  export const QUEUE_EVENTS: QueueEvents = {
    name: 'DEFAULT',
  };

  export const PASSWORD_PATTERN = '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#!$%^&+=])(?=\\S+$).{8,20}$';

  export const UPLOAD_BASE_PATH = 'uploads';
  export const HOME_ADDRESS = 'HOME';
  export const OFFICE_ADDRESS = 'OFFICE';
  export const PENDING = 'pending';
  export const ON_TRANSIT = 'on_transit';
  export const DELIVERED = 'delivered';
  export const CANCELED = 'canceled';

  export const RIDER_STATUS_PENDING = 'pending';
  export const RIDER_STATUS_ONLINE = 'online';
  export const RIDER_STATUS_OFFLINE = 'offline';

  export const PRICE_PER_KM_BIKE = 150;
  export const PRICE_PER_KM_CAR = 200;
  export const PRICE_PER_KM_BUS = 250;
  export const AVERAGE_PRICE_PER_KM = 250;

  export const BIKE_SPEED = 60;
  export const CAR_SPEED = 50;
  export const BUS_SPEED = 40;
  export const AVERAGE_SPEED = 40;

  export const MAX_DISTANCE = 1000 //in km

  export const EXPIRATION_AMQP_MESSAGE = 5000;
  export const PACKAGE_REQUEST = 'package_requests';
  export const DRIVER_RESPONSES = 'driver_responses';

  export const CREATE_USER_ = 'event:CREATE_USER';
  export const UPDATE_USER_ = 'event:UPDATE_USER_';
  export const UPDATE_USER_STATUS_ = 'event:UPDATE_USER_STATUS_';
  export const DELETE_USER_ = 'event:DELETE_USER';
  export const CHANGE_USER_PASSWORD = 'event:CHANGE_USER_PASSWORD';
  export const CREATE_ROLE = 'event:CREATE_ROLE';
  export const UPDATE_CUSTOMER_ = 'event:UPDATE_CUSTOMER_';
  export const UPDATE_CUSTOMER_STATUS_ = 'event:UPDATE_CUSTOMER_STATUS_';
  export const DELETE_CUSTOMER_ = 'event:DELETE_CUSTOMER';
  export const CHANGE_CUSTOMER_PASSWORD = 'event:CHANGE_CUSTOMER_PASSWORD';
  export const CHANGE_RIDER_PASSWORD = 'event:CHANGE_RIDER_PASSWORD';
  export const VERIFY_TRANSACTION = 'event:VERIFY_TRANSACTION';
  export const INIT_TRANSACTION = 'event:INIT_TRANSACTION';
  export const CREATE_DELIVERY = 'event:CREATE_DELIVERY';
  export const EDIT_DELIVERY = 'event:EDIT_DELIVERY';
  export const UPDATE_RIDER_ = 'event:UPDATE_RIDER_';
  export const UPDATE_RIDER_STATUS_ = 'event:UPDATE_RIDER_STATUS_';
  export const DELETE_RIDER_ = 'event:DELETE_RIDER';
  export const CREATE_VEHICLE = 'event:CREATE_VEHICLE';
  export const UPDATE_VEHICLE = 'event:UPDATE_VEHICLE';
  
  export const PAYMENT_CHANNELS = ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer', 'eft'];