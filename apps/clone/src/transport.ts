import type { AgentTransport } from '@labcat/tui-agent';
import { createAnthropicTransport } from '@labcat/tui-agent/anthropic';
import { createMockTransport } from '@labcat/tui-agent/mock';
import { FALLBACK_GREETING, pickScenario } from './transcripts/index.js';

interface AnthropicConstructor {
  new (config: { apiKey: string; dangerouslyAllowBrowser?: boolean }): {
    messages: {
      stream: (params: Parameters<typeof anthropicStream>[0]) => ReturnType<typeof anthropicStream>;
    };
  };
}

declare function anthropicStream(params: unknown): AsyncIterable<unknown>;

export function createCloneTransport(): { transport: AgentTransport; mode: 'mock' | 'live' } {
  const apiKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ANTHROPIC_API_KEY) || '';

  if (apiKey) {
    // Live mode — wraps the official SDK. The user accepts the risk of
    // shipping an API key to the browser; the `dangerouslyAllowBrowser` flag
    // signals it to the SDK explicitly.
    return {
      mode: 'live',
      transport: createLiveTransport(apiKey),
    };
  }

  return {
    mode: 'mock',
    transport: createMockTransport(
      () => {
        const lastUser = (typeof window !== 'undefined' && window.__clone_last_user) || '';
        return pickScenario(lastUser);
      },
      { speed: 1 },
    ),
  };
}

function createLiveTransport(apiKey: string): AgentTransport {
  // Lazy import so the SDK doesn't load in mock mode.
  const lazyClient: Promise<{ messages: unknown }> = import('@anthropic-ai/sdk').then((m) => {
    const Anthropic = (m.default ?? m) as unknown as AnthropicConstructor;
    return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  });

  return {
    async *send(turns, signal) {
      const client = (await lazyClient) as unknown as Parameters<
        typeof createAnthropicTransport
      >[0]['client'];
      const inner = createAnthropicTransport({
        client,
        model: 'claude-opus-4-7',
        maxTokens: 4096,
        system:
          'You are Claude, a helpful AI assistant rendered inside a Claude Code-style terminal UI. Use markdown freely, including fenced code blocks.',
      });
      yield* inner.send(turns, signal);
    },
  };
}

declare global {
  interface Window {
    __clone_last_user?: string;
  }
}
