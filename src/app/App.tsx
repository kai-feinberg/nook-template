import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  LayoutGrid,
  ChevronRight,
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
import { dailyItem, localDay, nextItem } from "../data/rotation.ts";
import { moveWidget } from "../layouts/grid.ts";
import { layoutPresets, widgetLabels } from "../layouts/presets.ts";
import { createDefaultState } from "../state/defaultState.ts";
import { migrateNookState } from "../state/migrations.ts";
import type { DashboardWidgetId, NookState, QuickLink, RitualItem, WidgetId, WidgetSize } from "../state/schema.ts";
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
          <span className="widget-handle" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </header>
      )}
      {children}
    </section>
  );
}

export function App() {
  const [state, setState] = useState<NookState | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [arranging, setArranging] = useState(false);
  const dragSource = useRef<DashboardWidgetId | null>(null);
  const [dropTarget, setDropTarget] = useState<DashboardWidgetId | null>(null);
  const [layoutMessage, setLayoutMessage] = useState("");
  const saveTimer = useRef<number | null>(null);
  const now = useClock();

  useEffect(() => {
    let active = true;

    async function boot() {
      const stored = await storage.getState();
      const migrated = migrateNookState(stored);
      const opened = maybeRotateArt({
        ...migrated,
        meta: {
          ...migrated.meta,
          lastOpenedAt: new Date().toISOString()
        }
      });

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

  const preset = layoutPresets.find((item) => item.id === state?.settings.selectedLayout) ?? layoutPresets[0];
  const visibleWidgets = state?.settings.widgetOrder.filter((id) => state.settings.widgetVisibility[id]) ?? [];

  const updateState = useCallback((updater: (current: NookState) => NookState) => {
    setState((current) => (current ? touch(updater(current)) : current));
  }, []);

  const today = localDay(now);
  useEffect(() => {
    setState(current => current ? maybeRotateArt(current) : current);
  }, [today]);

  function reorder(id: DashboardWidgetId, target: DashboardWidgetId) {
    updateState(current => ({ ...current, settings: {
      ...current.settings, widgetOrder: moveWidget(current.settings.widgetOrder, id, target)
    }}));
    setLayoutMessage(`${widgetLabels[id]} moved.`);
  }

  function resize(id: DashboardWidgetId, size: WidgetSize) {
    updateState(current => ({ ...current, settings: {
      ...current.settings, widgetSizes: { ...current.settings.widgetSizes, [id]: size }
    }}));
    setLayoutMessage(`${widgetLabels[id]} set to ${size}.`);
  }

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
          {state.settings.widgetVisibility.clock ? <TopbarClockBadge now={now} /> : null}
          <div className="canvas-dock" aria-label="Dashboard tools">
            <button type="button" onClick={() => setArranging(value => !value)} aria-label={arranging ? "Finish arranging" : "Arrange widgets"} aria-pressed={arranging}>
              <LayoutGrid size={17} />
            </button>
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

      {arranging ? (
        <div className="arrange-bar">
          <div><strong>Make room for your day</strong><p>Drag a handle onto another piece. Or use the move buttons. Sizes snap to the grid.</p></div>
          <div className="arrange-actions">
            <button type="button" className="reset-layout" onClick={() => {
              updateState(current => ({ ...current, settings: { ...current.settings,
                widgetOrder: [...templateConfig.widgetOrder], widgetSizes: { ...templateConfig.widgetSizes }
              }}));
              setLayoutMessage("Starter layout restored.");
            }}>Reset layout</button>
            <button type="button" onClick={() => setArranging(false)}>Done</button>
          </div>
        </div>
      ) : null}
      <p className="sr-only" role="status">{layoutMessage}</p>
      <div className={`dashboard-grid layout-custom ${preset.className} ${arranging ? "is-arranging" : ""}`}>
        {visibleWidgets.map((widgetId, index) => (
          <div key={widgetId} data-widget-id={widgetId}
            className={`grid-piece size-${state.settings.widgetSizes[widgetId]} ${dropTarget === widgetId ? "is-drop-target" : ""}`}

          >
            {arranging ? (
              <div className="piece-controls" aria-label={`${widgetLabels[widgetId]} layout controls`}>
                <button type="button" className="drag-handle"
                  aria-label={`Drag ${widgetLabels[widgetId]}`} title="Drag to move"
                  onPointerDown={event => {
                    if (event.button !== 0) return;
                    dragSource.current = widgetId;
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={event => {
                    if (!dragSource.current) return;
                    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-widget-id]")?.dataset.widgetId as DashboardWidgetId | undefined;
                    setDropTarget(target && target !== dragSource.current ? target : null);
                  }}
                  onPointerUp={event => {
                    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-widget-id]")?.dataset.widgetId as DashboardWidgetId | undefined;
                    if (dragSource.current && target) reorder(dragSource.current, target);
                    dragSource.current = null;
                    setDropTarget(null);
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                  }}
                  onPointerCancel={() => { dragSource.current = null; setDropTarget(null); }}><GripVertical size={18} /></button>
                <span className="piece-control-name">{widgetLabels[widgetId]}</span>
                <button type="button" aria-label={`Move ${widgetLabels[widgetId]} earlier`} disabled={index === 0}
                  onClick={() => reorder(widgetId, visibleWidgets[index - 1])}><ArrowUp size={16} /></button>
                <button type="button" aria-label={`Move ${widgetLabels[widgetId]} later`} disabled={index === visibleWidgets.length - 1}
                  onClick={() => reorder(widgetId, visibleWidgets[index + 1])}><ArrowDown size={16} /></button>
                <div className="piece-sizes" role="group" aria-label={`${widgetLabels[widgetId]} size`}>
                  {(["small", "medium", "large"] as WidgetSize[]).map(size => (
                    <button key={size} type="button"
                      aria-label={`Set ${widgetLabels[widgetId]} size to ${size}`}
                      aria-pressed={state.settings.widgetSizes[widgetId] === size}
                      onClick={() => resize(widgetId, size)}>
                      {size[0].toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <WidgetRenderer widgetId={widgetId} state={state} updateState={updateState} now={now} />
          </div>
        ))}
        {!visibleWidgets.length ? <div className="dashboard-empty"><h2>A little room to start</h2><p>Choose a piece to make this page yours.</p><button type="button" onClick={() => setSettingsOpen(true)}>Choose widgets</button></div> : null}
      </div>

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

function maybeRotateArt(state: NookState): NookState {
  const last = new Date(state.widgets.curatedArt.lastRotatedAt);
  const currentExists = curatedArt.some(item => item.id === state.widgets.curatedArt.currentArtId);
  if (currentExists && !Number.isNaN(last.getTime()) && localDay(last) === localDay()) return state;
  const art = dailyItem(curatedArt);
  if (!art) return state;
  return { ...state, widgets: { ...state.widgets, curatedArt: {
    currentArtId: art.id, lastRotatedAt: new Date().toISOString()
  }}};
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
      return <QuoteWidget now={now} />;
    case "personalNote":
      return <PersonalNoteWidget state={state} updateState={updateState} />;
    case "curatedArt":
      return <CuratedArtWidget state={state} updateState={updateState} />;
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

function QuoteWidget({ now }: { now: Date }) {
  const quote = dailyItem(templateConfig.quotes, now);
  return (
    <WidgetCard id="quote" title="Little quote" icon={<Quote size={18} />} hideHeader>
      <div className="quote-note">
        <p>{quote?.text ?? "Add a quote in the template config."}</p>
        <span>{quote?.author ?? ""}</span>
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

function CuratedArtWidget({ state, updateState }: {
  state: NookState; updateState: (updater: (current: NookState) => NookState) => void;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const art = curatedArt.find((item) => item.id === state.widgets.curatedArt.currentArtId) ?? curatedArt[0];
  const showCaption = state.settings.appearance.showArtCaption;
  const captionDate = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric"
      }).format(new Date(state.widgets.curatedArt.lastRotatedAt)),
    [state.widgets.curatedArt.lastRotatedAt]
  );

  function advance() {
    const next = nextItem(curatedArt, state.widgets.curatedArt.currentArtId);
    if (next) updateState(current => ({ ...current, widgets: { ...current.widgets, curatedArt: {
      currentArtId: next.id, lastRotatedAt: new Date().toISOString()
    }}}));
  }

  return (
    <WidgetCard id="curatedArt" title="Curated art" icon={<Image size={18} />} hideHeader>
      {art ? <a className="art-frame" href={art.sourceUrl || undefined} aria-label={art.sourceUrl ? `Open source for ${art.title}` : art.title} target="_blank" rel="noreferrer">
        {failedImage === art.imageUrl ? <div className="art-unavailable"><Image size={28} /><p>Photo unavailable</p><span>Try the next photo or check your connection.</span></div>
          : <img src={art.imageUrl} alt={art.alt} onError={() => setFailedImage(art.imageUrl)} />}
        {showCaption ? (
          <span className="art-caption" aria-hidden="true">
            {captionDate} / {art.title}
          </span>
        ) : null}
      </a> : <p className="soft-empty">Add photos in the template config.</p>}
      <button type="button" className="next-photo" onClick={advance} disabled={curatedArt.length < 2} aria-label="Next image"><ChevronRight size={16} />Next image</button>
    </WidgetCard>
  );
}

function TopbarClockBadge({ now }: { now: Date }) {
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
            <p className="eyebrow">Settings</p>
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
                      widgetSizes: { ...templateConfig.widgetSizes, personalNote: "large", curatedArt: preset.id === "focus" ? "small" : "medium" }
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
