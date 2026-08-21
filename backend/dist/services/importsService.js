import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { getPool } from '../config/db.js';
import * as importsRepo from '../repositories/imports.js';
import { AppError } from '../middleware/errorHandler.js';
const COLUMNAS_CODIGO = [
    'code', 'code', 'partnumber', 'ordernumber', 'ordercode',
    'part no', 'partno', 'reference', 'referencia', 'sku', 'material', 'producto', 'item',
];
const COLUMNAS_PRECIO = [
    'pvp', 'precio', 'price', 'netprice', 'net price', 'listprice', 'list price',
    'precioneto', 'precio neto', 'unitprice', 'unit price', 'importe',
];
function normalizarHeader(header) {
    return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}
function detectarColumna(headers, candidatos) {
    const map = new Map(headers.map((h) => [normalizarHeader(h), h]));
    for (const c of candidatos) {
        const found = map.get(normalizarHeader(c));
        if (found)
            return found;
    }
    return null;
}
function normalizarPrecio(valor) {
    if (valor === null || valor === undefined)
        return null;
    let str = String(valor).trim();
    if (!str)
        return null;
    // Remove common currency symbols and whitespace
    str = str.replace(/[€$£¥\s]/g, '');
    if (!str)
        return null;
    // Detect decimal separator: the last separator (dot or comma) is the decimal one.
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    if (lastComma > lastDot) {
        // e.g. "1.234,56" -> thousands are dots, decimal is comma
        str = str.replace(/\./g, '').replace(',', '.');
    }
    else {
        // e.g. "1,234.56" or "1234.56" -> comma is thousands/dot decimal
        str = str.replace(/,/g, '');
    }
    const num = parseFloat(str);
    if (Number.isNaN(num) || !Number.isFinite(num))
        return null;
    return num;
}
function parseFila(row, colCodigo, colPrecio) {
    const rawCodigo = row[colCodigo];
    if (rawCodigo === undefined || rawCodigo === null || String(rawCodigo).trim() === '') {
        return null;
    }
    const code = String(rawCodigo).trim();
    const precio = normalizarPrecio(row[colPrecio]);
    if (precio === null) {
        return null;
    }
    return { code, pvpOrientativo: precio };
}
const CHUNK_SIZE = 1000;
export async function importCsv(brand, buffer, fileName, userId) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        let colCodigo = null;
        let colPrecio = null;
        let totalRecords = 0;
        let updated = 0;
        let errors = 0;
        const errorDetails = [];
        const chunk = [];
        let filaIndex = 0;
        const processChunk = async () => {
            if (chunk.length === 0)
                return;
            const affected = await importsRepo.bulkUpdatePreciosChunk(connection, chunk);
            updated += affected;
            chunk.length = 0;
        };
        await new Promise((resolve, reject) => {
            const stream = Readable.from(buffer);
            const parser = csvParser({ mapHeaders: ({ header }) => header.trim() });
            stream
                .pipe(parser)
                .on('headers', (headers) => {
                colCodigo = detectarColumna(headers, COLUMNAS_CODIGO);
                colPrecio = detectarColumna(headers, COLUMNAS_PRECIO);
                if (!colCodigo || !colPrecio) {
                    reject(new AppError(400, `No se detectaron las columnas necesarias en el CSV. Código: ${colCodigo ?? 'no encontrado'}, Precio: ${colPrecio ?? 'no encontrado'}`));
                }
            })
                .on('data', async (row) => {
                filaIndex++;
                totalRecords++;
                try {
                    const fila = parseFila(row, colCodigo, colPrecio);
                    if (!fila) {
                        errors++;
                        if (errorDetails.length < 20) {
                            errorDetails.push(`Fila ${filaIndex}: código o precio inválido`);
                        }
                        return;
                    }
                    chunk.push(fila);
                    if (chunk.length >= CHUNK_SIZE) {
                        parser.pause();
                        await processChunk();
                        parser.resume();
                    }
                }
                catch (err) {
                    errors++;
                    if (errorDetails.length < 20) {
                        errorDetails.push(`Fila ${filaIndex}: ${err.message || 'error desconocido'}`);
                    }
                }
            })
                .on('end', async () => {
                try {
                    await processChunk();
                    resolve();
                }
                catch (err) {
                    reject(err);
                }
            })
                .on('error', (err) => {
                reject(err);
            });
        });
        const status = updated > 0 ? 'completado' : 'fallido';
        // Only a successful import (at least one product actually updated) renews the
        // "last import" date. Failed/empty imports are recorded without finishedAt so the
        // obsolete-pricing alert is not suppressed.
        const [result] = await connection.query(`INSERT INTO CatalogImports
       (brand, totalRecords, updated, errors, errorDetails, status, fileName, userId, startedAt, finishedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3), ${status === 'completado' ? 'UTC_TIMESTAMP(3)' : 'NULL'})`, [brand, totalRecords, updated, errors, errorDetails.length > 0 ? errorDetails.join('\n') : null, status, fileName, userId]);
        await connection.commit();
        const insertId = result.insertId;
        const last = await importsRepo.findById(insertId);
        if (!last) {
            throw new AppError(500, 'No se pudo recuperar el registro de importación');
        }
        return last;
    }
    catch (err) {
        await connection.rollback();
        throw err;
    }
    finally {
        connection.release();
    }
}
export async function getUltimaImportacion(brand) {
    return importsRepo.findLastCompleted(brand);
}
