import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './agent-badge.js';
import type { TuiAgentBadge } from './agent-badge.js';

describe('<tui-agent-badge>', () => {
  it('defaults to callsign="alpha" and sets role="note"', async () => {
    const el = await fixture<TuiAgentBadge>(html`<tui-agent-badge>x</tui-agent-badge>`);
    expect(el.callsign).toBe('alpha');
    expect(el.getAttribute('role')).toBe('note');
  });

  it('reflects callsign as an attribute so CSS can resolve --tui-agent-color', async () => {
    const el = await fixture<TuiAgentBadge>(
      html`<tui-agent-badge callsign="echo">x</tui-agent-badge>`,
    );
    expect(el.getAttribute('callsign')).toBe('echo');

    el.callsign = 'hotel';
    await el.updateComplete;
    expect(el.getAttribute('callsign')).toBe('hotel');
  });

  it('renders the dot indicator and slotted label', async () => {
    const el = await fixture<TuiAgentBadge>(
      html`<tui-agent-badge callsign="bravo">claude-2</tui-agent-badge>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[part~="dot"]')?.textContent).toBe('●');
    expect(el.textContent?.trim()).toBe('claude-2');
  });
});
