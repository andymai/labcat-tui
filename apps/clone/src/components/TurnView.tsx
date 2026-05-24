import type { Turn } from '@labcat/tui-agent';
import { BlockView, blockReactKey } from './BlockView.js';

export function TurnView({ turn, turns }: { turn: Turn; turns: readonly Turn[] }) {
  // User turns made of nothing but tool_results are protocol noise — folded
  // into the matching tool_use cards instead.
  const visibleBlocks = turn.content.filter((b) => b.type !== 'tool_result');
  if (visibleBlocks.length === 0) return null;

  return (
    <div className={`turn turn--${turn.role}`}>
      {visibleBlocks.map((b) => (
        <BlockView key={blockReactKey(b)} block={b} turn={turn} turns={turns} />
      ))}
    </div>
  );
}
