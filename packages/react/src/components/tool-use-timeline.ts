'use client';

import { TuiToolUseTimeline as TuiToolUseTimelineElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const ToolUseTimeline = createComponent({
  tagName: 'tui-tool-use-timeline',
  elementClass: TuiToolUseTimelineElement,
  react: React,
});
