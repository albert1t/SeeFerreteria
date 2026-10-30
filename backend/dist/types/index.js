/** Compatibilidad temporal con usuarios y JWT creados antes de los roles actuales. */
export function normalizeUserRole(role) {
    if (role === 'admin' || role === 'almacen' || role === 'compras' || role === 'viewer')
        return role;
    if (role === 'operario')
        return 'almacen';
    return 'compras';
}
