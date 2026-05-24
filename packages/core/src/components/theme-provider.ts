import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TuiThemeChangeDetail } from '../events/types.js';
import type { ThemeDefinition } from '../theme/index.js';
import { resolveTheme, themeToCssVars } from '../theme/index.js';

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
  private appliedKeys: Set<string> = new Set();

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
    const nextKeys = new Set(Object.keys(vars));

    // Clear any var the previous theme set that the new one omits. Without
    // this, an optional token like --tui-surface-2 from the previous theme
    // would leak through when switching to a theme that doesn't define it.
    for (const key of this.appliedKeys) {
      if (!nextKeys.has(key)) this.style.removeProperty(key);
    }

    for (const [key, value] of Object.entries(vars)) {
      this.style.setProperty(key, value);
    }
    this.appliedKeys = nextKeys;
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
