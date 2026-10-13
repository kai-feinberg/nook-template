import type { LayoutPresetId, WidgetId } from "../state/schema.ts";

export type LayoutPreset = {
  id: LayoutPresetId;
  label: string;
  description: string;
  className: string;
};

export const widgetLabels: Record<WidgetId, string> = {
  quote: "Quotes and reminders",
  rituals: "Rituals",
  quickLinks: "Quick links",
  personalNote: "Personal note",
  curatedArt: "Curated art",
  clock: "Clock"
};

export const layoutPresets: LayoutPreset[] = [
  {
    id: "balanced",
    label: "Balanced",
    description: "A soft shelf with every piece in view.",
    className: "layout-balanced"
  },
  {
    id: "focus",
    label: "Focus",
    description: "More space for tasks, rituals, notes, and links.",
    className: "layout-focus"
  }
];
