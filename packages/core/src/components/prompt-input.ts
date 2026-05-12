import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { CommandRegistry } from '../commands/registry.js';
import type { Command, CommandContext } from '../commands/types.js';
import type {
  TuiCommandDetail,
  TuiCommandErrorDetail,
  TuiCommandSuccessDetail,
  TuiNavigateDetail,
} from '../events/types.js';
import { devWarn } from '../util/env.js';
import { MODE_LIST, MODE_SET, type Mode } from '../util/modes.js';

const HISTORY_PREFIX = 'tui:history:';
const DEFAULT_HISTORY_LIMIT = 50;

function hashPath(path: string): string {
  let h = 5381;
  for (let i = 0; i < path.length; i++) h = ((h << 5) + h + path.charCodeAt(i)) | 0;
  return `${h >>> 0}`;
}

function domPathHash(el: Element): string {
  const path: string[] = [];
  let node: Element | null = el;
  while (node) {
    const parent: ParentNode | null = node.parentNode;
    if (!parent) break;
    const siblings = Array.from(parent.childNodes).filter((n) => n.nodeType === Node.ELEMENT_NODE);
    const idx = siblings.indexOf(node);
    path.unshift(`${node.tagName}:${idx}`);
    node = parent instanceof Element ? parent : null;
  }
  return hashPath(path.join('>'));
}

function readHistory(key: string, limit: number): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === 'string').slice(0, limit);
  } catch {
    return [];
  }
}

function writeHistory(key: string, entries: readonly string[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(entries));
  } catch {
    /* quota / private mode — ignore */
  }
}

export type PromptMode = Mode;

/**
 * `<tui-prompt-input>` — Functional `›` prompt with declarative commands.
 *
 * @attr {string} placeholder
 * @attr {string} history-key - Override the auto-derived localStorage key
 * @attr {number} history-limit - Max entries kept (default 50)
 * @attr {boolean} disabled
 * @attr {"autoAccept"|"bashBorder"|"permission"|"planMode"|"ide"} mode -
 *   Tint the caret + left border in the matching mode color. If omitted,
 *   the prompt inherits `--tui-active-mode-color` set by a `<tui-session
 *   mode="...">` ancestor.
 * @prop commands - Array of Command (route XOR handler)
 * @prop onNavigate - Callback `(url: string) => void`; default sets window.location.href
 * @fires tui-command - `{ name, args }` on submit
 * @fires tui-command-success - `{ command, args }` after handler resolves
 * @fires tui-command-error - `{ command, args, error }` on handler rejection
 * @fires tui-navigate - `{ url }` after navigation callback fires
 * @csspart caret - The leading `›` glyph
 * @csspart input - The internal <input>
 */
@customElement('tui-prompt-input')
export class TuiPromptInput extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg);
      line-height: var(--tui-leading-body);

      /* Own mode wins, else parent session's, else accent. */
      --tui-prompt-mode-color: var(--tui-active-mode-color, var(--tui-accent));
    }

    :host([mode='autoAccept']) {
      --tui-prompt-mode-color: var(--tui-mode-auto-accept);
    }
    :host([mode='bashBorder']) {
      --tui-prompt-mode-color: var(--tui-mode-bash-border);
    }
    :host([mode='permission']) {
      --tui-prompt-mode-color: var(--tui-mode-permission);
    }
    :host([mode='planMode']) {
      --tui-prompt-mode-color: var(--tui-mode-plan-mode);
    }
    :host([mode='ide']) {
      --tui-prompt-mode-color: var(--tui-mode-ide);
    }

    :host([aria-busy='true']) .input {
      opacity: 0.6;
      cursor: progress;
    }

    .row {
      display: flex;
      align-items: baseline;
      gap: 0.5ch;
      border-inline-start: 2px solid transparent;
      padding-inline-start: 0.5ch;
      transition: border-color var(--tui-dur-fast, 120ms) var(--tui-easing, ease);
    }

    :host([mode]) .row {
      border-color: var(--tui-prompt-mode-color);
    }
    :host(:not([mode])) .row {
      border-color: var(--tui-active-mode-color, var(--tui-prompt-border, transparent));
    }

    .caret {
      color: var(--tui-prompt-mode-color);
      flex: 0 0 auto;
      line-height: 1;
    }

    .input {
      flex: 1 1 auto;
      background: transparent;
      border: 0;
      outline: none;
      color: var(--tui-fg);
      font: inherit;
      padding: 0;
      caret-color: var(--tui-prompt-mode-color);
      min-inline-size: 0;
    }

    .input::placeholder {
      color: var(--tui-fg-dim);
    }

    .input:disabled {
      cursor: not-allowed;
    }
  `;

  @property({ type: String, reflect: true })
  placeholder = '';

  @property({ type: String, reflect: true, attribute: 'history-key' })
  historyKey: string | null = null;

  @property({ type: Number, reflect: true, attribute: 'history-limit' })
  historyLimit = DEFAULT_HISTORY_LIMIT;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String, reflect: true })
  mode: PromptMode | null = null;

  @property({ attribute: false })
  commands: Command[] = [];

  @property({ attribute: false })
  onNavigate: ((url: string) => void) | null = null;

  @state()
  private value = '';

  @state()
  private running = false;

  private history: string[] = [];
  private historyCursor: number | null = null;
  private resolvedKey = '';
  private registryCache: CommandRegistry | null = null;
  private cachedCommands: readonly Command[] | null = null;

  @query('input')
  private inputEl?: HTMLInputElement;

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('mode') && this.mode !== null && !MODE_SET.has(this.mode)) {
      devWarn(
        `<tui-prompt-input> mode="${this.mode}" is not a known mode (${MODE_LIST}); ignoring.`,
      );
      this.mode = null;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'terminal command');
    this.resolvedKey = this.computeHistoryKey();
    this.history = readHistory(this.resolvedKey, this.historyLimit);
  }

  private computeHistoryKey(): string {
    if (this.historyKey) return this.historyKey;
    if (this.id) return `${HISTORY_PREFIX}${this.id}`;
    return `${HISTORY_PREFIX}${domPathHash(this)}`;
  }

  private get registry(): CommandRegistry {
    if (this.registryCache && this.cachedCommands === this.commands) return this.registryCache;
    this.registryCache = new CommandRegistry(this.commands);
    this.cachedCommands = this.commands;
    return this.registryCache;
  }

  private buildContext(): CommandContext {
    return {
      navigate: (url: string) => this.navigate(url),
      toggleTheme: () =>
        this.dispatchEvent(new CustomEvent('tui-toggle-theme', { bubbles: true, composed: true })),
      setTheme: (theme) =>
        this.dispatchEvent(
          new CustomEvent('tui-set-theme', { detail: { theme }, bubbles: true, composed: true }),
        ),
      emit: (event, detail) =>
        this.dispatchEvent(new CustomEvent(event, { detail, bubbles: true, composed: true })),
    };
  }

  private navigate(url: string): void {
    if (this.onNavigate) this.onNavigate(url);
    else if (typeof window !== 'undefined') window.location.href = url;
    this.dispatchEvent(
      new CustomEvent<TuiNavigateDetail>('tui-navigate', {
        detail: { url },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private pushHistory(entry: string): void {
    const trimmed = entry.trim();
    if (!trimmed) return;
    if (this.history[0] === trimmed) return;
    this.history = [trimmed, ...this.history].slice(0, this.historyLimit);
    writeHistory(this.resolvedKey, this.history);
    this.historyCursor = null;
  }

  private onInput = (e: Event): void => {
    this.value = (e.target as HTMLInputElement).value;
    this.historyCursor = null;
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.submit();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.stepHistory(1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.stepHistory(-1);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      void this.complete();
      return;
    }
  };

  private stepHistory(direction: 1 | -1): void {
    if (this.history.length === 0) return;

    if (this.historyCursor === null) {
      // ArrowDown with no active history browse is a no-op — preserves typed text.
      if (direction === -1) return;
      this.historyCursor = 0;
      this.value = this.history[0] ?? '';
      return;
    }

    const next = this.historyCursor + direction;
    if (next < 0) {
      // Stepped past the newest entry — return to the empty prompt.
      this.historyCursor = null;
      this.value = '';
      return;
    }
    if (next >= this.history.length) return; // stay at oldest
    this.historyCursor = next;
    this.value = this.history[next] ?? '';
  }

  private async complete(): Promise<void> {
    const ctx = this.buildContext();
    const candidates = await this.registry.completions(this.value, ctx);
    if (candidates.length === 0) return;
    const first = candidates[0];
    if (!first) return;
    if (this.value.includes(' ')) {
      const idx = this.value.lastIndexOf(' ');
      this.value = `${this.value.slice(0, idx + 1)}${first}`;
    } else {
      this.value = first;
    }
  }

  private async submit(): Promise<void> {
    if (this.running || this.disabled) return;
    const raw = this.value;
    const matched = this.registry.match(raw);
    if (!matched) {
      this.dispatchEvent(
        new CustomEvent<TuiCommandDetail>('tui-command', {
          detail: { name: raw.trim(), args: '' },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    const { command, args } = matched;
    this.dispatchEvent(
      new CustomEvent<TuiCommandDetail>('tui-command', {
        detail: { name: command.name, args },
        bubbles: true,
        composed: true,
      }),
    );

    this.pushHistory(raw);

    if (typeof (command as { route?: unknown }).route === 'string') {
      this.navigate((command as { route: string }).route);
      this.dispatchSuccess(command.name, args);
      this.value = '';
      return;
    }

    const handler = (command as { handler?: (a: string, c: CommandContext) => unknown }).handler;
    if (typeof handler !== 'function') return;

    this.running = true;
    this.setAttribute('aria-busy', 'true');
    try {
      const ctx = this.buildContext();
      await handler(args, ctx);
      this.dispatchSuccess(command.name, args);
      this.value = '';
    } catch (error) {
      this.dispatchError(command.name, args, error);
    } finally {
      this.running = false;
      this.removeAttribute('aria-busy');
    }
  }

  private dispatchSuccess(command: string, args: string): void {
    this.dispatchEvent(
      new CustomEvent<TuiCommandSuccessDetail>('tui-command-success', {
        detail: { command, args },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private dispatchError(command: string, args: string, error: unknown): void {
    this.dispatchEvent(
      new CustomEvent<TuiCommandErrorDetail>('tui-command-error', {
        detail: { command, args, error },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
  }

  /** Programmatically focus the inner input. */
  override focus(): void {
    this.inputEl?.focus();
  }

  override render() {
    return html`
      <div class="row">
        <span class="caret" part="caret" aria-hidden="true">›</span>
        <input
          class="input"
          part="input"
          type="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          inputmode="text"
          aria-label="terminal command"
          .value=${this.value}
          .placeholder=${this.placeholder}
          ?disabled=${this.disabled || this.running}
          @input=${this.onInput}
          @keydown=${this.onKeyDown}
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-prompt-input': TuiPromptInput;
  }
}
