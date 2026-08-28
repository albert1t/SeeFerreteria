export type UserRole = 'admin' | 'user' | 'viewer' | 'operario';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export interface AllowedEmail {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export type OrderType = 'Reposición' | 'Solicitud' | 'Solicitud Express';
export type OrderStatus = 'Solicitado' | 'Pedido realizado' | 'Pedido recibido' | 'Finalizado';

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

export interface ImportStatusResponse {
  brand: string;
  lastImport: string | null;
  daysSinceLastImport: number | null;
}

export interface ProductFormData {
  cmhReference: string;
  customerReference?: string | null;
  code?: string | null;
  name: string;
  brand?: string | null;
  description?: string | null;
  metric?: string | null;
  packagingUnit?: string | null;
  pvpOrientativo?: number | null;
  pvpOrientativoMoneda?: string | null;
  image?: string | null;
  deliveryTime?: string | null;
  familyId: number;
  reorderPoint: number | null;
  panel: string;
  col: number | null;
  row: number | null;
  hidden?: boolean;
}
