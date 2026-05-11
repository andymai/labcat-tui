import { fixture, html } from '@open-wc/testing-helpers';
import { afterEach, describe, expect, it } from 'vitest';
import './prompt-input.js';
import './status-line.js';
import './tool-call.js';
import type { TuiPromptInput } from './prompt-input.js';
import type { TuiStatusLine } from './status-line.js';
import type { TuiToolCall } from './tool-call.js';

async function rtlFixture<T extends HTMLElement>(inner: ReturnType<typeof html>): Promise<T> {
  const wrap = await fixture<HTMLElement>(html`<div dir="rtl">${inner}</div>`);
  const target = wrap.firstElementChild as T;
  if (target instanceof HTMLElement && 'updateComplete' in target) {
    await (target as unknown as { updateComplete: Promise<unknown> }).updateComplete;
  }
  return target;
}

function serializeShadow(el: HTMLElement): string {
  // Lit injects per-render marker ids (?lit$NNNN$); strip them so snapshots are stable.
  return (el.shadowRoot?.innerHTML ?? '')
    .replace(/\?lit\$\d+\$/g, '?lit$$0$$')
    .replace(/\s+/g, ' ')
    .trim();
}

afterEach(() => {
  for (const el of document.querySelectorAll('[dir="rtl"]')) el.remove();
});

describe('RTL — lighthouse components (SPEC §10.5)', () => {
  it('<tui-tool-call> inherits rtl and renders without errors', async () => {
    const el = await rtlFixture<TuiToolCall>(
      html`<tui-tool-call tool="Read" args="src/"></tui-tool-call>`,
    );
    expect(getComputedStyle(el).direction).toBe('rtl');
    expect(serializeShadow(el)).toMatchSnapshot();
  });

  it('<tui-prompt-input> inherits rtl and renders without errors', async () => {
    const el = await rtlFixture<TuiPromptInput>(html`<tui-prompt-input></tui-prompt-input>`);
    expect(getComputedStyle(el).direction).toBe('rtl');
    expect(serializeShadow(el)).toMatchSnapshot();
  });

  it('<tui-status-line> inherits rtl and renders without errors', async () => {
    const el = await rtlFixture<TuiStatusLine>(
      html`<tui-status-line breadcrumb="labcat / posts"></tui-status-line>`,
    );
    expect(getComputedStyle(el).direction).toBe('rtl');
    expect(serializeShadow(el)).toMatchSnapshot();
  });

  it('uses logical CSS properties so layout flips automatically', async () => {
    const el = await rtlFixture<TuiToolCall>(
      html`<tui-tool-call tool="Read" args="src/"><span>body</span></tui-tool-call>`,
    );
    const body = el.shadowRoot?.querySelector('[part~="body"]');
    if (!(body instanceof HTMLElement)) throw new Error('expected body part');
    const styles = getComputedStyle(body);
    // padding-inline-start: 2ch in rtl maps to padding-right.
    expect(styles.paddingRight).not.toBe('0px');
    expect(styles.paddingLeft).toBe('0px');
  });
});
