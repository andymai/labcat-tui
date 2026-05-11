import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TuiTodoChangeDetail } from '../events/types.js';

export type TodoStatus = 'pending' | 'in-progress' | 'completed';

const DOT: Record<TodoStatus, string> = {
  pending: '☐',
  'in-progress': '◐',
  completed: '☑',
};

const STATUS_LABEL: Record<TodoStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In progress',
  completed: 'Completed',
};

/**
 * `<tui-todo-item>` — Single item in a TUI todo list.
 *
 * @attr {"pending"|"in-progress"|"completed"} status - Item state
 * @slot - Label text
 * @csspart dot - The status glyph
 * @csspart label - The label slot wrapper
 * @fires tui-todo-change - `{ status, previousStatus }` when status changes
 */
@customElement('tui-todo-item')
export class TuiTodoItem extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: baseline;
      gap: 0.5ch;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg);
      line-height: var(--tui-leading-body);
    }

    .dot {
      flex: 0 0 auto;
      color: var(--tui-fg-dim);
      line-height: 1;
    }

    :host([status='in-progress']) .dot {
      color: var(--tui-accent);
    }

    :host([status='completed']) .dot {
      color: var(--tui-success);
    }

    .label {
      color: var(--tui-fg);
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    :host([status='completed']) .label {
      color: var(--tui-fg-muted);
      text-decoration: line-through;
    }

    /* Visually-hidden status announcement for screen readers. */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  `;

  @property({ type: String, reflect: true })
  status: TodoStatus = 'pending';

  private previousStatus: TodoStatus | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
    this.previousStatus = this.status;
  }

  override updated(changed: Map<string, unknown>): void {
    if (!changed.has('status')) return;
    const previous = (changed.get('status') as TodoStatus | undefined) ?? this.previousStatus;
    if (previous && previous !== this.status) {
      this.dispatchEvent(
        new CustomEvent<TuiTodoChangeDetail>('tui-todo-change', {
          detail: { status: this.status, previousStatus: previous },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this.previousStatus = this.status;
  }

  override render() {
    return html`
      <span class="dot" part="dot" aria-hidden="true">${DOT[this.status]}</span>
      <span class="sr-only">${STATUS_LABEL[this.status]}: </span>
      <span class="label" part="label"><slot></slot></span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-todo-item': TuiTodoItem;
  }
}
