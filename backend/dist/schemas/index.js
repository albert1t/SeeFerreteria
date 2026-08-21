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
    cmhReference: z.string().min(1).max(50),
    customerReference: z.string().max(50).optional().nullable(),
    code: z.string().max(50).optional().nullable(),
    name: z.string().min(1).max(200),
    brand: z.string().max(100).optional().nullable(),
    description: z.string().optional().nullable(),
    metric: z.string().max(100).optional().nullable(),
    packagingUnit: z.string().max(100).optional().nullable(),
    image: z.string().max(500).optional().nullable(),
    deliveryTime: z.string().max(50).optional().nullable(),
    familyId: z.number().int().positive(),
    reorderPoint: z.number().int().positive().nullable().default(1),
    panel: z.string().min(1).max(10),
    col: z.number().int().min(1).max(6),
    row: z.number().int().min(1).max(15),
});
function refineUbicacion(data, ctx) {
    if (data.panel === undefined)
        return;
    const panel = data.panel.toUpperCase();
    const match = panel.match(/^A(\d+)$/);
    if (match) {
        const num = parseInt(match[1], 10);
        if (num >= 1 && num <= 9) {
            if (data.col !== undefined && data.col > 6) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'La columna no puede ser mayor a 6 para panels A1-A9',
                    path: ['col'],
                });
            }
            if (data.row !== undefined && data.row > 15) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'La fila no puede ser mayor a 15 para panels A1-A9',
                    path: ['row'],
                });
            }
        }
        else if (num >= 10 && num <= 25) {
            if (data.col !== undefined && data.col > 5) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'La columna no puede ser mayor a 5 para panels A10-A25',
                    path: ['col'],
                });
            }
            if (data.row !== undefined && data.row > 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'La fila no puede ser mayor a 10 para panels A10-A25',
                    path: ['row'],
                });
            }
        }
    }
}
export const productCreateSchema = baseRecambioSchema.superRefine(refineUbicacion);
export const productUpdateSchema = baseRecambioSchema.partial().superRefine(refineUbicacion);
export const orderCreateSchema = z.object({
    productId: z.number().int().positive(),
    type: z.enum(['Reposición', 'Solicitud', 'Solicitud Express']),
    quantity: z.number().int().positive().optional(),
    desiredDeadline: z.string().max(50).optional().nullable(),
    notes: z.string().optional().nullable(),
});
export const orderStatusSchema = z.object({
    status: z.enum(['Solicitado', 'Pedido realizado', 'Pedido recibido', 'Finalizado']),
});
export const orderUpdateSchema = z.object({
    quantity: z.number().int().positive().optional(),
    desiredDeadline: z.string().max(50).optional().nullable(),
    notes: z.string().optional().nullable(),
});
export const productsQuerySchema = z.object({
    panel: z.string().optional(),
    busqueda: z.string().optional(),
    incluirOcultos: z.enum(['true', 'false']).optional(),
    preview: z.enum(['true', 'false']).optional(),
});
export const ordersQuerySchema = z.object({
    busqueda: z.string().optional(),
    type: z.enum(['Reposición', 'Solicitud', 'Solicitud Express']).optional(),
    fecha: z.string().optional(),
    orden: z.enum(['reciente', 'antiguo']).optional(),
    incluirFinalizados: z.enum(['true', 'false']).optional(),
    incluirOcultos: z.enum(['true', 'false']).optional(),
});
export const userIdSchema = z.object({
    id: z.coerce.number().int().positive(),
});
export const updateRoleSchema = z.object({
    role: z.enum(['admin', 'user', 'viewer', 'operario']),
});
export const updateActiveSchema = z.object({
    isActive: z.boolean(),
});
export const createUserSchema = z.object({
    username: z.string().min(1, 'Usuario requerido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: z.string().min(1, 'Nombre requerido'),
    role: z.enum(['admin', 'user', 'viewer', 'operario']),
});
export const allowedEmailSchema = z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'user', 'viewer', 'operario']),
});
export const allowedEmailUpdateSchema = z.object({
    role: z.enum(['admin', 'user', 'viewer', 'operario']),
    isActive: z.boolean(),
});
export const importBrandSchema = z.object({
    brand: z.string().min(1).max(50),
});
