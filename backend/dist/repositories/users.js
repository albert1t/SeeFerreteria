import { getPool } from '../config/db.js';
import { getDefaultPermissions } from '../middleware/auth.js';
function deepMergePerms(stored, defaults) {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
        if (key === 'admin' && typeof stored.admin === 'boolean') {
            result.admin = stored.admin;
        }
        else if (key !== 'admin' && stored[key] && typeof stored[key] === 'object') {
            result[key] = { ...defaults[key], ...stored[key] };
        }
    }
    return result;
}
function parsePermissions(json, role) {
    const defaults = getDefaultPermissions(role);
    if (!json)
        return defaults;
    try {
        const stored = JSON.parse(json);
        return deepMergePerms(stored, defaults);
    }
    catch {
        return defaults;
    }
}
function mapUser(record) {
    const role = record.role;
    return {
        id: record.id,
        username: record.username,
        name: record.name,
        role,
        isActive: record.isActive,
        permissions: parsePermissions(record.permissions, role),
    };
}
export async function findByUsername(username) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, username, passwordHash, name, role, isActive, permissions FROM Users WHERE username = ? AND isActive = 1', [username]);
    const row = rows[0];
    if (!row)
        return null;
    return { ...mapUser(row), passwordHash: row.passwordHash };
}
export async function findByUsernameAll(username) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, username, passwordHash, name, role, isActive, permissions FROM Users WHERE username = ?', [username]);
    const row = rows[0];
    if (!row)
        return null;
    return { ...mapUser(row), passwordHash: row.passwordHash };
}
export async function findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, username, name, role, isActive, permissions FROM Users WHERE id = ? AND isActive = 1', [id]);
    const row = rows[0];
    return row ? mapUser(row) : null;
}
export async function createUser(username, passwordHash, name, role, permissions) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT 1 AS existsUser FROM Users WHERE username = ? LIMIT 1', [username]);
    if (rows.length > 0)
        return false;
    const perms = permissions ?? getDefaultPermissions(role);
    await pool.query('INSERT INTO Users (username, passwordHash, name, role, permissions) VALUES (?, ?, ?, ?, ?)', [username, passwordHash, name, role, JSON.stringify(perms)]);
    return true;
}
export async function upsertUser(username, passwordHash, name, role, permissions) {
    const pool = await getPool();
    const perms = permissions ?? getDefaultPermissions(role);
    const [existing] = await pool.query('SELECT id FROM Users WHERE username = ?', [username]);
    if (existing.length > 0) {
        await pool.query('UPDATE Users SET passwordHash = ?, name = ?, role = ?, permissions = ?, updatedAt = UTC_TIMESTAMP(6) WHERE username = ?', [passwordHash, name, role, JSON.stringify(perms), username]);
    }
    else {
        await pool.query('INSERT INTO Users (username, passwordHash, name, role, permissions) VALUES (?, ?, ?, ?, ?)', [username, passwordHash, name, role, JSON.stringify(perms)]);
    }
}
export async function findAll() {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, username, name, role, isActive, permissions FROM Users ORDER BY name');
    return rows.map(mapUser);
}
export async function updateRoleAndPermissions(id, role, permissions) {
    const pool = await getPool();
    const perms = permissions ?? getDefaultPermissions(role);
    const [result] = await pool.query('UPDATE Users SET role = ?, permissions = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [role, JSON.stringify(perms), id]);
    return result.affectedRows > 0;
}
export async function updateActive(id, isActive) {
    const pool = await getPool();
    const [result] = await pool.query('UPDATE Users SET isActive = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [isActive ? 1 : 0, id]);
    return result.affectedRows > 0;
}
export async function deleteUser(id, reassignToId) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        await connection.query('UPDATE Pedidos SET solicitanteId = ? WHERE solicitanteId = ?', [reassignToId, id]);
        await connection.query('DELETE FROM PedidosEstadoHistorial WHERE usuarioId = ?', [id]);
        const [result] = await connection.query('DELETE FROM Users WHERE id = ?', [id]);
        await connection.commit();
        return result.affectedRows > 0;
    }
    catch (err) {
        await connection.rollback();
        throw err;
    }
    finally {
        connection.release();
    }
}
// Allowed emails for MSAL
export async function findAllowedEmails() {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, email, role, isActive, permissions FROM AllowedEmails ORDER BY email');
    return rows.map((row) => ({
        id: row.id,
        email: row.email,
        role: row.role,
        isActive: row.isActive,
        permissions: parsePermissions(row.permissions, row.role),
    }));
}
export async function findAllowedEmailByEmail(email) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, email, role, isActive, permissions FROM AllowedEmails WHERE email = ?', [email]);
    const row = rows[0];
    if (!row)
        return null;
    return {
        id: row.id,
        email: row.email,
        role: row.role,
        isActive: row.isActive,
        permissions: parsePermissions(row.permissions, row.role),
    };
}
export async function createAllowedEmail(email, role = 'user', permissions) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT 1 AS existsEmail FROM AllowedEmails WHERE email = ? LIMIT 1', [email]);
    if (rows.length > 0)
        return false;
    const perms = permissions ?? getDefaultPermissions(role);
    await pool.query('INSERT INTO AllowedEmails (email, role, permissions) VALUES (?, ?, ?)', [email, role, JSON.stringify(perms)]);
    return true;
}
export async function updateAllowedEmail(id, role, isActive, permissions) {
    const pool = await getPool();
    if (permissions) {
        const [result] = await pool.query('UPDATE AllowedEmails SET role = ?, isActive = ?, permissions = ? WHERE id = ?', [role, isActive ? 1 : 0, JSON.stringify(permissions), id]);
        return result.affectedRows > 0;
    }
    const [result] = await pool.query('UPDATE AllowedEmails SET role = ?, isActive = ? WHERE id = ?', [role, isActive ? 1 : 0, id]);
    return result.affectedRows > 0;
}
export async function deleteAllowedEmail(id) {
    const pool = await getPool();
    const [result] = await pool.query('DELETE FROM AllowedEmails WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
