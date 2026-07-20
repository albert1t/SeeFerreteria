import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { getPool } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import recambiosRoutes from './routes/recambios.js';
import panelesRoutes from './routes/paneles.js';
import pedidosRoutes from './routes/pedidos.js';
import catalogosRoutes from './routes/catalogos.js';
// Las imágenes se almacenan en Azure Blob Storage; no se sirven estáticos locales.
const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
    origin(origin, callback) {
        if (!origin || typeof origin !== 'string')
            return callback(null, true);
        const allowed = (env.CORS_ORIGIN || '').split(',').map(s => s.trim());
        if (allowed.some(a => origin === a || origin.includes(a.replace(/^https?:\/\//, '')))) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(cookieParser());
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/recambios', recambiosRoutes);
app.use('/api/paneles', panelesRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/catalogos', catalogosRoutes);
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
