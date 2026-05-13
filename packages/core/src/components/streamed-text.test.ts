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

  it('fires tui-stream-complete even when the slot is empty', async () => {
    const completes: Event[] = [];
    // Start with non-empty content so the initial slotchange runs and the
    // listener (attached next) doesn't miss it.
    const el = await fixture<TuiStreamedText>(html`<tui-streamed-text>seed</tui-streamed-text>`);
    await el.updateComplete;
    el.addEventListener('tui-stream-complete', (e) => completes.push(e));
    // Now clear the slot — fresh slotchange with empty text.
    el.textContent = '';
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await Promise.resolve();
    await el.updateComplete;
    expect(completes.length).toBeGreaterThanOrEqual(1);
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

describe('<tui-streamed-text mode="token">', () => {
  function readDelays(el: TuiStreamedText): number[] {
    const spans = Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>('[part~="char"]') ?? []);
    return spans.map((s) => Number.parseFloat(s.style.animationDelay) || 0);
  }

  it('produces monotonically non-decreasing per-char delays', async () => {
    const el = await fixture<TuiStreamedText>(
      html`<tui-streamed-text mode="token" speed="40"
        >hello, world. how are you?</tui-streamed-text
      >`,
    );
    await el.updateComplete;
    const delays = readDelays(el);
    expect(delays.length).toBe('hello, world. how are you?'.length);
    for (let i = 1; i < delays.length; i++) {
      // Within-burst gaps are tiny but never go backwards.
      const d = delays[i] as number;
      const prev = delays[i - 1] as number;
      expect(d).toBeGreaterThanOrEqual(prev);
    }
  });

  it('adds an extra pause after sentence punctuation', async () => {
    const el = await fixture<TuiStreamedText>(
      html`<tui-streamed-text mode="token" speed="40">a.b</tui-streamed-text>`,
    );
    await el.updateComplete;
    const [d0, d1, d2] = readDelays(el) as [number, number, number];
    // Gap between `.` (d1) and the next char (d2) must include the sentence
    // pause (≥80ms by the engine constant) PLUS any inter-burst step time.
    expect(d2 - d1).toBeGreaterThan(80);
    // Sanity: first char delay is just `base`.
    expect(d0).toBe(0);
  });

  it('produces deterministic delays for identical input (seeded)', async () => {
    const a = await fixture<TuiStreamedText>(
      html`<tui-streamed-text mode="token" speed="30">deterministic</tui-streamed-text>`,
    );
    const b = await fixture<TuiStreamedText>(
      html`<tui-streamed-text mode="token" speed="30">deterministic</tui-streamed-text>`,
    );
    await a.updateComplete;
    await b.updateComplete;
    expect(readDelays(a)).toEqual(readDelays(b));
  });

  it('character mode (default) still produces uniform step delays', async () => {
    const el = await fixture<TuiStreamedText>(
      html`<tui-streamed-text speed="40">abc</tui-streamed-text>`,
    );
    await el.updateComplete;
    expect(readDelays(el)).toEqual([0, 40, 80]);
  });
});

describe('<tui-streamed-text skippable>', () => {
  it('click on the host interrupts the in-progress stream', async () => {
    const events: Event[] = [];
    const el = await fixture<TuiStreamedText>(
      html`<tui-streamed-text skippable speed="500">hello world</tui-streamed-text>`,
    );
    el.addEventListener('tui-stream-interrupt', (e) => events.push(e));
    await el.updateComplete;
    el.click();
    expect(events).toHaveLength(1);
  });

  it('click is a no-op when skippable is not set', async () => {
    const events: Event[] = [];
    const el = await fixture<TuiStreamedText>(
      html`<tui-streamed-text speed="500">hello</tui-streamed-text>`,
    );
    el.addEventListener('tui-stream-interrupt', (e) => events.push(e));
    await el.updateComplete;
    el.click();
    expect(events).toHaveLength(0);
  });

  it('sets data-completed after interrupt so CSS can drop the pointer cursor', async () => {
    const el = await fixture<TuiStreamedText>(
      html`<tui-streamed-text skippable speed="500">hello</tui-streamed-text>`,
    );
    await el.updateComplete;
    expect(el.hasAttribute('data-completed')).toBe(false);
    el.click();
    expect(el.hasAttribute('data-completed')).toBe(true);
  });
});
