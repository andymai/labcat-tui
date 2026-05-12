import { fixture, html } from '@open-wc/testing-helpers';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TuiCodeBlock } from './code-block.js';

const TS_SOURCE = `function greet(name: string): string {
  // friendly hello
  const message = \`Hello, \${name}!\`;
  return message;
}`;

function getStyleRoot(): HTMLElement {
  let style = document.querySelector<HTMLStyleElement>('#test-tui-tokens');
  if (style) return document.documentElement;
  style = document.createElement('style');
  style.id = 'test-tui-tokens';
  style.textContent = `:root {
    --tui-bg: #1a1816;
    --tui-surface: #221f1c;
    --tui-surface-2: #2a2622;
    --tui-border: #3a3530;
    --tui-fg: #ffffff;
    --tui-fg-muted: #a89c8a;
    --tui-fg-dim: #6e6353;
    --tui-accent: #d77757;
    --tui-success: #4eba65;
    --tui-font-mono: monospace;
    --tui-code-keyword: #c592ff;
    --tui-code-string: #7ec699;
    --tui-code-number: #eb9f7f;
    --tui-code-comment: #8a8070;
    --tui-code-function: #93a5ff;
    --tui-code-type: #ffdf85;
  }`;
  document.head.appendChild(style);
  return document.documentElement;
}

async function nextUpgrade(el: TuiCodeBlock, timeoutMs = 5000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const lines = el.shadowRoot?.querySelectorAll('.line');
    if (lines && lines.length > 0) {
      const inner = lines[0]?.querySelector('span[style]');
      if (inner) return;
    }
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error('highlight did not complete within timeout');
}

describe('<tui-code-block>', () => {
  beforeEach(() => {
    getStyleRoot();
  });

  afterEach(() => {
    for (const el of document.querySelectorAll('tui-code-block')) el.remove();
  });

  it('registers the custom element', () => {
    expect(customElements.get('tui-code-block')).toBe(TuiCodeBlock);
  });

  it('renders the raw source before highlighting completes', async () => {
    const el = await fixture<TuiCodeBlock>(
      html`<tui-code-block lang="ts">${TS_SOURCE}</tui-code-block>`,
    );
    expect(el.shadowRoot?.textContent ?? '').toContain('function greet');
  });

  it('asynchronously upgrades to highlighted spans with color styles', async () => {
    const el = await fixture<TuiCodeBlock>(
      html`<tui-code-block lang="ts">${TS_SOURCE}</tui-code-block>`,
    );
    await nextUpgrade(el);
    const colored = el.shadowRoot?.querySelectorAll('span[style*="color:"]');
    expect(colored?.length).toBeGreaterThan(0);
  });

  it('skips highlighting when lang is unknown', async () => {
    const el = await fixture<TuiCodeBlock>(
      html`<tui-code-block lang="bogus">${TS_SOURCE}</tui-code-block>`,
    );
    await new Promise((r) => setTimeout(r, 100));
    expect(el.shadowRoot?.querySelector('span[style*="color:"]')).toBeNull();
    expect(el.shadowRoot?.textContent ?? '').toContain('function greet');
  });

  it('renders a filename header when filename is set', async () => {
    const el = await fixture<TuiCodeBlock>(
      html`<tui-code-block lang="ts" filename="hello.ts">${TS_SOURCE}</tui-code-block>`,
    );
    const filename = el.shadowRoot?.querySelector('.filename');
    expect(filename?.textContent?.trim()).toBe('hello.ts');
  });

  it('omits the copy button when no-copy is set', async () => {
    const el = await fixture<TuiCodeBlock>(
      html`<tui-code-block lang="ts" no-copy>${TS_SOURCE}</tui-code-block>`,
    );
    expect(el.shadowRoot?.querySelector('.copy')).toBeNull();
  });

  it('marks the requested lines via highlight-lines', async () => {
    const el = await fixture<TuiCodeBlock>(
      html`<tui-code-block lang="ts" highlight-lines="2,4">${TS_SOURCE}</tui-code-block>`,
    );
    await nextUpgrade(el);
    const lines = el.shadowRoot?.querySelectorAll('.line') ?? [];
    const marked = Array.from(lines)
      .map((l, i) => ((l as HTMLElement).dataset.marked === 'true' ? i + 1 : 0))
      .filter(Boolean);
    expect(marked).toEqual([2, 4]);
  });

  it('parses range syntax in highlight-lines (e.g. 1-3)', async () => {
    const el = await fixture<TuiCodeBlock>(
      html`<tui-code-block lang="ts" highlight-lines="1-3">${TS_SOURCE}</tui-code-block>`,
    );
    await nextUpgrade(el);
    const lines = el.shadowRoot?.querySelectorAll('.line') ?? [];
    const marked = Array.from(lines)
      .map((l, i) => ((l as HTMLElement).dataset.marked === 'true' ? i + 1 : 0))
      .filter(Boolean);
    expect(marked).toEqual([1, 2, 3]);
  });

  it('emits tui-code-copy when the copy button is clicked', async () => {
    const original = navigator.clipboard;
    const writes: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (s: string) => void writes.push(s) },
    });
    try {
      const el = await fixture<TuiCodeBlock>(
        html`<tui-code-block lang="ts">const x = 1;</tui-code-block>`,
      );
      const seen: CustomEvent[] = [];
      el.addEventListener('tui-code-copy', (e) => seen.push(e as CustomEvent));
      const btn = el.shadowRoot?.querySelector<HTMLButtonElement>('.copy');
      btn?.click();
      await new Promise((r) => setTimeout(r, 30));
      expect(seen).toHaveLength(1);
      expect(seen[0]?.detail.text).toContain('const x');
      expect(writes).toEqual(['const x = 1;']);
    } finally {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: original });
    }
  });

  it('aliases typescript → ts', async () => {
    const el = await fixture<TuiCodeBlock>(
      html`<tui-code-block lang="typescript">${TS_SOURCE}</tui-code-block>`,
    );
    await nextUpgrade(el);
    const colored = el.shadowRoot?.querySelectorAll('span[style*="color:"]');
    expect(colored?.length).toBeGreaterThan(0);
  });
});
