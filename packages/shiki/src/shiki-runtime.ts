import type { HighlighterCore } from 'shiki/core';
import { SUPPORTED_LANGS, type SupportedLang } from './grammars.js';

let highlighterPromise: Promise<HighlighterCore> | null = null;

async function createHighlighter(): Promise<HighlighterCore> {
  const { createHighlighterCore } = await import('shiki/core');
  const { createOnigurumaEngine } = await import('shiki/engine/oniguruma');

  const langImports: Record<SupportedLang, () => Promise<unknown>> = {
    ts: () => import('shiki/langs/typescript.mjs'),
    tsx: () => import('shiki/langs/tsx.mjs'),
    js: () => import('shiki/langs/javascript.mjs'),
    jsx: () => import('shiki/langs/jsx.mjs'),
    json: () => import('shiki/langs/json.mjs'),
    bash: () => import('shiki/langs/bash.mjs'),
    python: () => import('shiki/langs/python.mjs'),
    markdown: () => import('shiki/langs/markdown.mjs'),
  };

  const langs = await Promise.all(SUPPORTED_LANGS.map((l) => langImports[l]()));

  return createHighlighterCore({
    langs: langs as never[],
    themes: [],
    engine: createOnigurumaEngine(import('shiki/wasm')),
  });
}

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter().catch((err) => {
      highlighterPromise = null;
      throw err;
    });
  }
  return highlighterPromise;
}

export type { HighlighterCore };
