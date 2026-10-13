# Choose and store your photos

## Use your own photos without editing code

1. Open Settings with the gear button.
2. Find **Your photos**.
3. Select **Choose photos**, or drop image files into the photo area.
4. Choose one or more JPG, PNG, WebP, AVIF, or GIF files. Each file must be 8 MB or less. The collection holds up to 24 photos.
5. After the files save, the app selects **My photos** and shows a photo from your collection.

Use **Starter photos** to switch back. Use the trash button on a thumbnail to remove that file. If your personal collection becomes empty, the widget uses the starter collection. There is no Next image control. The displayed photo is selected from the collection once per local calendar day. All tabs with the same collection and local date choose the same photo. Adding or removing photos can change today's selection.

## Where files are stored

Selected files are copied into the browser's IndexedDB database `nook-template-photos`, in the `photos` store. Each record holds an ID, the file name, the time it was added, and the image Blob. The upload is complete only when the database transaction succeeds.

The files stay on this device in this browser profile. They are not sent to a server, added to the source repo, or included when someone clones the template. This is not a cloud backup. Browser data clearing, extension removal, or browser storage eviction can remove the files. Keep your original photos.

The web preview and the installed extension have separate storage. Add files separately in each. A different preview hostname is also a separate library. Local image storage follows the page's origin, as described in the [IndexedDB documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

When the page opens, it reads the saved Blobs and creates temporary object URLs for rendering. Those URLs are recreated on each load and released when the photo collection changes or the page unmounts. Object URLs are not saved in settings. See [object URL lifetime](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static).

Resetting the dashboard resets settings and personal text, links, and rituals. It switches to Starter photos but does not delete the saved image files. Remove files in Your photos when needed.

## Put starter photos in a cloneable template

For photos that should travel with the repo and work offline:

1. Copy image files into `src/app/assets/photos/`.
2. Import them in `src/template.config.ts`.
3. Replace the `art` array with entries that use the imports.
4. Build again.

```ts
import windowPhoto from "./app/assets/photos/window.jpg";
import gardenPhoto from "./app/assets/photos/garden.webp";

// Inside templateConfig:
art: [
  { id: "window", title: "Window light", imageUrl: windowPhoto,
    alt: "Sunlight through my window", sourceUrl: "" },
  { id: "garden", title: "In the garden", imageUrl: gardenPhoto,
    alt: "Plants in my garden", sourceUrl: "" }
]
```

Vite copies the imported images into the build and gives the page their final paths. This avoids absolute computer paths and works in the extension. Use unique stable IDs and useful alt text. Share only images you have permission to distribute.

## Remote starter photos

The current starter collection uses Unsplash image URLs in `src/template.config.ts`. Those files are loaded from Unsplash when displayed; they are not downloaded into the photo library. You can replace each URL with an image URL you control. A page link is not necessarily an image URL. Remote images need network access and may stop loading if their source changes.

The browser may use its normal HTTP cache, but the app does not promise an offline copy of remote photos. Use bundled imports or selected local files for offline photo access. Fonts and link icons can still need network access.

## Errors

Unsupported types, unreadable files, oversized images, and a full collection show a message. Database failure keeps the saved collection unchanged. A failed remote image shows a recovery message; choose a different collection in Settings or check the connection.

## Page background image

Use **Settings → Background image** to upload a wallpaper without editing code. It uses the same supported file types and 8 MB file limit as daily photos. The single wallpaper file is stored in the `background` store of the same IndexedDB database, under the key `wallpaper`; daily photos remain in the `photos` store. The database upgrade preserves existing photo records.

The wallpaper stays fixed until you replace it. Its enabled state, fit, position, and dimming are saved with the dashboard settings. Fill screen uses `cover`, Show whole image uses `contain`, and Repeat image tiles the file. Center, Top, and Bottom choose its anchor point. Dimming adds a dark overlay from 0–80%.

Turn off **Use this background image** to return to the selected theme. The saved file stays available. Resetting the dashboard disables it but does not delete its file. A replacement overwrites the previous wallpaper file; keep the originals if you want to use them again.

The wallpaper is recreated from its Blob on load. Its temporary object URL is released when replaced or unloaded. Background upload does not send the file to a server, add it to the repo, or change the rotating photo collection. For an image that should ship with all clones, use the bundled-background steps in [the background prompt guide](docs/prompts/background-image.md).
