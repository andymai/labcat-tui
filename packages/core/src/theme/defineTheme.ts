/// <reference types="vite/client" />

export interface ThemeDefinition {
  name: string;
  bg: string;
  surface: string;
  surface2?: string;
  fg: string;
  fgMuted: string;
  fgDim: string;
  accent: string;
  accentDim: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  fontMono: string;
  leadingTight?: string;
  leadingBody?: string;
  contentMax?: string;
  durFast?: string;
  durBase?: string;
  easing?: string;
}

const REQUIRED_TOKENS = [
  'name',
  'bg',
  'surface',
  'fg',
  'fgMuted',
  'fgDim',
  'accent',
  'accentDim',
  'border',
  'success',
  'error',
  'warning',
  'info',
  'fontMono',
] as const satisfies readonly (keyof ThemeDefinition)[];

const COLOR_TOKENS = [
  'bg',
  'surface',
  'surface2',
  'fg',
  'fgMuted',
  'fgDim',
  'accent',
  'accentDim',
  'border',
  'success',
  'error',
  'warning',
  'info',
] as const satisfies readonly (keyof ThemeDefinition)[];

export class MissingTokenError extends Error {
  constructor(
    public readonly tokens: string[],
    themeName?: string,
  ) {
    super(
      `Theme${themeName ? ` "${themeName}"` : ''} is missing required token(s): ${tokens.join(', ')}`,
    );
    this.name = 'MissingTokenError';
  }
}

export class InvalidColorError extends Error {
  constructor(
    public readonly token: string,
    public readonly value: string,
    themeName?: string,
  ) {
    super(`Theme${themeName ? ` "${themeName}"` : ''} has invalid color for "${token}": ${value}`);
    this.name = 'InvalidColorError';
  }
}

const camelToKebab = (key: string): string => key.replace(/([A-Z])/g, '-$1').toLowerCase();

function isDevMode(): boolean {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.DEV !== false;
    }
  } catch {
    /* not in a bundler env */
  }
  return true;
}

function supportsColor(value: string): boolean {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return true;
  return CSS.supports('color', value);
}

function findMissingTokens(theme: Partial<ThemeDefinition>): string[] {
  return REQUIRED_TOKENS.filter((token) => {
    const v = theme[token];
    return v == null || (typeof v === 'string' && v.trim() === '');
  });
}

function findInvalidColors(theme: ThemeDefinition): Array<{ token: string; value: string }> {
  const issues: Array<{ token: string; value: string }> = [];
  for (const token of COLOR_TOKENS) {
    const value = theme[token];
    if (value == null) continue;
    if (!supportsColor(value)) issues.push({ token, value });
  }
  return issues;
}

export function validateTheme(theme: ThemeDefinition): void {
  const missing = findMissingTokens(theme);
  if (missing.length > 0) throw new MissingTokenError(missing, theme.name);

  const invalid = findInvalidColors(theme);
  if (invalid.length > 0) {
    const first = invalid[0];
    if (first) throw new InvalidColorError(first.token, first.value, theme.name);
  }
}

export function defineTheme(theme: ThemeDefinition): ThemeDefinition {
  if (isDevMode()) {
    validateTheme(theme);
  } else {
    try {
      validateTheme(theme);
    } catch (err) {
      console.warn(
        `[@labcat/tui] Theme${theme?.name ? ` "${theme.name}"` : ''} failed validation; falling back to "claude".`,
        err,
      );
    }
  }
  return theme;
}

export function themeToCssVars(theme: ThemeDefinition): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme)) {
    if (key === 'name' || value == null) continue;
    vars[`--tui-${camelToKebab(key)}`] = String(value);
  }
  return vars;
}

export function themeToCssText(theme: ThemeDefinition, selector = ':root'): string {
  const vars = themeToCssVars(theme);
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}
