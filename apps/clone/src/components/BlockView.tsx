import {
  type ContentBlock,
  type ToolResultBlock,
  type ToolUseBlock,
  type Turn,
  blockKey,
} from '@labcat/tui-agent';
import { ThinkingBlock } from '@labcat/tui-react';
import { EditDiffView } from './EditDiffView.js';
import { Markdown } from './Markdown.js';
import { TodoView } from './TodoView.js';
import { ToolCallView } from './ToolCallView.js';

function findToolResult(turns: readonly Turn[], toolUseId: string): ToolResultBlock | undefined {
  for (const t of turns) {
    for (const b of t.content) {
      if (b.type === 'tool_result' && b.toolUseId === toolUseId) return b;
    }
  }
  return undefined;
}

export function BlockView({
  block,
  turn,
  turns,
}: {
  block: ContentBlock;
  turn: Turn;
  turns: readonly Turn[];
}) {
  if (block.type === 'text') {
    if (turn.complete && turn.role === 'assistant') {
      return <Markdown source={block.text} />;
    }
    return <div className="block-text">{block.text}</div>;
  }

  if (block.type === 'thinking') {
    return <ThinkingBlock>{block.thinking}</ThinkingBlock>;
  }

  if (block.type === 'tool_use') {
    return <ToolUseView block={block} turn={turn} turns={turns} />;
  }

  // tool_result blocks render inline with their tool_use, not standalone.
  return null;
}

function ToolUseView({
  block,
  turn,
  turns,
}: {
  block: ToolUseBlock;
  turn: Turn;
  turns: readonly Turn[];
}) {
  const result = findToolResult(turns, block.id);
  const pending = !result && !turn.complete;

  if (block.name === 'TodoWrite') {
    return <TodoView block={block} />;
  }
  if (block.name === 'Edit' || block.name === 'Write') {
    return (
      <>
        <EditDiffView block={block} />
        {result ? <ToolCallView block={block} result={result} pending={false} /> : null}
      </>
    );
  }

  return <ToolCallView block={block} {...(result ? { result } : {})} pending={pending} />;
}

export function blockReactKey(block: ContentBlock): string {
  return blockKey(block) || `${block.type}:${Math.random().toString(36).slice(2)}`;
}
