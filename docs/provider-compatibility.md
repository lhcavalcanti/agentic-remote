# Provider compatibility

Status: Current implementation study, 2026-08-17

Agentic Remote supports GitHub Copilot and Claude Agent as separate providers
behind the same `SessionService` contract. They can run concurrently on one
computer, but a session belongs to exactly one provider and conversation
history is not transferred between providers.

## Compatibility matrix

| Capability | Copilot | Claude Agent | Compatibility |
| --- | --- | --- | --- |
| Local authentication | Existing GitHub/Copilot login | Existing local Claude login | Compatible; credentials remain on the owning computer |
| Streaming text and tools | SDK events and terminal event logs | Agent SDK stream events | Compatible through shared UI messages |
| Multi-turn resume | Copilot session ID | Claude session ID | Compatible; provider-native histories remain separate |
| Model and effort | Supported | Supported | Compatible through provider-specific model lists |
| Context tier | Default and long-context when advertised | Automatic provider-managed context | Provider-specific; Claude advertises only the default UI option |
| Interactive/plan/autonomous mode | Native Copilot modes | Claude permission-mode mapping | Partial; labels are shared but semantics differ |
| Permission prompts | SDK and terminal prompts | Agent SDK `canUseTool` | Compatible through the shared approval card |
| Clarifying questions | Copilot user-input request | Claude `AskUserQuestion` | Compatible through the shared question card |
| Editable Agentic Remote queue | Supported | Supported | Compatible |
| Cancel | SDK abort or terminal interrupt | Agent SDK abort controller | Compatible |
| Slash commands | Copilot command catalog plus web commands | Web commands only | Provider-specific |
| tmux and SSH attachment | Supported for terminal-backed sessions | Not supported | Copilot-only |
| External session discovery | Copilot SDK and active process discovery | Agentic Remote-created sessions only | Copilot-only |
| Rename, clear, delete | Supported | Supported | Compatible |
| File upload and workspace browsing | Shared implementation | Shared implementation | Compatible |
| Knowledge, transcription, push, PWA | Shared implementation | Shared implementation | Compatible |
| Hub/node routing | Supported when node advertises Copilot | Supported when node advertises authenticated Claude | Compatible and capability-gated |

## Current behavioral boundaries

- Copilot remains the default for new and legacy sessions.
- Provider availability is advertised per computer before creation. A legacy
  node that does not advertise capabilities is treated as Copilot-only.
- Claude Agent is SDK-only. The UI hides the tmux option and does not claim SSH
  visibility or terminal recovery.
- Claude model and effort changes apply to the next turn. Claude controls its
  context window, so it does not advertise a long-context tier.
- Copilot supplies its native slash-command catalog. Claude exposes only the
  Agentic Remote web commands that have provider-neutral implementations.
- Restart has provider-specific meaning: Copilot reconnects or respawns its
  process; Claude clears transient error state and resumes lazily on the next
  turn.
- A service restart clears unresolved in-memory approval/question callbacks and
  returns their stored sessions to idle. It does not claim that an unanswered
  provider request survived the process boundary.

## Risks and follow-up work

1. Re-check Claude authentication periodically so an expired login appears as
   unavailable before session creation rather than at first send.
2. Consider importing or discovering pre-existing Claude Code sessions. Current
   Claude history contains sessions created through Agentic Remote.
3. Keep provider-specific runtime copy explicit. Claude plan/auto permission
   behavior is similar to, but not identical with, Copilot plan/autopilot.
4. If durable cross-restart questions become a requirement, implement a
   provider-supported deferral/resume protocol rather than persisting an
   in-memory callback-shaped request.

## Sources

- [Claude Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview)
- [Claude Agent SDK TypeScript API](https://code.claude.com/docs/en/agent-sdk/typescript)
- [Claude sessions](https://code.claude.com/docs/en/agent-sdk/sessions)
- [Claude permissions and user input](https://code.claude.com/docs/en/agent-sdk/user-input)
- [GitHub Copilot SDK](https://github.com/github/copilot-sdk)
- `server/session-service.ts`
- `server/provider-session-service.ts`
- `server/agent-service.ts`
- `server/claude-agent-service.ts`
- `shared/contracts.ts`
