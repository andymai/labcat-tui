import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * `<tui-welcome-banner>` — Boxed welcome with glyph + tips.
 *
 * @attr {string} glyph - Decorative leading glyph (default `✻`)
 * @attr {string} title - Banner title text
 * @slot - Subtitle / tips content
 * @csspart chrome - The frame container
 * @csspart glyph - The leading glyph cell
 * @csspart title - The title text
 * @csspart subtitle - The subtitle / tips slot wrapper
 */
@customElement('tui-welcome-banner')
export class TuiWelcomeBanner extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg);
      line-height: var(--tui-leading-body);
    }

    .chrome {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1ch;
      border: 1px solid var(--tui-border);
      border-radius: 0.375rem;
      padding-block: 0.5rem;
      padding-inline: 0.75rem;
      overflow-inline: auto;
    }

    .glyph {
      color: var(--tui-accent);
      align-self: start;
      line-height: 1;
      font-size: 1.25em;
    }

    .text {
      display: grid;
      gap: 0.25rem;
      min-inline-size: 0;
    }

    .title {
      color: var(--tui-fg);
      font-weight: 600;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    .subtitle {
      color: var(--tui-fg-muted);
      font-size: 0.875em;
    }

    .subtitle:empty,
    .subtitle[hidden] {
      display: none;
    }
  `;

  @property({ type: String, reflect: true })
  glyph = '✻';

  @property({ type: String, reflect: true })
  override title = '';

  override render() {
    return html`
      <div class="chrome" part="chrome">
        <span class="glyph" part="glyph" aria-hidden="true">${this.glyph}</span>
        <div class="text">
          ${this.title ? html`<div class="title" part="title">${this.title}</div>` : nothing}
          <div class="subtitle" part="subtitle"><slot></slot></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-welcome-banner': TuiWelcomeBanner;
  }
}
