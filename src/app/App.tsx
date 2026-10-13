import {
  Check,
  Clock3,
  ExternalLink,
  Heart,
  Image,
  Link as LinkIcon,
  Moon,
  NotebookPen,
  Plus,
  Quote,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  X
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { curatedArt } from "../data/curatedArt.ts";
import { dailyWord } from "../data/words.ts";
import { dailyItem } from "../data/rotation.ts";
import { DashboardGrid } from "./DashboardGrid.tsx";
import { usePhotoLibrary } from "./PhotoLibrary.tsx";
import { layoutPresets, widgetLabels } from "../layouts/presets.ts";
import { createDefaultState } from "../state/defaultState.ts";
import { migrateNookState } from "../state/migrations.ts";
import type { NookState, QuickLink, RitualItem, WidgetId } from "../state/schema.ts";
import { getNookStorage } from "../state/storage/nookStorage.ts";
import { templateConfig } from "../template.config.ts";
const { cloud: decorCloud, flower: decorFlower } = templateConfig.decorations;
const widgetOrder = templateConfig.widgetOrder;

const backgroundOptions = [
  { token: "butterCream", label: "Butter cream" },
  { token: "cloudPaper", label: "Cloud paper" },
  { token: "oatMist", label: "Oat mist" },
  { token: "nightSky", label: "Night sky" },
  { token: "butterCreamHalftone", label: "Halftone day" },
  { token: "nightSkyHalftone", label: "Halftone night" }
] as const;

const storage = getNookStorage();
const defaultLightBackground = "butterCream";
const darkBackgrounds = new Set(["nightSky", "nightSkyHalftone"]);
const themeToggleMap = {
  butterCream: "nightSky",
  cloudPaper: "nightSky",
  oatMist: "nightSky",
  nightSky: defaultLightBackground,
  butterCreamHalftone: "nightSkyHalftone",
  nightSkyHalftone: "butterCreamHalftone"
} as const;
function touch(state: NookState): NookState {
  return {
    ...state,
    meta: {
      ...state.meta,
      updatedAt: new Date().toISOString()
    }
  };
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

function localDate() {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function faviconUrl(url: string) {
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=64`;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

function useDailyDate() {
  const [date, setDate] = useState(() => new Date());
  useEffect(() => {
    let timer: number;
    function refresh() {
      const current = new Date();
      setDate(previous => previous.toDateString() === current.toDateString() ? previous : current);
      const midnight = new Date(current);
      midnight.setHours(24, 0, 0, 0);
      window.clearTimeout(timer);
      timer = window.setTimeout(refresh, midnight.getTime() - current.getTime() + 50);
    }
    function onVisible() { if (document.visibilityState === "visible") refresh(); }
    refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);
  return date;
}

function WidgetCard({
  id,
  title,
  icon,
  children,
  hideHeader = false
}: {
  id: WidgetId;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  hideHeader?: boolean;
}) {
  return (
    <section
      className={`widget-card widget-${id} ${hideHeader ? "widget-card-noHeader" : ""}`}
      aria-labelledby={hideHeader ? undefined : `${id}-title`}
      aria-label={hideHeader ? title : undefined}
    >
      {hideHeader ? null : (
        <header className="widget-header">
          <div className="widget-title">
            <span className="widget-icon" aria-hidden="true">
              {icon}
            </span>
            <h2 id={`${id}-title`}>{title}</h2>
          </div>

        </header>
      )}
      {children}
    </section>
  );
}

export function App() {
  const [state, setState] = useState<NookState | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const now = useDailyDate();

  useEffect(() => {
    let active = true;

    async function boot() {
      const stored = await storage.getState();
      const migrated = migrateNookState(stored);
      const opened = {
        ...migrated,
        meta: {
          ...migrated.meta,
          lastOpenedAt: new Date().toISOString()
        }
      };

      if (active) {
        setState(opened);
        await storage.setState(opened);
      }
    }

    void boot();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storage.subscribe) return undefined;
    return storage.subscribe((nextState) => setState(migrateNookState(nextState)));
  }, []);

  useEffect(() => {
    if (!state) return;
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      void storage.setState(state);
    }, 220);

    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, [state]);

  useEffect(() => {
    if (!settingsOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [settingsOpen]);

  const visibleWidgets = state?.settings.widgetOrder.filter((id) => state.settings.widgetVisibility[id]) ?? [];

  const updateState = useCallback((updater: (current: NookState) => NookState) => {
    setState(current => {
      if (!current) return current;
      const next = updater(current);
      return next === current ? current : touch(next);
    });
  }, []);

  const renderWidget = useCallback((widgetId: import("../state/schema.ts").DashboardWidgetId) =>
    state ? <WidgetRenderer widgetId={widgetId} state={state} updateState={updateState} now={now} /> : null,
    [state, updateState, now]);

  async function resetToDefault() {
    const confirmed = window.confirm(`Reset ${templateConfig.brand.name} to its starter dashboard?`);
    if (!confirmed) return;

    const nextState = createDefaultState();
    await storage.resetState();
    await storage.setState(nextState);
    setState(nextState);
    setSettingsOpen(false);
  }

  function toggleTheme() {
    updateState((current) => {
      const currentToken = current.settings.appearance.background.colorToken;
      const nextToken = themeToggleMap[currentToken];

      return {
        ...current,
        settings: {
          ...current.settings,
          appearance: {
            ...current.settings.appearance,
            background: {
              ...current.settings.appearance.background,
              colorToken: nextToken
            }
          }
        }
      };
    });
  }

  if (!state) {
    return (
      <main className="loading-shell">
        <Sparkles aria-hidden="true" />
        <p>Setting your shelf...</p>
      </main>
    );
  }

  const isNightTheme = darkBackgrounds.has(state.settings.appearance.background.colorToken);

  return (
    <>
    <main className={`app-shell bg-${state.settings.appearance.background.colorToken}`}>
      <div className="page-decor" aria-hidden="true">
        <div className="night-sky">
          <span className="stars stars-near" />
          <span className="stars stars-far" />
          <span className="shooting-star shooting-star-one" />
          <span className="shooting-star shooting-star-two" />
        </div>
        <img className="decor-cloud" src={decorCloud} alt="" />
        <img className="decor-flower" src={decorFlower} alt="" />
        <span className="decor-heart decor-heart-one">♡</span>
        <span className="decor-heart decor-heart-two">♡</span>
      </div>
      <header className="topbar">
        <div className="topbar-brand">
          <p className="brand-mark">{templateConfig.brand.name}</p>
          <p className="brand-note">{templateConfig.brand.tagline}</p>
        </div>
        <div className="topbar-actions">
          {state.settings.widgetVisibility.clock ? <TopbarClockBadge /> : null}
          <div className="canvas-dock" aria-label="Dashboard tools">
            <button type="button" onClick={() => setSettingsOpen(true)} aria-label="Add widget">
              <Plus size={17} />
            </button>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={isNightTheme ? "Switch to light theme" : "Switch to dark theme"}
              aria-pressed={isNightTheme}
              title={isNightTheme ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isNightTheme ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button type="button" onClick={() => setSettingsOpen(true)} aria-label="Open settings">
              <Settings size={17} />
            </button>
          </div>
        </div>
      </header>

      {visibleWidgets.length ? <DashboardGrid state={state} updateState={updateState}>
        {renderWidget}
      </DashboardGrid> : <div className="dashboard-empty"><h2>A little room to start</h2><p>Choose a piece to make this page yours.</p><button type="button" onClick={() => setSettingsOpen(true)}>Choose widgets</button></div>}

      {settingsOpen ? (
        <SettingsPanel
          state={state}
          updateState={updateState}
          onClose={() => setSettingsOpen(false)}
          onReset={resetToDefault}
        />
      ) : null}
    </main>
    </>
  );
}

function WidgetRenderer({
  widgetId,
  state,
  updateState,
  now
}: {
  widgetId: WidgetId;
  now: Date;
  state: NookState;
  updateState: (updater: (current: NookState) => NookState) => void;
}) {
  switch (widgetId) {
    case "rituals":
      return <RitualsWidget state={state} updateState={updateState} />;
    case "quickLinks":
      return <QuickLinksWidget links={state.widgets.quickLinks.links} />;
    case "quote":
      return <QuoteWidget state={state} now={now} />;
    case "personalNote":
      return <PersonalNoteWidget state={state} updateState={updateState} />;
    case "curatedArt":
      return <CuratedArtWidget state={state} now={now} />;
    case "clock":
      return null;
  }
}

function RitualsWidget({
  state,
  updateState
}: {
  state: NookState;
  updateState: (updater: (current: NookState) => NookState) => void;
}) {
  const today = localDate();

  function toggleRitual(ritualId: string) {
    updateState((current) => {
      const existing = current.widgets.rituals.completions.find(
        (completion) => completion.ritualId === ritualId && completion.localDate === today
      );
      const completions = existing
        ? current.widgets.rituals.completions.map((completion) =>
            completion === existing ? { ...completion, done: !completion.done } : completion
          )
        : [...current.widgets.rituals.completions, { ritualId, localDate: today, done: true }];

      return {
        ...current,
        widgets: {
          ...current.widgets,
          rituals: {
            ...current.widgets.rituals,
            completions
          }
        }
      };
    });
  }

  return (
    <WidgetCard id="rituals" title="Daily rituals" icon={<Heart size={18} />}>
      <div className="ritual-list">
        {state.widgets.rituals.items.map((ritual) => {
          const done = state.widgets.rituals.completions.some(
            (completion) => completion.ritualId === ritual.id && completion.localDate === today && completion.done
          );
          return (
            <button key={ritual.id} className={`ritual-row ${done ? "is-done" : ""}`} type="button" onClick={() => toggleRitual(ritual.id)}>
              <span>{done ? <Check size={15} /> : null}</span>
              {ritual.label}
            </button>
          );
        })}
      </div>
    </WidgetCard>
  );
}

function QuickLinksWidget({ links }: { links: QuickLink[] }) {
  return (
    <WidgetCard id="quickLinks" title="Link shelf" icon={<LinkIcon size={18} />}>
      <div className="quick-links">
        {links.map((link) => (
          <a key={link.id} href={link.url} className="quick-link">
            <img src={faviconUrl(link.url)} alt="" />
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </WidgetCard>
  );
}

function QuoteWidget({ state, now }: { state: NookState; now: Date }) {
  const quote = dailyWord(templateConfig.quotes, state.widgets.dailyWords.items, state.settings.wordsSource, now);
  return (
    <WidgetCard id="quote" title="Daily words" icon={<Quote size={18} />} hideHeader>
      <div className="quote-note">
        <p>{quote?.text ?? "Add a quote in the template config."}</p>
        {quote?.author ? <span>{quote.author}</span> : null}
        <img className="quote-flower" src={decorFlower} alt="" aria-hidden="true" />
      </div>
    </WidgetCard>
  );
}

function PersonalNoteWidget({
  state,
  updateState
}: {
  state: NookState;
  updateState: (updater: (current: NookState) => NookState) => void;
}) {
  return (
    <WidgetCard id="personalNote" title="Today" icon={<NotebookPen size={18} />}>
      <textarea
        className="note-field"
        value={state.widgets.personalNote.text}
        placeholder={"Morning stretch\n\nPlan photoshoot\n\nReply to emails\n\nBuy fresh flowers"}
        onChange={(event) =>
          updateState((current) => ({
            ...current,
            widgets: {
              ...current.widgets,
              personalNote: {
                text: event.target.value,
                updatedAt: new Date().toISOString()
              }
            }
          }))
        }
        aria-label="Personal note"
      />
    </WidgetCard>
  );
}

function CuratedArtWidget({ state, now }: { state: NookState; now: Date }) {
  const library = usePhotoLibrary();
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const photos = state.settings.photoSource === "personal" && library.photos.length ? library.photos : curatedArt;
  const art = dailyItem(photos, now);
  const showCaption = state.settings.appearance.showArtCaption;
  const captionDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(now);
  return <WidgetCard id="curatedArt" title="Curated art" icon={<Image size={18} />} hideHeader>
    {state.settings.photoSource === "personal" && !library.ready ? <p className="soft-empty">Loading your photos…</p>
      : art ? <a className="art-frame" href={art.sourceUrl || undefined} aria-label={art.sourceUrl ? `Open source for ${art.title}` : art.title} target="_blank" rel="noreferrer">
        {failedImage === art.imageUrl ? <div className="art-unavailable"><Image size={28} /><p>Photo unavailable</p><span>Choose another collection in Settings or check your connection.</span></div>
          : <img src={art.imageUrl} alt={art.alt} onError={() => setFailedImage(art.imageUrl)} draggable={false} />}
        {showCaption ? <span className="art-caption" aria-hidden="true">{captionDate} / {art.title}</span> : null}
      </a> : <p className="soft-empty">Add photos in Settings.</p>}
  </WidgetCard>;
}

function TopbarClockBadge() {
  const now = useClock();
  const timeParts = useMemo(() => {
    const parts = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).formatToParts(now);
    return {
      value: parts
        .filter((part) => part.type !== "dayPeriod")
        .map((part) => part.value)
        .join("")
        .trim(),
      period: parts.find((part) => part.type === "dayPeriod")?.value ?? ""
    };
  }, [now]);
  return (
    <div className="topbar-clock" aria-label={`Now: ${timeParts.value}${timeParts.period ? ` ${timeParts.period}` : ""}`}>
      <Clock3 size={14} />
      <div className="topbar-clock-copy">
        <p>
          <span>{timeParts.value}</span>
          {timeParts.period ? <abbr>{timeParts.period}</abbr> : null}
        </p>
      </div>
    </div>
  );
}

function SettingsPanel({
  state,
  updateState,
  onClose,
  onReset
}: {
  state: NookState;
  updateState: (updater: (current: NookState) => NookState) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const [linkDraft, setLinkDraft] = useState({ label: "", url: "" });
  const [ritualDraft, setRitualDraft] = useState("");
  const [wordDraft, setWordDraft] = useState({ text: "", author: "" });
  function addWord(event: FormEvent) {
    event.preventDefault();
    const text = wordDraft.text.trim();
    if (!text || state.widgets.dailyWords.items.length >= 100) return;
    updateState(current => ({ ...current,
      settings: { ...current.settings, wordsSource: "personal" },
      widgets: { ...current.widgets, dailyWords: { items: [...current.widgets.dailyWords.items,
        { id: makeId("word"), text, author: wordDraft.author.trim() }] } }
    }));
    setWordDraft({ text: "", author: "" });
  }
  const library = usePhotoLibrary();
  const [draggingPhotos, setDraggingPhotos] = useState(false);
  async function importPhotos(files: File[]) {
    if (await library.add(files)) updateState(current => ({ ...current, settings: { ...current.settings, photoSource: "personal" } }));
  }

  function addLink(event: FormEvent) {
    event.preventDefault();
    const label = linkDraft.label.trim();
    const url = normalizeUrl(linkDraft.url);
    if (!label || !url) return;
    const timestamp = new Date().toISOString();
    updateState((current) => ({
      ...current,
      widgets: {
        ...current.widgets,
        quickLinks: {
          links: [...current.widgets.quickLinks.links, { id: makeId("link"), label, url, createdAt: timestamp, updatedAt: timestamp }]
        }
      }
    }));
    setLinkDraft({ label: "", url: "" });
  }

  function addRitual(event: FormEvent) {
    event.preventDefault();
    const label = ritualDraft.trim();
    if (!label) return;
    const timestamp = new Date().toISOString();
    const ritual: RitualItem = { id: makeId("ritual"), label, createdAt: timestamp, updatedAt: timestamp };
    updateState((current) => ({
      ...current,
      widgets: {
        ...current.widgets,
        rituals: {
          ...current.widgets.rituals,
          items: [...current.widgets.rituals.items, ritual]
        }
      }
    }));
    setRitualDraft("");
  }

  return (
    <div className="settings-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="settings-panel" aria-label={`${templateConfig.brand.name} settings`} onMouseDown={(event) => event.stopPropagation()}>
        <header className="settings-header">
          <div>
            <h2>Tune your shelf</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </header>

        <section className="settings-section">
          <h3>Layout</h3>
          <div className="segmented">
            {layoutPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={state.settings.selectedLayout === preset.id ? "is-selected" : ""}
                onClick={() =>
                  updateState((current) => ({
                    ...current,
                    settings: { ...current.settings, selectedLayout: preset.id,
                      widgetSizes: { ...templateConfig.widgetSizes, personalNote: "large", curatedArt: preset.id === "focus" ? "small" : "medium" }, gridLayouts: {}
                    }
                  }))
                }
              >
                <strong>{preset.label}</strong>
                <span>{preset.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h3>Widgets</h3>
          <div className="toggle-list">
            {([...widgetOrder, "clock"] as WidgetId[]).map((widgetId) => (
              <label key={widgetId}>
                <span>{widgetLabels[widgetId]}</span>
                <input
                  type="checkbox"
                  checked={state.settings.widgetVisibility[widgetId]}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        widgetVisibility: {
                          ...current.settings.widgetVisibility,
                          [widgetId]: event.target.checked
                        }
                      }
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </section>

        <section className="settings-section words-settings">
          <h3>Quotes and reminders</h3>
          <p className="settings-help">Add words you want to see. One entry appears each day and stays the same across your tabs.</p>
          <div className="photo-source-controls">
            <button type="button" aria-pressed={state.settings.wordsSource === "starter"} onClick={() => updateState(current => ({ ...current, settings: { ...current.settings, wordsSource: "starter" } }))}>Starter words</button>
            <button type="button" aria-pressed={state.settings.wordsSource === "personal"} disabled={!state.widgets.dailyWords.items.length} onClick={() => updateState(current => ({ ...current, settings: { ...current.settings, wordsSource: "personal" } }))}>My words</button>
          </div>
          <form className="word-form" onSubmit={addWord}>
            <label>Quote or reminder<textarea aria-label="New quote or reminder" rows={3} maxLength={400} value={wordDraft.text} onChange={event => setWordDraft({ ...wordDraft, text: event.target.value })} placeholder="Take one small step today." /></label>
            <label>Author (optional)<input aria-label="New quote author" maxLength={100} value={wordDraft.author} onChange={event => setWordDraft({ ...wordDraft, author: event.target.value })} placeholder="Leave blank for a personal reminder" /></label>
            <button type="submit" disabled={!wordDraft.text.trim() || state.widgets.dailyWords.items.length >= 100}>Add quote or reminder</button>
          </form>
          <p className="settings-help">{state.widgets.dailyWords.items.length} of 100 entries · Saved on this device. Adding or removing entries can change today's selection.</p>
          <div className="word-editors">{state.widgets.dailyWords.items.map((entry, index) => <div key={entry.id} className="word-editor">
            <textarea aria-label={`Quote or reminder ${index + 1}`} rows={2} maxLength={400} value={entry.text} onChange={event => updateState(current => ({ ...current, widgets: { ...current.widgets, dailyWords: { items: current.widgets.dailyWords.items.map(item => item.id === entry.id ? { ...item, text: event.target.value } : item) } } }))} />
            <div><input aria-label={`Author for entry ${index + 1}`} maxLength={100} value={entry.author} placeholder="Author (optional)" onChange={event => updateState(current => ({ ...current, widgets: { ...current.widgets, dailyWords: { items: current.widgets.dailyWords.items.map(item => item.id === entry.id ? { ...item, author: event.target.value } : item) } } }))} />
              <button type="button" aria-label={`Remove entry ${index + 1}`} onClick={() => updateState(current => ({ ...current, widgets: { ...current.widgets, dailyWords: { items: current.widgets.dailyWords.items.filter(item => item.id !== entry.id) } } }))}><Trash2 size={16} /></button>
            </div>
          </div>)}</div>
        </section>

        <section className="settings-section">
          <h3>Your photos</h3>
          <p className="settings-help">One photo each day. Choose a collection or add photos from your device.</p>
          <div className="photo-source-controls">
            <button type="button" aria-pressed={state.settings.photoSource === "starter"} onClick={() => updateState(current => ({ ...current, settings: { ...current.settings, photoSource: "starter" } }))}>Starter photos</button>
            <button type="button" aria-pressed={state.settings.photoSource === "personal"} disabled={!library.photos.length} onClick={() => updateState(current => ({ ...current, settings: { ...current.settings, photoSource: "personal" } }))}>My photos</button>
          </div>
          <label className={`photo-drop-zone ${draggingPhotos ? "is-file-over" : ""}`}
            onDragOver={event => { event.preventDefault(); setDraggingPhotos(true); }}
            onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDraggingPhotos(false); }}
            onDrop={event => { event.preventDefault(); setDraggingPhotos(false); if (!library.busy) void importPhotos(Array.from(event.dataTransfer.files)); }}>
            <Image size={24} /><strong>{library.busy ? "Saving photos…" : "Choose photos or drop them here"}</strong>
            <span>JPG, PNG, WebP, AVIF, GIF · Up to 24 photos · 8 MB each</span>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" aria-label="Choose personal photos" disabled={library.busy}
              onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ""; if (files.length) void importPhotos(files); }} />
          </label>
          <p className="settings-help">Stored only in this browser. Files are not uploaded or added to the repo.</p>
          {library.error ? <p role="alert" className="photo-error">{library.error}</p> : null}
          {library.photos.length ? <div className="photo-library">{library.photos.map(photo => <div key={photo.id}>
            <img src={photo.imageUrl} alt={photo.alt} /><span>{photo.title}</span>
            <button type="button" disabled={library.busy} aria-label={`Remove photo ${photo.title}`} onClick={() => void library.remove(photo.id)}><Trash2 size={15} /></button>
          </div>)}</div> : null}
        </section>

        <section className="settings-section">
          <h3>Photo print</h3>
          <div className="toggle-list">
            <label>
              <span>Caption/date mark</span>
              <input
                type="checkbox"
                checked={state.settings.appearance.showArtCaption}
                onChange={(event) =>
                  updateState((current) => ({
                    ...current,
                    settings: {
                      ...current.settings,
                      appearance: {
                        ...current.settings.appearance,
                        showArtCaption: event.target.checked
                      }
                    }
                  }))
                }
              />
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h3>Rituals</h3>
          <form className="settings-form" onSubmit={addRitual}>
            <input value={ritualDraft} onChange={(event) => setRitualDraft(event.target.value)} aria-label="New ritual" placeholder="Add a ritual" />
            <button type="submit" aria-label="Add item">
              <Plus size={16} />
            </button>
          </form>
          <div className="editable-list">
            {state.widgets.rituals.items.map((ritual) => (
              <div key={ritual.id}>
                <input
                  aria-label={`${ritual.label} ritual`}
                  value={ritual.label}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      widgets: {
                        ...current.widgets,
                        rituals: {
                          ...current.widgets.rituals,
                          items: current.widgets.rituals.items.map((item) =>
                            item.id === ritual.id ? { ...item, label: event.target.value, updatedAt: new Date().toISOString() } : item
                          )
                        }
                      }
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    updateState((current) => ({
                      ...current,
                      widgets: {
                        ...current.widgets,
                        rituals: {
                          items: current.widgets.rituals.items.filter((item) => item.id !== ritual.id),
                          completions: current.widgets.rituals.completions.filter((completion) => completion.ritualId !== ritual.id)
                        }
                      }
                    }))
                  }
                  aria-label="Delete ritual"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h3>Quick links</h3>
          <form className="settings-form two-fields" onSubmit={addLink}>
            <input value={linkDraft.label} onChange={(event) => setLinkDraft({ ...linkDraft, label: event.target.value })} aria-label="New link label" placeholder="Label" />
            <input value={linkDraft.url} onChange={(event) => setLinkDraft({ ...linkDraft, url: event.target.value })} aria-label="New link URL" placeholder="URL" />
            <button type="submit" aria-label="Add item">
              <Plus size={16} />
            </button>
          </form>
          <div className="editable-list">
            {state.widgets.quickLinks.links.map((link) => (
              <div key={link.id} className="link-edit-row">
                <input
                  aria-label={`${link.label} label`}
                  value={link.label}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      widgets: {
                        ...current.widgets,
                        quickLinks: {
                          links: current.widgets.quickLinks.links.map((item) =>
                            item.id === link.id ? { ...item, label: event.target.value, updatedAt: new Date().toISOString() } : item
                          )
                        }
                      }
                    }))
                  }
                />
                <input
                  aria-label={`${link.label} URL`}
                  value={link.url}
                  onChange={(event) =>
                    updateState((current) => ({
                      ...current,
                      widgets: {
                        ...current.widgets,
                        quickLinks: {
                          links: current.widgets.quickLinks.links.map((item) =>
                            item.id === link.id ? { ...item, url: event.target.value, updatedAt: new Date().toISOString() } : item
                          )
                        }
                      }
                    }))
                  }
                  onBlur={(event) =>
                    updateState((current) => ({
                      ...current,
                      widgets: {
                        ...current.widgets,
                        quickLinks: {
                          links: current.widgets.quickLinks.links.map((item) =>
                            item.id === link.id ? { ...item, url: normalizeUrl(event.target.value), updatedAt: new Date().toISOString() } : item
                          )
                        }
                      }
                    }))
                  }
                />
                <a href={link.url} aria-label={`Open ${link.label}`}>
                  <ExternalLink size={15} />
                </a>
                <button
                  type="button"
                  onClick={() =>
                    updateState((current) => ({
                      ...current,
                      widgets: {
                        ...current.widgets,
                        quickLinks: {
                          links: current.widgets.quickLinks.links.filter((item) => item.id !== link.id)
                        }
                      }
                    }))
                  }
                  aria-label="Delete quick link"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h3>Background</h3>
          <div className="swatches">
            {backgroundOptions.map(({ token, label }) => (
              <button
                key={token}
                type="button"
                className={`swatch swatch-${token} ${state.settings.appearance.background.colorToken === token ? "is-selected" : ""}`}
                onClick={() =>
                  updateState((current) => ({
                    ...current,
                    settings: {
                      ...current.settings,
                      appearance: {
                        ...current.settings.appearance,
                        background: { type: "solid", colorToken: token }
                      }
                    }
                  }))
                }
                aria-label={`Use ${label} background`}
                title={label}
              />
            ))}
          </div>
        </section>

        <button className="reset-button" type="button" onClick={onReset}>
          Reset to starter dashboard
        </button>
      </aside>
    </div>
  );
}
