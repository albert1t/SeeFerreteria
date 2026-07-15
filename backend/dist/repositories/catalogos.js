import { getPool } from '../config/db.js';
export async function getFamilias() {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, nombre, descripcion FROM Familias ORDER BY nombre');
    return rows.map((f) => ({
        id: f.id,
        nombre: f.nombre,
        descripcion: f.descripcion,
    }));
}
export async function createFamilia(nombre, descripcion) {
    const pool = await getPool();
    const [exists] = await pool.query('SELECT 1 AS existsUser FROM Familias WHERE nombre = ? LIMIT 1', [nombre]);
    if (exists.length > 0)
        return false;
    await pool.query('INSERT INTO Familias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion ?? null]);
    return true;
}
export async function updateFamilia(id, nombre, descripcion) {
    const pool = await getPool();
    const [result] = await pool.query('UPDATE Familias SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion ?? null, id]);
    return result.affectedRows > 0;
}
export async function deleteFamilia(id) {
    const pool = await getPool();
    const [result] = await pool.query('DELETE FROM Familias WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
