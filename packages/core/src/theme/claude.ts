import { defineTheme } from './defineTheme.js';

// Tokens marked `← reference: rgb(...)` are extracted from Claude Code's
// official CLI source map. Unmarked tokens have no upstream counterpart and
// use the local web translation.

export const claude = defineTheme({
  name: 'claude',

  // Surfaces
  bg: '#1a1816',
  surface: '#221f1c',
  surface2: '#2a2622',
  border: '#3a3530',
  selectionBg: '#264f78',

  // Text
  fg: '#ffffff', // ← reference: rgb(255,255,255)
  fgMuted: '#a89c8a',
  fgDim: '#6e6353',

  // Brand
  accent: '#d77757', // ← reference: rgb(215,119,87)
  accentDim: '#8a4a36',
  accentShimmer: '#eb9f7f', // ← reference: rgb(235,159,127)

  // System spinner
  systemSpinner: '#93a5ff', // ← reference: rgb(147,165,255)
  systemSpinnerShimmer: '#b1c3ff',

  // Prompt border
  promptBorder: '#888888',
  promptBorderShimmer: '#a6a6a6',

  // Inactive
  inactive: '#999999',
  inactiveShimmer: '#c1c1c1',

  // Mode indicators
  modeAutoAccept: '#af87ff', // electric violet
  modeBashBorder: '#fd5db1', // bright pink
  modePermission: '#b1b9f9', // light blue-purple
  modePermissionShimmer: '#cfd7ff',
  modePlanMode: '#48968c', // muted sage
  modeIde: '#4782c8', // muted blue

  // Fast mode
  fastMode: '#ff7814',
  fastModeShimmer: '#ffa546',

  // Semantic
  success: '#4eba65', // ← reference: rgb(78,186,101)
  error: '#ff6b80', // ← reference: rgb(255,107,128)
  warning: '#ffc107', // ← reference: rgb(255,193,7)
  warningShimmer: '#ffdf39',
  info: '#7ab1d9',

  // Diff
  diffAdded: '#225c2b',
  diffRemoved: '#7a2936',
  diffAddedDimmed: '#47584a',
  diffRemovedDimmed: '#69484d',
  diffAddedWord: '#38a660',
  diffRemovedWord: '#b3596b',

  // Subagent personas (consistent across light/dark per reference)
  subagentAlpha: '#dc2626',
  subagentBravo: '#2563eb',
  subagentCharlie: '#16a34a',
  subagentDelta: '#ca8a04',
  subagentEcho: '#9333ea',
  subagentFoxtrot: '#ea580c',
  subagentGolf: '#db2777',
  subagentHotel: '#0891b2',

  // Chrome integration
  chromeYellow: '#fbbc04',

  // Typography + motion
  fontMono:
    '"Berkeley Mono", ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  leadingTight: '1.25',
  leadingBody: '1.55',
  contentMax: '72ch',
  durFast: '120ms',
  durBase: '220ms',
  easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
});

export const claudeLight = defineTheme({
  name: 'claudeLight',

  // Surfaces
  bg: '#faf6f1',
  surface: '#f1ece4',
  surface2: '#e7e1d6',
  border: '#d4cdc1',
  selectionBg: '#b4d5ff',

  // Text
  fg: '#000000', // ← reference light: rgb(0,0,0)
  fgMuted: '#5c544a',
  fgDim: '#8e8678',

  // Brand
  accent: '#d77757', // ← reference: rgb(215,119,87) (same orange in both modes)
  accentDim: '#9a4326',
  accentShimmer: '#f59575',

  // System spinner
  systemSpinner: '#5769f7',
  systemSpinnerShimmer: '#7587ff',

  // Prompt border
  promptBorder: '#999999',
  promptBorderShimmer: '#b7b7b7',

  // Inactive
  inactive: '#666666',
  inactiveShimmer: '#8e8e8e',

  // Mode indicators
  modeAutoAccept: '#8700ff',
  modeBashBorder: '#ff0087',
  modePermission: '#5769f7',
  modePermissionShimmer: '#899bff',
  modePlanMode: '#006666',
  modeIde: '#4782c8',

  // Fast mode
  fastMode: '#ff6a00',
  fastModeShimmer: '#ff9632',

  // Semantic
  success: '#2c7a39',
  error: '#ab2b3f',
  warning: '#966c1e',
  warningShimmer: '#c89e50',
  info: '#3e7ba8',

  // Diff
  diffAdded: '#69db7c',
  diffRemoved: '#ffa8b4',
  diffAddedDimmed: '#c7e1cb',
  diffRemovedDimmed: '#fdd2d8',
  diffAddedWord: '#2f9d44',
  diffRemovedWord: '#d1454b',

  // Subagent personas (same hex in dark/light per reference)
  subagentAlpha: '#dc2626',
  subagentBravo: '#2563eb',
  subagentCharlie: '#16a34a',
  subagentDelta: '#ca8a04',
  subagentEcho: '#9333ea',
  subagentFoxtrot: '#ea580c',
  subagentGolf: '#db2777',
  subagentHotel: '#0891b2',

  // Chrome integration
  chromeYellow: '#fbbc04',

  // Typography + motion
  fontMono:
    '"Berkeley Mono", ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  leadingTight: '1.25',
  leadingBody: '1.55',
  contentMax: '72ch',
  durFast: '120ms',
  durBase: '220ms',
  easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
});
