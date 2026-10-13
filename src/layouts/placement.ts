import type { DashboardWidgetId, GridPlacement, WidgetSize } from "../state/schema.ts";

export function initialPlacement(ids: DashboardWidgetId[], sizes: Record<DashboardWidgetId, WidgetSize>, cols: number): GridPlacement[] {
  const heights = Array(cols).fill(0) as number[];
  return ids.map(i => {
    const w = cols === 4 ? 4 : sizes[i] === "large" ? Math.round(cols * 2 / 3) : Math.round(cols / 3);
    const h = sizes[i] === "large" ? 9 : sizes[i] === "medium" ? 7 : 5;
    let x = 0, y = Infinity;
    for (let column = 0; column <= cols - w; column++) {
      const top = Math.max(...heights.slice(column, column + w));
      if (top < y) { x = column; y = top; }
    }
    for (let column = x; column < x + w; column++) heights[column] = y + h;
    return { i, x, y, w, h };
  });
}

export function validPlacement(items: unknown, ids: DashboardWidgetId[], cols: number): GridPlacement[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items.flatMap(item => {
    if (!item || !ids.includes(item.i) || seen.has(item.i) ||
      ![item.x, item.y, item.w, item.h].every(Number.isInteger) || item.x < 0 || item.y < 0 ||
      item.w < 1 || item.h < 3 || item.x + item.w > cols || item.h > 16 || item.y > 200) return [];
    seen.add(item.i);
    return [{ i: item.i, x: item.x, y: item.y, w: item.w, h: item.h }];
  });
}
