import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import { defineCommands } from '../commands/registry.js';
import './slash-overlay.js';
import type { TuiSlashOverlay } from './slash-overlay.js';

describe('<tui-slash-overlay>', () => {
  it('starts closed and sets aria-modal', async () => {
    const el = await fixture<TuiSlashOverlay>(html`<tui-slash-overlay></tui-slash-overlay>`);
    expect(el.open).toBe(false);
    expect(el.getAttribute('aria-modal')).toBe('true');
    expect(el.getAttribute('role')).toBe('dialog');
  });

  it('renders all commands when opened with no query', async () => {
    const el = await fixture<TuiSlashOverlay>(html`<tui-slash-overlay open></tui-slash-overlay>`);
    el.commands = defineCommands([
      { name: 'posts', route: '/posts/' },
      { name: 'help', description: 'show help', handler: () => undefined },
    ]);
    await el.updateComplete;
    const items = el.shadowRoot?.querySelectorAll('[part~="item"]');
    expect(items).toHaveLength(2);
  });

  it('fires tui-slash-select with the picked command name and closes', async () => {
    const events: CustomEvent[] = [];
    const el = await fixture<TuiSlashOverlay>(html`<tui-slash-overlay open></tui-slash-overlay>`);
    el.commands = defineCommands([{ name: 'posts', route: '/posts/' }]);
    el.addEventListener('tui-slash-select', (e) => events.push(e as CustomEvent));
    await el.updateComplete;
    const item = el.shadowRoot?.querySelector<HTMLElement>('[part~="item"]');
    item?.click();
    await el.updateComplete;
    expect(events).toHaveLength(1);
    expect(events[0]?.detail).toEqual({ command: 'posts' });
    expect(el.open).toBe(false);
  });

  it('fires tui-slash-dismiss when the backdrop is clicked', async () => {
    const events: Event[] = [];
    const el = await fixture<TuiSlashOverlay>(html`<tui-slash-overlay open></tui-slash-overlay>`);
    el.addEventListener('tui-slash-dismiss', (e) => events.push(e));
    await el.updateComplete;
    const backdrop = el.shadowRoot?.querySelector<HTMLElement>('[part~="backdrop"]');
    backdrop?.click();
    await el.updateComplete;
    expect(events).toHaveLength(1);
    expect(el.open).toBe(false);
  });

  it('ArrowDown / ArrowUp move the selection and Enter picks the highlighted command', async () => {
    const events: CustomEvent[] = [];
    const el = await fixture<TuiSlashOverlay>(html`<tui-slash-overlay open></tui-slash-overlay>`);
    el.commands = defineCommands([
      { name: 'one', route: '/one/' },
      { name: 'two', route: '/two/' },
      { name: 'three', route: '/three/' },
    ]);
    el.addEventListener('tui-slash-select', (e) => events.push(e as CustomEvent));
    await el.updateComplete;

    const panel = el.shadowRoot?.querySelector('.panel');
    if (!panel) throw new Error('expected .panel');

    // ArrowDown twice → third item selected.
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await el.updateComplete;

    // Enter picks the highlighted command.
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(events).toHaveLength(1);
    expect(events[0]?.detail).toEqual({ command: 'three' });
  });

  it('Escape closes the overlay and emits tui-slash-dismiss', async () => {
    const events: Event[] = [];
    const el = await fixture<TuiSlashOverlay>(html`<tui-slash-overlay open></tui-slash-overlay>`);
    el.addEventListener('tui-slash-dismiss', (e) => events.push(e));
    await el.updateComplete;
    const panel = el.shadowRoot?.querySelector('.panel');
    panel?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await el.updateComplete;
    expect(events).toHaveLength(1);
    expect(el.open).toBe(false);
  });

  it('filters by query (case-insensitive)', async () => {
    const el = await fixture<TuiSlashOverlay>(html`<tui-slash-overlay open></tui-slash-overlay>`);
    el.commands = defineCommands([
      { name: 'posts', route: '/posts/' },
      { name: 'help', description: 'show help', handler: () => undefined },
    ]);
    await el.updateComplete;
    const input = el.shadowRoot?.querySelector<HTMLInputElement>('input');
    if (!input) throw new Error('expected internal input');
    input.value = 'HELP';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await el.updateComplete;
    const items = el.shadowRoot?.querySelectorAll('[part~="item"]');
    expect(items).toHaveLength(1);
    expect(items?.[0]?.textContent).toContain('help');
  });
});
