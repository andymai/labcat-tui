import type { ToolResultBlock, ToolUseBlock } from '@labcat/tui-agent';
import { ToolCallCard } from '@labcat/tui-react';

function summarizeArgs(name: string, input: unknown): string {
  if (!input || typeof input !== 'object') return '';
  const i = input as Record<string, unknown>;
  switch (name) {
    case 'Read':
    case 'Write':
    case 'Edit':
      return typeof i.file_path === 'string' ? i.file_path : '';
    case 'Bash':
      return typeof i.command === 'string' ? i.command : '';
    case 'Glob':
    case 'Grep':
      return typeof i.pattern === 'string' ? i.pattern : '';
    default: {
      const first = Object.values(i)[0];
      return typeof first === 'string' ? first : '';
    }
  }
}

export function ToolCallView({
  block,
  result,
  pending,
}: {
  block: ToolUseBlock;
  result?: ToolResultBlock;
  pending: boolean;
}) {
  const args = summarizeArgs(block.name, block.input);
  const status = result ? (result.isError ? 'error' : 'ok') : pending ? 'running' : 'pending';

  return (
    <ToolCallCard tool={block.name} args={args} status={status}>
      {result ? (
        <output
          className={result.isError ? 'tool-result tool-result--error' : 'tool-result'}
          aria-live="polite"
        >
          {result.content}
        </output>
      ) : null}
    </ToolCallCard>
  );
}
