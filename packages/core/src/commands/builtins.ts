import type { Command, CommandContext, HandlerCommand } from './types.js';

/**
 * Options for `builtinCommands()`. Each key opts a single builtin in or out.
 * `memory` accepts an object so the consumer can declare which preference
 * keys are user-visible (the builtin only renders those — never the raw
 * `localStorage` contents).
 */
export interface BuiltinOptions {
  help?: boolean;
  clear?: boolean;
  config?: boolean;
  memory?: boolean | { keys: readonly string[] };
  history?: boolean;
  alias?: boolean;
  which?: boolean;
  echo?: boolean;
  date?: boolean;
}

/**
 * Returns a tree-shake-friendly array of selected builtin commands, each
 * tagged with `source: 'builtin'`. Pass through `defineCommands(...)` along
 * with the consumer's own commands; later same-name commands override.
 */
export function builtinCommands(opts: BuiltinOptions = {}): Command[] {
  const out: Command[] = [];
  if (opts.help) out.push(helpCommand());
  if (opts.clear) out.push(clearCommand());
  if (opts.config) out.push(configCommand());
  if (opts.memory) {
    const keys = typeof opts.memory === 'object' ? opts.memory.keys : [];
    out.push(memoryCommand(keys));
  }
  if (opts.history) out.push(historyCommand());
  if (opts.alias) out.push(aliasCommand());
  if (opts.which) out.push(whichCommand());
  if (opts.echo) out.push(echoCommand());
  if (opts.date) out.push(dateCommand());
  return out;
}

function el(
  tag: string,
  attrs: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElement {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const c of children) node.append(c);
  return node;
}

function dl(rows: readonly (readonly [string, string])[]): HTMLElement {
  const list = el('dl', { class: 'tui-cmd-output tui-cmd-dl' });
  for (const [k, v] of rows) {
    list.append(el('dt', {}, [k]));
    list.append(el('dd', {}, [v]));
  }
  return list;
}

function section(title: string, items: readonly (readonly [string, string])[]): HTMLElement {
  const wrap = el('section', { class: 'tui-cmd-output tui-cmd-section' });
  wrap.append(el('h3', { class: 'tui-cmd-section-title' }, [title]));
  wrap.append(dl(items));
  return wrap;
}

function findActiveCommands(ctx: CommandContext): Command[] {
  // No direct accessor — fall back to the active prompt-input.
  const prompt =
    typeof document !== 'undefined'
      ? document.querySelector<HTMLElement & { commands?: Command[] }>('tui-prompt-input')
      : null;
  return prompt?.commands ?? (ctx as { commands?: Command[] }).commands ?? [];
}

function helpCommand(): HandlerCommand {
  return {
    name: 'help',
    aliases: ['?'],
    description: 'show the command palette',
    group: 'System',
    source: 'builtin',
    handler: (_, ctx) => {
      const all = findActiveCommands(ctx);
      if (all.length === 0) {
        ctx.write('No commands registered.');
        return;
      }
      const groups = new Map<string, Command[]>();
      for (const cmd of all) {
        const g = cmd.group ?? 'Other';
        const arr = groups.get(g) ?? [];
        arr.push(cmd);
        groups.set(g, arr);
      }
      const root = el('div', { class: 'tui-cmd-output tui-cmd-help' });
      const groupOrder = ['Navigation', 'System', 'Posts', 'Utility', 'Other'];
      const ordered = [...groups.keys()].sort((a, b) => {
        const ai = groupOrder.indexOf(a);
        const bi = groupOrder.indexOf(b);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
      for (const key of ordered) {
        const rows = (groups.get(key) ?? []).map(
          (c) => [`/${c.name}`, c.description ?? ''] as const,
        );
        root.append(section(key, rows));
      }
      ctx.write(root);
    },
  };
}

function clearCommand(): HandlerCommand {
  return {
    name: 'clear',
    description: 'clear the terminal scrollback',
    group: 'System',
    source: 'builtin',
    handler: (_, ctx) => ctx.clear(),
  };
}

function configCommand(): HandlerCommand {
  return {
    name: 'config',
    description: 'open settings',
    group: 'System',
    source: 'builtin',
    handler: (_, ctx) => ctx.emit('tui-config-open'),
  };
}

function memoryCommand(keys: readonly string[]): HandlerCommand {
  return {
    name: 'memory',
    aliases: ['mem'],
    description: 'show persisted preferences',
    group: 'System',
    source: 'builtin',
    completions: (currentArg) => {
      const candidates = ['list', 'clear'];
      return candidates.filter((c) => c.startsWith(currentArg.trim()));
    },
    handler: (arg, ctx) => {
      const trimmed = arg.trim();
      const [verb, target] = trimmed.split(/\s+/, 2);
      if (verb === 'clear') {
        const wipe = (k: string): void => {
          try {
            localStorage.removeItem(k);
          } catch {
            /* private mode */
          }
        };
        if (target) {
          if (!keys.includes(target)) {
            ctx.write(`No such pref key: ${target}`);
            return;
          }
          wipe(target);
          ctx.write(`Cleared ${target}.`);
        } else {
          for (const k of keys) wipe(k);
          ctx.write('Cleared all prefs.');
        }
        return;
      }
      const rows = keys.map((k) => {
        let val: string | null = null;
        try {
          val = localStorage.getItem(k);
        } catch {
          /* ignore */
        }
        return [k, val ?? '(unset)'] as const;
      });
      if (rows.length === 0) {
        ctx.write('No pref keys registered.');
        return;
      }
      ctx.write(section('Memory', rows));
    },
  };
}

function historyCommand(): HandlerCommand {
  return {
    name: 'history',
    aliases: ['hist'],
    description: 'recent commands',
    group: 'Utility',
    source: 'builtin',
    completions: (currentArg) => ['clear'].filter((c) => c.startsWith(currentArg.trim())),
    handler: (arg, ctx) => {
      if (arg.trim() === 'clear') {
        ctx.history.clear();
        ctx.write('History cleared.');
        return;
      }
      const all = ctx.history.all();
      if (all.length === 0) {
        ctx.write('No history yet.');
        return;
      }
      const rows = all.map((cmd, i) => [String(i + 1), cmd] as const);
      ctx.write(section('History', rows));
    },
  };
}

function aliasCommand(): HandlerCommand {
  return {
    name: 'alias',
    description: 'list command aliases',
    group: 'Utility',
    source: 'builtin',
    handler: (_, ctx) => {
      const all = findActiveCommands(ctx);
      const rows: (readonly [string, string])[] = [];
      for (const cmd of all) {
        for (const a of cmd.aliases ?? []) rows.push([a, `→ /${cmd.name}`] as const);
      }
      if (rows.length === 0) {
        ctx.write('No aliases registered.');
        return;
      }
      ctx.write(section('Aliases', rows));
    },
  };
}

function whichCommand(): HandlerCommand {
  return {
    name: 'which',
    description: 'where a command is defined',
    group: 'Utility',
    source: 'builtin',
    completions: (currentArg, ctx) => {
      const term = currentArg.trim().replace(/^\/+/, '').toLowerCase();
      return findActiveCommands(ctx)
        .map((c) => c.name)
        .filter((n) => n.startsWith(term));
    },
    handler: (arg, ctx) => {
      const target = arg.trim().replace(/^\/+/, '').toLowerCase();
      if (!target) {
        ctx.write('Usage: /which <command>');
        return;
      }
      const all = findActiveCommands(ctx);
      const direct = all.find((c) => c.name.toLowerCase() === target);
      if (direct) {
        ctx.write(`/${direct.name} — source: ${direct.source ?? 'consumer'}`);
        return;
      }
      const viaAlias = all.find((c) => (c.aliases ?? []).some((a) => a.toLowerCase() === target));
      if (viaAlias) {
        ctx.write(`${target} — alias of /${viaAlias.name} (${viaAlias.source ?? 'consumer'})`);
        return;
      }
      ctx.write(`Unknown command: ${target}`);
    },
  };
}

function echoCommand(): HandlerCommand {
  return {
    name: 'echo',
    description: 'print args back',
    group: 'Utility',
    source: 'builtin',
    handler: (arg, ctx) => ctx.write(arg),
  };
}

function dateCommand(): HandlerCommand {
  return {
    name: 'date',
    description: 'current time',
    group: 'Utility',
    source: 'builtin',
    handler: (_, ctx) => {
      const now = new Date();
      ctx.write(
        section('Date', [
          ['local', now.toString()],
          ['iso', now.toISOString()],
        ]),
      );
    },
  };
}
