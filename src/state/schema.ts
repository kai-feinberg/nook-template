export type LayoutPresetId = "balanced" | "focus";

export type WidgetId =
  | "quote"
  | "rituals"
  | "quickLinks"
  | "personalNote"
  | "curatedArt"
  | "githubTrending"
  | "clock";

export type NookState = {
  schemaVersion: 1;
  settings: NookSettings;
  widgets: WidgetState;
  cache: NookCache;
  meta: NookMeta;
};

export type NookSettings = {
  selectedLayout: LayoutPresetId;
  widgetVisibility: Record<WidgetId, boolean>;
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
  rituals: RitualsWidgetState;
  quickLinks: QuickLinksWidgetState;
  personalNote: PersonalNoteWidgetState;
  curatedArt: CuratedArtWidgetState;
};

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

export type NookCache = {
  githubTrending: {
    repositories: TrendingRepository[];
    fetchedAt: string | null;
    stale: boolean;
  };
};

export type TrendingRepository = {
  id: string;
  owner: string;
  name: string;
  description: string;
  language?: string;
  stars?: number;
  url: string;
};

export type NookMeta = {
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
};
