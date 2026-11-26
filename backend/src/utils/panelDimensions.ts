export interface PanelDimensions {
  cols: number;
  rows: number;
}

export function getPanelDimensions(panelName: string): PanelDimensions {
  const match = panelName.match(/^A(\d+)$/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 5) {
      return { cols: 4, rows: 8 };
    }
    if (num >= 6 && num <= 9) {
      return { cols: 5, rows: 10 };
    }
  }

  return { cols: 6, rows: 15 };
}
