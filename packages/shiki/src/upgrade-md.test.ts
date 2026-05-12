import { describe, expect, it } from 'vitest';
import { upgradeMd, watchMd } from './upgrade-md.js';

function makePreCode(lang: string, code: string): HTMLPreElement {
  const pre = document.createElement('pre');
  const codeEl = document.createElement('code');
  codeEl.className = `language-${lang}`;
  codeEl.textContent = code;
  pre.appendChild(codeEl);
  return pre;
}

function makeHost(...children: Element[]): HTMLElement {
  const host = document.createElement('div');
  for (const c of children) host.appendChild(c);
  document.body.appendChild(host);
  return host;
}

describe('upgradeMd', () => {
  it('replaces fenced <pre><code class="language-ts"> with <tui-code-block>', () => {
    const host = makeHost(makePreCode('ts', 'const x = 1;'), makePreCode('bash', 'ls -la'));
    upgradeMd(host);
    expect(host.querySelectorAll('pre').length).toBe(0);
    const blocks = host.querySelectorAll('tui-code-block');
    expect(blocks.length).toBe(2);
    expect(blocks[0]?.getAttribute('lang')).toBe('ts');
    expect(blocks[1]?.getAttribute('lang')).toBe('bash');
    host.remove();
  });

  it('leaves pre blocks without a language class alone', () => {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = 'plain text';
    pre.appendChild(code);
    const host = makeHost(pre);
    upgradeMd(host);
    expect(host.querySelectorAll('pre').length).toBe(1);
    expect(host.querySelectorAll('tui-code-block').length).toBe(0);
    host.remove();
  });

  it('honors the langs whitelist', () => {
    const host = makeHost(makePreCode('ts', 'a'), makePreCode('python', 'b'));
    upgradeMd(host, { langs: ['ts'] });
    expect(host.querySelectorAll('tui-code-block').length).toBe(1);
    expect(host.querySelector('tui-code-block')?.getAttribute('lang')).toBe('ts');
    expect(host.querySelector('pre code.language-python')).not.toBeNull();
    host.remove();
  });

  it('marks upgraded blocks so re-runs are idempotent', () => {
    const host = makeHost(makePreCode('ts', 'x'));
    upgradeMd(host);
    upgradeMd(host);
    expect(host.querySelectorAll('tui-code-block').length).toBe(1);
    host.remove();
  });

  it('propagates no-copy when copy: false', () => {
    const host = makeHost(makePreCode('ts', 'x'));
    upgradeMd(host, { copy: false });
    expect(host.querySelector('tui-code-block')?.hasAttribute('no-copy')).toBe(true);
    host.remove();
  });
});

describe('watchMd', () => {
  it('upgrades blocks added after the watcher is installed', async () => {
    const host = makeHost();
    const stop = watchMd(host);
    host.appendChild(makePreCode('ts', 'const x = 1;'));
    await new Promise((r) => setTimeout(r, 20));
    expect(host.querySelectorAll('tui-code-block').length).toBe(1);
    stop();
    host.remove();
  });

  it('stops upgrading after teardown', async () => {
    const host = makeHost();
    const stop = watchMd(host);
    stop();
    host.appendChild(makePreCode('ts', 'x'));
    await new Promise((r) => setTimeout(r, 20));
    expect(host.querySelectorAll('tui-code-block').length).toBe(0);
    host.remove();
  });
});
