import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<tui-thinking-block>` — Collapsible aside built on native `<details>`.
 *
 * @attr {boolean} open - Whether the body is expanded
 * @attr {string} label - Summary text (default `Thinking…`)
 * @slot - Body content (visible when open)
 * @slot summary - Override the summary content
 * @csspart summary - The clickable summary row
 * @csspart body - The body content wrapper
 */
@customElement('tui-thinking-block')
export class TuiThinkingBlock extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg-muted);
      line-height: var(--tui-leading-body);
    }

    details {
      border-inline-start: 2px solid var(--tui-border);
      padding-inline-start: 0.75rem;
    }

    summary {
      cursor: pointer;
      color: var(--tui-fg-muted);
      list-style: none;
      user-select: none;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary::before {
      content: '▸';
      display: inline-block;
      inline-size: 1.25ch;
      color: var(--tui-fg-dim);
    }

    details[open] summary::before {
      content: '▾';
    }

    .body {
      padding-block-start: 0.25rem;
      color: var(--tui-fg-muted);
    }

    @media (prefers-reduced-motion: reduce) {
      summary {
        transition: none;
      }
    }
  `;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: String, reflect: true })
  label = 'Thinking…';

  private readonly onToggle = (e: Event): void => {
    const details = e.currentTarget as HTMLDetailsElement;
    this.open = details.open;
  };

  override render() {
    return html`
      <details ?open=${this.open} @toggle=${this.onToggle}>
        <summary part="summary">
          <slot name="summary">${this.label}</slot>
        </summary>
        <div class="body" part="body">
          <slot></slot>
        </div>
      </details>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-thinking-block': TuiThinkingBlock;
  }
}
