# @labcat/tui — Spec

Claude Code-styled TUI component library for the web. Default theme matches Claude Code; themable for other aesthetics. Lit web components core + React wrappers. Drop-in components or full sessions.

## 0. North Star

A reader installs `@labcat/tui`, drops a single `<Session>` into their app, and gets a working Claude Code-style TUI: warm-dark background, coral accent, `●` tool-call cards, `›` prompt, status line. Theme swap if they want a different vibe. Primitives if they want à la carte.

Three differentiators:

1. **Claude Code vocabulary**, not generic "terminal vibes"
2. **Framework-agnostic but ergonomic** — Lit core + React wrappers; works in React, Vue, Svelte, Astro, plain HTML
3. **Functional, not just visual** — `<PromptInput>` is a real command-routing layer

## 1. Brand & Distribution

| Aspect              | Choice                                                                      |
| ------------------- | --------------------------------------------------------------------------- |
| Package family      | `@labcat/tui` · `@labcat/tui-react` · `@labcat/tui-themes`                  |
| Repo                | `github.com/andymai/labcat-tui` (separate from labcat.dev)                  |
| Docs site           | `tui.labcat.dev` — Astro Starlight, `apps/docs` in the monorepo             |
| Site consumer       | `labcat.dev` imports `@labcat/tui` as a dependency                          |
| License             | MIT                                                                         |
| Versioning          | Semver; **linked** across the family via Changesets (lockstep)              |
| Source approach     | Clean-room — no derivation from any reference repo                          |
| Module format       | ESM-only (no CJS)                                                           |
| Browser support     | Chrome/Edge 105+, Firefox 110+, Safari 16+ (no legacy)                      |

## 2. Tech Stack

| Layer                | Choice                                                          |
| -------------------- | --------------------------------------------------------------- |
| Component framework  | Lit (small, fast, native web components)                        |
| React adapter        | `@lit/react` (per-element wrappers, manual)                     |
| Library build        | Vite library mode (`build.lib`)                                 |
| Monorepo build       | pnpm workspaces + Turborepo (caching, task graph)               |
| TypeScript           | Strict; types ship as `.d.ts` + Custom Elements Manifest (CEM)  |
| Unit tests           | Vitest browser mode (Playwright provider, Chromium)             |
| Visual regression    | Playwright snapshots (Linux-only baseline)                      |
| A11y testing         | `@axe-core/playwright` on docs                                  |
| Docs site            | Astro 5 + Starlight                                             |
| Releases             | Changesets + GitHub Actions                                     |
| Linting / format     | Biome                                                           |
| Bundle size CI       | `size-limit` enforced per package                               |

**On Vitest vs Web Test Runner**: WTR was the original pick (canonical Lit path) but its default mocha framework was a non-starter. Vitest browser mode runs components in real browsers via the same Playwright provider, with `describe`/`it`/`expect` and modern ergonomics. Equivalent isolation guarantees, better DX.

## 3. Repository Layout

```
labcat/tui/
├── packages/
│   ├── core/                          # @labcat/tui
│   │   ├── src/
│   │   │   ├── components/            # one file per element
│   │   │   ├── theme/                 # ThemeProvider, defineTheme, claude
│   │   │   ├── animation/             # StreamedText, EscInterrupt, Spinner
│   │   │   ├── commands/              # parser, registry, router
│   │   │   ├── events/                # event types + names
│   │   │   ├── styles/                # tokens.css, base.css
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── custom-elements.json       # generated CEM
│   │   └── tsconfig.json
│   ├── react/                         # @labcat/tui-react
│   │   ├── src/components/            # @lit/react wrappers
│   │   └── package.json               # peerDeps: react, @labcat/tui
│   └── themes/                        # @labcat/tui-themes
│       ├── src/
│       │   ├── gruvbox.ts             # gruvbox + gruvbox-light
│       │   ├── rose-pine.ts           # rose-pine + rose-pine-dawn
│       │   ├── synthwave.ts           # single
│       │   ├── kanagawa.ts            # kanagawa + kanagawa-lotus
│       │   ├── phosphor-green.ts      # single
│       │   ├── phosphor-amber.ts      # single
│       │   └── index.ts
│       └── package.json               # peerDeps: @labcat/tui
├── apps/
│   └── docs/                          # tui.labcat.dev (Starlight)
│       ├── astro.config.mjs
│       ├── src/{content/docs,components,pages}/
│       └── package.json               # workspace:^ @labcat/tui
├── examples/
│   ├── plain-html/                    # vanilla HTML
│   ├── react/                         # React app
│   ├── astro/                         # Astro project
│   ├── vue/                           # Vue app
│   └── svelte/                        # Svelte app
├── scripts/
│   ├── generate-cem.ts                # CEM build
│   ├── release-notes.ts               # changelog post-processing
│   └── codemods/                      # per-release codemods
├── .github/workflows/
│   ├── ci.yml                         # lint + test + build + size-limit
│   └── release.yml                    # Changesets publish
├── .changeset/
├── pnpm-workspace.yaml
├── package.json                       # workspace root
├── turbo.json
├── biome.json
├── tsconfig.base.json
├── LICENSE                            # MIT
├── SECURITY.md
├── README.md
├── CONTRIBUTING.md
└── SPEC.md                            # this document
```

## 4. Component Inventory & Contracts

### 4.1 Inventory

17 elements. All have React wrappers in `@labcat/tui-react` (hand-authored via `@lit/react`'s `createComponent`; CEM feeds IDE tooling only — there is no source-codegen step).

```
tui-box                  tui-tool-call           tui-prompt-line
tui-prompt-input         tui-status-line         tui-welcome-banner
tui-thinking-block       tui-todo-list           tui-todo-item
tui-diff-block           tui-spinner             tui-streamed-text
tui-chat-bubble          tui-tool-use-timeline   tui-md
tui-theme-provider       tui-session             tui-slash-overlay
```

### 4.2 Component contracts

Each subsection lists: **Attrs** (HTML-friendly strings, kebab-case), **Props** (JS-only objects/functions, camelCase), **Slots**, **Events** (all `bubbles: true, composed: true`), **Parts** (`::part()` selectors), **Edge cases**. Default rendering: **shadow DOM (open)** unless noted.

#### `<tui-box>`
Box frame.
- **Attrs**: `kind` (`rounded` | `sharp`), `title` (str)
- **Slots**: default (body)
- **Parts**: `chrome`, `title`, `body`
- **Edge cases**: empty body renders chrome only

#### `<tui-tool-call>`
Signature `●` tool-call card.
- **Attrs**: `tool` (str), `args` (str), `status` (`ok` | `pending` | `running` | `error`), `aria-label` (override)
- **Slots**: default (body)
- **Parts**: `dot`, `head`, `tool`, `args`, `body`
- **Edge cases**: long `args` wrap below `tool`; empty body renders head only; `error` uses `--tui-error` accent

#### `<tui-prompt-line>`
Static `›` prompt + optional command + optional cursor.
- **Attrs**: `command` (str), `cursor` (bool)
- **Parts**: `caret`, `command`, `cursor`
- **Edge cases**: long commands wrap; cursor blinks unless reduced motion

#### `<tui-prompt-input>`
Functional `›` input with declarative commands. See §8.
- **Attrs**: `placeholder` (str), `history-key` (str), `history-limit` (number), `disabled` (bool)
- **Props**: `commands` (Command[]), `onNavigate` (`(url: string) => void`)
- **Events**: `tui-command`, `tui-command-success`, `tui-command-error`, `tui-navigate`
- **Parts**: `caret`, `input`, `cursor`
- **Edge cases**: see §8.4 (history per-instance), §8.5 (handler lifecycle)

#### `<tui-status-line>`
Status bar.
- **Attrs**: `breadcrumb` (str), `kind` (`fixed` | `inline`)
- **Props**: `segments` (Segment[] where `Segment = { label: string; live?: 'off' | 'polite' | 'assertive' }`)
- **Slots**: default (overrides `segments`), `left`, `right`
- **Parts**: `segment`, `separator`, `breadcrumb`
- **Edge cases**: overflows horizontally (scrolls) on narrow viewports; per-segment `aria-live` (default `off`)

#### `<tui-welcome-banner>`
Boxed welcome with glyph + tips.
- **Attrs**: `glyph` (str, default `✻`), `title` (str)
- **Slots**: default (subtitle / tips)
- **Parts**: `chrome`, `glyph`, `title`, `subtitle`
- **Edge cases**: long titles wrap; chrome scrolls horizontally on overflow

#### `<tui-thinking-block>`
Collapsible aside (uses native `<details>`).
- **Attrs**: `open` (bool), `label` (str, default `Thinking…`)
- **Slots**: default (body), `summary` (override label)
- **Events**: native `toggle` event
- **Parts**: `summary`, `body`

#### `<tui-todo-list>`
Dumb container. `role="list"`, CSS-only. No JS aggregation. Items register themselves via shadow DOM slot — list does NOT query or aggregate children.
- **Attrs**: `kind` (`flat` | `grouped`)
- **Slots**: default (`<tui-todo-item>`s)

#### `<tui-todo-item>`
- **Attrs**: `status` (`pending` | `in-progress` | `completed`)
- **Slots**: default (label)
- **Events**: `tui-todo-change` (fired when `status` attr changes)
- **Parts**: `dot`, `label`
- **A11y**: `role="listitem"`, status mapped to `aria-checked` (`mixed` for in-progress)

#### `<tui-diff-block>`
- **Attrs**: `tool` (str, default `Edit`), `args` (str)
- **Props**: `lines` (`Array<{ kind: 'add' | 'remove' | 'context'; text: string }>`)
- **Slots**: default (alternative to `lines`, pre-rendered HTML)
- **Parts**: `line`, `marker`, `text`
- **Edge cases**: long lines scroll horizontally

#### `<tui-spinner>`
- **Attrs**: `kind` (`dots` | `line` | `box` | `pulse`), `running` (bool), `aria-label` (str, default `Loading`)
- **Parts**: `glyph`
- **Edge cases**: pauses on `prefers-reduced-motion: reduce`

#### `<tui-streamed-text>`
CSS-animated char-by-char reveal. **Non-destructive**: mirrors slotted content into shadow DOM, never mutates the slotted light-DOM. See §9.1.
- **Attrs**: `speed` (ms), `cps` (chars/sec), `delay` (ms), `start-when-visible` (bool), `skip-on-revisit` (bool)
- **Slots**: default (text — only text nodes / inline phrasing; block content unsupported in v1)
- **Events**: `tui-stream-start`, `tui-stream-complete`, `tui-stream-interrupt`
- **Parts**: `char`
- **Edge cases**: slot text changes mid-stream → re-mirror, restart animation; concurrent instances share one rAF batch

#### `<tui-chat-bubble>`
- **Attrs**: `role` (`user` | `assistant` | `system`), `name` (str), `timestamp` (str)
- **Slots**: default (body)
- **Parts**: `head`, `role`, `name`, `timestamp`, `body`

#### `<tui-tool-use-timeline>`
Vertical timeline of tool calls.
- **Slots**: default (`<tui-tool-call>` elements)
- **Parts**: `connector`, `dot`
- **Edge cases**: empty timeline renders nothing

#### `<tui-md>`
TUI-styled prose container. **Light DOM** (no shadow root) so consumer prose CSS cascades in.
- **Slots**: default (pre-rendered HTML — consumer sanitizes; library trusts input)
- **CSS vars**: `--tui-prose-h1-color`, `--tui-prose-link-color`, etc.
- **Edge cases**: XSS surface; security note in §17

#### `<tui-theme-provider>`
Wraps subtree, sets CSS vars on `:host` so they inherit into both shadow children and slotted light-DOM children.
- **Attrs**: `theme` (str, name of built-in)
- **Props**: `theme` (string | ThemeDefinition)
- **Slots**: default (children)
- **Events**: `tui-theme-change` (`{ from, to }`)
- **Edge cases**: nested providers override at host boundary

#### `<tui-session>`
High-level: banner + content + prompt + status. **Light DOM** (so slotted children behave naturally in any framework).
- **Attrs**: `banner` (str), `banner-glyph` (str)
- **Props**: `commands` (Command[]), `statusSegments` (Segment[]), `onNavigate` (callback)
- **Slots**: default (content), `banner`, `prompt`, `status`, `before-prompt`
- **Owns**: document-level keyboard shortcuts (`/`, `Cmd-K`, `?`). Standalone `<tui-prompt-input>` doesn't self-register these.
- **Events**: re-fires `tui-command`, `tui-navigate`, `tui-theme-change` from children
- **Edge cases**: multiple sessions on a page → last-mounted wins shortcut routing (with `console.warn` in dev); `<tui-keyboard-scope ignore-shortcuts>` opts subtrees out

#### `<tui-slash-overlay>`
Modal command palette. Rendered by `<tui-session>` on Cmd-K; can be used standalone with consumer-driven `open`.
- **Attrs**: `open` (bool)
- **Props**: `commands` (Command[])
- **Events**: `tui-slash-select` (`{ command }`), `tui-slash-dismiss`
- **Parts**: `backdrop`, `list`, `item`
- **A11y**: focus-trap when open, `aria-modal="true"`

## 5. API & Events

### 5.1 Default usage (HTML / Astro / Vue / Svelte)

```js
// app entry
import '@labcat/tui';                  // registers all custom elements
import '@labcat/tui/styles.css';       // default theme + base styles
```

```html
<tui-welcome-banner glyph="✻">welcome to labcat.dev</tui-welcome-banner>

<tui-tool-call tool="Read" args="posts/">
  <ul><li>proxmox-tuning</li><li>k3s-on-pi</li></ul>
</tui-tool-call>

<tui-status-line breadcrumb="~/posts"></tui-status-line>
```

Object props go through DOM (or Lit templates):

```js
const input = document.querySelector('tui-prompt-input');
input.commands = commands;
input.onNavigate = (url) => router.push(url);
```

```js
html`<tui-prompt-input .commands=${commands} .onNavigate=${navigate}></tui-prompt-input>`
```

### 5.2 React usage

```tsx
import { defineCommands } from '@labcat/tui';
import { ToolCallCard, PromptInput, ThemeProvider }
  from '@labcat/tui-react';
import '@labcat/tui/styles.css';

const commands = defineCommands([
  { name: '/posts', aliases: ['ls posts'], route: '/posts/', description: 'list posts' },
  { name: '/theme', handler: (_, ctx) => ctx.toggleTheme(), description: 'toggle theme' },
]);

export function App() {
  return (
    <ThemeProvider theme="claude">
      <ToolCallCard tool="Read" args="posts/">…</ToolCallCard>
      <PromptInput commands={commands} onNavigate={(url) => router.push(url)} />
    </ThemeProvider>
  );
}
```

### 5.3 Custom theme

```ts
import { defineTheme } from '@labcat/tui';

export const matrix = defineTheme({
  name: 'matrix',
  bg: '#000', surface: '#0a0a0a', fg: '#00ff41',
  fgMuted: '#00aa2c', fgDim: '#005014',
  accent: '#00ff41', accentDim: '#00aa2c',
  border: '#1a1a1a',
  success: '#00ff41', error: '#ff0040',
  warning: '#ffaa00', info: '#00aaff',
  fontMono: '"VT323", monospace',
});
```

**Naming**: JS API is `camelCase` (`fgMuted`); CSS custom properties are `--tui-` + `kebab-case` (`--tui-fg-muted`). `defineTheme()` does the conversion. **Validation**: required tokens are checked; `CSS.supports('color', value)` validates color strings; dev mode throws on misuse, prod warns and falls back to `claude`.

### 5.4 Session wrapper

```tsx
<Session
  banner="welcome to labcat.dev"
  bannerGlyph="✻"
  commands={commands}
  statusSegments={[
    { label: 'labcat.dev' },
    { label: '~/posts' },
    { label: 'home lab ● up', live: 'polite' },
  ]}
  onNavigate={navigate}
>
  <ToolCallCard tool="Read" args="posts/">…</ToolCallCard>
</Session>
```

With slot overrides:

```tsx
<Session banner="welcome">
  <StatusLine slot="status" segments={mySegments} />
  <CustomPromptInput slot="prompt" />
  <main>…</main>
</Session>
```

### 5.5 Light/dark theme pairs

```tsx
import { claude, claudeLight } from '@labcat/tui';
import { gruvbox, gruvboxLight } from '@labcat/tui-themes';

<ThemeProvider theme={isDark ? claude : claudeLight}>…</ThemeProvider>
```

Pairs: `claude/claudeLight`, `gruvbox/gruvboxLight`, `rose-pine/rose-pine-dawn`, `kanagawa/kanagawa-lotus`. Single-mode: `synthwave`, `phosphor-green`, `phosphor-amber`.

### 5.6 Event convention

- **Naming**: `tui-<verb>` (kebab-case)
- **Default flags**: `bubbles: true, composed: true` (crosses shadow boundaries)
- **`detail` shapes**: typed in `src/events/types.ts`, surfaced in CEM
- **Callback props are sugar over events.** `onNavigate` is a property (function reference). The corresponding `tui-navigate` CustomEvent ALSO fires (after the callback) so passive listeners work. Consumers pick either pattern; they're equivalent.

Selected event registry (full list in each component's contract above):

| Event                  | Fired by              | `detail`                          |
| ---------------------- | --------------------- | --------------------------------- |
| `tui-command`          | `tui-prompt-input`    | `{ name, args }`                  |
| `tui-command-success`  | `tui-prompt-input`    | `{ command, args }`               |
| `tui-command-error`    | `tui-prompt-input`    | `{ command, args, error }`        |
| `tui-navigate`         | `tui-prompt-input`    | `{ url }`                         |
| `tui-theme-change`     | `tui-theme-provider`  | `{ from, to }`                    |
| `tui-stream-start`     | `tui-streamed-text`   | `{}`                              |
| `tui-stream-complete`  | `tui-streamed-text`   | `{}`                              |
| `tui-stream-interrupt` | `tui-streamed-text`   | `{}`                              |
| `tui-slash-select`     | `tui-slash-overlay`   | `{ command }`                     |
| `tui-slash-dismiss`    | `tui-slash-overlay`   | `{}`                              |
| `tui-todo-change`      | `tui-todo-item`       | `{ status, previousStatus }`      |

## 6. Theme System

### 6.1 Token vocabulary (CSS custom property ↔ JS key)

| CSS                       | JS key            |
| ------------------------- | ----------------- |
| `--tui-bg`                | `bg`              |
| `--tui-fg`                | `fg`              |
| `--tui-fg-muted`          | `fgMuted`         |
| `--tui-fg-dim`            | `fgDim`           |
| `--tui-surface`           | `surface`         |
| `--tui-surface-2`         | `surface2`        |
| `--tui-border`            | `border`          |
| `--tui-accent`            | `accent`          |
| `--tui-accent-dim`        | `accentDim`       |
| `--tui-success`           | `success`         |
| `--tui-error`             | `error`           |
| `--tui-warning`           | `warning`         |
| `--tui-info`              | `info`            |
| `--tui-font-mono`         | `fontMono`        |
| `--tui-leading-tight`     | `leadingTight`    |
| `--tui-leading-body`      | `leadingBody`     |
| `--tui-content-max`       | `contentMax`      |
| `--tui-dur-fast`          | `durFast`         |
| `--tui-dur-base`          | `durBase`         |
| `--tui-easing`            | `easing`          |

### 6.2 Distribution

`claude` and `claudeLight` ship inside `@labcat/tui` core. Additional themes are tree-shakable imports from `@labcat/tui-themes`.

### 6.3 Reduced motion

All animations gate on `@media (prefers-reduced-motion: reduce)` and degrade to instant final state.

### 6.4 Theme switching at runtime

`<ThemeProvider>` accepts either a built-in name (string) or a `ThemeDefinition` object. `CommandContext.setTheme` takes the same union: `setTheme(theme: string | ThemeDefinition): void`. Built-in name registry queryable via `listBuiltInThemes()`.

### 6.5 `defineTheme()` validation

Runtime check at definition time:
- All required tokens present (throws `MissingTokenError` if not)
- Each color value valid via `CSS.supports('color', value)` (throws `InvalidColorError`)
- `fontMono` non-empty
- Dev mode: throws on first call with the offending theme
- Prod mode: `console.warn`, fall back to `claude`

### 6.6 FOUC mitigation

Before custom element upgrade, `<tui-*>` tags render as empty inline elements. `styles.css` includes:

```css
:not(:defined) { visibility: hidden; }
```

For above-the-fold content, consumers can inline a small CSS chunk to render chrome before JS arrives.

## 7. Styling Strategy

### 7.1 Shadow DOM by default

All components use **open shadow DOM** by default. Enforces isolation; prevents leak in either direction.

### 7.2 Light DOM exceptions

Two components use **light DOM** (`createRenderRoot()` returning `this`):

- `<tui-md>` — consumer prose CSS cascades into rendered markdown
- `<tui-session>` — slotted children behave naturally in any framework / hot-reload story

### 7.3 Theme cascade through shadow boundaries

`<tui-theme-provider>` sets CSS vars on `:host`. They inherit into:
- The provider's shadow content
- Slotted light-DOM children (CSS custom properties inherit naturally)
- Nested shadow roots inside slotted children

Nested `<tui-theme-provider>` instances override at their host boundary. Tested via visual regression with deliberately-nested themes.

### 7.4 Customization surface

Three layers consumers reach without forking:

1. **CSS custom properties** (`--tui-*`) — recolor + adjust tokens
2. **`::part()`** — restyle structural pieces (e.g., `tui-tool-call::part(dot) { color: red }`)
3. **`::slotted()`** — style slotted children where the component allows

Beyond these requires fork. This stance is documented and stable.

## 8. Functional Prompt Architecture

### 8.1 Command definition

```ts
interface BaseCommand {
  name: string;
  aliases?: string[];
  description?: string;
  group?: string;
  completions?: (currentArg: string, ctx: CommandContext)
    => string[] | Promise<string[]>;
}

type Command =
  | (BaseCommand & { route: string;   handler?: never })
  | (BaseCommand & { handler: CommandHandler; route?: never });

type CommandHandler =
  (arg: string, ctx: CommandContext) => void | Promise<void>;

interface CommandContext {
  navigate:    (url: string) => void;
  toggleTheme: () => void;
  setTheme:    (theme: string | ThemeDefinition) => void;
  emit:        (event: string, detail?: unknown) => void;
}
```

`defineCommands()` runtime-validates the XOR; TS already enforces it at compile time.

### 8.2 Parsing

- Whitespace-separated: first token is command, rest is argument string
- Slash-prefix and bare forms both resolve (`/posts`, `posts`, `ls posts` all hit the same)
- Tab completion: prefix-match against names + aliases; argument position calls the matched command's `completions?`
- Unknown command → `error`-status `<tui-tool-call>` with Levenshtein "did you mean…"

### 8.3 Navigation contract

`onNavigate` is a **property** (function reference). The `tui-navigate` event also fires (after the property callback) for passive listeners.

If `onNavigate` is unset, default behavior is `window.location.href = url`. Framework adapters wire their router in:

```tsx
<PromptInput onNavigate={(url) => router.push(url)} />
```

### 8.4 History per-instance

Default `historyKey = "tui:history:" + id`, where `id` is:
1. The element's `id` attribute, if present
2. Otherwise a stable hash of its DOM path, computed once on `connectedCallback`

Override via `history-key` attr / `historyKey` prop. Sharing history between instances: pass the same key explicitly.

History entries: array of strings, FIFO-trimmed to `historyLimit` (default 50). ↑/↓ navigate. Ctrl+R fuzzy-search → v2.

### 8.5 Handler lifecycle & errors

When a command's `handler` runs:

1. PromptInput sets `aria-busy="true"`, visually dims, disables submit
2. Handler resolves:
   - **Success** → fires `tui-command-success` with `{ command, args }`. Default UI: clears input, re-enables.
   - **Rejection** → fires `tui-command-error` with `{ command, args, error }`. Default UI: renders an inline `<tui-tool-call status="error">` with the error message. Consumer can `event.preventDefault()` on `tui-command-error` to suppress the default.
3. PromptInput re-enables; ready for next command

Concurrency: only one handler runs at a time. Submitting during a pending handler is a **no-op** (with a subtle visual cue — no queueing).

### 8.6 Global keyboard shortcuts

Only `<tui-session>` registers document-level shortcuts (`/`, `Cmd-K`, `?`). Standalone `<tui-prompt-input>` does NOT.

Multiple `<tui-session>` on a page: **last-mounted wins** shortcut routing (with `console.warn` in dev). Subtrees opt out via `<tui-keyboard-scope ignore-shortcuts>`.

## 9. Animation System

### 9.1 `<tui-streamed-text>` — non-destructive mirroring

To avoid clashing with framework re-renders, the component mirrors slotted content into its shadow DOM instead of mutating the slotted light-DOM:

```
1. slotchange fires
2. Read current slot text content
3. Render <slot> in shadow DOM with aria-hidden="true" + display: none
4. Render the mirror as per-char <span>s with inline animation-delay
5. CSS keyframe drives the reveal (from { opacity: 0 } to { opacity: 1 })
6. Original light-DOM slot stays pristine; framework can re-render at will
7. On slot re-change → re-mirror, cancel current animation, restart
```

**A11y**: the shadow DOM mirror is the single source of truth for assistive tech. The `<slot>` is `aria-hidden` + visually hidden so the same text isn't announced twice (once via the light-DOM slot pass-through, once via the mirror). The mirror's per-char `<span>`s concatenate to the same string in the accessibility tree.

Single shared `requestAnimationFrame` orchestrator batches all instances on the page.

**Reduced motion**: skip animation, render the mirror in final state instantly. **Skip on revisit**: `sessionStorage` marker keyed on text hash.

### 9.2 ESC interrupt (opt-in scope)

ESC is not globally bound by default. Enable via `<tui-esc-interrupt>` wrapper or `data-tui-esc-interrupt` attribute:

```html
<tui-esc-interrupt>
  <tui-streamed-text>…</tui-streamed-text>
</tui-esc-interrupt>
```

Streamed text inside the scope respects ESC; outside the scope, ESC is unaffected. Library does not hijack a globally-meaningful key.

### 9.3 Spinner

```html
<tui-spinner kind="dots" running></tui-spinner>
```

Kinds: `dots` (⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏), `line` (`- \ | /`), `box` (▖▘▝▗), `pulse` (●○○○ → ○●○○ → …). Toggle `running` attribute to start/stop.

## 10. Accessibility & Internationalization

### 10.1 ARIA roles

| Component             | Role / approach                                                                         |
| --------------------- | --------------------------------------------------------------------------------------- |
| `tui-tool-call`       | `role="region"`, auto `aria-label="${tool} ${args}"` (overridable)                      |
| `tui-prompt-input`    | Real `<input>` inside shadow root with `aria-label="terminal command"`                  |
| `tui-status-line`     | `role="status"`; per-segment `aria-live` (default `off`)                                |
| `tui-thinking-block`  | Native `<details>` / `<summary>`                                                        |
| `tui-todo-list`       | `role="list"`                                                                           |
| `tui-todo-item`       | `role="listitem"`; status → `aria-checked` (`mixed` for in-progress)                    |
| `tui-spinner`         | `role="status"` + `aria-label`; pauses on `prefers-reduced-motion`                      |
| `tui-streamed-text`   | Final text in DOM from t=0; `aria-live="off"` during anim; reduced motion → instant     |
| `tui-slash-overlay`   | `role="dialog"`, `aria-modal="true"`, focus-trap when `open`                            |

### 10.2 Keyboard shortcuts (registered by `<tui-session>`)

| Key                | Effect                                              |
| ------------------ | --------------------------------------------------- |
| `/`                | Focus `<tui-prompt-input>` (not in form fields)     |
| `Esc`              | Interrupt scoped animations (see §9.2)              |
| `↑` / `↓`          | History prev/next when prompt focused               |
| `Tab`              | Completion in prompt                                |
| `Cmd-K` / `Ctrl-K` | Open `<tui-slash-overlay>`                          |
| `?`                | Open slash-command help (not in form fields)        |

Form-field detection (`<input>`, `<textarea>`, `[contenteditable]`) is built in.

### 10.3 Color contrast

All built-in themes (including light variants) meet WCAG AA for body text (≥4.5:1). Verified in CI via axe-core.

### 10.4 Focus management

- `<tui-prompt-input>` never traps focus
- `<tui-session>` includes a skip-link to its content slot
- `<tui-slash-overlay>` traps focus when open; releases on close

### 10.5 Internationalization

- All internal CSS uses **logical properties** (`margin-inline-start`, `border-block-end`, etc.)
- Asymmetric box-drawing chrome (`╭`, `╰`) is mirrored on `dir="rtl"` (`╮`, `╯`)
- The `›` prompt glyph stays as-is in RTL (typographic constant; ink and most TUI libs do the same)
- Hardcoded English ARIA strings (`"Loading"`, `"terminal command"`, `"Thinking…"`) accept overrides via attributes/properties (`spinner-label`, `prompt-label`, `thinking-label`)
- v1.0 testing: one RTL snapshot per lighthouse component (`tui-tool-call`, `tui-prompt-input`, `tui-status-line`)

## 11. SSR & Hydration

### 11.1 Stance for v1.0

Components are **client-rendered only**. Lit's CE registry is client-only without `@lit-labs/ssr`. Components do not pre-render on the server in v1.

### 11.2 FOUC mitigation

See §6.6.

### 11.3 Astro recipe

```astro
---
import '@labcat/tui';
import '@labcat/tui/styles.css';
---
<tui-session client:load banner="welcome">
  <!-- content -->
</tui-session>
```

Components used in pages must be inside an Astro island or use a `client:*` directive. The library is in the client bundle either way.

### 11.4 Next.js (App Router)

`@labcat/tui-react` ships with `"use client"` at the top of every entry file. Consumers import directly from any component (Server or Client); wrappers become Client Components.

### 11.5 Vue / Svelte

Standard custom-element hydration. No special directives needed.

### 11.6 v2 plan

`@lit-labs/ssr` + Declarative Shadow DOM for true server-rendered markup. Parked — cost/benefit doesn't justify v1.0.

## 12. Testing

### 12.1 What's tested

| Layer              | Tool                                              |
| ------------------ | ------------------------------------------------- |
| Unit / component   | Vitest browser mode + Lit (Chromium via Playwright provider) |
| Visual regression  | Playwright snapshots                              |
| A11y               | `@axe-core/playwright` on docs                    |
| Reduced motion     | Playwright with `prefers-reduced-motion: reduce`  |
| RTL                | Playwright with `dir="rtl"` on lighthouse cmps    |
| Type tests         | `tsd` for adapter prop + callback types           |
| Bundle size        | `size-limit` per package                          |
| Runtime perf       | Playwright + `performance.measure()`, nightly     |

### 12.2 Visual regression strategy

Representative subset to keep the matrix maintainable:

- All 17 components in default `claude` theme (~17 snapshots)
- Three lighthouse components (`tui-tool-call`, `tui-prompt-input`, `tui-status-line`) × every theme (~21 snapshots)
- Reduced-motion variants for animated components (~5)
- RTL variants for lighthouse components (~3)

Target ~46 snapshots.

### 12.3 Test file location

Co-located: `src/components/tool-call.ts` + `src/components/tool-call.test.ts`.

### 12.4 CI matrix

- **Node**: 20.x LTS + 22.x current. (Drop 18 — EOL April 2025.)
- **OS**: `ubuntu-latest` only. Contributors on macOS/Windows run unit tests locally; visual regression runs only on Linux baseline.
- **pnpm**: pinned via `package.json#packageManager` (Corepack).
- **Vitest browsers**: Chromium baseline in v0.1. Firefox + WebKit added in v0.5 via additional Playwright provider instances. WebKit on Linux can flake on shadow DOM bugs — flagged non-blocking until v1.0 baseline stabilizes.
- **Snapshots**: `__snapshots__/linux/` only. Contributors don't commit local snapshot updates from non-Linux platforms.

### 12.5 `tsd` coverage

Required: every callback prop in `@labcat/tui-react` has tests asserting:
- Valid signatures accepted
- Wrong-arity, wrong-return, wrong-arg-type signatures rejected
- `completions` return type narrowed (no implicit `Promise<string>`)

## 13. Build, Bundling & Performance

### 13.1 Build outputs (per package)

- `dist/index.js` — ES modules (ESM only)
- `dist/styles.css` — themed default CSS (core only)
- `dist/index.d.ts` — TypeScript types
- `custom-elements.json` — CEM
- `package.json` `exports` field with subpath imports + dev condition (see §13.6)

### 13.2 Inter-package dependencies

| Package                | Depends on                                       |
| ---------------------- | ------------------------------------------------ |
| `@labcat/tui`          | `lit` (regular)                                  |
| `@labcat/tui-react`    | peer: `react >=18`, `@labcat/tui` (same major)   |
| `@labcat/tui-themes`   | peer: `@labcat/tui` (same major)                 |

Within the monorepo, packages reference each other via `workspace:^`.

### 13.3 Bundle size budgets (`size-limit`, CI-enforced)

- `@labcat/tui` core: ≤ 25 kB gzipped
- `@labcat/tui-react`: ≤ 2 kB gzipped (wrappers only)
- `@labcat/tui-themes`: ≤ 1 kB per theme

PRs exceeding budget are blocked.

### 13.4 Runtime performance budgets (soft, nightly)

- All 17 elements `:defined` within 50ms of `DOMContentLoaded` on a mid-tier mobile device (Moto G Power class)
- `<tui-streamed-text>` ≤16ms main-thread time per instance; ≥20 concurrent at 60fps
- `<tui-prompt-input>` keystroke → paint ≤16ms p95
- Measured via Playwright + `performance.measure()` in `perf.test.ts`, gated to CI nightly (not per-PR)
- Regressions: PR comment, non-blocking until v1.0 baseline established

### 13.5 Browser support

| Browser | Min |
| ------- | --- |
| Chrome  | 105 |
| Edge    | 105 |
| Firefox | 110 |
| Safari  | 16  |

Required: Web Components v1, ES2022, CSS custom properties, `:has()` (used minimally), `visualviewport`. No legacy. Optional `@labcat/tui/polyfills` entry for consumers who need it.

### 13.6 Monorepo task graph

`turbo.json`:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "custom-elements.json"]
    },
    "test": { "dependsOn": ["^build"] },
    "dev":  { "cache": false, "persistent": true, "dependsOn": ["^build"] }
  }
}
```

`apps/docs` builds after `^build` so package `dist/` exists.

For dev mode, each package runs in watch:
- `packages/core`: `vite build --watch` rewrites `dist/` on file change
- `packages/react`, `packages/themes`: `tsc --watch` (or equivalent)
- `apps/docs`: `astro dev` — Vite's file watcher inside the docs site picks up upstream `dist/` changes and HMRs

`dev`'s `dependsOn: ['^build']` ensures a cold start produces `dist/` before docs starts (Turborepo runs the build dep, then keeps the persistent dev task running). This uses stock Astro/Vite configuration — no custom export conditions, no source-resolution plugins, no surprises for contributors.

### 13.7 Mobile considerations

- All components are touch-friendly (no hover-only affordances)
- `<tui-prompt-input>` uses `inputmode="text"` + `autocomplete="off"`; floats above the virtual keyboard via `visualviewport.onresize`
- `<tui-status-line>` overflows horizontally (scrollable) on narrow viewports
- `<tui-welcome-banner>` is horizontally scrollable to avoid wrapping box-drawing characters
- `<tui-session>` reflows on viewport changes; prompt remains visible above the keyboard

## 14. Versioning & Deprecation

### 14.1 Linked versioning

`.changeset/config.json`:

```json
{
  "linked": [["@labcat/tui", "@labcat/tui-react", "@labcat/tui-themes"]]
}
```

All three packages version in lockstep through v1.x. Peer dep is "same major"; lockstep eliminates user-facing version arithmetic. Re-evaluate at v2 if churn diverges.

### 14.2 Deprecation policy

- Deprecated attrs/props: keep working for one minor cycle; emit `console.warn` in dev (`import.meta.env.DEV`); mark `deprecated: true` in CEM
- Renamed elements: ship a stub registering BOTH old + new tag names for one minor; remove old in next major
- Codemods: each mechanical breaking change ships with `scripts/codemods/<release>.ts`
- LTS: major version N supports critical-security backports for **6 months** after N+1 release

### 14.3 Changelog

Auto-generated by Changesets; refined via `scripts/release-notes.ts` (groups by package, highlights breaking changes, links to codemods).

### 14.4 Release flow

```
1. Developer:  pnpm changeset           (describe change)
2. PR merged → automated "Version Packages" PR opens
3. Merge      → GitHub Action tags + publishes via Changesets
```

## 15. Local Development & Contributor Flow

### 15.1 First-time setup

```bash
git clone https://github.com/andymai/labcat-tui
cd labcat-tui
corepack enable                # uses pinned pnpm version
pnpm install
pnpm build                     # first build required for cross-package deps
pnpm dev                       # core build watch + docs hot-reload
```

### 15.2 Common commands

| Command                            | Effect                                                      |
| ---------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                         | Core build watch + docs dev server                          |
| `pnpm test`                        | All unit tests                                              |
| `pnpm test --filter @labcat/tui`   | Tests for one package                                       |
| `pnpm test:watch`                  | WTR in watch mode                                           |
| `pnpm test:visual`                 | Playwright visual regression                                |
| `pnpm test:visual --update`        | Regenerate snapshots (Linux only)                           |
| `pnpm cem`                         | Regenerate CEM (runs in `prebuild`)                         |
| `pnpm changeset`                   | Describe a change for release                               |
| `pnpm pack:core`                   | Build tarball for downstream testing                        |

### 15.3 Testing inside an external project

```bash
pnpm --filter @labcat/tui pack
cd /path/to/your-app
pnpm add /abs/path/to/labcat-tui-x.y.z.tgz
```

More reliable than `pnpm link` for the custom-element registry.

### 15.4 Adding a new component

1. Open an RFC issue: name, purpose, props/events/slots, edge cases
2. Discussion + approval
3. PR: `src/components/<name>.ts` + `.test.ts` + docs page + CEM regen
4. Changeset describing addition
5. Reviewed against §4.2 contract format

### 15.5 Contributing a theme

1. New file in `packages/themes/src/<name>.ts` using `defineTheme`
2. Add to themes index export
3. Snapshot tests auto-include it (lighthouse components × all themes)
4. PR with screenshots in the description

### 15.6 Examples coverage

Each `examples/<framework>/` demonstrates **the same surface**: `<Session>` + 3 components + a theme switch + one command. Cross-framework parity is auditable. Examples are CI-tested: each builds + boots dev server + Playwright smoke test asserts `<tui-tool-call>` becomes `:defined`. NOT part of the npm release.

## 16. Documentation Site

`apps/docs/` Astro Starlight site at `tui.labcat.dev`. Imports the lib via `workspace:^`.

```
/                       hero + install + first-look
/docs/start             install, first component, theme switch
/docs/components/...    one page per component, live examples
/docs/themes            built-ins + custom + light/dark pairs
/docs/animations        streamed-text, spinner, ESC interrupt
/docs/commands          PromptInput + commands registry + error handling
/docs/a11y              ARIA, contrast, reduced motion, keyboard, RTL
/docs/ssr               framework recipes
/docs/recipes           common compositions ("full session", "blog header")
/playground             live editor (Codepen-style)
```

The docs site **partially dogfoods**: global chrome uses `<Session>` + `<StatusLine>`; in-content examples use raw components so example layouts stay predictable. Going fully dogfooded would constrain layout.

## 17. Security

### 17.1 XSS surface

- `<tui-md>` accepts slotted HTML. **Consumer sanitizes.** Library trusts input. Component docs say this prominently.
- `<tui-prompt-input>` echoes user input as text content (never HTML). Built-in XSS-safe.
- `defineTheme` values land in CSS custom properties. Malformed values fail CSS parsing; no XSS path.
- All other components: text-only content APIs; slotted children are the consumer's responsibility.

### 17.2 Telemetry — none

**`@labcat/tui` and siblings make zero network requests.** No phone-home, update checks, analytics, or remote resource loading. The only network behavior is `onNavigate` (consumer-supplied) and URLs in `<tui-md>` slot content.

**Versioned commitment**: any future feature adding outbound requests requires a major version bump AND an explicit opt-in flag.

### 17.3 Supply chain

- Dependencies pinned via lockfile
- Renovate-bot keeps them current
- Dependabot alerts on the repo
- SBOM published with each release

### 17.4 Disclosure

`SECURITY.md` at repo root. Private GitHub Security Advisories preferred over public issues.

## 18. Roadmap

### v0.1 — Skeleton (1 weekend)
- pnpm + Turborepo monorepo with `^build` graph + `development` exports condition
- `@labcat/tui` core with ONE working component (`<tui-tool-call>`)
- `@labcat/tui-react` wrapper for that one
- `claude` + `claudeLight` themes bundled in core
- Vite library build (ESM-only) + CEM generation
- Bare-minimum Starlight scaffold
- CI: lint + build + test + size-limit on Linux
- Astro `client:load` recipe documented

### v0.5 — Beta (2–3 weekends)
- All baseline 8 primitives shipped with full §4.2 contracts
- Event model finalized (registry stable)
- `ThemeProvider` + `defineTheme` with runtime validation
- `StreamedText` with non-destructive mirroring + `Spinner` + ESC interrupt (opt-in scope)
- `PromptInput` with handler lifecycle + per-instance history + error events + tab completion
- 3 themes including light pairs
- Docs site with component pages + recipes + handler/error examples
- Publish to npm with `beta` dist-tag
- RTL snapshots passing for lighthouse components

### v1.0 — Public launch
- All 17 components shipped (including `<tui-slash-overlay>`), functionally complete per §4.2 contracts
- All built-in themes (claude/light, gruvbox/light, rose-pine/dawn, kanagawa/lotus, synthwave, phosphor-green, phosphor-amber)
- A11y pass (axe-core, contrast, keyboard, reduced motion, RTL)
- Visual regression coverage (representative subset, ~46 snapshots)
- Bundle-size + runtime perf budgets met
- All 5 examples (HTML/React/Astro/Vue/Svelte) with parity, CI-tested
- `<tui-md>` ships without code-block syntax highlighting (Shiki integration deferred to v1.x — see below)
- Stable API; semver from here
- Announce: tweet, HN, Reddit r/javascript

### v1.x — Additions
- Shiki integration for `<tui-md>` code blocks (custom theme matching Claude palette)
- `StreamedText` variants (word-by-word, token-by-token)
- More themes / additional `-light` pairs
- `@labcat/tui-md-remark` syntactic-sugar package for inline markdown rendering

### v2 — Stretch
- SSR via `@lit-labs/ssr` + Declarative Shadow DOM
- Vue + Svelte direct adapters (auto-generated from CEM)
- Canvas renderer for game-engine integration (Phaser, Pixi)
- Server helpers for SSE/WebSocket-fed streamed text
- `<tui-pty>` embedding xterm.js
- `@labcat/tui-tailwind` preset mapping tokens

## 19. Open Questions

- Confirm `@labcat` scope ownership on npm before first publish
- Validate Vite library mode + Lit externalization at scaffold time
- Berkeley Mono on docs site uses same fallback chain as labcat.dev; needs a custom Shiki theme generator for matching code blocks
- Whether `examples/svelte` and `examples/vue` ship in v1.0 or v1.x — both need a contributor with framework familiarity; current plan is v1.0
- Animation pause API: should `<tui-streamed-text>` expose a `paused` attribute for manual control beyond ESC? (Currently no; revisit if requested)
- Visual regression cross-platform: current plan is Linux-only baseline. If macOS contributors find this painful, investigate font-rendering normalization (e.g., a Docker dev container)
