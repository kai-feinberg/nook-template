# Decisions

- User requirement: Separate `Nook Template` folder and Git repo outside Nook. Preserve the original working tree.
- User requirement: Code template plus built-in settings.
- Agent decision: Reuse current Nook source and its visual assets. This preserves the reference design. Alternative: new UI. Revisit if the user requests a new visual direction.
- Agent decision: One typed config for reusable content and starter settings. Saved user settings take priority until reset. Alternative: runtime JSON loader. Revisit for non-developer distribution.
- Agent decision: Disable Trending by default and remove the Exa API key path. No paid dependency is needed. GitHub access is optional and may fail if GitHub changes its HTML.
- Agent decision: Local Git repo only. Remote publication needs an account and a chosen destination. No remote is required to deliver the local template.
- Evidence limit: Browser extension installation requires a browser session that permits loading unpacked extensions. Web preview checks cannot prove that integration.
