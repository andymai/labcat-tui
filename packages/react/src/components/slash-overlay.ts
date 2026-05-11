'use client';

import { TuiSlashOverlay as TuiSlashOverlayElement } from '@labcat/tui';
import { createComponent } from '@lit/react';
import * as React from 'react';

export const SlashOverlay = createComponent({
  tagName: 'tui-slash-overlay',
  elementClass: TuiSlashOverlayElement,
  react: React,
  events: {
    onSlashSelect: 'tui-slash-select',
    onSlashDismiss: 'tui-slash-dismiss',
  },
});
