# @labcat/tui-themes

Additional theme presets for `@labcat/tui`. The `claude` / `claudeLight` themes ship in `@labcat/tui` core; this package adds curated extras with light/dark pairs.

## Themes available

| Token | Variants | Notes |
| ----- | -------- | ----- |
| `gruvbox` | dark + light | Pavel Pertsev's classic warm palette; orange accent on both. |

More pairs (rose-pine, kanagawa, synthwave, phosphor green/amber) will land in subsequent releases.

## Usage

```ts
import '@labcat/tui/components/theme-provider';
import { gruvbox } from '@labcat/tui-themes';
```

```html
<tui-theme-provider .theme=${gruvbox}>
  <!-- your UI -->
</tui-theme-provider>
```

Themes are plain objects validated against the same `ThemeDefinition` contract used by built-ins, so they round-trip through `themeToCssVars` / `themeToCssText` for SSR and snapshot use.

## Tree-shaking

The package is `sideEffects: false` and each theme is a named export. Bundlers will drop themes you don't import.
