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

/**
 * Old-CRT terminal aesthetic — monochrome with one phosphor hue.
 * The accent is the entire color story; mode/subagent variants are tinted
 * shades of the same phosphor rather than chromatic shifts, preserving the
 * single-color illusion.
 */
export const phosphorGreen: ThemeDefinition = defineTheme({
  name: 'phosphorGreen',

  bg: '#0a0e0a',
  surface: '#0f1a0f',
  surface2: '#142414',
  border: '#1c4d1c',
  selectionBg: '#1c4d1c',

  fg: '#33ff33',
  fgMuted: '#22cc22',
  fgDim: '#118811',

  accent: '#66ff66',
  accentDim: '#33cc33',
  accentShimmer: '#99ff99',

  systemSpinner: '#33ff33',
  systemSpinnerShimmer: '#66ff66',

  promptBorder: '#1c4d1c',
  promptBorderShimmer: '#2c6d2c',

  inactive: '#118811',
  inactiveShimmer: '#22cc22',

  modeAutoAccept: '#99ff99',
  modeBashBorder: '#66ff66',
  modePermission: '#33ff33',
  modePermissionShimmer: '#66ff66',
  modePlanMode: '#22cc22',
  modeIde: '#33ff33',

  fastMode: '#99ff99',
  fastModeShimmer: '#ccffcc',

  success: '#33ff33',
  error: '#ff5544',
  warning: '#ddff44',
  warningShimmer: '#eeff88',
  info: '#22cccc',

  diffAdded: '#1c4d1c',
  diffRemoved: '#4d1c1c',
  diffAddedDimmed: '#2c5d2c',
  diffRemovedDimmed: '#5d2c2c',
  diffAddedWord: '#66ff66',
  diffRemovedWord: '#ff5544',

  subagentAlpha: '#ff5544',
  subagentBravo: '#22cccc',
  subagentCharlie: '#33ff33',
  subagentDelta: '#ddff44',
  subagentEcho: '#99ff99',
  subagentFoxtrot: '#ffaa55',
  subagentGolf: '#ff99cc',
  subagentHotel: '#22cccc',

  chromeYellow: '#ddff44',
  ...motion,
});

export const phosphorAmber: ThemeDefinition = defineTheme({
  name: 'phosphorAmber',

  bg: '#100a05',
  surface: '#1c130a',
  surface2: '#2a1d10',
  border: '#4d3300',
  selectionBg: '#4d3300',

  fg: '#ffb000',
  fgMuted: '#cc8b00',
  fgDim: '#885d00',

  accent: '#ffd400',
  accentDim: '#cca800',
  accentShimmer: '#ffe055',

  systemSpinner: '#ffb000',
  systemSpinnerShimmer: '#ffd400',

  promptBorder: '#4d3300',
  promptBorderShimmer: '#6d4900',

  inactive: '#885d00',
  inactiveShimmer: '#cc8b00',

  modeAutoAccept: '#ffe055',
  modeBashBorder: '#ffd400',
  modePermission: '#ffb000',
  modePermissionShimmer: '#ffd400',
  modePlanMode: '#cc8b00',
  modeIde: '#ffb000',

  fastMode: '#ffe055',
  fastModeShimmer: '#fff09a',

  success: '#88dd00',
  error: '#ff4422',
  warning: '#ffd400',
  warningShimmer: '#ffe055',
  info: '#ff8800',

  diffAdded: '#3d3300',
  diffRemoved: '#4d1c00',
  diffAddedDimmed: '#5d4900',
  diffRemovedDimmed: '#5d2c00',
  diffAddedWord: '#88dd00',
  diffRemovedWord: '#ff4422',

  subagentAlpha: '#ff4422',
  subagentBravo: '#ff8800',
  subagentCharlie: '#88dd00',
  subagentDelta: '#ffd400',
  subagentEcho: '#ffe055',
  subagentFoxtrot: '#ffaa55',
  subagentGolf: '#ff99cc',
  subagentHotel: '#ff8800',

  chromeYellow: '#ffd400',
  ...motion,
});
