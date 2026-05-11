# Changelog

All notable changes to `@labcat/tui` and the family packages.

The format is loosely [Keep a Changelog](https://keepachangelog.com/), and the project follows [Semantic Versioning](https://semver.org/) once it leaves `0.x`. Until then, breaking changes can land on minor bumps.

## Unreleased — v0.5 beta

Feature-complete pre-release. **Not yet published to npm.** The release is staged via `.changeset/v0-5-beta.md`; consumers can use the workspace via `pnpm link` against the local repo.

### `@labcat/tui`

- All 17 SPEC §4.1 components shipped:
  - **Surfaces** — `<tui-session>`, `<tui-prompt-input>`, `<tui-prompt-line>`, `<tui-slash-overlay>`, `<tui-status-line>`.
  - **Tool I/O** — `<tui-tool-call>`, `<tui-tool-use-timeline>`, `<tui-diff-block>`, `<tui-streamed-text>`, `<tui-spinner>`.
  - **Conversation** — `<tui-chat-bubble>`, `<tui-thinking-block>`, `<tui-todo-list>`, `<tui-todo-item>`, `<tui-md>`.
  - **Layout** — `<tui-box>`, `<tui-welcome-banner>`.
  - **Theming** — `<tui-theme-provider>` (built-in `claude` / `claudeLight`).
- Command system: `defineCommands`, `CommandRegistry`, route XOR handler, multi-word aliases, Levenshtein "did you mean" via the exported `closestMatch()`.
- Runtime theme validation via `defineTheme()` — dev throws on missing tokens or invalid colors; prod warns + falls back to `claude`.
- RTL snapshot coverage for the three lighthouse components per SPEC §10.5.
- 137 Vitest browser-mode tests (Chromium via Playwright provider) across 23 files.
- Core bundle: ~16 kB brotli (25 kB budget).

### `@labcat/tui-react`

- `@lit/react` wrappers for every component with type-safe JSX props and `onTui*` event handlers.
- Bundle: ~1.6 kB brotli (2 kB budget).

### `@labcat/tui-themes`

- Curated theme presets (all tree-shakable, all validated against the same `ThemeDefinition` contract):
  - `gruvbox`, `gruvboxLight` — Pavel Pertsev's warm palette pair.
  - `rosePine`, `rosePineDawn` — muted pink-rose on night / cream + rose for daylight.
  - `kanagawa`, `kanagawaLotus` — wave-inspired indigo + orange / straw + saffron daylight.
  - `synthwave` — outrun neon on plum-black.
  - `phosphorGreen`, `phosphorAmber` — single-hue CRT terminal vocabularies.
- Bundle: ~1.2 kB brotli for the whole pack; a few hundred bytes per single theme import (2 kB budget).

### Docs (`tui.labcat.dev`)

- Built on Astro + Starlight; per-component MDX pages organised by surface / Tool I/O / Conversation / Layout / Theming categories.
- `/themes` page documenting the full preset inventory + the `defineTheme` authoring contract.

### CI / Tooling

- CI matrix: Ubuntu × Node 22 + Node 24 (Node 20 dropped 2026-05-11 with the Astro 6 upgrade).
- Husky 9 + lint-staged, pre-commit only (no commit-msg / pre-push).
- Biome 2 for lint + format.
- Pre-release artifact: `.changeset/v0-5-beta.md` describes the release surface.
