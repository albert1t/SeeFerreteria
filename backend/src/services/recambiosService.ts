import * as recambiosRepo from '../repositories/recambios.js';
import { AppError } from '../middleware/errorHandler.js';
import * as xlsx from 'xlsx';
import type { Recambio, RecambioPreview } from '../types/index.js';
import * as catalogosRepo from '../repositories/catalogos.js';

export async function listRecambios(filters: {
  panel?: string;
  busqueda?: string;
  incluirOcultos?: boolean;
}): Promise<Recambio[]> {
  return recambiosRepo.findAll(filters);
}

export async function getPreview(incluirOcultos = false): Promise<RecambioPreview[]> {
  return recambiosRepo.findPreview(incluirOcultos);
}

export async function getRecambio(id: number): Promise<Recambio> {
  const recambio = await recambiosRepo.findById(id);
  if (!recambio) throw new AppError(404, 'Recambio no encontrado');
  return recambio;
}

export async function getRecambioByRef(ref: string): Promise<Recambio> {
  const recambio = await recambiosRepo.findByReferencia(ref);
  if (!recambio) throw new AppError(404, 'Referencia no encontrada');
  return recambio;
}

async function validateUbicacion(panel: string, col: number, row: number, excludeId?: number): Promise<void> {
  const p = panel.toUpperCase();
  const match = p.match(/^A(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 9) {
      if (col < 1 || col > 6 || row < 1 || row > 15) {
        throw new AppError(400, `Ubicación fuera de rango para panel ${panel} (límite: 6x15)`, 'UBICACION_RANGO_INVALIDO');
      }
    } else if (num >= 10 && num <= 25) {
      if (col < 1 || col > 5 || row < 1 || row > 10) {
        throw new AppError(400, `Ubicación fuera de rango para panel ${panel} (límite: 5x10)`, 'UBICACION_RANGO_INVALIDO');
      }
    }
  }

  const ocupada = await recambiosRepo.findByUbicacion(panel, col, row, excludeId);
  if (ocupada) {
    throw new AppError(409, `La cubeta ${panel} C${col}F${row} ya está ocupada`, 'CUBETA_OCUPADA');
  }
}

export async function createRecambio(
  data: Parameters<typeof recambiosRepo.create>[0],
  skipDupeCheck = false,
): Promise<Recambio> {
  if (!skipDupeCheck) {
    const existingRef = await recambiosRepo.findByReferencia(data.referenciaCMH);
    if (existingRef) {
      throw new AppError(409, 'La referencia CMH ya existe');
    }
  }
  await validateUbicacion(data.panel, data.col, data.row);
  return recambiosRepo.create({
    ...data,
    imagen: data.imagen || `https://placehold.co/120x120/1e3a5f/ffffff?text=${encodeURIComponent(data.referenciaCMH)}`,
    oculto: false,
  });
}

export async function updateRecambio(id: number, data: Partial<Recambio>): Promise<Recambio> {
  const existing = await recambiosRepo.findById(id);
  if (!existing) throw new AppError(404, 'Recambio no encontrado');

  const panel = data.panel ?? existing.panel;
  const col = data.col ?? existing.col;
  const row = data.row ?? existing.row;

  if (panel !== existing.panel || col !== existing.col || row !== existing.row) {
    await validateUbicacion(panel, col, row, id);
  }

  if (data.referenciaCMH && data.referenciaCMH !== existing.referenciaCMH) {
    const dup = await recambiosRepo.findByReferencia(data.referenciaCMH);
    if (dup) throw new AppError(409, 'La referencia CMH ya existe');
  }

  const updated = await recambiosRepo.update(id, data);
  if (!updated) throw new AppError(404, 'Recambio no encontrado');
  return updated;
}

export async function toggleOculto(id: number): Promise<Recambio> {
  const existing = await recambiosRepo.findById(id);
  if (!existing) throw new AppError(404, 'Recambio no encontrado');
  const updated = await recambiosRepo.setOculto(id, !existing.oculto);
  if (!updated) throw new AppError(404, 'Recambio no encontrado');
  return updated;
}

export async function deleteRecambio(id: number): Promise<void> {
  const ok = await recambiosRepo.remove(id);
  if (!ok) {
    const existing = await recambiosRepo.findById(id);
    if (!existing) throw new AppError(404, 'Recambio no encontrado');
    throw new AppError(409, 'No se puede eliminar: el recambio tiene pedidos asociados (activos o finalizados)');
  }
}

export async function getPaneles() {
  return recambiosRepo.getPanelResumen();
}

export async function getCubetasPanel(panel: string, incluirOcultos = false) {
  return recambiosRepo.getCubetasByPanel(panel, incluirOcultos);
}

export async function swapPositions(id1: number, id2: number): Promise<{ r1: Recambio; r2: Recambio }> {
  const r1 = await recambiosRepo.findById(id1);
  const r2 = await recambiosRepo.findById(id2);
  if (!r1) throw new AppError(404, `Recambio ${id1} no encontrado`);
  if (!r2) throw new AppError(404, `Recambio ${id2} no encontrado`);

  await recambiosRepo.swapPositions(id1, id2);

  const tmpPanel = r1.panel, tmpCol = r1.col, tmpRow = r1.row;
  r1.panel = r2.panel; r1.col = r2.col; r1.row = r2.row;
  r2.panel = tmpPanel; r2.col = tmpCol; r2.row = tmpRow;

  return { r1, r2 };
}

export async function getPanelOcupacion(panel: string) {
  return recambiosRepo.getPanelOccupancy(panel);
}

export async function importarDesdeExcel(buffer: Buffer): Promise<{ total: number, insertados: number, errores: any[] }> {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const familiasDB = await catalogosRepo.getFamilias();

  // First pass: collect all references to batch-check duplicates
  const allRows: { sheetName: string; row: Record<string, any> }[] = [];
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<Record<string, any>>(worksheet);
    rows.forEach((row) => allRows.push({ sheetName, row }));
  }

  const allRefs = allRows
    .map(({ row }) => {
      const getVal = (keys: string[]) => {
        for (const key of keys) {
          const match = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
          if (match) return row[match];
        }
        return undefined;
      };
      return getVal(['Referencia CMH', 'Ref CMH', 'Referencia', 'Ref', 'referenciacmh']);
    })
    .filter(Boolean)
    .map(String);

  const existingRefs = allRefs.length > 0 ? await recambiosRepo.findExistingReferencias(allRefs) : new Set<string>();

  let total = 0;
  let insertados = 0;
  const errores: any[] = [];

  for (const { sheetName, row } of allRows) {
    total++;
    try {
      const getVal = (keys: string[]) => {
        for (const key of keys) {
          const match = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
          if (match) return row[match];
        }
        return undefined;
      };

      const referenciaCMH = getVal(['Referencia CMH', 'Ref CMH', 'Referencia', 'Ref', 'referenciacmh']);
      if (!referenciaCMH) { total--; continue; }

      if (existingRefs.has(String(referenciaCMH))) { total--; continue; }

        const colRaw = parseInt(getVal(['Col', 'Columna', 'C']) ?? '1', 10);
        const rowNumRaw = parseInt(getVal(['Row', 'Fila', 'F']) ?? '1', 10);

        let famVal = getVal(['Familia ID', 'FamiliaId', 'Familia']);
        let famId = 1;
        if (famVal) {
          const parsed = parseInt(String(famVal), 10);
          if (!isNaN(parsed)) {
            famId = parsed;
          } else {
            const matched = familiasDB.find(f => f.nombre.trim().toLowerCase() === String(famVal).trim().toLowerCase());
            if (matched) famId = matched.id;
          }
        }

        const newRecambio = {
          referenciaCMH: String(referenciaCMH),
          referenciaCliente: getVal(['Referencia Cliente', 'Ref Cliente', 'referenciacliente']) ? String(getVal(['Referencia Cliente', 'Ref Cliente', 'referenciacliente'])) : null,
          codigo: getVal(['Codigo', 'Código']) ? String(getVal(['Codigo', 'Código'])) : null,
          nombre: getVal(['Nombre', 'Descripción', 'Descripcion']) ? String(getVal(['Nombre', 'Descripción', 'Descripcion'])) : String(referenciaCMH),
          marca: getVal(['Marca']) ? String(getVal(['Marca'])) : null,
          descripcion: getVal(['Descripcion', 'Descripción', 'Descripcion Larga', 'Descripción Larga', 'Descripcion Corta', 'Descripción Corta']) ? String(getVal(['Descripcion', 'Descripción', 'Descripcion Larga', 'Descripción Larga', 'Descripcion Corta', 'Descripción Corta'])) : null,
          metrica: getVal(['Metrica', 'Métrica', 'Dimensiones', 'Medida']) ? String(getVal(['Metrica', 'Métrica', 'Dimensiones', 'Medida'])) : null,
          unidadEmbalaje: getVal(['Unidad Embalaje', 'Ud. Embalaje', 'Uds', 'Unidad de embalaje', 'unidadembalaje']) ? String(getVal(['Unidad Embalaje', 'Ud. Embalaje', 'Uds', 'Unidad de embalaje', 'unidadembalaje'])) : null,
          imagen: getVal(['Imagen']) ? String(getVal(['Imagen'])) : null,
          plazoEntrega: getVal(['Plazo Entrega', 'Plazo', 'plazoentrega']) ? String(getVal(['Plazo Entrega', 'Plazo', 'plazoentrega'])) : null,
          familiaId: famId,
          nReposicion: parseInt(getVal(['N Reposicion', 'N. Reposicion', 'NReposicion', 'nreposicion']) ?? '1', 10),
          oculto: false,
          panel: sheetName,
          col: isNaN(colRaw) ? 1 : colRaw,
          row: isNaN(rowNumRaw) ? 1 : rowNumRaw,
        };

        await createRecambio(newRecambio, true);
        insertados++;
      } catch (error: any) {
        errores.push({ hoja: sheetName, fila: row, error: error.message });
      }
  }

  return { total, insertados, errores };
}