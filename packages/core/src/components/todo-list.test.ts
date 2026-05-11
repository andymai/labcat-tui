import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './todo-list.js';
import './todo-item.js';
import type { TuiTodoList } from './todo-list.js';

describe('<tui-todo-list>', () => {
  it('sets role="list"', async () => {
    const el = await fixture<TuiTodoList>(html`<tui-todo-list></tui-todo-list>`);
    expect(el.getAttribute('role')).toBe('list');
  });

  it('reflects kind="grouped" as an attribute', async () => {
    const el = await fixture<TuiTodoList>(html`<tui-todo-list kind="grouped"></tui-todo-list>`);
    expect(el.getAttribute('kind')).toBe('grouped');
  });

  it('slots todo items without aggregating them', async () => {
    const el = await fixture<TuiTodoList>(html`
      <tui-todo-list>
        <tui-todo-item status="pending">one</tui-todo-item>
        <tui-todo-item status="completed">two</tui-todo-item>
      </tui-todo-list>
    `);
    const items = el.querySelectorAll('tui-todo-item');
    expect(items).toHaveLength(2);
  });
});
