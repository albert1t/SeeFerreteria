import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Usuario requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const registerSchema = z.object({
  username: z.string().min(1, 'Usuario requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(1, 'Nombre requerido'),
});

export const msalLoginSchema = z.object({
  idToken: z.string().min(1, 'Token de Microsoft requerido'),
});

const baseRecambioSchema = z.object({
  referenciaCMH: z.string().min(1).max(50),
  referenciaCliente: z.string().max(50).optional().nullable(),
  codigo: z.string().max(50).optional().nullable(),
  nombre: z.string().min(1).max(200),
  marca: z.string().max(100).optional().nullable(),
  descripcion: z.string().optional().nullable(),
  metrica: z.string().max(100).optional().nullable(),
  unidadEmbalaje: z.string().max(100).optional().nullable(),
  imagen: z.string().max(500).optional().nullable(),
  plazoEntrega: z.string().max(50).optional().nullable(),
  familiaId: z.number().int().positive(),
  nReposicion: z.number().int().positive().default(1),
  panel: z.string().min(1).max(10),
  col: z.number().int().min(1).max(6),
  row: z.number().int().min(1).max(15),
});

function refineUbicacion(data: { panel?: string; col?: number; row?: number }, ctx: z.RefinementCtx) {
  if (data.panel === undefined) return;
  const panel = data.panel.toUpperCase();
  const match = panel.match(/^A(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 9) {
      if (data.col !== undefined && data.col > 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La columna no puede ser mayor a 6 para paneles A1-A9',
          path: ['col'],
        });
      }
      if (data.row !== undefined && data.row > 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La fila no puede ser mayor a 15 para paneles A1-A9',
          path: ['row'],
        });
      }
    } else if (num >= 10 && num <= 25) {
      if (data.col !== undefined && data.col > 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La columna no puede ser mayor a 5 para paneles A10-A25',
          path: ['col'],
        });
      }
      if (data.row !== undefined && data.row > 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La fila no puede ser mayor a 10 para paneles A10-A25',
          path: ['row'],
        });
      }
    }
  }
}

export const recambioCreateSchema = baseRecambioSchema.superRefine(refineUbicacion);
export const recambioUpdateSchema = baseRecambioSchema.partial().superRefine(refineUbicacion);

export const pedidoCreateSchema = z.object({
  recambioId: z.number().int().positive(),
  tipo: z.enum(['Reposición', 'Solicitud', 'Solicitud Express']),
  cantidad: z.number().int().positive().optional(),
  plazoDeseado: z.string().max(50).optional().nullable(),
  observaciones: z.string().optional().nullable(),
});

export const pedidoEstadoSchema = z.object({
  estado: z.enum(['Solicitado', 'Pedido realizado', 'Pedido recibido', 'Finalizado']),
});

export const recambiosQuerySchema = z.object({
  panel: z.string().optional(),
  busqueda: z.string().optional(),
  incluirOcultos: z.enum(['true', 'false']).optional(),
});

export const pedidosQuerySchema = z.object({
  busqueda: z.string().optional(),
  tipo: z.enum(['Reposición', 'Solicitud', 'Solicitud Express']).optional(),
  fecha: z.string().optional(),
  orden: z.enum(['reciente', 'antiguo']).optional(),
  incluirFinalizados: z.enum(['true', 'false']).optional(),
});
