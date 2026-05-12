import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { devWarn } from '../util/env.js';

export type SpinnerKind = 'dots' | 'line' | 'box' | 'pulse';
export type SpinnerTone = 'accent' | 'system';

const FRAMES: Record<SpinnerKind, readonly string[]> = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['-', '\\', '|', '/'],
  box: ['▖', '▘', '▝', '▗'],
  pulse: ['·', '•', '●', '•'],
};

const SPINNER_TONES: ReadonlySet<SpinnerTone> = new Set(['accent', 'system']);

/**
 * `<tui-spinner>` — Inline TUI spinner with several glyph styles.
 *
 * @attr {"dots"|"line"|"box"|"pulse"} kind - Glyph set
 * @attr {"accent"|"system"} tone - Color pair. `system` selects Claude's
 *   blue throbber; the glyph pulses between the base and its shimmer
 *   companion via a CSS keyframe.
 * @attr {boolean} running - Whether the animation is running
 * @attr {string} aria-label - Accessibility label (default "Loading")
 * @csspart glyph - The animated character
 */
@customElement('tui-spinner')
export class TuiSpinner extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      font-family: var(--tui-font-mono);
      line-height: 1;

      --tui-spinner-base: var(--tui-accent);
      --tui-spinner-peak: var(--tui-accent-shimmer, var(--tui-accent));
    }

    :host([tone='system']) {
      --tui-spinner-base: var(--tui-system-spinner, var(--tui-info));
      --tui-spinner-peak: var(--tui-system-spinner-shimmer, var(--tui-info));
    }

    .glyph {
      display: inline-block;
      min-inline-size: 1ch;
      text-align: center;
      color: var(--tui-spinner-base);
    }

    :host([running]) .glyph {
      animation: tui-spinner-pulse 1800ms ease-in-out infinite;
    }

    @keyframes tui-spinner-pulse {
      0%,
      100% {
        color: var(--tui-spinner-base);
      }
      50% {
        color: var(--tui-spinner-peak);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host([running]) .glyph {
        animation: none;
      }
    }
  `;

  @property({ type: String, reflect: true })
  kind: SpinnerKind = 'dots';

  @property({ type: String, reflect: true })
  tone: SpinnerTone = 'accent';

  @property({ type: Boolean, reflect: true })
  running = true;

  @state()
  private frameIndex = 0;

  private timer: ReturnType<typeof setInterval> | null = null;
  private reducedMotionMql: MediaQueryList | null = null;
  private readonly onReducedMotionChange = (): void => this.syncTimer();

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'status');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Loading');

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      this.reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotionMql.addEventListener('change', this.onReducedMotionChange);
    }
    this.syncTimer();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopTimer();
    this.reducedMotionMql?.removeEventListener('change', this.onReducedMotionChange);
    this.reducedMotionMql = null;
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('kind')) {
      if (!Object.hasOwn(FRAMES, this.kind)) {
        devWarn(
          `<tui-spinner> kind="${this.kind}" is not a known SpinnerKind; defaulting to dots.`,
        );
        this.kind = 'dots';
        return;
      }
      this.frameIndex = 0;
    }
    if (changed.has('tone') && !SPINNER_TONES.has(this.tone)) {
      devWarn(
        `<tui-spinner> tone="${this.tone}" is not a known SpinnerTone; defaulting to accent.`,
      );
      this.tone = 'accent';
      return;
    }
    if (changed.has('running') || changed.has('kind')) this.syncTimer();
  }

  private get prefersReducedMotion(): boolean {
    return this.reducedMotionMql?.matches ?? false;
  }

  private syncTimer(): void {
    const shouldRun = this.running && !this.prefersReducedMotion;
    if (shouldRun) this.startTimer();
    else this.stopTimer();
  }

  private startTimer(): void {
    if (this.timer != null) return;
    this.timer = setInterval(() => {
      const frames = FRAMES[this.kind];
      this.frameIndex = (this.frameIndex + 1) % frames.length;
    }, 90);
  }

  private stopTimer(): void {
    if (this.timer == null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  override render() {
    const frames = FRAMES[this.kind];
    const glyph = frames[this.frameIndex % frames.length];
    return html`<span class="glyph" part="glyph" aria-hidden="true">${glyph}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-spinner': TuiSpinner;
  }
}
