import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './tool-call.js';
import './tool-use-timeline.js';
import type { TuiToolUseTimeline } from './tool-use-timeline.js';

describe('<tui-tool-use-timeline>', () => {
  it('renders the connector even when empty', async () => {
    const el = await fixture<TuiToolUseTimeline>(
      html`<tui-tool-use-timeline></tui-tool-use-timeline>`,
    );
    const connector = el.shadowRoot?.querySelector('[part~="connector"]');
    expect(connector).not.toBeNull();
  });

  it('slots its children in light DOM order', async () => {
    const el = await fixture<TuiToolUseTimeline>(html`
      <tui-tool-use-timeline>
        <tui-tool-call tool="Read"></tui-tool-call>
        <tui-tool-call tool="Edit"></tui-tool-call>
      </tui-tool-use-timeline>
    `);
    const items = el.querySelectorAll('tui-tool-call');
    expect(items).toHaveLength(2);
    expect(items[0]?.getAttribute('tool')).toBe('Read');
    expect(items[1]?.getAttribute('tool')).toBe('Edit');
  });
});
