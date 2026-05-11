'use client';

import { TuiBox as TuiBoxElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const Box = createComponent({
  tagName: 'tui-box',
  elementClass: TuiBoxElement,
  react: React,
});
