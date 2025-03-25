import { jwtStrategy } from '@/modules/auth';
import { ApiError, ErrorCode, errorConverter, errorHandler } from '@/modules/errors';
import { logErrorHandler, logSuccessHandler } from '@/modules/logger';
import compression from 'compression';
import cors from 'cors';
import express, { Express } from 'express';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import httpStatus from 'http-status';
import passport from 'passport';
import path from 'path';
import xss from 'xss-clean';
import config from './config/config';
import { authLimiter } from './modules/utils/rate-limiter';
import routes from './routes/v1';

const app: Express = express();

if (config.env !== 'test') {
  app.use(logSuccessHandler);
  app.use(logErrorHandler);
}

// set security HTTP headers
app.use(helmet());

// enable cors
app.use(cors());
app.options('*', cors());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(ExpressMongoSanitize());

// gzip compression
app.use(compression());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

app.use(express.static(path.join(__dirname, '..', '../public')));
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// v1 api routes
app.use('/v1', routes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: `${config?.APPLICATION_NAME} service is up` });
});

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
  next(
    new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      code: ErrorCode.NOT_FOUND,
      message: 'Not Found',
    }),
  );
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
