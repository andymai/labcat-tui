import { describe, expect, it } from 'vitest';
import { CommandDefinitionError, CommandRegistry, defineCommands } from './registry.js';
import type { Command, CommandContext } from './types.js';

const noopCtx: CommandContext = {
  navigate: () => undefined,
  toggleTheme: () => undefined,
  setTheme: () => undefined,
  emit: () => undefined,
  write: () => undefined,
  clear: () => undefined,
  history: { all: () => [], clear: () => undefined },
  session: {
    register: () => () => undefined,
    read: () => undefined,
    has: () => false,
    keys: () => [],
  },
};

const POSTS: Command = { name: 'posts', aliases: ['ls posts'], route: '/posts/' };
const THEME: Command = {
  name: 'theme',
  description: 'toggle theme',
  handler: (_, ctx) => ctx.toggleTheme(),
};
const COMPLETING: Command = {
  name: 'open',
  route: '/open/',
  completions: () => ['readme', 'spec', 'roadmap'],
};

describe('defineCommands', () => {
  it('accepts a route command', () => {
    const cmds = defineCommands([POSTS]);
    expect(cmds).toHaveLength(1);
  });

  it('accepts a handler command', () => {
    const cmds = defineCommands([THEME]);
    expect(cmds).toHaveLength(1);
  });

  it('rejects a command with both route and handler', () => {
    const both = { name: 'x', route: '/x', handler: () => undefined } as unknown as Command;
    expect(() => defineCommands([both])).toThrow(CommandDefinitionError);
  });

  it('rejects a command with neither route nor handler', () => {
    const neither = { name: 'x' } as unknown as Command;
    expect(() => defineCommands([neither])).toThrow(CommandDefinitionError);
  });

  it('allows later-wins override of a duplicate name', () => {
    const cmds = defineCommands([
      { name: 'x', route: '/x' },
      { name: 'x', route: '/y' },
    ]);
    expect(cmds).toHaveLength(1);
    expect((cmds[0] as { route: string }).route).toBe('/y');
  });

  it("keeps the override's position in the list", () => {
    const cmds = defineCommands([
      { name: 'a', route: '/a' },
      { name: 'b', route: '/b' },
      { name: 'a', route: '/a2' },
    ]);
    expect(cmds.map((c) => c.name)).toEqual(['b', 'a']);
  });

  it('rejects alias conflicts', () => {
    expect(() =>
      defineCommands([
        { name: 'x', route: '/x' },
        { name: 'y', aliases: ['x'], route: '/y' },
      ]),
    ).toThrow(CommandDefinitionError);
  });

  it('rejects an empty name', () => {
    expect(() => defineCommands([{ name: '   ', route: '/x' } as Command])).toThrow(
      CommandDefinitionError,
    );
  });
});

describe('CommandRegistry', () => {
  const reg = new CommandRegistry([POSTS, THEME, COMPLETING]);

  it('matches by exact name', () => {
    expect(reg.match('posts')?.command.name).toBe('posts');
  });

  it('matches slash-prefixed input', () => {
    expect(reg.match('/posts')?.command.name).toBe('posts');
  });

  it('matches case-insensitively', () => {
    expect(reg.match('POSTS')?.command.name).toBe('posts');
  });

  it('matches by alias', () => {
    expect(reg.match('ls posts')?.command.name).toBe('posts');
  });

  it('captures args after the command token', () => {
    const m = reg.match('posts new my-post');
    expect(m?.args).toBe('new my-post');
  });

  it('returns null for unknown commands', () => {
    expect(reg.match('does-not-exist')).toBeNull();
  });

  it('suggests the closest command for typos', () => {
    expect(reg.suggest('postt')).toBe('posts');
  });

  it('returns null when nothing is close enough', () => {
    expect(reg.suggest('zzz-no-match')).toBeNull();
  });

  it('prefix-completes command names when no args have been typed', async () => {
    const completions = await reg.completions('po', noopCtx);
    expect(completions).toContain('posts');
  });

  it('delegates to the matched command completions when args present', async () => {
    const completions = await reg.completions('open ', noopCtx);
    expect(completions).toEqual(['readme', 'spec', 'roadmap']);
  });

  it('list() returns every registered command', () => {
    expect(reg.list().map((c) => c.name)).toEqual(['posts', 'theme', 'open']);
  });
});
