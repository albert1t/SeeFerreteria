import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
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
