import { fixture, html } from '@open-wc/testing-helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../components/prompt-input.js';
import type { TuiPromptInput } from '../components/prompt-input.js';
import { builtinCommands } from './builtins.js';
import { defineCommands } from './registry.js';
import type { Command, CommandContext } from './types.js';

function fakeCtx(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
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
    ...overrides,
  };
}

function runHandler(cmd: Command, arg: string, ctx: CommandContext): Promise<void> {
  const h = (cmd as { handler?: (a: string, c: CommandContext) => unknown }).handler;
  if (!h) throw new Error(`Expected handler on /${cmd.name}`);
  return Promise.resolve(h(arg, ctx)).then(() => undefined);
}

describe('builtinCommands', () => {
  it('emits only the selected builtins', () => {
    const cmds = builtinCommands({ help: true, date: true });
    expect(cmds.map((c) => c.name).sort()).toEqual(['date', 'help']);
    for (const c of cmds) expect(c.source).toBe('builtin');
  });

  it('omits all when called with no options', () => {
    expect(builtinCommands()).toEqual([]);
  });
});

describe('/help', () => {
  it('writes a grouped command listing', async () => {
    const [help] = builtinCommands({ help: true });
    if (!help) throw new Error('expected help command');
    const written: Node[] = [];
    // Mount a prompt-input so findActiveCommands has something to read.
    const wrap = await fixture<HTMLElement>(html`
      <div><tui-prompt-input></tui-prompt-input></div>
    `);
    const prompt = wrap.querySelector('tui-prompt-input') as TuiPromptInput;
    prompt.commands = defineCommands([
      help,
      { name: 'posts', route: '/posts/', group: 'Navigation', description: 'list posts' },
      { name: 'theme', handler: () => undefined, group: 'System', description: 'toggle' },
    ]);
    const ctx = fakeCtx({ write: (n) => written.push(n as Node) });
    await runHandler(help, '', ctx);
    expect(written).toHaveLength(1);
    const root = written[0] as HTMLElement;
    const titles = [...root.querySelectorAll('.tui-cmd-section-title')].map((t) => t.textContent);
    expect(titles).toEqual(['Navigation', 'System']);
  });

  it('writes a friendly message when no commands are registered', async () => {
    const [help] = builtinCommands({ help: true });
    if (!help) throw new Error('expected help command');
    // No prompt-input → empty list.
    for (const p of document.querySelectorAll('tui-prompt-input')) p.remove();
    const written: (Node | string)[] = [];
    await runHandler(help, '', fakeCtx({ write: (n) => written.push(n) }));
    expect(written[0]).toBe('No commands registered.');
  });
});

describe('/clear', () => {
  it('invokes ctx.clear', async () => {
    const [clear] = builtinCommands({ clear: true });
    if (!clear) throw new Error('expected clear command');
    const clearFn = vi.fn();
    await runHandler(clear, '', fakeCtx({ clear: clearFn }));
    expect(clearFn).toHaveBeenCalledOnce();
  });
});

describe('/config', () => {
  it('emits tui-config-open', async () => {
    const [config] = builtinCommands({ config: true });
    if (!config) throw new Error('expected config command');
    const emit = vi.fn();
    await runHandler(config, '', fakeCtx({ emit }));
    expect(emit).toHaveBeenCalledWith('tui-config-open');
  });
});

describe('/memory', () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });

  it('lists configured keys and their values', async () => {
    const [mem] = builtinCommands({ memory: { keys: ['theme', 'crt'] } });
    if (!mem) throw new Error('expected memory command');
    localStorage.setItem('theme', 'dark');
    const written: Node[] = [];
    await runHandler(mem, '', fakeCtx({ write: (n) => written.push(n as Node) }));
    const root = written[0] as HTMLElement;
    const dts = [...root.querySelectorAll('dt')].map((d) => d.textContent);
    const dds = [...root.querySelectorAll('dd')].map((d) => d.textContent);
    expect(dts).toEqual(['theme', 'crt']);
    expect(dds).toEqual(['dark', '(unset)']);
  });

  it('clear <key> removes a single key', async () => {
    const [mem] = builtinCommands({ memory: { keys: ['theme', 'crt'] } });
    if (!mem) throw new Error('expected memory command');
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('crt', 'on');
    await runHandler(mem, 'clear theme', fakeCtx());
    expect(localStorage.getItem('theme')).toBeNull();
    expect(localStorage.getItem('crt')).toBe('on');
  });

  it('clear (no arg) removes every registered key', async () => {
    const [mem] = builtinCommands({ memory: { keys: ['theme', 'crt'] } });
    if (!mem) throw new Error('expected memory command');
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('crt', 'on');
    await runHandler(mem, 'clear', fakeCtx());
    expect(localStorage.getItem('theme')).toBeNull();
    expect(localStorage.getItem('crt')).toBeNull();
  });

  it('refuses to clear unregistered keys', async () => {
    const [mem] = builtinCommands({ memory: { keys: ['theme'] } });
    if (!mem) throw new Error('expected memory command');
    localStorage.setItem('secret', 'hunter2');
    const written: (Node | string)[] = [];
    await runHandler(mem, 'clear secret', fakeCtx({ write: (n) => written.push(n) }));
    expect(localStorage.getItem('secret')).toBe('hunter2');
    expect(written[0]).toBe('No such pref key: secret');
  });
});

describe('/history', () => {
  it('writes the current history', async () => {
    const [hist] = builtinCommands({ history: true });
    if (!hist) throw new Error('expected history command');
    const written: Node[] = [];
    await runHandler(
      hist,
      '',
      fakeCtx({
        write: (n) => written.push(n as Node),
        history: { all: () => ['a', 'b'], clear: () => undefined },
      }),
    );
    expect((written[0] as HTMLElement).querySelectorAll('dd').length).toBe(2);
  });

  it('clear empties the recall buffer', async () => {
    const [hist] = builtinCommands({ history: true });
    if (!hist) throw new Error('expected history command');
    const clearFn = vi.fn();
    await runHandler(
      hist,
      'clear',
      fakeCtx({
        history: { all: () => [], clear: clearFn },
      }),
    );
    expect(clearFn).toHaveBeenCalledOnce();
  });
});

describe('/alias', () => {
  afterEach(() => {
    for (const p of document.querySelectorAll('tui-prompt-input')) p.remove();
  });

  it('lists every alias mapped to its canonical command', async () => {
    const [alias] = builtinCommands({ alias: true });
    if (!alias) throw new Error('expected alias command');
    const wrap = await fixture<HTMLElement>(html`
      <div><tui-prompt-input></tui-prompt-input></div>
    `);
    const prompt = wrap.querySelector('tui-prompt-input') as TuiPromptInput;
    prompt.commands = defineCommands([
      alias,
      { name: 'posts', aliases: ['ls posts', 'cd posts'], route: '/posts/' },
      { name: 'search', aliases: ['grep'], route: '/search/' },
    ]);
    const written: Node[] = [];
    await runHandler(alias, '', fakeCtx({ write: (n) => written.push(n as Node) }));
    const root = written[0] as HTMLElement;
    const lines = [...root.querySelectorAll('dt')].map((d) => d.textContent);
    expect(lines.sort()).toEqual(['cd posts', 'grep', 'ls posts']);
  });
});

describe('/which', () => {
  afterEach(() => {
    for (const p of document.querySelectorAll('tui-prompt-input')) p.remove();
  });

  it('reports the source of a builtin', async () => {
    const cmds = builtinCommands({ which: true, help: true });
    const which = cmds.find((c) => c.name === 'which');
    if (!which) throw new Error('expected which command');
    const wrap = await fixture<HTMLElement>(html`
      <div><tui-prompt-input></tui-prompt-input></div>
    `);
    const prompt = wrap.querySelector('tui-prompt-input') as TuiPromptInput;
    prompt.commands = defineCommands(cmds);
    const written: (Node | string)[] = [];
    await runHandler(which, 'help', fakeCtx({ write: (n) => written.push(n) }));
    expect(written[0]).toBe('/help — source: builtin');
  });

  it('reports alias resolution', async () => {
    const cmds = builtinCommands({ which: true });
    const which = cmds.find((c) => c.name === 'which');
    if (!which) throw new Error('expected which command');
    const wrap = await fixture<HTMLElement>(html`
      <div><tui-prompt-input></tui-prompt-input></div>
    `);
    const prompt = wrap.querySelector('tui-prompt-input') as TuiPromptInput;
    prompt.commands = defineCommands([
      ...cmds,
      { name: 'search', aliases: ['grep'], route: '/search/' },
    ]);
    const written: (Node | string)[] = [];
    await runHandler(which, 'grep', fakeCtx({ write: (n) => written.push(n) }));
    expect(written[0]).toBe('grep — alias of /search (consumer)');
  });

  it('reports unknown commands gracefully', async () => {
    const cmds = builtinCommands({ which: true });
    const which = cmds.find((c) => c.name === 'which');
    if (!which) throw new Error('expected which command');
    const wrap = await fixture<HTMLElement>(html`
      <div><tui-prompt-input></tui-prompt-input></div>
    `);
    const prompt = wrap.querySelector('tui-prompt-input') as TuiPromptInput;
    prompt.commands = defineCommands(cmds);
    const written: (Node | string)[] = [];
    await runHandler(which, 'nope', fakeCtx({ write: (n) => written.push(n) }));
    expect(written[0]).toBe('Unknown command: nope');
  });
});

describe('/echo', () => {
  it('writes the args back verbatim', async () => {
    const [echo] = builtinCommands({ echo: true });
    if (!echo) throw new Error('expected echo command');
    const written: (Node | string)[] = [];
    await runHandler(echo, 'hello world', fakeCtx({ write: (n) => written.push(n) }));
    expect(written[0]).toBe('hello world');
  });
});

describe('/date', () => {
  it('writes a section with local + iso rows', async () => {
    const [date] = builtinCommands({ date: true });
    if (!date) throw new Error('expected date command');
    const written: Node[] = [];
    await runHandler(date, '', fakeCtx({ write: (n) => written.push(n as Node) }));
    const root = written[0] as HTMLElement;
    const dts = [...root.querySelectorAll('dt')].map((d) => d.textContent);
    expect(dts).toEqual(['local', 'iso']);
  });
});
