import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './spinner.js';
import type { TuiSpinner } from './spinner.js';

describe('<tui-spinner>', () => {
  it('renders a glyph in the default "dots" kind', async () => {
    const el = await fixture<TuiSpinner>(html`<tui-spinner></tui-spinner>`);
    const glyph = el.shadowRoot?.querySelector<HTMLElement>('[part~="glyph"]');
    expect(glyph?.textContent?.length).toBeGreaterThan(0);
  });

  it('sets role="status" by default for screen readers', async () => {
    const el = await fixture<TuiSpinner>(html`<tui-spinner></tui-spinner>`);
    expect(el.getAttribute('role')).toBe('status');
  });

  it('uses the default aria-label "Loading" when none is provided', async () => {
    const el = await fixture<TuiSpinner>(html`<tui-spinner></tui-spinner>`);
    expect(el.getAttribute('aria-label')).toBe('Loading');
  });

  it('does not override a consumer-supplied aria-label', async () => {
    const el = await fixture<TuiSpinner>(html`<tui-spinner aria-label="thinking"></tui-spinner>`);
    expect(el.getAttribute('aria-label')).toBe('thinking');
  });

  it('reflects kind as an attribute for CSS hooks', async () => {
    const el = await fixture<TuiSpinner>(html`<tui-spinner kind="line"></tui-spinner>`);
    expect(el.getAttribute('kind')).toBe('line');
  });

  it('defaults to tone="accent"', async () => {
    const el = await fixture<TuiSpinner>(html`<tui-spinner></tui-spinner>`);
    expect(el.tone).toBe('accent');
  });

  it('reflects tone="system" so CSS resolves to the systemSpinner palette', async () => {
    const el = await fixture<TuiSpinner>(html`<tui-spinner tone="system"></tui-spinner>`);
    expect(el.getAttribute('tone')).toBe('system');
  });
});
