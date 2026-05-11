import './styles/index.css';
import './components/tool-call.js';
import './components/box.js';
import './components/spinner.js';
import './components/prompt-line.js';
import './components/theme-provider.js';

export { TuiToolCall } from './components/tool-call.js';
export type { ToolCallStatus } from './components/tool-call.js';
export { TuiBox } from './components/box.js';
export type { BoxKind } from './components/box.js';
export { TuiSpinner } from './components/spinner.js';
export type { SpinnerKind } from './components/spinner.js';
export { TuiPromptLine } from './components/prompt-line.js';
export { TuiThemeProvider } from './components/theme-provider.js';

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
