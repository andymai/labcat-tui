import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type TodoListKind = 'flat' | 'grouped';

/**
 * `<tui-todo-list>` — Dumb list container. Items register themselves via
 * shadow DOM slot — the list does NOT query or aggregate children.
 *
 * @attr {"flat"|"grouped"} kind - Layout variant
 * @slot - `<tui-todo-item>` children
 */
@customElement('tui-todo-list')
export class TuiTodoList extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--tui-font-mono);
      color: var(--tui-fg);
      line-height: var(--tui-leading-body);
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    :host([kind='grouped']) .list {
      gap: 0.5rem;
    }
  `;

  @property({ type: String, reflect: true })
  kind: TodoListKind = 'flat';

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'list');
  }

  override render() {
    return html`<div class="list"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-todo-list': TuiTodoList;
  }
}
