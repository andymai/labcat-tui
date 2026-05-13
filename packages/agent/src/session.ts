import {
  AgentAbortError,
  type AgentEvent,
  type AgentTransport,
  type ContentBlock,
  type ToolUseBlock,
  type Turn,
} from './types.js';

export interface AgentSessionOptions {
  transport: AgentTransport;
  /** Optional seed turns (e.g., restored from storage). Default: []. */
  initialTurns?: readonly Turn[];
  /** Override the id generator (mostly for tests). */
  generateId?: () => string;
  /** Called when the transport throws (after the error is recorded on the turn). */
  onError?: (error: Error) => void;
}

export interface AgentSession {
  readonly turns: readonly Turn[];
  readonly isStreaming: boolean;
  appendUserMessage(text: string): Turn;
  appendToolResults(
    results: ReadonlyArray<{ toolUseId: string; content: string; isError?: boolean }>,
  ): Turn;
  send(): Promise<void>;
  abort(): void;
  clear(): void;
  subscribe(listener: () => void): () => void;
}

function defaultId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `t_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function tryParseJson(json: string): unknown {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function createAgentSession(opts: AgentSessionOptions): AgentSession {
  const { transport, generateId = defaultId, onError } = opts;

  let turns: Turn[] = opts.initialTurns ? [...opts.initialTurns] : [];
  let isStreaming = false;
  let abortController: AbortController | null = null;
  const listeners = new Set<() => void>();

  function emit(): void {
    for (const l of listeners) l();
  }

  function replaceTurn(turnId: string, updater: (t: Turn) => Turn): void {
    const idx = turns.findIndex((t) => t.id === turnId);
    const target = turns[idx];
    if (!target) return;
    const next = updater(target);
    turns = [...turns.slice(0, idx), next, ...turns.slice(idx + 1)];
  }

  function replaceBlock(
    turnId: string,
    blockId: string,
    updater: (b: ContentBlock) => ContentBlock,
  ): void {
    replaceTurn(turnId, (t) => {
      const idx = t.content.findIndex((b) => blockKey(b) === blockId);
      const target = t.content[idx];
      if (!target) return t;
      const nextBlock = updater(target);
      return {
        ...t,
        content: [...t.content.slice(0, idx), nextBlock, ...t.content.slice(idx + 1)],
      };
    });
  }

  function appendUserMessage(text: string): Turn {
    const turn: Turn = {
      id: generateId(),
      role: 'user',
      content: [{ type: 'text', text }],
      createdAt: Date.now(),
      complete: true,
    };
    turns = [...turns, turn];
    emit();
    return turn;
  }

  function appendToolResults(
    results: ReadonlyArray<{ toolUseId: string; content: string; isError?: boolean }>,
  ): Turn {
    const turn: Turn = {
      id: generateId(),
      role: 'user',
      content: results.map((r) => ({
        type: 'tool_result',
        toolUseId: r.toolUseId,
        content: r.content,
        ...(r.isError !== undefined ? { isError: r.isError } : {}),
      })),
      createdAt: Date.now(),
      complete: true,
    };
    turns = [...turns, turn];
    emit();
    return turn;
  }

  function applyEvent(event: AgentEvent): void {
    switch (event.type) {
      case 'turn_start': {
        const turn: Turn = {
          id: event.turnId,
          role: event.role,
          content: [],
          createdAt: Date.now(),
          complete: false,
        };
        turns = [...turns, turn];
        break;
      }
      case 'block_start': {
        replaceTurn(event.turnId, (t) => ({
          ...t,
          content: [...t.content, withBlockKey(event.block, event.blockId)],
        }));
        break;
      }
      case 'text_delta': {
        replaceBlock(event.turnId, event.blockId, (b) => {
          if (b.type !== 'text') return b;
          return { ...b, text: b.text + event.delta };
        });
        break;
      }
      case 'thinking_delta': {
        replaceBlock(event.turnId, event.blockId, (b) => {
          if (b.type !== 'thinking') return b;
          return { ...b, thinking: b.thinking + event.delta };
        });
        break;
      }
      case 'tool_input_delta': {
        replaceBlock(event.turnId, event.blockId, (b) => {
          if (b.type !== 'tool_use') return b;
          const nextJson = (b.inputJson ?? '') + event.deltaJson;
          const parsed = tryParseJson(nextJson);
          return {
            ...b,
            inputJson: nextJson,
            input: parsed !== null ? parsed : b.input,
          };
        });
        break;
      }
      case 'block_complete': {
        replaceBlock(event.turnId, event.blockId, (b) => {
          if (b.type !== 'tool_use') return b;
          const parsed = tryParseJson(b.inputJson ?? '');
          return parsed !== null ? { ...b, input: parsed } : b;
        });
        break;
      }
      case 'turn_complete': {
        replaceTurn(event.turnId, (t) => ({
          ...t,
          complete: true,
          ...(event.stopReason !== undefined ? { stopReason: event.stopReason } : {}),
        }));
        break;
      }
      case 'error':
        throw event.error;
    }
    emit();
  }

  async function send(): Promise<void> {
    if (isStreaming) {
      throw new Error('Agent is already streaming; await the previous send() or abort() first.');
    }
    isStreaming = true;
    abortController = new AbortController();
    emit();
    try {
      const stream = transport.send(turns, abortController.signal);
      for await (const event of stream) {
        if (abortController.signal.aborted) throw new AgentAbortError();
        applyEvent(event);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
      if (!(error instanceof AgentAbortError)) throw error;
    } finally {
      isStreaming = false;
      abortController = null;
      emit();
    }
  }

  function abort(): void {
    abortController?.abort();
  }

  function clear(): void {
    turns = [];
    emit();
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return {
    get turns(): readonly Turn[] {
      return turns;
    },
    get isStreaming(): boolean {
      return isStreaming;
    },
    appendUserMessage,
    appendToolResults,
    send,
    abort,
    clear,
    subscribe,
  };
}

const BLOCK_KEY = Symbol.for('@labcat/tui-agent/blockKey');

interface KeyedBlock {
  [BLOCK_KEY]?: string;
}

function withBlockKey<B extends ContentBlock>(block: B, blockId: string): B {
  const next = { ...block } as B & KeyedBlock;
  next[BLOCK_KEY] = blockId;
  if (block.type === 'tool_use') {
    const tu = next as B & ToolUseBlock & KeyedBlock;
    if (!tu.id) tu.id = blockId;
  }
  return next;
}

/**
 * Returns the stable transport-assigned block id. Falls back to `tool_use.id`
 * for tool_use blocks (which carry their id natively) so renderers can use
 * `blockKey(b)` uniformly as a React key.
 */
export function blockKey(block: ContentBlock): string {
  const keyed = block as ContentBlock & KeyedBlock;
  if (keyed[BLOCK_KEY]) return keyed[BLOCK_KEY];
  if (block.type === 'tool_use') return block.id;
  if (block.type === 'tool_result') return `result:${block.toolUseId}`;
  return '';
}
