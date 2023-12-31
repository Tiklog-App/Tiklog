import settings from './settings';
import { appCommonTypes } from '../@types/app-common';
import mongoose from 'mongoose';
import DatabaseEnv = appCommonTypes.DatabaseEnv;

const env = process.env.NODE_ENV as DatabaseEnv;

export const mongoUrl = <string>settings.mongo[env].host;

const database = {
  mongodb: async () => {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUrl);
    console.log('MongoDB Connected Successfully');
  },
  mongoUrl
};

export default database;
