import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getPool, closePool } from '../config/db.js';
import { importarDesdeExcel } from '../services/recambiosService.js';

async function importExcel() {
  console.log('Iniciando importación desde Excel...');
  
  // Conectar a la base de datos
  await getPool();

  try {
    // La ruta relativa asume que se ejecuta desde la carpeta backend
    // y el archivo está en la raíz del proyecto.
    const excelPath = resolve(process.cwd(), '../Lista materiales.xlsx');
    console.log(`Leyendo archivo Excel desde: ${excelPath}`);
    
    const buffer = readFileSync(excelPath);
    
    const result = await importarDesdeExcel(buffer);
    
    console.log('--- Resumen de Importación ---');
    console.log(`Filas procesadas: ${result.total}`);
    console.log(`Recambios insertados: ${result.insertados}`);
    
    if (result.errores.length > 0) {
      console.log(`Errores: ${result.errores.length}`);
      console.log('Primeros 5 errores:', result.errores.slice(0, 5));
    }
  } catch (error) {
    console.error('Error durante la importación:', error);
  } finally {
    await closePool();
    console.log('Conexión cerrada.');
  }
}

importExcel().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
