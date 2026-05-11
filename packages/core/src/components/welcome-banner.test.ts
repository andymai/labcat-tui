import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './welcome-banner.js';
import type { TuiWelcomeBanner } from './welcome-banner.js';

describe('<tui-welcome-banner>', () => {
  it('renders the default ✻ glyph', async () => {
    const el = await fixture<TuiWelcomeBanner>(html`<tui-welcome-banner></tui-welcome-banner>`);
    const glyph = el.shadowRoot?.querySelector('[part~="glyph"]');
    expect(glyph?.textContent).toBe('✻');
  });

  it('accepts a custom glyph', async () => {
    const el = await fixture<TuiWelcomeBanner>(
      html`<tui-welcome-banner glyph="◆"></tui-welcome-banner>`,
    );
    const glyph = el.shadowRoot?.querySelector('[part~="glyph"]');
    expect(glyph?.textContent).toBe('◆');
  });

  it('renders the title when set', async () => {
    const el = await fixture<TuiWelcomeBanner>(
      html`<tui-welcome-banner title="welcome to labcat.dev"></tui-welcome-banner>`,
    );
    const title = el.shadowRoot?.querySelector('[part~="title"]');
    expect(title?.textContent).toBe('welcome to labcat.dev');
  });

  it('omits the title element when no title is set', async () => {
    const el = await fixture<TuiWelcomeBanner>(html`<tui-welcome-banner></tui-welcome-banner>`);
    const title = el.shadowRoot?.querySelector('[part~="title"]');
    expect(title).toBeNull();
  });
});
