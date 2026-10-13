import { templateConfig } from "../template.config.ts";
import type { NookState, WidgetId } from "./schema.ts";

const now = "2026-05-04T00:00:00.000Z";

export const defaultWidgetVisibility: Record<WidgetId, boolean> = templateConfig.widgets;

export const defaultState: NookState = {
  schemaVersion: 1,
  settings: {
    selectedLayout: templateConfig.layout,
    widgetVisibility: defaultWidgetVisibility,
    appearance: {
      background: {
        type: "solid",
        colorToken: templateConfig.background
      },
      showArtCaption: true,
      reducedMotionOverride: "system"
    }
  },
  widgets: {
    rituals: {
      items: templateConfig.rituals.map((label, index) => ({
        id: `ritual-${index}`, label, createdAt: now, updatedAt: now
      })),
      completions: []
    },
    quickLinks: {
      links: templateConfig.quickLinks.map((link, index) => ({
        ...link, id: `link-${index}`, createdAt: now, updatedAt: now
      }))
    },
    personalNote: {
      text: templateConfig.note,
      updatedAt: now
    },
    curatedArt: {
      currentArtId: templateConfig.art[0]?.id ?? "",
      lastRotatedAt: now
    }
  },
  cache: {
    githubTrending: {
      repositories: [],
      fetchedAt: null,
      stale: false
    }
  },
  meta: {
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now
  }
};

export function createDefaultState(): NookState {
  const timestamp = new Date().toISOString();
  return {
    ...structuredClone(defaultState),
    widgets: {
      ...structuredClone(defaultState.widgets),
      curatedArt: {
        ...defaultState.widgets.curatedArt,
        lastRotatedAt: timestamp
      }
    },
    meta: {
      createdAt: timestamp,
      updatedAt: timestamp,
      lastOpenedAt: timestamp
    }
  };
}
