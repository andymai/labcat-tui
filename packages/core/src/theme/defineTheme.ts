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

const camelToKebab = (key: string): string => key.replace(/([A-Z])/g, '-$1').toLowerCase();

export function defineTheme(theme: ThemeDefinition): ThemeDefinition {
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
