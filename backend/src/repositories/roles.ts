import { getPool } from '../config/db.js';
import type { Permissions, UserRole } from '../types/index.js';

export interface RoleRecord {
  name: UserRole;
  label: string;
  permissions: Permissions;
}

// Los permisos casi nunca cambian (no hay aún UI para editarlos en caliente), así que se
// cargan una vez al arrancar en vez de consultarse en cada request.
let cache: Map<string, RoleRecord> | null = null;

function mapRow(row: Record<string, unknown>): RoleRecord {
  const raw = row.permissions;
  const permissions = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Permissions;
  return { name: row.name as UserRole, label: row.label as string, permissions };
}

export async function loadRolesCache(): Promise<void> {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT name, label, permissions FROM Roles');
  const next = new Map<string, RoleRecord>();
  for (const row of rows as Record<string, unknown>[]) {
    const record = mapRow(row);
    next.set(record.name, record);
  }
  if (!next.has('compras')) {
    throw new Error('La tabla Roles no tiene fila "compras" (fallback por defecto); ejecuta database/017_roles_table.sql');
  }
  cache = next;
}

function requireCache(): Map<string, RoleRecord> {
  if (!cache) throw new Error('Roles cache no inicializada: falta llamar a loadRolesCache() al arrancar');
  return cache;
}

export function getAllRolesSync(): RoleRecord[] {
  return [...requireCache().values()];
}

// Rol desconocido (legado o borrado) cae al mismo perfil que normalizeUserRole ya usa de fallback.
export function getPermissionsForRole(role: string): Permissions {
  const map = requireCache();
  return (map.get(role) ?? map.get('compras')!).permissions;
}

export function isValidRole(role: string): boolean {
  return requireCache().has(role);
}
