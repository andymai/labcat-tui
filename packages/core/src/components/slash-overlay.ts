import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { CommandRegistry } from '../commands/registry.js';
import type { Command } from '../commands/types.js';
import type { TuiSlashSelectDetail } from '../events/types.js';

/**
 * `<tui-slash-overlay>` — Modal command palette.
 *
 * @attr {boolean} open
 * @prop commands - Array of Command
 * @fires tui-slash-select - `{ command }` (command name) on pick
 * @fires tui-slash-dismiss - when the overlay is closed without a selection
 * @csspart backdrop
 * @csspart list
 * @csspart item
 */
@customElement('tui-slash-overlay')
export class TuiSlashOverlay extends LitElement {
  static override styles = css`
    :host {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 100;
      font-family: var(--tui-font-mono);
    }

    :host([open]) {
      display: grid;
      place-items: start center;
      padding-block-start: 15vh;
    }

    .backdrop {
      position: absolute;
      inset: 0;
      background: color-mix(in srgb, var(--tui-bg) 85%, transparent);
    }

    .panel {
      position: relative;
      inline-size: min(36rem, 90vw);
      background: var(--tui-surface);
      border: 1px solid var(--tui-border);
      border-radius: 0.5rem;
      box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.45);
      max-block-size: 60vh;
      display: grid;
      grid-template-rows: auto 1fr;
    }

    .search {
      padding: 0.5rem 0.75rem;
      border-block-end: 1px solid var(--tui-border);
      display: flex;
      gap: 0.5ch;
      align-items: baseline;
    }

    .caret {
      color: var(--tui-accent);
    }

    .input {
      flex: 1;
      background: transparent;
      border: 0;
      outline: none;
      color: var(--tui-fg);
      font: inherit;
    }

    .list {
      list-style: none;
      margin: 0;
      padding: 0.25rem;
      overflow-y: auto;
    }

    .item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.5ch;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      color: var(--tui-fg);
      cursor: pointer;
    }

    .item[aria-selected='true'] {
      background: var(--tui-surface-2);
      color: var(--tui-fg);
    }

    .item .desc {
      color: var(--tui-fg-muted);
      font-size: 0.875em;
    }

    .empty {
      padding: 0.75rem;
      color: var(--tui-fg-muted);
      text-align: center;
    }
  `;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ attribute: false })
  commands: Command[] = [];

  @state()
  private query_ = '';

  @state()
  private selected = 0;

  @query('input')
  private searchEl?: HTMLInputElement;

  private previousActive: HTMLElement | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'true');
  }

  override updated(changed: Map<string, unknown>): void {
    if (!changed.has('open')) return;
    if (this.open) this.openOverlay();
    else this.closeOverlay();
  }

  private openOverlay(): void {
    this.previousActive = (document.activeElement as HTMLElement | null) ?? null;
    this.query_ = '';
    this.selected = 0;
    queueMicrotask(() => this.searchEl?.focus());
  }

  private closeOverlay(): void {
    if (this.previousActive && document.contains(this.previousActive)) {
      this.previousActive.focus();
    }
    this.previousActive = null;
  }

  private get filtered(): Command[] {
    if (!this.commands.length) return [];
    const reg = new CommandRegistry(this.commands);
    if (!this.query_.trim()) return reg.list();
    const q = this.query_.toLowerCase();
    return reg.list().filter((c) => {
      if (c.name.toLowerCase().includes(q)) return true;
      if (c.description?.toLowerCase().includes(q)) return true;
      return c.aliases?.some((a) => a.toLowerCase().includes(q)) ?? false;
    });
  }

  private onInput = (e: Event): void => {
    this.query_ = (e.target as HTMLInputElement).value;
    this.selected = 0;
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    const list = this.filtered;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.dismiss();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selected = Math.min(this.selected + 1, Math.max(list.length - 1, 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selected = Math.max(this.selected - 1, 0);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = list[this.selected];
      if (cmd) this.pick(cmd);
    }
  };

  private pick(cmd: Command): void {
    this.dispatchEvent(
      new CustomEvent<TuiSlashSelectDetail>('tui-slash-select', {
        detail: { command: cmd.name },
        bubbles: true,
        composed: true,
      }),
    );
    this.open = false;
  }

  private dismiss(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent('tui-slash-dismiss', { bubbles: true, composed: true }));
  }

  private onBackdropClick = (): void => this.dismiss();

  override render() {
    const list = this.filtered;
    return html`
      <div class="backdrop" part="backdrop" @click=${this.onBackdropClick}></div>
      <div class="panel" @keydown=${this.onKeyDown}>
        <div class="search">
          <span class="caret" aria-hidden="true">›</span>
          <input
            class="input"
            type="text"
            autocomplete="off"
            spellcheck="false"
            aria-label="filter commands"
            .value=${this.query_}
            @input=${this.onInput}
          />
        </div>
        <ul class="list" part="list" role="listbox">
          ${
            list.length === 0
              ? html`<li class="empty">No commands match.</li>`
              : list.map(
                  (cmd, i) => html`
                  <li
                    class="item"
                    part="item"
                    role="option"
                    aria-selected=${i === this.selected ? 'true' : 'false'}
                    @click=${() => this.pick(cmd)}
                  >
                    <span>${cmd.name}</span>
                    ${cmd.description ? html`<span class="desc">${cmd.description}</span>` : null}
                  </li>
                `,
                )
          }
        </ul>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-slash-overlay': TuiSlashOverlay;
  }
}
