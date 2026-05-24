import { describe, expect, it } from 'vitest';
import { AgentAbortError, type AgentEvent } from '../types.js';
import { chunkText, createMockTransport, type MockEvent } from './mock.js';

async function collect(stream: AsyncIterable<AgentEvent>): Promise<AgentEvent[]> {
  const out: AgentEvent[] = [];
  for await (const e of stream) out.push(e);
  return out;
}

describe('createMockTransport', () => {
  it('replays events in order at speed=0 (instant)', async () => {
    const events: MockEvent[] = [
      { type: 'turn_start', turnId: 't', role: 'assistant' },
      { type: 'turn_complete', turnId: 't' },
    ];
    const transport = createMockTransport(events, { speed: 0 });
    const collected = await collect(transport.send([]));
    expect(collected).toHaveLength(2);
    expect(collected[0]?.type).toBe('turn_start');
    expect(collected[1]?.type).toBe('turn_complete');
  });

  it('strips per-event delay from the yielded event', async () => {
    const transport = createMockTransport(
      [{ type: 'turn_start', turnId: 't', role: 'assistant', delay: 0 }],
      { speed: 0 },
    );
    const [event] = await collect(transport.send([]));
    expect(event).not.toHaveProperty('delay');
  });

  it('accepts a thunk to support fresh transcripts per send()', async () => {
    let count = 0;
    const transport = createMockTransport(
      () => {
        count++;
        return [{ type: 'turn_start', turnId: `t${count}`, role: 'assistant' }];
      },
      { speed: 0 },
    );
    const a = await collect(transport.send([]));
    const b = await collect(transport.send([]));
    expect(a[0]).toMatchObject({ turnId: 't1' });
    expect(b[0]).toMatchObject({ turnId: 't2' });
  });

  it('rejects with AgentAbortError when signal aborts mid-replay', async () => {
    const transport = createMockTransport(
      [
        { type: 'turn_start', turnId: 't', role: 'assistant', delay: 1000 },
        { type: 'turn_complete', turnId: 't', delay: 1000 },
      ],
      { speed: 1 },
    );
    const controller = new AbortController();
    const stream = transport.send([], controller.signal);
    queueMicrotask(() => controller.abort());
    await expect(collect(stream)).rejects.toBeInstanceOf(AgentAbortError);
  });

  it('accepts MockTranscript wrapper objects', async () => {
    const transport = createMockTransport(
      {
        label: 'demo',
        events: [{ type: 'turn_start', turnId: 't', role: 'assistant' }],
      },
      { speed: 0 },
    );
    const collected = await collect(transport.send([]));
    expect(collected).toHaveLength(1);
  });
});

describe('chunkText', () => {
  it('preserves the original text when concatenated', () => {
    const text = 'The quick brown fox jumps over the lazy dog.';
    const events = chunkText(text, 't', 'b1');
    const reassembled = events.map((e) => (e.type === 'text_delta' ? e.delta : '')).join('');
    expect(reassembled).toBe(text);
  });

  it('emits text_delta events bound to the given turn/block', () => {
    const events = chunkText('one two three four', 'turn-x', 'block-y');
    for (const e of events) {
      expect(e.type).toBe('text_delta');
      expect(e).toMatchObject({ turnId: 'turn-x', blockId: 'block-y' });
    }
  });
});
