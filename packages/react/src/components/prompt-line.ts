'use client';

import { TuiPromptLine as TuiPromptLineElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const PromptLine = createComponent({
  tagName: 'tui-prompt-line',
  elementClass: TuiPromptLineElement,
  react: React,
});
