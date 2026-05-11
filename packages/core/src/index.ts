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

export { TuiToolCall } from './components/tool-call.js';
export type { ToolCallStatus } from './components/tool-call.js';
export { TuiBox } from './components/box.js';
export type { BoxKind } from './components/box.js';
export { TuiSpinner } from './components/spinner.js';
export type { SpinnerKind } from './components/spinner.js';
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

export type {
  TuiCommandDetail,
  TuiCommandSuccessDetail,
  TuiCommandErrorDetail,
  TuiNavigateDetail,
  TuiThemeChangeDetail,
  TuiSlashSelectDetail,
  TuiTodoChangeDetail,
  TuiEventMap,
} from './events/types.js';
