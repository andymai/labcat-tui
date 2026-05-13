import { useAgentSession } from '@labcat/tui-agent/react';
import { PromptInput, StatusLine, ThemeProvider, WelcomeBanner } from '@labcat/tui-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { TurnView } from './components/TurnView.js';
import { SCENARIOS } from './transcripts/index.js';
import { createCloneTransport } from './transport.js';

interface CommandEventDetail {
  name: string;
  args: string;
}

export function App() {
  const { transport, mode } = useMemo(() => createCloneTransport(), []);
  const { turns, isStreaming, send, clear, session } = useAgentSession({ transport });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  // turns is intentional: re-scroll whenever the conversation grows.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on turns growth
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [turns]);

  const handleCommand = useCallback(
    (event: CustomEvent<CommandEventDetail>): void => {
      const { name, args } = event.detail;
      const raw = args ? `${name} ${args}` : name;
      const trimmed = raw.trim();

      if (trimmed === '/clear') {
        clear();
        return;
      }

      const scenario = SCENARIOS.find((s) => s.name === name || s.name.slice(1) === name);
      const userText = scenario ? scenario.prompt : trimmed;

      if (typeof window !== 'undefined') window.__clone_last_user = userText;
      void send(userText);
    },
    [send, clear],
  );

  useEffect(() => {
    const onCmd = (e: Event): void => handleCommand(e as CustomEvent<CommandEventDetail>);
    document.addEventListener('tui-command', onCmd);
    return () => document.removeEventListener('tui-command', onCmd);
  }, [handleCommand]);

  return (
    <ThemeProvider theme="claude" className="app">
      <header>
        <WelcomeBanner glyph="✻" title="@labcat/tui clone">
          <div>
            {mode === 'mock'
              ? 'Mock mode. Try /refactor, /todos, /debug, or /code — or type freely.'
              : 'Live mode (claude-opus-4-7 via your API key).'}
          </div>
        </WelcomeBanner>
      </header>

      <main ref={scrollRef} className="app__main">
        {turns.length === 0 ? (
          <div style={{ color: 'var(--tui-fg-muted)' }}>
            <p>
              Try a scenario by sending one of the slash commands above, or just type anything to
              replay the greeting.
            </p>
          </div>
        ) : null}
        {turns.map((t) => (
          <TurnView key={t.id} turn={t} turns={turns} />
        ))}
      </main>

      <div className="app__prompt">
        <PromptInput
          placeholder={isStreaming ? 'Streaming…' : 'Type / for a scenario, or send any text'}
          disabled={isStreaming}
        />
        <StatusLine
          breadcrumb={`${turns.length} turns · ${session.isStreaming ? 'streaming' : 'idle'} · ${mode}`}
        />
      </div>
    </ThemeProvider>
  );
}
