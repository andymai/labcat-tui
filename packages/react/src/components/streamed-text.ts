'use client';

import { TuiStreamedText as TuiStreamedTextElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const StreamedText = createComponent({
  tagName: 'tui-streamed-text',
  elementClass: TuiStreamedTextElement,
  react: React,
  events: {
    onStreamStart: 'tui-stream-start',
    onStreamComplete: 'tui-stream-complete',
    onStreamInterrupt: 'tui-stream-interrupt',
  },
});
