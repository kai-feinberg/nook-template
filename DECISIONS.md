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
