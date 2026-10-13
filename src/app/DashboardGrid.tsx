import { memo, useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import GridLayout, { useContainerWidth, verticalCompactor } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import { Ellipsis, MoveDiagonal2 } from "lucide-react";
import { initialPlacement, validPlacement } from "../layouts/placement.ts";
import { widgetLabels } from "../layouts/presets.ts";
import type { DashboardWidgetId, NookState } from "../state/schema.ts";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

type Props = { state: NookState; updateState: (fn: (state: NookState) => NookState) => void; children: (id: DashboardWidgetId) => ReactNode };
const DRAG_CONFIG = { enabled: true, handle: ".widget-drag-handle", threshold: 4, cancel: ".react-resizable-handle" };
export const DashboardGrid = memo(function DashboardGrid({ state, updateState, children }: Props) {
  const { width, containerRef, mounted } = useContainerWidth();
  const cols = width < 600 ? 4 : width < 880 ? 6 : 12;
  const key = String(cols);
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState("");
  const before = useRef<Layout | null>(null);
  const canceled = useRef(false);
  const ids = useMemo(() => state.settings.widgetOrder.filter(id => state.settings.widgetVisibility[id]), [state.settings.widgetOrder, state.settings.widgetVisibility]);
  const layout = useMemo(() => {
    const saved = validPlacement(state.settings.gridLayouts[key], state.settings.widgetOrder, cols);
    const defaults = initialPlacement(state.settings.widgetOrder, state.settings.widgetSizes, cols);
    return defaults.filter(item => state.settings.widgetVisibility[item.i]).map(item => ({
      ...item, ...saved.find(savedItem => savedItem.i === item.i),
      minW: cols === 4 ? 4 : 2, maxW: cols, minH: 4, maxH: 16
    }));
  }, [state.settings, key, cols]);

  const save = useCallback((items: Layout) => {
    const normalized = validPlacement(items, state.settings.widgetOrder, cols);
    updateState(current => {
      const hidden = (current.settings.gridLayouts[key] ?? []).filter(item => !current.settings.widgetVisibility[item.i]);
      const all = [...hidden, ...normalized];
      if (JSON.stringify(current.settings.gridLayouts[key]) === JSON.stringify(all)) return current;
      return { ...current, settings: { ...current.settings, gridLayouts: { ...current.settings.gridLayouts, [key]: all } } };
    });
  }, [updateState, key, cols, state.settings.widgetOrder]);

  const keyEdit = useCallback((event: React.KeyboardEvent, id: DashboardWidgetId, resize = false) => {
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault(); event.stopPropagation();
    const dx = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    const dy = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    const next = layout.map(item => item.i !== id ? item : resize || event.shiftKey
      ? { ...item, w: Math.max(item.minW, Math.min(cols - item.x, item.w + dx)), h: Math.max(4, Math.min(16, item.h + dy)) }
      : { ...item, x: Math.max(0, Math.min(cols - item.w, item.x + dx)), y: Math.max(0, item.y + dy) });
    save(verticalCompactor.compact(next, cols));
    setMessage(`${widgetLabels[id]} ${resize || event.shiftKey ? "resized" : "moved"}.`);
  }, [layout, save, cols]);

  const gridConfig = useMemo(() => ({ cols, rowHeight: 36, margin: [20, 20] as const, containerPadding: [0, 0] as const }), [cols]);
  const resizeConfig = useMemo(() => ({ enabled: true, handles: ["se"] as const, handleComponent: (_axis: string, ref: Ref<HTMLElement>) => <button ref={ref as Ref<HTMLButtonElement>}
    type="button" className="react-resizable-handle react-resizable-handle-se widget-resize-handle"
    aria-label="Resize widget" title="Drag to resize; arrow keys change size" aria-describedby="layout-help"
    onKeyDown={event => {
      const id = event.currentTarget.closest<HTMLElement>("[data-widget-id]")?.dataset.widgetId as DashboardWidgetId;
      if (id) keyEdit(event, id, true);
    }}><MoveDiagonal2 size={16} /></button> }), [keyEdit]);
  const gridChildren = useMemo(() => ids.map(id => <div key={id} data-widget-id={id} className="direct-grid-piece" role="group" aria-label={`${widgetLabels[id]} widget`}>
    <button type="button" className="widget-drag-handle" aria-label={`Move ${widgetLabels[id]}`}
      title="Drag to move; arrow keys move; Shift and arrows resize" aria-describedby="layout-help"
      onKeyDown={event => keyEdit(event, id)}><Ellipsis size={18} /></button>
    {children(id)}
  </div>), [ids, keyEdit, children]);
  const begin = useCallback(() => { canceled.current = false; before.current = layout; setActive(true); }, [layout]);
  const finishDrag = useCallback((items: Layout) => { save(canceled.current && before.current ? before.current : items); setActive(false); before.current = null; setMessage(canceled.current ? "Layout change canceled." : "Position saved."); }, [save]);
  const finishResize = useCallback((items: Layout) => { save(canceled.current && before.current ? before.current : items); setActive(false); before.current = null; setMessage(canceled.current ? "Layout change canceled." : "Size saved."); }, [save]);

  return <div ref={containerRef} className={`direct-grid-shell ${active ? "is-editing-grid" : ""}`} onKeyDown={event => {
    if (event.key === "Escape" && before.current) { canceled.current = true; setMessage("Release the pointer to cancel this change."); }
  }}>
    <p className="sr-only" id="layout-help">Drag the three dots to move. Drag the bottom right corner to resize. Arrow keys move; Shift and arrow keys resize. Escape cancels an active change.</p>
    <p className="sr-only" role="status">{message}</p>
    {mounted && <GridLayout key={key} width={width} layout={layout}
      className="direct-grid" gridConfig={gridConfig} dragConfig={DRAG_CONFIG} resizeConfig={resizeConfig}
      compactor={verticalCompactor}
      onDragStart={begin} onResizeStart={begin}
      onDragStop={finishDrag} onResizeStop={finishResize}
    >{gridChildren}
    </GridLayout>}
  </div>;
});
