import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TuiThemeChangeDetail } from '../events/types.js';
import { resolveTheme, themeToCssVars } from '../theme/index.js';
import type { ThemeDefinition } from '../theme/index.js';

/**
 * `<tui-theme-provider>` — wraps a subtree and applies a theme via CSS custom
 * properties on `:host`. Variables inherit into both shadow children and
 * slotted light-DOM children.
 *
 * @attr {string} theme - Name of a built-in theme
 * @slot - Subtree to theme
 * @fires tui-theme-change - `{ from, to }` when the theme changes
 */
@customElement('tui-theme-provider')
export class TuiThemeProvider extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: String, reflect: true })
  theme: string | ThemeDefinition = 'claude';

  private currentName = '';

  override willUpdate(changed: Map<string, unknown>): void {
    if (!changed.has('theme')) return;
    const resolved = resolveTheme(this.theme);
    const previous = this.currentName;
    const next = resolved.name;
    this.applyVars(resolved);
    this.currentName = next;
    if (previous && previous !== next) {
      this.dispatchEvent(
        new CustomEvent<TuiThemeChangeDetail>('tui-theme-change', {
          detail: { from: previous, to: next },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private applyVars(theme: ThemeDefinition): void {
    const vars = themeToCssVars(theme);
    for (const [key, value] of Object.entries(vars)) {
      this.style.setProperty(key, value);
    }
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-theme-provider': TuiThemeProvider;
  }
}
