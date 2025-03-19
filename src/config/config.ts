import 'dotenv/config';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['production', 'development', 'test']),
    PORT: z.coerce.number().default(3000),
    MONGODB_URL: z.string(),
    JWT_SECRET: z.string(),
    JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().default(30),
    JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().default(30),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z.coerce.number().default(10),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z.coerce.number().default(10),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USERNAME: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string(),
    CLIENT_URL: z.string(),
  })
  .passthrough();

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  throw new Error(`Config validation error: ${envVars.error.errors[0]?.message}`);
}

const config = {
  APPLICATION_NAME: 'Sync-Workbench',
  versionPrefix: '/v1/',
  env: envVars.data.NODE_ENV,
  port: envVars.data.PORT,
  defaultPagination: {
    page: 1,
    limit: 10,
  },
  httpMethodToActionMap: {
    GET: 'read',
    POST: 'create',
    PUT: 'update',
    DELETE: 'delete',
    PATCH: 'update',
  } as Record<string, string>,
  mongoose: {
    url: envVars.data.MONGODB_URL + (envVars.data.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.data.JWT_SECRET,
    accessExpirationMinutes: envVars.data.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.data.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.data.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.data.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    cookieOptions: {
      httpOnly: true,
      secure: envVars.data.NODE_ENV === 'production',
      signed: true,
    },
  },
  email: {
    smtp: {
      host: envVars.data.SMTP_HOST,
      port: envVars.data.SMTP_PORT,
      auth: {
        user: envVars.data.SMTP_USERNAME,
        pass: envVars.data.SMTP_PASSWORD,
      },
    },
    from: envVars.data.EMAIL_FROM,
  },
  clientUrl: envVars.data.CLIENT_URL,
  API_DOCS_URL: '/api-docs',
};

export default config;
