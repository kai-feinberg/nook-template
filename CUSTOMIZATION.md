# Customization

## Starter config

Change `src/template.config.ts`. Use stable, unique art IDs. Each art item needs a title, image URL, alt text, and source URL. Import local images to let Vite bundle them. Use images you have permission to share. Keep at least one art item when the art widget is enabled.

Keep each widget ID once in `widgetOrder`. The clock is a header control and does not belong in that list. Hide widgets with `widgets`. Supported IDs are listed in `src/state/schema.ts`.

## Style

Edit `src/app/styles/styles.css`. Color tokens and theme classes set the backgrounds. Layout rules sit in the same file. Replace the cloud and flower imports in the config to change decorations. Remove the remote font import to use system fonts offline.

## Add a widget

1. Add its ID to `WidgetId` in `src/state/schema.ts`.
2. Add its label in `src/layouts/presets.ts`.
3. Add its default visibility and order in the config.
4. Add its component and render case in `src/app/App.tsx`.
5. Add grid styles. If it stores data, update the schema, defaults, and migration.

## Rename your extension

Change the config brand, the title in `src/app/index.html`, package name in `package.json`, and name and description in `src/extension/manifest.json`. Change the Portless host in the dev script when running multiple clones. Change the storage key in `src/state/storage/nookStorage.ts` if two web apps share an origin.

## Layout

The dashboard uses React Grid Layout 2.3.0. Drag the three dots to move a piece; drag the hover control at the bottom right to resize. A live placeholder shows the snapped location. Each width group saves its own grid coordinates. Minimum sizes keep controls usable.

`src/app/DashboardGrid.tsx` owns interaction and keyboard controls. `src/layouts/placement.ts` owns default placement and saved-coordinate checks. Starter `widgetSizes` still seeds new layouts. Balanced and Focus reset the saved grid and seed different default sizes.

## Photos and rotation

See [IMAGES.md](IMAGES.md) for user file selection, local storage, and bundled imports. Quotes and photos use the local calendar date. The quote collection contains original starter reminders.

## Personal words

Settings → Quotes and reminders saves personal entries in `widgets.dailyWords.items`. The starter collection still comes from the template config. `src/data/words.ts` checks saved entries and selects the daily value. Reset clears personal entries but does not alter the config.

## Background prompt

See [docs/prompts/background-image.md](docs/prompts/background-image.md) for a reusable image prompt and loading instructions.
