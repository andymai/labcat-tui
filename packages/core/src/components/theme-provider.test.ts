import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it, vi } from 'vitest';
import './theme-provider.js';
import type { TuiThemeProvider } from './theme-provider.js';

describe('<tui-theme-provider>', () => {
  it('applies CSS custom properties from the claude theme by default', async () => {
    const el = await fixture<TuiThemeProvider>(html`<tui-theme-provider></tui-theme-provider>`);
    expect(el.style.getPropertyValue('--tui-bg').trim()).not.toBe('');
    expect(el.style.getPropertyValue('--tui-accent').trim()).not.toBe('');
  });

  it('switches CSS custom properties when the theme attribute changes', async () => {
    const el = await fixture<TuiThemeProvider>(
      html`<tui-theme-provider theme="claude"></tui-theme-provider>`,
    );
    const darkAccent = el.style.getPropertyValue('--tui-accent').trim();

    el.theme = 'claudeLight';
    await el.updateComplete;
    const lightAccent = el.style.getPropertyValue('--tui-accent').trim();

    expect(lightAccent).not.toBe('');
    expect(lightAccent).not.toBe(darkAccent);
  });

  it('falls back to claude (with a warning) when the theme name is unknown', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const el = await fixture<TuiThemeProvider>(
      html`<tui-theme-provider theme="does-not-exist"></tui-theme-provider>`,
    );
    expect(warn).toHaveBeenCalled();
    expect(el.style.getPropertyValue('--tui-bg').trim()).not.toBe('');
    warn.mockRestore();
  });

  it('fires tui-theme-change when the theme changes after mount', async () => {
    const el = await fixture<TuiThemeProvider>(
      html`<tui-theme-provider theme="claude"></tui-theme-provider>`,
    );
    const events: CustomEvent[] = [];
    el.addEventListener('tui-theme-change', (e) => events.push(e as CustomEvent));

    el.theme = 'claudeLight';
    await el.updateComplete;

    expect(events).toHaveLength(1);
    expect(events[0]?.detail).toEqual({ from: 'claude', to: 'claudeLight' });
  });
});
