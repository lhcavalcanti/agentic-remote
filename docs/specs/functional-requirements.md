# Functional requirements reference

Status: Source-checked reference, September 9, 2026.
Baseline: `main` at `15a043e57234f7addfd8160f990dd22b38f1882a`,
application version **1.1.0**.
The [publication delta](../reviews/2026-09-09/code-and-issues.md) synchronizes
the documentation to v1.1.1 without changing these provider/runtime findings.

## 1. Scope and authority

[The application specification](../app-spec.md) remains normative. This document
indexes functional contracts and their implementation; it does not replace the
specification, approve a new default, or authorize a state migration.
[Architecture](../architecture.md), [provider compatibility](../provider-compatibility.md),
and [deployment/promotion](../deployment-promotion.md) retain their respective scopes.
See [UI/UX](ui-ux.md) for presentation and [machine setup](machine-setup.md) for installation.

Labels below distinguish **Implemented**, **Gap** against an existing contract,
**Proposed** follow-up work, and **Boundary** deliberately unsupported behavior.
An issue or design describes intent, not proof of shipped behavior.
PR #236, head `d6f47f30545cd7814f771ba0c791aebea31af88f`, was unmerged
in the supplied review snapshot and is not part of this baseline.

This reference follows provider/session behavior through shared contracts,
provider adapters, admissions, queues, tasks, terminal control and resource reads.
Hub routing, storage implementation, workspace, Knowledge, audio and notifications
are linked integration contracts, not independently re-audited implementations here.

## 2. Entities and ownership

| Entity | Owner and identity | Functional boundary |
| --- | --- | --- |
| Computer | Hub registry; stable computer ID and pairing lifetime | Execution and provider authentication remain on that computer. |
| Provider | Owning computer's `SessionService` capability list | Copilot and Claude are separate adapters, not interchangeable histories. |
| Session | One computer, one provider, provider-local ID | Browser identity includes computer ID; the same bare ID on another computer is different. |
| Execution mode | Persisted session backend; public `sdk` or `tmux` | Open, suspended and execution mode are independent of foreground status. |
| Conversation | Provider history plus local message/notice projection | Provider events are not browser-owned drafts. |
| Pending interaction | Session/request ID plus a live callback or verified terminal form | A serialized card is not a durable callback. |
| App queue entry | Session and prompt ID | Contents, position and delivery claim belong to that exact item. |
| Dispatch/recovery | Session lineage plus opaque attempt/recovery token | Tokens authorize specific decisions, not generic exactly-once requests. |
| Background task | Owning session/runtime and task execution identity | Reused shell IDs must not redirect an older observation or stop. |
| Resource snapshot | Computer/session/provider/runtime ownership | Read-only metadata; scope and capture time explain its authority. |
| Knowledge association | Hub metadata keyed by computer/session | Neither changes cwd nor migrates execution/files. |
| Draft and reading position | Browser state scoped by computer/session | Replacement lineage transfers continuity; ordinary deletion does not. |

**Implemented:** `ProviderSessionService` combines provider lists/events and
routes session operations to the adapter that owns the session. Its provider
start/stop aggregation is not a transaction spanning two external providers.
Detailed reads carry messages; session/history lists deliberately omit messages.

## 3. Capability matrix

| Surface | Copilot SDK | Copilot tmux | Claude Agent |
| --- | --- | --- | --- |
| Creation | SDK identity and durable local record | Native CLI in an owned tmux pane | Local identity; official SDK query starts on a turn |
| Resume/history | Provider ID; lazy attachment/hydration | Native history and event-log projection | Persisted ID for Agentic Remote-created history |
| Immediate follow-up during a turn | `send({ mode: 'immediate' })` when supported | Native steering through verified composer | Unsupported; refuse rather than silently queue |
| Editable app FIFO | Yes | Yes, with safe native delivery | Yes |
| Targeted queued rewrite | Advertised capability; acceptance receipt required | Advertised capability; exact item and pane validation | Advertised capability; normal query acceptance signals |
| Provider slash commands | Provider catalog/invoke/native enqueue | Catalog plus pane feedback | None; web-local commands remain separate |
| Questions/permissions | SDK callbacks; supported elicitation forms | Parsed live dialogs and structured forms | `canUseTool` and `AskUserQuestion` |
| Background task inspection | Experimental RPC capability | Persisted event projection | Not exposed |
| Task cancellation | Only an advertised live task handle | No app cancellation handle | Not supported |
| Skills/MCP | Existing session metadata or labelled workspace defaults | Workspace defaults, not live terminal overrides | Reported live/last-known metadata; otherwise unavailable |
| Move SDK to tmux | Idle, capability-gated migration | Already terminal-backed | Never offered |
| External discovery | Copilot indexed history | Proven active CLI owner | Pre-existing Claude history is not imported |

**Boundary:** Capability flags describe the owning runtime, not every installed
provider version. Missing optional support must fail closed. In particular,
task `supported` and per-task `canCancel` are authoritative at read time.
Copilot is the default/legacy provider; public creation defaults favor tmux
and allow-all. Claude ignores terminal backing and remains SDK-only.
Availability is not continuous authentication monitoring: Copilot's adapter flag
is static; Claude checks local authentication at startup and ordinary dispatch.

## 4. Lifecycle and status

The shared foreground states are `idle`, `running`, `waiting`, and `error`.
There is no public `starting`, `stopping`, or `recovering` status in this baseline;
private admission/ownership guards cover those intervals.

| Transition | Implemented cause and guard |
| --- | --- |
| Absent → open/idle | Validated creation and committed local identity; provider failures trigger owned cleanup. |
| Idle → running | Durable turn preparation or observed native foreground work. |
| Running → waiting | Committed permission/question card; pending actions take presentation priority. |
| Waiting → running/idle | Matching reply and continuation evidence; settlement preserves newer interactions. |
| Running → idle | Owning turn completion/abort, subject to pending cards and native/background evidence. |
| Running → error | Provider failure; unfinished foreground tools must stop spinning. |
| Idle → suspended | Serialized teardown after idleness/live-work checks; metadata/history remain. |
| Suspended → resumed | Same identity/backend; queued work retains priority over later ordinary work. |
| Existing → restarted | Same identity/history, not a new provider context. |
| Existing → cleared replacement | Idle revalidation, new identity, lineage and permanent old-history cleanup. |
| Existing → deleted | Teardown, local state/upload removal, retirement; no replacement continuity. |

**Implemented:** `statusFromEvents` distinguishes root lifecycle from subagent
events; outstanding background agents can keep native work active after root
completion. SDK task snapshots also expose work without a foreground turn.
Detached shells do not, by themselves, make the foreground composer busy.

**Gap:** Claude `restartSerialized` calls `requireIdle`, which rejects `error`.
The specification requires online error-state Restart to remain available.
An idle Claude restart works; a fresh normal message may still start from error.
This is not evidence that every Claude failure requires destructive Clear.

## 5. Messages, steering and commands

**Implemented:** Ordinary admission commits a user message and assistant
placeholder before registering the SDK turn. Streaming updates replace/extend
the owned assistant entry; durable finish and error paths settle its activity.
Tool events retain independent IDs/statuses. Successful root `task_complete`
summaries become Agent messages; ordinary tool output remains activity.

Copilot immediate follow-ups preserve the original turn while handing off to
the new assistant entry. Only one follow-up handoff occupies its pending slot.
If the original turn finishes before acceptance, the follow-up's own tracker
finishes it; Stop and deletion retire the correct tracker.
Unsupported steering refuses explicitly. Unconfirmed steering remains uncertain,
not an automatic FIFO fallback or permission to repeat the same submission.

Claude does not implement immediate native steering. A busy direct message is
refused unless it is explicitly queued or joins an existing app FIFO.
Stop aborts the active query; a later send is a new turn, not resumed execution
of an old callback or tool.

Provider command execution differs from local commands such as `/skills`,
`/mcp`, `/statusline`, `/clear`, `/restart`, and the web cwd flow.
Copilot aliases/shortcuts normalize through the owning session's catalog.
Commands allowed during execution may run without stopping the foreground turn.
Catalog inspection for native commands can create a temporary SDK session;
this is **not** the read-only Skills/MCP inspection path.

Native command feedback is read from the pane, not invented from an event-log
entry. Interactive full-screen views remain terminal-only and are reported as
such. A command whose response is unavailable must not be described as a
successfully observed response.

**Gap:** A lost Copilot SDK `commands.enqueue` result currently emerges from
ordinary command submission with `uncertainDelivery: false`, unlike the guarded
`commands.invoke` path. The provider may already have queued it. The joined
Clear admission is conservatively protected, but the delivery warning is wrong.

## 6. Queue and submission guarantees

**Implemented:** Queue items have stable IDs, expanded text and creation times.
Edit/save addresses the named item without moving it; removal returns its text.
Reordering is serialized with queue work. Earlier app FIFO entries retain their
priority except for explicit targeted dispatch or the matching recovery decision.

A queue rewrite cannot run app-only commands. Copilot validates a command against
the current catalog and canonicalizes aliases; Claude rejects queued command
rewrites because it has no provider command path. Saving and targeted Send are
distinct actions, and old runtimes must not pretend that Save dispatched work.

Targeted dispatch requires an available, open, idle owner with no blocking
question, permission, recovery or competing dispatch. It claims the exact item
and its rewrite, not the head or a newly appended copy.
The public queue retains the original item/position during the claim.

Before external invocation, the claim removes the item from the durable runnable
FIFO and records uncertain recovery plus the original entry. Older runtimes
therefore see held recovery, not work they may silently resend after rollback.
The claim deadline is 20 seconds; SDK acceptance receipts separately use ten
seconds. A deadline is not proof the provider cancelled its work.

An accepted receipt settles queue disposition independently of turn completion.
A definite refusal restores the original unchanged entry when storage allows.
Missing receipts, timeouts and failed outcome writes retain an unconfirmed
claim. Discard requires that claim's exact attempt identity and explicit UI
confirmation; it neither sends the text nor stops provider work.

Automatic SDK/Claude drains use the same claim machinery. Legacy/native
turn-admission records additionally retain their own durable restoration or
recovery boundaries. Queue drains re-read canonical state, coalesce wakeups,
and do not hot-loop on ordinary authentication/storage failures.

Native FIFO claims commit before pane input. If post-delivery storage fails,
only settlement is retried, never the input. Current native ownership, an empty
readable composer and current idleness are checked again at actual delivery.
Explicit Queue must not turn into immediate Send after startup reconciliation.

Recovery resends use an exact current failed-prompt token. Copilot durably
consumes it before sending, records accepted receipts separately, and retries
acknowledgement without resending. An unresolved attempt requires a fresh,
explicit recovery decision. Claude atomically consumes a recovery token into one
canonical FIFO entry. Neither provider's token is a generic request deduplicator.

**Boundary:** There is no general server client-submission-ID receipt lookup or
all-request idempotency guarantee. A browser acceptance receipt is not a server
transaction with the provider. Network failure without evidence stays uncertain;
matching transcript text is not acceptance proof. See app-spec §6 for browser
pending-state writes, receipt retention and failed-storage behavior.
An ordinary valid queued paste retains expanded text but loses its compact
presentation. That is only part of #165: an ambiguous legacy draft retains an
unresolved payload on load, then ordinary accepted Send submits labels and
discards that unresolved copy. See the [UI gap reference](ui-ux.md#known-gaps-and-open-request-dispositions).
Ordinary queue-text preservation does not establish safe legacy recovery.

## 7. Questions and approvals

**Implemented:** Allow-all uses SDK approval callbacks or native `--yolo`.
Disabling it preserves per-operation approval. Folder trust and session-in-use
takeover are distinct terminal decisions: neither is silently approved.
Only the known desktop-install offer may be automatically declined, after a
fresh owner/prompt-identity check.

Copilot supports simple choices/freeform and the supported object-form elicitation
subset: strings, numbers/integers, booleans and string arrays, with field/value
validation. URL elicitation and unsupported field structures are explicit
boundaries, not a promise of arbitrary JSON Schema support.

Claude maps `AskUserQuestion` to ordered question cards, including multi-select.
Advancing a multi-question flow commits the next visible card before replacing
the private request ID or accumulated answers. Its question dismissal path is
not equivalent to Copilot elicitation cancellation.

Accepted SDK replies retain an in-process settlement record if storage refuses
confirmation. Retrying the same reply settles only storage; a conflicting reply
is rejected. Settlement must preserve newer permission/question cards and status.
These records and callback functions do **not** survive process restart.

On normal store initialization, pending input is cleared and non-idle SDK state
is reset; normal waiting permissions do not survive as live callbacks.
Copilot can reconstruct unresolved `ask_user` from provider events. If its callback
is absent, answering that recovered card starts a normal user turn. It does not
resolve the original provider callback. Claude has no equivalent event-log rebuild.

Terminal replies revalidate the live dialog identity before keys are sent.
Structured forms match the complete question/field headings using joined
soft-wrap capture, fill fields in order, and submit only at the end.
Failed matching or unconfirmed dismissal retains an actionable request rather
than typing a new prompt into an unverified form.

## 8. Background task lifecycle

**Implemented:** Task snapshots carry `queued`, `running`, `completed`, `failed`,
and `cancelled`, plus bounded progress/timestamps when reported.
The tracker deduplicates and orders task IDs and publishes only changed snapshots;
reconnect consumers must resynchronize state rather than count transient events.

Copilot SDK task reads are capability-gated RPCs. Concurrent resync requests
coalesce, with a further read when needed; runtime generations reject old results
after replacement. Native tasks come from event projection, including detached
shell launches, handoffs, observer output, stops and exit evidence.

Shell projection retains execution identity across native-ID changes and binds
pending stop/read outcomes to that execution. A later task reusing its ID must
not be cancelled, completed or overwritten by an older observation.
Quoted output is not a stop/exit acknowledgement. A foreground abort is not
proof that a deliberately detached shell stopped.

Snapshots prioritize live tasks and are capped at 100 entries. Display text is
bounded to 20,000 characters and recent agent activity to 40 lines.
Running counts include background-mode work, not synchronous task launches.
Only running background **agents** hold the SDK app FIFO; detached shells do not.

Every live task has a management surface. A Stop action is offered only when the
runtime supplies a cancellable handle. Native projection is forced non-cancellable;
no guessed PID kill or silently attached second SDK owner is an alternative.
Suspension refuses unreadable/unsupported task state or live owned work.

## 9. Lifecycle durability, restart and recovery

**Implemented:** Clear excludes new admissions and joins earlier handoffs.
A successful admission while it waits causes refusal even if the work has
already finished; a refused enqueue is not admitted work. Identity and idleness
are rechecked at the replacement boundary, with transcript ownership guards.

Clear creates a new ID and preserves title, cwd, runtime configuration and queued
continuity while permanently removing the old conversation. Browser drafts,
Knowledge position and related state follow replacement lineage, not copied
provider tool state. Removal with `replacedBy` precedes replacement publication.

A refused replacement commit preserves old provider history/uploads. Native
reset restores the old command/cwd before reporting refusal, or reports that
restoration also failed. After commit, cleanup warnings belong to the replacement:
the accepted identity must not be rolled back or destroyed.
Retirement prevents stale discovery from resurrecting cleared/deleted IDs.

Suspend retains identity/history and gives up runtime resources; resume uses the
same backend. Restart reconnects/respawns the same Copilot identity and retains
the native pane; it does not repair arbitrary provider-history corruption.
Claude restart is lazy state reset, subject to the error-state Gap in §4.

At service shutdown new admissions close first. Admitted commits/registrations,
reply settlement and durable queue cleanup are joined before storage closes.
Late admission must not start a provider turn after the service has stopped.
Storage close is not a cross-process provider transaction.

On host boot, persisted managed-open native ownership is reconciled with actual
discovery; live owners must not be duplicated. Missing recoverable native sessions
can be recreated with the same ID/cwd/title/runtime settings. One failed launch
is isolated to that session. Closed, deleted or suspended sessions are not reopened.
**Boundary:** A pending native queue is not authority to create a runtime:
startup delivery waits for positively discovered existing ownership. Missing or
uncertain owners keep FIFO held with bounded retry rather than guessing.

**Proposed (#235):** A separate context-preserving recovery would create a fresh
provider ID, retain a read-only transcript/boundary and seed a bounded deterministic
brief before preserved queued work. It is absent on main. Restart and destructive
Clear are not substitutes for that contract. Main also has no persisted recovery
offer replacing stale SDK controls. No brief limit, provider expansion, automatic
recovery trigger or migration/rollback policy is approved by this reference.

## 10. Read-only resources and runtime configuration

**Implemented:** Skills and MCP views never send/queue a prompt, invoke a command
or tool, or create/resume a session solely for inspection.
Snapshots distinguish `session`, `workspace`, `last-known`, and `unavailable`.
Valid empty, unsupported, invalid and failed reads are not interchangeable.

Copilot uses existing session metadata when possible; otherwise available
workspace discovery is explicitly configured-defaults metadata, not live tmux
configuration. Claude observes ordinary query initialization/command updates
and live MCP status, retaining only in-memory last-known snapshots afterward.
Unchanged reports retain their capture time; service restart forgets that cache.

Owning-server reads have a ten-second deadline and cancellation ownership.
Disconnect/shutdown releases metadata listeners without aborting inference or
disposing a shared provider transport. Missing cancellable adapters are
unavailable/fallback cases, not permission to issue an unbounded RPC.
Changes in session identity, cwd, execution mode, suspension or pairing invalidate
the old read; refused Clear does not retire the authoritative observation.

Only allowlisted summaries cross resource APIs. Raw MCP configs, secrets,
headers, URLs, command arguments and provider diagnostics are excluded.
Catalog results cap at 2,000 entries with explicit truncation/count metadata.

Models/effort/context choices come from fresh provider catalogs, not hardcoded
offerings. Copilot refreshes `models.list`; Claude uses `supportedModels`.
Refresh does not itself reconfigure an existing session.
Runtime changes require idle-compatible ownership and validated options.
Copilot uses native SDK model/mode RPCs or native process flags; Claude applies
settings on the next query and exposes only provider-managed/default context.
Shared Interactive/Plan/Autopilot labels have provider-specific semantics.
Partial provider/configuration failures must remain explicit, not false success.

## 11. Integrated files, Knowledge, audio and notifications

The [application specification](../app-spec.md#7-attachments-and-audio) and
[architecture](../architecture.md) define these higher-level contracts:

- Session creation validates executable cwd containment; loading existing
  sessions is not a migration/revalidation that strands their histories.
- Uploads belong to the originating session/computer, use private storage and
  sanitized unique filenames, and are cleaned on Clear/Delete.
- Read-only workspace paths remain inside the current session cwd. File/path
  insertion changes the originating draft and never auto-sends it.
- Knowledge roots identify computer/folder metadata on the hub; files stay on
  their owner. A session association and browser reading position are separate.
- Browser recording is not provider input. Transcription returns text to its
  originating draft; cancellation sends nothing. Delegated transcription is an
  explicit authenticated routing exception, not a copy of session ownership.
- Recordings/conversion artifacts are not permanent app state. Credential,
  repository and SSH-key synchronization are not application features.
- Questions/permissions outrank completion notifications; mute is hub-persisted.
  Opening the related chat clears its device notifications.
- Public resource errors are sanitized; ordinary provider/runtime errors must
  distinguish definite refusal, accepted-with-bookkeeping-failure and uncertainty.
  A useful error is not authorization to retry external side effects.

## 12. Functional acceptance index and coverage

Coverage names identify actual repository surfaces, not a claim that every test
was rerun during this documentation audit. Gaps remain acceptance work.

| ID | Acceptance contract | Main coverage surface / status |
| --- | --- | --- |
| FR-001 | Route one session to one provider/computer. | `provider-session-service.test.ts`, shared `SessionService` / Implemented |
| FR-002 | Gate provider/mode/optional features by owning capability. | `provider-session-service.test.ts`, `session-resource-providers.test.ts` / Implemented |
| FR-003 | Persist creation identity only on accepted admission; clean refused owned runtime. | `session-metadata-provenance.test.ts`, `agent-service.test.ts` / Implemented |
| FR-004 | Preserve timeline/tool identity and finish aborted/error activity. | `agent-service.test.ts`, `claude-agent-service.test.ts` / Implemented |
| FR-005 | Steer Copilot once through the owned follow-up; never silently queue unsupported steering. | `agent-service.test.ts` follow-up/Stop/receipt cases / Implemented |
| FR-006 | Validate native input, existing drafts, startup dialogs and late paste evidence. | `terminal-session.test.ts`, `terminal-send-uncertainty.test.ts` / Implemented |
| FR-007 | Keep provider commands separate from web-only actions and queued rewrites. | `queued-provider-dispatch.test.ts`, `shared/queued-commands.ts` / Implemented |
| FR-008 | Preserve uncertainty after a lost native SDK command enqueue receipt. | `session-enqueue-clear.test.ts` protects Clear, not error classification / Gap |
| FR-009 | Edit/remove/reorder exact durable queue items without losing FIFO. | `queued-dispatch.test.ts`, `queued-provider-dispatch.test.ts` / Implemented |
| FR-010 | Claim targeted delivery before invocation; hold unknown outcomes without replay. | `queued-dispatch.test.ts`, `queued-sdk-prompt.test.ts` / Implemented |
| FR-011 | Consume recovery tokens once; accepted receipts retry settlement only. | `recovery-resend-durability.test.ts`, `claude-recovery-admission.test.ts` / Implemented |
| FR-012 | Drain eligible queues after replies/restart without hot retry loops. | `session-admission-lifecycle.test.ts`, `terminal-startup-queue.test.ts` / Implemented |
| FR-013 | Retain browser drafts/receipt ownership without inventing server idempotency. | `src/App.test.tsx`, `shared/submission-error.ts`, app-spec §6 / Implemented boundary |
| FR-014 | Validate matching permissions/forms and serialize multi-question advancement. | `session-reply-durability.test.ts`, `claude-agent-service.test.ts` / Implemented |
| FR-015 | Retry accepted reply settlement without resolving callbacks twice. | `session-reply-durability.test.ts` / Implemented, process-local |
| FR-016 | Rebuild supported Copilot questions without claiming callback persistence. | `agent-service.test.ts` persisted `ask_user` cases / Implemented |
| FR-017 | Track task execution identity, progress, detached work and real stop evidence. | `background-task-adapter.test.ts`, `background-task-stop.test.ts` / Implemented |
| FR-018 | Resync tasks by snapshot; gate cancellation and suspension on live ownership. | `background-task-tracker.test.ts`, `agent-service.test.ts` / Implemented |
| FR-019 | Serialize suspend/resume and preserve identity/backend/FIFO. | `agent-service.test.ts`, `claude-agent-service.test.ts` / Implemented |
| FR-020 | Restart preserves identity/history and remains usable from error. | `agent-service.test.ts`; Claude error-state rejection / Gap |
| FR-021 | Rename durably admits intent before external synchronization. | Existing successful-rename tests; #207 refusal reproduced / Gap |
| FR-022 | Clear joins admissions and revalidates transcript/identity before replacement. | `session-clear-transcript.test.ts`, `session-enqueue-clear.test.ts` / Implemented |
| FR-023 | Refused clear preserves old history; committed cleanup failure keeps replacement. | `session-resource-clear.test.ts`, `session-metadata-provenance.test.ts` / Implemented |
| FR-024 | Delete/retirement prevents rediscovery; shutdown joins admitted work. | `session-admission-lifecycle.test.ts`, `session-store-durability.test.ts` / Implemented |
| FR-025 | Recover native boot ownership safely; do not create from FIFO alone. | `agent-service-recovery.test.ts`, `terminal-startup-queue.test.ts` / Implemented boundary |
| FR-026 | Move only supported idle Copilot SDK sessions to tmux with rollback. | `agent-service.test.ts`, `provider-session-service.test.ts` / Implemented |
| FR-027 | Inspect resources without inference/configuration/session-start effects. | `session-resource-providers.test.ts`, `session-resources.test.ts` / Implemented |
| FR-028 | Bound/cancel/redact resource reads and reject obsolete owners. | `session-resource-cancellation.test.ts`, `session-resource-transport.test.ts` / Implemented |
| FR-029 | Refresh catalogs and preserve provider-specific runtime semantics. | `agent-service.test.ts`, `claude-agent-service.test.ts` / Implemented |
| FR-030 | Retain context under a fresh identity without copying opaque provider state. | #235; no main recovery operation/archive/brief contract / Proposed |
| FR-031 | Preserve owning-computer file/Knowledge/audio/privacy/notification boundaries. | `workspace-browser.test.ts`, `session-knowledge-store.test.ts`, transcription/push tests / Integrated contracts |

## 13. Review limits

Graphify freshness was checked and ownership queried before source inspection.
The focused fake/pure run passed **73 tests in six files**. A separate in-memory
provider harness reproduced #207, lost-enqueue uncertainty and Claude error-state
Restart refusal, with successful/unsupported-path counterexamples.
The portable [provider reproduction](../reviews/2026-09-09/reproduce-provider-findings.mts)
and its [nine-case result](../reviews/2026-09-09/provider-gap-reproduction.json)
preserve that evidence. The [combined review](../reviews/2026-09-09/code-and-issues.md)
records the separate full `pnpm check` result and filesystem/performance experiments.
No real provider, login, terminal window or live deployment was used by these
provider-specific probes.
Source citations identify the baseline; passing focused tests does not certify
all provider versions, crash boundaries, filesystem failures or pending PR code.
