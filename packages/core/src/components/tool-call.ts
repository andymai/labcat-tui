import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type ToolCallStatus = 'ok' | 'pending' | 'running' | 'error';

/**
 * `<tui-tool-call>` — Signature `●` tool-call card.
 *
 * @attr {string} tool - Tool name (e.g., "Read", "Edit")
 * @attr {string} args - Tool arguments summary
 * @attr {"ok"|"pending"|"running"|"error"} status - Visual + a11y state
 * @attr {string} aria-label - Overrides the auto-generated label
 * @slot - Optional body content (rendered below the head)
 * @csspart dot - The leading `●` indicator
 * @csspart head - The header row container
 * @csspart tool - The tool name span
 * @csspart args - The args span
 * @csspart body - The body slot wrapper
 */
@customElement('tui-tool-call')
export class TuiToolCall extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg);
      line-height: var(--tui-leading-body);
      container-type: inline-size;
    }

    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.5ch;
    }

    .dot {
      color: var(--tui-accent);
      flex: 0 0 auto;
      line-height: 1;
    }

    :host([status='error']) .dot {
      color: var(--tui-error);
    }

    :host([status='pending']) .dot {
      color: var(--tui-fg-dim);
    }

    :host([status='running']) .dot {
      color: var(--tui-system-spinner, var(--tui-info));
      animation: tui-tool-call-pulse 1800ms ease-in-out infinite;
    }

    @keyframes tui-tool-call-pulse {
      0%,
      100% {
        color: var(--tui-system-spinner, var(--tui-info));
      }
      50% {
        color: var(--tui-system-spinner-shimmer, var(--tui-info));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host([status='running']) .dot {
        animation: none;
      }
    }

    .tool {
      color: var(--tui-fg);
      font-weight: 600;
    }

    .args {
      color: var(--tui-fg-muted);
      word-break: break-word;
      overflow-wrap: anywhere;
      flex: 1 1 100%;
      padding-inline-start: 2ch;
    }

    @container (min-width: 40ch) {
      .args {
        flex: 1 1 auto;
        padding-inline-start: 0;
      }
    }

    .body {
      margin-block-start: 0.25rem;
      padding-inline-start: 2ch;
      color: var(--tui-fg-muted);
    }

    .body:empty,
    .body[hidden] {
      display: none;
    }
  `;

  @property({ type: String, reflect: true })
  tool = '';

  @property({ type: String, reflect: true })
  args = '';

  @property({ type: String, reflect: true })
  status: ToolCallStatus = 'ok';

  @state()
  private hasBody = false;

  // Tracks whether the current aria-label was set by this component (and so
  // can be refreshed on attribute change) vs provided by the consumer (and so
  // must be left alone).
  private autoSetAriaLabel = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'region');
    this.applyAriaLabel();
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('tool') || changed.has('args')) this.applyAriaLabel();
  }

  private applyAriaLabel(): void {
    const consumerSet = this.hasAttribute('aria-label') && !this.autoSetAriaLabel;
    if (consumerSet && this.getAttribute('aria-label')) return;

    const label = [this.tool, this.args].filter(Boolean).join(' ').trim();
    if (label) {
      this.setAttribute('aria-label', label);
      this.autoSetAriaLabel = true;
    } else if (this.autoSetAriaLabel) {
      // Tool + args both cleared after we auto-set — drop the stale label.
      this.removeAttribute('aria-label');
      this.autoSetAriaLabel = false;
    }
  }

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
      <div class="head" part="head">
        <span class="dot" part="dot" aria-hidden="true">●</span>
        <span class="tool" part="tool">${this.tool}</span>
        ${this.args ? html`<span class="args" part="args">${this.args}</span>` : null}
      </div>
      <div class="body" part="body" ?hidden=${!this.hasBody}>
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-tool-call': TuiToolCall;
  }
}
