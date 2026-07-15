import { getPool, closePool } from '../config/db.js';
async function migrate() {
    console.log('Iniciando migración de restricciones de base de datos...');
    const pool = await getPool();
    // 1. Buscar nombres de restricciones CHECK en la tabla Recambios para 'col' y 'row'
    const findConstraintsQuery = `
    SELECT 
        cc.name AS constraint_name,
        col.name AS column_name
    FROM 
        sys.check_constraints cc
    INNER JOIN 
        sys.columns col ON cc.parent_object_id = col.object_id AND cc.parent_column_id = col.column_id
    WHERE 
        cc.parent_object_id = OBJECT_ID('Recambios')
        AND col.name IN ('col', 'row')
  `;
    const result = await pool.request().query(findConstraintsQuery);
    const constraints = result.recordset;
    console.log(`Encontradas ${constraints.length} restricciones CHECK activas en Recambios.`);
    // 2. Eliminar las restricciones encontradas
    for (const c of constraints) {
        const constraintName = c.constraint_name;
        const columnName = c.column_name;
        console.log(`Eliminando restricción: ${constraintName} de la columna: ${columnName}...`);
        await pool.request().query(`ALTER TABLE Recambios DROP CONSTRAINT [${constraintName}]`);
        console.log(`  ✓ Restricción ${constraintName} eliminada.`);
    }
    // 3. Añadir las nuevas restricciones CHECK relajadas
    console.log('Añadiendo nueva restricción CHECK para columnas (1 a 6)...');
    await pool.request().query('ALTER TABLE Recambios ADD CONSTRAINT CK_Recambios_col CHECK (col BETWEEN 1 AND 6)');
    console.log('  ✓ Restricción CK_Recambios_col añadida.');
    console.log('Añadiendo nueva restricción CHECK para filas (1 a 15)...');
    await pool.request().query('ALTER TABLE Recambios ADD CONSTRAINT CK_Recambios_row CHECK (row BETWEEN 1 AND 15)');
    console.log('  ✓ Restricción CK_Recambios_row añadida.');
    await closePool();
    console.log('Migración completada con éxito.');
}
migrate().catch(async (err) => {
    console.error('La migración falló:', err);
    try {
        await closePool();
    }
    catch { }
    process.exit(1);
});
