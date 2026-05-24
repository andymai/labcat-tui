import { defineTheme, type ThemeDefinition } from '@labcat/tui';

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

export const kanagawa: ThemeDefinition = defineTheme({
  name: 'kanagawa',

  bg: '#1f1f28',
  surface: '#2a2a37',
  surface2: '#363646',
  border: '#54546d',
  selectionBg: '#2d4f67',

  fg: '#dcd7ba',
  fgMuted: '#a6a69c',
  fgDim: '#727169',

  accent: '#ffa066',
  accentDim: '#b6927b',
  accentShimmer: '#ffc499',

  systemSpinner: '#7e9cd8',
  systemSpinnerShimmer: '#a3b9e6',

  promptBorder: '#54546d',
  promptBorderShimmer: '#727169',

  inactive: '#727169',
  inactiveShimmer: '#a6a69c',

  modeAutoAccept: '#957fb8',
  modeBashBorder: '#e82424',
  modePermission: '#7aa89f',
  modePermissionShimmer: '#a8c6bf',
  modePlanMode: '#6a9589',
  modeIde: '#7e9cd8',

  fastMode: '#ff9e3b',
  fastModeShimmer: '#ffbf75',

  success: '#98bb6c',
  error: '#e82424',
  warning: '#dca561',
  warningShimmer: '#e8c089',
  info: '#7e9cd8',

  diffAdded: '#2a3a2a',
  diffRemoved: '#4a2a2a',
  diffAddedDimmed: '#3a4a3a',
  diffRemovedDimmed: '#5a3a3a',
  diffAddedWord: '#76946a',
  diffRemovedWord: '#c34043',

  subagentAlpha: '#e82424',
  subagentBravo: '#7e9cd8',
  subagentCharlie: '#98bb6c',
  subagentDelta: '#dca561',
  subagentEcho: '#957fb8',
  subagentFoxtrot: '#ffa066',
  subagentGolf: '#d27e99',
  subagentHotel: '#7aa89f',

  chromeYellow: '#dca561',

  codeKeyword: '#957fb8',
  codeString: '#98bb6c',
  codeNumber: '#d27e99',
  codeComment: '#727169',
  codeFunction: '#7e9cd8',
  codeType: '#dca561',

  ...motion,
});

export const kanagawaLotus: ThemeDefinition = defineTheme({
  name: 'kanagawaLotus',

  bg: '#f2ecbc',
  surface: '#e7d8b1',
  surface2: '#dcc9a3',
  border: '#cebca0',
  selectionBg: '#cebca0',

  fg: '#545464',
  fgMuted: '#766b90',
  fgDim: '#8a8980',

  accent: '#cc6d00',
  accentDim: '#a25a14',
  accentShimmer: '#e88c1e',

  systemSpinner: '#4d699b',
  systemSpinnerShimmer: '#6d89bb',

  promptBorder: '#bba684',
  promptBorderShimmer: '#cebca0',

  inactive: '#8a8980',
  inactiveShimmer: '#a8a79e',

  modeAutoAccept: '#624c83',
  modeBashBorder: '#c84053',
  modePermission: '#597b75',
  modePermissionShimmer: '#7a9c96',
  modePlanMode: '#4d699b',
  modeIde: '#4d699b',

  fastMode: '#cc6d00',
  fastModeShimmer: '#e88c1e',

  success: '#6f894e',
  error: '#c84053',
  warning: '#77713f',
  warningShimmer: '#9c9558',
  info: '#4d699b',

  diffAdded: '#c5d8b8',
  diffRemoved: '#e8c8c8',
  diffAddedDimmed: '#d4e0c8',
  diffRemovedDimmed: '#f0d8d8',
  diffAddedWord: '#6f894e',
  diffRemovedWord: '#c84053',

  subagentAlpha: '#c84053',
  subagentBravo: '#4d699b',
  subagentCharlie: '#6f894e',
  subagentDelta: '#77713f',
  subagentEcho: '#624c83',
  subagentFoxtrot: '#cc6d00',
  subagentGolf: '#b35b79',
  subagentHotel: '#597b75',

  chromeYellow: '#cc6d00',

  codeKeyword: '#624c83',
  codeString: '#6f894e',
  codeNumber: '#b35b79',
  codeComment: '#8a8980',
  codeFunction: '#4d699b',
  codeType: '#77713f',

  ...motion,
});
