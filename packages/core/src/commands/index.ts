export { type BuiltinOptions, builtinCommands } from './builtins.js';
export { closestMatch, levenshtein } from './levenshtein.js';
export { parseInput } from './parser.js';
export {
  CommandDefinitionError,
  CommandRegistry,
  defineCommands,
  normalizeName,
} from './registry.js';
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
