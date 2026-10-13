# Nook Template

A new tab page that feels like home. Clone it, edit the starter config, and use Settings to make it yours.

## Start

Use Node.js 24 or later and PNPM 10.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Portless, then visit `/src/app/index.html`. The named host is `nook-template.localhost`. Portless can add a port to the URL if its default port is unavailable. For a direct Vite server, use `pnpm dev:direct`.

## Install as a new tab extension

```sh
pnpm build:extension
```

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Enable Developer mode.
3. Select **Load unpacked**, then select this repo's `dist` folder.
4. Open a new tab.

After code changes, build again and select Reload on the extension card. Firefox and Safari packages are outside this release.

## Make it yours

Edit `src/template.config.ts` for the name, tagline, quote collection, starter links, rituals, note, widget order, visible widgets, layout, background, artwork, and decorations. TypeScript checks the available layout and background choices.

Settings lets each user change layouts, backgrounds, widget visibility, links, and rituals. Edit the note on the page. These changes are saved on the device. Code defaults apply on first use or after **Reset to starter dashboard**. Reset deletes personal settings after confirmation. Changes to branding, quotes, art, and widget order apply on each load.

For deeper changes, see [CUSTOMIZATION.md](CUSTOMIZATION.md).

## Arrange your page

Select **Arrange widgets** in the top toolbar. Drag a handle onto another piece or use the earlier/later buttons. Select Small, Medium, or Large for each piece, then select Done. Pieces snap to a grid. Notes start at Large. Reset layout restores order and sizes without changing notes, links, or rituals. Mobile uses the saved order in one column.

## Daily content

Quotes change once per local calendar day. Photos change daily too. **Next image** advances the photo and keeps your choice until the next day. Edit `quotes` and `art` in `src/template.config.ts` to change the collections. An empty collection shows setup guidance. A failed photo shows a recovery message.

## Data and permissions

No account, server, API key, or paid service is required. The extension uses `chrome.storage.local`. The web preview uses browser local storage. These stores are separate and do not sync across devices. Personal content and layout stay on the device.

The extension declares only the storage permission. It has no background worker or host permissions. Starter photos load from Unsplash, link icons use Google's favicon service, and fonts use Google Fonts. The browser contacts these services when it loads assets. To use local photos, import them in the config. To use system fonts, remove the CSS font import.

## Share your version

This folder is a separate local Git repo. Create a remote repo, add its URL with `git remote add origin <url>`, then push your branch. On GitHub, enable **Template repository** in repository settings so others can use **Use this template**. You can also provide the clone URL. No remote repo is included in this local build.

## Checks

```sh
pnpm test
pnpm typecheck
pnpm build
```

See [BUILD_REPORT.md](BUILD_REPORT.md) for checks run on this version.
