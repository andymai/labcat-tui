export {
  defineCommands,
  CommandRegistry,
  CommandDefinitionError,
  normalizeName,
} from './registry.js';
export { parseInput } from './parser.js';
export { levenshtein, closestMatch } from './levenshtein.js';
export { builtinCommands, type BuiltinOptions } from './builtins.js';
export type {
  BaseCommand,
  Command,
  CommandContext,
  CommandHandler,
  CommandHistoryAccess,
  CommandSource,
  HandlerCommand,
  MatchResult,
  ParsedInput,
  RouteCommand,
  SessionStore,
} from './types.js';
