import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './todo-item.js';
import type { TuiTodoItem } from './todo-item.js';

describe('<tui-todo-item>', () => {
  it('defaults to status="pending"', async () => {
    const el = await fixture<TuiTodoItem>(html`<tui-todo-item>x</tui-todo-item>`);
    expect(el.status).toBe('pending');
  });

  it('sets role="listitem"', async () => {
    const el = await fixture<TuiTodoItem>(html`<tui-todo-item>x</tui-todo-item>`);
    expect(el.getAttribute('role')).toBe('listitem');
  });

  it('maps status="pending" → aria-checked="false"', async () => {
    const el = await fixture<TuiTodoItem>(html`<tui-todo-item status="pending">x</tui-todo-item>`);
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('maps status="in-progress" → aria-checked="mixed"', async () => {
    const el = await fixture<TuiTodoItem>(
      html`<tui-todo-item status="in-progress">x</tui-todo-item>`,
    );
    expect(el.getAttribute('aria-checked')).toBe('mixed');
  });

  it('maps status="completed" → aria-checked="true"', async () => {
    const el = await fixture<TuiTodoItem>(
      html`<tui-todo-item status="completed">x</tui-todo-item>`,
    );
    expect(el.getAttribute('aria-checked')).toBe('true');
  });

  it('fires tui-todo-change with previousStatus when status changes', async () => {
    const el = await fixture<TuiTodoItem>(html`<tui-todo-item status="pending">x</tui-todo-item>`);
    const events: CustomEvent[] = [];
    el.addEventListener('tui-todo-change', (e) => events.push(e as CustomEvent));

    el.status = 'in-progress';
    await el.updateComplete;

    expect(events).toHaveLength(1);
    expect(events[0]?.detail).toEqual({ status: 'in-progress', previousStatus: 'pending' });
  });

  it('renders the dot glyph for the current status', async () => {
    const el = await fixture<TuiTodoItem>(
      html`<tui-todo-item status="completed">done</tui-todo-item>`,
    );
    const dot = el.shadowRoot?.querySelector('[part~="dot"]');
    expect(dot?.textContent).toBe('☑');
  });
});
