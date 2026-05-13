# @labcat/tui

Claude Code-styled TUI component library for the web. Default theme matches Claude Code; themable for other aesthetics. Lit web components core + React wrappers.

## Status

**Pre-release beta.** All 21 components from SPEC §4.1 ship, alongside a slash-command system with opt-in built-ins and a framework-agnostic agent runtime. 223 Vitest browser-mode tests green on Chromium across Node 22 + 24. See [`CHANGELOG.md`](./CHANGELOG.md) for the surface and [`SPEC.md`](./SPEC.md) for the design.

Not yet published to npm — releases are staged via Changesets; consumers can install via `pnpm link` against the local repo today.

## Packages

| Package | Purpose | Bundle |
| --- | --- | --- |
| [`@labcat/tui`](./packages/core) | Lit web components core + `claude` / `claudeLight` themes + command system | ~22 kB / 25 kB (brotli) |
| [`@labcat/tui-react`](./packages/react) | React wrappers via `@lit/react` | ~1.7 kB / 2 kB (brotli) |
| [`@labcat/tui-themes`](./packages/themes) | Add-on theme presets (gruvbox, rose-pine, kanagawa, synthwave, phosphor, …) | ~3.1 kB / 4 kB (gzip) |
| [`@labcat/tui-shiki`](./packages/shiki) | `<tui-code-block>` + Shiki-driven markdown upgrade | ~8.9 kB / 10 kB (brotli) |
| [`@labcat/tui-agent`](./packages/agent) | Framework-agnostic agent runtime — turn model + transport interface + mock/Anthropic adapters + React hook | ~1.2 kB / 4 kB (brotli) |

A reference Claude Code-style clone lives at [`apps/clone`](./apps/clone/) — React + Vite, runs against scripted mock transcripts by default, switches to live `claude-opus-4-7` via `VITE_ANTHROPIC_API_KEY`.

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
pnpm test      # 223 tests across core, themes, shiki, agent
pnpm typecheck # all packages
pnpm size      # bundle-size budgets
```

CI runs on Ubuntu × Node 22 + Node 24.

## License

MIT
