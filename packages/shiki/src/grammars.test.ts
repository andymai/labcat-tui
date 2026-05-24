import { describe, expect, it } from 'vitest';
import { normalizeLang, SUPPORTED_LANGS } from './grammars.js';

describe('normalizeLang', () => {
  it('passes through canonical names', () => {
    for (const lang of SUPPORTED_LANGS) {
      expect(normalizeLang(lang)).toBe(lang);
    }
  });

  it('maps common aliases to the canonical name', () => {
    expect(normalizeLang('typescript')).toBe('ts');
    expect(normalizeLang('javascript')).toBe('js');
    expect(normalizeLang('shell')).toBe('bash');
    expect(normalizeLang('sh')).toBe('bash');
    expect(normalizeLang('zsh')).toBe('bash');
    expect(normalizeLang('py')).toBe('python');
    expect(normalizeLang('md')).toBe('markdown');
  });

  it('is case-insensitive', () => {
    expect(normalizeLang('TypeScript')).toBe('ts');
    expect(normalizeLang('PYTHON')).toBe('python');
  });

  it('returns null for unknown languages', () => {
    expect(normalizeLang('haskell')).toBeNull();
    expect(normalizeLang('rust')).toBeNull();
    expect(normalizeLang(null)).toBeNull();
    expect(normalizeLang(undefined)).toBeNull();
    expect(normalizeLang('')).toBeNull();
  });
});
