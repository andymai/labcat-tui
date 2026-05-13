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
            { label: 'Quickstart', slug: 'quickstart' },
          ],
        },
        {
          label: 'Surfaces',
          items: [
            { label: 'Session', slug: 'components/session' },
            { label: 'Prompt input', slug: 'components/prompt-input' },
            { label: 'Prompt line', slug: 'components/prompt-line' },
            { label: 'Slash overlay', slug: 'components/slash-overlay' },
            { label: 'Question', slug: 'components/question' },
            { label: 'Status line', slug: 'components/status-line' },
          ],
        },
        {
          label: 'Tool I/O',
          items: [
            { label: 'Tool call', slug: 'components/tool-call' },
            { label: 'Tool-use timeline', slug: 'components/tool-use-timeline' },
            { label: 'Diff block', slug: 'components/diff-block' },
            { label: 'Streamed text', slug: 'components/streamed-text' },
            { label: 'Shimmer text', slug: 'components/shimmer-text' },
            { label: 'Spinner', slug: 'components/spinner' },
          ],
        },
        {
          label: 'Conversation',
          items: [
            { label: 'Chat bubble', slug: 'components/chat-bubble' },
            { label: 'Agent badge', slug: 'components/agent-badge' },
            { label: 'Thinking block', slug: 'components/thinking-block' },
            { label: 'Todo list', slug: 'components/todo-list' },
            { label: 'Todo item', slug: 'components/todo-item' },
            { label: 'Markdown', slug: 'components/md' },
            { label: 'Code block', slug: 'components/code-block' },
          ],
        },
        {
          label: 'Layout',
          items: [
            { label: 'Box', slug: 'components/box' },
            { label: 'Welcome banner', slug: 'components/welcome-banner' },
          ],
        },
        {
          label: 'Theming',
          items: [
            { label: 'Themes', slug: 'themes' },
            { label: 'Theme provider', slug: 'components/theme-provider' },
          ],
        },
      ],
      customCss: ['@labcat/tui/styles.css'],
    }),
  ],
});
