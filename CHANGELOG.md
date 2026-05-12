# Changelog

All notable changes to `@labcat/tui` and the family packages.

The format is loosely [Keep a Changelog](https://keepachangelog.com/), and the project follows [Semantic Versioning](https://semver.org/) once it leaves `0.x`. Until then, breaking changes can land on minor bumps.

## Unreleased — syntax-highlighted code blocks

A new package, `@labcat/tui-shiki`, adds first-class syntax highlighting for the chat / agent / tool-call surfaces this library covers. Existing themes gain six code-scope tokens so highlights track the active palette without anyone having to ship a separate Shiki theme alongside their `@labcat/tui` theme.

### Added — `@labcat/tui-shiki` (new package)

- `<tui-code-block lang filename highlight-lines no-copy code>` — open shadow DOM, paints raw code immediately, then asynchronously upgrades to highlighted spans once the Shiki runtime chunk loads. Copy button emits `tui-code-copy`. Highlight ranges via `highlight-lines="2,4-6"`.
- `upgradeMd(root)` / `watchMd(root)` — find every `<pre><code class="language-xx">` inside a container (typically `<tui-md>`) and swap it for `<tui-code-block>`. Idempotent; `watchMd` keeps upgrading as new blocks stream in.
- `deriveShikiTheme(host)` — read `--tui-code-*` CSS variables off any element and return a TextMate-style Shiki theme JSON. Re-runs automatically when the document's `data-tui-theme` or `class` attribute changes.
- React wrapper at `@labcat/tui-shiki/react` (`<CodeBlock>` + typed `onTuiCodeCopy`).
- Eight bundled grammars: `ts`, `tsx`, `js`, `jsx`, `json`, `bash`, `python`, `markdown`. Aliases: `typescript`, `shell`, `sh`, `zsh`, `py`, `md`.

### Added — `@labcat/tui` + `@labcat/tui-themes`

- Six new code-scope tokens on `ThemeDefinition`: `codeKeyword`, `codeString`, `codeNumber`, `codeComment`, `codeFunction`, `codeType`. Built-in themes (claude / claudeLight / claudeAnsi) and all nine add-on themes populated with palette-coherent values.

### Changed

- `validateTheme()` now requires the six new code-scope tokens. **Breaking for consumer-defined themes**: existing themes will throw `MissingTokenError` until they fill in the new tokens. Still in 0.6 beta, so no migration step beyond appending the tokens.

### Bundle

- `@labcat/tui` core: 18.07 kB → 18.62 kB brotli (six new tokens in three built-in themes; 25 kB budget).
- `@labcat/tui-themes`: 1.22 kB → 3.07 kB gzip (54 new token-value pairs across 9 themes; 4 kB budget).
- `@labcat/tui-shiki` synchronous entry: 8.86 kB brotli (10 kB budget). Shiki itself is dynamic-imported and code-split by the consumer bundler — pages that never render code don't pay for it.

## 0.6.0-beta.0 — Claude Code fidelity bump

A focused pass on visual + structural fidelity to the actual Claude Code CLI. Theme tokens now mirror the reference's surface (shimmer pairs, mode indicators, subagent personas, diff variants), two new components ship for the patterns those tokens enable, and three real bugs surfaced during the audit were fixed.

### Added — tokens

- Shimmer family that powers Claude Code's breathing/pulse animations: `accentShimmer`, `systemSpinner` + `systemSpinnerShimmer`, `modePermissionShimmer`, `promptBorder` + `promptBorderShimmer`, `inactive` + `inactiveShimmer`, `warningShimmer`, `fastMode` + `fastModeShimmer`.
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

- 166 core + 31 themes tests = **197 passing**. Core bundle: 18.07 kB gzip (25 kB budget). Themes pack: 2.82 kB gzip (4 kB budget).

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
