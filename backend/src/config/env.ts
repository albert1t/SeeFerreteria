import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const booleanFromString = (defaultValue: boolean) =>
  z.preprocess((val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === '1') return true;
    if (val === 'false' || val === '0') return false;
    return defaultValue;
  }, z.boolean()).default(defaultValue);

const envSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  AZURE_AD_TENANT_ID: z.string().optional(),
  AZURE_AD_CLIENT_ID: z.string().optional(),
  AZURE_BLOB_SAS_URL: z.string().url('AZURE_BLOB_SAS_URL debe ser una URL válida'),
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // SMTP opcional: si faltan datos, los envíos se loguean y no se envían
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: booleanFromString(true),
  MAIL_FROM: z.string().email().default('noreply@cmhautomacion.com'),
  MAIL_REPLY_TO: z.string().email().default('comercial@cmhautomacion.com'),
  NOTIFY_EMAIL: z.string().email().default('comercial@cmhautomacion.com'),
  MAIL_ENABLED: booleanFromString(true),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PORT: parseInt(parsed.data.PORT, 10),
};
