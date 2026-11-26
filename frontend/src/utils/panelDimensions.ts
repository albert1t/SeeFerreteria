export function getPanelDimensions(panelName: string) {
  const match = panelName.match(/^A(\d+)$/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 5) {
      const cols = 4;
      const rows = 8;
      return { cols, rows, total: cols * rows };
    }
    if (num >= 6 && num <= 9) {
      const cols = 5;
      const rows = 10;
      return { cols, rows, total: cols * rows };
    }
  }
  const cols = 6;
  const rows = 15;
  return { cols, rows, total: cols * rows };
}
