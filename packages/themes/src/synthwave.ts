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

export const synthwave: ThemeDefinition = defineTheme({
  name: 'synthwave',

  bg: '#241b30',
  surface: '#2a1f3d',
  surface2: '#34294f',
  border: '#495495',
  selectionBg: '#3a2e57',

  fg: '#f8f8f2',
  fgMuted: '#b893ce',
  fgDim: '#8067a3',

  accent: '#ff7edb',
  accentDim: '#b967c7',
  accentShimmer: '#ffb0eb',

  systemSpinner: '#36f9f6',
  systemSpinnerShimmer: '#7afcfb',

  promptBorder: '#495495',
  promptBorderShimmer: '#6a78b5',

  inactive: '#8067a3',
  inactiveShimmer: '#b893ce',

  modeAutoAccept: '#ff7edb',
  modeBashBorder: '#fe4450',
  modePermission: '#36f9f6',
  modePermissionShimmer: '#7afcfb',
  modePlanMode: '#72f1b8',
  modeIde: '#36f9f6',

  fastMode: '#fede5d',
  fastModeShimmer: '#ffec90',

  success: '#72f1b8',
  error: '#fe4450',
  warning: '#fede5d',
  warningShimmer: '#ffec90',
  info: '#36f9f6',

  diffAdded: '#2a4d3a',
  diffRemoved: '#4d2a3a',
  diffAddedDimmed: '#3a5d4a',
  diffRemovedDimmed: '#5d3a4a',
  diffAddedWord: '#72f1b8',
  diffRemovedWord: '#fe4450',

  subagentAlpha: '#fe4450',
  subagentBravo: '#36f9f6',
  subagentCharlie: '#72f1b8',
  subagentDelta: '#fede5d',
  subagentEcho: '#b967c7',
  subagentFoxtrot: '#ff8b39',
  subagentGolf: '#ff7edb',
  subagentHotel: '#36f9f6',

  chromeYellow: '#fede5d',
  ...motion,
});
