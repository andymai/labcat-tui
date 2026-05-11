import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TuiTodoChangeDetail } from '../events/types.js';

export type TodoStatus = 'pending' | 'in-progress' | 'completed';

const ARIA_CHECKED: Record<TodoStatus, 'true' | 'false' | 'mixed'> = {
  pending: 'false',
  'in-progress': 'mixed',
  completed: 'true',
};

const DOT: Record<TodoStatus, string> = {
  pending: '☐',
  'in-progress': '◐',
  completed: '☑',
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
  `;

  @property({ type: String, reflect: true })
  status: TodoStatus = 'pending';

  private previousStatus: TodoStatus | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
    this.setAttribute('aria-checked', ARIA_CHECKED[this.status]);
    this.previousStatus = this.status;
  }

  override updated(changed: Map<string, unknown>): void {
    if (!changed.has('status')) return;
    this.setAttribute('aria-checked', ARIA_CHECKED[this.status]);
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
      <span class="label" part="label"><slot></slot></span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-todo-item': TuiTodoItem;
  }
}
