import app from '@/app';
import util from 'util';
import config from './config/config';
import SafeMongooseConnection from './modules/db-connection';
import { logger } from './modules/logger';

const PORT = config.port || 4000;

const debugCallback =
  config.env === 'development'
    ? (collectionName: string, method: string, query: any, _doc: string) => {
        const message = `${collectionName}.${method}(${util.inspect(query, {
          colors: true,
          depth: null,
        })})`;
        logger.log({
          level: 'verbose',
          message,
          consoleLoggerOptions: { label: 'MONGO' },
        });
      }
    : undefined;

const safeMongooseConnection = new SafeMongooseConnection({
  mongoUrl: config.mongoose.url ?? '',
  ...(debugCallback && { debugCallback }),
  onStartConnection: (mongoUrl) => logger.info(`Connecting to MongoDB at ${mongoUrl}`),
  onConnectionError: (error, mongoUrl) =>
    logger.log({
      level: 'error',
      message: `Could not connect to MongoDB at ${mongoUrl}`,
      error,
    }),
  onConnectionRetry: (mongoUrl) => logger.info(`Retrying to MongoDB at ${mongoUrl}`),
});

const serve = () =>
  app.listen(PORT, () => {
    logger.info(`EXPRESS server started at http://localhost:${PORT}`);

    if (config.env === 'development') {
      // This route is only present in development mode
      logger.info(`SWAGGER UI hosted at http://localhost:${PORT}/dev/api-docs`);
    }
  });

if (config.mongoose.url == null) {
  logger.error(
    'DB_CONNECTION_URL not specified in environment',
    new Error('DB_CONNECTION_URL not specified in environment'),
  );
  process.exit(1);
} else {
  safeMongooseConnection.connect((mongoUrl) => {
    logger.info(`Connected to MongoDB at ${mongoUrl}`);
    serve();
  });
}

// Close the Mongoose connection, when receiving SIGINT
process.on('SIGINT', async () => {
  console.log('\n');
  logger.info('Gracefully shutting down');
  logger.info('Closing the MongoDB connection');
  try {
    await safeMongooseConnection.close(true);
    logger.info('Mongo connection closed successfully');
  } catch (err) {
    logger.log({
      level: 'error',
      message: 'Error shutting closing mongo connection',
      error: err,
    });
  }
  process.exit(0);
});
