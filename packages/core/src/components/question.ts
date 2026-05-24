import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { TuiQuestionSelectDetail } from '../events/types.js';

export interface TuiQuestionOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * `<tui-question>` — A multi-choice picker that emulates Claude Code's
 * AskUserQuestion tool. Arrow keys navigate, Enter commits, number keys
 * 1–9 jump-and-select. Single-select by default; `multi` enables
 * space-toggle multi-select.
 *
 * @attr {string} question - The question text shown above the options
 * @attr {number} selected - Index of the currently highlighted option
 * @attr {boolean} multi - Multi-select mode (Space toggles, Enter commits)
 * @prop options - Array of `{ value, label, description? }`
 * @fires tui-question-select - `{ values: string[]; labels: string[] }` on Enter
 * @csspart question - The question text wrapper
 * @csspart list - The options listbox
 * @csspart option - Each option row
 * @csspart marker - The leading `▸` arrow on the selected row
 * @csspart shortcut - The leading `1.` / `[x]` cell
 */
@customElement('tui-question')
export class TuiQuestion extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg);
      line-height: var(--tui-leading-body);
      outline: none;
    }

    .question {
      color: var(--tui-fg);
      margin-block-end: 0.5rem;
    }

    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.05rem;
    }

    .option {
      display: grid;
      grid-template-columns: 1ch 3ch auto 1fr;
      align-items: baseline;
      gap: 0.5ch;
      padding-block: 0.05em;
      color: var(--tui-fg-muted);
      cursor: pointer;
    }

    .option[aria-selected='true'] {
      color: var(--tui-fg);
    }

    .marker {
      color: var(--tui-accent);
      text-align: center;
    }

    .shortcut {
      color: var(--tui-fg-dim);
      font-variant-numeric: tabular-nums;
    }

    .label {
      color: inherit;
    }

    .desc {
      color: var(--tui-fg-dim);
      font-size: 0.875em;
      padding-inline-start: 1ch;
    }
  `;

  @property({ type: String, reflect: true })
  question = '';

  @property({ type: Number, reflect: true })
  selected = 0;

  @property({ type: Boolean, reflect: true })
  multi = false;

  // `type: Array` makes Lit JSON-parse the HTML attribute on mount, so MDX
  // / Astro consumers can pass options declaratively as a JSON-encoded
  // attribute. Also still settable as a plain JS array.
  @property({ type: Array })
  options: TuiQuestionOption[] = [];

  @state()
  private chosen = new Set<number>();

  private hasAutoFocused = false;
  private viewObserver: IntersectionObserver | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    if (this.question && !this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', this.question);
    }
    this.addEventListener('keydown', this.onKeyDown);

    // Auto-claim focus when the question scrolls into view, so users can
    // immediately use arrow keys / number shortcuts without first clicking
    // the question. Without this, arrow keys scroll the page because the
    // host's keydown listener only fires when the host has focus.
    //
    // Only claims focus ONCE (hasAutoFocused) and never steals from a real
    // text input — users typing in the prompt-input above the question
    // keep their cursor.
    if (typeof IntersectionObserver !== 'undefined') {
      this.viewObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (
              entry.isIntersecting &&
              entry.intersectionRatio >= 0.6 &&
              !this.hasAutoFocused &&
              this.shouldClaimFocus()
            ) {
              this.focus();
              this.hasAutoFocused = true;
            }
          }
        },
        { threshold: [0, 0.6, 1] },
      );
      this.viewObserver.observe(this);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.onKeyDown);
    this.viewObserver?.disconnect();
    this.viewObserver = null;
  }

  private shouldClaimFocus(): boolean {
    const active = document.activeElement;
    if (active === this) return false;
    if (active instanceof HTMLInputElement) return false;
    if (active instanceof HTMLTextAreaElement) return false;
    // Don't steal from another tui-question or a custom-element input host
    // (e.g., tui-prompt-input wraps its own real input in shadow).
    if (active?.tagName?.startsWith?.('TUI-')) return false;
    return true;
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('selected')) this.clampSelected();
    if (changed.has('options')) this.chosen = new Set();
  }

  private clampSelected(): void {
    const max = this.options.length - 1;
    if (this.selected < 0) this.selected = 0;
    else if (this.selected > max && max >= 0) this.selected = max;
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowDown' || (e.key === 'j' && !e.metaKey && !e.ctrlKey)) {
      e.preventDefault();
      this.selected = Math.min(this.selected + 1, this.options.length - 1);
      return;
    }
    if (e.key === 'ArrowUp' || (e.key === 'k' && !e.metaKey && !e.ctrlKey)) {
      e.preventDefault();
      this.selected = Math.max(0, this.selected - 1);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      this.selected = 0;
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      this.selected = Math.max(0, this.options.length - 1);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      this.commit();
      return;
    }
    if (e.key === ' ' && this.multi) {
      e.preventDefault();
      this.toggle(this.selected);
      return;
    }
    // Number shortcuts 1–9 jump to (and select, in single mode) that option.
    const n = Number.parseInt(e.key, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= Math.min(9, this.options.length)) {
      e.preventDefault();
      this.selected = n - 1;
      if (this.multi) this.toggle(this.selected);
      else this.commit();
    }
  };

  private toggle(index: number): void {
    const next = new Set(this.chosen);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    this.chosen = next;
  }

  private commit(): void {
    if (this.options.length === 0) return;
    const indices = this.multi ? [...this.chosen].sort((a, b) => a - b) : [this.selected];
    const values = indices.map((i) => this.options[i]?.value).filter((v): v is string => v != null);
    const labels = indices.map((i) => this.options[i]?.label).filter((l): l is string => l != null);
    if (values.length === 0) return;
    this.dispatchEvent(
      new CustomEvent<TuiQuestionSelectDetail>('tui-question-select', {
        detail: { values, labels, indices },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    const opts = this.options;
    return html`
      ${
        this.question ? html`<div class="question" part="question">${this.question}</div>` : nothing
      }
      <ul class="list" part="list" role="listbox" aria-activedescendant=${`tui-q-opt-${this.selected}`}>
        ${opts.map((opt, i) => {
          const isSelected = i === this.selected;
          const isChosen = this.chosen.has(i);
          const shortcutText = this.multi ? (isChosen ? '[x]' : '[ ]') : `${i + 1}.`;
          return html`
            <li
              id=${`tui-q-opt-${i}`}
              class="option"
              part="option"
              role="option"
              aria-selected=${isSelected ? 'true' : 'false'}
              @click=${() => {
                this.selected = i;
                if (this.multi) this.toggle(i);
                else this.commit();
              }}
            >
              <span class="marker" part="marker" aria-hidden="true">${isSelected ? '▸' : ' '}</span>
              <span class="shortcut" part="shortcut">${shortcutText}</span>
              <span class="label">${opt.label}</span>
              ${opt.description ? html`<span class="desc">${opt.description}</span>` : nothing}
            </li>
          `;
        })}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-question': TuiQuestion;
  }
}
