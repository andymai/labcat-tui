import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type StatusLiveness = 'off' | 'polite' | 'assertive';

export interface StatusSegment {
  label: string;
  live?: StatusLiveness;
}

export type StatusLineKind = 'fixed' | 'inline';

/**
 * `<tui-status-line>` — Status bar with breadcrumb + segments.
 *
 * @attr {string} breadcrumb - Leading breadcrumb text
 * @attr {"fixed"|"inline"} kind - Position behavior
 * @prop segments - Array of `{ label, live?: 'off' | 'polite' | 'assertive' }`
 * @slot - When non-empty, overrides the `segments` rendering
 * @slot left - Extra content rendered before the segments
 * @slot right - Extra content rendered after the segments
 * @csspart segment - A single segment
 * @csspart separator - The visual separator between segments
 * @csspart breadcrumb - The breadcrumb cell
 */
@customElement('tui-status-line')
export class TuiStatusLine extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg-muted);
      line-height: var(--tui-leading-tight);
      font-size: 0.875em;
    }

    :host([kind='fixed']) {
      position: fixed;
      inset-inline: 0;
      inset-block-end: 0;
      background: var(--tui-surface);
      border-block-start: 1px solid var(--tui-border);
      padding-block: 0.25rem;
      padding-inline: 0.75rem;
      z-index: 10;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 0.5ch;
      overflow-x: auto;
      scrollbar-width: thin;
      white-space: nowrap;
    }

    .breadcrumb {
      color: var(--tui-fg);
      padding-inline-end: 0.5ch;
    }

    .breadcrumb:empty,
    .breadcrumb[hidden] {
      display: none;
    }

    .segments {
      display: flex;
      gap: 0.5ch;
      align-items: center;
    }

    .segment {
      color: var(--tui-fg-muted);
    }

    .separator {
      color: var(--tui-fg-dim);
      user-select: none;
    }
  `;

  @property({ type: String, reflect: true })
  breadcrumb = '';

  @property({ type: String, reflect: true })
  kind: StatusLineKind = 'inline';

  @property({ attribute: false })
  segments: StatusSegment[] = [];

  @state()
  private hasDefaultSlot = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'status');
  }

  private onDefaultSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this.hasDefaultSlot = slot
      .assignedNodes({ flatten: true })
      .some((n) =>
        n.nodeType === Node.ELEMENT_NODE
          ? true
          : !!(n.textContent && n.textContent.trim().length > 0),
      );
  }

  override render() {
    return html`
      <div class="row">
        ${
          this.breadcrumb
            ? html`<span class="breadcrumb" part="breadcrumb">${this.breadcrumb}</span>`
            : nothing
        }
        <slot name="left"></slot>
        <div class="segments" ?hidden=${this.hasDefaultSlot}>
          ${this.segments.map((seg, i) => {
            const liveness: StatusLiveness = seg.live ?? 'off';
            return html`
              ${
                i > 0
                  ? html`<span class="separator" part="separator" aria-hidden="true">·</span>`
                  : nothing
              }
              <span class="segment" part="segment" aria-live=${liveness}>${seg.label}</span>
            `;
          })}
        </div>
        <slot @slotchange=${this.onDefaultSlotChange} ?hidden=${!this.hasDefaultSlot}></slot>
        <slot name="right"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-status-line': TuiStatusLine;
  }
}
