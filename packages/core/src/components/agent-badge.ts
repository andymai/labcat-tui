import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type AgentCallsign =
  | 'alpha'
  | 'bravo'
  | 'charlie'
  | 'delta'
  | 'echo'
  | 'foxtrot'
  | 'golf'
  | 'hotel';

/**
 * `<tui-agent-badge>` — Per-agent persona indicator for multi-agent
 * visualisations (e.g. when several subagents are working in parallel).
 *
 * The `callsign` attribute selects one of the 8 NATO-phonetic personas
 * shipped in every theme (`subagentAlpha` … `subagentHotel`). The colors
 * are intentionally not bound to color names — each theme maps callsigns
 * to whatever palette colors fit its identity.
 *
 * @attr {"alpha"|"bravo"|"charlie"|"delta"|"echo"|"foxtrot"|"golf"|"hotel"} callsign
 * @slot - The agent's label (e.g. "claude-1")
 * @csspart dot - The persona dot indicator
 * @csspart label - The slotted label wrapper
 */
@customElement('tui-agent-badge')
export class TuiAgentBadge extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: baseline;
      gap: 0.5ch;
      font-family: var(--tui-font-mono);
      line-height: var(--tui-leading-tight);
    }

    :host([callsign='alpha']) {
      --tui-agent-color: var(--tui-subagent-alpha);
    }
    :host([callsign='bravo']) {
      --tui-agent-color: var(--tui-subagent-bravo);
    }
    :host([callsign='charlie']) {
      --tui-agent-color: var(--tui-subagent-charlie);
    }
    :host([callsign='delta']) {
      --tui-agent-color: var(--tui-subagent-delta);
    }
    :host([callsign='echo']) {
      --tui-agent-color: var(--tui-subagent-echo);
    }
    :host([callsign='foxtrot']) {
      --tui-agent-color: var(--tui-subagent-foxtrot);
    }
    :host([callsign='golf']) {
      --tui-agent-color: var(--tui-subagent-golf);
    }
    :host([callsign='hotel']) {
      --tui-agent-color: var(--tui-subagent-hotel);
    }

    .dot {
      color: var(--tui-agent-color, var(--tui-accent));
      flex: 0 0 auto;
    }

    .label {
      color: var(--tui-fg);
    }
  `;

  @property({ type: String, reflect: true })
  callsign: AgentCallsign = 'alpha';

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'note');
  }

  override render() {
    return html`
      <span class="dot" part="dot" aria-hidden="true">●</span>
      <span class="label" part="label"><slot></slot></span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tui-agent-badge': TuiAgentBadge;
  }
}
