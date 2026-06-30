import { Router } from 'express';
import multer from 'multer';
import * as xlsx from 'xlsx';
import * as recambiosService from '../services/recambiosService.js';
import * as pedidosService from '../services/pedidosService.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { recambioCreateSchema, recambioUpdateSchema, recambiosQuerySchema } from '../schemas/index.js';
import { env } from '../config/env.js';

// Multer en memoria: no escribe nada en disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp, svg, bmp)'));
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
  upload.single('imagen'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No se ha enviado ninguna imagen' });
        return;
      }

      const sasUrl = env.AZURE_BLOB_SAS_URL;
      const ext = req.file.originalname.split('.').pop() ?? 'jpg';
      const blobName = `product-image/recambio-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

      // La SAS URL del container: https://<account>.blob.core.windows.net/<container>?<sas>
      // Para subir un blob concreto insertamos el nombre antes del '?'
      const [baseUrl, sasToken] = sasUrl.split('?');
      const blobUrl = `${baseUrl}/${blobName}?${sasToken}`;

      const azureRes = await fetch(blobUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': req.file.mimetype,
          'Content-Length': String(req.file.size),
        },
        body: req.file.buffer as unknown as BodyInit,
      });

      if (!azureRes.ok) {
        const errorText = await azureRes.text().catch(() => azureRes.statusText);
        throw new Error(`Azure Blob error ${azureRes.status}: ${errorText}`);
      }

      // URL pública del blob (sin token SAS)
      const url = `${baseUrl}/${blobName}`;
      res.json({ url });
    } catch (err) {
      next(err);
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
