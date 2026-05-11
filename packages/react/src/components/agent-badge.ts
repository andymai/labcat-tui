'use client';

import { TuiAgentBadge as TuiAgentBadgeElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const AgentBadge = createComponent({
  tagName: 'tui-agent-badge',
  elementClass: TuiAgentBadgeElement,
  react: React,
});
