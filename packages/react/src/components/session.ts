'use client';

import { TuiSession as TuiSessionElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const Session = createComponent({
  tagName: 'tui-session',
  elementClass: TuiSessionElement,
  react: React,
});
