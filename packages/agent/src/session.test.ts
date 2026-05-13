import { describe, expect, it, vi } from 'vitest';
import { blockKey, createAgentSession } from './session.js';
import type { AgentEvent, AgentTransport, ToolUseBlock } from './types.js';

function makeTransport(events: AgentEvent[]): AgentTransport {
  return {
    async *send(): AsyncIterable<AgentEvent> {
      for (const e of events) yield e;
    },
  };
}

describe('createAgentSession', () => {
  it('appends user messages with a single text block', () => {
    const session = createAgentSession({ transport: makeTransport([]) });
    const turn = session.appendUserMessage('hi');
    expect(session.turns).toHaveLength(1);
    expect(session.turns[0]).toBe(turn);
    expect(turn.role).toBe('user');
    expect(turn.content).toEqual([{ type: 'text', text: 'hi' }]);
    expect(turn.complete).toBe(true);
  });

  it('streams text deltas into a single assistant text block', async () => {
    const turnId = 'asst_1';
    const blockId = 'b_text';
    const session = createAgentSession({
      transport: makeTransport([
        { type: 'turn_start', turnId, role: 'assistant' },
        { type: 'block_start', turnId, blockId, block: { type: 'text', text: '' } },
        { type: 'text_delta', turnId, blockId, delta: 'Hello' },
        { type: 'text_delta', turnId, blockId, delta: ', world' },
        { type: 'block_complete', turnId, blockId },
        { type: 'turn_complete', turnId, stopReason: 'end_turn' },
      ]),
    });
    await session.send();
    const t = session.turns[0];
    if (!t) throw new Error('expected one turn');
    expect(t.role).toBe('assistant');
    expect(t.complete).toBe(true);
    expect(t.stopReason).toBe('end_turn');
    expect(t.content).toHaveLength(1);
    expect(t.content[0]).toMatchObject({ type: 'text', text: 'Hello, world' });
  });

  it('preserves interleaved text and tool_use blocks in order', async () => {
    const turnId = 't1';
    const session = createAgentSession({
      transport: makeTransport([
        { type: 'turn_start', turnId, role: 'assistant' },
        { type: 'block_start', turnId, blockId: 'b1', block: { type: 'text', text: '' } },
        { type: 'text_delta', turnId, blockId: 'b1', delta: 'Reading...' },
        { type: 'block_complete', turnId, blockId: 'b1' },
        {
          type: 'block_start',
          turnId,
          blockId: 'b2',
          block: {
            type: 'tool_use',
            id: 'toolu_1',
            name: 'Read',
            input: {},
            inputJson: '',
          },
        },
        {
          type: 'tool_input_delta',
          turnId,
          blockId: 'b2',
          deltaJson: '{"path":"src/index.ts"}',
        },
        { type: 'block_complete', turnId, blockId: 'b2' },
        { type: 'block_start', turnId, blockId: 'b3', block: { type: 'text', text: '' } },
        { type: 'text_delta', turnId, blockId: 'b3', delta: ' — done.' },
        { type: 'block_complete', turnId, blockId: 'b3' },
        { type: 'turn_complete', turnId, stopReason: 'tool_use' },
      ]),
    });
    await session.send();
    const blocks = session.turns[0]?.content ?? [];
    expect(blocks.map((b) => b.type)).toEqual(['text', 'tool_use', 'text']);
    expect((blocks[1] as ToolUseBlock).input).toEqual({ path: 'src/index.ts' });
  });

  it('parses tool_use input JSON incrementally and finalizes on block_complete', async () => {
    const turnId = 't1';
    const session = createAgentSession({
      transport: makeTransport([
        { type: 'turn_start', turnId, role: 'assistant' },
        {
          type: 'block_start',
          turnId,
          blockId: 'b1',
          block: { type: 'tool_use', id: 'toolu_1', name: 'Bash', input: {}, inputJson: '' },
        },
        { type: 'tool_input_delta', turnId, blockId: 'b1', deltaJson: '{"cmd' },
        { type: 'tool_input_delta', turnId, blockId: 'b1', deltaJson: '":"ls"}' },
        { type: 'block_complete', turnId, blockId: 'b1' },
        { type: 'turn_complete', turnId, stopReason: 'tool_use' },
      ]),
    });
    await session.send();
    const first = session.turns[0]?.content[0] as ToolUseBlock | undefined;
    expect(first?.input).toEqual({ cmd: 'ls' });
  });

  it('notifies subscribers on every state change', async () => {
    const turnId = 't1';
    const listener = vi.fn();
    const session = createAgentSession({
      transport: makeTransport([
        { type: 'turn_start', turnId, role: 'assistant' },
        { type: 'block_start', turnId, blockId: 'b1', block: { type: 'text', text: '' } },
        { type: 'text_delta', turnId, blockId: 'b1', delta: 'hi' },
        { type: 'turn_complete', turnId },
      ]),
    });
    session.subscribe(listener);
    session.appendUserMessage('go');
    await session.send();
    // 1 (append) + isStreaming on + 4 events + isStreaming off
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(5);
  });

  it('toggles isStreaming around send()', async () => {
    const session = createAgentSession({
      transport: {
        async *send(): AsyncIterable<AgentEvent> {
          yield { type: 'turn_start', turnId: 't', role: 'assistant' };
          yield { type: 'turn_complete', turnId: 't' };
        },
      },
    });
    expect(session.isStreaming).toBe(false);
    const promise = session.send();
    expect(session.isStreaming).toBe(true);
    await promise;
    expect(session.isStreaming).toBe(false);
  });

  it('rejects concurrent send() calls', async () => {
    const session = createAgentSession({
      transport: {
        async *send(): AsyncIterable<AgentEvent> {
          yield { type: 'turn_start', turnId: 't', role: 'assistant' };
          await new Promise((r) => setTimeout(r, 5));
          yield { type: 'turn_complete', turnId: 't' };
        },
      },
    });
    const first = session.send();
    await expect(session.send()).rejects.toThrow(/already streaming/);
    await first;
  });

  it('abort() cancels in-flight stream without throwing', async () => {
    const session = createAgentSession({
      transport: {
        async *send(_turns, signal): AsyncIterable<AgentEvent> {
          yield { type: 'turn_start', turnId: 't', role: 'assistant' };
          await new Promise<void>((resolve, reject) => {
            const id = setTimeout(resolve, 1000);
            signal?.addEventListener('abort', () => {
              clearTimeout(id);
              reject(new Error('aborted'));
            });
          });
        },
      },
    });
    const pending = session.send();
    session.abort();
    await pending;
    expect(session.isStreaming).toBe(false);
  });

  it('clear() empties the turn list', () => {
    const session = createAgentSession({ transport: makeTransport([]) });
    session.appendUserMessage('a');
    session.appendUserMessage('b');
    expect(session.turns).toHaveLength(2);
    session.clear();
    expect(session.turns).toHaveLength(0);
  });

  it('appendToolResults adds a user turn of tool_result blocks', () => {
    const session = createAgentSession({ transport: makeTransport([]) });
    const turn = session.appendToolResults([
      { toolUseId: 'toolu_1', content: 'ok' },
      { toolUseId: 'toolu_2', content: 'oops', isError: true },
    ]);
    expect(turn.role).toBe('user');
    expect(turn.content).toEqual([
      { type: 'tool_result', toolUseId: 'toolu_1', content: 'ok' },
      { type: 'tool_result', toolUseId: 'toolu_2', content: 'oops', isError: true },
    ]);
  });

  it('blockKey returns the transport-assigned id for blocks set via block_start', async () => {
    const session = createAgentSession({
      transport: makeTransport([
        { type: 'turn_start', turnId: 't', role: 'assistant' },
        { type: 'block_start', turnId: 't', blockId: 'magic', block: { type: 'text', text: '' } },
        { type: 'turn_complete', turnId: 't' },
      ]),
    });
    await session.send();
    const block = session.turns[0]?.content[0];
    if (!block) throw new Error('expected one block');
    expect(blockKey(block)).toBe('magic');
  });
});
