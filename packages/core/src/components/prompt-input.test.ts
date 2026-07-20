import { fixture, html } from '@open-wc/testing-helpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineCommands } from '../commands/registry.js';
import type { Command } from '../commands/types.js';
import './prompt-input.js';
import type { TuiPromptInput } from './prompt-input.js';

function pressEnter(el: TuiPromptInput): void {
  const input = el.shadowRoot?.querySelector('input');
  input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

function pressKey(el: TuiPromptInput, key: string): void {
  const input = el.shadowRoot?.querySelector('input');
  input?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function typeInto(el: TuiPromptInput, value: string): void {
  const input = el.shadowRoot?.querySelector('input');
  if (!input) throw new Error('expected internal input');
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('<tui-prompt-input>', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  it('renders the › caret and an internal input', async () => {
    const el = await fixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    const caret = el.shadowRoot?.querySelector('[part~="caret"]');
    const input = el.shadowRoot?.querySelector<HTMLInputElement>('[part~="input"]');
    expect(caret?.textContent).toBe('›');
    expect(input).not.toBeNull();
    expect(input?.getAttribute('aria-label')).toBe('terminal command');
  });

  it('reflects placeholder onto the internal input', async () => {
    const el = await fixture<TuiPromptInput>(
      html`<tui-prompt-input placeholder="try /help"></tui-prompt-input>`,
    );
    const input = el.shadowRoot?.querySelector<HTMLInputElement>('input');
    expect(input?.placeholder).toBe('try /help');
  });

  it('navigates to the route on Enter for route commands', async () => {
    const onNavigate = vi.fn();
    const el = await fixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    el.commands = defineCommands([{ name: 'posts', route: '/posts/' }]);
    el.onNavigate = onNavigate;
    typeInto(el, '/posts');
    pressEnter(el);
    await el.updateComplete;
    expect(onNavigate).toHaveBeenCalledWith('/posts/');
  });

  it('fires tui-navigate after the onNavigate callback', async () => {
    const order: string[] = [];
    const el = await fixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    el.commands = defineCommands([{ name: 'posts', route: '/posts/' }]);
    el.onNavigate = () => order.push('callback');
    el.addEventListener('tui-navigate', () => order.push('event'));
    typeInto(el, 'posts');
    pressEnter(el);
    await el.updateComplete;
    expect(order).toEqual(['callback', 'event']);
  });

  it('runs a handler command and fires tui-command-success', async () => {
    let lastArg = '';
    const handler = vi.fn((arg: string) => {
      lastArg = arg;
      return Promise.resolve();
    });
    const successes: CustomEvent[] = [];
    const el = await fixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    el.commands = defineCommands([{ name: 'noop', handler }]);
    el.addEventListener('tui-command-success', (e) => successes.push(e as CustomEvent));
    typeInto(el, '/noop arg1 arg2');
    pressEnter(el);
    await new Promise((r) => setTimeout(r, 0));
    expect(handler).toHaveBeenCalledOnce();
    expect(lastArg).toBe('arg1 arg2');
    expect(successes).toHaveLength(1);
  });

  it('fires tui-command-error when the handler rejects', async () => {
    const errors: CustomEvent[] = [];
    const el = await fixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    const boom: Command = {
      name: 'boom',
      handler: () => Promise.reject(new Error('kaboom')),
    };
    el.commands = defineCommands([boom]);
    el.addEventListener('tui-command-error', (e) => errors.push(e as CustomEvent));
    typeInto(el, 'boom');
    pressEnter(el);
    await new Promise((r) => setTimeout(r, 0));
    expect(errors).toHaveLength(1);
    const detail = errors[0]?.detail as { error: Error } | undefined;
    expect(detail?.error.message).toBe('kaboom');
  });

  it('sets aria-busy during handler execution and clears after', async () => {
    let resolveHandler: (() => void) | undefined;
    const el = await fixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    el.commands = defineCommands([
      {
        name: 'slow',
        handler: () =>
          new Promise<void>((resolve) => {
            resolveHandler = resolve;
          }),
      },
    ]);
    typeInto(el, 'slow');
    pressEnter(el);
    await el.updateComplete;
    expect(el.getAttribute('aria-busy')).toBe('true');
    resolveHandler?.();
    await new Promise((r) => setTimeout(r, 0));
    expect(el.hasAttribute('aria-busy')).toBe(false);
  });

  it('rejects a second submit while a handler is running (no queueing)', async () => {
    let resolveHandler: (() => void) | undefined;
    const handler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveHandler = resolve;
        }),
    );
    const el = await fixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    el.commands = defineCommands([{ name: 'slow', handler }]);

    typeInto(el, 'slow');
    pressEnter(el);
    await el.updateComplete;

    typeInto(el, 'slow');
    pressEnter(el);
    await el.updateComplete;
    expect(handler).toHaveBeenCalledTimes(1);

    resolveHandler?.();
    await new Promise((r) => setTimeout(r, 0));
  });

  it('persists submitted commands to history and recalls them with arrow keys', async () => {
    const el = await fixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    el.commands = defineCommands([{ name: 'posts', route: '/posts/' }]);
    el.onNavigate = () => undefined;

    typeInto(el, 'posts one');
    pressEnter(el);
    await el.updateComplete;
    typeInto(el, 'posts two');
    pressEnter(el);
    await el.updateComplete;

    pressKey(el, 'ArrowUp');
    await el.updateComplete;
    let input = el.shadowRoot?.querySelector<HTMLInputElement>('input');
    expect(input?.value).toBe('posts two');

    pressKey(el, 'ArrowUp');
    await el.updateComplete;
    input = el.shadowRoot?.querySelector<HTMLInputElement>('input');
    expect(input?.value).toBe('posts one');

    pressKey(el, 'ArrowDown');
    pressKey(el, 'ArrowDown');
    await el.updateComplete;
    input = el.shadowRoot?.querySelector<HTMLInputElement>('input');
    expect(input?.value).toBe('');
  });

  it('tab-completes the first matching command', async () => {
    const el = await fixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    el.commands = defineCommands([
      { name: 'posts', route: '/posts/' },
      { name: 'projects', route: '/projects/' },
    ]);
    typeInto(el, 'po');
    pressKey(el, 'Tab');
    await new Promise((r) => setTimeout(r, 0));
    await el.updateComplete;
    const input = el.shadowRoot?.querySelector<HTMLInputElement>('input');
    expect(['posts', 'projects']).toContain(input?.value);
  });

  it('ArrowDown with no active history browse leaves typed text alone', async () => {
    const el = await fixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    el.commands = defineCommands([{ name: 'posts', route: '/posts/' }]);
    el.onNavigate = () => undefined;

    // Seed some history so the .length > 0 guard doesn't short-circuit.
    typeInto(el, 'posts one');
    pressEnter(el);
    await el.updateComplete;

    // User types fresh input, then accidentally hits ArrowDown.
    typeInto(el, 'in progress');
    pressKey(el, 'ArrowDown');
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector<HTMLInputElement>('input');
    expect(input?.value).toBe('in progress');
  });

  it('reflects the mode attribute on the host so CSS can resolve a per-mode color', async () => {
    const el = await fixture<TuiPromptInput>(
      html`<tui-prompt-input mode="autoAccept"></tui-prompt-input>`,
    );
    expect(el.getAttribute('mode')).toBe('autoAccept');
    el.mode = 'planMode';
    await el.updateComplete;
    expect(el.getAttribute('mode')).toBe('planMode');
  });

  it('emits tui-command even when the input is unrecognized', async () => {
    const events: CustomEvent[] = [];
    const el = await fixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    el.addEventListener('tui-command', (e) => events.push(e as CustomEvent));
    typeInto(el, 'unknown-thing');
    pressEnter(el);
    await el.updateComplete;
    expect(events).toHaveLength(1);
    expect(events[0]?.detail).toEqual({ name: 'unknown-thing', args: '' });
  });
});

describe('<tui-prompt-input> ctx.write / clear / history', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  async function withFixture(): Promise<{ wrap: HTMLElement; prompt: TuiPromptInput }> {
    const wrap = await fixture<HTMLElement>(html`
      <div>
        <tui-prompt-input></tui-prompt-input>
      </div>
    `);
    const prompt = wrap.querySelector('tui-prompt-input') as TuiPromptInput;
    return { wrap, prompt };
  }

  it('ctx.write(string) auto-wraps in <tui-streamed-text mode="token" skippable>', async () => {
    const { wrap, prompt } = await withFixture();
    const writeCmd: Command = {
      name: 'echo',
      handler: (arg, ctx) => ctx.write(arg),
    };
    prompt.commands = defineCommands([writeCmd]);
    typeInto(prompt, 'echo hello world');
    pressEnter(prompt);
    await prompt.updateComplete;
    const first = wrap.firstElementChild as HTMLElement;
    expect(first.tagName.toLowerCase()).toBe('tui-streamed-text');
    expect(first.getAttribute('mode')).toBe('token');
    expect(first.hasAttribute('skippable')).toBe(true);
    expect(first.textContent).toBe('hello world');
    expect(first.nextElementSibling).toBe(prompt);
  });

  it('ctx.write(Node) inserts the node as-is without streaming-wrapping', async () => {
    const { wrap, prompt } = await withFixture();
    prompt.commands = defineCommands([
      {
        name: 'rich',
        handler: (_, ctx) => {
          const section = document.createElement('section');
          section.className = 'my-output';
          section.textContent = 'rich';
          ctx.write(section);
        },
      },
    ]);
    typeInto(prompt, 'rich');
    pressEnter(prompt);
    await prompt.updateComplete;
    const first = wrap.firstElementChild as HTMLElement;
    expect(first.tagName.toLowerCase()).toBe('section');
    expect(first.classList.contains('my-output')).toBe(true);
  });

  it('ctx.write delegates to onWrite when set', async () => {
    const { wrap, prompt } = await withFixture();
    const seen: Node[] = [];
    prompt.onWrite = (n) => {
      seen.push(n);
      return true; // claim — default insertion should not run
    };
    prompt.commands = defineCommands([{ name: 'echo', handler: (arg, ctx) => ctx.write(arg) }]);
    typeInto(prompt, 'echo hi');
    pressEnter(prompt);
    await prompt.updateComplete;
    expect(seen).toHaveLength(1);
    // No new DOM sibling because onWrite claimed.
    expect(wrap.firstElementChild).toBe(prompt);
  });

  it('ctx.clear removes preceding siblings and closes the slash overlay', async () => {
    const wrap = await fixture<HTMLElement>(html`
      <div>
        <tui-slash-overlay open></tui-slash-overlay>
        <div class="output-row">a</div>
        <div class="output-row">b</div>
        <tui-prompt-input></tui-prompt-input>
      </div>
    `);
    const prompt = wrap.querySelector('tui-prompt-input') as TuiPromptInput;
    const overlay = wrap.querySelector('tui-slash-overlay') as HTMLElement & { open: boolean };
    // Sanity: overlay is mounted at document level for clearScrollback's
    // document.querySelector to find it; move it there.
    document.body.appendChild(overlay);
    overlay.open = true;
    prompt.commands = defineCommands([{ name: 'clear', handler: (_, ctx) => ctx.clear() }]);
    typeInto(prompt, 'clear');
    pressEnter(prompt);
    await prompt.updateComplete;
    expect(wrap.querySelectorAll('.output-row').length).toBe(0);
    expect(overlay.open).toBe(false);
    overlay.remove();
  });

  it('ctx.history.all returns submitted commands', async () => {
    const { prompt } = await withFixture();
    prompt.id = 'history-test-1';
    let seen: string[] = [];
    prompt.commands = defineCommands([
      {
        name: 'log',
        handler: (_, ctx) => {
          seen = ctx.history.all();
        },
      },
      { name: 'noop', handler: () => undefined },
    ]);
    typeInto(prompt, 'noop');
    pressEnter(prompt);
    await prompt.updateComplete;
    typeInto(prompt, 'log');
    pressEnter(prompt);
    await prompt.updateComplete;
    // Newest first
    expect(seen[0]).toBe('log');
    expect(seen[1]).toBe('noop');
  });

  it('renders an inline argument hint after a space when a completion matches', async () => {
    const { prompt } = await withFixture();
    prompt.commands = defineCommands([
      {
        name: 'theme',
        handler: () => undefined,
        completions: (cur) => ['light', 'dark', 'system'].filter((c) => c.startsWith(cur)),
      },
    ]);
    typeInto(prompt, 'theme d');
    await prompt.updateComplete;
    // refreshHint is async — let it settle.
    await new Promise<void>((r) => queueMicrotask(() => r()));
    await prompt.updateComplete;
    const hint = prompt.shadowRoot?.querySelector('[part~="hint"]');
    expect(hint?.textContent).toContain('ark');
  });

  it('does not render an argument hint without a space (command-name region)', async () => {
    const { prompt } = await withFixture();
    prompt.commands = defineCommands([{ name: 'theme', handler: () => undefined }]);
    typeInto(prompt, 'the');
    await prompt.updateComplete;
    await new Promise<void>((r) => queueMicrotask(() => r()));
    await prompt.updateComplete;
    expect(prompt.shadowRoot?.querySelector('[part~="hint"]')).toBeNull();
  });

  it('ctx.history.clear empties the recall buffer', async () => {
    const { prompt } = await withFixture();
    prompt.id = 'history-test-2';
    prompt.commands = defineCommands([
      { name: 'noop', handler: () => undefined },
      { name: 'wipe', handler: (_, ctx) => ctx.history.clear() },
    ]);
    typeInto(prompt, 'noop');
    pressEnter(prompt);
    await prompt.updateComplete;
    typeInto(prompt, 'wipe');
    pressEnter(prompt);
    await prompt.updateComplete;
    // ArrowUp should not recall anything.
    pressKey(prompt, 'ArrowUp');
    await prompt.updateComplete;
    const input = prompt.shadowRoot?.querySelector<HTMLInputElement>('input');
    expect(input?.value ?? '').toBe('');
  });
});
