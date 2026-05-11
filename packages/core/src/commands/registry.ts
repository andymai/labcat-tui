import { closestMatch } from './levenshtein.js';
import { parseInput } from './parser.js';
import type { Command, MatchResult } from './types.js';

const SLASH_PREFIX = /^\/+/;
const WHITESPACE = /\s+/;

export class CommandDefinitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommandDefinitionError';
  }
}

/**
 * Runtime XOR validation: a Command must have exactly one of `route` or
 * `handler`. TypeScript already enforces this at compile time, but raw
 * JS callers (or `as any` escape hatches) can violate the invariant —
 * this catches that.
 */
export function defineCommands(commands: readonly Command[]): Command[] {
  const seen = new Set<string>();
  for (const cmd of commands) {
    const hasRoute = typeof (cmd as { route?: unknown }).route === 'string';
    const hasHandler = typeof (cmd as { handler?: unknown }).handler === 'function';
    if (hasRoute === hasHandler) {
      throw new CommandDefinitionError(
        `Command "${cmd.name}" must have exactly one of \`route\` or \`handler\`.`,
      );
    }
    if (!cmd.name || cmd.name.trim().length === 0) {
      throw new CommandDefinitionError('Every command requires a non-empty `name`.');
    }
    const normalized = normalizeName(cmd.name);
    if (seen.has(normalized)) {
      throw new CommandDefinitionError(`Duplicate command name "${cmd.name}".`);
    }
    seen.add(normalized);
    for (const alias of cmd.aliases ?? []) {
      const a = normalizeName(alias);
      if (seen.has(a)) {
        throw new CommandDefinitionError(
          `Alias "${alias}" on "${cmd.name}" conflicts with another command name or alias.`,
        );
      }
      seen.add(a);
    }
  }
  return Array.from(commands);
}

export function normalizeName(name: string): string {
  return name.replace(SLASH_PREFIX, '').trim().toLowerCase();
}

function tokenize(s: string): string[] {
  return s.trim().split(WHITESPACE).filter(Boolean);
}

/**
 * Slice `args` off the original input after `take` leading tokens, preserving
 * any internal whitespace between the remaining tokens.
 */
function sliceArgs(stripped: string, take: number): string {
  let i = 0;
  // skip leading whitespace
  while (i < stripped.length && /\s/.test(stripped[i] ?? '')) i++;
  let tokensConsumed = 0;
  while (i < stripped.length && tokensConsumed < take) {
    // consume one token (non-whitespace run)
    while (i < stripped.length && !/\s/.test(stripped[i] ?? '')) i++;
    tokensConsumed++;
    if (tokensConsumed < take) {
      // consume one whitespace run
      while (i < stripped.length && /\s/.test(stripped[i] ?? '')) i++;
    }
  }
  // trim the single separator after the last consumed token
  return stripped.slice(i).trimStart();
}

export class CommandRegistry {
  private readonly byKey: Map<string, Command> = new Map();
  private readonly aliasToKey: Map<string, string> = new Map();
  private readonly insertionOrder: Command[] = [];
  private readonly maxTriggerTokens: number;

  constructor(commands: readonly Command[]) {
    let max = 1;
    for (const cmd of commands) {
      const key = normalizeName(cmd.name);
      this.byKey.set(key, cmd);
      this.insertionOrder.push(cmd);
      max = Math.max(max, tokenize(key).length);
      for (const alias of cmd.aliases ?? []) {
        const a = normalizeName(alias);
        this.aliasToKey.set(a, key);
        max = Math.max(max, tokenize(a).length);
      }
    }
    this.maxTriggerTokens = max;
  }

  /**
   * Resolve a raw input string to a matched command + args. Tries
   * decreasing-length leading-token prefixes so multi-word aliases like
   * `aliases: ['ls posts']` match `"ls posts new my-post"`.
   */
  match(input: string): MatchResult | null {
    const stripped = input.trimStart().replace(SLASH_PREFIX, '');
    if (stripped.trim().length === 0) return null;
    const tokens = tokenize(stripped);
    const limit = Math.min(tokens.length, this.maxTriggerTokens);

    for (let take = limit; take >= 1; take--) {
      const candidate = tokens.slice(0, take).join(' ').toLowerCase();
      const direct = this.byKey.get(candidate);
      const viaAlias = this.aliasToKey.get(candidate);
      const target = direct ?? (viaAlias ? this.byKey.get(viaAlias) : undefined);
      if (!target) continue;
      const args = sliceArgs(stripped, take);
      return { command: target, matchedAlias: candidate, args };
    }
    return null;
  }

  /** Suggest the closest command name when input doesn't match anything. */
  suggest(input: string): string | null {
    const parsed = parseInput(input);
    if (!parsed.name) return null;
    const normalized = normalizeName(parsed.name);
    const candidates = [...this.byKey.keys(), ...this.aliasToKey.keys()];
    return closestMatch(normalized, candidates);
  }

  /**
   * Prefix-match completion candidates for tab completion.
   * If no args have been typed yet, suggests command names + aliases.
   * Otherwise delegates to the matched command's `completions?` callback.
   */
  async completions(
    input: string,
    ctx: Parameters<NonNullable<Command['completions']>>[1],
  ): Promise<string[]> {
    const parsed = parseInput(input);
    if (parsed.args === '' && !/\s$/.test(input)) {
      const prefix = normalizeName(parsed.name);
      const all = [...this.byKey.keys(), ...this.aliasToKey.keys()];
      return all.filter((n) => n.startsWith(prefix)).sort();
    }
    const matched = this.match(input);
    if (!matched?.command.completions) return [];
    const result = await matched.command.completions(parsed.args, ctx);
    return Array.isArray(result) ? result : [];
  }

  /** Every registered command (in insertion order). */
  list(): Command[] {
    return Array.from(this.insertionOrder);
  }
}
