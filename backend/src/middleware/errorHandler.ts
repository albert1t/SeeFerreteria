import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Datos inválidos',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // Red de seguridad: si un campo obligatorio llega null/undefined sin que zod lo pille
  // (p.ej. una validación desalineada con el NOT NULL real de la columna), que el error
  // diga qué falta en vez de un 500 genérico.
  const mysqlCode = (err as { code?: string }).code;
  if (mysqlCode === 'ER_BAD_NULL_ERROR') {
    const column = (err as { sqlMessage?: string }).sqlMessage?.match(/Column '(\w+)'/)?.[1];
    res.status(400).json({ error: column ? `Falta el campo obligatorio: ${column}` : 'Faltan campos obligatorios' });
    return;
  }
  if (mysqlCode === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'Ya existe un registro con ese valor' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
