import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { getPool } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import productsRoutes from './routes/products.js';
import panelsRoutes from './routes/panels.js';
import ordersRoutes from './routes/orders.js';
import catalogsRoutes from './routes/catalogs.js';
import importsRoutes from './routes/imports.js';
import settingsRoutes from './routes/settings.js';
// Las imágenes se almacenan en Azure Blob Storage; no se sirven estáticos locales.
const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
    origin(origin, callback) {
        if (!origin || typeof origin !== 'string')
            return callback(null, true);
        const allowedOrigins = (env.CORS_ORIGIN || '').split(',').map(s => s.trim());
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(cookieParser());
// Evitar que LiteSpeed/WordPress cachee respuestas de la API
app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/panels', panelsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/catalogs', catalogsRoutes);
app.use('/api/catalogs', importsRoutes);
app.use('/api/settings', settingsRoutes);
app.use(errorHandler);
async function start() {
    try {
        await getPool();
        console.log('Connected to database');
    }
    catch (err) {
        console.error('Database connection failed:', err);
        console.error('Ensure database credentials are correct and IP is allowed.');
        process.exit(1);
    }
    app.listen(env.PORT, () => {
        console.log(`Server running on http://localhost:${env.PORT}`);
    });
}
start();
