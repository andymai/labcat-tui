'use client';

import { TuiDiffBlock as TuiDiffBlockElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const DiffBlock = createComponent({
  tagName: 'tui-diff-block',
  elementClass: TuiDiffBlockElement,
  react: React,
});
