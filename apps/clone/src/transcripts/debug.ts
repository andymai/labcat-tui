import { chunkText, type MockEvent } from '@labcat/tui-agent/mock';

const t1 = 'asst_debug_1';
const u1 = 'user_debug_tr1';
const t2 = 'asst_debug_2';

export const debug: MockEvent[] = [
  { type: 'turn_start', turnId: t1, role: 'assistant' },

  {
    type: 'block_start',
    turnId: t1,
    blockId: 'b_text1',
    block: { type: 'text', text: '' },
  },
  ...chunkText(
    "Let me reproduce the failure first — I'll run the failing test in isolation.",
    t1,
    'b_text1',
  ),
  { type: 'block_complete', turnId: t1, blockId: 'b_text1' },

  {
    type: 'block_start',
    turnId: t1,
    blockId: 'b_bash',
    block: { type: 'tool_use', id: 'toolu_bash_1', name: 'Bash', input: {}, inputJson: '' },
  },
  {
    type: 'tool_input_delta',
    turnId: t1,
    blockId: 'b_bash',
    deltaJson: '{"command":"pnpm vitest run src/parser.test.ts -t \\"slash prefix\\""}',
    delay: 80,
  },
  { type: 'block_complete', turnId: t1, blockId: 'b_bash' },
  { type: 'turn_complete', turnId: t1, stopReason: 'tool_use' },

  { type: 'turn_start', turnId: u1, role: 'user' },
  {
    type: 'block_start',
    turnId: u1,
    blockId: 'b_tr1',
    block: {
      type: 'tool_result',
      toolUseId: 'toolu_bash_1',
      content:
        "FAIL  src/parser.test.ts > slash prefix routes\n  Error: expected '/posts' to equal 'posts'\n    at parse (src/parser.ts:7:12)\n    at <test>:14:18",
      isError: true,
    },
  },
  { type: 'turn_complete', turnId: u1 },

  { type: 'turn_start', turnId: t2, role: 'assistant' },
  {
    type: 'block_start',
    turnId: t2,
    blockId: 'b_text2',
    block: { type: 'text', text: '' },
  },
  ...chunkText(
    "The slash isn't being stripped before lookup. The fix is one line in `parser.ts` — normalize the name before the registry hit.",
    t2,
    'b_text2',
  ),
  { type: 'block_complete', turnId: t2, blockId: 'b_text2' },
  { type: 'turn_complete', turnId: t2, stopReason: 'end_turn' },
];
