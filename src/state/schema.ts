export type LayoutPresetId = "balanced" | "focus";

export type WidgetId =
  | "quote"
  | "rituals"
  | "quickLinks"
  | "personalNote"
  | "curatedArt"
  | "clock";

export type DashboardWidgetId = Exclude<WidgetId, "clock">;
export type WidgetSize = "small" | "medium" | "large";

export type GridPlacement = { i: DashboardWidgetId; x: number; y: number; w: number; h: number };

export type NookState = {
  schemaVersion: 1;
  settings: NookSettings;
  widgets: WidgetState;
  meta: NookMeta;
};

export type NookSettings = {
  selectedLayout: LayoutPresetId;
  widgetVisibility: Record<WidgetId, boolean>;
  widgetOrder: DashboardWidgetId[];
  widgetSizes: Record<DashboardWidgetId, WidgetSize>;
  gridLayouts: Record<string, GridPlacement[]>;
  photoSource: "starter" | "personal";
  wordsSource: "starter" | "personal";
  appearance: {
    background: {
      type: "solid";
      colorToken: "butterCream" | "cloudPaper" | "oatMist" | "nightSky" | "butterCreamHalftone" | "nightSkyHalftone";
    };
    showArtCaption: boolean;
    reducedMotionOverride: "system" | "reduced";
  };
};

export type WidgetState = {
  dailyWords: { items: WordEntry[] };
  rituals: RitualsWidgetState;
  quickLinks: QuickLinksWidgetState;
  personalNote: PersonalNoteWidgetState;
  curatedArt: CuratedArtWidgetState;
};

export type WordEntry = { id: string; text: string; author: string };

export type RitualItem = {
  id: string;
  label: string;
  createdAt: string;
  updatedAt: string;
};

export type RitualCompletion = {
  ritualId: string;
  localDate: string;
  done: boolean;
};

export type RitualsWidgetState = {
  items: RitualItem[];
  completions: RitualCompletion[];
};

export type QuickLink = {
  id: string;
  label: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

export type QuickLinksWidgetState = {
  links: QuickLink[];
};

export type PersonalNoteWidgetState = {
  text: string;
  updatedAt: string;
};

export type CuratedArtWidgetState = {
  currentArtId: string;
  lastRotatedAt: string;
};

export type NookMeta = {
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
};
