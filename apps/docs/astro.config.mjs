import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tui.labcat.dev',
  integrations: [
    starlight({
      title: '@labcat/tui',
      description: 'Claude Code-styled TUI component library for the web',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/andymai/labcat-tui' }],
      sidebar: [
        {
          label: 'Start',
          items: [
            { label: 'Introduction', slug: 'index' },
            { label: 'Tool call', slug: 'components/tool-call' },
          ],
        },
      ],
      customCss: ['@labcat/tui/styles.css'],
    }),
  ],
});
