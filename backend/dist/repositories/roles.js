import { getPool } from '../config/db.js';
// Los permisos casi nunca cambian (no hay aún UI para editarlos en caliente), así que se
// cargan una vez al arrancar en vez de consultarse en cada request.
let cache = null;
function mapRow(row) {
    const raw = row.permissions;
    const permissions = (typeof raw === 'string' ? JSON.parse(raw) : raw);
    return { name: row.name, label: row.label, permissions };
}
export async function loadRolesCache() {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT name, label, permissions FROM Roles');
    const next = new Map();
    for (const row of rows) {
        const record = mapRow(row);
        next.set(record.name, record);
    }
    if (!next.has('compras')) {
        throw new Error('La tabla Roles no tiene fila "compras" (fallback por defecto); ejecuta database/017_roles_table.sql');
    }
    cache = next;
}
function requireCache() {
    if (!cache)
        throw new Error('Roles cache no inicializada: falta llamar a loadRolesCache() al arrancar');
    return cache;
}
export function getAllRolesSync() {
    return [...requireCache().values()];
}
// Rol desconocido (legado o borrado) cae al mismo perfil que normalizeUserRole ya usa de fallback.
export function getPermissionsForRole(role) {
    const map = requireCache();
    return (map.get(role) ?? map.get('compras')).permissions;
}
export function isValidRole(role) {
    return requireCache().has(role);
}
