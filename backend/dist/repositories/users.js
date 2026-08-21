import { getPool } from '../config/db.js';
function mapUser(record) {
    return {
        id: record.id,
        username: record.username,
        name: record.name,
        role: record.role,
        isActive: Boolean(record.isActive),
    };
}
export async function findByUsername(username) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, username, passwordHash, name, role, isActive FROM Users WHERE username = ? AND isActive = 1', [username]);
    const row = rows[0];
    if (!row)
        return null;
    return { ...mapUser(row), passwordHash: row.passwordHash };
}
export async function findByUsernameAll(username) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, username, passwordHash, name, role, isActive FROM Users WHERE username = ?', [username]);
    const row = rows[0];
    if (!row)
        return null;
    return { ...mapUser(row), passwordHash: row.passwordHash };
}
export async function findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, username, name, role, isActive FROM Users WHERE id = ? AND isActive = 1', [id]);
    const row = rows[0];
    return row ? mapUser(row) : null;
}
export async function createUser(username, passwordHash, name, role, isActive = false) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT 1 AS existsUser FROM Users WHERE username = ? LIMIT 1', [username]);
    if (rows.length > 0)
        return false;
    await pool.query('INSERT INTO Users (username, passwordHash, name, role, isActive) VALUES (?, ?, ?, ?, ?)', [username, passwordHash, name, role, isActive ? 1 : 0]);
    return true;
}
export async function upsertUser(username, passwordHash, name, role) {
    const pool = await getPool();
    const [existing] = await pool.query('SELECT id FROM Users WHERE username = ?', [username]);
    if (existing.length > 0) {
        await pool.query('UPDATE Users SET passwordHash = ?, name = ?, role = ?, updatedAt = UTC_TIMESTAMP(6) WHERE username = ?', [passwordHash, name, role, username]);
    }
    else {
        await pool.query('INSERT INTO Users (username, passwordHash, name, role) VALUES (?, ?, ?, ?)', [username, passwordHash, name, role]);
    }
}
export async function findAll() {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, username, name, role, isActive FROM Users ORDER BY name');
    return rows.map(mapUser);
}
export async function updateRole(id, role) {
    const pool = await getPool();
    const [result] = await pool.query('UPDATE Users SET role = ?, updatedAt = UTC_TIMESTAMP(6) WHERE id = ?', [role, id]);
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
// Emails permitidos para MSAL
export async function findEmailsPermitidos() {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, email, role, isActive FROM EmailsPermitidos ORDER BY email');
    return rows.map((row) => ({
        id: row.id,
        email: row.email,
        role: row.role,
        isActive: Boolean(row.isActive),
    }));
}
export async function findEmailPermitidoByEmail(email) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, email, role, isActive FROM EmailsPermitidos WHERE email = ?', [email]);
    const row = rows[0];
    if (!row)
        return null;
    return {
        id: row.id,
        email: row.email,
        role: row.role,
        isActive: Boolean(row.isActive),
    };
}
export async function createEmailPermitido(email, role = 'user') {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT 1 AS existsEmail FROM EmailsPermitidos WHERE email = ? LIMIT 1', [email]);
    if (rows.length > 0)
        return false;
    await pool.query('INSERT INTO EmailsPermitidos (email, role) VALUES (?, ?)', [email, role]);
    return true;
}
export async function updateEmailPermitido(id, role, isActive) {
    const pool = await getPool();
    const [result] = await pool.query('UPDATE EmailsPermitidos SET role = ?, isActive = ? WHERE id = ?', [role, isActive ? 1 : 0, id]);
    return result.affectedRows > 0;
}
export async function deleteEmailPermitido(id) {
    const pool = await getPool();
    const [result] = await pool.query('DELETE FROM EmailsPermitidos WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
