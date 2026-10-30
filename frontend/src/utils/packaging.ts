export function unitsPerPackage(packaging: string | null | undefined): number {
  const match = packaging?.match(/(\d+(?:[.,]\d+)?)/);
  const value = match ? Number(match[1].replace(',', '.')) : 1;
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function packageBreakdown(packaging: string | null | undefined, packages: number) {
  return {
    units: unitsPerPackage(packaging),
    packages,
    total: unitsPerPackage(packaging) * packages,
  };
}
