import { AgentAbortError, type AgentEvent, type AgentTransport, type Turn } from '../types.js';

interface AnthropicTextBlock {
  type: 'text';
  text: string;
}
interface AnthropicToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}
interface AnthropicToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}
interface AnthropicThinkingBlock {
  type: 'thinking';
  thinking: string;
  signature?: string;
}

type AnthropicContentBlock =
  | AnthropicTextBlock
  | AnthropicToolUseBlock
  | AnthropicToolResultBlock
  | AnthropicThinkingBlock;

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

export interface AnthropicTool {
  name: string;
  description?: string;
  input_schema: {
    type: 'object';
    properties?: Record<string, unknown>;
    required?: string[];
    [k: string]: unknown;
  };
}

export interface AnthropicMessagesParams {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  system?: string;
  tools?: AnthropicTool[];
  temperature?: number;
}

type AnthropicStreamEvent =
  | { type: 'message_start'; message: { id: string; role: 'assistant' } }
  | {
      type: 'content_block_start';
      index: number;
      content_block: AnthropicContentBlock;
    }
  | {
      type: 'content_block_delta';
      index: number;
      delta:
        | { type: 'text_delta'; text: string }
        | { type: 'input_json_delta'; partial_json: string }
        | { type: 'thinking_delta'; thinking: string }
        | { type: 'signature_delta'; signature: string };
    }
  | { type: 'content_block_stop'; index: number }
  | { type: 'message_delta'; delta: { stop_reason: string | null } }
  | { type: 'message_stop' };

export interface AnthropicMessagesClient {
  messages: {
    stream(params: AnthropicMessagesParams): AsyncIterable<AnthropicStreamEvent> & {
      controller?: AbortController;
    };
  };
}

export interface CreateAnthropicTransportOptions {
  client: AnthropicMessagesClient;
  model: string;
  maxTokens?: number;
  system?: string;
  tools?: AnthropicTool[];
  temperature?: number;
}

function turnsToMessages(turns: readonly Turn[]): AnthropicMessage[] {
  return turns
    .filter((t): t is Turn & { role: 'user' | 'assistant' } => t.role !== 'system')
    .map((t) => {
      const content: AnthropicContentBlock[] = t.content.map((b) => {
        switch (b.type) {
          case 'text':
            return { type: 'text', text: b.text };
          case 'tool_use':
            return { type: 'tool_use', id: b.id, name: b.name, input: b.input ?? {} };
          case 'tool_result':
            return {
              type: 'tool_result',
              tool_use_id: b.toolUseId,
              content: b.content,
              ...(b.isError !== undefined ? { is_error: b.isError } : {}),
            };
          case 'thinking':
            return { type: 'thinking', thinking: b.thinking };
        }
      });
      return { role: t.role, content };
    });
}

/**
 * Wraps `@anthropic-ai/sdk`'s Messages streaming as an `AgentTransport`. Pass
 * the SDK client in; we don't import the SDK ourselves so the dependency stays
 * optional.
 *
 * One `send()` call streams exactly one assistant turn. If the model stops
 * with `tool_use`, the consumer is responsible for executing the tool,
 * calling `session.appendToolResults(...)`, and calling `send()` again. This
 * keeps tool execution out of the transport's hands (matching SPEC §8 — no
 * implicit network behavior).
 */
export function createAnthropicTransport(opts: CreateAnthropicTransportOptions): AgentTransport {
  const { client, model, maxTokens = 4096, system, tools, temperature } = opts;

  return {
    async *send(turns, signal): AsyncIterable<AgentEvent> {
      const params: AnthropicMessagesParams = {
        model,
        max_tokens: maxTokens,
        messages: turnsToMessages(turns),
        ...(system !== undefined ? { system } : {}),
        ...(tools !== undefined ? { tools } : {}),
        ...(temperature !== undefined ? { temperature } : {}),
      };
      const stream = client.messages.stream(params);
      const onAbort = (): void => stream.controller?.abort();
      signal?.addEventListener('abort', onAbort, { once: true });

      let turnId = '';
      const blockIds = new Map<number, string>();
      let stopReason: string | undefined;

      try {
        for await (const event of stream) {
          if (signal?.aborted) throw new AgentAbortError();
          switch (event.type) {
            case 'message_start': {
              turnId = event.message.id;
              yield { type: 'turn_start', turnId, role: 'assistant' };
              break;
            }
            case 'content_block_start': {
              const blockId = `${turnId}:b${event.index}`;
              blockIds.set(event.index, blockId);
              const cb = event.content_block;
              if (cb.type === 'text') {
                yield {
                  type: 'block_start',
                  turnId,
                  blockId,
                  block: { type: 'text', text: cb.text },
                };
              } else if (cb.type === 'tool_use') {
                yield {
                  type: 'block_start',
                  turnId,
                  blockId,
                  block: {
                    type: 'tool_use',
                    id: cb.id,
                    name: cb.name,
                    input: cb.input ?? {},
                    inputJson: '',
                  },
                };
              } else if (cb.type === 'thinking') {
                yield {
                  type: 'block_start',
                  turnId,
                  blockId,
                  block: { type: 'thinking', thinking: cb.thinking },
                };
              }
              break;
            }
            case 'content_block_delta': {
              const blockId = blockIds.get(event.index);
              if (!blockId) break;
              const d = event.delta;
              if (d.type === 'text_delta') {
                yield { type: 'text_delta', turnId, blockId, delta: d.text };
              } else if (d.type === 'input_json_delta') {
                yield { type: 'tool_input_delta', turnId, blockId, deltaJson: d.partial_json };
              } else if (d.type === 'thinking_delta') {
                yield { type: 'thinking_delta', turnId, blockId, delta: d.thinking };
              }
              break;
            }
            case 'content_block_stop': {
              const blockId = blockIds.get(event.index);
              if (blockId) yield { type: 'block_complete', turnId, blockId };
              break;
            }
            case 'message_delta': {
              if (event.delta.stop_reason) stopReason = event.delta.stop_reason;
              break;
            }
            case 'message_stop': {
              yield { type: 'turn_complete', turnId, ...(stopReason ? { stopReason } : {}) };
              break;
            }
          }
        }
      } finally {
        signal?.removeEventListener('abort', onAbort);
      }
    },
  };
}
