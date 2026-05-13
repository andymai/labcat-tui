# @labcat/tui-agent

Framework-agnostic agent runtime for [`@labcat/tui`](../core/). Provides the turn model, transport interface, and mock + Anthropic adapters that turn a UI component library into a working chat client.

## Install

```bash
pnpm add @labcat/tui @labcat/tui-agent
```

## The shape

```ts
import { createAgentSession } from '@labcat/tui-agent';
import { createMockTransport } from '@labcat/tui-agent/mock';

const session = createAgentSession({
  transport: createMockTransport(transcript),
});

session.subscribe((turns) => render(turns));
session.appendUserMessage('hello');
await session.send();
```

Each `Turn` is `{ id, role, content: ContentBlock[] }`. Content blocks are a tagged union (`text`, `thinking`, `tool_use`, `tool_result`) and arrive in the order the model produced them — interleaving is preserved.

## Transports

A transport is anything that implements:

```ts
interface AgentTransport {
  send(turns: Turn[], signal?: AbortSignal): AsyncIterable<AgentEvent>;
}
```

Three ship out of the box:

| Import | Purpose |
| --- | --- |
| `@labcat/tui-agent/mock` | Replay a hand-authored `AgentEvent[]` with realistic timing. Zero dependencies. |
| `@labcat/tui-agent/anthropic` | Wrap `@anthropic-ai/sdk` Messages streaming. Optional peer dep. |
| (your own) | Implement the interface for any backend. |

## React

```tsx
import { useAgentSession } from '@labcat/tui-agent/react';

function Chat({ transport }) {
  const { turns, send, isStreaming, abort } = useAgentSession({ transport });
  // …
}
```

See [`apps/clone`](../../apps/clone/) for a full reference clone.

## License

MIT
