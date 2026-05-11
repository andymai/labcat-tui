'use client';

import { TuiChatBubble as TuiChatBubbleElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const ChatBubble = createComponent({
  tagName: 'tui-chat-bubble',
  elementClass: TuiChatBubbleElement,
  react: React,
});
