# Changelog

All notable changes to `@labcat/tui` and the family packages.

The format is loosely [Keep a Changelog](https://keepachangelog.com/), and the project follows [Semantic Versioning](https://semver.org/) once it leaves `0.x`. Until then, breaking changes can land on minor bumps.

## 0.6.0-beta.0 — Claude Code fidelity bump

A focused pass on visual + structural fidelity to the actual Claude Code CLI. Theme tokens now mirror the reference's surface (shimmer pairs, mode indicators, subagent personas, diff variants), two new components ship for the patterns those tokens enable, and three real bugs surfaced during the audit were fixed.

### Added — tokens

- `accentShimmer`, `systemSpinner` + `Shimmer`, `permission` + `Shimmer`, `promptBorder` + `Shimmer`, `inactive` + `Shimmer`, `warningShimmer`, `fastMode` + `Shimmer`: the **shimmer family** that powers Claude Code's breathing / pulse animations.
- `modeAutoAccept`, `modeBashBorder`, `modePermission`, `modePlanMode`, `modeIde`: **prompt-mode indicators**. Tints the prompt caret + left border depending on which mode the agent is in.
- `subagentAlpha` / `Bravo` / `Charlie` / `Delta` / `Echo` / `Foxtrot` / `Golf` / `Hotel`: an 8-persona **subagent palette**, NATO-phonetic callsigns. Names are intentionally not bound to color (so themes can map them freely without misleading consumers).
- `diffAddedDimmed`, `diffRemovedDimmed`, `diffAddedWord`, `diffRemovedWord`: nuanced diff rendering (dim row + bright word-level color).
- `selectionBg`, `chromeYellow`, `fastMode`: misc reference parity.

### Added — components

- `<tui-agent-badge callsign="alpha|bravo|...">` — persona indicator using the subagent token palette. Useful for multi-agent surfaces.
- `<tui-shimmer-text kind="accent|systemSpinner|permission|warning|inactive|fastMode|promptBorder">` — animates slotted text between a base color and its shimmer companion. Honors `prefers-reduced-motion`.

### Added — APIs

- `<tui-session mode="autoAccept|bashBorder|permission|planMode|ide">` — exposes the active mode via `--tui-active-mode-color` so descendant prompts inherit it.
- `<tui-prompt-input mode="…">` — caret + left border tint in the mode color. Inherits from `<tui-session mode>` when not set explicitly; own `mode` attr overrides.

### Changed

- Built-in `claude` / `claudeLight` adopt reference-exact RGB values for the brand orange (`#d77757`), `fg`, `error`, `warning`. Other warm web-translation tokens kept (no reference counterpart).
- `<tui-diff-block>` now uses `diffAddedDimmed` + `diffAddedWord` (and the removed variants) for the row background + foreground text respectively. Falls back to `--tui-success` / `--tui-error` when a theme omits the new tokens.

### Added — themes

- New `claudeAnsi` preset using the 16-color ANSI palette hex equivalents — retro / VT220 look without needing terminal-layer chalk resolution.
- All 9 `@labcat/tui-themes` presets (gruvbox + Light, rose-pine + Dawn, kanagawa + Lotus, synthwave, phosphorGreen + Amber) now ship the full v0.6 token surface with values hand-picked per palette identity.

### Breaking changes

- `ThemeDefinition` now requires ~30 additional tokens. Themes outside this monorepo will fail validation until they populate them.
- `subagentRed/Blue/Green/Yellow/Purple/Orange/Pink/Cyan` renamed to `subagentAlpha/Bravo/Charlie/Delta/Echo/Foxtrot/Golf/Hotel` (NATO phonetic; names not bound to color).

### Tests

- 159 core + 31 themes tests = **190 passing**. Bundle: 18.07 kB brotli (25 kB budget).

---

## 0.5 (skipped)

Feature-complete pre-release covering the original SPEC §4.1 component inventory; never published to npm. Folded into 0.6.

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

### `@labcat/tui-react`

- `@lit/react` wrappers for every component with type-safe JSX props and `onTui*` event handlers.

### `@labcat/tui-themes`

- Initial 9 curated theme presets.

### Docs (`tui.labcat.dev`)

- Built on Astro + Starlight; per-component MDX pages organised by surface / Tool I/O / Conversation / Layout / Theming categories.

### CI / Tooling

- CI matrix: Ubuntu × Node 22 + Node 24 (Node 20 dropped 2026-05-11 with the Astro 6 upgrade).
- Husky 9 + lint-staged, pre-commit only (no commit-msg / pre-push).
- Biome 2 for lint + format.
