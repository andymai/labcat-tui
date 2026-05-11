/**
 * `<tui-md>` — TUI-styled prose container. **Light DOM**, no shadow root,
 * so consumer prose CSS cascades in. The element adds a `tui-md` class on
 * connect; the prose styles live in `dist/styles.css` under `.tui-md *`.
 *
 * Consumer-supplied HTML is trusted; the consumer must sanitize before
 * slotting. See SPEC §17.1.
 */
const Base: typeof HTMLElement =
  typeof HTMLElement !== 'undefined' ? HTMLElement : (class {} as unknown as typeof HTMLElement);

export class TuiMd extends Base {
  connectedCallback(): void {
    if (!this.classList.contains('tui-md')) this.classList.add('tui-md');
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('tui-md')) {
  customElements.define('tui-md', TuiMd);
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-md': TuiMd;
  }
}
