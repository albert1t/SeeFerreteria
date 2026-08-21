import { getPool } from '../config/db.js';
export async function getFamilies() {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, name, description FROM Families ORDER BY name');
    return rows.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
    }));
}
export async function createFamilia(name, description) {
    const pool = await getPool();
    const [exists] = await pool.query('SELECT 1 AS existsUser FROM Families WHERE name = ? LIMIT 1', [name]);
    if (exists.length > 0)
        return false;
    await pool.query('INSERT INTO Families (name, description) VALUES (?, ?)', [name, description ?? null]);
    return true;
}
export async function updateFamilia(id, name, description) {
    const pool = await getPool();
    const [result] = await pool.query('UPDATE Families SET name = ?, description = ? WHERE id = ?', [name, description ?? null, id]);
    return result.affectedRows > 0;
}
export async function deleteFamilia(id) {
    const pool = await getPool();
    const [result] = await pool.query('DELETE FROM Families WHERE id = ?', [id]);
    return result.affectedRows > 0;
}
