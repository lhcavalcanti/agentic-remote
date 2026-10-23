# Provider compatibility

Status: Current implementation study, 2026-09-05

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
| Context-preserving recovery | Fresh Copilot session seeded with a bounded text-only brief; prior transcript remains read-only | Not supported | Copilot-only and capability-gated |
| Model and effort | Supported | Supported | Compatible through provider-specific model lists |
| Context tier | Default and long-context when advertised | Automatic provider-managed context | Provider-specific; Claude advertises only the default UI option |
| Interactive/plan/autonomous mode | Native Copilot modes | Claude permission-mode mapping | Partial; labels are shared but semantics differ |
| Permission prompts | SDK and terminal prompts | Agent SDK `canUseTool` | Compatible through the shared approval card |
| Clarifying questions | Copilot user-input request and structured elicitation form | Claude `AskUserQuestion`, including `multiSelect` | Compatible through the shared question/form card; structured answers preserve field values |
| Editable Agentic Remote queue | Supported, including waiting behind tracked SDK background agents | Supported | Compatible |
| Immediate follow-up steering | SDK `immediate` delivery and tmux CLI steering | Agent SDK abort/new-turn only | Copilot-only |
| Cancel | SDK abort or terminal interrupt | Agent SDK abort controller | Compatible |
| Background task monitoring | Experimental SDK task RPC; tmux `/tasks` event projection includes detached shells | Not exposed | Copilot-only |
| Slash commands | Copilot command catalog plus web commands | Web commands only | Provider-specific |
| Skills inspection | Existing SDK session metadata, or explicitly labelled folder discovery | Reported active-session skills and in-memory last-known metadata | Read-only; availability and scope are explicit |
| MCP inspection | Existing SDK session status, or explicitly labelled configured servers | Active query status and in-memory last-known metadata | Read-only; no configuration or credential exposure |
| tmux and SSH attachment | Supported for terminal-backed sessions | Not supported | Copilot-only |
| External session discovery | Copilot SDK and active process discovery | Agentic Remote-created sessions only | Copilot-only |
| Rename, clear, delete | Supported | Supported | Compatible |
| Review pin and opt-in record archival | Supported | Supported | Owning-computer persistence; requires advertised retention capability |
| File upload and workspace browsing | Shared implementation | Shared implementation | Compatible |
| Knowledge, transcription, push, PWA | Shared implementation | Shared implementation | Compatible |
| Hub/node routing | Supported when node advertises Copilot | Supported when node advertises authenticated Claude | Compatible and capability-gated |

## Current behavioral boundaries

- Copilot remains the default for new and legacy sessions.
- Provider availability is advertised per computer before creation. A legacy
  node that does not advertise capabilities is treated as Copilot-only.
- Claude Agent is SDK-only. The UI hides the tmux option and does not claim SSH
  visibility or terminal recovery. Session badges and the header identify
  whether each session is **tmux** or **SDK**.
- Idle Copilot SDK sessions can migrate to tmux with the same provider session
  ID. Claude Agent sessions cannot migrate because the Agent SDK process is not
  attachable to a tmux pane.
- Normal Copilot SDK sessions discover the owning computer's existing CLI
  configuration for MCP servers, repository and personal skills, custom agents,
  instructions, repository hooks, and host Git operations. Before every SDK
  create or cold resume, Agentic Remote asks the Copilot runtime for its enabled
  installed plugins, validates their managed contribution roots, and supplies
  the plugin skill directories explicitly. This preserves project and personal
  skill precedence while giving SDK sessions the same enabled plugin skills as
  interactive CLI sessions. Active SDK sessions retain their current plugin
  skill catalog until a supported restart or cold resume; new sessions see
  plugin installs and updates immediately. Plugin skill roots and MCP
  registration remain separate discovery inputs.
- SDK clients use the runtime bundled with `@github/copilot-sdk` by default.
  `COPILOT_SDK_BIN` is an advanced compatibility override for a separately
  qualified SDK runtime; `COPILOT_BIN` remains the interactive tmux executable.
- Destructive SDK deletion calls provider deletion directly and removes local
  state only after provider deletion succeeds or reports that the identity is
  already absent. Suspension and SDK-to-tmux migration still require successful
  detach so Agentic Remote never creates a second owner.
- Claude model and effort changes apply to the next turn. Claude controls its
  context window, so it does not advertise a long-context tier.
- Opening Model and context or App settings reloads the owning provider's model
  catalog. Copilot uses the CLI `models.list` RPC rather than the SDK's
  lifetime-cached `listModels()` helper; Claude uses a fresh `supportedModels()`
  query. Refreshing does not restart or reconfigure existing sessions.
- Copilot supplies its native slash-command catalog. Claude exposes only the
  Agentic Remote web commands that have provider-neutral implementations.
- The session menu provides **Skills** and **MCP servers**. `/skill`, `/skills`,
  and `/mcp` open these read-only views; optional trailing text filters the list
  locally. They do not invoke a provider command, send a prompt, or change MCP
  or skill configuration. Agentic Remote does not install plugins or MCP
  servers, perform MCP OAuth onboarding, edit provider configuration, render
  MCP Apps, or emulate the Copilot CLI TUI.
- Resource inspection never creates or resumes a provider session merely to
  read metadata. Copilot terminal, suspended, and unloaded sessions use
  server-scoped folder discovery when available. This shows configured defaults,
  not ephemeral terminal overrides or live MCP connections.
- Claude metadata comes from an already-active query and its reported skill
  names. After that query ends, the app can show its clearly labelled in-memory
  last-known snapshot. Before a report exists, or after a service restart, the
  view is explicitly unavailable until normal session activity reports it.
- Claude command descriptions are observed from the normal turn's cached
  initialization and command-change reports, not awaited anew by each view.
  Refreshing unchanged observations preserves their capture time. A refused
  clear keeps those observations; a committed replacement retires them even
  if subsequent cleanup fails. A post-commit upload-cleanup failure still
  announces the accepted replacement to connected clients before reporting
  its warning, so an old Skills/MCP view cannot remain attached to the retired ID.
- Resource requests expire on the server after ten seconds, before the browser's
  fifteen-second fallback. Disconnects and shutdown propagate cancellation
  through the hub and node to the metadata request. They do not stop inference
  or dispose an existing provider session. If the installed SDK/transport has
  no cancellable metadata adapter, inspection is unavailable or uses an existing
  report rather than invoking an unbounded RPC.
- Experimental resource RPCs are capability-gated. A valid empty catalog,
  unsupported inspection, offline computer, and failed request are distinct
  states. Raw MCP configs, environment values, headers, URLs, arguments, and
  provider error details are not returned to the browser.
- Restart has provider-specific meaning: Copilot reconnects or respawns its
  process; Claude clears transient error state and resumes lazily on the next
  turn.
- Opening a retained Copilot tmux session uses the CLI's explicit same-ID
  resume path. Agentic Remote recognizes both `--resume` and `--session-id`
  owners, prevents duplicate launches, and releases preserved queued work only
  after the resumed owner is ready. A refused provider resume leaves the
  historical record and queue intact.
- Recover conversation is distinct from same-ID Restart and destructive Clear.
  It creates a fresh Copilot identity, archives the visible transcript, seeds
  bounded earliest-and-latest text context before the preserved queue, and does
  not transfer provider event IDs, permissions, or connection-specific tool
  state.
- Recovery returns the committed replacement before the seed turn completes,
  allowing the hub to carry Knowledge and notification metadata immediately.
  Pending context rebuilding and later failure remain visible in session
  activity; queued work stays blocked until seed admission. Discovery retries
  pending terminal seeds only after ownership settles, without delaying other
  sessions. A seed with uncertain delivery is never automatically retried.
- Seed handoff excludes same-session runtime replacement without holding
  startup or discovery open. Provider slash commands are unavailable until
  context admission, including commands normally allowed during execution.
  Stop and Recover conversation remain the explicit interruption/recovery
  controls.
- A legacy failed-prompt barrier keeps preserved work blocked during unmodified
  1.1.2 startup, even though that release does not understand recovery seeds.
  It cannot automatically rebuild the context: return to a recovery-aware
  runtime to continue recovery, rather than dismissing its legacy failure
  marker. Pending seeds may then run once; failed or uncertain seeds are not
  automatically retried.
- A service restart marks persisted SDK approval/question requests stale and
  recoverable because their callbacks no longer exist. Replies receive `409`
  rather than claiming the old callback resumed. Terminal-backed prompts keep
  their live-terminal recovery behavior.
- Provider ownership and record retention are separate. Missing managed
  terminals remain interrupted and reviewable; interrupted SDK turns require
  explicit continuation. See [Session retention](session-retention.md).

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
5. Background task RPCs are experimental and may not be available on older
   Copilot runtimes. Agentic Remote uses capability discovery and
   event-triggered resynchronization; tmux sessions additionally derive
   agent and detached-shell records from the persisted `/tasks` event
   projection rather than assuming task events are durable.

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
