import type { DashboardWidgetId, WidgetSize } from "../state/schema.ts";

export const dashboardWidgetIds: DashboardWidgetId[] = ["personalNote", "rituals", "quickLinks", "curatedArt", "quote"];

export function normalizeOrder(value: unknown, fallback: DashboardWidgetId[]): DashboardWidgetId[] {
  const saved = Array.isArray(value) ? value : [];
  return [...new Set([...saved, ...fallback, ...dashboardWidgetIds])]
    .filter((id): id is DashboardWidgetId => dashboardWidgetIds.includes(id as DashboardWidgetId));
}

export function moveWidget(order: DashboardWidgetId[], id: DashboardWidgetId, target: DashboardWidgetId): DashboardWidgetId[] {
  if (id === target || !order.includes(id) || !order.includes(target)) return order;
  const targetIndex = order.indexOf(target);
  const moved = order.filter(item => item !== id);
  moved.splice(targetIndex, 0, id);
  return moved;
}

export function isWidgetSize(value: unknown): value is WidgetSize {
  return value === "small" || value === "medium" || value === "large";
}
