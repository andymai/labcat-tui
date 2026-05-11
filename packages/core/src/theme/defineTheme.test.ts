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
  bg: '#000',
  surface: '#111',
  fg: '#fff',
  fgMuted: '#ccc',
  fgDim: '#888',
  accent: '#f80',
  accentDim: '#a40',
  border: '#222',
  success: '#0a0',
  error: '#a00',
  warning: '#aa0',
  info: '#08a',
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
