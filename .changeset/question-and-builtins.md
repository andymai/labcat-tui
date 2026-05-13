---
'@labcat/tui': minor
'@labcat/tui-react': minor
---

Add `<tui-question>`, opt-in slash-command built-ins, and extend `CommandContext` for terminal-style I/O.

- **`<tui-question>`**: keyboard-first multi-choice picker that emulates Claude Code's `AskUserQuestion` tool. Arrow keys (or `j`/`k`) and `Home`/`End` navigate; `1`–`9` jump to a row; `Enter` commits. `multi` mode adds `Space`-toggle checklist semantics with deferred commit. Emits `tui-question-select` with `{ values, labels, indices }`. Auto-claims focus on scroll-into-view (≥60%), but never steals from focused inputs. React wrapper: `<Question onQuestionSelect={...} />`.
- **`builtinCommands(opts)`**: tree-shake-friendly factory returning opt-in `Command[]` for `/help`, `/clear`, `/config`, `/memory`, `/history`, `/alias`, `/which`, `/echo`, `/date`. Each entry is tagged `source: 'builtin'`. Compose with consumer commands via `defineCommands([...builtinCommands({ help: true }), ...mine])` — later same-name commands override.
- **`CommandContext` additions** (non-breaking — only new fields):
  - `write(node | string)` — append into the active scrollback before the prompt
  - `clear()` — wipe scrollback siblings, close any open `<tui-slash-overlay>`, refocus prompt (does NOT touch persisted history/prefs)
  - `history.all()` / `history.clear()` — read or wipe the prompt's per-instance history
  - `session` — pull-only `SessionStore` populated by `<tui-session>` providers
- `Command.source?: 'builtin' | 'consumer'` for `/which` and `/help` grouping.
