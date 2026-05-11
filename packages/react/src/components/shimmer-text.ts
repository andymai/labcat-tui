'use client';

import { TuiShimmerText as TuiShimmerTextElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const ShimmerText = createComponent({
  tagName: 'tui-shimmer-text',
  elementClass: TuiShimmerTextElement,
  react: React,
});
