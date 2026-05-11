export { defineTheme, themeToCssText, themeToCssVars } from './defineTheme.js';
export type { ThemeDefinition } from './defineTheme.js';
export { claude, claudeLight } from './claude.js';

import { claude, claudeLight } from './claude.js';
import type { ThemeDefinition } from './defineTheme.js';

const builtIns: Record<string, ThemeDefinition> = {
  claude,
  claudeLight,
};

export function listBuiltInThemes(): string[] {
  return Object.keys(builtIns);
}

export function getBuiltInTheme(name: string): ThemeDefinition | undefined {
  return builtIns[name];
}
