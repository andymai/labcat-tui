---
'@labcat/tui-agent': minor
---

Introduce `@labcat/tui-agent` — framework-agnostic agent runtime that turns the UI library into a working chat client.

- **Turn model**: `Turn` + flat ordered `ContentBlock[]` union (`text`, `thinking`, `tool_use`, `tool_result`) mirrors Anthropic's content-block protocol; interleaving is preserved.
- **`createAgentSession({ transport })`** controller with `appendUserMessage`, `appendToolResults`, `send`, `abort`, `clear`, `subscribe`. Immutable structural-sharing updates so React's `useSyncExternalStore` stays tear-free.
- **Transports**:
  - `@labcat/tui-agent/mock` — replays a hand-authored `AgentEvent[]` with realistic per-event timing; `chunkText()` helper splits a string into word-burst deltas.
  - `@labcat/tui-agent/anthropic` — wraps any `@anthropic-ai/sdk`-shaped client (peer dep, optional). Single-turn streaming; consumer drives the agentic loop with `appendToolResults` + `send`.
- **React binding**: `@labcat/tui-agent/react` exports `useAgentSession({ transport })` returning `{ turns, isStreaming, send, abort, clear, respondWithToolResults }`.

Companion reference clone: `apps/clone` (React + Vite, env-switched between mock and `claude-opus-4-7`).

Sizes: core 1.2 kB / mock 651 B / react 1.34 kB (all gzipped).
