---
'@labcat/tui': minor
'@labcat/tui-themes': minor
'@labcat/tui-shiki': minor
---

Syntax-highlighted code blocks via Shiki.

**`@labcat/tui`** — Extends `ThemeDefinition` with six new code-scope tokens
(`codeKeyword`, `codeString`, `codeNumber`, `codeComment`, `codeFunction`,
`codeType`). Built-in `claude` / `claudeLight` / `claudeAnsi` themes ship
palette-coherent defaults. Breaking change for **consumer-defined themes**:
`validateTheme()` now requires the six new tokens — fill them in before
upgrading.

**`@labcat/tui-themes`** — All nine add-on themes (gruvbox/Light,
rosePine/Dawn, kanagawa/Lotus, synthwave, phosphorGreen/Amber) populated
with code-scope tokens that fit each palette.

**`@labcat/tui-shiki`** *(new package)* — Adds `<tui-code-block>` and
`upgradeMd` / `watchMd` helpers. Shiki itself is dynamic-imported on first
highlight so the synchronous footprint stays at 8.86 kB brotli. The Shiki
theme is derived per-render from the active `--tui-code-*` CSS variables,
so highlights track theme swaps automatically — including
consumer-defined themes. Bundled grammars: ts, tsx, js, jsx, json, bash,
python, markdown.
