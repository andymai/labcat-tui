# @labcat/tui-themes

Additional theme presets for `@labcat/tui`. The `claude` / `claudeLight` themes ship in `@labcat/tui` core; this package adds curated extras with light/dark pairs and single-tone palettes.

## Themes available

| Export | Variant | Notes |
| ------ | ------- | ----- |
| `gruvbox`        | dark   | Pavel Pertsev's classic warm palette; orange accent. |
| `gruvboxLight`   | light  | The light dual of gruvbox. |
| `rosePine`       | dark   | Muted pink-rose accent on a deep night. |
| `rosePineDawn`   | light  | Rosé Pine "Dawn" — cream + rose. |
| `kanagawa`       | dark   | Wave-inspired indigo + orange. |
| `kanagawaLotus`  | light  | "Lotus" daylight variant — straw + saffron. |
| `synthwave`      | dark   | Outrun neon: pink, cyan, magenta on plum-black. |
| `phosphorGreen`  | dark   | Old-CRT terminal — single phosphor hue (green). |
| `phosphorAmber`  | dark   | Same CRT vocabulary in amber. |

## Usage

```ts
import '@labcat/tui';
import { rosePine } from '@labcat/tui-themes';
```

```html
<tui-theme-provider .theme=${rosePine}>
  <!-- your UI -->
</tui-theme-provider>
```

Themes are plain objects validated against the same `ThemeDefinition` contract used by built-ins, so they round-trip through `themeToCssVars` / `themeToCssText` for SSR and snapshot use.

## Tree-shaking

The package is `sideEffects: false` and each theme is a named export. Bundlers will drop themes you don't import. Importing the entire package is still cheap — all 9 themes total ~1.2 kB brotli.

## Phosphor caveats

`phosphorGreen` and `phosphorAmber` are intentionally monochrome — they rely on the accent for the entire color story. For full retro authenticity, set `--tui-font-mono` on the provider to something like IBM 3270 or VT323.
