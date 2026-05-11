export {
  defineCommands,
  CommandRegistry,
  CommandDefinitionError,
  normalizeName,
} from './registry.js';
export { parseInput } from './parser.js';
export { levenshtein, closestMatch } from './levenshtein.js';
export type {
  BaseCommand,
  Command,
  CommandContext,
  CommandHandler,
  HandlerCommand,
  MatchResult,
  ParsedInput,
  RouteCommand,
} from './types.js';
