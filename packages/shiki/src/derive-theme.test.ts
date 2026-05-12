import { describe, expect, it } from 'vitest';
import { deriveShikiTheme } from './derive-theme.js';

function withVars(vars: Record<string, string>): HTMLElement {
  const host = document.createElement('div');
  for (const [k, v] of Object.entries(vars)) host.style.setProperty(k, v);
  document.body.appendChild(host);
  return host;
}

describe('deriveShikiTheme', () => {
  it('reads code-scope CSS vars and emits matching tokenColors', () => {
    const host = withVars({
      '--tui-code-keyword': '#ff0000',
      '--tui-code-string': '#00ff00',
      '--tui-code-number': '#0000ff',
      '--tui-code-comment': '#888888',
      '--tui-code-function': '#ff00ff',
      '--tui-code-type': '#ffff00',
      '--tui-surface-2': '#000000',
      '--tui-fg': '#ffffff',
    });
    const theme = deriveShikiTheme(host);
    const colors = new Set(theme.tokenColors.flatMap((t) => [t.settings.foreground]));
    expect(colors.has('#ff0000')).toBe(true);
    expect(colors.has('#00ff00')).toBe(true);
    expect(colors.has('#0000ff')).toBe(true);
    expect(colors.has('#ff00ff')).toBe(true);
    expect(colors.has('#ffff00')).toBe(true);
    expect(theme.bg).toBe('#000000');
    expect(theme.fg).toBe('#ffffff');
    host.remove();
  });

  it('marks dark vs light based on bg luminance', () => {
    const dark = withVars({ '--tui-surface-2': '#101010' });
    const light = withVars({ '--tui-surface-2': '#f5f5f5' });
    expect(deriveShikiTheme(dark).type).toBe('dark');
    expect(deriveShikiTheme(light).type).toBe('light');
    dark.remove();
    light.remove();
  });

  it('falls back to defaults when CSS vars are unset', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const theme = deriveShikiTheme(host);
    expect(theme.fg).toBeTruthy();
    expect(theme.bg).toBeTruthy();
    expect(theme.tokenColors.length).toBeGreaterThan(0);
    host.remove();
  });
});
