# @labcat/tui

Claude Code-styled TUI web components (Lit core). See repo [`SPEC.md`](../../SPEC.md) for full design.

## Install

```bash
pnpm add @labcat/tui
```

## Use

```html
<script type="module">import '@labcat/tui';</script>
<link rel="stylesheet" href="@labcat/tui/styles.css" />

<tui-tool-call tool="Read" args="posts/">
  <ul><li>proxmox-tuning</li><li>k3s-on-pi</li></ul>
</tui-tool-call>
```

For React, use [`@labcat/tui-react`](../react/). For extra themes (gruvbox, rose-pine, kanagawa, synthwave, phosphor) use [`@labcat/tui-themes`](../themes/).

## Components (v0.5)

| Group | Tags |
| --- | --- |
| Surfaces | `<tui-session>`, `<tui-prompt-input>`, `<tui-prompt-line>`, `<tui-slash-overlay>`, `<tui-status-line>` |
| Tool I/O | `<tui-tool-call>`, `<tui-tool-use-timeline>`, `<tui-diff-block>`, `<tui-streamed-text>`, `<tui-spinner>` |
| Conversation | `<tui-chat-bubble>`, `<tui-thinking-block>`, `<tui-todo-list>`, `<tui-todo-item>`, `<tui-md>` |
| Layout | `<tui-box>`, `<tui-welcome-banner>` |
| Theming | `<tui-theme-provider>` |

## Exports

```ts
import { defineCommands, defineTheme, claude, claudeLight, closestMatch } from '@labcat/tui';
```

Full per-component API and live examples: [tui.labcat.dev](https://tui.labcat.dev/).
