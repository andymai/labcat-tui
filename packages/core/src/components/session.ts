import type { SessionStore } from '../commands/types.js';
import { devWarn } from '../util/env.js';
import { MODE_LIST, MODE_SET, MODE_TO_VAR, type Mode } from '../util/modes.js';

const Base: typeof HTMLElement =
  typeof HTMLElement !== 'undefined' ? HTMLElement : (class {} as unknown as typeof HTMLElement);

let activeSession: TuiSession | null = null;

/** Pull-only SessionStore: providers are called on each `read`. */
class TuiSessionStore implements SessionStore {
  private readonly providers = new Map<string, () => unknown>();

  register<T>(key: string, get: () => T): () => void {
    if (this.providers.has(key)) {
      devWarn(
        `<tui-session> provider "${key}" was overwritten; the previous provider is now unreachable.`,
      );
    }
    this.providers.set(key, get as () => unknown);
    return () => {
      // Only unregister if it's still the same provider we registered.
      if (this.providers.get(key) === (get as () => unknown)) {
        this.providers.delete(key);
      }
    };
  }

  read<T>(key: string): T | undefined {
    const fn = this.providers.get(key);
    if (!fn) return undefined;
    return fn() as T;
  }

  has(key: string): boolean {
    return this.providers.has(key);
  }

  keys(): string[] {
    return [...this.providers.keys()];
  }
}

/**
 * Returns the active session's store, or a detached store if no
 * `<tui-session>` is mounted. The detached store still works — it just isn't
 * shared with anything.
 */
export function getActiveSessionStore(): SessionStore {
  return activeSession?.store ?? detachedStore;
}

const detachedStore = new TuiSessionStore();

function isFormField(e: KeyboardEvent): boolean {
  // Walk the composed path so we see through shadow DOM. Custom elements
  // like <tui-prompt-input> contain an internal <input>; their host's
  // tagName is NOT 'INPUT', so a tagName check on `target` alone misses
  // the inner field and the global shortcuts fire while the user is
  // typing — preventing them from typing `?` or `/` mid-sentence.
  const path = typeof e.composedPath === 'function' ? e.composedPath() : [e.target];
  for (const node of path) {
    if (!(node instanceof HTMLElement)) continue;
    const tag = node.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (node.isContentEditable) return true;
  }
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

export type SessionMode = Mode;

/**
 * `<tui-session>` — High-level Light-DOM orchestrator. Holds the
 * document-level keyboard shortcuts so embedded `<tui-prompt-input>` /
 * `<tui-slash-overlay>` instances don't need to.
 *
 * Per SPEC §10.2:
 *   /           → open first descendant <tui-slash-overlay> if present;
 *                 else focus first descendant <tui-prompt-input>
 *                 (skipped in form fields — typing `/` in an input is just text)
 *   Cmd/Ctrl-K  → open first descendant <tui-slash-overlay>
 *   ?           → open the slash overlay (skipped in form fields)
 *   Escape      → close the slash overlay if open
 *
 * The `mode` attribute resolves to `--tui-active-mode-color`, which
 * descendant `<tui-prompt-input>` instances read for their caret + left
 * border. A prompt-input can set its own `mode` attribute to override.
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
  static get observedAttributes(): string[] {
    return ['mode'];
  }

  readonly store: SessionStore = new TuiSessionStore();

  get mode(): SessionMode | null {
    return (this.getAttribute('mode') as SessionMode | null) ?? null;
  }
  set mode(value: SessionMode | null) {
    if (value == null) this.removeAttribute('mode');
    else this.setAttribute('mode', value);
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === 'mode') this.applyMode(value);
  }

  private applyMode(value: string | null): void {
    if (value && MODE_SET.has(value as Mode)) {
      this.style.setProperty('--tui-active-mode-color', `var(${MODE_TO_VAR[value as Mode]})`);
      return;
    }
    if (value) {
      devWarn(`<tui-session> mode="${value}" is not a known mode (${MODE_LIST}); ignoring.`);
    }
    this.style.removeProperty('--tui-active-mode-color');
  }

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (activeSession !== this) return;
    if (isOptedOut(e.target as Element | null)) return;

    if (e.key === '/' && !isFormField(e)) {
      const overlay = this.querySelector('tui-slash-overlay');
      if (overlay) {
        e.preventDefault();
        (overlay as HTMLElement & { open?: boolean }).open = true;
        return;
      }
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

    if (e.key === '?' && !isFormField(e)) {
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

    if (activeSession && activeSession !== this) {
      devWarn(
        'Multiple <tui-session> mounted; the last-mounted instance owns document keyboard shortcuts.',
      );
    }
    activeSession = this;
    document.addEventListener('keydown', this.onKeyDown);

    // Re-apply any pre-mount mode now that we're in the DOM.
    this.applyMode(this.getAttribute('mode'));
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
