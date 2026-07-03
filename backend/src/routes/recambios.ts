import { Router } from 'express';
import https from 'https';
import multer from 'multer';
import * as xlsx from 'xlsx';
import * as recambiosService from '../services/recambiosService.js';
import * as pedidosService from '../services/pedidosService.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
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
    } else {
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
    } else {
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
router.post(
  '/upload-imagen',
  requireRole('admin'),
  // Catch multer errors explicitly (file too large, wrong type, etc.)
  (req, res, next) => {
    upload.single('imagen')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: `Error al procesar archivo: ${err.code}` });
        }
        return res.status(400).json({ error: err.message || 'Archivo inválido' });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No se ha enviado ninguna imagen' });
        return;
      }

      const sasUrl = env.AZURE_BLOB_SAS_URL;
      const ext = req.file.originalname.split('.').pop() ?? 'jpg';
      const blobName = `product-image/recambio-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

      const [baseUrl, sasToken] = sasUrl.split('?');
      if (!baseUrl || !sasToken) {
        console.error('SAS URL mal formada:', sasUrl?.slice(0, 50));
        return res.status(500).json({ error: 'Configuración de Azure inválida (SAS URL)' });
      }

      const uploadUrl = `${baseUrl}/${blobName}?${sasToken}`;

      // Subida a Azure Blob Storage usando el módulo nativo https
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(uploadUrl);
      } catch {
        return res.status(500).json({ error: 'URL de subida inválida' });
      }

      const buffer = req.file.buffer;
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ error: 'Archivo vacío' });
      }

      const TIMEOUT_MS = 30_000;

      const azureStatus = await new Promise<number>((resolve, reject) => {
        const opts: https.RequestOptions = {
          method: 'PUT',
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.pathname + parsedUrl.search,
          headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': req.file.mimetype,
            'Content-Length': buffer.length,
          },
        };

        const azureReq = https.request(opts, (azureRes) => {
          azureRes.resume();
          azureRes.on('end', () => {
            resolve(azureRes.statusCode ?? 0);
          });
          azureRes.on('error', (err) => reject(new Error(`Response error: ${err.message}`)));
        });

        azureReq.setTimeout(TIMEOUT_MS, () => {
          azureReq.destroy();
          reject(new Error('Timeout al conectar con Azure Blob Storage'));
        });

        azureReq.on('error', (err) => reject(new Error(`Conexión Azure falló: ${err.message}`)));
        azureReq.write(buffer);
        azureReq.end();
      });

      if (azureStatus < 200 || azureStatus >= 300) {
        return res.status(502).json({ error: `Azure Blob Storage devolvió código ${azureStatus}` });
      }

      // URL pública del blob (sin token SAS)
      const url = `${baseUrl}/${blobName}`;
      res.json({ url });
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      res.status(500).json({ error: msg });
    }
  }
);

router.get('/', validateQuery(recambiosQuerySchema), async (req, res, next) => {
  try {
    const q = req.query as { panel?: string; busqueda?: string; incluirOcultos?: string };
    const items = await recambiosService.listRecambios({
      panel: q.panel,
      busqueda: q.busqueda,
      incluirOcultos: q.incluirOcultos === 'true',
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get('/ref/:ref', async (req, res, next) => {
  try {
    const ref = String(req.params.ref);
    const recambio = await recambiosService.getRecambioByRef(ref);
    res.json(recambio);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const recambio = await recambiosService.getRecambio(id);
    const pedidos = await pedidosService.getPedidosByRecambio(id);
    res.json({ ...recambio, pedidos });
  } catch (err) {
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
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('admin'), validateBody(recambioCreateSchema), async (req, res, next) => {
  try {
    const recambio = await recambiosService.createRecambio(req.body);
    res.status(201).json(recambio);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireRole('admin'), validateBody(recambioUpdateSchema), async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const recambio = await recambiosService.updateRecambio(id, req.body);
    res.json(recambio);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/oculto', requireRole('admin'), async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const recambio = await recambiosService.toggleOculto(id);
    res.json(recambio);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await recambiosService.deleteRecambio(id);
    res.json({ ok: true });
  } catch (err) {
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
  } catch (err) {
    next(err);
  }
});

export default router;
