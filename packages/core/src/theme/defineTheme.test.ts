import { describe, expect, it, vi } from 'vitest';
import {
  InvalidColorError,
  MissingTokenError,
  defineTheme,
  themeToCssVars,
  validateTheme,
} from './defineTheme.js';
import type { ThemeDefinition } from './defineTheme.js';

const valid: ThemeDefinition = {
  name: 'test',

  // Surfaces
  bg: '#000',
  surface: '#111',
  border: '#222',
  selectionBg: '#235',

  // Text
  fg: '#fff',
  fgMuted: '#ccc',
  fgDim: '#888',

  // Brand
  accent: '#f80',
  accentDim: '#a40',
  accentShimmer: '#fa9',

  // System spinner
  systemSpinner: '#39f',
  systemSpinnerShimmer: '#5bf',

  // Prompt border
  promptBorder: '#888',
  promptBorderShimmer: '#aaa',

  // Inactive
  inactive: '#999',
  inactiveShimmer: '#bbb',

  // Mode indicators
  modeAutoAccept: '#a8f',
  modeBashBorder: '#f5b',
  modePermission: '#bbf',
  modePermissionShimmer: '#cdf',
  modePlanMode: '#499',
  modeIde: '#47c',

  // Fast mode
  fastMode: '#f81',
  fastModeShimmer: '#fa5',

  // Semantic
  success: '#0a0',
  error: '#a00',
  warning: '#aa0',
  warningShimmer: '#cc4',
  info: '#08a',

  // Diff
  diffAdded: '#063',
  diffRemoved: '#603',
  diffAddedDimmed: '#475',
  diffRemovedDimmed: '#745',
  diffAddedWord: '#3a6',
  diffRemovedWord: '#a36',

  // Subagent
  subagentRed: '#d22',
  subagentBlue: '#25e',
  subagentGreen: '#1a4',
  subagentYellow: '#ca0',
  subagentPurple: '#93e',
  subagentOrange: '#ea1',
  subagentPink: '#d27',
  subagentCyan: '#09b',

  // Chrome
  chromeYellow: '#fbb',

  fontMono: 'monospace',
};

describe('defineTheme', () => {
  it('returns the theme when all required tokens are valid', () => {
    const result = defineTheme(valid);
    expect(result).toEqual(valid);
  });

  it('throws MissingTokenError when a required token is absent', () => {
    const { fg: _omit, ...rest } = valid;
    expect(() => defineTheme(rest as ThemeDefinition)).toThrow(MissingTokenError);
  });

  it('throws MissingTokenError when fontMono is empty', () => {
    expect(() => defineTheme({ ...valid, fontMono: '   ' })).toThrow(MissingTokenError);
  });

  it('throws InvalidColorError for unparseable color values', () => {
    expect(() => defineTheme({ ...valid, accent: 'not-a-color-value' })).toThrow(InvalidColorError);
  });

  it('lists every missing required token in the error', () => {
    try {
      defineTheme({ name: 'broken' } as ThemeDefinition);
      throw new Error('expected MissingTokenError');
    } catch (err) {
      expect(err).toBeInstanceOf(MissingTokenError);
      const tokens = (err as MissingTokenError).tokens;
      expect(tokens).toContain('bg');
      expect(tokens).toContain('fg');
      expect(tokens).toContain('fontMono');
    }
  });

  it('requires the v0.6 fidelity tokens (shimmer, mode, subagent, diff variants)', () => {
    try {
      const { accentShimmer: _a, modeAutoAccept: _m, subagentRed: _s, ...rest } = valid;
      defineTheme(rest as ThemeDefinition);
      throw new Error('expected MissingTokenError');
    } catch (err) {
      expect(err).toBeInstanceOf(MissingTokenError);
      const tokens = (err as MissingTokenError).tokens;
      expect(tokens).toContain('accentShimmer');
      expect(tokens).toContain('modeAutoAccept');
      expect(tokens).toContain('subagentRed');
    }
  });
});

describe('themeToCssVars', () => {
  it('converts camelCase keys to --tui- kebab-case', () => {
    const vars = themeToCssVars(valid);
    expect(vars['--tui-bg']).toBe('#000');
    expect(vars['--tui-fg-muted']).toBe('#ccc');
    expect(vars['--tui-font-mono']).toBe('monospace');
  });

  it('does not emit a variable for the name field', () => {
    const vars = themeToCssVars(valid);
    expect(vars['--tui-name']).toBeUndefined();
  });

  it('inserts a dash before digits so keys match the components (surface2 → surface-2)', () => {
    const vars = themeToCssVars({ ...valid, surface2: '#333' });
    expect(vars['--tui-surface-2']).toBe('#333');
    expect(vars['--tui-surface2']).toBeUndefined();
  });

  it('emits the new v0.6 token names as kebab-case', () => {
    const vars = themeToCssVars(valid);
    expect(vars['--tui-accent-shimmer']).toBe('#fa9');
    expect(vars['--tui-mode-auto-accept']).toBe('#a8f');
    expect(vars['--tui-mode-bash-border']).toBe('#f5b');
    expect(vars['--tui-system-spinner']).toBe('#39f');
    expect(vars['--tui-diff-added-dimmed']).toBe('#475');
    expect(vars['--tui-subagent-red']).toBe('#d22');
    expect(vars['--tui-chrome-yellow']).toBe('#fbb');
  });
});

describe('validateTheme', () => {
  it('is a no-op when the theme is valid', () => {
    expect(() => validateTheme(valid)).not.toThrow();
  });

  it('throws even when the failure happens at module load (dev mode)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => validateTheme({ ...valid, error: 'definitely not a color' })).toThrow(
      InvalidColorError,
    );
    warn.mockRestore();
  });
});
