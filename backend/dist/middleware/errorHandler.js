import { ZodError } from 'zod';
export class AppError extends Error {
    statusCode;
    code;
    constructor(statusCode, message, code) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
    }
}
export function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message, code: err.code });
        return;
    }
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Datos inválidos',
            details: err.flatten().fieldErrors,
        });
        return;
    }
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
}
