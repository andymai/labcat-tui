import type { ToolUseBlock } from '@labcat/tui-agent';
import { TodoItem, TodoList } from '@labcat/tui-react';

interface TodoEntry {
  id: string;
  content: string;
  status: 'pending' | 'in-progress' | 'completed';
}

function readTodos(input: unknown): TodoEntry[] {
  if (!input || typeof input !== 'object') return [];
  const todos = (input as { todos?: unknown }).todos;
  if (!Array.isArray(todos)) return [];
  return todos.filter(
    (t): t is TodoEntry =>
      typeof t === 'object' &&
      t !== null &&
      typeof (t as TodoEntry).id === 'string' &&
      typeof (t as TodoEntry).content === 'string',
  );
}

export function TodoView({ block }: { block: ToolUseBlock }) {
  const todos = readTodos(block.input);
  if (todos.length === 0) {
    return <span className="diff-summary">TodoWrite (no items yet)</span>;
  }
  return (
    <TodoList>
      {todos.map((t) => (
        <TodoItem key={t.id} status={t.status}>
          {t.content}
        </TodoItem>
      ))}
    </TodoList>
  );
}
