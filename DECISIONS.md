# Decisions

- User requirement: Separate `Nook Template` folder and Git repo outside Nook. Preserve the original working tree.
- User requirement: Code template plus built-in settings.
- Agent decision: Reuse current Nook source and its visual assets. This preserves the reference design. Alternative: new UI. Revisit if the user requests a new visual direction.
- Agent decision: One typed config for reusable content and starter settings. Saved user settings take priority until reset. Alternative: runtime JSON loader. Revisit for non-developer distribution.
- User requirement: Remove GitHub Trending and the fox. The worker, host permissions, cache, data modules, and fox asset are removed.
- Agent decision: Daily quote and image changes use the local calendar date. Next image keeps a manual choice for the current day. Alternative: timed slideshow. Revisit if the user requests motion or per-tab rotation.
- Agent decision: Constrained grid with saved order and Small, Medium, and Large sizes. Notes start Large. Drag handles support pointer input; move buttons support keyboard input. Alternative: a full freeform canvas. Revisit if users need exact coordinates.
- User requirement: Drag to reorder with size buttons; daily photos with a Next image button. The user confirmed both choices after the first implementation. Size menus were changed to Small, Medium, and Large buttons.
- Agent decision: Local Git repo only. Remote publication needs an account and a chosen destination. No remote is required to deliver the local template.
- Evidence limit: Browser extension installation requires a browser session that permits loading unpacked extensions. Web preview checks cannot prove that integration.

- User requirement: Remove Next image. Replace the control bars with direct three-dot dragging, a bottom-right hover resize control, and dynamic previews.
- Evidence and decision: Research compared RGL and GridStack. Use React Grid Layout 2.3.0 for React-owned collision handling, resize constraints, and placeholders. See RESEARCH.md. App-level keyboard controls remain necessary.
- Agent decision: Add a local photo picker and drop area. Store image Blobs in IndexedDB, not settings JSON. Recreate object URLs after load. Alternative: config edits only. Revisit for cloud sync or a portable backup feature.
- Superseded: Earlier size-button and Next image requirements were replaced by this request. The current workflow is documented in README.md and IMAGES.md.

- Performance decision: Keep the live clock inside its badge. The rest of the page updates its date at local midnight or when it becomes visible. Memoize grid children, configs, and callbacks. Disable preview easing during drag/resize and reduce active shadows; preserve idle styling and reduced-motion support.

- User requirement: Enter personal quotes and reminders in Settings, rotate them daily, store a background image-generation prompt, and deliver a README with instructions and screenshots.
- Agent decision: Separate starter and personal daily-word collections. Add optional attribution, edit controls, a 100-entry limit, and local persistence. Keep the date-based selection used for photos.
- Agent decision: Save the image prompt as a Markdown file; do not generate an image without a request to do so. Use a separate localhost origin for documentation screenshots to preserve the user's working content.
