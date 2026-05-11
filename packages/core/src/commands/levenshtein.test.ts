import { describe, expect, it } from 'vitest';
import { closestMatch, levenshtein } from './levenshtein.js';

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('abc', 'abc')).toBe(0);
  });

  it('returns length when one side is empty', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });

  it('counts a single substitution', () => {
    expect(levenshtein('cat', 'bat')).toBe(1);
  });

  it('counts an adjacent transposition as two edits (delete + insert)', () => {
    expect(levenshtein('ab', 'ba')).toBe(2);
  });

  it('counts an insertion', () => {
    expect(levenshtein('post', 'posts')).toBe(1);
  });
});

describe('closestMatch', () => {
  it('finds the closest candidate within tolerance', () => {
    expect(closestMatch('postt', ['posts', 'help', 'theme'])).toBe('posts');
  });

  it('returns null when no candidate is within tolerance', () => {
    expect(closestMatch('xyz', ['abcdef'])).toBeNull();
  });

  it('returns null for an empty candidate list', () => {
    expect(closestMatch('anything', [])).toBeNull();
  });
});
