# @labcat/tui

Claude Code-styled TUI component library for the web. Default theme matches Claude Code; themable for other aesthetics. Lit web components core + React wrappers.

## Status

**v0.1 — skeleton.** One component (`<tui-tool-call>`) wired end-to-end to validate the monorepo, build, theming, React wrapping, and CI. See [`SPEC.md`](./SPEC.md) for the full design.

## Packages

| Package | Purpose |
| --- | --- |
| [`@labcat/tui`](./packages/core) | Lit web components core + `claude` / `claudeLight` themes |
| [`@labcat/tui-react`](./packages/react) | React wrappers via `@lit/react` |
| [`@labcat/tui-themes`](./packages/themes) | Additional theme presets (v0.5+) |

## Development

```bash
corepack enable
pnpm install
pnpm build
pnpm dev      # core build watch + docs dev server
pnpm test
pnpm lint
```

## License

MIT
