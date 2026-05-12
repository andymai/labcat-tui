# @labcat/tui-shiki

Syntax-highlighted code blocks for `@labcat/tui`, powered by [Shiki](https://shiki.style).

Adds `<tui-code-block>` and a `tui-md` upgrade hook. Shiki itself is lazy-loaded the first time a block highlights, so importing this package doesn't penalise pages that never render code.

## Install

```bash
pnpm add @labcat/tui @labcat/tui-shiki
```

`@labcat/tui` is a peer dependency. React wrappers are exposed under the `/react` subpath and require `react` + `@lit/react`.

## Custom element

```html
<tui-code-block lang="ts" filename="hello.ts" highlight-lines="2,4">
function greet(name: string): string {
  // friendly hello
  const message = `Hello, ${name}!`;
  return message;
}
</tui-code-block>
```

Plain text renders immediately; the Shiki-highlighted version swaps in once the runtime chunk finishes loading. The Shiki theme is derived from the active `@labcat/tui` palette via the `--tui-code-*` CSS variables, so highlights track theme swaps automatically.

### Attributes

| Attribute         | Default | Description                                                       |
| ----------------- | ------- | ----------------------------------------------------------------- |
| `lang`            | `""`    | Source language. Accepts `ts`, `tsx`, `js`, `jsx`, `json`, `bash`, `python`, `markdown` plus aliases (`typescript`, `shell`, `py`, `md`). |
| `filename`        | `""`    | Optional filename rendered in the block header.                   |
| `highlight-lines` | `""`    | Comma/range list of line numbers to emphasise (e.g. `"2,4-6"`).   |
| `no-copy`         | `false` | Hide the copy-to-clipboard button.                                |

### Events

| Event           | Detail            | Notes                          |
| --------------- | ----------------- | ------------------------------ |
| `tui-code-copy` | `{ text: string }` | Fires when copy succeeds.     |

## Upgrading `<tui-md>` blocks

```ts
import { upgradeMd, watchMd } from '@labcat/tui-shiki';

const md = document.querySelector('tui-md')!;
upgradeMd(md);          // one-shot upgrade
const stop = watchMd(md); // re-upgrade as new blocks appear (streaming markdown)
```

`upgradeMd` swaps every `<pre><code class="language-xx">` it finds for a `<tui-code-block>` with the same source. Idempotent: nodes already upgraded are skipped.

## React

```tsx
import { CodeBlock } from '@labcat/tui-shiki/react';

<CodeBlock lang="ts" filename="hello.ts" onTuiCodeCopy={(e) => console.log(e.detail.text)}>
{`function greet(name: string) {
  return \`Hello, \${name}!\`;
}`}
</CodeBlock>
```

## License

MIT
