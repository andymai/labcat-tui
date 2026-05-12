import { LitElement, css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { deriveShikiTheme } from './derive-theme.js';
import { normalizeLang } from './grammars.js';

interface HighlightedLine {
  spans: Array<{ color: string | undefined; text: string; fontStyle: string | undefined }>;
}

function parseRanges(spec: string): Set<number> {
  const out = new Set<number>();
  for (const chunk of spec.split(',')) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const dash = trimmed.indexOf('-');
    if (dash === -1) {
      const n = Number.parseInt(trimmed, 10);
      if (Number.isFinite(n) && n > 0) out.add(n);
      continue;
    }
    const start = Number.parseInt(trimmed.slice(0, dash), 10);
    const end = Number.parseInt(trimmed.slice(dash + 1), 10);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    for (let i = start; i <= end; i++) out.add(i);
  }
  return out;
}

const BASE_STYLES = css`
  :host {
    display: block;
    background: var(--tui-surface-2);
    color: var(--tui-fg);
    border: 1px solid var(--tui-border);
    border-radius: 0.25rem;
    font-family: var(--tui-font-mono);
    line-height: var(--tui-leading-body, 1.55);
    font-size: 0.9em;
    overflow: hidden;
    position: relative;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem 0.25rem 0.75rem;
    border-block-end: 1px solid var(--tui-border);
    background: var(--tui-surface);
    color: var(--tui-fg-muted);
    font-size: 0.85em;
  }

  .filename {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .copy {
    background: transparent;
    border: 1px solid transparent;
    color: var(--tui-fg-dim);
    font: inherit;
    font-size: 0.85em;
    padding: 0 0.4rem;
    border-radius: 0.125rem;
    cursor: pointer;
    transition: color var(--tui-dur-fast, 120ms) var(--tui-easing, ease),
      border-color var(--tui-dur-fast, 120ms) var(--tui-easing, ease);
  }

  .copy:hover {
    color: var(--tui-fg);
    border-color: var(--tui-border);
  }

  .copy[data-copied='true'] {
    color: var(--tui-success);
  }

  pre {
    margin: 0;
    padding: 0.5rem 0.75rem;
    overflow-x: auto;
    color: inherit;
    background: transparent;
  }

  code {
    display: block;
    font: inherit;
    color: inherit;
  }

  .line {
    display: block;
    min-height: 1.55em;
    padding-inline: 0.25rem;
    margin-inline: -0.25rem;
  }

  .line[data-marked='true'] {
    background: color-mix(in srgb, var(--tui-accent) 14%, transparent);
    border-inline-start: 2px solid var(--tui-accent);
    padding-inline-start: calc(0.25rem - 2px);
  }
`;

export class TuiCodeBlock extends LitElement {
  static override styles = BASE_STYLES;

  @property({ type: String }) override lang = '';
  @property({ type: String }) filename = '';
  @property({ type: String, attribute: 'highlight-lines' }) highlightLines = '';
  @property({ type: Boolean, attribute: 'no-copy' }) noCopy = false;
  @property({ type: String, attribute: 'code' }) codeAttr = '';

  @state() private _highlighted: HighlightedLine[] | null = null;
  @state() private _copied = false;

  private _source = '';
  private _themeObserver: MutationObserver | undefined = undefined;
  private _copyTimer: number | undefined = undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this._source = this._readSource();
    void this._upgrade();

    this._themeObserver = new MutationObserver(() => void this._upgrade());
    const root = this.ownerDocument?.documentElement;
    if (root) {
      this._themeObserver.observe(root, {
        attributes: true,
        attributeFilter: ['data-tui-theme', 'class'],
      });
    }
  }

  override disconnectedCallback(): void {
    this._themeObserver?.disconnect();
    this._themeObserver = undefined;
    if (this._copyTimer != null) {
      window.clearTimeout(this._copyTimer);
      this._copyTimer = undefined;
    }
    super.disconnectedCallback();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has('codeAttr') || changed.has('lang')) {
      const next = this._readSource();
      if (next !== this._source) {
        this._source = next;
        void this._upgrade();
      } else if (changed.has('lang')) {
        void this._upgrade();
      }
    }
  }

  private _readSource(): string {
    if (this.codeAttr) return this.codeAttr;
    return (this.textContent ?? '').replace(/^\n/, '').replace(/\n$/, '');
  }

  private async _upgrade(): Promise<void> {
    const source = this._source;
    if (!source) return;
    const lang = normalizeLang(this.lang);
    if (!lang) return;

    try {
      const { getHighlighter } = await import('./shiki-runtime.js');
      const highlighter = await getHighlighter();
      const theme = deriveShikiTheme(this);

      const result = highlighter.codeToTokens(source, {
        lang,
        theme,
      });

      this._highlighted = result.tokens.map((line) => ({
        spans: line.map((token) => ({
          color: token.color,
          text: token.content,
          fontStyle: token.fontStyle ? String(token.fontStyle) : undefined,
        })),
      }));
    } catch (err) {
      console.warn('[@labcat/tui-shiki] highlight failed; falling back to plain text', err);
      this._highlighted = null;
    }
  }

  private async _copy(): Promise<void> {
    const text = this._source;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      this._copied = true;
      this.dispatchEvent(
        new CustomEvent('tui-code-copy', { bubbles: true, composed: true, detail: { text } }),
      );
      if (this._copyTimer != null) window.clearTimeout(this._copyTimer);
      this._copyTimer = window.setTimeout(() => {
        this._copied = false;
      }, 1500);
    } catch (err) {
      console.warn('[@labcat/tui-shiki] copy failed', err);
    }
  }

  protected override render() {
    const hasHeader = Boolean(this.filename) || !this.noCopy;
    const marked = this.highlightLines ? parseRanges(this.highlightLines) : null;

    return html`
      ${
        hasHeader
          ? html`
            <div class="header" part="header">
              <span class="filename" part="filename">${this.filename || nothing}</span>
              ${
                this.noCopy
                  ? nothing
                  : html`
                    <button
                      type="button"
                      class="copy"
                      part="copy"
                      data-copied=${this._copied ? 'true' : 'false'}
                      aria-label=${this._copied ? 'Copied' : 'Copy code'}
                      @click=${this._copy}
                    >
                      ${this._copied ? 'Copied' : 'Copy'}
                    </button>
                  `
              }
            </div>
          `
          : nothing
      }
      <pre part="pre"><code part="code">${
        this._highlighted
          ? this._highlighted.map(
              (line, i) => html`<span
                class="line"
                part="line"
                data-marked=${marked?.has(i + 1) ? 'true' : 'false'}
                >${line.spans.map(
                  (s) =>
                    html`<span
                      style=${s.color ? `color:${s.color}` : ''}
                      data-style=${s.fontStyle ?? ''}
                      >${s.text}</span
                    >`,
                )}${'\n'}</span
              >`,
            )
          : this._source.split('\n').map(
              (text, i) => html`<span
                  class="line"
                  part="line"
                  data-marked=${marked?.has(i + 1) ? 'true' : 'false'}
                  >${text}${'\n'}</span
                >`,
            )
      }</code></pre>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('tui-code-block')) {
  customElements.define('tui-code-block', TuiCodeBlock);
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-code-block': TuiCodeBlock;
  }
}
