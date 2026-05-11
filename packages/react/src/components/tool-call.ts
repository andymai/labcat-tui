'use client';

import { TuiToolCall as TuiToolCallElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const ToolCallCard = createComponent({
  tagName: 'tui-tool-call',
  elementClass: TuiToolCallElement,
  react: React,
});
