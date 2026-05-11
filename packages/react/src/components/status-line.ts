'use client';

import { TuiStatusLine as TuiStatusLineElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const StatusLine = createComponent({
  tagName: 'tui-status-line',
  elementClass: TuiStatusLineElement,
  react: React,
});
