import { type ThemeDefinition, defineTheme } from '@labcat/tui';

const motion = {
  fontMono:
    '"Berkeley Mono", ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  leadingTight: '1.25',
  leadingBody: '1.55',
  contentMax: '72ch',
  durFast: '120ms',
  durBase: '220ms',
  easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
} as const;

export const rosePine: ThemeDefinition = defineTheme({
  name: 'rosePine',

  bg: '#191724',
  surface: '#1f1d2e',
  surface2: '#26233a',
  border: '#403d52',
  selectionBg: '#403d52',

  fg: '#e0def4',
  fgMuted: '#908caa',
  fgDim: '#6e6a86',

  accent: '#ebbcba',
  accentDim: '#c4a7e7',
  accentShimmer: '#f0d0cf',

  systemSpinner: '#9ccfd8',
  systemSpinnerShimmer: '#bce0e8',

  promptBorder: '#403d52',
  promptBorderShimmer: '#524f68',

  inactive: '#6e6a86',
  inactiveShimmer: '#908caa',

  modeAutoAccept: '#c4a7e7',
  modeBashBorder: '#eb6f92',
  modePermission: '#9ccfd8',
  modePermissionShimmer: '#bce0e8',
  modePlanMode: '#31748f',
  modeIde: '#9ccfd8',

  fastMode: '#f6c177',
  fastModeShimmer: '#fad59a',

  success: '#9ccfd8',
  error: '#eb6f92',
  warning: '#f6c177',
  warningShimmer: '#fad59a',
  info: '#31748f',

  diffAdded: '#2a3d3a',
  diffRemoved: '#4d2a3a',
  diffAddedDimmed: '#3a4d4a',
  diffRemovedDimmed: '#5d3a4a',
  diffAddedWord: '#56949f',
  diffRemovedWord: '#b4637a',

  subagentAlpha: '#eb6f92',
  subagentBravo: '#9ccfd8',
  subagentCharlie: '#9ccfd8',
  subagentDelta: '#f6c177',
  subagentEcho: '#c4a7e7',
  subagentFoxtrot: '#ebbcba',
  subagentGolf: '#ebbcba',
  subagentHotel: '#9ccfd8',

  chromeYellow: '#f6c177',
  ...motion,
});

export const rosePineDawn: ThemeDefinition = defineTheme({
  name: 'rosePineDawn',

  bg: '#faf4ed',
  surface: '#fffaf3',
  surface2: '#f2e9e1',
  border: '#dfdad9',
  selectionBg: '#f2e9e1',

  fg: '#575279',
  fgMuted: '#797593',
  fgDim: '#9893a5',

  accent: '#b4637a',
  accentDim: '#907aa9',
  accentShimmer: '#cf7d8d',

  systemSpinner: '#286983',
  systemSpinnerShimmer: '#56949f',

  promptBorder: '#cecacd',
  promptBorderShimmer: '#dfdad9',

  inactive: '#9893a5',
  inactiveShimmer: '#797593',

  modeAutoAccept: '#907aa9',
  modeBashBorder: '#b4637a',
  modePermission: '#56949f',
  modePermissionShimmer: '#86b9c4',
  modePlanMode: '#286983',
  modeIde: '#56949f',

  fastMode: '#ea9d34',
  fastModeShimmer: '#f0b56a',

  success: '#286983',
  error: '#b4637a',
  warning: '#ea9d34',
  warningShimmer: '#f0b56a',
  info: '#56949f',

  diffAdded: '#cfe7d6',
  diffRemoved: '#f0d0d6',
  diffAddedDimmed: '#dceee0',
  diffRemovedDimmed: '#f5dde0',
  diffAddedWord: '#286983',
  diffRemovedWord: '#b4637a',

  subagentAlpha: '#b4637a',
  subagentBravo: '#286983',
  subagentCharlie: '#56949f',
  subagentDelta: '#ea9d34',
  subagentEcho: '#907aa9',
  subagentFoxtrot: '#d7827e',
  subagentGolf: '#b4637a',
  subagentHotel: '#56949f',

  chromeYellow: '#ea9d34',
  ...motion,
});
