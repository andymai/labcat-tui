import { type MockEvent, chunkText } from '@labcat/tui-agent/mock';

const turnId = 'asst_todos_1';

export const todos: MockEvent[] = [
  { type: 'turn_start', turnId, role: 'assistant' },

  {
    type: 'block_start',
    turnId,
    blockId: 'b_text1',
    block: { type: 'text', text: '' },
  },
  ...chunkText("Here's the plan I'll work through:", turnId, 'b_text1'),
  { type: 'block_complete', turnId, blockId: 'b_text1' },

  {
    type: 'block_start',
    turnId,
    blockId: 'b_todowrite',
    block: {
      type: 'tool_use',
      id: 'toolu_todo_1',
      name: 'TodoWrite',
      input: {},
      inputJson: '',
    },
  },
  {
    type: 'tool_input_delta',
    turnId,
    blockId: 'b_todowrite',
    deltaJson:
      '{"todos":[{"id":"1","content":"Audit current build pipeline","status":"in-progress"},',
    delay: 100,
  },
  {
    type: 'tool_input_delta',
    turnId,
    blockId: 'b_todowrite',
    deltaJson: '{"id":"2","content":"Migrate from Webpack to Vite","status":"pending"},',
    delay: 80,
  },
  {
    type: 'tool_input_delta',
    turnId,
    blockId: 'b_todowrite',
    deltaJson: '{"id":"3","content":"Verify bundle size budgets hold","status":"pending"}]}',
    delay: 80,
  },
  { type: 'block_complete', turnId, blockId: 'b_todowrite' },

  {
    type: 'block_start',
    turnId,
    blockId: 'b_text2',
    block: { type: 'text', text: '' },
  },
  ...chunkText(
    "Starting with the audit — I'll inspect the current `webpack.config.js` to see what plugins and loaders are doing the heavy lifting.",
    turnId,
    'b_text2',
  ),
  { type: 'block_complete', turnId, blockId: 'b_text2' },

  { type: 'turn_complete', turnId, stopReason: 'end_turn' },
];
