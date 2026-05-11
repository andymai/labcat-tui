import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const DEFAULT_SPEED_MS = 30;
const FADE_DURATION_MS = 50;
const SESSION_KEY_PREFIX = 'tui:streamed:';

function hashText(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `${h >>> 0}`;
}

const pendingStarts = new Set<TuiStreamedText>();
let rafHandle: number | null = null;

function scheduleStart(el: TuiStreamedText): void {
  pendingStarts.add(el);
  if (rafHandle != null) return;
  if (typeof requestAnimationFrame !== 'function') {
    flushStarts();
    return;
  }
  rafHandle = requestAnimationFrame(flushStarts);
}

function flushStarts(): void {
  rafHandle = null;
  const batch = Array.from(pendingStarts);
  pendingStarts.clear();
  for (const el of batch) el.emitStart();
}

/**
 * `<tui-streamed-text>` — char-by-char CSS reveal of slotted text.
 *
 * Non-destructive: the slotted light DOM is never mutated. Text is mirrored
 * into shadow DOM as per-char `<span part="char">`s with inline
 * `animation-delay`. The light-DOM `<slot>` is `aria-hidden` + visually
 * hidden so AT only announces the mirror.
 *
 * @attr {number} speed - Milliseconds between chars (default 30)
 * @attr {number} cps - Characters per second (alternative to `speed`)
 * @attr {number} delay - Initial delay before the reveal starts (ms)
 * @attr {boolean} start-when-visible - Wait until intersecting the viewport
 * @attr {boolean} skip-on-revisit - Skip animation if this exact text has
 *   been animated before in this session (sessionStorage marker)
 * @slot - Text content (inline phrasing only — block content unsupported in v1)
 * @fires tui-stream-start
 * @fires tui-stream-complete
 * @fires tui-stream-interrupt
 * @csspart char - Each per-character span in the mirror
 */
@customElement('tui-streamed-text')
export class TuiStreamedText extends LitElement {
  static override styles = css`
    :host {
      display: inline;
      font-family: inherit;
      color: inherit;
    }

    .src {
      display: none;
    }

    .mirror {
      display: inline;
    }

    .char {
      opacity: 0;
      animation-name: tui-streamed-text-reveal;
      animation-duration: ${FADE_DURATION_MS}ms;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
      will-change: opacity;
    }

    @keyframes tui-streamed-text-reveal {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .char {
        animation: none;
        opacity: 1;
      }
    }
  `;

  @property({ type: Number, reflect: true })
  speed: number | null = null;

  @property({ type: Number, reflect: true })
  cps: number | null = null;

  @property({ type: Number, reflect: true })
  delay = 0;

  @property({ type: Boolean, reflect: true, attribute: 'start-when-visible' })
  startWhenVisible = false;

  @property({ type: Boolean, reflect: true, attribute: 'skip-on-revisit' })
  skipOnRevisit = false;

  @state()
  private chars: string[] = [];

  @state()
  private revealed = false;

  @state()
  private instant = false;

  private intersectionObserver: IntersectionObserver | null = null;
  private reducedMotion = false;
  private currentHash = '';
  private completed = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    pendingStarts.delete(this);
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
  }

  private onSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const text = slot
      .assignedNodes({ flatten: true })
      .map((n) => (n.nodeType === Node.TEXT_NODE ? (n.nodeValue ?? '') : (n.textContent ?? '')))
      .join('');
    this.applyText(text);
  }

  private applyText(text: string): void {
    this.chars = Array.from(text);
    this.currentHash = hashText(text);
    this.completed = false;

    const sessionKey = `${SESSION_KEY_PREFIX}${this.currentHash}`;
    const alreadySeen =
      this.skipOnRevisit &&
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(sessionKey) === '1';

    if (alreadySeen || this.reducedMotion) {
      this.instant = true;
      this.revealed = true;
      queueMicrotask(() => this.emitComplete());
      return;
    }

    this.instant = false;
    this.revealed = false;
    if (this.startWhenVisible) this.observeVisibility();
    else this.beginReveal();
  }

  private observeVisibility(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.beginReveal();
      return;
    }
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        this.intersectionObserver?.disconnect();
        this.intersectionObserver = null;
        this.beginReveal();
        break;
      }
    });
    this.intersectionObserver.observe(this);
  }

  private beginReveal(): void {
    this.revealed = true;
    scheduleStart(this);
  }

  /** @internal — invoked by the shared rAF batcher. */
  emitStart(): void {
    this.dispatchEvent(new CustomEvent('tui-stream-start', { bubbles: true, composed: true }));
  }

  private emitComplete(): void {
    if (this.completed) return;
    this.completed = true;
    if (this.skipOnRevisit && typeof sessionStorage !== 'undefined' && this.currentHash) {
      sessionStorage.setItem(`${SESSION_KEY_PREFIX}${this.currentHash}`, '1');
    }
    this.dispatchEvent(new CustomEvent('tui-stream-complete', { bubbles: true, composed: true }));
  }

  /**
   * Interrupt the in-progress reveal — fire tui-stream-interrupt and snap
   * to the fully-revealed state. Safe to call after completion (no-op).
   */
  interrupt(): void {
    if (this.completed) return;
    this.instant = true;
    this.revealed = true;
    this.dispatchEvent(new CustomEvent('tui-stream-interrupt', { bubbles: true, composed: true }));
    this.completed = true;
  }

  private get effectiveSpeedMs(): number {
    if (typeof this.speed === 'number' && this.speed > 0) return this.speed;
    if (typeof this.cps === 'number' && this.cps > 0) return 1000 / this.cps;
    return DEFAULT_SPEED_MS;
  }

  private onCharAnimationEnd(e: AnimationEvent): void {
    if (e.animationName !== 'tui-streamed-text-reveal') return;
    const target = e.currentTarget as HTMLElement;
    const last = target.lastElementChild;
    if (e.target === last) this.emitComplete();
  }

  override render() {
    const baseDelay = this.delay;
    const step = this.effectiveSpeedMs;

    return html`
      <span class="src" aria-hidden="true">
        <slot @slotchange=${this.onSlotChange}></slot>
      </span>
      <span
        class="mirror"
        part="mirror"
        aria-live="off"
        @animationend=${this.onCharAnimationEnd}
      >${this.chars.map((ch, i) => {
        if (this.instant) {
          return html`<span class="char" part="char" style="animation: none; opacity: 1;">${ch}</span>`;
        }
        if (!this.revealed) {
          return html`<span class="char" part="char" style="animation: none;">${ch}</span>`;
        }
        const delayMs = baseDelay + i * step;
        return html`<span class="char" part="char" style="animation-delay: ${delayMs}ms;">${ch}</span>`;
      })}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-streamed-text': TuiStreamedText;
  }
}
