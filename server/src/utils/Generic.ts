import path from 'node:path';
import fs from 'fs/promises';

import { v4 } from 'uuid';
import moment, { Moment } from 'moment';
import camelcase from 'camelcase';
import { sign } from 'jsonwebtoken';
import crypto from  'crypto';

import settings from '../config/settings';
import { appCommonTypes } from '../@types/app-common';
import CustomJwtPayload = appCommonTypes.CustomJwtPayload;

interface IGetImagePath {
  basePath: string;
  filename: string;
  tempPath: string;
}

interface IRandomize {
  number?: boolean;
  alphanumeric?: boolean;
  string?: boolean;
  mixed?: boolean;
  count?: number;
}

interface Expense {
  expenseCode: string;
}

interface IFuncIntervalCallerConfig {
  //call your functions here
  onTick: (args: this) => void | Promise<void>;
  // Number of times the function 'onTick' should run
  attempts: number;
  //Call interval. Should be in milliseconds e.g 60 * 1000
  interval: number;
  // reset the interval, until a condition is met
  reset?: boolean;
  //stop the interval
  stop?: boolean;

  //log the interval count
  log?: (args: { count: number; options: IFuncIntervalCallerConfig }) => void;
}

export default class Generic {
  public static functionIntervalCaller(config: IFuncIntervalCallerConfig) {
    const start = config.interval;
    const stop = config.attempts * start;
    const cycle = stop / start;
    let count = 0;

    const run = () => {
      const interval = setInterval(() => {
        if (config.reset) {
          clearInterval(interval);
          run();
        }

        count++;

        if (config.stop) clearInterval(interval);

        if (count >= cycle) clearInterval(interval);

        config.onTick(config);

        if (config.log) config.log({ count, options: config });
      }, start);
    };

    run();
  }

  public static location_difference(senderLat: number, senderLon: number, recipientLat: number, recipientLon: number, speed: number) {
    const earthRadius = 6371;

    // Convert latitude and longitude to radians
    const senderLatRadians = this.toRadians(senderLat) as any;
    const senderLonRadians = this.toRadians(senderLon) as any;
    const recipientLatRadians = this.toRadians(recipientLat) as any;
    const recipientLonRadians = this.toRadians(recipientLon) as any;

    // Calculate the differences between the latitudes and longitudes
    const latDiff = recipientLatRadians - senderLatRadians;
    const lonDiff = recipientLonRadians - senderLonRadians;

    // Apply the Haversine formula
    const a =
      Math.sin(latDiff / 2) ** 2 +
      Math.cos(senderLatRadians) * Math.cos(recipientLatRadians) * Math.sin(lonDiff / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance
    const distance = earthRadius * c;

     // Calculate the time in hours and minutes
    const timeInHours = distance / speed;
    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);
    console.log(typeof hours, typeof minutes, 'checkws')
    const dateTime = new Date();
    dateTime.setHours(dateTime.getHours() + hours);
    dateTime.setMinutes(dateTime.getMinutes() + minutes);
 
    // Format the date-time string
    // const formattedDateTime = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDateTime = dateTime.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return { distance, hours, minutes, time: formattedDateTime };
  }

  private static toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  public static async fileExist(path: string) {
    try {
      await fs.access(path);
      return true;
    } catch (e) {
      return false;
    }
  }

  public static capitalizeWord (sentence: string): string {
    const words = sentence?.split(' ');
    const capitalizedWords = words?.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords?.join(' ');
  }

  public static async getImagePath(params: IGetImagePath) {
    const exists = await this.fileExist(params.basePath);

    if (!exists) await fs.mkdir(params.basePath);

    const newFileName = `${v4()}${path.extname(params.filename)}`;

    const newPath = `${params.basePath}/${newFileName}`;

    await fs.rename(params.tempPath, newPath);

    return newPath;
  }

  /**
   * @name generateJwt
   * @param payload
   * @desc
   * Generate jsonwebtoken.
   */
  public static generateJwt(payload: CustomJwtPayload) {
    const key = <string>settings.jwt.key;
    return sign(payload, key);
  }

  public static generateRandomString(limit: number) {
    const letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz@#!$%^&+=';
    let randomString = '';
    for (let i = 0; i < limit; i++) {
      const randomNum = Math.floor(Math.random() * letters.length);
      randomString += letters.substring(randomNum, randomNum + 1);
    }

    return randomString;
  }

  public static generateRandomStringCrypto(limit: number) {
    const letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz@#!$%^&+=';
    const letterCount = letters.length;
    const randomBytes = crypto.randomBytes(limit);
    let randomString = '';
    for (let i = 0; i < limit; i++) {
      const randomNum = randomBytes[i] % letterCount;
      randomString += letters[randomNum];
    }
    return randomString;
  }

  public static generatePaymentRefNumber(limit: number) {
    const letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ';
    const letterCount = letters.length;
    const randomBytes = crypto.randomBytes(limit);
    let randomString = 'REF_';
    for (let i = 0; i < limit; i++) {
      const randomNum = randomBytes[i] % letterCount;
      randomString += letters[randomNum];
    }
    return randomString;
  }

  public static generateDeliveryRefNumber(limit: number) {
    const letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ';
    const letterCount = letters.length;
    const randomBytes = crypto.randomBytes(limit);
    let randomString = 'REF_';
    for (let i = 0; i < limit; i++) {
      const randomNum = randomBytes[i] % letterCount;
      randomString += letters[randomNum];
    }
    return randomString;
  }

  public static generatePasswordResetCode(limit: number) {
    const letters = '0123456789';
    const letterCount = letters.length;
    const randomBytes = crypto.randomBytes(limit);
    let randomString = '';
    for (let i = 0; i < limit; i++) {
      const randomNum = randomBytes[i] % letterCount;
      randomString += letters[randomNum];
    }
    return randomString;
  }

  /**
   * @name randomize
   * @description generate random chars (string,numbers,special characters, or mixed)
   * @description default count is 10 and result is numbers if no options are passed
   * @param options
   */
  public static randomize(options?: IRandomize) {
    const numbers = '01234567890123456789012345678901234567890123456789';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    const specialChars = '@#!$%^&+=*()<>_-?|.';

    let text = numbers;
    let count = 10;
    let result = '';

    if (options?.count) count = options.count;
    if (options?.number) text = numbers;
    if (options?.string) text = letters;
    if (options?.mixed) text = numbers + letters + specialChars;
    if (options?.alphanumeric) text = letters + numbers;

    for (let i = 0; i < count; i++) {
      const randomNum = Math.floor(Math.random() * text.length);
      result += text.substring(randomNum, randomNum + 1);
    }

    return result;
  }

  public static generateCode(data: any, prefix: string, id: number): string {

    let count = data.length + 1;
    let code: string;

    do {
      code = `${prefix}-${id}${count.toString().padStart(4, '0')}`;
      count++;
    } while (data.some((expense: any) => expense.code === code));

    return code;

  }

  public static convertTextToCamelcase(text: string) {
    text = text.replace(/[^a-zA-Z0-9 ]/g, '');
    return camelcase(text);
  }

  public static formatNumberToIntl(number: number) {
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 2,
    }).format(number);
  }

  public static generateSlug(text: string) {
    text = text.trim();

    if (text.search(/\s/g) !== -1) {
      return text.toUpperCase().replace(/\s/g, '_');
    }
    return text.toUpperCase();
  }

  public static calculateDiscount(principal: number, discount: number) {
    return principal - principal * (discount / 100);
  }

  public static getMonths() {
    return [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
  }

  public static nextServiceDate(lastDate: string, serviceIntervalUnit: string, serviceInterval: string ){
      const serviceDate = new Date(lastDate);

      let result: any;
      if (serviceIntervalUnit === 'month') {
        serviceDate.setMonth(serviceDate.getMonth() + parseInt(serviceInterval));
      } else if (serviceIntervalUnit === 'day') {
        serviceDate.setDate(serviceDate.getDate() + parseInt(serviceInterval));
      } else if (serviceIntervalUnit === 'week') {
        serviceDate.setDate(serviceDate.getDate() + (parseInt(serviceInterval) * 7));
      } else if (serviceIntervalUnit === 'year') {
        serviceDate.setFullYear(serviceDate.getFullYear() + parseInt(serviceInterval));
      } else {
        return console.log('Wrong date')
      }

      // Adjust for leap year if necessary
      const originalYear = serviceDate.getFullYear();
      const isLeapYear = (year: any) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const isServiceDateLeapYear = isLeapYear(originalYear);

      if (isServiceDateLeapYear) {
        if (!isLeapYear(serviceDate.getFullYear())) {
          // Adjust for day when moving from a leap year to a non-leap year
          serviceDate.setDate(serviceDate.getDate() - 1);
        }
      } else {
        if (isLeapYear(serviceDate.getFullYear())) {
          // Adjust for day when moving from a non-leap year to a leap year
          serviceDate.setDate(serviceDate.getDate() + 1);
        }
      }
      // serviceDate.setDate(serviceDate.getDate() + 1);
      result = serviceDate.toISOString().slice(0, 10);
      return result;
  }


  public static reminderStatus(startDate: string, endDate: string, serviceIntervalUnit: string, serviceInterval: any ) {
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const currYear = currentDate.getFullYear();
    const currMonth = currentDate.getMonth();
    const currDay = currentDate.getDate()

    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const startDay = start.getDate()

    const endYear = end.getFullYear();
    const endMonth = end.getMonth();
    const endDay = end.getDate()

    if(currYear < startYear && currMonth < startMonth && currDay < startDay) {
      return 'Date is not within range';
    }
    if(currYear > endYear && currMonth > endMonth && currDay > endDay) {
      return 'Date is not within range';
    }

    const futureDateLimit = new Date() === new Date(start) ? new Date() : new Date(start);
    const interval = parseInt(serviceInterval);

    if (serviceIntervalUnit === 'month') {
      futureDateLimit.setMonth(futureDateLimit.getMonth() + interval);
    } else if (serviceIntervalUnit === 'week') {
      futureDateLimit.setDate(futureDateLimit.getDate() + (7 * interval));
    } else if (serviceIntervalUnit === 'day') {
      futureDateLimit.setDate(futureDateLimit.getDate() + interval);
    }

    if (currentDate <= futureDateLimit) {
      const milliseconds = futureDateLimit.getTime() - currentDate.getTime();
      console.log(milliseconds, 'checks seconds')
      if (milliseconds > 2678400000) {
        const diffMonths = Math.floor(milliseconds / (30 * 24 * 60 * 60 * 1000));
        return `Due in [${diffMonths}] month(s)`;
      } else if (milliseconds > 604800000) {
        const diffWeeks = Math.floor(milliseconds / (7 * 24 * 60 * 60 * 1000));
        return `Due in [${diffWeeks}] week(s)`;
      } else {
        const diffDays = Math.round(milliseconds / (24 * 60 * 60 * 1000));

        if(diffDays >= 1){
          return `Due in [${diffDays}] day(s)`;
        } else if(diffDays < 1){
          return `Due today`
        }
      }
    } else {
      const currentDateYear = currentDate.getFullYear();
      const currentDateMonth = currentDate.getMonth();
      const currentDateDay = currentDate.getDate();

      const futureDateLimitYear = futureDateLimit.getFullYear();
      const futureDateLimitMonth = futureDateLimit.getMonth();
      const futureDateLimitDay = futureDateLimit.getDate();

      if (
        currentDateYear === futureDateLimitYear &&
        currentDateMonth === futureDateLimitMonth &&
        currentDateDay === futureDateLimitDay
      ) {
        return `Due today`;
      } else {
        const milliseconds = currentDate.getTime() - futureDateLimit.getTime();
        if (milliseconds > 2678400000) {
          const diffMonths = Math.floor(milliseconds / (30 * 24 * 60 * 60 * 1000));
          return `Overdue by [${diffMonths}] month(s)`;
        } else if (milliseconds > 604800000) {
          const diffWeeks = Math.floor(milliseconds / (7 * 24 * 60 * 60 * 1000));
          return `Overdue by [${diffWeeks}] week(s)`;
        } else {
          const diffDays = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
          return `Overdue by [${diffDays}] day(s)`;
        }
      }
    }
  }

}
