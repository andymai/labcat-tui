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

  it('announces "Pending" for pending status', async () => {
    const el = await fixture<TuiTodoItem>(html`<tui-todo-item status="pending">x</tui-todo-item>`);
    const sr = el.shadowRoot?.querySelector('.sr-only');
    expect(sr?.textContent?.trim()).toBe('Pending:');
  });

  it('announces "In progress" for in-progress status', async () => {
    const el = await fixture<TuiTodoItem>(
      html`<tui-todo-item status="in-progress">x</tui-todo-item>`,
    );
    const sr = el.shadowRoot?.querySelector('.sr-only');
    expect(sr?.textContent?.trim()).toBe('In progress:');
  });

  it('announces "Completed" for completed status', async () => {
    const el = await fixture<TuiTodoItem>(
      html`<tui-todo-item status="completed">x</tui-todo-item>`,
    );
    const sr = el.shadowRoot?.querySelector('.sr-only');
    expect(sr?.textContent?.trim()).toBe('Completed:');
  });

  it('does not set aria-checked (invalid on role=listitem)', async () => {
    const el = await fixture<TuiTodoItem>(
      html`<tui-todo-item status="completed">x</tui-todo-item>`,
    );
    expect(el.hasAttribute('aria-checked')).toBe(false);
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
