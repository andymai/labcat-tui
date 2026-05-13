export type Role = 'user' | 'assistant' | 'system';

export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
}

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
  inputJson?: string;
}

export interface ToolResultBlock {
  type: 'tool_result';
  toolUseId: string;
  content: string;
  isError?: boolean;
}

export type ContentBlock = TextBlock | ThinkingBlock | ToolUseBlock | ToolResultBlock;

export interface Turn {
  id: string;
  role: Role;
  content: ContentBlock[];
  createdAt: number;
  /**
   * Set when the assistant turn is fully streamed. User turns are complete on
   * append. Useful for renderers that want to gate animations on completion.
   */
  complete: boolean;
  /** Anthropic stop_reason if known: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence'. */
  stopReason?: string;
}

export type AgentEvent =
  | { type: 'turn_start'; turnId: string; role: Role }
  | { type: 'block_start'; turnId: string; blockId: string; block: ContentBlock }
  | { type: 'text_delta'; turnId: string; blockId: string; delta: string }
  | { type: 'thinking_delta'; turnId: string; blockId: string; delta: string }
  | { type: 'tool_input_delta'; turnId: string; blockId: string; deltaJson: string }
  | { type: 'block_complete'; turnId: string; blockId: string }
  | { type: 'turn_complete'; turnId: string; stopReason?: string }
  | { type: 'error'; error: Error };

export interface AgentTransport {
  /**
   * Send the conversation so far and stream events for the next assistant
   * turn(s). May emit multiple `turn_start` / `turn_complete` pairs within a
   * single call when the transport handles its own agentic loop (e.g., a
   * server-side runner). Honor `signal` for cancellation.
   */
  send(turns: readonly Turn[], signal?: AbortSignal): AsyncIterable<AgentEvent>;
}

export class AgentAbortError extends Error {
  constructor(message = 'Agent stream aborted') {
    super(message);
    this.name = 'AgentAbortError';
  }
}
