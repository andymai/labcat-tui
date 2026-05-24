import { chunkText, type MockEvent } from '@labcat/tui-agent/mock';

const turnId = 'asst_code_1';

const markdown = `Sure. \`useSyncExternalStore\` is the canonical way to subscribe a React tree to an external mutable source without tearing under concurrent rendering. Here's the minimal shape:

\`\`\`ts
import { useSyncExternalStore } from 'react';

function useStore<T>(store: { subscribe: (l: () => void) => () => void; get: () => T }): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
\`\`\`

Two things to watch:

1. **Snapshot identity.** \`get()\` must return a stable reference when nothing changed — returning a fresh array each call will thrash.
2. **SSR snapshot.** The third argument is the server snapshot. Pass the same getter only if your store is SSR-safe; otherwise return a sentinel.

The pattern composes nicely with redux-style stores, signals, or our own \`createAgentSession\`:

\`\`\`ts
function useTurns(session: AgentSession) {
  return useSyncExternalStore(
    (l) => session.subscribe(l),
    () => session.turns,
    () => session.turns,
  );
}
\`\`\``;

export const codeBlocks: MockEvent[] = [
  { type: 'turn_start', turnId, role: 'assistant' },
  {
    type: 'block_start',
    turnId,
    blockId: 'b_text',
    block: { type: 'text', text: '' },
  },
  ...chunkText(markdown, turnId, 'b_text', { wordsPerChunk: [2, 5] }),
  { type: 'block_complete', turnId, blockId: 'b_text' },
  { type: 'turn_complete', turnId, stopReason: 'end_turn' },
];
