import type { ThemeDefinition } from '../theme/index.js';

export interface SessionStore {
  register<T>(key: string, get: () => T): () => void;
  read<T>(key: string): T | undefined;
  has(key: string): boolean;
  keys(): string[];
}

export interface CommandHistoryAccess {
  all(): string[];
  clear(): void;
}

export interface CommandContext {
  navigate: (url: string) => void;
  toggleTheme: () => void;
  setTheme: (theme: string | ThemeDefinition) => void;
  emit: (event: string, detail?: unknown) => void;

  /**
   * Render content into the active "shell scrollback" — by default, inserts
   * the node as a sibling immediately before the active `<tui-prompt-input>`.
   * Strings are wrapped in a `<div>`. Consumers can override by replacing
   * `prompt-input.onWrite`.
   */
  write: (node: Node | string) => void;

  /**
   * Terminal `clear`: removes scrollback siblings before the active prompt,
   * closes any open `<tui-slash-overlay>`, and refocuses the prompt.
   * Does **not** touch persistent prefs or history (use `/memory` and
   * `ctx.history.clear()` for that).
   */
  clear: () => void;

  history: CommandHistoryAccess;
  session: SessionStore;
}

export type CommandHandler = (arg: string, ctx: CommandContext) => void | Promise<void>;

export type CommandSource = 'builtin' | 'consumer';

export interface BaseCommand {
  name: string;
  aliases?: string[];
  description?: string;
  group?: string;
  source?: CommandSource;
  completions?: (currentArg: string, ctx: CommandContext) => string[] | Promise<string[]>;
}

export type RouteCommand = BaseCommand & { route: string; handler?: never };
export type HandlerCommand = BaseCommand & { handler: CommandHandler; route?: never };
export type Command = RouteCommand | HandlerCommand;

export interface ParsedInput {
  raw: string;
  name: string;
  args: string;
}

export interface MatchResult {
  command: Command;
  matchedAlias: string;
  args: string;
}
