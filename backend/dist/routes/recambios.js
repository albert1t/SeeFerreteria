import { Router } from 'express';
import https from 'https';
import multer from 'multer';
import * as recambiosService from '../services/recambiosService.js';
import * as pedidosService from '../services/pedidosService.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { recambioCreateSchema, recambioUpdateSchema, recambiosQuerySchema } from '../schemas/index.js';
import { env } from '../config/env.js';
// Multer en memoria: no escribe nada en disco
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff?|ico|heic|heif|avif)$/i;
        if (allowed.test(file.originalname)) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp, svg, bmp, tiff, ico, heic, avif)'));
        }
    },
});
const uploadExcel = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = /\.(xlsx|xls)$/i;
        if (allowed.test(file.originalname)) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
        }
    },
});
const router = Router();
router.use(authMiddleware);
/**
 * POST /api/recambios/upload-imagen
 * Recibe el archivo desde el frontend, lo sube a Azure Blob Storage
 * dentro de la carpeta "product-image/" y devuelve la URL pública del blob.
 * El backend hace el PUT a Azure, evitando restricciones CORS del navegador.
 */
router.post('/upload-imagen', requireRole('admin'), (req, res, next) => {
    try {
        upload.single('imagen')(req, res, (err) => {
            if (err) {
                console.error('Multer error:', err);
                const msg = err instanceof Error ? err.message : String(err);
                return res.status(400).json({ error: `Error al procesar archivo: ${msg}` });
            }
            next();
        });
    }
    catch (err) {
        console.error('Multer sync error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: `Error en multer: ${msg}` });
    }
}, async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No se ha enviado ninguna imagen' });
            return;
        }
        const file = req.file;
        const sasUrl = env.AZURE_BLOB_SAS_URL;
        const ext = file.originalname.split('.').pop() ?? 'jpg';
        const blobName = `product-image/recambio-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        const [baseUrl, sasToken] = sasUrl.split('?');
        if (!baseUrl || !sasToken) {
            return res.status(500).json({ error: 'Configuración de Azure inválida (SAS URL)' });
        }
        const baseClean = baseUrl.replace(/\/+$/, '');
        const uploadUrl = `${baseClean}/${blobName}?${sasToken}`;
        const parsedUrl = new URL(uploadUrl);
        const buffer = file.buffer;
        if (!buffer || buffer.length === 0) {
            return res.status(400).json({ error: 'Archivo vacío' });
        }
        const azureStatus = await new Promise((resolve, reject) => {
            const opts = {
                method: 'PUT',
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.pathname + parsedUrl.search,
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                    'Content-Type': file.mimetype,
                    'Content-Length': buffer.length,
                },
            };
            const azureReq = https.request(opts, (azureRes) => {
                azureRes.resume();
                azureRes.on('end', () => resolve(azureRes.statusCode ?? 0));
                azureRes.on('error', (rejErr) => reject(new Error(`Response error: ${rejErr.message}`)));
            });
            azureReq.setTimeout(30_000, () => { azureReq.destroy(); reject(new Error('Timeout')); });
            azureReq.on('error', (conErr) => reject(new Error(`Connection error: ${conErr.message}`)));
            azureReq.write(buffer);
            azureReq.end();
        });
        if (azureStatus < 200 || azureStatus >= 300) {
            return res.status(502).json({ error: `Azure devolvió código ${azureStatus}` });
        }
        const url = `${baseClean}/${blobName}`;
        res.json({ url });
    }
    catch (err) {
        console.error('Upload error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: msg });
    }
});
router.get('/', validateQuery(recambiosQuerySchema), async (req, res, next) => {
    try {
        const q = req.query;
        if (q.preview === 'true') {
            const items = await recambiosService.getPreview(q.incluirOcultos === 'true');
            res.json(items);
            return;
        }
        const items = await recambiosService.listRecambios({
            panel: q.panel,
            busqueda: q.busqueda,
            incluirOcultos: q.incluirOcultos === 'true',
        });
        res.json(items);
    }
    catch (err) {
        next(err);
    }
});
router.get('/ref/:ref', async (req, res, next) => {
    try {
        const ref = String(req.params.ref);
        const recambio = await recambiosService.getRecambioByRef(ref);
        res.json(recambio);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const recambio = await recambiosService.getRecambio(id);
        const pedidos = await pedidosService.getPedidosByRecambio(id);
        res.json({ ...recambio, pedidos });
    }
    catch (err) {
        next(err);
    }
});
router.post('/import', requireRole('admin'), uploadExcel.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No se ha enviado ningún archivo Excel' });
            return;
        }
        const result = await recambiosService.importarDesdeExcel(req.file.buffer);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', requireRole('admin'), validateBody(recambioCreateSchema), async (req, res, next) => {
    try {
        const recambio = await recambiosService.createRecambio(req.body);
        res.status(201).json(recambio);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', requireRole('admin'), validateBody(recambioUpdateSchema), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const recambio = await recambiosService.updateRecambio(id, req.body);
        res.json(recambio);
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id/oculto', requireRole('admin'), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        const recambio = await recambiosService.toggleOculto(id);
        res.json(recambio);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', requireRole('admin'), async (req, res, next) => {
    try {
        const id = parseInt(String(req.params.id), 10);
        await recambiosService.deleteRecambio(id);
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
});
router.post('/swap', requireRole('admin'), async (req, res, next) => {
    try {
        const { id1, id2 } = req.body;
        if (!id1 || !id2) {
            res.status(400).json({ error: 'Se requieren id1 e id2' });
            return;
        }
        const result = await recambiosService.swapPositions(Number(id1), Number(id2));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
export default router;
