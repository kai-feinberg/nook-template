# Build report

## Delivered

Separate local Git repo: `/Users/kai/Desktop/active-projects/Nook Template`.
The source Nook project was not edited.

- Removed GitHub Trending, its data modules, cached state, extension worker, and host permissions.
- Removed the fox illustration and decoration.
- Added seven daily quote reminders and three configurable starter photos.
- Quotes use the local calendar day. Photos change daily; Next image keeps a manual selection until the next day.
- Added saved widget order and Small, Medium, and Large sizes. Notes start Large.
- Arrange widgets exposes drag handles, keyboard-accessible move buttons, and size selectors. Positions snap to the grid.
- Reset layout restores starter order and sizes while preserving personal content.
- Added empty-page guidance and a photo failure message.
- Kept the current visual design and responsive single-column layout.
- Updated setup and customization docs.

## Run

`pnpm install --frozen-lockfile`, then `pnpm dev`.
Open the printed URL with `/src/app/index.html`.
Current preview: `http://nook-template.localhost:1355/src/app/index.html`.
For Chrome or Edge, run `pnpm build:extension` and load `dist` as an unpacked extension.

## Checks and evidence

- `pnpm test`: six tests passed. Coverage includes same-day selection, local midnight, DST and year boundaries, empty collections, image wraparound, removed image IDs, reorder operations, and removed widget IDs.
- `pnpm build`: strict TypeScript and production bundle passed.
- Built manifest declares only storage permission and points to an emitted new tab page. No worker or host permissions remain.
- Browser: manual Next image advanced the photo and preserved it after reload.
- Browser: dragged the note onto Rituals; the displayed order changed.
- Browser: move buttons changed order; Medium note size persisted after reload.
- Browser: Reset layout restored Large notes and starter order without changing note text.
- Desktop and 390-pixel narrow layout checked. Narrow document content width matched viewport width; no horizontal overflow.
- Fixed the observed dark-theme quote contrast issue and replaced the first drag implementation with pointer-based handles after a failed browser drag.
- Mechanical design scan reported two inherited font-choice warnings for Instrument Sans. The existing font was retained to preserve the reference design; no other findings were reported.

## Limits

- Real overnight time passage was not observed. Calendar behavior was tested with fixed dates; the page checks for a changed day while open and on load.
- Real touch-device dragging and unpacked extension installation remain unverified. Move buttons provide an alternative to drag.
- Photo failure and an all-hidden page were implemented but not exercised in the browser.
- Photos, fonts, and link icons require their external sources. Photos can be replaced with bundled local imports.
- No remote repository was published. The repo remains local.

## User attention

Initial release: one scope question answered.
This update: two optional questions asked about controls and image timing; no reply was available during implementation. Defaults follow the recommendations: drag plus size controls, daily photos plus Next image.
Filesystem writes outside the original workspace required sandbox approval. No additional product approval was needed.

See `BUILD_BRIEF.md`, `DECISIONS.md`, and `CUSTOMIZATION.md`.
