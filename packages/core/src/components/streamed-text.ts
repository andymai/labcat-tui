import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const DEFAULT_SPEED_MS = 30;
const FADE_DURATION_MS = 50;
const SESSION_KEY_PREFIX = 'tui:streamed:';

const SENTENCE_PAUSE_MS = 80;
const CLAUSE_PAUSE_MS = 50;

function hashText(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `${h >>> 0}`;
}

/**
 * Deterministic small PRNG (mulberry32). Seeded by a string hash so the same
 * text always animates with the same burst layout — keeps tests stable and
 * means a user revisiting a page sees the same rhythm as last time.
 */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Char-by-char metronome: every char gets the same step delay.
 */
function computeCharDelays(chars: readonly string[], stepMs: number, baseMs: number): number[] {
  const delays = new Array<number>(chars.length);
  for (let i = 0; i < chars.length; i++) delays[i] = baseMs + i * stepMs;
  return delays;
}

/**
 * Token-burst delays: chars are grouped into 1–4 char bursts with a small
 * within-burst gap (20% of step) and a full step gap between bursts.
 * Sentence/clause punctuation adds extra pause time. Seeded by content hash
 * so repeat reveals have the same rhythm.
 */
function computeTokenDelays(
  chars: readonly string[],
  stepMs: number,
  baseMs: number,
  seed: number,
): number[] {
  const rand = mulberry32(seed || 1);
  const delays = new Array<number>(chars.length);
  let t = baseMs;
  let burstRemaining = 0;
  for (let i = 0; i < chars.length; i++) {
    if (burstRemaining === 0) {
      // First char of a new burst — `t` already carries the inter-burst gap
      // (or `baseMs` on the very first iteration).
      burstRemaining = 1 + Math.floor(rand() * 4); // 1..4
    } else {
      t += stepMs * 0.2;
    }
    delays[i] = t;
    burstRemaining--;
    if (burstRemaining === 0) {
      t += stepMs;
      const ch = chars[i];
      if (ch === '.' || ch === '!' || ch === '?') t += SENTENCE_PAUSE_MS;
      else if (ch === ',' || ch === ';' || ch === ':') t += CLAUSE_PAUSE_MS;
    }
  }
  return delays;
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

    :host([skippable]:not([data-completed])) {
      cursor: pointer;
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

  @property({ type: String, reflect: true })
  mode: 'char' | 'token' = 'char';

  @property({ type: Boolean, reflect: true })
  skippable = false;

  @state()
  private chars: string[] = [];

  @state()
  private revealed = false;

  @state()
  private instant = false;

  private intersectionObserver: IntersectionObserver | null = null;
  private reducedMotion = false;
  private reducedMotionMql: MediaQueryList | null = null;
  private readonly onReducedMotionChange = (e: MediaQueryListEvent): void => {
    this.reducedMotion = e.matches;
  };
  private currentHash = '';
  private completed = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      this.reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = this.reducedMotionMql.matches;
      this.reducedMotionMql.addEventListener('change', this.onReducedMotionChange);
    }
    this.addEventListener('click', this.onHostClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    pendingStarts.delete(this);
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    this.reducedMotionMql?.removeEventListener('change', this.onReducedMotionChange);
    this.reducedMotionMql = null;
    this.removeEventListener('click', this.onHostClick);
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

    // Empty text: nothing animates, so animationend never fires. Emit complete
    // out-of-band so consumers waiting for it don't hang.
    if (this.chars.length === 0) {
      this.revealed = true;
      scheduleStart(this);
      queueMicrotask(() => this.emitComplete());
      return;
    }

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
    this.setAttribute('data-completed', '');
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
    this.setAttribute('data-completed', '');
  }

  private onHostClick = (): void => {
    if (!this.skippable || this.completed) return;
    this.interrupt();
  };

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
    const step = this.effectiveSpeedMs;
    const delays =
      this.mode === 'token'
        ? computeTokenDelays(
            this.chars,
            step,
            this.delay,
            Number.parseInt(this.currentHash || '1', 10),
          )
        : computeCharDelays(this.chars, step, this.delay);

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
        return html`<span class="char" part="char" style="animation-delay: ${delays[i]}ms;">${ch}</span>`;
      })}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-streamed-text': TuiStreamedText;
  }
}
