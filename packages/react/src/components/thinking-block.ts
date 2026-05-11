'use client';

import { TuiThinkingBlock as TuiThinkingBlockElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const ThinkingBlock = createComponent({
  tagName: 'tui-thinking-block',
  elementClass: TuiThinkingBlockElement,
  react: React,
  events: {
    onToggle: 'toggle',
  },
});
