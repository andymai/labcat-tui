import './styles/index.css';
import './components/tool-call.js';
import './components/box.js';
import './components/spinner.js';
import './components/prompt-line.js';
import './components/theme-provider.js';
import './components/welcome-banner.js';
import './components/thinking-block.js';
import './components/status-line.js';
import './components/todo-list.js';
import './components/todo-item.js';
import './components/streamed-text.js';
import './components/prompt-input.js';
import './components/chat-bubble.js';
import './components/diff-block.js';
import './components/tool-use-timeline.js';
import './components/md.js';
import './components/slash-overlay.js';
import './components/session.js';
import './components/agent-badge.js';
import './components/shimmer-text.js';
import './components/question.js';

export { TuiToolCall } from './components/tool-call.js';
export type { ToolCallStatus } from './components/tool-call.js';
export { TuiBox } from './components/box.js';
export type { BoxKind } from './components/box.js';
export { TuiSpinner } from './components/spinner.js';
export type { SpinnerKind, SpinnerTone } from './components/spinner.js';
export { TuiPromptLine } from './components/prompt-line.js';
export { TuiThemeProvider } from './components/theme-provider.js';
export { TuiWelcomeBanner } from './components/welcome-banner.js';
export { TuiThinkingBlock } from './components/thinking-block.js';
export { TuiStatusLine } from './components/status-line.js';
export type { StatusLineKind, StatusLiveness, StatusSegment } from './components/status-line.js';
export { TuiTodoList } from './components/todo-list.js';
export type { TodoListKind } from './components/todo-list.js';
export { TuiTodoItem } from './components/todo-item.js';
export type { TodoStatus } from './components/todo-item.js';
export { TuiStreamedText } from './components/streamed-text.js';
export { TuiPromptInput } from './components/prompt-input.js';
export { TuiChatBubble } from './components/chat-bubble.js';
export type { ChatRole } from './components/chat-bubble.js';
export { TuiDiffBlock } from './components/diff-block.js';
export type { DiffLine, DiffLineKind } from './components/diff-block.js';
export { TuiToolUseTimeline } from './components/tool-use-timeline.js';
export { TuiMd } from './components/md.js';
export { TuiSlashOverlay } from './components/slash-overlay.js';
export { TuiSession } from './components/session.js';
export type { SessionMode } from './components/session.js';
export type { PromptMode } from './components/prompt-input.js';
export { TuiAgentBadge } from './components/agent-badge.js';
export type { AgentCallsign } from './components/agent-badge.js';
export { TuiShimmerText } from './components/shimmer-text.js';
export type { ShimmerKind } from './components/shimmer-text.js';
export { TuiQuestion } from './components/question.js';
export type { TuiQuestionOption } from './components/question.js';

export {
  defineTheme,
  validateTheme,
  themeToCssText,
  themeToCssVars,
  resolveTheme,
  claude,
  claudeLight,
  listBuiltInThemes,
  getBuiltInTheme,
  MissingTokenError,
  InvalidColorError,
} from './theme/index.js';
export type { ThemeDefinition } from './theme/index.js';

export {
  defineCommands,
  CommandRegistry,
  CommandDefinitionError,
  normalizeName,
  parseInput,
  levenshtein,
  closestMatch,
  builtinCommands,
} from './commands/index.js';
export type {
  BaseCommand,
  BuiltinOptions,
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
} from './commands/index.js';

export type {
  TuiCommandDetail,
  TuiCommandSuccessDetail,
  TuiCommandErrorDetail,
  TuiNavigateDetail,
  TuiThemeChangeDetail,
  TuiSlashSelectDetail,
  TuiTodoChangeDetail,
  TuiQuestionSelectDetail,
  TuiEventMap,
} from './events/types.js';
