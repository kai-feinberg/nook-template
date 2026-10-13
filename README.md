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

Edit `src/template.config.ts` for the name, tagline, quote, starter links, rituals, note, widget order, visible widgets, layout, background, artwork, and decorations. TypeScript checks the available layout and background choices.

Settings lets each user change layouts, backgrounds, widget visibility, links, and rituals. Edit the note on the page. These changes are saved on the device. Code defaults apply on first use or after **Reset to starter dashboard**. Reset deletes personal settings after confirmation. Changes to branding, quotes, art, and widget order apply on each load.

For deeper changes, see [CUSTOMIZATION.md](CUSTOMIZATION.md).

## Data and permissions

No account, server, API key, or paid service is required. The extension uses `chrome.storage.local`. The web preview uses browser local storage. These are separate stores; they do not sync across devices.

GitHub Trending is off by default. If enabled, it requests GitHub through the extension worker. A failed refresh keeps the cached result and shows an error. The web preview cannot refresh this widget. Link icons use Google's favicon service. Font loading uses Google Fonts. Your browser contacts these services when it loads those assets. The bundled starter illustration is local.

The manifest declares storage access and GitHub Trending host access. If you remove Trending, also remove its host permission and background worker.

## Share your version

This folder is a separate local Git repo. Create a remote repo, add its URL with `git remote add origin <url>`, then push your branch. On GitHub, enable **Template repository** in repository settings so others can use **Use this template**. You can also provide the clone URL. No remote repo is included in this local build.

## Checks

```sh
pnpm typecheck
pnpm build
```

See [BUILD_REPORT.md](BUILD_REPORT.md) for checks run on this version.
