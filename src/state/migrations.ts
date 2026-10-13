import { createDefaultState } from "./defaultState.ts";
import type { NookState } from "./schema.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mergeDeep<T>(fallback: T, stored: unknown): T {
  if (!isRecord(fallback) || !isRecord(stored) || Array.isArray(fallback)) {
    return stored === undefined ? fallback : (stored as T);
  }

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
