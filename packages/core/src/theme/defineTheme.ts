import { isDev } from '../util/env.js';

export interface ThemeDefinition {
  name: string;

  // Surfaces
  bg: string;
  surface: string;
  surface2?: string;
  border: string;
  selectionBg: string;

  // Text
  fg: string;
  fgMuted: string;
  fgDim: string;

  // Brand
  accent: string;
  accentDim: string;
  accentShimmer: string;

  // System spinner (Claude's distinctive blue throbber)
  systemSpinner: string;
  systemSpinnerShimmer: string;

  // Prompt border (default state)
  promptBorder: string;
  promptBorderShimmer: string;

  // Inactive / waiting indicators
  inactive: string;
  inactiveShimmer: string;

  // Mode indicators (drawn around the prompt while in a specific mode)
  modeAutoAccept: string;
  modeBashBorder: string;
  modePermission: string;
  modePermissionShimmer: string;
  modePlanMode: string;
  modeIde: string;

  // Fast mode (Claude Code's lightning ↯)
  fastMode: string;
  fastModeShimmer: string;

  // Semantic
  success: string;
  error: string;
  warning: string;
  warningShimmer: string;
  info: string;

  // Diff. The bright `diffAdded` / `diffRemoved` are optional escape hatches
  // for consumer overrides — the library renders rows with the dimmed
  // background + word color.
  diffAdded?: string;
  diffRemoved?: string;
  diffAddedDimmed: string;
  diffRemovedDimmed: string;
  diffAddedWord: string;
  diffRemovedWord: string;

  // Subagent persona palette (NATO phonetic callsigns — the names are
  // intentionally not color-bound so themes can map them freely without
  // misleading consumers).
  subagentAlpha: string;
  subagentBravo: string;
  subagentCharlie: string;
  subagentDelta: string;
  subagentEcho: string;
  subagentFoxtrot: string;
  subagentGolf: string;
  subagentHotel: string;

  // Chrome integration badges (optional — only consumed by chrome-specific
  // surfaces that the library doesn't ship).
  chromeYellow?: string;

  // Code highlighting (TextMate-style scopes for syntax-highlighted blocks;
  // consumed by `@labcat/tui-shiki` to derive a per-theme Shiki theme at
  // runtime so highlighted code tracks the active palette).
  codeKeyword: string;
  codeString: string;
  codeNumber: string;
  codeComment: string;
  codeFunction: string;
  codeType: string;

  // Typography + motion (optional — sensible defaults via tokens.css)
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
  // Surfaces
  'bg',
  'surface',
  'border',
  'selectionBg',
  // Text
  'fg',
  'fgMuted',
  'fgDim',
  // Brand
  'accent',
  'accentDim',
  'accentShimmer',
  // System spinner
  'systemSpinner',
  'systemSpinnerShimmer',
  // Prompt border
  'promptBorder',
  'promptBorderShimmer',
  // Inactive
  'inactive',
  'inactiveShimmer',
  // Mode indicators
  'modeAutoAccept',
  'modeBashBorder',
  'modePermission',
  'modePermissionShimmer',
  'modePlanMode',
  'modeIde',
  // Fast mode
  'fastMode',
  'fastModeShimmer',
  // Semantic
  'success',
  'error',
  'warning',
  'warningShimmer',
  'info',
  // Diff (bright variants are optional)
  'diffAddedDimmed',
  'diffRemovedDimmed',
  'diffAddedWord',
  'diffRemovedWord',
  // Subagent (NATO phonetic)
  'subagentAlpha',
  'subagentBravo',
  'subagentCharlie',
  'subagentDelta',
  'subagentEcho',
  'subagentFoxtrot',
  'subagentGolf',
  'subagentHotel',
  // Code highlighting
  'codeKeyword',
  'codeString',
  'codeNumber',
  'codeComment',
  'codeFunction',
  'codeType',
  // Typography
  'fontMono',
] as const satisfies readonly (keyof ThemeDefinition)[];

const COLOR_TOKENS = [
  'bg',
  'surface',
  'surface2',
  'border',
  'selectionBg',
  'fg',
  'fgMuted',
  'fgDim',
  'accent',
  'accentDim',
  'accentShimmer',
  'systemSpinner',
  'systemSpinnerShimmer',
  'promptBorder',
  'promptBorderShimmer',
  'inactive',
  'inactiveShimmer',
  'modeAutoAccept',
  'modeBashBorder',
  'modePermission',
  'modePermissionShimmer',
  'modePlanMode',
  'modeIde',
  'fastMode',
  'fastModeShimmer',
  'success',
  'error',
  'warning',
  'warningShimmer',
  'info',
  'diffAdded',
  'diffRemoved',
  'diffAddedDimmed',
  'diffRemovedDimmed',
  'diffAddedWord',
  'diffRemovedWord',
  'subagentAlpha',
  'subagentBravo',
  'subagentCharlie',
  'subagentDelta',
  'subagentEcho',
  'subagentFoxtrot',
  'subagentGolf',
  'subagentHotel',
  'chromeYellow',
  'codeKeyword',
  'codeString',
  'codeNumber',
  'codeComment',
  'codeFunction',
  'codeType',
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
  /** All invalid colors in this theme. `token`/`value` mirror the first entry
   *  for back-compat; consumers wanting full coverage iterate `issues`. */
  public readonly issues: ReadonlyArray<{ token: string; value: string }>;
  public readonly token: string;
  public readonly value: string;

  constructor(
    issues: ReadonlyArray<{ token: string; value: string }> | { token: string; value: string },
    themeName?: string,
  ) {
    const all = Array.isArray(issues) ? issues : [issues];
    const first = all[0] ?? { token: '?', value: '?' };
    const list = all.map((i) => `"${i.token}": ${i.value}`).join(', ');
    super(`Theme${themeName ? ` "${themeName}"` : ''} has invalid color(s): ${list}`);
    this.name = 'InvalidColorError';
    this.issues = all;
    this.token = first.token;
    this.value = first.value;
  }
}

// Insert a dash before digits and uppercase boundaries: surface2 → surface-2,
// accentDim → accent-dim. The components in this library all read CSS vars
// using the dashed form (e.g. var(--tui-surface-2)), so the kebab-case mapping
// must keep them in lockstep.
const camelToKebab = (key: string): string =>
  key
    .replace(/([a-z])(\d)/g, '$1-$2')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase();

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
  if (invalid.length > 0) throw new InvalidColorError(invalid, theme.name);
}

export function defineTheme(theme: ThemeDefinition): ThemeDefinition {
  if (isDev()) {
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
