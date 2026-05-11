import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './shimmer-text.js';
import type { TuiShimmerText } from './shimmer-text.js';

describe('<tui-shimmer-text>', () => {
  it('defaults to kind="accent" with a 1800ms cycle', async () => {
    const el = await fixture<TuiShimmerText>(html`<tui-shimmer-text>x</tui-shimmer-text>`);
    expect(el.kind).toBe('accent');
    expect(el.duration).toBe(1800);
  });

  it('reflects kind as an attribute and renders the slotted text', async () => {
    const el = await fixture<TuiShimmerText>(
      html`<tui-shimmer-text kind="warning">heads up</tui-shimmer-text>`,
    );
    expect(el.getAttribute('kind')).toBe('warning');
    expect(el.textContent?.trim()).toBe('heads up');
  });

  it('applies the duration as a CSS custom property', async () => {
    const el = await fixture<TuiShimmerText>(
      html`<tui-shimmer-text duration="500">x</tui-shimmer-text>`,
    );
    await el.updateComplete;
    expect(el.style.getPropertyValue('--tui-shimmer-duration').trim()).toBe('500ms');
  });
});
