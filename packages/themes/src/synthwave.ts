import { type ThemeDefinition, defineTheme } from '@labcat/tui';

export const synthwave: ThemeDefinition = defineTheme({
  name: 'synthwave',
  bg: '#241b30',
  surface: '#2a1f3d',
  surface2: '#34294f',
  fg: '#f8f8f2',
  fgMuted: '#b893ce',
  fgDim: '#8067a3',
  accent: '#ff7edb',
  accentDim: '#b967c7',
  border: '#495495',
  success: '#72f1b8',
  error: '#fe4450',
  warning: '#fede5d',
  info: '#36f9f6',
  fontMono:
    '"Berkeley Mono", ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  leadingTight: '1.25',
  leadingBody: '1.55',
  contentMax: '72ch',
  durFast: '120ms',
  durBase: '220ms',
  easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
});
