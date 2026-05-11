# @labcat/tui

Claude Code-styled TUI component library for the web. Default theme matches Claude Code; themable for other aesthetics. Lit web components core + React wrappers.

## Status

**v0.5 — feature-complete pre-release.** All 17 components from SPEC §4.1 ship, with 138 Vitest browser-mode tests green on Chromium across Node 22 + 24. See [`CHANGELOG.md`](./CHANGELOG.md) for the full v0.5 surface and [`SPEC.md`](./SPEC.md) for the design.

Not yet published to npm — the release is staged via `.changeset/v0-5-beta.md`; consumers can install via `pnpm link` against the local repo today.

## Packages

| Package | Purpose | Bundle (brotli) |
| --- | --- | --- |
| [`@labcat/tui`](./packages/core) | Lit web components core + `claude` / `claudeLight` themes + command system | ~16 kB / 25 kB budget |
| [`@labcat/tui-react`](./packages/react) | React wrappers via `@lit/react` | ~1.6 kB / 2 kB |
| [`@labcat/tui-themes`](./packages/themes) | 9 add-on theme presets (gruvbox, rose-pine, kanagawa, synthwave, phosphor) | ~1.2 kB / 2 kB |

## Quickstart

```bash
pnpm add @labcat/tui
```

```ts
import '@labcat/tui';
import '@labcat/tui/styles.css';
```

```html
<tui-session>
  <tui-welcome-banner glyph="✻" title="Welcome" />
  <tui-tool-call tool="Read" args="posts/">
    <ul><li>proxmox-tuning</li></ul>
  </tui-tool-call>
  <tui-slash-overlay></tui-slash-overlay>
  <tui-prompt-input placeholder="Type / for commands"></tui-prompt-input>
</tui-session>
```

Full docs: [tui.labcat.dev](https://tui.labcat.dev/).

## Development

```bash
corepack enable
pnpm install
pnpm build     # all packages
pnpm dev       # core build watch + docs dev server
pnpm test      # 138 tests across core + 31 across themes
pnpm typecheck # all packages
pnpm size      # bundle-size budgets
```

CI runs on Ubuntu × Node 22 + Node 24.

## License

MIT
