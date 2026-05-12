import { type ThemeDefinition, defineTheme } from '@labcat/tui';

const subagent = {
  subagentAlpha: '#fb4934',
  subagentBravo: '#83a598',
  subagentCharlie: '#b8bb26',
  subagentDelta: '#fabd2f',
  subagentEcho: '#d3869b',
  subagentFoxtrot: '#fe8019',
  subagentGolf: '#d3869b',
  subagentHotel: '#8ec07c',
} as const;

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

export const gruvbox: ThemeDefinition = defineTheme({
  name: 'gruvbox',

  bg: '#282828',
  surface: '#32302f',
  surface2: '#3c3836',
  border: '#504945',
  selectionBg: '#45403d',

  fg: '#ebdbb2',
  fgMuted: '#bdae93',
  fgDim: '#928374',

  accent: '#fe8019',
  accentDim: '#d65d0e',
  accentShimmer: '#fea66e',

  systemSpinner: '#83a598',
  systemSpinnerShimmer: '#b8c8d8',

  promptBorder: '#665c54',
  promptBorderShimmer: '#7c6f64',

  inactive: '#928374',
  inactiveShimmer: '#a89984',

  modeAutoAccept: '#d3869b',
  modeBashBorder: '#fb4934',
  modePermission: '#8ec07c',
  modePermissionShimmer: '#b8d8a0',
  modePlanMode: '#689d6a',
  modeIde: '#83a598',

  fastMode: '#fe8019',
  fastModeShimmer: '#fea66e',

  success: '#b8bb26',
  error: '#fb4934',
  warning: '#fabd2f',
  warningShimmer: '#ffe066',
  info: '#83a598',

  diffAdded: '#3a4d2c',
  diffRemoved: '#5d2e2e',
  diffAddedDimmed: '#4a5b3e',
  diffRemovedDimmed: '#6b4242',
  diffAddedWord: '#98971a',
  diffRemovedWord: '#cc241d',

  ...subagent,
  chromeYellow: '#fabd2f',
  ...motion,
});

export const gruvboxLight: ThemeDefinition = defineTheme({
  name: 'gruvboxLight',

  bg: '#fbf1c7',
  surface: '#f2e5bc',
  surface2: '#ebdbb2',
  border: '#d5c4a1',
  selectionBg: '#ebdbb2',

  fg: '#3c3836',
  fgMuted: '#665c54',
  fgDim: '#7c6f64',

  accent: '#af3a03',
  accentDim: '#9d0006',
  accentShimmer: '#d65d0e',

  systemSpinner: '#076678',
  systemSpinnerShimmer: '#458588',

  promptBorder: '#a89984',
  promptBorderShimmer: '#bdae93',

  inactive: '#7c6f64',
  inactiveShimmer: '#928374',

  modeAutoAccept: '#8f3f71',
  modeBashBorder: '#9d0006',
  modePermission: '#427b58',
  modePermissionShimmer: '#689d6a',
  modePlanMode: '#427b58',
  modeIde: '#076678',

  fastMode: '#af3a03',
  fastModeShimmer: '#d65d0e',

  success: '#79740e',
  error: '#9d0006',
  warning: '#b57614',
  warningShimmer: '#d79921',
  info: '#076678',

  diffAdded: '#b8e0b0',
  diffRemoved: '#f0c0c0',
  diffAddedDimmed: '#d0e8c8',
  diffRemovedDimmed: '#f5d8d8',
  diffAddedWord: '#79740e',
  diffRemovedWord: '#9d0006',

  // Subagent: same persona palette as dark
  subagentAlpha: '#cc241d',
  subagentBravo: '#458588',
  subagentCharlie: '#98971a',
  subagentDelta: '#d79921',
  subagentEcho: '#b16286',
  subagentFoxtrot: '#d65d0e',
  subagentGolf: '#b16286',
  subagentHotel: '#689d6a',

  chromeYellow: '#d79921',
  ...motion,
});
