import { z } from 'zod';
import { getPanelDimensions } from '../utils/panelDimensions.js';
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
    // Columna NOT NULL en BD: null pasaba esta validación antes (.nullable() dejaba pasar
    // explicit null, y .default() solo actúa sobre undefined) y reventaba en el INSERT con
    // un 500 genérico en vez de un 400 claro.
    reorderPoint: z.number({ required_error: 'El número de reposición es obligatorio' }).int().positive(),
    panel: z.string().max(10).optional().nullable(),
    col: z.number().int().min(1).max(6).optional().nullable(),
    row: z.number().int().min(1).max(15).optional().nullable(),
    hidden: z.boolean().optional(),
    cabeza: z.string().max(100).optional().nullable(),
    acabado: z.string().max(100).optional().nullable(),
    iso: z.string().max(100).optional().nullable(),
});
function refineUbicacion(data, ctx) {
    if (!data.panel)
        return;
    const { cols, rows } = getPanelDimensions(data.panel);
    if (data.col != null && data.col > cols) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La columna no puede ser mayor a ${cols} para el panel ${data.panel}`,
            path: ['col'],
        });
    }
    if (data.row != null && data.row > rows) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La fila no puede ser mayor a ${rows} para el panel ${data.panel}`,
            path: ['row'],
        });
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
    familyId: z.coerce.number().int().positive().optional(),
    fecha: z.string().optional(),
    orden: z.enum(['reciente', 'antiguo']).optional(),
    incluirFinalizados: z.enum(['true', 'false']).optional(),
    incluirOcultos: z.enum(['true', 'false']).optional(),
});
export const userIdSchema = z.object({
    id: z.coerce.number().int().positive(),
});
export const updateRoleSchema = z.object({
    role: z.string().min(1, 'Rol requerido'),
});
export const updateActiveSchema = z.object({
    isActive: z.boolean(),
});
export const createUserSchema = z.object({
    username: z.string().min(1, 'Usuario requerido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: z.string().min(1, 'Nombre requerido'),
    role: z.string().min(1, 'Rol requerido'),
});
export const allowedEmailSchema = z.object({
    email: z.string().email(),
    role: z.string().min(1, 'Rol requerido'),
});
export const allowedEmailUpdateSchema = z.object({
    role: z.string().min(1, 'Rol requerido'),
    isActive: z.boolean(),
});
export const importBrandSchema = z.object({
    brand: z.string().min(1).max(50),
});
const orderEventPrefsSchema = z.object({
    created: z.boolean(),
    'Pedido realizado': z.boolean(),
    'Pedido recibido': z.boolean(),
    Finalizado: z.boolean(),
});
const orderNotificationMatrixSchema = z.object({
    'Reposición': orderEventPrefsSchema,
    'Solicitud': orderEventPrefsSchema,
    'Solicitud Express': orderEventPrefsSchema,
});
export const notificationSettingsSchema = z.object({
    mailEnabled: z.boolean().optional(),
    notifyEmail: z.string().email().optional(),
    notifyAdminOnRegister: z.boolean().optional(),
    orderNotificationMatrix: orderNotificationMatrixSchema.optional(),
});
export const userNotificationSettingsSchema = z.object({
    orderNotificationMatrix: orderNotificationMatrixSchema,
    notificationEmail: z.string().email().optional().nullable(),
});
