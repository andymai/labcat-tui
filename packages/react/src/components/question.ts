'use client';

import { TuiQuestion as TuiQuestionElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const Question = createComponent({
  tagName: 'tui-question',
  elementClass: TuiQuestionElement,
  react: React,
  events: {
    onQuestionSelect: 'tui-question-select',
  },
});
