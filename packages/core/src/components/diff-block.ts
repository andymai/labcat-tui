import { LitElement, css, html, nothing } from 'lit';
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
 * @attr {string} tool - Tool label (default `Edit`)
 * @attr {string} args - Args label
 * @prop lines - `Array<{ kind: 'add' | 'remove' | 'context'; text: string }>`
 * @slot - Pre-rendered HTML alternative to `lines`
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

    .line {
      display: flex;
      gap: 0.5ch;
      padding-inline-start: 0.25rem;
    }

    .line[data-kind='add'] {
      color: var(--tui-success);
    }

    .line[data-kind='remove'] {
      color: var(--tui-error);
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
  private hasSlot = false;

  private onSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this.hasSlot = slot
      .assignedNodes({ flatten: true })
      .some((n) =>
        n.nodeType === Node.ELEMENT_NODE
          ? true
          : !!(n.textContent && n.textContent.trim().length > 0),
      );
  }

  override render() {
    return html`
      <div class="head">
        <span class="tool">${this.tool}</span>
        ${this.args ? html`<span class="args">${this.args}</span>` : nothing}
      </div>
      <div class="lines">
        ${
          this.hasSlot
            ? nothing
            : this.lines.map(
                (line) => html`
                <div class="line" part="line" data-kind=${line.kind}>
                  <span class="marker" part="marker" aria-hidden="true">${MARKER[line.kind]}</span>
                  <span class="text" part="text">${line.text}</span>
                </div>
              `,
              )
        }
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-diff-block': TuiDiffBlock;
  }
}
