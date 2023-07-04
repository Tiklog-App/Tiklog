import express, { json, static as _static } from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
// import swaggerJsdoc from 'swagger-jsdoc';
// import { serve, setup } from 'swagger-ui-express';
import cookieParser from 'cookie-parser';

import settings from './config/settings';
import globalExceptionHandler from './middleware/globalExceptionHandler';
// import config from './config';
import router from './routes';
import session from 'express-session';
// import passport from './utils/PassportConfig';
import passport from 'passport';
import authService from './services/AuthService';

const app = express();
// const openapiSpecification = swaggerJsdoc(config.swagger); //configure swagger API documentation
export const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    <string>process.env.CLIENT_URL
  ],
  credentials: true,
};

app.use(helmet());
app.use(cookieParser(settings.cookie.secret));
app.use(cors(corsOptions)); //handle cors operations
app.use(json()); // Parse incoming requests data
app.use(morgan('dev')); //Route debugger
authService.initialize();
app.use(session({
  secret: 'tikLog',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', _static(path.resolve('uploads')));

// Route API documentation
// app.use(`${settings.service.apiRoot}/docs`, serve, setup(openapiSpecification));

app.use(`${settings.service.apiRoot}`, router); //All routes middleware

app.use(globalExceptionHandler); //Handle error globally

export default app;
