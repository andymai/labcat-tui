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
    // The brand accent intentionally stays the same across claude / claudeLight
    // (matches the reference). Assert on bg, which does flip.
    const darkBg = el.style.getPropertyValue('--tui-bg').trim();

    el.theme = 'claudeLight';
    await el.updateComplete;
    const lightBg = el.style.getPropertyValue('--tui-bg').trim();

    expect(lightBg).not.toBe('');
    expect(lightBg).not.toBe(darkBg);
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

  it('clears CSS vars that the previous theme set but the new one omits', async () => {
    // Build the v0.6 required surface from a single base color so the test
    // stays readable. Only the values we assert on are spelled out.
    const c = '#888';
    const base = {
      bg: '#000',
      surface: '#111',
      border: '#333',
      selectionBg: '#235',
      fg: '#fff',
      fgMuted: '#aaa',
      fgDim: '#777',
      accent: '#f0f',
      accentDim: '#a0a',
      accentShimmer: '#fcf',
      systemSpinner: c,
      systemSpinnerShimmer: c,
      promptBorder: c,
      promptBorderShimmer: c,
      inactive: c,
      inactiveShimmer: c,
      modeAutoAccept: c,
      modeBashBorder: c,
      modePermission: c,
      modePermissionShimmer: c,
      modePlanMode: c,
      modeIde: c,
      fastMode: c,
      fastModeShimmer: c,
      success: '#0f0',
      error: '#f00',
      warning: '#ff0',
      warningShimmer: '#ffc',
      info: '#0ff',
      diffAdded: c,
      diffRemoved: c,
      diffAddedDimmed: c,
      diffRemovedDimmed: c,
      diffAddedWord: c,
      diffRemovedWord: c,
      subagentRed: c,
      subagentBlue: c,
      subagentGreen: c,
      subagentYellow: c,
      subagentPurple: c,
      subagentOrange: c,
      subagentPink: c,
      subagentCyan: c,
      chromeYellow: c,
      fontMono: 'monospace',
    };

    const el = await fixture<TuiThemeProvider>(html`<tui-theme-provider></tui-theme-provider>`);
    el.theme = { name: 'fancy', surface2: '#222', ...base };
    await el.updateComplete;
    expect(el.style.getPropertyValue('--tui-surface-2').trim()).toBe('#222');

    el.theme = { name: 'plain', ...base };
    await el.updateComplete;
    expect(el.style.getPropertyValue('--tui-surface-2').trim()).toBe('');
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
