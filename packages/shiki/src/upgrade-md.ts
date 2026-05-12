import './code-block.js';

export interface UpgradeMdOptions {
  /** Optional whitelist; defaults to all known languages. */
  langs?: string[];
  /** Add copy buttons even when the upgraded block has no filename. Default true. */
  copy?: boolean;
}

const LANG_CLASS = /^language-([a-zA-Z0-9_+\-#]+)$/;

function extractLang(code: HTMLElement): string | null {
  for (const cls of Array.from(code.classList)) {
    const match = LANG_CLASS.exec(cls);
    if (match) return match[1] ?? null;
  }
  const data = code.dataset.lang;
  return data ?? null;
}

export function upgradeMd(root: ParentNode, opts: UpgradeMdOptions = {}): void {
  const copy = opts.copy ?? true;
  const allow = opts.langs ? new Set(opts.langs.map((l) => l.toLowerCase())) : null;

  const blocks = root.querySelectorAll<HTMLPreElement>('pre:not([data-tui-upgraded])');
  for (const pre of blocks) {
    const code = pre.querySelector<HTMLElement>(':scope > code');
    if (!code) continue;
    const lang = extractLang(code);
    if (!lang) continue;
    if (allow && !allow.has(lang.toLowerCase())) continue;

    const block = document.createElement('tui-code-block');
    block.setAttribute('lang', lang);
    if (!copy) block.setAttribute('no-copy', '');
    block.textContent = code.textContent ?? '';
    pre.replaceWith(block);
    block.setAttribute('data-tui-upgraded', '');
  }
}

export function watchMd(root: HTMLElement, opts: UpgradeMdOptions = {}): () => void {
  upgradeMd(root, opts);
  const observer = new MutationObserver(() => upgradeMd(root, opts));
  observer.observe(root, { childList: true, subtree: true });
  return () => observer.disconnect();
}
