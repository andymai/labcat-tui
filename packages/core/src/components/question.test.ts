import { fixture, html } from '@open-wc/testing-helpers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import './question.js';
import type { TuiQuestionSelectDetail } from '../events/types.js';
import type { TuiQuestion, TuiQuestionOption } from './question.js';

const sampleOptions: TuiQuestionOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
];

async function build(extra: Partial<TuiQuestion> = {}): Promise<TuiQuestion> {
  const el = await fixture<TuiQuestion>(html`<tui-question></tui-question>`);
  el.options = (extra.options as TuiQuestionOption[]) ?? sampleOptions;
  if (extra.question != null) el.question = extra.question;
  if (extra.selected != null) el.selected = extra.selected;
  if (extra.multi != null) el.multi = extra.multi;
  await el.updateComplete;
  return el;
}

function press(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('<tui-question>', () => {
  afterEach(() => {
    for (const q of document.querySelectorAll('tui-question')) q.remove();
  });

  it('renders one option per entry and marks the selected one', async () => {
    const el = await build({ selected: 1 });
    const items = el.shadowRoot?.querySelectorAll('[role="option"]');
    expect(items).toHaveLength(3);
    expect(items?.[1]?.getAttribute('aria-selected')).toBe('true');
    expect(items?.[0]?.getAttribute('aria-selected')).toBe('false');
  });

  it('renders the question text in the question slot', async () => {
    const el = await build({ question: 'Pick one' });
    expect(el.shadowRoot?.querySelector('[part="question"]')?.textContent).toBe('Pick one');
  });

  it('ArrowDown moves selection down, clamped at last option', async () => {
    const el = await build();
    expect(el.selected).toBe(0);
    press(el, 'ArrowDown');
    expect(el.selected).toBe(1);
    press(el, 'ArrowDown');
    press(el, 'ArrowDown');
    expect(el.selected).toBe(2);
  });

  it('ArrowUp moves selection up, clamped at zero', async () => {
    const el = await build({ selected: 1 });
    press(el, 'ArrowUp');
    expect(el.selected).toBe(0);
    press(el, 'ArrowUp');
    expect(el.selected).toBe(0);
  });

  it('vim-style j/k keys also move selection', async () => {
    const el = await build();
    press(el, 'j');
    expect(el.selected).toBe(1);
    press(el, 'k');
    expect(el.selected).toBe(0);
  });

  it('Home / End jump to first / last option', async () => {
    const el = await build({ selected: 1 });
    press(el, 'End');
    expect(el.selected).toBe(2);
    press(el, 'Home');
    expect(el.selected).toBe(0);
  });

  it('Enter commits with the selected value', async () => {
    const el = await build({ selected: 2 });
    const events: TuiQuestionSelectDetail[] = [];
    el.addEventListener('tui-question-select', (e) =>
      events.push((e as CustomEvent<TuiQuestionSelectDetail>).detail),
    );
    press(el, 'Enter');
    expect(events).toHaveLength(1);
    expect(events[0]?.values).toEqual(['c']);
    expect(events[0]?.labels).toEqual(['Charlie']);
    expect(events[0]?.indices).toEqual([2]);
  });

  it('number shortcut jumps and commits in single-select mode', async () => {
    const el = await build();
    const events: TuiQuestionSelectDetail[] = [];
    el.addEventListener('tui-question-select', (e) =>
      events.push((e as CustomEvent<TuiQuestionSelectDetail>).detail),
    );
    press(el, '2');
    expect(el.selected).toBe(1);
    expect(events).toHaveLength(1);
    expect(events[0]?.values).toEqual(['b']);
  });

  it('multi-select: Space toggles and Enter commits all chosen', async () => {
    const el = await build({ multi: true });
    const events: TuiQuestionSelectDetail[] = [];
    el.addEventListener('tui-question-select', (e) =>
      events.push((e as CustomEvent<TuiQuestionSelectDetail>).detail),
    );
    press(el, ' '); // toggle index 0
    press(el, 'ArrowDown');
    press(el, 'ArrowDown');
    press(el, ' '); // toggle index 2
    press(el, 'Enter');
    expect(events).toHaveLength(1);
    expect(events[0]?.values).toEqual(['a', 'c']);
    expect(events[0]?.indices).toEqual([0, 2]);
  });

  it('multi-select: number key toggles instead of committing', async () => {
    const el = await build({ multi: true });
    const events: TuiQuestionSelectDetail[] = [];
    el.addEventListener('tui-question-select', (e) =>
      events.push((e as CustomEvent<TuiQuestionSelectDetail>).detail),
    );
    press(el, '1');
    expect(events).toHaveLength(0); // no commit yet
    press(el, 'Enter');
    expect(events).toHaveLength(1);
    expect(events[0]?.values).toEqual(['a']);
  });

  it('clicking an option commits in single-select mode', async () => {
    const el = await build();
    const events: TuiQuestionSelectDetail[] = [];
    el.addEventListener('tui-question-select', (e) =>
      events.push((e as CustomEvent<TuiQuestionSelectDetail>).detail),
    );
    const item = el.shadowRoot?.querySelectorAll<HTMLElement>('[role="option"]')[1];
    item?.click();
    expect(el.selected).toBe(1);
    expect(events[0]?.values).toEqual(['b']);
  });

  it('does not commit when options are empty', async () => {
    const el = await build({ options: [] });
    const spy = vi.fn();
    el.addEventListener('tui-question-select', spy);
    press(el, 'Enter');
    expect(spy).not.toHaveBeenCalled();
  });

  it('is keyboard-focusable (tabindex=0)', async () => {
    const el = await build();
    expect(el.getAttribute('tabindex')).toBe('0');
  });
});
