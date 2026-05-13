'use client';

import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { type AgentSession, type AgentSessionOptions, createAgentSession } from '../session.js';
import type { Turn } from '../types.js';

export interface UseAgentSessionResult {
  turns: readonly Turn[];
  isStreaming: boolean;
  send: (text: string) => Promise<void>;
  abort: () => void;
  clear: () => void;
  /**
   * Append tool results and continue the agentic loop. Use this when the
   * previous turn stopped with `stop_reason === 'tool_use'` and you've
   * executed the tools out-of-band.
   */
  respondWithToolResults: (
    results: ReadonlyArray<{ toolUseId: string; content: string; isError?: boolean }>,
  ) => Promise<void>;
  session: AgentSession;
}

export interface UseAgentSessionOptions extends AgentSessionOptions {
  /**
   * Reuse an existing session instance instead of creating one. Useful when
   * the session is hoisted (e.g., shared across routes).
   */
  session?: AgentSession;
}

/**
 * React binding for `createAgentSession`. Subscribes via
 * `useSyncExternalStore` so renders are concurrent-mode safe and tear-free.
 */
export function useAgentSession(opts: UseAgentSessionOptions): UseAgentSessionResult {
  const sessionRef = useRef<AgentSession | null>(opts.session ?? null);
  if (!sessionRef.current) {
    sessionRef.current = createAgentSession(opts);
  }
  const session = sessionRef.current;

  const subscribe = useCallback((listener: () => void) => session.subscribe(listener), [session]);
  const getTurns = useCallback((): readonly Turn[] => session.turns, [session]);
  const getStreaming = useCallback((): boolean => session.isStreaming, [session]);

  const turns = useSyncExternalStore(subscribe, getTurns, getTurns);
  const isStreaming = useSyncExternalStore(subscribe, getStreaming, getStreaming);

  const send = useCallback(
    async (text: string): Promise<void> => {
      session.appendUserMessage(text);
      await session.send();
    },
    [session],
  );

  const respondWithToolResults = useCallback(
    async (
      results: ReadonlyArray<{ toolUseId: string; content: string; isError?: boolean }>,
    ): Promise<void> => {
      session.appendToolResults(results);
      await session.send();
    },
    [session],
  );

  const abort = useCallback(() => session.abort(), [session]);
  const clear = useCallback(() => session.clear(), [session]);

  return useMemo(
    () => ({ turns, isStreaming, send, respondWithToolResults, abort, clear, session }),
    [turns, isStreaming, send, respondWithToolResults, abort, clear, session],
  );
}
