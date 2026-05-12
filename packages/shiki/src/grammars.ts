export const SUPPORTED_LANGS = [
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'bash',
  'python',
  'markdown',
] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const ALIAS: Record<string, SupportedLang> = {
  typescript: 'ts',
  javascript: 'js',
  shell: 'bash',
  sh: 'bash',
  zsh: 'bash',
  py: 'python',
  md: 'markdown',
};

export function normalizeLang(lang: string | null | undefined): SupportedLang | null {
  if (!lang) return null;
  const lower = lang.toLowerCase();
  if ((SUPPORTED_LANGS as readonly string[]).includes(lower)) return lower as SupportedLang;
  return ALIAS[lower] ?? null;
}
