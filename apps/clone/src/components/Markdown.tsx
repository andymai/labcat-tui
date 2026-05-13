import type { TuiMd } from '@labcat/tui';
import { Md } from '@labcat/tui-react';
import { upgradeMd } from '@labcat/tui-shiki';
import { useEffect, useRef } from 'react';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function renderInline(line: string): string {
  let out = escapeHtml(line);
  out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, (_, c) => `<strong>${c}</strong>`);
  out = out.replace(/_([^_]+)_/g, (_, c) => `<em>${c}</em>`);
  return out;
}

const FENCE_OPEN = /^```([a-zA-Z0-9_+\-#]*)$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const ORDERED_LIST = /^\d+\.\s+/;
const BULLET_LIST = /^[-*]\s+/;

/** Minimal markdown -> HTML covering the features Claude responses typically use. */
export function renderMarkdown(src: string): string {
  const lines = src.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';

    const fence = FENCE_OPEN.exec(line);
    if (fence) {
      const lang = fence[1] ?? '';
      i++;
      const code: string[] = [];
      while (i < lines.length && lines[i] !== '```') {
        code.push(lines[i] ?? '');
        i++;
      }
      if (i < lines.length) i++;
      const langClass = lang ? ` class="language-${lang}"` : '';
      out.push(`<pre><code${langClass}>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const hashes = heading[1] ?? '#';
      const text = heading[2] ?? '';
      const level = hashes.length;
      out.push(`<h${level}>${renderInline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (ORDERED_LIST.test(line)) {
      const items: string[] = [];
      let cur = lines[i];
      while (cur !== undefined && ORDERED_LIST.test(cur)) {
        items.push(`<li>${renderInline(cur.replace(ORDERED_LIST, ''))}</li>`);
        i++;
        cur = lines[i];
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    if (BULLET_LIST.test(line)) {
      const items: string[] = [];
      let cur = lines[i];
      while (cur !== undefined && BULLET_LIST.test(cur)) {
        items.push(`<li>${renderInline(cur.replace(BULLET_LIST, ''))}</li>`);
        i++;
        cur = lines[i];
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (line.trim().length === 0) {
      i++;
      continue;
    }

    const para: string[] = [];
    let cur = lines[i];
    while (cur !== undefined && cur.trim().length > 0 && !cur.startsWith('```')) {
      para.push(cur);
      i++;
      cur = lines[i];
    }
    out.push(`<p>${renderInline(para.join(' '))}</p>`);
  }
  return out.join('');
}

export function Markdown({ source }: { source: string }) {
  const ref = useRef<TuiMd | null>(null);
  const html = renderMarkdown(source);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fragment = document.createRange().createContextualFragment(html);
    el.replaceChildren(fragment);
    upgradeMd(el);
  }, [html]);

  return <Md ref={ref} />;
}
