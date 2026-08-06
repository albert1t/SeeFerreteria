import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { getPool } from '../config/db.js';
import * as importacionesRepo from '../repositories/importaciones.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ImportacionCatalogo, ImportacionEstado } from '../types/index.js';

interface FilaParseada {
  codigo: string;
  pvpOrientativo: number;
}

const COLUMNAS_CODIGO = [
  'codigo', 'code', 'partnumber', 'ordernumber', 'ordercode',
  'part no', 'partno', 'reference', 'referencia', 'sku', 'material', 'producto', 'item',
];

const COLUMNAS_PRECIO = [
  'pvp', 'precio', 'price', 'netprice', 'net price', 'listprice', 'list price',
  'precioneto', 'precio neto', 'unitprice', 'unit price', 'importe',
];

function normalizarHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function detectarColumna(headers: string[], candidatos: string[]): string | null {
  const map = new Map(headers.map((h) => [normalizarHeader(h), h]));
  for (const c of candidatos) {
    const found = map.get(normalizarHeader(c));
    if (found) return found;
  }
  return null;
}

function normalizarPrecio(valor: unknown): number | null {
  if (valor === null || valor === undefined) return null;
  let str = String(valor).trim();
  if (!str) return null;

  // Remove common currency symbols and whitespace
  str = str.replace(/[€$£¥\s]/g, '');
  if (!str) return null;

  // Detect decimal separator: the last separator (dot or comma) is the decimal one.
  const lastComma = str.lastIndexOf(',');
  const lastDot = str.lastIndexOf('.');

  if (lastComma > lastDot) {
    // e.g. "1.234,56" -> thousands are dots, decimal is comma
    str = str.replace(/\./g, '').replace(',', '.');
  } else {
    // e.g. "1,234.56" or "1234.56" -> comma is thousands/dot decimal
    str = str.replace(/,/g, '');
  }

  const num = parseFloat(str);
  if (Number.isNaN(num) || !Number.isFinite(num)) return null;
  return num;
}

function parseFila(row: Record<string, unknown>, colCodigo: string, colPrecio: string): FilaParseada | null {
  const rawCodigo = row[colCodigo];
  if (rawCodigo === undefined || rawCodigo === null || String(rawCodigo).trim() === '') {
    return null;
  }
  const codigo = String(rawCodigo).trim();
  const precio = normalizarPrecio(row[colPrecio]);
  if (precio === null) {
    return null;
  }
  return { codigo, pvpOrientativo: precio };
}

const CHUNK_SIZE = 1000;

export async function importarCsv(
  marca: string,
  buffer: Buffer,
  archivoNombre: string | null,
  usuarioId: number,
): Promise<ImportacionCatalogo> {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let colCodigo: string | null = null;
    let colPrecio: string | null = null;
    let totalRegistros = 0;
    let actualizados = 0;
    let errores = 0;
    const erroresDetalle: string[] = [];
    const chunk: FilaParseada[] = [];
    let filaIndex = 0;

    const processChunk = async () => {
      if (chunk.length === 0) return;
      const affected = await importacionesRepo.bulkUpdatePreciosChunk(connection, chunk);
      actualizados += affected;
      chunk.length = 0;
    };

    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from(buffer);
      const parser = csvParser({ mapHeaders: ({ header }) => header.trim() });

      stream
        .pipe(parser)
        .on('headers', (headers: string[]) => {
          colCodigo = detectarColumna(headers, COLUMNAS_CODIGO);
          colPrecio = detectarColumna(headers, COLUMNAS_PRECIO);
          if (!colCodigo || !colPrecio) {
            reject(new AppError(400, `No se detectaron las columnas necesarias en el CSV. Código: ${colCodigo ?? 'no encontrado'}, Precio: ${colPrecio ?? 'no encontrado'}`));
          }
        })
        .on('data', async (row: Record<string, unknown>) => {
          filaIndex++;
          totalRegistros++;
          try {
            const fila = parseFila(row, colCodigo!, colPrecio!);
            if (!fila) {
              errores++;
              if (erroresDetalle.length < 20) {
                erroresDetalle.push(`Fila ${filaIndex}: código o precio inválido`);
              }
              return;
            }
            chunk.push(fila);
            if (chunk.length >= CHUNK_SIZE) {
              parser.pause();
              await processChunk();
              parser.resume();
            }
          } catch (err: any) {
            errores++;
            if (erroresDetalle.length < 20) {
              erroresDetalle.push(`Fila ${filaIndex}: ${err.message || 'error desconocido'}`);
            }
          }
        })
        .on('end', async () => {
          try {
            await processChunk();
            resolve();
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err: Error) => {
          reject(err);
        });
    });

    const estado: ImportacionEstado = actualizados > 0 ? 'completado' : 'fallido';

    // Only a successful import (at least one product actually updated) renews the
    // "last import" date. Failed/empty imports are recorded without fechaFin so the
    // obsolete-pricing alert is not suppressed.
    const [result] = await connection.query(
      `INSERT INTO ImportacionesCatalogo
       (marca, totalRegistros, actualizados, errores, erroresDetalle, estado, archivoNombre, usuarioId, fechaInicio, fechaFin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3), ${estado === 'completado' ? 'UTC_TIMESTAMP(3)' : 'NULL'})`,
      [marca, totalRegistros, actualizados, errores, erroresDetalle.length > 0 ? erroresDetalle.join('\n') : null, estado, archivoNombre, usuarioId],
    );

    await connection.commit();

    const insertId = (result as any).insertId as number;
    const last = await importacionesRepo.findById(insertId);
    if (!last) {
      throw new AppError(500, 'No se pudo recuperar el registro de importación');
    }
    return last;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function getUltimaImportacion(marca: string): Promise<ImportacionCatalogo | null> {
  return importacionesRepo.findLastCompleted(marca);
}
