'use client';

import { TuiSpinner as TuiSpinnerElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const Spinner = createComponent({
  tagName: 'tui-spinner',
  elementClass: TuiSpinnerElement,
  react: React,
});
