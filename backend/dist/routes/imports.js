import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, requirePermission } from '../middleware/auth.js';
import { validateParams } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import { importBrandSchema } from '../schemas/index.js';
import * as importsService from '../services/importsService.js';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: (_req, file, cb) => {
        if (/\.(csv|txt)$/i.test(file.originalname)) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos CSV o TXT'));
        }
    },
});
const router = Router();
router.use(authMiddleware);
// GET /api/catalogs/importar/:brand/status
// Returns the last successful import date for a given brand/catalog.
router.get('/importar/:brand/status', validateParams(importBrandSchema), async (req, res, next) => {
    try {
        const { brand } = req.params;
        const ultima = await importsService.getUltimaImportacion(brand);
        res.json({
            brand,
            ultimaImportacion: ultima?.finishedAt ?? null,
            diasDesdeUltima: ultima?.finishedAt
                ? Math.floor((Date.now() - new Date(ultima.finishedAt).getTime()) / (1000 * 60 * 60 * 24))
                : null,
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/catalogs/importar/:brand
// Protected by tariff edit permission. Receives a CSV, parses it in a stream,
// normalizes prices, and bulk-updates the product master in chunks of 1000.
router.post('/importar/:brand', requirePermission('tarifas', 'edit'), validateParams(importBrandSchema), (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return next(new AppError(400, msg));
        }
        next();
    });
}, async (req, res, next) => {
    try {
        const { brand } = req.params;
        if (!req.file) {
            throw new AppError(400, 'No se ha enviado ningún archivo');
        }
        const resultado = await importsService.importCsv(brand, req.file.buffer, req.file.originalname, req.user.userId);
        res.status(201).json({
            ok: true,
            importacion: resultado,
        });
    }
    catch (err) {
        next(err);
    }
});
export default router;
