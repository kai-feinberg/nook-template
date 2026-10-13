# Build report

## Delivered

Separate local Git repo at `/Users/kai/Desktop/active-projects/Nook Template`.
The source Nook working tree was not changed.

- Central typed config for branding, starter content, widget order, visibility, layout, background, art, and decorations.
- Built-in settings and local persistence retained; clock visibility control added.
- Exa API key path and developer annotation dependency removed.
- Trending disabled by default; local starter artwork.
- Setup, customization, data-use, and extension installation guides; ISC license.
- Independent browser preview through Portless; production extension output in `dist`.

## Run

Use `pnpm install --frozen-lockfile`, then `pnpm dev`.
Open the printed Portless URL with `/src/app/index.html`.
The checked preview was `http://nook-template.localhost:1355/src/app/index.html`.
Use `pnpm build:extension`, then load `dist` as an unpacked Chrome or Edge extension.

## Evidence

- `pnpm build` passed after the final changes. It includes the strict TypeScript check.
- Built manifest points to emitted `src/background.js` and `src/app/index.html`.
- Browser: starter branding, content, and local artwork rendered.
- Browser: changed note, background, and quote visibility persisted after reload.
- Browser: switched to Focus and edited a link label; resulting page reflected both edits. Restored starter values afterward.
- Browser: final settings exposed clock visibility and named input controls.
- Rendered at 1280 × 720 and 390 × 844. Narrow viewport content width was 390 pixels, with no horizontal overflow.
- A first development run failed because the extension plugin tried to launch from `dist-dev`. Preview now runs without that plugin. Production builds retain it.
- Original Nook Git status matches the initial list of changed and untracked files.

## Limits and unverified checks

- Unpacked extension installation and live GitHub refresh were not exercised in the browser. Build output was checked, which does not prove runtime integration.
- Reset confirmation, item deletion, and external service failure were not exercised.
- No remote repository was created or published. This local repo can be pushed and marked as a template on GitHub.
- Source illustration assets were retained at their original resolution. Combined image assets are about 11 MB.
- Personal settings do not sync across devices. Web preview storage is separate from extension storage.

## Attention and decisions

One initial scope question; user chose code template plus built-in settings.
No further product questions. Filesystem access outside the original workspace needed sandbox approval.
No user rework from product assumptions was observed. One development-tool defect was fixed during validation.

See `BUILD_BRIEF.md` and `DECISIONS.md` for intent and material choices.
