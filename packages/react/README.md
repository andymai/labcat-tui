# @labcat/tui-react

React wrappers for `@labcat/tui`. Hand-authored via `@lit/react`'s `createComponent`.

## Install

```bash
pnpm add @labcat/tui @labcat/tui-react
```

## Use

```tsx
import { ToolCallCard } from '@labcat/tui-react';
import '@labcat/tui/styles.css';

export function Example() {
  return <ToolCallCard tool="Read" args="posts/" />;
}
```

## v0.1 surface

Only `ToolCallCard` (`<tui-tool-call>`) is wrapped. More wrappers come in v0.5+ as their underlying Lit elements ship.
