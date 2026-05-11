import { fixture, html } from '@open-wc/testing-helpers';
import { describe, expect, it } from 'vitest';
import './streamed-text.js';
import type { TuiStreamedText } from './streamed-text.js';

describe('<tui-streamed-text>', () => {
  it('mirrors slotted text as per-char spans without mutating light DOM', async () => {
    const el = await fixture<TuiStreamedText>(html`<tui-streamed-text>hi</tui-streamed-text>`);
    await el.updateComplete;
    const chars = el.shadowRoot?.querySelectorAll('[part~="char"]');
    expect(chars).toHaveLength(2);
    expect(chars?.[0]?.textContent).toBe('h');
    expect(chars?.[1]?.textContent).toBe('i');
    expect(el.textContent?.trim()).toBe('hi');
  });

  it('hides the light-DOM slot from assistive tech via aria-hidden', async () => {
    const el = await fixture<TuiStreamedText>(html`<tui-streamed-text>x</tui-streamed-text>`);
    await el.updateComplete;
    const slotWrap = el.shadowRoot?.querySelector('.src');
    expect(slotWrap?.getAttribute('aria-hidden')).toBe('true');
  });

  it('applies increasing animation-delay across chars', async () => {
    const el = await fixture<TuiStreamedText>(
      html`<tui-streamed-text speed="40">abc</tui-streamed-text>`,
    );
    await el.updateComplete;
    const chars = Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>('[part~="char"]') ?? []);
    expect(chars).toHaveLength(3);
    expect(chars[0]?.style.animationDelay).toBe('0ms');
    expect(chars[1]?.style.animationDelay).toBe('40ms');
    expect(chars[2]?.style.animationDelay).toBe('80ms');
  });

  it('derives speed from cps when speed is not set', async () => {
    const el = await fixture<TuiStreamedText>(
      html`<tui-streamed-text cps="50">ab</tui-streamed-text>`,
    );
    await el.updateComplete;
    const chars = Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>('[part~="char"]') ?? []);
    expect(chars[0]?.style.animationDelay).toBe('0ms');
    expect(chars[1]?.style.animationDelay).toBe('20ms');
  });

  it('fires tui-stream-start when the reveal begins', async () => {
    const events: Event[] = [];
    const el = await fixture<TuiStreamedText>(html`<tui-streamed-text>x</tui-streamed-text>`);
    el.addEventListener('tui-stream-start', (e) => events.push(e));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(events).toHaveLength(1);
  });

  it('interrupt() snaps to revealed state and fires tui-stream-interrupt', async () => {
    const events: Event[] = [];
    const el = await fixture<TuiStreamedText>(
      html`<tui-streamed-text speed="9999">slow</tui-streamed-text>`,
    );
    el.addEventListener('tui-stream-interrupt', (e) => events.push(e));
    el.interrupt();
    await el.updateComplete;
    expect(events).toHaveLength(1);
    const chars = Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>('[part~="char"]') ?? []);
    for (const c of chars) {
      expect(c.style.opacity).toBe('1');
    }
  });

  it('interrupt() is a no-op after completion', async () => {
    const events: Event[] = [];
    const el = await fixture<TuiStreamedText>(
      html`<tui-streamed-text speed="9999">x</tui-streamed-text>`,
    );
    el.addEventListener('tui-stream-interrupt', (e) => events.push(e));
    el.interrupt();
    el.interrupt();
    expect(events).toHaveLength(1);
  });

  it('re-mirrors when slot content changes', async () => {
    const el = await fixture<TuiStreamedText>(html`<tui-streamed-text>abc</tui-streamed-text>`);
    await el.updateComplete;
    el.textContent = 'wxyz';
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await el.updateComplete;
    const chars = el.shadowRoot?.querySelectorAll('[part~="char"]');
    expect(chars).toHaveLength(4);
  });
});
