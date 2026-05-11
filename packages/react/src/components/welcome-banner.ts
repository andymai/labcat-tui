'use client';

import { TuiWelcomeBanner as TuiWelcomeBannerElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const WelcomeBanner = createComponent({
  tagName: 'tui-welcome-banner',
  elementClass: TuiWelcomeBannerElement,
  react: React,
});
