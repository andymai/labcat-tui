'use client';

import { TuiTodoList as TuiTodoListElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const TodoList = createComponent({
  tagName: 'tui-todo-list',
  elementClass: TuiTodoListElement,
  react: React,
});
