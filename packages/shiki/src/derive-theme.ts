const SCOPE_TOKENS = {
  keyword: 'codeKeyword',
  string: 'codeString',
  number: 'codeNumber',
  comment: 'codeComment',
  function: 'codeFunction',
  type: 'codeType',
} as const;

type ScopeKey = keyof typeof SCOPE_TOKENS;

const CSS_VAR = {
  keyword: '--tui-code-keyword',
  string: '--tui-code-string',
  number: '--tui-code-number',
  comment: '--tui-code-comment',
  function: '--tui-code-function',
  type: '--tui-code-type',
  fg: '--tui-fg',
  fgDim: '--tui-fg-dim',
  bg: '--tui-surface-2',
} as const;

export interface DerivedShikiTheme {
  name: string;
  type: 'dark' | 'light';
  bg: string;
  fg: string;
  colors: Record<string, string>;
  tokenColors: Array<{
    scope: string | string[];
    settings: { foreground?: string; fontStyle?: string };
  }>;
}

function getVar(host: Element, name: string, fallback: string): string {
  const v = getComputedStyle(host).getPropertyValue(name).trim();
  return v || fallback;
}

function isDarkBg(bg: string): boolean {
  const hex = bg.startsWith('#') ? bg.slice(1) : bg;
  if (hex.length < 3) return true;
  const expand =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex.slice(0, 6);
  const r = Number.parseInt(expand.slice(0, 2), 16);
  const g = Number.parseInt(expand.slice(2, 4), 16);
  const b = Number.parseInt(expand.slice(4, 6), 16);
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luma < 0.5;
}

/**
 * Build a Shiki theme JSON by reading the @labcat/tui code-scope CSS variables
 * resolved against the given host element. The returned theme uses literal hex
 * values resolved *at call time* — re-derive whenever the active palette
 * changes so highlights track theme swaps.
 */
export function deriveShikiTheme(host: Element): DerivedShikiTheme {
  const colors: Record<ScopeKey | 'fg' | 'fgDim' | 'bg', string> = {
    keyword: getVar(host, CSS_VAR.keyword, '#c592ff'),
    string: getVar(host, CSS_VAR.string, '#7ec699'),
    number: getVar(host, CSS_VAR.number, '#eb9f7f'),
    comment: getVar(host, CSS_VAR.comment, '#8a8070'),
    function: getVar(host, CSS_VAR.function, '#93a5ff'),
    type: getVar(host, CSS_VAR.type, '#ffdf85'),
    fg: getVar(host, CSS_VAR.fg, '#ffffff'),
    fgDim: getVar(host, CSS_VAR.fgDim, '#6e6353'),
    bg: getVar(host, CSS_VAR.bg, '#2a2622'),
  };

  return {
    name: 'labcat-tui-derived',
    type: isDarkBg(colors.bg) ? 'dark' : 'light',
    bg: colors.bg,
    fg: colors.fg,
    colors: {
      'editor.background': colors.bg,
      'editor.foreground': colors.fg,
    },
    tokenColors: [
      {
        scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
        settings: { foreground: colors.comment, fontStyle: 'italic' },
      },
      {
        scope: ['string', 'string.quoted', 'string.template'],
        settings: { foreground: colors.string },
      },
      {
        scope: ['constant.numeric', 'constant.language', 'constant.character.numeric'],
        settings: { foreground: colors.number },
      },
      {
        scope: [
          'keyword',
          'keyword.control',
          'keyword.operator',
          'storage',
          'storage.type',
          'storage.modifier',
        ],
        settings: { foreground: colors.keyword },
      },
      {
        scope: [
          'entity.name.function',
          'support.function',
          'meta.function-call.generic',
          'variable.function',
        ],
        settings: { foreground: colors.function },
      },
      {
        scope: [
          'entity.name.type',
          'entity.name.class',
          'entity.other.inherited-class',
          'support.type',
          'support.class',
          'support.type.primitive',
        ],
        settings: { foreground: colors.type },
      },
      {
        scope: ['punctuation', 'meta.brace', 'meta.delimiter'],
        settings: { foreground: colors.fgDim },
      },
      {
        scope: ['variable', 'variable.parameter', 'variable.other'],
        settings: { foreground: colors.fg },
      },
    ],
  };
}
