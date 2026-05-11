import type { ParsedInput } from './types.js';

const SLASH_PREFIX = /^\/+/;

/**
 * Parse raw input from `<tui-prompt-input>`. The first whitespace-separated
 * token is the command name (with any leading slashes stripped); the rest is
 * the argument string (with its internal whitespace preserved).
 */
export function parseInput(raw: string): ParsedInput {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { raw, name: '', args: '' };

  const firstSpace = trimmed.search(/\s/);
  const head = firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace);
  const rest = firstSpace === -1 ? '' : trimmed.slice(firstSpace).trimStart();
  const name = head.replace(SLASH_PREFIX, '');

  return { raw, name, args: rest };
}
