import { defineTheme } from './defineTheme.js';

// Claude Code's `dark-ansi` theme rendered in the standard ANSI 16-color
// palette hex equivalents (xterm defaults). Useful as a retro / VT220 styling
// option — the reference uses string identifiers like "ansi:red" + chalk; we
// materialise to RGB so it works in any browser without a terminal layer.
//
// Palette source: https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
const ansi = {
  black: '#000000',
  red: '#cd0000',
  green: '#00cd00',
  yellow: '#cdcd00',
  blue: '#0000ee',
  magenta: '#cd00cd',
  cyan: '#00cdcd',
  white: '#e5e5e5',
  blackBright: '#7f7f7f',
  redBright: '#ff0000',
  greenBright: '#00ff00',
  yellowBright: '#ffff00',
  blueBright: '#5c5cff',
  magentaBright: '#ff00ff',
  cyanBright: '#00ffff',
  whiteBright: '#ffffff',
};

export const claudeAnsi = defineTheme({
  name: 'claudeAnsi',

  bg: ansi.black,
  surface: ansi.black,
  surface2: ansi.blackBright,
  border: ansi.white,
  selectionBg: ansi.blue,

  fg: ansi.white,
  fgMuted: ansi.blackBright,
  fgDim: ansi.blackBright,

  accent: ansi.redBright, // Claude brand orange → bright red in ANSI
  accentDim: ansi.red,
  accentShimmer: ansi.yellowBright,

  systemSpinner: ansi.blue,
  systemSpinnerShimmer: ansi.blueBright,

  promptBorder: ansi.white,
  promptBorderShimmer: ansi.whiteBright,

  inactive: ansi.blackBright,
  inactiveShimmer: ansi.white,

  modeAutoAccept: ansi.magenta,
  modeBashBorder: ansi.magenta,
  modePermission: ansi.blue,
  modePermissionShimmer: ansi.blueBright,
  modePlanMode: ansi.cyan,
  modeIde: ansi.blueBright,

  fastMode: ansi.redBright,
  fastModeShimmer: ansi.yellowBright,

  success: ansi.green,
  error: ansi.red,
  warning: ansi.yellow,
  warningShimmer: ansi.yellowBright,
  info: ansi.cyan,

  diffAdded: ansi.green,
  diffRemoved: ansi.red,
  diffAddedDimmed: ansi.green,
  diffRemovedDimmed: ansi.red,
  diffAddedWord: ansi.greenBright,
  diffRemovedWord: ansi.redBright,

  subagentRed: ansi.red,
  subagentBlue: ansi.blue,
  subagentGreen: ansi.green,
  subagentYellow: ansi.yellow,
  subagentPurple: ansi.magenta,
  subagentOrange: ansi.redBright,
  subagentPink: ansi.magentaBright,
  subagentCyan: ansi.cyan,

  chromeYellow: ansi.yellow,

  fontMono:
    '"Berkeley Mono", ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  leadingTight: '1.25',
  leadingBody: '1.55',
  contentMax: '72ch',
  durFast: '120ms',
  durBase: '220ms',
  easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
});
