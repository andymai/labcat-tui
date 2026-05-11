'use client';

import { TuiTodoItem as TuiTodoItemElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const TodoItem = createComponent({
  tagName: 'tui-todo-item',
  elementClass: TuiTodoItemElement,
  react: React,
  events: {
    onTodoChange: 'tui-todo-change',
  },
});
