import { describe, expect, it } from 'vitest';
import { AgentAbortError, type AgentEvent, type Turn } from '../types.js';
import {
  type AnthropicMessagesClient,
  type AnthropicMessagesParams,
  createAnthropicTransport,
} from './anthropic.js';

// The SDK's stream event union is intentionally not exported from anthropic.ts
// (it's an implementation detail of the adapter). Tests describe events
// structurally — the real type guard is `pnpm test` against the adapter's
// branch behavior.
type StreamEvent = Record<string, unknown> & { type: string };

function createMockClient(events: StreamEvent[]): {
  client: AnthropicMessagesClient;
  capturedParams: { value: AnthropicMessagesParams | null };
  controller: AbortController;
} {
  const capturedParams: { value: AnthropicMessagesParams | null } = { value: null };
  const controller = new AbortController();
  const client: AnthropicMessagesClient = {
    messages: {
      stream(params) {
        capturedParams.value = params;
        const stream = {
          controller,
          async *[Symbol.asyncIterator]() {
            for (const event of events) {
              // Yield asynchronously so the consumer's signal.aborted check
              // between events has a chance to observe an abort that fires
              // mid-stream.
              await Promise.resolve();
              yield event;
            }
          },
        };
        return stream as ReturnType<AnthropicMessagesClient['messages']['stream']>;
      },
    },
  };
  return { client, capturedParams, controller };
}

async function collect(stream: AsyncIterable<AgentEvent>): Promise<AgentEvent[]> {
  const out: AgentEvent[] = [];
  for await (const event of stream) out.push(event);
  return out;
}

const userTurn = (text: string, id = 'u1'): Turn => ({
  id,
  role: 'user',
  createdAt: 0,
  complete: true,
  content: [{ type: 'text', text }],
});

describe('createAnthropicTransport — message translation', () => {
  it('translates text blocks 1:1 into Anthropic content', async () => {
    const { client, capturedParams } = createMockClient([{ type: 'message_stop' }]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    await collect(transport.send([userTurn('hello')]));
    expect(capturedParams.value?.messages).toEqual([
      { role: 'user', content: [{ type: 'text', text: 'hello' }] },
    ]);
  });

  it('translates tool_use blocks and defaults missing input to {}', async () => {
    const { client, capturedParams } = createMockClient([{ type: 'message_stop' }]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    const turn: Turn = {
      id: 'a1',
      role: 'assistant',
      createdAt: 0,
      complete: true,
      content: [
        { type: 'tool_use', id: 'tu_1', name: 'read', input: { path: '/x' } },
        { type: 'tool_use', id: 'tu_2', name: 'noop', input: undefined as unknown },
      ],
    };
    await collect(transport.send([turn]));
    expect(capturedParams.value?.messages[0]?.content).toEqual([
      { type: 'tool_use', id: 'tu_1', name: 'read', input: { path: '/x' } },
      { type: 'tool_use', id: 'tu_2', name: 'noop', input: {} },
    ]);
  });

  it('translates tool_result blocks and includes is_error only when set', async () => {
    const { client, capturedParams } = createMockClient([{ type: 'message_stop' }]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    const turn: Turn = {
      id: 'u2',
      role: 'user',
      createdAt: 0,
      complete: true,
      content: [
        { type: 'tool_result', toolUseId: 'tu_1', content: 'ok' },
        { type: 'tool_result', toolUseId: 'tu_2', content: 'boom', isError: true },
      ],
    };
    await collect(transport.send([turn]));
    const content = capturedParams.value?.messages[0]?.content;
    expect(content).toEqual([
      { type: 'tool_result', tool_use_id: 'tu_1', content: 'ok' },
      { type: 'tool_result', tool_use_id: 'tu_2', content: 'boom', is_error: true },
    ]);
  });

  it('translates thinking blocks', async () => {
    const { client, capturedParams } = createMockClient([{ type: 'message_stop' }]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    const turn: Turn = {
      id: 'a1',
      role: 'assistant',
      createdAt: 0,
      complete: true,
      content: [{ type: 'thinking', thinking: 'hmm' }],
    };
    await collect(transport.send([turn]));
    expect(capturedParams.value?.messages[0]?.content).toEqual([
      { type: 'thinking', thinking: 'hmm' },
    ]);
  });

  it('filters out system-role turns (system goes via the params field)', async () => {
    const { client, capturedParams } = createMockClient([{ type: 'message_stop' }]);
    const transport = createAnthropicTransport({ client, model: 'm', system: 'you are X' });
    const turns: Turn[] = [
      {
        id: 's',
        role: 'system',
        createdAt: 0,
        complete: true,
        content: [{ type: 'text', text: 'ignored' }],
      },
      userTurn('hi'),
    ];
    await collect(transport.send(turns));
    expect(capturedParams.value?.messages).toHaveLength(1);
    expect(capturedParams.value?.messages[0]?.role).toBe('user');
    expect(capturedParams.value?.system).toBe('you are X');
  });
});

describe('createAnthropicTransport — params construction', () => {
  it('defaults max_tokens to 4096', async () => {
    const { client, capturedParams } = createMockClient([{ type: 'message_stop' }]);
    const transport = createAnthropicTransport({ client, model: 'claude-x' });
    await collect(transport.send([userTurn('hi')]));
    expect(capturedParams.value?.max_tokens).toBe(4096);
    expect(capturedParams.value?.model).toBe('claude-x');
  });

  it('omits system / tools / temperature when unset', async () => {
    const { client, capturedParams } = createMockClient([{ type: 'message_stop' }]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    await collect(transport.send([userTurn('hi')]));
    const p = capturedParams.value;
    expect(p).not.toHaveProperty('system');
    expect(p).not.toHaveProperty('tools');
    expect(p).not.toHaveProperty('temperature');
  });

  it('passes through maxTokens / tools / temperature when provided', async () => {
    const { client, capturedParams } = createMockClient([{ type: 'message_stop' }]);
    const tools = [{ name: 'read', input_schema: { type: 'object' as const } }];
    const transport = createAnthropicTransport({
      client,
      model: 'm',
      maxTokens: 1024,
      tools,
      temperature: 0.2,
    });
    await collect(transport.send([userTurn('hi')]));
    expect(capturedParams.value?.max_tokens).toBe(1024);
    expect(capturedParams.value?.tools).toBe(tools);
    expect(capturedParams.value?.temperature).toBe(0.2);
  });
});

describe('createAnthropicTransport — stream event translation', () => {
  it('translates a full text stream end-to-end', async () => {
    const { client } = createMockClient([
      { type: 'message_start', message: { id: 'msg_1', role: 'assistant' } },
      {
        type: 'content_block_start',
        index: 0,
        content_block: { type: 'text', text: '' },
      },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Hello' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: ', world' } },
      { type: 'content_block_stop', index: 0 },
      { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
      { type: 'message_stop' },
    ]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    const events = await collect(transport.send([userTurn('hi')]));
    expect(events.map((e) => e.type)).toEqual([
      'turn_start',
      'block_start',
      'text_delta',
      'text_delta',
      'block_complete',
      'turn_complete',
    ]);
    expect(events[0]).toMatchObject({ type: 'turn_start', turnId: 'msg_1', role: 'assistant' });
    expect(events[1]).toMatchObject({ blockId: 'msg_1:b0', block: { type: 'text', text: '' } });
    expect(events[2]).toMatchObject({ delta: 'Hello' });
    expect(events[5]).toMatchObject({ type: 'turn_complete', stopReason: 'end_turn' });
  });

  it('translates a tool_use start with empty inputJson seed', async () => {
    const { client } = createMockClient([
      { type: 'message_start', message: { id: 'msg_2', role: 'assistant' } },
      {
        type: 'content_block_start',
        index: 0,
        content_block: { type: 'tool_use', id: 'tu_42', name: 'read', input: {} },
      },
      {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'input_json_delta', partial_json: '{"path":' },
      },
      {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'input_json_delta', partial_json: '"/x"}' },
      },
      { type: 'content_block_stop', index: 0 },
      { type: 'message_stop' },
    ]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    const events = await collect(transport.send([userTurn('do thing')]));
    const start = events.find((e) => e.type === 'block_start');
    expect(start).toMatchObject({
      block: { type: 'tool_use', id: 'tu_42', name: 'read', input: {}, inputJson: '' },
    });
    const deltas = events.filter((e) => e.type === 'tool_input_delta');
    expect(deltas).toHaveLength(2);
    expect(deltas[0]).toMatchObject({ deltaJson: '{"path":' });
    expect(deltas[1]).toMatchObject({ deltaJson: '"/x"}' });
  });

  it('translates thinking deltas', async () => {
    const { client } = createMockClient([
      { type: 'message_start', message: { id: 'msg_3', role: 'assistant' } },
      {
        type: 'content_block_start',
        index: 0,
        content_block: { type: 'thinking', thinking: '' },
      },
      { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'one' } },
      {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'thinking_delta', thinking: ' two' },
      },
      { type: 'content_block_stop', index: 0 },
      { type: 'message_stop' },
    ]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    const events = await collect(transport.send([userTurn('hi')]));
    const deltas = events.filter((e) => e.type === 'thinking_delta');
    expect(deltas).toHaveLength(2);
    expect(deltas[0]).toMatchObject({ delta: 'one', blockId: 'msg_3:b0' });
  });

  it('threads index → blockId so interleaved blocks stay distinct', async () => {
    const { client } = createMockClient([
      { type: 'message_start', message: { id: 'm', role: 'assistant' } },
      {
        type: 'content_block_start',
        index: 0,
        content_block: { type: 'text', text: '' },
      },
      {
        type: 'content_block_start',
        index: 1,
        content_block: { type: 'tool_use', id: 'tu_x', name: 'n', input: {} },
      },
      {
        type: 'content_block_delta',
        index: 1,
        delta: { type: 'input_json_delta', partial_json: '{}' },
      },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'A' } },
      { type: 'content_block_stop', index: 0 },
      { type: 'content_block_stop', index: 1 },
      { type: 'message_stop' },
    ]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    const events = await collect(transport.send([userTurn('hi')]));
    // Find the two deltas — they must carry different blockIds matching their
    // originating index.
    const textDelta = events.find((e) => e.type === 'text_delta');
    const toolDelta = events.find((e) => e.type === 'tool_input_delta');
    expect(textDelta).toMatchObject({ blockId: 'm:b0' });
    expect(toolDelta).toMatchObject({ blockId: 'm:b1' });
  });

  it('omits stopReason from turn_complete when the message had no message_delta', async () => {
    const { client } = createMockClient([
      { type: 'message_start', message: { id: 'msg_x', role: 'assistant' } },
      { type: 'message_stop' },
    ]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    const events = await collect(transport.send([userTurn('hi')]));
    const complete = events.find((e) => e.type === 'turn_complete');
    expect(complete).toEqual({ type: 'turn_complete', turnId: 'msg_x' });
    expect(complete).not.toHaveProperty('stopReason');
  });

  it('drops deltas for unknown indices instead of throwing', async () => {
    // Real-world safety: a delta arriving without a matching content_block_start
    // (because we ignored an unsupported block type) shouldn't crash the stream.
    const { client } = createMockClient([
      { type: 'message_start', message: { id: 'm', role: 'assistant' } },
      { type: 'content_block_delta', index: 99, delta: { type: 'text_delta', text: 'ghost' } },
      { type: 'message_stop' },
    ]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    const events = await collect(transport.send([userTurn('hi')]));
    expect(events.map((e) => e.type)).toEqual(['turn_start', 'turn_complete']);
  });
});

describe('createAnthropicTransport — abort', () => {
  it('aborts the SDK controller and rejects with AgentAbortError when the signal fires', async () => {
    const { client, controller } = createMockClient([
      { type: 'message_start', message: { id: 'm', role: 'assistant' } },
      { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'a' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'b' } },
      { type: 'message_stop' },
    ]);
    const transport = createAnthropicTransport({ client, model: 'm' });
    const outer = new AbortController();
    const stream = transport.send([userTurn('hi')], outer.signal);
    queueMicrotask(() => outer.abort());
    await expect(collect(stream)).rejects.toBeInstanceOf(AgentAbortError);
    expect(controller.signal.aborted).toBe(true);
  });
});
