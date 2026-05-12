'use client';

import { createComponent } from '@lit/react';
import * as React from 'react';
import { TuiCodeBlock as TuiCodeBlockElement } from '../code-block.js';

export const CodeBlock = createComponent({
  tagName: 'tui-code-block',
  elementClass: TuiCodeBlockElement,
  react: React,
  events: {
    onTuiCodeCopy: 'tui-code-copy',
  },
});
