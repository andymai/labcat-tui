import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './chat-bubble.js';
import type { TuiChatBubble } from './chat-bubble.js';

describe('<tui-chat-bubble>', () => {
  it('defaults to role="assistant"', async () => {
    const el = await fixture<TuiChatBubble>(html`<tui-chat-bubble>hi</tui-chat-bubble>`);
    expect(el.role).toBe('assistant');
  });

  it('renders the name and timestamp when provided', async () => {
    const el = await fixture<TuiChatBubble>(
      html`<tui-chat-bubble name="Claude" timestamp="now">x</tui-chat-bubble>`,
    );
    expect(el.shadowRoot?.querySelector('[part~="name"]')?.textContent).toBe('Claude');
    expect(el.shadowRoot?.querySelector('[part~="timestamp"]')?.textContent).toBe('now');
  });

  it('omits the name span when no name is set', async () => {
    const el = await fixture<TuiChatBubble>(html`<tui-chat-bubble>x</tui-chat-bubble>`);
    expect(el.shadowRoot?.querySelector('[part~="name"]')).toBeNull();
  });

  it('picks a role-specific glyph', async () => {
    const user = await fixture<TuiChatBubble>(
      html`<tui-chat-bubble role="user">x</tui-chat-bubble>`,
    );
    const sys = await fixture<TuiChatBubble>(
      html`<tui-chat-bubble role="system">x</tui-chat-bubble>`,
    );
    expect(user.shadowRoot?.querySelector('[part~="role"]')?.textContent).toBe('›');
    expect(sys.shadowRoot?.querySelector('[part~="role"]')?.textContent).toBe('◆');
  });
});
