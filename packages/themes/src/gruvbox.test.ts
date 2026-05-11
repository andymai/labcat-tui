import { type ThemeDefinition, validateTheme } from '@labcat/tui';
import { describe, expect, it } from 'vitest';
import { gruvbox, gruvboxLight } from './gruvbox.js';

const REQUIRED: Array<keyof ThemeDefinition> = [
  'name',
  'bg',
  'surface',
  'fg',
  'fgMuted',
  'fgDim',
  'accent',
  'accentDim',
  'border',
  'success',
  'error',
  'warning',
  'info',
  'fontMono',
];

describe.each([
  ['gruvbox', gruvbox],
  ['gruvboxLight', gruvboxLight],
] as const)('%s', (label, theme) => {
  it('passes validateTheme', () => {
    expect(() => validateTheme(theme)).not.toThrow();
  });

  it('has every required token', () => {
    for (const token of REQUIRED) {
      expect(theme[token], `missing ${token}`).toBeTruthy();
    }
  });

  it('uses the documented name', () => {
    expect(theme.name).toBe(label);
  });
});

describe('gruvbox pair', () => {
  it('the light theme is genuinely lighter than the dark one', () => {
    // Quick sanity check: bg lightness ordering.
    // gruvbox.bg = #282828 (dark), gruvboxLight.bg = #fbf1c7 (light)
    const dark = Number.parseInt(gruvbox.bg.slice(1, 3), 16);
    const light = Number.parseInt(gruvboxLight.bg.slice(1, 3), 16);
    expect(light).toBeGreaterThan(dark);
  });
});
