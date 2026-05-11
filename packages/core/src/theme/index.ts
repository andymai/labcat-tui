export {
  defineTheme,
  themeToCssText,
  themeToCssVars,
  validateTheme,
  MissingTokenError,
  InvalidColorError,
} from './defineTheme.js';
export type { ThemeDefinition } from './defineTheme.js';
export { claude, claudeLight } from './claude.js';
export { claudeAnsi } from './claude-ansi.js';

import { claudeAnsi } from './claude-ansi.js';
import { claude, claudeLight } from './claude.js';
import type { ThemeDefinition } from './defineTheme.js';

const builtIns: Record<string, ThemeDefinition> = {
  claude,
  claudeLight,
  claudeAnsi,
};

export function listBuiltInThemes(): string[] {
  return Object.keys(builtIns);
}

export function getBuiltInTheme(name: string): ThemeDefinition | undefined {
  return builtIns[name];
}

export function resolveTheme(theme: string | ThemeDefinition): ThemeDefinition {
  if (typeof theme !== 'string') return theme;
  const found = builtIns[theme];
  if (found) return found;
  if (typeof console !== 'undefined') {
    console.warn(
      `[@labcat/tui] Unknown built-in theme "${theme}". Falling back to "claude". Available: ${Object.keys(builtIns).join(', ')}.`,
    );
  }
  return claude;
}
