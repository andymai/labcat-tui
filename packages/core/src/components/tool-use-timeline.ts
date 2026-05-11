import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * `<tui-tool-use-timeline>` — Vertical timeline of slotted tool-call cards.
 *
 * @slot - `<tui-tool-call>` (or any) elements
 * @csspart connector - The vertical line linking entries
 * @csspart dot - The marker rendered alongside each slotted item
 */
@customElement('tui-tool-use-timeline')
export class TuiToolUseTimeline extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg);
      position: relative;
    }

    .stack {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-inline-start: 1.25rem;
    }

    .stack::before {
      content: '';
      position: absolute;
      inset-block: 0.25rem;
      inset-inline-start: 0.4rem;
      inline-size: 1px;
      background: var(--tui-border);
    }

    ::slotted(*) {
      position: relative;
    }

    ::slotted(*)::before {
      content: '●';
      position: absolute;
      inset-inline-start: -1.1rem;
      inset-block-start: 0;
      color: var(--tui-accent);
      line-height: 1;
    }
  `;

  override render() {
    return html`
      <span part="connector" aria-hidden="true"></span>
      <div class="stack">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-tool-use-timeline': TuiToolUseTimeline;
  }
}
