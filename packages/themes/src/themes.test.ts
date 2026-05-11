import { type ThemeDefinition, validateTheme } from '@labcat/tui';
import { describe, expect, it } from 'vitest';
import { gruvbox, gruvboxLight } from './gruvbox.js';
import { kanagawa, kanagawaLotus } from './kanagawa.js';
import { phosphorAmber, phosphorGreen } from './phosphor.js';
import { rosePine, rosePineDawn } from './rose-pine.js';
import { synthwave } from './synthwave.js';

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

const ALL = [
  ['gruvbox', gruvbox],
  ['gruvboxLight', gruvboxLight],
  ['rosePine', rosePine],
  ['rosePineDawn', rosePineDawn],
  ['kanagawa', kanagawa],
  ['kanagawaLotus', kanagawaLotus],
  ['synthwave', synthwave],
  ['phosphorGreen', phosphorGreen],
  ['phosphorAmber', phosphorAmber],
] as const;

describe.each(ALL)('%s', (label, theme) => {
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

describe('light / dark pairs', () => {
  const pairs = [
    ['gruvbox', gruvbox, gruvboxLight],
    ['rose-pine', rosePine, rosePineDawn],
    ['kanagawa', kanagawa, kanagawaLotus],
  ] as const;

  it.each(pairs)('%s: light bg is lighter than dark bg', (_label, dark, light) => {
    const d = Number.parseInt(dark.bg.slice(1, 3), 16);
    const l = Number.parseInt(light.bg.slice(1, 3), 16);
    expect(l).toBeGreaterThan(d);
  });
});

describe('unique theme names', () => {
  it('no two themes collide on name', () => {
    const names = ALL.map(([, theme]) => theme.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
