# @labcat/tui

Claude Code-styled TUI web components (Lit core). See repo `SPEC.md` for full design.

## Install

```bash
pnpm add @labcat/tui
```

## Use

```html
<script type="module">import '@labcat/tui';</script>
<link rel="stylesheet" href="https://unpkg.com/@labcat/tui/dist/styles.css" />

<tui-tool-call tool="Read" args="posts/">
  <ul><li>proxmox-tuning</li><li>k3s-on-pi</li></ul>
</tui-tool-call>
```

For React, use `@labcat/tui-react`.

## v0.1 surface

Only `<tui-tool-call>` is implemented. `claude` and `claudeLight` themes are bundled. All other components are coming in v0.5+.
