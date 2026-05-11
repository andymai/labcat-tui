'use client';

import { TuiPromptInput as TuiPromptInputElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const PromptInput = createComponent({
  tagName: 'tui-prompt-input',
  elementClass: TuiPromptInputElement,
  react: React,
  events: {
    onCommand: 'tui-command',
    onCommandSuccess: 'tui-command-success',
    onCommandError: 'tui-command-error',
    onTuiNavigate: 'tui-navigate',
  },
});
