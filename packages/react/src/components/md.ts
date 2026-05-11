'use client';

import { TuiMd as TuiMdElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const Md = createComponent({
  tagName: 'tui-md',
  elementClass: TuiMdElement,
  react: React,
});
