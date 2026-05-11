import type { ThemeDefinition } from '../theme/index.js';

export interface CommandContext {
  navigate: (url: string) => void;
  toggleTheme: () => void;
  setTheme: (theme: string | ThemeDefinition) => void;
  emit: (event: string, detail?: unknown) => void;
}

export type CommandHandler = (arg: string, ctx: CommandContext) => void | Promise<void>;

export interface BaseCommand {
  name: string;
  aliases?: string[];
  description?: string;
  group?: string;
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
