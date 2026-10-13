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

## Scope

This starter uses a constrained grid with Small, Medium, and Large widget sizes. Users can drag to reorder or use move buttons. These controls save the layout locally. Balanced and Focus set size presets. On narrow screens, widgets stack in the saved order.

## Rotation

Quotes are picked by local calendar date. Photos rotate daily and can be advanced manually. Add or remove entries in the config arrays. Use unique photo IDs. Saved photo IDs that no longer exist fall back to a current collection entry.

The quote collection contains original starter reminders; replace them with your own text or properly attributed quotes.
