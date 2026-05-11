'use client';

import { TuiThemeProvider as TuiThemeProviderElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const ThemeProvider = createComponent({
  tagName: 'tui-theme-provider',
  elementClass: TuiThemeProviderElement,
  react: React,
  events: {
    onThemeChange: 'tui-theme-change',
  },
});
