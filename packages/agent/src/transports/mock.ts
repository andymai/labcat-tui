import { AgentAbortError, type AgentEvent, type AgentTransport } from '../types.js';

export type MockEvent = AgentEvent & {
  /** Delay in ms before this event is emitted. Overrides the default for its type. */
  delay?: number;
};

export interface MockTranscript {
  /** Sequence of events to emit when `send()` is called. */
  events: MockEvent[];
  /** Optional label for debugging / picker UIs. */
  label?: string;
}

export interface CreateMockTransportOptions {
  /** Multiplies all default delays. 1 = realistic, 0 = instant, 5 = slow demo. Default 1. */
  speed?: number;
  /** Per-event-type default delay overrides (ms). */
  defaultDelays?: Partial<Record<AgentEvent['type'], number>>;
}

const BUILTIN_DELAYS: Record<AgentEvent['type'], number> = {
  turn_start: 120,
  block_start: 60,
  text_delta: 18,
  thinking_delta: 14,
  tool_input_delta: 22,
  block_complete: 30,
  turn_complete: 80,
  error: 0,
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AgentAbortError());
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(new AgentAbortError());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Replays a hand-authored `AgentEvent[]` as if streamed from a real backend.
 * Honors per-event `delay` overrides; falls back to type-keyed defaults
 * multiplied by `speed`. Aborting the signal rejects the in-flight sleep.
 */
export function createMockTransport(
  transcripts: MockTranscript | MockEvent[] | (() => MockTranscript | MockEvent[]),
  options: CreateMockTransportOptions = {},
): AgentTransport {
  const { speed = 1, defaultDelays } = options;
  const resolveDelay = (event: MockEvent): number => {
    if (typeof event.delay === 'number') return event.delay * speed;
    const fromOverride = defaultDelays?.[event.type];
    if (typeof fromOverride === 'number') return fromOverride * speed;
    return BUILTIN_DELAYS[event.type] * speed;
  };

  return {
    async *send(_turns, signal): AsyncIterable<AgentEvent> {
      const resolved = typeof transcripts === 'function' ? transcripts() : transcripts;
      const events = Array.isArray(resolved) ? resolved : resolved.events;
      for (const event of events) {
        await sleep(resolveDelay(event), signal);
        if (signal?.aborted) throw new AgentAbortError();
        const { delay: _omit, ...rest } = event;
        void _omit;
        yield rest as AgentEvent;
      }
    },
  };
}

/**
 * Helper: split a string into N small text_delta events with realistic
 * token-sized chunks (1–4 words per chunk). Useful when authoring transcripts
 * — you write the final text once, the helper produces the deltas.
 */
export function chunkText(
  text: string,
  turnId: string,
  blockId: string,
  options: { wordsPerChunk?: [number, number]; delay?: number } = {},
): MockEvent[] {
  const [minWords, maxWords] = options.wordsPerChunk ?? [1, 3];
  const words = text.split(/(\s+)/);
  const out: MockEvent[] = [];
  let buffer = '';
  let wordsThisChunk = 0;
  const target = (): number => minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  let chunkTarget = target();
  for (const piece of words) {
    buffer += piece;
    if (piece.trim().length > 0) wordsThisChunk++;
    if (wordsThisChunk >= chunkTarget) {
      out.push({
        type: 'text_delta',
        turnId,
        blockId,
        delta: buffer,
        ...(options.delay !== undefined ? { delay: options.delay } : {}),
      });
      buffer = '';
      wordsThisChunk = 0;
      chunkTarget = target();
    }
  }
  if (buffer.length > 0) {
    out.push({
      type: 'text_delta',
      turnId,
      blockId,
      delta: buffer,
      ...(options.delay !== undefined ? { delay: options.delay } : {}),
    });
  }
  return out;
}
