import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<tui-prompt-line>` — Static `›` prompt with optional command + cursor.
 * Display-only (no input handling — see `<tui-prompt-input>` for that).
 *
 * @attr {string} command - Command text rendered after the prompt
 * @attr {boolean} cursor - Show a blinking cursor at the end
 * @csspart caret - The leading `›` glyph
 * @csspart command - The command text
 * @csspart cursor - The blinking cursor
 */
@customElement('tui-prompt-line')
export class TuiPromptLine extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg);
      line-height: var(--tui-leading-body);
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.5ch;
    }

    .caret {
      color: var(--tui-accent);
      flex: 0 0 auto;
      line-height: 1;
    }

    .command {
      color: var(--tui-fg);
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    .cursor {
      display: inline-block;
      inline-size: 1ch;
      background: var(--tui-fg);
      animation: tui-prompt-line-blink 1s steps(2, end) infinite;
    }

    @keyframes tui-prompt-line-blink {
      to {
        visibility: hidden;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .cursor {
        animation: none;
      }
    }
  `;

  @property({ type: String, reflect: true })
  command = '';

  @property({ type: Boolean, reflect: true })
  cursor = false;

  override render() {
    return html`
      <div class="row">
        <span class="caret" part="caret" aria-hidden="true">›</span>
        ${
          this.command ? html`<span class="command" part="command">${this.command}</span>` : nothing
        }
        ${
          this.cursor
            ? html`<span class="cursor" part="cursor" aria-hidden="true">&nbsp;</span>`
            : nothing
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-prompt-line': TuiPromptLine;
  }
}
