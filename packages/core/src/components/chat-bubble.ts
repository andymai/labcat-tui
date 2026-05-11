import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ChatRole = 'user' | 'assistant' | 'system';

/**
 * `<tui-chat-bubble>` — Chat message with role/name/timestamp head + slot body.
 *
 * @attr {"user"|"assistant"|"system"} role
 * @attr {string} name
 * @attr {string} timestamp
 * @slot - Message body
 * @csspart head - Header row container
 * @csspart role - Role indicator
 * @csspart name - Sender name
 * @csspart timestamp - Timestamp text
 * @csspart body - Body slot wrapper
 */
@customElement('tui-chat-bubble')
export class TuiChatBubble extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg);
      line-height: var(--tui-leading-body);
      padding-block: 0.25rem;
    }

    .head {
      display: flex;
      align-items: baseline;
      gap: 0.5ch;
      color: var(--tui-fg-muted);
      font-size: 0.875em;
    }

    .role {
      color: var(--tui-accent);
      flex: 0 0 auto;
    }

    :host([role='user']) .role {
      color: var(--tui-info);
    }

    :host([role='system']) .role {
      color: var(--tui-fg-dim);
    }

    .name {
      color: var(--tui-fg);
    }

    .timestamp {
      color: var(--tui-fg-dim);
      margin-inline-start: auto;
    }

    .body {
      padding-block-start: 0.125rem;
      padding-inline-start: 2ch;
      color: var(--tui-fg);
    }
  `;

  @property({ type: String, reflect: true })
  override role: ChatRole = 'assistant';

  @property({ type: String, reflect: true })
  name = '';

  @property({ type: String, reflect: true })
  timestamp = '';

  override render() {
    return html`
      <div class="head" part="head">
        <span class="role" part="role" aria-hidden="true">${this.roleGlyph}</span>
        ${this.name ? html`<span class="name" part="name">${this.name}</span>` : nothing}
        ${
          this.timestamp
            ? html`<span class="timestamp" part="timestamp">${this.timestamp}</span>`
            : nothing
        }
      </div>
      <div class="body" part="body"><slot></slot></div>
    `;
  }

  private get roleGlyph(): string {
    switch (this.role) {
      case 'user':
        return '›';
      case 'system':
        return '◆';
      default:
        return '✻';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-chat-bubble': TuiChatBubble;
  }
}
