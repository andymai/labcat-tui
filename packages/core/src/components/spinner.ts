import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type SpinnerKind = 'dots' | 'line' | 'box' | 'pulse';

const FRAMES: Record<SpinnerKind, readonly string[]> = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['-', '\\', '|', '/'],
  box: ['▖', '▘', '▝', '▗'],
  pulse: ['·', '•', '●', '•'],
};

/**
 * `<tui-spinner>` — Inline TUI spinner with several glyph styles.
 *
 * @attr {"dots"|"line"|"box"|"pulse"} kind - Glyph set
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
      color: var(--tui-accent);
      line-height: 1;
    }

    .glyph {
      display: inline-block;
      min-inline-size: 1ch;
      text-align: center;
    }
  `;

  @property({ type: String, reflect: true })
  kind: SpinnerKind = 'dots';

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
    const glyph = frames[this.frameIndex % frames.length] ?? frames[0] ?? '';
    return html`<span class="glyph" part="glyph" aria-hidden="true">${glyph}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-spinner': TuiSpinner;
  }
}
