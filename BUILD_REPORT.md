# Build report

## Current result

The separate Nook Template repo now provides direct three-dot dragging, bottom-right hover resize handles, live snapped placement previews, and saved layouts for wide, medium, and narrow widths. The previous control bars and Next image button are removed.

Settings → Your photos accepts local files through a picker or a drop area. Photo Blobs stay in IndexedDB on the device. Starter images can use remote URLs or bundled imports. See `IMAGES.md` for selection, storage, loading, offline use, and cloneable starter images. The researched library choice is documented in `RESEARCH.md`.

## Performance changes

- The one-second clock update is isolated in the clock badge. It no longer redraws the dashboard. Daily quotes and photos still refresh at local midnight and when the page becomes visible.
- Grid children, geometry settings, drag settings, resize settings, and callbacks keep stable references.
- A no-op state update no longer changes the timestamp or schedules a save.
- Placement previews have no transition delay during interaction; the installed library's default placeholder transition was 100 ms. The browser confirmed the active preview now has a computed transition duration of `0s`.
- Layout and paint containment reduce the area affected by updates. Active widgets use a smaller shadow; idle visuals stay unchanged.
- Layout persistence still happens on release, not on every pointer move.

## Validation

- Production build and strict TypeScript check passed.
- Eleven focused tests passed for local dates, rotation helpers, legacy order, default placement bounds and collisions, invalid coordinates, and photo validation.
- User tested pointer dragging and resizing successfully, then reported lag. Browser rechecked dragging after the performance changes.
- Browser confirmed a visible live placeholder and active dragged item with a zero-duration preview transition.
- Keyboard resize changed the note height from 372 to 428 pixels, then restored it.
- Local file selection was checked with an agent-created PNG test file. Its image and My photos selection survived a reload. The test photo remains in the preview library and can be removed in Settings.
- Main-thread metrics were sampled before and after. Before: three scripted 40-move trials recorded 28.7–72.4 ms of task work. After: one native drag recorded 24.8 ms of task work and 10.8 ms of script work. These paths use different event sequences and are not a valid percentage comparison. No FPS or speedup claim is made.
- Mechanical design scan found only the two inherited Instrument Sans font warnings. The reference typography was retained.
- Original Nook working tree was not edited.

## Limits

Real touch-device interaction, a live overnight date change, storage-quota failure, local-photo removal, file drop, and unpacked extension installation remain unverified. Escape cancellation is implemented, but not separately exercised after the final correction. Preview tests do not prove extension runtime behavior.

## Daily words and documentation

- Settings now accepts personal quotes and reminders with an optional author. Entries are saved on the device, can be edited or removed, and are selected by local calendar date.
- Browser checks used a separate `nook-docs.localhost` origin: added two entries, edited one, reloaded, and confirmed both entries and the personal collection selection survived. The user's current notes and layouts were not changed for documentation.
- Added tests for daily personal-word rotation, empty-collection fallback, optional attribution, and saved-entry checks.
- A day and night background-generation prompt is saved at `docs/prompts/background-image.md`. No new image was generated.
- README rewritten with real starter-dashboard and reminder-editor screenshots, clone/setup steps, extension installation, keyboard controls, photo storage, starter config, background loading, data use, and sharing instructions.
- README local links and screenshot paths were checked. Documentation screenshots contain only starter or agent-written sample content.

## Run

`pnpm install --frozen-lockfile`, then `pnpm dev`.
Open the printed Portless URL with `/src/app/index.html`.
Current preview: `http://nook-template.localhost:1355/src/app/index.html`.
Use `pnpm build:extension` and load `dist` as an unpacked Chrome or Edge extension.

## User attention

The user requested research before the interaction redesign. One research subagent compared official sources. No additional product questions were needed. The user supplied direct drag/resize test feedback, which guided the performance work. Filesystem writes in the requested sibling repo required sandbox approval.
