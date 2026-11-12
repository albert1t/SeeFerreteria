/** Compatibilidad temporal con usuarios y JWT creados antes de los roles actuales. */
export function normalizeUserRole(role) {
    if (role === 'admin' || role === 'almacen' || role === 'compras')
        return role;
    if (role === 'operario')
        return 'almacen';
    return 'compras';
}
export const ORDER_TYPES = ['Reposición', 'Solicitud', 'Solicitud Express'];
// 'created' = alta del pedido; el resto son los estados a los que puede avanzar
// (no incluye 'Solicitado', que es el estado inicial, nunca un destino de avance).
export const ORDER_NOTIFICATION_EVENTS = ['created', 'Pedido realizado', 'Pedido recibido', 'Finalizado'];
export function defaultOrderNotificationMatrix(value) {
    const perType = Object.fromEntries(ORDER_NOTIFICATION_EVENTS.map((event) => [event, value]));
    return Object.fromEntries(ORDER_TYPES.map((type) => [type, { ...perType }]));
}
// Defensivo: el valor viene de una columna JSON / un ajuste guardado como texto, puede
// faltar, estar incompleto (tras añadir un tipo/evento nuevo) o venir corrupto.
export function normalizeOrderNotificationMatrix(raw) {
    const result = defaultOrderNotificationMatrix(true);
    if (!raw || typeof raw !== 'object')
        return result;
    const input = raw;
    for (const type of ORDER_TYPES) {
        const row = input[type];
        if (!row || typeof row !== 'object')
            continue;
        for (const event of ORDER_NOTIFICATION_EVENTS) {
            if (typeof row[event] === 'boolean')
                result[type][event] = row[event];
        }
    }
    return result;
}
export function shouldNotifyOrderEvent(matrix, type, event) {
    return matrix[type]?.[event] ?? false;
}
