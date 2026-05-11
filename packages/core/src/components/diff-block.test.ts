import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './diff-block.js';
import type { TuiDiffBlock } from './diff-block.js';

describe('<tui-diff-block>', () => {
  it('renders one row per line with the appropriate marker', async () => {
    const el = await fixture<TuiDiffBlock>(html`<tui-diff-block></tui-diff-block>`);
    el.lines = [
      { kind: 'context', text: ' base' },
      { kind: 'remove', text: ' old' },
      { kind: 'add', text: ' new' },
    ];
    await el.updateComplete;
    const rows = Array.from(el.shadowRoot?.querySelectorAll('[part~="line"]') ?? []);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.getAttribute('data-kind')).toBe('context');
    expect(rows[1]?.getAttribute('data-kind')).toBe('remove');
    expect(rows[2]?.getAttribute('data-kind')).toBe('add');
    expect(rows[2]?.querySelector('[part~="marker"]')?.textContent).toBe('+');
    expect(rows[1]?.querySelector('[part~="marker"]')?.textContent).toBe('-');
  });

  it('defaults the tool label to "Edit"', async () => {
    const el = await fixture<TuiDiffBlock>(html`<tui-diff-block></tui-diff-block>`);
    expect(el.tool).toBe('Edit');
  });

  it('reflects tool + args as attributes', async () => {
    const el = await fixture<TuiDiffBlock>(
      html`<tui-diff-block tool="Patch" args="config.toml"></tui-diff-block>`,
    );
    expect(el.getAttribute('tool')).toBe('Patch');
    expect(el.getAttribute('args')).toBe('config.toml');
  });

  it('parses slotted children with data-marker into lines', async () => {
    const el = await fixture<TuiDiffBlock>(html`
      <tui-diff-block>
        <div data-marker="=">name: my-package</div>
        <div data-marker="-">version: 0.1.0</div>
        <div data-marker="+">version: 0.2.0</div>
      </tui-diff-block>
    `);
    await el.updateComplete;
    const rows = Array.from(el.shadowRoot?.querySelectorAll('[part~="line"]') ?? []);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.getAttribute('data-kind')).toBe('context');
    expect(rows[1]?.getAttribute('data-kind')).toBe('remove');
    expect(rows[2]?.getAttribute('data-kind')).toBe('add');
    expect(rows[2]?.querySelector('[part~="text"]')?.textContent).toContain('version: 0.2.0');
  });

  it('hides the light-DOM source slot from assistive tech', async () => {
    const el = await fixture<TuiDiffBlock>(html`
      <tui-diff-block>
        <div data-marker="+">added</div>
      </tui-diff-block>
    `);
    await el.updateComplete;
    const src = el.shadowRoot?.querySelector('.src');
    expect(src?.getAttribute('aria-hidden')).toBe('true');
  });

  it('falls back to the lines property when no slot is provided', async () => {
    const el = await fixture<TuiDiffBlock>(html`<tui-diff-block></tui-diff-block>`);
    el.lines = [{ kind: 'add', text: 'from prop' }];
    await el.updateComplete;
    const rows = Array.from(el.shadowRoot?.querySelectorAll('[part~="line"]') ?? []);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.querySelector('[part~="text"]')?.textContent).toContain('from prop');
  });
});
