import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './tool-call.js';
import type { TuiToolCall } from './tool-call.js';

describe('<tui-tool-call>', () => {
  it('renders the tool name and args in the head', async () => {
    const el = await fixture<TuiToolCall>(
      html`<tui-tool-call tool="Read" args="posts/"></tui-tool-call>`,
    );
    const tool = el.shadowRoot?.querySelector('[part~="tool"]');
    const args = el.shadowRoot?.querySelector('[part~="args"]');
    expect(tool?.textContent).toBe('Read');
    expect(args?.textContent).toBe('posts/');
  });

  it('hides the body when no slot content is provided', async () => {
    const el = await fixture<TuiToolCall>(
      html`<tui-tool-call tool="Read" args="posts/"></tui-tool-call>`,
    );
    const body = el.shadowRoot?.querySelector<HTMLElement>('[part~="body"]');
    expect(body?.hidden).toBe(true);
  });

  it('shows the body when slotted content exists', async () => {
    const el = await fixture<TuiToolCall>(
      html`<tui-tool-call tool="Read" args="posts/">
        <ul><li>a</li></ul>
      </tui-tool-call>`,
    );
    await el.updateComplete;
    const body = el.shadowRoot?.querySelector<HTMLElement>('[part~="body"]');
    expect(body?.hidden).toBe(false);
  });

  it('reflects status as an attribute for CSS hooks', async () => {
    const el = await fixture<TuiToolCall>(
      html`<tui-tool-call tool="Edit" status="error"></tui-tool-call>`,
    );
    expect(el.getAttribute('status')).toBe('error');
  });

  it('auto-generates an aria-label from tool + args', async () => {
    const el = await fixture<TuiToolCall>(
      html`<tui-tool-call tool="Read" args="posts/"></tui-tool-call>`,
    );
    expect(el.getAttribute('aria-label')).toBe('Read posts/');
  });

  it('does not override a consumer-provided aria-label', async () => {
    const el = await fixture<TuiToolCall>(
      html`<tui-tool-call tool="Read" args="posts/" aria-label="custom"></tui-tool-call>`,
    );
    expect(el.getAttribute('aria-label')).toBe('custom');
  });

  it('sets role="region" when not provided', async () => {
    const el = await fixture<TuiToolCall>(html`<tui-tool-call tool="Read"></tui-tool-call>`);
    expect(el.getAttribute('role')).toBe('region');
  });
});
