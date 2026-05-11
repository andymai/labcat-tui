import { describe, expect, it } from 'vitest';
import { parseInput } from './parser.js';

describe('parseInput', () => {
  it('returns empty name + args for whitespace input', () => {
    expect(parseInput('   ')).toEqual({ raw: '   ', name: '', args: '' });
  });

  it('splits at the first whitespace', () => {
    const parsed = parseInput('posts new my-post');
    expect(parsed.name).toBe('posts');
    expect(parsed.args).toBe('new my-post');
  });

  it('strips leading slash(es) from the command name', () => {
    expect(parseInput('/theme dark').name).toBe('theme');
    expect(parseInput('//theme dark').name).toBe('theme');
  });

  it('preserves internal whitespace in args', () => {
    expect(parseInput('cmd  a   b').args).toBe('a   b');
  });

  it('returns just a name when there are no args', () => {
    expect(parseInput('/help')).toEqual({ raw: '/help', name: 'help', args: '' });
  });
});
