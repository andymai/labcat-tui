import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ShimmerKind =
  | 'accent'
  | 'systemSpinner'
  | 'permission'
  | 'warning'
  | 'inactive'
  | 'fastMode'
  | 'promptBorder';

/**
 * `<tui-shimmer-text>` — Animates slotted text between a base color and
 * its shimmer companion, matching Claude Code's breathing / pulse effect.
 *
 * The `kind` attribute selects one of the shimmer pairs from the active
 * theme: `accent`, `systemSpinner`, `permission`, `warning`, `inactive`,
 * `fastMode`, or `promptBorder`. Honors `prefers-reduced-motion` — when
 * set, the slot renders in the base color with no animation.
 *
 * @attr {ShimmerKind} kind - Which color pair to animate (default `accent`)
 * @attr {number} duration - Pulse cycle in ms (default 1800)
 * @slot - Text content to shimmer
 */
@customElement('tui-shimmer-text')
export class TuiShimmerText extends LitElement {
  static override styles = css`
    :host {
      display: inline;
      font-family: inherit;
      color: var(--tui-shimmer-base, var(--tui-accent));
    }

    :host([kind='accent']) {
      --tui-shimmer-base: var(--tui-accent);
      --tui-shimmer-peak: var(--tui-accent-shimmer);
    }
    :host([kind='systemSpinner']) {
      --tui-shimmer-base: var(--tui-system-spinner);
      --tui-shimmer-peak: var(--tui-system-spinner-shimmer);
    }
    :host([kind='permission']) {
      --tui-shimmer-base: var(--tui-mode-permission);
      --tui-shimmer-peak: var(--tui-mode-permission-shimmer);
    }
    :host([kind='warning']) {
      --tui-shimmer-base: var(--tui-warning);
      --tui-shimmer-peak: var(--tui-warning-shimmer);
    }
    :host([kind='inactive']) {
      --tui-shimmer-base: var(--tui-inactive);
      --tui-shimmer-peak: var(--tui-inactive-shimmer);
    }
    :host([kind='fastMode']) {
      --tui-shimmer-base: var(--tui-fast-mode);
      --tui-shimmer-peak: var(--tui-fast-mode-shimmer);
    }
    :host([kind='promptBorder']) {
      --tui-shimmer-base: var(--tui-prompt-border);
      --tui-shimmer-peak: var(--tui-prompt-border-shimmer);
    }

    .shimmer {
      animation: tui-shimmer-pulse var(--tui-shimmer-duration, 1800ms) ease-in-out infinite;
      color: var(--tui-shimmer-base);
    }

    @keyframes tui-shimmer-pulse {
      0%,
      100% {
        color: var(--tui-shimmer-base);
      }
      50% {
        color: var(--tui-shimmer-peak);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .shimmer {
        animation: none;
      }
    }
  `;

  @property({ type: String, reflect: true })
  kind: ShimmerKind = 'accent';

  @property({ type: Number, reflect: true })
  duration = 1800;

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('duration')) {
      this.style.setProperty('--tui-shimmer-duration', `${this.duration}ms`);
    }
  }

  override render() {
    return html`<span class="shimmer"><slot></slot></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-shimmer-text': TuiShimmerText;
  }
}
