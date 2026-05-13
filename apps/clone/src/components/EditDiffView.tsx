import type { TuiDiffBlock } from '@labcat/tui';
import type { ToolUseBlock } from '@labcat/tui-agent';
import { DiffBlock } from '@labcat/tui-react';
import { useEffect, useRef } from 'react';

interface DiffLine {
  kind: 'add' | 'remove' | 'context';
  text: string;
}

function buildDiff(input: unknown): { args: string; lines: DiffLine[] } | null {
  if (!input || typeof input !== 'object') return null;
  const i = input as Record<string, unknown>;
  const path = typeof i.file_path === 'string' ? i.file_path : '';
  const oldStr = typeof i.old_string === 'string' ? i.old_string : '';
  const newStr = typeof i.new_string === 'string' ? i.new_string : '';
  if (!oldStr && !newStr) return null;
  const lines: DiffLine[] = [];
  for (const line of oldStr.split('\n')) lines.push({ kind: 'remove', text: line });
  for (const line of newStr.split('\n')) lines.push({ kind: 'add', text: line });
  return { args: path, lines };
}

export function EditDiffView({ block }: { block: ToolUseBlock }) {
  const ref = useRef<TuiDiffBlock | null>(null);
  const diff = buildDiff(block.input);

  useEffect(() => {
    if (ref.current && diff) ref.current.lines = diff.lines;
  }, [diff]);

  if (!diff) return null;
  return <DiffBlock ref={ref} tool={block.name} args={diff.args} />;
}
