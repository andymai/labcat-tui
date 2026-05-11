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
    expect((errors[0]?.detail as { error: Error }).error.message).toBe('kaboom');
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
