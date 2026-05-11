import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './prompt-line.js';
import type { TuiPromptLine } from './prompt-line.js';

describe('<tui-prompt-line>', () => {
  it('renders the caret in shadow DOM', async () => {
    const el = await fixture<TuiPromptLine>(html`<tui-prompt-line></tui-prompt-line>`);
    const caret = el.shadowRoot?.querySelector('[part~="caret"]');
    expect(caret?.textContent).toBe('›');
  });

  it('renders the command when provided', async () => {
    const el = await fixture<TuiPromptLine>(
      html`<tui-prompt-line command="ls posts/"></tui-prompt-line>`,
    );
    const command = el.shadowRoot?.querySelector('[part~="command"]');
    expect(command?.textContent).toBe('ls posts/');
  });

  it('omits the command span when no command is set', async () => {
    const el = await fixture<TuiPromptLine>(html`<tui-prompt-line></tui-prompt-line>`);
    const command = el.shadowRoot?.querySelector('[part~="command"]');
    expect(command).toBeNull();
  });

  it('shows the cursor when the cursor attribute is set', async () => {
    const el = await fixture<TuiPromptLine>(html`<tui-prompt-line cursor></tui-prompt-line>`);
    const cursor = el.shadowRoot?.querySelector('[part~="cursor"]');
    expect(cursor).not.toBeNull();
  });

  it('hides the cursor when the cursor attribute is absent', async () => {
    const el = await fixture<TuiPromptLine>(html`<tui-prompt-line></tui-prompt-line>`);
    const cursor = el.shadowRoot?.querySelector('[part~="cursor"]');
    expect(cursor).toBeNull();
  });
});
