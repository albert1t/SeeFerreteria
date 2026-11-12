export type UserRole = 'admin' | 'almacen' | 'compras';

/** Compatibilidad temporal con usuarios y JWT creados antes de los roles actuales. */
export function normalizeUserRole(role: string): UserRole {
  if (role === 'admin' || role === 'almacen' || role === 'compras') return role;
  if (role === 'operario') return 'almacen';
  return 'compras';
}

// Forma de los permisos de un rol, cargados desde la tabla Roles (ver repositories/roles.ts).
export type ResourceAction = 'create' | 'view' | 'edit' | 'delete';
export interface ResourcePerms {
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}
export interface ProductsPerms extends ResourcePerms {
  viewDataPage: boolean;
}
export interface Permissions {
  admin: boolean;
  orders: ResourcePerms;
  products: ProductsPerms;
  families: ResourcePerms;
  tarifas: ResourcePerms;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export interface UserWithHash extends User {
  passwordHash: string;
}

export interface AllowedEmail {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export type OrderType = 'Reposición' | 'Solicitud' | 'Solicitud Express';
export type OrderStatus = 'Solicitado' | 'Pedido realizado' | 'Pedido recibido' | 'Finalizado';

export const ORDER_TYPES: OrderType[] = ['Reposición', 'Solicitud', 'Solicitud Express'];

// 'created' = alta del pedido; el resto son los estados a los que puede avanzar
// (no incluye 'Solicitado', que es el estado inicial, nunca un destino de avance).
export const ORDER_NOTIFICATION_EVENTS = ['created', 'Pedido realizado', 'Pedido recibido', 'Finalizado'] as const;
export type OrderNotificationEvent = (typeof ORDER_NOTIFICATION_EVENTS)[number];

// Preferencias de notificación de pedidos: qué eventos avisan, por cada tipo de pedido.
// La misma forma sirve para los ajustes globales (un notifyEmail) y para cada usuario.
export type OrderNotificationMatrix = Record<OrderType, Record<OrderNotificationEvent, boolean>>;

export function defaultOrderNotificationMatrix(value: boolean): OrderNotificationMatrix {
  const perType = Object.fromEntries(ORDER_NOTIFICATION_EVENTS.map((event) => [event, value])) as Record<OrderNotificationEvent, boolean>;
  return Object.fromEntries(ORDER_TYPES.map((type) => [type, { ...perType }])) as OrderNotificationMatrix;
}

// Defensivo: el valor viene de una columna JSON / un ajuste guardado como texto, puede
// faltar, estar incompleto (tras añadir un tipo/evento nuevo) o venir corrupto.
export function normalizeOrderNotificationMatrix(raw: unknown): OrderNotificationMatrix {
  const result = defaultOrderNotificationMatrix(true);
  if (!raw || typeof raw !== 'object') return result;
  const input = raw as Record<string, Record<string, unknown>>;
  for (const type of ORDER_TYPES) {
    const row = input[type];
    if (!row || typeof row !== 'object') continue;
    for (const event of ORDER_NOTIFICATION_EVENTS) {
      if (typeof row[event] === 'boolean') result[type][event] = row[event];
    }
  }
  return result;
}

export function shouldNotifyOrderEvent(matrix: OrderNotificationMatrix, type: OrderType, event: OrderNotificationEvent): boolean {
  return matrix[type]?.[event] ?? false;
}

export interface Product {
  id: number;
  cmhReference: string;
  customerReference: string | null;
  code: string | null;
  name: string;
  brand: string | null;
  description: string | null;
  metric: string | null;
  packagingUnit: string | null;
  pvpOrientativo: number | null;
  pvpOrientativoMoneda: string | null;
  image: string | null;
  deliveryTime: string | null;
  familyId: number;
  familyName?: string;
  reorderPoint: number | null;
  panel: string | null;
  col: number | null;
  row: number | null;
  hidden: boolean;
  cabeza: string | null;
  acabado: string | null;
  iso: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: number;
  productId: number;
  requesterId: number;
  type: OrderType;
  quantity: number;
  desiredDeadline: string | null;
  status: OrderStatus;
  priority: boolean;
  notes: string | null;
  hidden: boolean;
  requestedAt: string;
  updatedAt: string;
  productRef?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number | null;
  productPackaging?: string | null;
  familyName?: string;
  requesterName?: string;
}

export interface OrderHistory {
  id: number;
  orderId: number;
  userId: number;
  previousStatus: string | null;
  newStatus: string;
  createdAt: string;
  userName?: string;
}

export interface ProductPreview {
  id: number;
  panel: string | null;
  col: number | null;
  row: number | null;
  image: string | null;
  cmhReference: string;
  familyName: string | undefined;
  cabeza: string | null;
  acabado: string | null;
  iso: string | null;
}

export interface PanelSummary {
  panel: string;
  totalProducts: number;
}

export interface FamilyWithSubs {
  id: number;
  name: string;
  description: string | null;
}

export type ImportStatus = 'procesando' | 'completado' | 'fallido';

export interface CatalogImport {
  id: number;
  brand: string;
  totalRecords: number;
  updated: number;
  errors: number;
  errorDetails: string | null;
  status: ImportStatus;
  fileName: string | null;
  userId: number;
  startedAt: string;
  finishedAt: string | null;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
