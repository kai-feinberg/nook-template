# Nook interaction research — 2026-10-13

## Recommendation

Use react-grid-layout v2.3.0. It fits the existing React UI and supplies collision handling, snapping, live placeholders, resize constraints, and responsive layout maps. Keep direct interactions always available. Use a three-dot drag handle, a bottom-right resize handle shown on hover or keyboard focus, and a calm placeholder. Save serializable grid coordinates. Use one desktop layout plus a separate single-column narrow-screen layout so mobile use cannot overwrite desktop placement. This is an implementation recommendation, not evidence that the existing UI has passed a usability test.

## Verified library API

The latest official release and repository package version are 2.3.0. React 18+ is supported. The v2 entry uses explicit layout data and grouped configuration; the legacy entry retains flat v1 props. Hooks include useContainerWidth. Resize axis `se` means bottom right. Callbacks are immutable. The grid supports separate breakpoint layouts and CSS-transform positioning. [Official README](https://github.com/react-grid-layout/react-grid-layout/blob/master/README.md), [release](https://github.com/react-grid-layout/react-grid-layout/releases/tag/2.3.0), [package](https://github.com/react-grid-layout/react-grid-layout/blob/master/package.json).

```tsx
import GridLayout, { useContainerWidth, verticalCompactor } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
const { width, containerRef, mounted } = useContainerWidth();
// within a component:
<div ref={containerRef}>
  {mounted && <GridLayout
    width={width}
    layout={layout}
    gridConfig={{ cols: 12, rowHeight: 24, margin: [16,16], containerPadding: [0,0] }}
    dragConfig={{ enabled: true, handle: '.widget-drag-handle', threshold: 4 }}
    resizeConfig={{ enabled: true, handles: ['se'] }}
    compactor={verticalCompactor}
    onLayoutChange={saveLayout}
  >{widgets}</GridLayout>}
</div>
```

Legacy equivalent: import GridLayout from `react-grid-layout/legacy`; use `cols`, `rowHeight`, `draggableHandle='.widget-drag-handle'`, `resizeHandles={['se']}` directly. For a new integration use v2. Note that the README has one contradictory data-grid quick-start example; its migration table explicitly says data-grid is legacy only. Use explicit layout.

GridStack is also viable. Its current React wrapper uses portals and can refresh custom drag handles after content renders. Options include draggable.handle and alwaysShowResizeHandle. This adds a second component ownership layer; prefer RGL for the existing React component tree. [GridStack React guide](https://github.com/gridstack/gridstack.js/blob/master/react/README.md), [options](https://gridstackjs.com/doc/html/interfaces/GridStackOptions.html).

Neither reviewed library API documents a full keyboard rearrange and resize experience. Do not claim built-in accessibility. Add app-level keyboard controls: focus drag handle, arrow keys to move by one grid cell, Shift+arrows to resize, announce changed position/size, Escape to restore the pre-edit layout. Ensure resize is visible with focus-within and on touch screens. These are proposed product controls.

## Images

Use Settings → Photos → Add images. Accept a multi-file picker and file drop. Keep image binaries as Blob records in IndexedDB. Store IDs, name, order and optional crop metadata in settings. Object URLs are temporary render URLs; recreate them after loading blobs, then revoke them when the image set changes or the component unmounts. Never persist object URLs. IndexedDB supports files/blobs and is origin-scoped; browser clearing or extension removal can erase local photos. [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), [object URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static), [extension storage](https://developer.chrome.com/docs/extensions/develop/concepts/storage-and-cookies).

Keep developer starter images as bundled imports in template.config.ts. Those ship in each clone and build; selected local photos stay in that browser profile and do not enter Git or upload anywhere. Preview and installed extension are separate origins, so their photo libraries are separate. Recommend plain copy explaining this. Daily selection should use local date and stable library order; remove Next image. If the user selects no photos, retain bundled defaults. Validate MIME type, file size, decode success and storage errors. Save only after the IndexedDB transaction completes. Add/remove previews should update immediately after successful storage.

## Validation needed

Verify actual pointer drag, live placeholder, collision behavior, resize under constraints, reload persistence, narrow-screen layout, keyboard edits, successful upload and reload, image removal, storage rejection feedback, and bundled fallback. Verify in an installed extension separately from the preview.
