import { fixture, html } from '@open-wc/testing-helpers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import './prompt-input.js';
import './session.js';
import './slash-overlay.js';
import type { TuiSession } from './session.js';

function press(key: string, modifiers: KeyboardEventInit = {}): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...modifiers }));
}

describe('<tui-session>', () => {
  afterEach(() => {
    for (const s of document.querySelectorAll('tui-session')) s.remove();
  });

  it('uses Light DOM and adds the tui-session class', async () => {
    const el = await fixture<TuiSession>(html`<tui-session></tui-session>`);
    expect(el.shadowRoot).toBeNull();
    expect(el.classList.contains('tui-session')).toBe(true);
  });

  it('opens <tui-slash-overlay> when "/" is pressed', async () => {
    const el = await fixture<TuiSession>(html`
      <tui-session>
        <tui-slash-overlay></tui-slash-overlay>
        <tui-prompt-input></tui-prompt-input>
      </tui-session>
    `);
    const overlay = el.querySelector('tui-slash-overlay');
    if (!overlay) throw new Error('expected tui-slash-overlay');
    expect((overlay as HTMLElement & { open?: boolean }).open).toBe(false);
    press('/');
    expect((overlay as HTMLElement & { open?: boolean }).open).toBe(true);
  });

  it('falls back to focusing <tui-prompt-input> on "/" when no overlay is present', async () => {
    const el = await fixture<TuiSession>(html`
      <tui-session>
        <tui-prompt-input></tui-prompt-input>
      </tui-session>
    `);
    const input = el.querySelector('tui-prompt-input');
    if (!input) throw new Error('expected tui-prompt-input');
    const focusSpy = vi.spyOn(input as HTMLElement, 'focus');
    press('/');
    expect(focusSpy).toHaveBeenCalled();
  });

  it('opens <tui-slash-overlay> on Cmd-K', async () => {
    const el = await fixture<TuiSession>(html`
      <tui-session>
        <tui-slash-overlay></tui-slash-overlay>
      </tui-session>
    `);
    const overlay = el.querySelector('tui-slash-overlay');
    if (!overlay) throw new Error('expected tui-slash-overlay');
    expect((overlay as HTMLElement & { open?: boolean }).open).toBe(false);
    press('k', { metaKey: true });
    expect((overlay as HTMLElement & { open?: boolean }).open).toBe(true);
  });

  it('closes an open overlay on Escape', async () => {
    const el = await fixture<TuiSession>(html`
      <tui-session>
        <tui-slash-overlay open></tui-slash-overlay>
      </tui-session>
    `);
    const overlay = el.querySelector('tui-slash-overlay');
    if (!overlay) throw new Error('expected tui-slash-overlay');
    expect((overlay as HTMLElement & { open?: boolean }).open).toBe(true);
    press('Escape');
    expect((overlay as HTMLElement & { open?: boolean }).open).toBe(false);
  });

  it('last-mounted wins shortcut routing across multiple sessions', async () => {
    const first = await fixture<TuiSession>(html`
      <tui-session>
        <tui-prompt-input></tui-prompt-input>
      </tui-session>
    `);
    const firstInput = first.querySelector('tui-prompt-input');
    if (!firstInput) throw new Error('expected first tui-prompt-input');
    const firstSpy = vi.spyOn(firstInput as HTMLElement, 'focus');

    const second = await fixture<TuiSession>(html`
      <tui-session>
        <tui-prompt-input></tui-prompt-input>
      </tui-session>
    `);
    const secondInput = second.querySelector('tui-prompt-input');
    if (!secondInput) throw new Error('expected second tui-prompt-input');
    const secondSpy = vi.spyOn(secondInput as HTMLElement, 'focus');

    press('/');

    expect(firstSpy).not.toHaveBeenCalled();
    expect(secondSpy).toHaveBeenCalled();
  });

  it('exposes the active mode color as --tui-active-mode-color on the host', async () => {
    const el = await fixture<TuiSession>(html`<tui-session mode="autoAccept"></tui-session>`);
    expect(el.style.getPropertyValue('--tui-active-mode-color').trim()).toBe(
      'var(--tui-mode-auto-accept)',
    );

    el.mode = 'planMode';
    expect(el.style.getPropertyValue('--tui-active-mode-color').trim()).toBe(
      'var(--tui-mode-plan-mode)',
    );

    el.mode = null;
    expect(el.style.getPropertyValue('--tui-active-mode-color').trim()).toBe('');
  });

  it('writes --tui-active-mode-color when nested with a prompt-input', async () => {
    // The prompt-input's CSS reads `var(--tui-active-mode-color, …)` from the
    // cascade; verifying the cascade resolution through getComputedStyle is
    // unreliable in the test env (browser quirks around inline-set custom
    // properties), so we test the contract from the writer side instead.
    const el = await fixture<TuiSession>(html`
      <tui-session mode="planMode">
        <tui-prompt-input></tui-prompt-input>
      </tui-session>
    `);
    expect(el.style.getPropertyValue('--tui-active-mode-color').trim()).toBe(
      'var(--tui-mode-plan-mode)',
    );
    const prompt = el.querySelector('tui-prompt-input');
    expect(prompt?.hasAttribute('mode')).toBe(false);
  });

  it('child mode attribute reflects independently of the parent session mode', async () => {
    const el = await fixture<TuiSession>(html`
      <tui-session mode="planMode">
        <tui-prompt-input mode="autoAccept"></tui-prompt-input>
      </tui-session>
    `);
    expect(el.style.getPropertyValue('--tui-active-mode-color').trim()).toBe(
      'var(--tui-mode-plan-mode)',
    );
    const prompt = el.querySelector('tui-prompt-input') as HTMLElement;
    expect(prompt.getAttribute('mode')).toBe('autoAccept');
  });

  it('warns and ignores an unknown session mode in dev', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const el = await fixture<TuiSession>(html`<tui-session mode="bogus"></tui-session>`);
    expect(warn).toHaveBeenCalled();
    expect(el.style.getPropertyValue('--tui-active-mode-color').trim()).toBe('');
    warn.mockRestore();
  });

  it('ignores subtrees marked with the ignore-shortcuts attribute', async () => {
    const el = await fixture<TuiSession>(html`
      <tui-session>
        <div ignore-shortcuts>
          <tui-prompt-input id="opted-out"></tui-prompt-input>
        </div>
      </tui-session>
    `);
    const input = el.querySelector('#opted-out') as HTMLElement;
    const focusSpy = vi.spyOn(input, 'focus');
    // Simulate the key event coming from INSIDE the opted-out subtree.
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }));
    expect(focusSpy).not.toHaveBeenCalled();
  });
});

describe('<tui-session> store', () => {
  afterEach(() => {
    for (const s of document.querySelectorAll('tui-session')) s.remove();
  });

  it('register/read returns the latest computed value', async () => {
    const el = await fixture<TuiSession>(html`<tui-session></tui-session>`);
    let counter = 0;
    el.store.register('counter', () => ++counter);
    expect(el.store.read<number>('counter')).toBe(1);
    expect(el.store.read<number>('counter')).toBe(2);
  });

  it('unregister stops the provider', async () => {
    const el = await fixture<TuiSession>(html`<tui-session></tui-session>`);
    const off = el.store.register('x', () => 'hello');
    expect(el.store.has('x')).toBe(true);
    off();
    expect(el.store.has('x')).toBe(false);
    expect(el.store.read<string>('x')).toBeUndefined();
  });

  it('unregister is a no-op after the provider was replaced', async () => {
    const el = await fixture<TuiSession>(html`<tui-session></tui-session>`);
    const off = el.store.register('x', () => 'first');
    el.store.register('x', () => 'second');
    off();
    expect(el.store.read<string>('x')).toBe('second');
  });

  it('keys() returns the registered keys', async () => {
    const el = await fixture<TuiSession>(html`<tui-session></tui-session>`);
    el.store.register('a', () => 1);
    el.store.register('b', () => 2);
    expect(el.store.keys().sort()).toEqual(['a', 'b']);
  });
});
