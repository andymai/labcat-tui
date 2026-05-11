# @labcat/tui-react

React wrappers for `@labcat/tui`. Hand-authored via `@lit/react`'s `createComponent` — every component has a typed JSX wrapper, every Lit event becomes an `onTui*` callback prop.

## Install

```bash
pnpm add @labcat/tui @labcat/tui-react
```

## Use

```tsx
import { ToolCallCard, PromptInput } from '@labcat/tui-react';
import '@labcat/tui/styles.css';

export function Example() {
  return (
    <>
      <ToolCallCard tool="Read" args="posts/" />
      <PromptInput placeholder="Type / for commands" onTuiCommand={(e) => console.log(e.detail)} />
    </>
  );
}
```

## Exports (v0.5 — 18 wrappers)

`Box`, `ChatBubble`, `DiffBlock`, `Md`, `PromptInput`, `PromptLine`, `Session`, `SlashOverlay`, `Spinner`, `StatusLine`, `StreamedText`, `ThemeProvider`, `ThinkingBlock`, `TodoItem`, `TodoList`, `ToolCallCard`, `ToolUseTimeline`, `WelcomeBanner`.

## Event handling

Lit events propagate up to React via `onTui*` props. The wrapper renames the event to avoid colliding with Lit element properties of the same name (e.g. `tui-navigate` → `onTuiNavigate` so the element's own `onNavigate` property stays usable).

Bundle: ~1.6 kB brotli (2 kB budget).
