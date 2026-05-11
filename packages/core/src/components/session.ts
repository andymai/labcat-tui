/// <reference types="vite/client" />

const Base: typeof HTMLElement =
  typeof HTMLElement !== 'undefined' ? HTMLElement : (class {} as unknown as typeof HTMLElement);

function isDev(): boolean {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.DEV !== false;
    }
  } catch {
    /* not in a bundler env */
  }
  return true;
}

let activeSession: TuiSession | null = null;

function isFormField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

function isOptedOut(el: Element | null): boolean {
  let node: Element | null = el;
  while (node) {
    if (node.hasAttribute?.('ignore-shortcuts')) return true;
    node = node.parentElement;
  }
  return false;
}

/**
 * `<tui-session>` — High-level Light-DOM orchestrator. Holds the
 * document-level keyboard shortcuts so embedded `<tui-prompt-input>` /
 * `<tui-slash-overlay>` instances don't need to.
 *
 * Per SPEC §10.2:
 *   /           → focus first descendant <tui-prompt-input> (skipped in form fields)
 *   Cmd/Ctrl-K  → open first descendant <tui-slash-overlay>
 *   ?           → open the slash overlay (skipped in form fields)
 *   Escape      → close the slash overlay if open
 *
 * Multiple sessions on a page: **last-mounted wins** shortcut routing
 * (with `console.warn` in dev). Subtrees opt out via the
 * `ignore-shortcuts` attribute on any ancestor element.
 *
 * Light DOM (per SPEC §7.2) — slotted children behave naturally in any
 * framework. Layout is consumer-driven; the element only adds the
 * `tui-session` class.
 */
export class TuiSession extends Base {
  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (activeSession !== this) return;
    if (isOptedOut(e.target as Element | null)) return;

    if (e.key === '/' && !isFormField(e.target)) {
      const input = this.querySelector<HTMLElement>('tui-prompt-input');
      if (input) {
        e.preventDefault();
        input.focus();
      }
      return;
    }

    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      const overlay = this.querySelector('tui-slash-overlay');
      if (overlay) {
        e.preventDefault();
        (overlay as HTMLElement & { open?: boolean }).open = true;
      }
      return;
    }

    if (e.key === '?' && !isFormField(e.target)) {
      const overlay = this.querySelector('tui-slash-overlay');
      if (overlay) {
        e.preventDefault();
        (overlay as HTMLElement & { open?: boolean }).open = true;
      }
      return;
    }

    if (e.key === 'Escape') {
      const overlay = this.querySelector('tui-slash-overlay');
      if (overlay && (overlay as HTMLElement & { open?: boolean }).open) {
        e.preventDefault();
        (overlay as HTMLElement & { open?: boolean }).open = false;
      }
    }
  };

  connectedCallback(): void {
    if (!this.classList.contains('tui-session')) this.classList.add('tui-session');

    if (activeSession && activeSession !== this && isDev() && typeof console !== 'undefined') {
      console.warn(
        '[@labcat/tui] Multiple <tui-session> mounted; the last-mounted instance owns document keyboard shortcuts.',
      );
    }
    activeSession = this;
    document.addEventListener('keydown', this.onKeyDown);
  }

  disconnectedCallback(): void {
    document.removeEventListener('keydown', this.onKeyDown);
    if (activeSession === this) activeSession = null;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('tui-session')) {
  customElements.define('tui-session', TuiSession);
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-session': TuiSession;
  }
}
