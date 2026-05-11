import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './status-line.js';
import type { StatusSegment, TuiStatusLine } from './status-line.js';

describe('<tui-status-line>', () => {
  it('sets role="status" by default', async () => {
    const el = await fixture<TuiStatusLine>(html`<tui-status-line></tui-status-line>`);
    expect(el.getAttribute('role')).toBe('status');
  });

  it('renders the breadcrumb when set', async () => {
    const el = await fixture<TuiStatusLine>(
      html`<tui-status-line breadcrumb="~/posts"></tui-status-line>`,
    );
    const crumb = el.shadowRoot?.querySelector('[part~="breadcrumb"]');
    expect(crumb?.textContent).toBe('~/posts');
  });

  it('renders each segment with the configured aria-live', async () => {
    const el = await fixture<TuiStatusLine>(html`<tui-status-line></tui-status-line>`);
    const segments: StatusSegment[] = [
      { label: 'labcat.dev' },
      { label: 'home lab ● up', live: 'polite' },
    ];
    el.segments = segments;
    await el.updateComplete;
    const rendered = Array.from(el.shadowRoot?.querySelectorAll('[part~="segment"]') ?? []);
    expect(rendered).toHaveLength(2);
    expect(rendered[0]?.getAttribute('aria-live')).toBe('off');
    expect(rendered[1]?.getAttribute('aria-live')).toBe('polite');
  });

  it('renders separators between segments only', async () => {
    const el = await fixture<TuiStatusLine>(html`<tui-status-line></tui-status-line>`);
    el.segments = [{ label: 'a' }, { label: 'b' }, { label: 'c' }];
    await el.updateComplete;
    const seps = el.shadowRoot?.querySelectorAll('[part~="separator"]') ?? [];
    expect(seps.length).toBe(2);
  });

  it('reflects kind="fixed" as an attribute', async () => {
    const el = await fixture<TuiStatusLine>(html`<tui-status-line kind="fixed"></tui-status-line>`);
    expect(el.getAttribute('kind')).toBe('fixed');
  });
});
