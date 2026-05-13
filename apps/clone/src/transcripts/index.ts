import type { MockEvent } from '@labcat/tui-agent/mock';
import { codeBlocks } from './code-blocks.js';
import { debug } from './debug.js';
import { refactor } from './refactor.js';
import { todos } from './todos.js';

export interface Scenario {
  name: string;
  description: string;
  /** The user message that, when sent, plays this scenario. */
  prompt: string;
  events: MockEvent[];
}

export const SCENARIOS: Scenario[] = [
  {
    name: '/refactor',
    description: 'Multi-turn agentic loop with Read + Edit tools and thinking block',
    prompt: 'Extract the classify helper from parser.ts into its own module',
    events: refactor,
  },
  {
    name: '/todos',
    description: 'TodoWrite tool with structured plan + status tracking',
    prompt: 'Plan a migration from Webpack to Vite',
    events: todos,
  },
  {
    name: '/debug',
    description: 'Bash tool returning an error result, then proposed fix',
    prompt: 'The "slash prefix" test in parser is failing — help me debug',
    events: debug,
  },
  {
    name: '/code',
    description: 'Markdown response with syntax-highlighted TypeScript code blocks',
    prompt: 'Show me how useSyncExternalStore works',
    events: codeBlocks,
  },
];

export const FALLBACK_GREETING: MockEvent[] = [
  { type: 'turn_start', turnId: 'asst_greet', role: 'assistant' },
  {
    type: 'block_start',
    turnId: 'asst_greet',
    blockId: 'b_text',
    block: { type: 'text', text: '' },
  },
  {
    type: 'text_delta',
    turnId: 'asst_greet',
    blockId: 'b_text',
    delta: 'Hi! Try one of the scenarios from the slash overlay (',
  },
  {
    type: 'text_delta',
    turnId: 'asst_greet',
    blockId: 'b_text',
    delta: 'Cmd-K) — or send any message to replay this greeting.',
  },
  { type: 'block_complete', turnId: 'asst_greet', blockId: 'b_text' },
  { type: 'turn_complete', turnId: 'asst_greet', stopReason: 'end_turn' },
];

export function pickScenario(userText: string): MockEvent[] {
  const lower = userText.toLowerCase().trim();
  for (const scenario of SCENARIOS) {
    if (lower === scenario.name || lower === scenario.name.slice(1)) return scenario.events;
    if (lower === scenario.prompt.toLowerCase()) return scenario.events;
  }
  return FALLBACK_GREETING;
}
