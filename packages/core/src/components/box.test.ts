import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './box.js';
import type { TuiBox } from './box.js';

describe('<tui-box>', () => {
  it('defaults to kind="rounded"', async () => {
    const el = await fixture<TuiBox>(html`<tui-box></tui-box>`);
    expect(el.kind).toBe('rounded');
  });

  it('reflects kind="sharp" as an attribute for CSS hooks', async () => {
    const el = await fixture<TuiBox>(html`<tui-box kind="sharp"></tui-box>`);
    expect(el.getAttribute('kind')).toBe('sharp');
  });

  it('renders the title in the chrome', async () => {
    const el = await fixture<TuiBox>(html`<tui-box title="header"></tui-box>`);
    const title = el.shadowRoot?.querySelector('[part~="title"]');
    expect(title?.textContent).toBe('header');
  });

  it('omits the title row when no title is set', async () => {
    const el = await fixture<TuiBox>(html`<tui-box></tui-box>`);
    const title = el.shadowRoot?.querySelector('[part~="title"]');
    expect(title).toBeNull();
  });

  it('hides the body part when there is no slotted content', async () => {
    const el = await fixture<TuiBox>(html`<tui-box></tui-box>`);
    const body = el.shadowRoot?.querySelector<HTMLElement>('[part~="body"]');
    expect(body?.hidden).toBe(true);
  });

  it('shows the body part when content is slotted', async () => {
    const el = await fixture<TuiBox>(html`<tui-box><p>hi</p></tui-box>`);
    await el.updateComplete;
    const body = el.shadowRoot?.querySelector<HTMLElement>('[part~="body"]');
    expect(body?.hidden).toBe(false);
  });
});
