import { chunkText, type MockEvent } from '@labcat/tui-agent/mock';

const turnId = 'asst_refactor_1';

export const refactor: MockEvent[] = [
  { type: 'turn_start', turnId, role: 'assistant' },

  {
    type: 'block_start',
    turnId,
    blockId: 'b_think',
    block: { type: 'thinking', thinking: '' },
  },
  {
    type: 'thinking_delta',
    turnId,
    blockId: 'b_think',
    delta:
      'The user wants to extract the parser into its own module. Let me read the current shape, sketch the split, and propose the edit.',
    delay: 220,
  },
  { type: 'block_complete', turnId, blockId: 'b_think' },

  {
    type: 'block_start',
    turnId,
    blockId: 'b_text1',
    block: { type: 'text', text: '' },
  },
  ...chunkText(
    "I'll read the current file first so the extracted module preserves the exact public shape.",
    turnId,
    'b_text1',
  ),
  { type: 'block_complete', turnId, blockId: 'b_text1' },

  {
    type: 'block_start',
    turnId,
    blockId: 'b_read',
    block: {
      type: 'tool_use',
      id: 'toolu_read_1',
      name: 'Read',
      input: {},
      inputJson: '',
    },
  },
  {
    type: 'tool_input_delta',
    turnId,
    blockId: 'b_read',
    deltaJson: '{"file_path":"src/parser.ts"}',
    delay: 80,
  },
  { type: 'block_complete', turnId, blockId: 'b_read' },
  { type: 'turn_complete', turnId, stopReason: 'tool_use' },

  // Tool result from the consumer would arrive here in a real flow.
  // The mock fabricates the response in the *next* assistant turn for demo purposes.
  {
    type: 'turn_start',
    turnId: 'user_toolresult_1',
    role: 'user',
  },
  {
    type: 'block_start',
    turnId: 'user_toolresult_1',
    blockId: 'b_tr1',
    block: {
      type: 'tool_result',
      toolUseId: 'toolu_read_1',
      content:
        '1  export function parse(input: string): Token[] {\n2    return input.split(/\\s+/).map((raw) => ({ raw, kind: classify(raw) }));\n3  }\n4  \n5  function classify(s: string): TokenKind {\n6    if (s.startsWith("/")) return "command";\n7    return "arg";\n8  }',
    },
  },
  { type: 'turn_complete', turnId: 'user_toolresult_1' },

  // Next assistant turn — proposes the edit
  { type: 'turn_start', turnId: 'asst_refactor_2', role: 'assistant' },
  {
    type: 'block_start',
    turnId: 'asst_refactor_2',
    blockId: 'b_text2',
    block: { type: 'text', text: '' },
  },
  ...chunkText(
    "Got it. Here's the split — `classify` moves to a new `classify.ts` module and `parser.ts` just orchestrates.",
    'asst_refactor_2',
    'b_text2',
  ),
  { type: 'block_complete', turnId: 'asst_refactor_2', blockId: 'b_text2' },

  {
    type: 'block_start',
    turnId: 'asst_refactor_2',
    blockId: 'b_edit',
    block: {
      type: 'tool_use',
      id: 'toolu_edit_1',
      name: 'Edit',
      input: {},
      inputJson: '',
    },
  },
  {
    type: 'tool_input_delta',
    turnId: 'asst_refactor_2',
    blockId: 'b_edit',
    deltaJson: '{"file_path":"src/parser.ts","old_string":"function classify',
    delay: 60,
  },
  {
    type: 'tool_input_delta',
    turnId: 'asst_refactor_2',
    blockId: 'b_edit',
    deltaJson: '","new_string":"import { classify } from \'./classify.js\';"}',
    delay: 60,
  },
  { type: 'block_complete', turnId: 'asst_refactor_2', blockId: 'b_edit' },

  {
    type: 'block_start',
    turnId: 'asst_refactor_2',
    blockId: 'b_text3',
    block: { type: 'text', text: '' },
  },
  ...chunkText(
    'Edit applied. The classify helper is now in `src/classify.ts` and `parser.ts` imports it — same public API, leaner module.',
    'asst_refactor_2',
    'b_text3',
  ),
  { type: 'block_complete', turnId: 'asst_refactor_2', blockId: 'b_text3' },

  { type: 'turn_complete', turnId: 'asst_refactor_2', stopReason: 'end_turn' },
];
