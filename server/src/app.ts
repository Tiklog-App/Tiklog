import express, { json, static as _static } from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import settings from './config/settings';
import globalExceptionHandler from './middleware/globalExceptionHandler';
import router from './routes';
import session from 'express-session';
import passport from 'passport';
require('./services/PassportService');

const app = express();
export const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://localhost:3001',
    <string>process.env.CLIENT_URL
  ],
  credentials: true,
};

app.use(helmet());
app.use(cookieParser(settings.cookie.secret));
app.use(cors(corsOptions)); //handle cors operations
app.use(json()); // Parse incoming requests data
app.use(morgan('dev')); //Route debugger
app.use(session({
  secret: 'tikLog_app',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', _static(path.resolve('uploads')));

app.use(`${settings.service.apiRoot}`, router); //All routes middleware

app.use(globalExceptionHandler); //Handle error globally

export default app;
