import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type DiffLineKind = 'add' | 'remove' | 'context';

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
}

const MARKER: Record<DiffLineKind, string> = {
  add: '+',
  remove: '-',
  context: ' ',
};

/**
 * `<tui-diff-block>` — Inline diff with add/remove/context line markers.
 *
 * Two ways to supply lines:
 * - Set the `lines` property: `Array<{ kind, text }>`.
 * - Slot child elements with a `data-marker` attribute. `data-marker="+"` →
 *   add, `data-marker="-"` → remove, `data-marker="="` or `" "` (or absent) →
 *   context. The slot is mirrored into shadow DOM with marker glyph + styling;
 *   the original light-DOM children are hidden from assistive tech.
 *
 * @attr {string} tool - Tool label (default `Edit`)
 * @attr {string} args - Args label
 * @prop lines - `Array<{ kind: 'add' | 'remove' | 'context'; text: string }>`
 * @slot - Child elements with `data-marker` are parsed into lines
 * @csspart line - A single line row
 * @csspart marker - The leading marker glyph
 * @csspart text - The line text
 */
@customElement('tui-diff-block')
export class TuiDiffBlock extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg);
      line-height: var(--tui-leading-body);
    }

    .head {
      display: flex;
      gap: 0.5ch;
      align-items: baseline;
      color: var(--tui-fg-muted);
      font-size: 0.875em;
    }

    .tool {
      color: var(--tui-fg);
      font-weight: 600;
    }

    .lines {
      overflow-x: auto;
      white-space: pre;
      padding-block-start: 0.25rem;
    }

    /* The light-DOM slot acts as the source of truth for data-marker mode;
       hide it visually + from AT so only the shadow mirror is announced. */
    .src {
      display: none;
    }

    .line {
      display: flex;
      gap: 0.5ch;
      padding-inline-start: 0.25rem;
    }

    /* Per v0.6 fidelity tokens: use the dimmed background for the whole
       row + the word-level color for the foreground text. Lines without a
       data-word-highlight attribute display the row in the word color. */
    .line[data-kind='add'] {
      color: var(--tui-diff-added-word, var(--tui-success));
      background: var(--tui-diff-added-dimmed, transparent);
    }

    .line[data-kind='remove'] {
      color: var(--tui-diff-removed-word, var(--tui-error));
      background: var(--tui-diff-removed-dimmed, transparent);
    }

    .line[data-kind='context'] {
      color: var(--tui-fg-muted);
    }

    .marker {
      flex: 0 0 1ch;
      user-select: none;
    }

    .text {
      flex: 1 1 auto;
      word-break: keep-all;
    }
  `;

  @property({ type: String, reflect: true })
  tool = 'Edit';

  @property({ type: String, reflect: true })
  args = '';

  @property({ attribute: false })
  lines: DiffLine[] = [];

  @state()
  private slotLines: DiffLine[] | null = null;

  private onSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const els = slot.assignedElements({ flatten: true });
    if (els.length === 0) {
      this.slotLines = null;
      return;
    }
    this.slotLines = els.map((el): DiffLine => {
      const marker = el.getAttribute('data-marker') ?? ' ';
      const kind: DiffLineKind = marker === '+' ? 'add' : marker === '-' ? 'remove' : 'context';
      return { kind, text: el.textContent ?? '' };
    });
  }

  override render() {
    const lines = this.slotLines ?? this.lines;
    return html`
      <div class="head">
        <span class="tool">${this.tool}</span>
        ${this.args ? html`<span class="args">${this.args}</span>` : nothing}
      </div>
      <div class="lines">
        ${lines.map(
          (line) => html`
            <div class="line" part="line" data-kind=${line.kind}>
              <span class="marker" part="marker" aria-hidden="true">${MARKER[line.kind]}</span>
              <span class="text" part="text">${line.text}</span>
            </div>
          `,
        )}
      </div>
      <span class="src" aria-hidden="true">
        <slot @slotchange=${this.onSlotChange}></slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-diff-block': TuiDiffBlock;
  }
}
