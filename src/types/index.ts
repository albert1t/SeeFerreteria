export type UserRole = 'admin' | 'user' | 'viewer' | 'operario';

export interface Permissions {
  admin: boolean;
  pedidos: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
  recambios: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  permissions: Permissions;
}

export interface AllowedEmail {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  permissions: Permissions | null;
}

export type PedidoTipo = 'Reposición' | 'Solicitud' | 'Solicitud Express';
export type PedidoEstado = 'Solicitado' | 'Pedido realizado' | 'Pedido recibido' | 'Finalizado';

export interface Recambio {
  id: number;
  referenciaCMH: string;
  referenciaCliente: string | null;
  codigo: string | null;
  nombre: string;
  marca: string | null;
  descripcion: string | null;
  metrica: string | null;
  unidadEmbalaje: string | null;
  imagen: string | null;
  plazoEntrega: string | null;
  familiaId: number;
  familiaNombre?: string;
  nReposicion: number | null;
  panel: string;
  col: number;
  row: number;
  oculto: boolean;
}

export interface Pedido {
  id: number;
  recambioId: number;
  solicitanteId: number;
  tipo: PedidoTipo;
  cantidad: number;
  plazoDeseado: string | null;
  estado: PedidoEstado;
  prioritario: boolean;
  observaciones: string | null;
  oculto: boolean;
  fechaSolicitud: string;
  fechaActualizacion: string;
  recambioRef?: string;
  recambioNombre?: string;
  recambioImagen?: string;
  solicitanteNombre?: string;
}

export interface PedidoHistorial {
  id: number;
  pedidoId: number;
  usuarioId: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  fecha: string;
  usuarioNombre?: string;
}

export interface PanelResumen {
  panel: string;
  totalRecambios: number;
}

export interface FamiliaConSubs {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface RecambioFormData {
  referenciaCMH: string;
  referenciaCliente?: string | null;
  codigo?: string | null;
  nombre: string;
  marca?: string | null;
  descripcion?: string | null;
  metrica?: string | null;
  unidadEmbalaje?: string | null;
  imagen?: string | null;
  plazoEntrega?: string | null;
  familiaId: number;
  nReposicion: number | null;
  panel: string;
  col: number | null;
  row: number | null;
}
