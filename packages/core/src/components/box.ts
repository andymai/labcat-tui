import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type BoxKind = 'rounded' | 'sharp';

/**
 * `<tui-box>` — Box frame with rounded or sharp corners.
 *
 * @attr {"rounded"|"sharp"} kind - Corner style
 * @attr {string} title - Optional title rendered in the top chrome
 * @slot - Body content
 * @csspart chrome - The frame border container
 * @csspart title - The title row
 * @csspart body - The body slot wrapper
 */
@customElement('tui-box')
export class TuiBox extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg);
      line-height: var(--tui-leading-body);
    }

    .chrome {
      display: grid;
      grid-template-rows: auto 1fr auto;
      border: 1px solid var(--tui-border);
      border-radius: 0.375rem;
      padding-block: 0.25rem;
      padding-inline: 0.75rem;
    }

    :host([kind='sharp']) .chrome {
      border-radius: 0;
    }

    .title {
      color: var(--tui-fg-muted);
      font-size: 0.875em;
      padding-block-end: 0.25rem;
      border-block-end: 1px solid var(--tui-border);
      margin-block-end: 0.25rem;
    }

    .title:empty,
    .title[hidden] {
      display: none;
    }

    .body {
      min-height: 0;
    }

    .body:empty,
    .body[hidden] {
      display: none;
    }
  `;

  @property({ type: String, reflect: true })
  kind: BoxKind = 'rounded';

  @property({ type: String, reflect: true })
  override title = '';

  @state()
  private hasBody = false;

  private onSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    this.hasBody = nodes.some((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) return true;
      return n.textContent != null && n.textContent.trim().length > 0;
    });
  }

  override render() {
    return html`
      <div class="chrome" part="chrome">
        ${this.title ? html`<div class="title" part="title">${this.title}</div>` : nothing}
        <div class="body" part="body" ?hidden=${!this.hasBody}>
          <slot @slotchange=${this.onSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-box': TuiBox;
  }
}
