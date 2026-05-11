---
'@labcat/tui': minor
'@labcat/tui-react': minor
'@labcat/tui-themes': minor
---

v0.5 beta — feature-complete component inventory.

**`@labcat/tui`**
- Ships all 17 SPEC §4.1 components: tui-tool-call, tui-spinner, tui-prompt-line, tui-prompt-input, tui-slash-overlay, tui-status-line, tui-streamed-text, tui-chat-bubble, tui-thinking-block, tui-todo-list / tui-todo-item, tui-tool-use-timeline, tui-box, tui-welcome-banner, tui-diff-block, tui-md, tui-session, tui-theme-provider.
- Built-in themes: `claude`, `claudeLight`.
- Command system (`defineCommands`, route/handler XOR, multi-word aliases, Levenshtein "did you mean").
- RTL snapshot tests for the three lighthouse components per SPEC §10.5.
- Bundle: ~16 kB brotli (25 kB budget).

**`@labcat/tui-react`**
- `@lit/react` wrappers for every component with type-safe JSX props and `onTui*` event handlers.
- Bundle: ~1.6 kB brotli (2 kB budget).

**`@labcat/tui-themes`**
- First themes shipped: `gruvbox`, `gruvboxLight`. Tree-shakable; ~580 B brotli per pair.
