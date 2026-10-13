import { createDefaultState } from "./defaultState.ts";
import { normalizeOrder, isWidgetSize, dashboardWidgetIds } from "../layouts/grid.ts";
import type { NookState } from "./schema.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mergeDeep<T>(fallback: T, stored: unknown): T {
  if (Array.isArray(fallback)) return (Array.isArray(stored) ? stored : fallback) as T;
  if (!isRecord(fallback)) return (typeof stored === typeof fallback && stored !== null ? stored : fallback) as T;
  if (!isRecord(stored) || Array.isArray(stored)) return fallback;

  const merged: Record<string, unknown> = { ...fallback };
  for (const [key, value] of Object.entries(stored)) {
    merged[key] = key in merged ? mergeDeep(merged[key], value) : value;
  }
  return merged as T;
}

export function migrateNookState(stored: unknown): NookState {
  const fallback = createDefaultState();

  if (!isRecord(stored) || stored.schemaVersion !== 1) {
    return fallback;
  }

  const migrated = mergeDeep(fallback, stored);
  migrated.settings.widgetOrder = normalizeOrder(migrated.settings.widgetOrder, fallback.settings.widgetOrder);
  migrated.settings.widgetSizes = Object.fromEntries(dashboardWidgetIds.map(id => [
    id, isWidgetSize(migrated.settings.widgetSizes?.[id]) ? migrated.settings.widgetSizes[id] : fallback.settings.widgetSizes[id]
  ])) as NookState["settings"]["widgetSizes"];
  // Removed widgets and their cached data must not return from older saved states.
  migrated.settings.widgetVisibility = Object.fromEntries(Object.keys(fallback.settings.widgetVisibility).map(id => [
    id, typeof migrated.settings.widgetVisibility?.[id as keyof typeof fallback.settings.widgetVisibility] === "boolean"
      ? migrated.settings.widgetVisibility[id as keyof typeof fallback.settings.widgetVisibility]
      : fallback.settings.widgetVisibility[id as keyof typeof fallback.settings.widgetVisibility]
  ])) as NookState["settings"]["widgetVisibility"];
  const clean = migrated as NookState & { cache?: unknown };
  delete clean.cache;
  const colorToken = migrated.settings.appearance.background.colorToken as string;
  if (colorToken === "starryNight" || colorToken === "campfireGlow" || colorToken === "moonlit") {
    migrated.settings.appearance.background.colorToken = "nightSky";
  }
  if (
    colorToken !== "butterCream" &&
    colorToken !== "cloudPaper" &&
    colorToken !== "oatMist" &&
    colorToken !== "nightSky" &&
    colorToken !== "butterCreamHalftone" &&
    colorToken !== "nightSkyHalftone"
  ) {
    migrated.settings.appearance.background.colorToken = fallback.settings.appearance.background.colorToken;
  }
  return migrated;
}
