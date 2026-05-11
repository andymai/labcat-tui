# Contributing

See `SPEC.md` §15 for the full contributor flow.

## Quick start

```bash
corepack enable
pnpm install
pnpm build         # required once for cross-package deps
pnpm dev           # watch mode + docs HMR
pnpm test
pnpm lint
```

## Adding a component (RFC required)

Open an issue first describing name, purpose, props/events/slots, and edge cases. See `SPEC.md` §4.2 for the contract format every new component must follow.

## Releases

```bash
pnpm changeset    # describe your change
```

Versioning is linked across `@labcat/tui`, `@labcat/tui-react`, `@labcat/tui-themes`.
