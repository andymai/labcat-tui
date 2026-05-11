import { type ThemeDefinition, defineTheme } from '@labcat/tui';

/**
 * Old-CRT terminal aesthetic — monochrome with one phosphor hue.
 * Both variants use the same near-black background and rely on the accent
 * for the entire color story. Use a `--tui-font-mono` like IBM 3270 or
 * VT323 if you want full retro authenticity.
 */
export const phosphorGreen: ThemeDefinition = defineTheme({
  name: 'phosphorGreen',
  bg: '#0a0e0a',
  surface: '#0f1a0f',
  surface2: '#142414',
  fg: '#33ff33',
  fgMuted: '#22cc22',
  fgDim: '#118811',
  accent: '#66ff66',
  accentDim: '#33cc33',
  border: '#1c4d1c',
  success: '#33ff33',
  error: '#ff5544',
  warning: '#ddff44',
  info: '#22cccc',
  fontMono:
    '"Berkeley Mono", ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  leadingTight: '1.25',
  leadingBody: '1.55',
  contentMax: '72ch',
  durFast: '120ms',
  durBase: '220ms',
  easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
});

export const phosphorAmber: ThemeDefinition = defineTheme({
  name: 'phosphorAmber',
  bg: '#100a05',
  surface: '#1c130a',
  surface2: '#2a1d10',
  fg: '#ffb000',
  fgMuted: '#cc8b00',
  fgDim: '#885d00',
  accent: '#ffd400',
  accentDim: '#cca800',
  border: '#4d3300',
  success: '#88dd00',
  error: '#ff4422',
  warning: '#ffd400',
  info: '#ff8800',
  fontMono:
    '"Berkeley Mono", ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  leadingTight: '1.25',
  leadingBody: '1.55',
  contentMax: '72ch',
  durFast: '120ms',
  durBase: '220ms',
  easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
});
