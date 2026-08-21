import * as productsRepo from '../repositories/products.js';
import { AppError } from '../middleware/errorHandler.js';
import * as xlsx from 'xlsx';
import type { Product, ProductPreview } from '../types/index.js';
import * as catalogsRepo from '../repositories/catalogs.js';

export async function listProducts(filters: {
  panel?: string;
  busqueda?: string;
  incluirOcultos?: boolean;
}): Promise<Product[]> {
  return productsRepo.findAll(filters);
}

export async function getPreview(incluirOcultos = false): Promise<ProductPreview[]> {
  return productsRepo.findPreview(incluirOcultos);
}

export async function getRecambio(id: number): Promise<Product> {
  const product = await productsRepo.findById(id);
  if (!product) throw new AppError(404, 'Product no encontrado');
  return product;
}

export async function getRecambioByRef(ref: string): Promise<Product> {
  const product = await productsRepo.findByReferencia(ref);
  if (!product) throw new AppError(404, 'Referencia no encontrada');
  return product;
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

  const ocupada = await productsRepo.findByUbicacion(panel, col, row, excludeId);
  if (ocupada) {
    throw new AppError(409, `La cubeta ${panel} C${col}F${row} ya está ocupada`, 'CUBETA_OCUPADA');
  }
}

export async function createProduct(
  data: Parameters<typeof productsRepo.create>[0],
  skipDupeCheck = false,
): Promise<Product> {
  if (!skipDupeCheck) {
    const existingRef = await productsRepo.findByReferencia(data.cmhReference);
    if (existingRef) {
      throw new AppError(409, 'La referencia CMH ya existe');
    }
  }
  await validateUbicacion(data.panel, data.col, data.row);
  return productsRepo.create({
    ...data,
    pvpOrientativo: data.pvpOrientativo ?? null,
    pvpOrientativoMoneda: data.pvpOrientativoMoneda ?? 'EUR',
    image: data.image || `https://placehold.co/120x120/1e3a5f/ffffff?text=${encodeURIComponent(data.cmhReference)}`,
    hidden: false,
  });
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const existing = await productsRepo.findById(id);
  if (!existing) throw new AppError(404, 'Product no encontrado');

  const panel = data.panel ?? existing.panel;
  const col = data.col ?? existing.col;
  const row = data.row ?? existing.row;

  if (panel !== existing.panel || col !== existing.col || row !== existing.row) {
    await validateUbicacion(panel, col, row, id);
  }

  if (data.cmhReference && data.cmhReference !== existing.cmhReference) {
    const dup = await productsRepo.findByReferencia(data.cmhReference);
    if (dup) throw new AppError(409, 'La referencia CMH ya existe');
  }

  const updated = await productsRepo.update(id, data);
  if (!updated) throw new AppError(404, 'Product no encontrado');
  return updated;
}

export async function toggleOculto(id: number): Promise<Product> {
  const existing = await productsRepo.findById(id);
  if (!existing) throw new AppError(404, 'Product no encontrado');
  const updated = await productsRepo.setOculto(id, !existing.hidden);
  if (!updated) throw new AppError(404, 'Product no encontrado');
  return updated;
}

export async function deleteProduct(id: number): Promise<void> {
  const ok = await productsRepo.remove(id);
  if (!ok) {
    const existing = await productsRepo.findById(id);
    if (!existing) throw new AppError(404, 'Product no encontrado');
    throw new AppError(409, 'No se puede eliminar: el product tiene orders asociados (activos o finalizados)');
  }
}

export async function getPanels() {
  return productsRepo.getPanelSummary();
}

export async function getCubetasPanel(panel: string, incluirOcultos = false) {
  return productsRepo.getCubetasByPanel(panel, incluirOcultos);
}

export async function swapPositions(id1: number, id2: number): Promise<{ r1: Product; r2: Product }> {
  const r1 = await productsRepo.findById(id1);
  const r2 = await productsRepo.findById(id2);
  if (!r1) throw new AppError(404, `Product ${id1} no encontrado`);
  if (!r2) throw new AppError(404, `Product ${id2} no encontrado`);

  await productsRepo.swapPositions(id1, id2);

  const tmpPanel = r1.panel, tmpCol = r1.col, tmpRow = r1.row;
  r1.panel = r2.panel; r1.col = r2.col; r1.row = r2.row;
  r2.panel = tmpPanel; r2.col = tmpCol; r2.row = tmpRow;

  return { r1, r2 };
}

export async function getPanelOcupacion(panel: string) {
  return productsRepo.getPanelOccupancy(panel);
}

export async function importFromExcel(buffer: Buffer): Promise<{ total: number, insertados: number, errors: any[] }> {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const familiesDB = await catalogsRepo.getFamilies();

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

  const existingRefs = allRefs.length > 0 ? await productsRepo.findExistingReferencias(allRefs) : new Set<string>();

  let total = 0;
  let insertados = 0;
  const errors: any[] = [];

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

      const cmhReference = getVal(['Referencia CMH', 'Ref CMH', 'Referencia', 'Ref', 'referenciacmh']);
      if (!cmhReference) { total--; continue; }

      if (existingRefs.has(String(cmhReference))) { total--; continue; }

        const colRaw = parseInt(getVal(['Col', 'Columna', 'C']) ?? '1', 10);
        const rowNumRaw = parseInt(getVal(['Row', 'Fila', 'F']) ?? '1', 10);

        let famVal = getVal(['Family ID', 'FamiliaId', 'Family']);
        let famId = 1;
        if (famVal) {
          const parsed = parseInt(String(famVal), 10);
          if (!isNaN(parsed)) {
            famId = parsed;
          } else {
            const matched = familiesDB.find(f => f.name.trim().toLowerCase() === String(famVal).trim().toLowerCase());
            if (matched) famId = matched.id;
          }
        }

        const newRecambio = {
          cmhReference: String(cmhReference),
          customerReference: getVal(['Referencia Cliente', 'Ref Cliente', 'referenciacliente']) ? String(getVal(['Referencia Cliente', 'Ref Cliente', 'referenciacliente'])) : null,
          code: getVal(['Codigo', 'Código']) ? String(getVal(['Codigo', 'Código'])) : null,
          name: getVal(['Nombre', 'Descripción', 'Descripcion']) ? String(getVal(['Nombre', 'Descripción', 'Descripcion'])) : String(cmhReference),
          brand: getVal(['Marca']) ? String(getVal(['Marca'])) : null,
          description: getVal(['Descripcion', 'Descripción', 'Descripcion Larga', 'Descripción Larga', 'Descripcion Corta', 'Descripción Corta']) ? String(getVal(['Descripcion', 'Descripción', 'Descripcion Larga', 'Descripción Larga', 'Descripcion Corta', 'Descripción Corta'])) : null,
          metric: getVal(['Metrica', 'Métrica', 'Dimensiones', 'Medida']) ? String(getVal(['Metrica', 'Métrica', 'Dimensiones', 'Medida'])) : null,
          packagingUnit: getVal(['Unidad Embalaje', 'Ud. Embalaje', 'Uds', 'Unidad de embalaje', 'unidadembalaje']) ? String(getVal(['Unidad Embalaje', 'Ud. Embalaje', 'Uds', 'Unidad de embalaje', 'unidadembalaje'])) : null,
          pvpOrientativo: null,
          pvpOrientativoMoneda: 'EUR',
          image: getVal(['Imagen']) ? String(getVal(['Imagen'])) : null,
          deliveryTime: getVal(['Plazo Entrega', 'Plazo', 'plazoentrega']) ? String(getVal(['Plazo Entrega', 'Plazo', 'plazoentrega'])) : null,
          familyId: famId,
          reorderPoint: parseInt(getVal(['N Reposicion', 'N. Reposicion', 'NReposicion', 'nreposicion']) ?? '1', 10),
          hidden: false,
          panel: sheetName,
          col: isNaN(colRaw) ? 1 : colRaw,
          row: isNaN(rowNumRaw) ? 1 : rowNumRaw,
        };

        await createProduct(newRecambio, true);
        insertados++;
      } catch (error: any) {
        errors.push({ hoja: sheetName, fila: row, error: error.message });
      }
  }

  return { total, insertados, errors };
}