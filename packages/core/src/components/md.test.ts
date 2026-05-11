import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './md.js';
import type { TuiMd } from './md.js';

describe('<tui-md>', () => {
  it('uses light DOM (no shadow root)', async () => {
    const el = await fixture<TuiMd>(html`<tui-md><p>hi</p></tui-md>`);
    expect(el.shadowRoot).toBeNull();
  });

  it('preserves slotted children intact', async () => {
    const el = await fixture<TuiMd>(html`<tui-md><p>hi</p><a href="#">link</a></tui-md>`);
    expect(el.querySelector('p')?.textContent).toBe('hi');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('#');
  });

  it('adds the tui-md class on connect', async () => {
    const el = await fixture<TuiMd>(html`<tui-md></tui-md>`);
    expect(el.classList.contains('tui-md')).toBe(true);
  });
});
