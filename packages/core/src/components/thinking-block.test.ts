import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './thinking-block.js';
import type { TuiThinkingBlock } from './thinking-block.js';

describe('<tui-thinking-block>', () => {
  it('defaults to closed', async () => {
    const el = await fixture<TuiThinkingBlock>(html`<tui-thinking-block></tui-thinking-block>`);
    expect(el.open).toBe(false);
    const details = el.shadowRoot?.querySelector('details');
    expect(details?.open).toBe(false);
  });

  it('renders the default label "Thinking…"', async () => {
    const el = await fixture<TuiThinkingBlock>(html`<tui-thinking-block></tui-thinking-block>`);
    const summary = el.shadowRoot?.querySelector('[part~="summary"]');
    expect(summary?.textContent?.trim()).toBe('Thinking…');
  });

  it('accepts a custom label', async () => {
    const el = await fixture<TuiThinkingBlock>(
      html`<tui-thinking-block label="reasoning"></tui-thinking-block>`,
    );
    const summary = el.shadowRoot?.querySelector('[part~="summary"]');
    expect(summary?.textContent?.trim()).toBe('reasoning');
  });

  it('reflects open after the details element toggles', async () => {
    const el = await fixture<TuiThinkingBlock>(html`<tui-thinking-block></tui-thinking-block>`);
    const details = el.shadowRoot?.querySelector('details');
    if (!details) throw new Error('expected details');
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  it('opens when the open attribute is set', async () => {
    const el = await fixture<TuiThinkingBlock>(
      html`<tui-thinking-block open></tui-thinking-block>`,
    );
    const details = el.shadowRoot?.querySelector('details');
    expect(details?.open).toBe(true);
  });
});
