# SDK integration and architecture roadmap

Status: Proposed; planning only. Tracking issue: #212.

This plan addresses deeper SDK integration and incremental architectural
simplification. It does not authorize implementation, a default-backend change,
a storage migration, or a native-app rewrite. [The application
specification](app-spec.md) remains normative.

The baseline is `main` at `4a1efb4`, after #197. Recheck the implementation and
open work before starting each slice; issue descriptions and this baseline are
not proof that a defect still exists.

## 1. Decisions

- Keep the hybrid model: SDK sessions for structured web workflows, tmux for
  terminal attachment, exact CLI interaction, and live-process continuity.
- Improve use of the existing SDK integration, not the number of sessions or
  the number of runtime processes. A tmux session must never gain a second SDK
  owner just to inspect it.
- Keep the current Copilot/tmux creation default until the separate decision
  gate below. Claude remains SDK-only. Existing sessions are never converted
  automatically.
- Refactor one responsibility at a time before changing its behavior. Preserve
  the existing provider router, admission coordination, and persistence
  guarantees rather than building parallel abstractions.
- Reduce unnecessary history copying and transport before considering a new
  database. SQLite is a possible later decision, not a prerequisite.
- Keep one trusted-administrator hub and computer-local ownership. Multi-user
  isolation, high availability, authentication redesign, permission-default
  changes, and native-app implementation are outside this roadmap.

## 2. What already exists

| Area | Current implementation | Planning consequence |
| --- | --- | --- |
| Provider boundary | `SessionService` and `ProviderSessionService` already separate Copilot and Claude. | Extend these contracts; do not introduce another provider router. |
| SDK integration | Copilot already uses structured permissions, questions/elicitation, model/mode operations, command RPCs, and background-task RPCs. Claude uses its official Agent SDK. | Characterize and improve existing paths instead of reimplementing them. |
| Runtime compatibility | The lockfile resolves Copilot SDK 1.0.22. SDK clients use its bundled Copilot runtime by default; `COPILOT_SDK_BIN` is the explicit SDK override, while `COPILOT_BIN` remains terminal-only. Normal SDK sessions discover existing local CLI configuration. | Record the SDK, actual runtime, and supported protocol separately. A package or executable version does not prove runtime capability. |
| Lifecycle and durability | #197 added commit-aware persistence, durable retired identities, queue admissions/settlement, reply settlement, and shared `SessionAdmissions`. | Keep these invariants and their regression suites intact during extraction. Do not plan them as missing features. |
| Read models | `SessionSummary` exists, but `ManagedSession`, list responses, and `session.upserted` events currently carry full `SessionDetail` histories. | Reuse/refine the existing summary type and add an explicit unloaded-detail state. An empty array must not mean both unloaded and empty. |
| Polling and storage | Event logs have incremental readers and version gates; the JSON store batches durable changes and separates live stream deltas from committed checkpoints. | Preserve those optimizations. Measure remaining deep clones, full snapshot encoding, and changed-history projection costs. |
| Large modules | At this baseline, `App.tsx` is about 11,900 lines and `agent-service.ts` about 6,800. | Treat size as a navigation/ownership warning, not evidence of a performance defect or a line-count target. |

Source entry points: [provider compatibility](provider-compatibility.md),
[background tasks](background-tasks.md), [slash-command
feedback](slash-command-feedback.md), [session admissions](../server/session-admissions.ts),
[session store](../server/session-store.ts), and
[shared contracts](../shared/contracts.ts).

Current lifecycle evidence: the SDK 1.0.22 bundled runtime 1.0.98 supports
create, detach, and delete over protocol 3 with the existing GitHub CLI login.
The independently installed CLI can report a newer executable version while
launching an older headless runtime that lacks `session.detach`; therefore
destructive deletion does not depend on detach, while ownership-preserving
suspend and SDK-to-tmux transitions still fail closed when detach is
unsupported. Startup diagnostics expose only runtime version, protocol version,
authenticated state, and authentication type.

### Coordinate with existing work

| Work | Relationship |
| --- | --- |
| #156 | Owns web-native CLI surfaces while preserving tmux. SDK-facing slices below contribute to this direction. |
| #206 | Already implements read-only Skills/MCP surfaces on an unmerged UI stack. Reuse its eventual accepted contracts; do not create a competing resources API or panel. |
| #196 and #191 | Change the workbench and reader layout. Coordinate UI extractions with their owners and the actual merged base; do not copy their unmerged branches into a refactor. |
| #207, #208, and #169 | Track rename durability, task state, and intermittent terminal tests. Reassess their current status when relevant and keep actual bug fixes separate from mechanical extraction. |
| #92 | Remains the native-client implementation tracker. The technology decision and device gate live in [the native-shell plan](native-shell.md). |

Open issue/PR numbers are coordination references, not dependencies on unmerged
code. Start each implementation PR from current `main`, or explicitly document
one necessary parent. Avoid growing another long stack through the same files.

## 3. Small-PR sequence

IDs below are roadmap slots, not already-created GitHub PRs. Create or reuse an
implementation issue when taking a slot. Small means one reviewable behavioral
change or one mechanical extraction, not a large rewrite hidden behind a flag.
Mechanical moves and generated Graphify artifacts can have large raw diffs;
separate them from new logic.

**First batch: P0, S1, and U1.** They establish evidence and reduce coupling
without changing defaults, storage, or the wire protocol. Later batches can
stop whenever their user benefit or measured bottleneck no longer justifies
them.

| Slot | One-PR scope | Depends on | Exit criterion |
| --- | --- | --- | --- |
| P0 | Characterize SDK/tmux/Claude parity and record a synthetic performance baseline. | Current `main` | The matrix and measurements below have reproducible evidence; unimplemented or unexercised rows remain explicit gaps. |
| S1 | Extract the existing SDK command catalog/result translation behind a small typed adapter. | P0 | Existing structured command results, queue behavior, and errors are unchanged; terminal delivery and lifecycle ownership stay where they are. |
| S2 | Add narrow, sanitized SDK/runtime capability diagnostics through the existing provider and computer contracts. | S1 | New capabilities are explicit and runtime-derived; unsupported, temporarily unavailable, and unknown are distinguishable. Legacy nodes keep existing behavior. |
| S3 | Add one new SDK-native surface: a read-only available/current-agent view. | S2; reconcile #206 if it has landed | A capable SDK session exposes safe agent metadata without starting a turn. Unsupported sessions show an honest limitation; no agent selection, tool execution, or ownership takeover is added. |
| U1 | Extract `RuntimeDialog` and only its required presentation helpers from `App.tsx`. | P0 | Same model/effort/context/mode behavior, focus, errors, and provider gating; no visual redesign or new state owner. |
| U2 | Extract `NewSessionDialog` in a separate PR. | U1; reconcile active UI work | Same computer/provider/folder defaults, backend selection, permissions, validation, and mobile keyboard behavior. |
| U3 | Extract pure session-event reconciliation from `App.tsx` into a tested module. | U2 | Revision ordering, authoritative/offline snapshots, removal/replacement, selection, and stale responses produce the same browser state. |
| R1 | Add metadata-only store/service read projections and use them in non-transcript polling decisions. | P0 | An unchanged-history poll does not deep-clone message arrays just to check status/existence. No storage format, timing, or public response changes. |
| R2 | Add opt-in summary listing and cursor-based history reads through node, proxy, and hub contracts. | R1 | New readers can fetch bounded history without changing old endpoints; old/new hub-node combinations retain the legacy path. |
| R3 | Let the browser consume summaries and load selected-session history in pages. | R2, U3 | Unselected histories are not eagerly fetched on the new path; loading, paging, switching, clear/replacement, and reconnect remain correct. |
| R4 | Add an opt-in versioned event stream with summary/control events and subscribed-session message updates. | R2 | Legacy streams remain intact; the new producer has explicit sequence/gap recovery and bounded slow-client behavior. |
| R5 | Move capable browser clients to the new event stream. | R3, R4 | Streaming does not resend complete histories, disconnected clients recover from snapshots, and old servers still work. |

### SDK slice boundaries

S1 extracts command interpretation, not `dispatchCommand`'s admission locks,
native send uncertainty, or queue settlement. Preserve existing
`commands.list`, `commands.invoke`, and `commands.enqueue` semantics, including
commands that return a prompt versus text or a picker. Do not route every
slash command through a generic prompt fallback.

S2 extends the current capability mechanism rather than inventing a global
"SDK supports everything" boolean. Probe read-only runtime surfaces, cache
within the owning connection, and invalidate after a reconnect/runtime change.
Missing optional RPCs must not break existing chat, model controls, or terminal
sessions. Do not infer support solely from the bundled SDK's TypeScript types.
Surface safe versions/reasons only, never credentials, complete configuration,
environment variables, or raw provider diagnostics.

S3 is deliberately read-only. The installed SDK types contain experimental
agent discovery/current-agent APIs, but the actual runtime must advertise or
successfully answer the supported read. Project only identifiers, display
names, descriptions, invocability, and current selection. Do not return raw
agent objects: they can contain prompts, local paths, and MCP configuration.
Use stable agent IDs, not display labels. An agent picker that changes the
runtime is a later, separately scoped PR with its own admission, failed-write,
and resume semantics.

Use the existing SDK choice for opt-in development trials. Do not add a second
session selector, a second provider owner, or a blanket automatic migration.
Skills/MCP inspection remains coordinated with #206; MCP writes, installing
plugins, hook editors, fleet steering, and a generic terminal emulator are not
bundled into S3.

### Refactor and scale slice boundaries

The U1/U2 presentation components live in `src/session-setup/RuntimeDialog.tsx` and `src/session-setup/NewSessionDialog.tsx`, with their required shared runtime presentation helpers and types alongside them. `App.tsx` retains application state and callbacks; dialog-local state remains with each component. The extracted components never import `App.tsx`. Provider state stays on the owning computer and browser preferences with their existing owner.

U3 first extracts pure decisions, not a new global state-management framework.
Keep Knowledge panel layout ownership distinct from per-session reader
position, draft, and replacement continuity. A later hook extraction can be
another mechanical PR after the reducer is stable.

R1 must preserve `readAfterWrites`, `SessionAdmissions`, retirement checks,
stream watermarks, append-only event caching, and all event-log invalidation
conditions. Metadata reads must not become a way to bypass a pending durable
write or admit a turn against a retired identity.

R2 uses additive, capability-advertised routes or an explicit negotiated mode.
Specify the wire shape in that PR and carry it end to end through
`SessionService`, `ProviderSessionService`, node routes, `RemoteNodeClient`,
`ComputerManager`, hub routes, and `src/api.ts`. Reuse `SessionSummary`, adding
the control indicators needed by the sidebar without including message
history. Keep pending input and permissions available independently of which
history page is loaded.

Start with a proposed 100-message page limit, stable message IDs, and a cursor
bound to the computer, session, and history generation. A replaced/invalid
cursor must explicitly trigger a fresh read, not be silently applied to a new
session. Document the byte limit and lossless oversized-message policy in the
wire-contract PR before shipping it. Preserve `answeredComputerIds`, offline
last-known summaries, revisions, and replacement lineage.

R3 needs an explicit unloaded/loading/loaded/error detail state. Retire stale
requests when switching sessions or clearing them; late pages cannot resurrect
old history or overwrite newer streamed content. Bound inactive detail caches.
Keep a deliberate legacy fallback for older nodes, rather than claiming that
the new memory bound also holds for a legacy full-history response.
Until R5, legacy upserts can still deliver full transcripts: project them onto
the loaded pages instead of retaining every received history. R3 reduces
eager reads and retained UI state; it does not yet claim bounded event traffic
or bounded temporary decoding memory on that legacy path.

R4 is a read-model/transport change, not a new durable event database. Define a
connection epoch, per-session ordering, snapshot barrier, and explicit
resynchronization on gaps. Never replay old approval callbacks or acknowledge a
send merely because its event was transmitted. Computer status, removals,
replacement lineage, waiting state, queue failures, and task state still reach
clients that are not watching that session's transcript. Slow clients must
resynchronize or disconnect explicitly; they must not silently miss control
state or create unbounded output buffers.

R4 must cover both node-to-hub and hub-to-browser negotiation; cutting only the
last hop leaves the hub bottleneck intact. Do not require all nodes, browsers,
or native shells to upgrade simultaneously. R5 enables the new path only when
both ends advertise it.

## 4. P0 evidence and release gates

### Behavior matrix

Record SDK version, actual CLI version/protocol, backend, computer role, and
whether each result came from a fake-provider fixture or a live owning runtime.
An advertised command or a mocked success is not evidence of full CLI parity.

| Contract | Minimum cases |
| --- | --- |
| Ownership and discovery | Copilot SDK, Copilot tmux, and Claude; local and paired-node routing; no second owner attached to a live terminal session. |
| Creation and lifecycle | Create, resume, suspend, restart, rename, clear/replacement, delete, shutdown, and host recovery; preserve identity, cwd, runtime settings, and retired IDs. |
| Delivery | Immediate send, steering when supported, editable FIFO, native queued commands, duplicate submissions, and uncertain delivery without automatic resend. |
| Permissions and questions | Allow-all on/off, permission cards, structured/multi-step questions, cancellation, stale replies, settlement-write failures, and restart with a lost SDK callback. |
| Runtime and CLI surfaces | Model/effort/context/mode; text/prompt/picker command results; unavailable commands; background tasks and post-reconnect resynchronization. |
| Application continuity | Uploads, workspace/Knowledge, per-session drafts/reader state, old/new server compatibility, and delayed responses after clear or computer removal. |

A recovered SDK question can resume as a normal user turn under the existing
contract. That is not the same as preserving the original in-memory callback
or keeping an interrupted provider process running. Keep that distinction in
the matrix and the UI.

Use the existing Vitest/Playwright setup and current fixtures. Relevant suites
include `agent-service.test.ts`, `claude-agent-service.test.ts`,
`session-admission-lifecycle.test.ts`, `session-store-durability.test.ts`,
`session-store-providers.test.ts`, `session-enqueue-clear.test.ts`,
`session-reply-durability.test.ts`, `session-clear-transcript.test.ts`,
`terminal-queue-delivery.test.ts`, `terminal-startup-queue.test.ts`,
`event-log.test.ts`, `multi-node.test.ts`, `remote-node-client.test.ts`, and
`src/App.test.tsx`. Add characterization only where coverage is missing;
retain the existing fault-injection tests during moves.

### Performance evidence

These are proposed workloads and acceptance targets, not measured capacity
claims. Use isolated synthetic data and fake providers, never existing user
histories, credentials, or production load.
Set CPU, memory, and execution-time budgets for the development machine before
the larger cases; report a skipped case rather than exceeding those budgets.

| Workload | Purpose |
| --- | --- |
| 10 sessions, 100 messages each, one streaming session | Small-install baseline; avoid regressing normal use. |
| 100 sessions, 1,000 messages each, two streaming sessions | Expose total-history copying/encoding costs. Repeat with unchanged metadata and 10x history to isolate history dependence. |
| One hub and two synthetic nodes; two browsers, one throttled/offline | Exercise fan-out, bounded buffering, offline authority, and reconnect convergence. |

Record machine/runtime versions, payload distribution, cold/warm behavior,
API and event-convergence latency, event-loop delay, RSS, serialized bytes,
state-file writes, and history parse/clone counts. Compare repeated runs on the
same machine; do not put machine-dependent wall-clock assertions into ordinary
unit tests.

R1's deterministic target is zero full-message-array clones solely for
unchanged-poll metadata decisions. R2/R3's target is summary payloads independent
of total message history and no more than the requested page of messages per
history response. R4/R5's target is message-update traffic independent of old
transcript length, with bounded slow-client buffers and complete convergence
after reconnect. Publish before/after numbers in each performance PR and
explain any tradeoff.

### Per-PR completion

1. Name the invariant, affected files/owners, mixed-version behavior, targeted
   regression evidence, and rollback path in the implementation issue/PR.
2. Run the smallest relevant existing checks while iterating. Before a runtime
   PR can graduate, run the complete `pnpm check` locally; include the
   inherited-production-environment check when test/config changes require it.
   The advisory hosted light check does not substitute for this gate.
3. Refresh Graphify for tracked source or documentation changes. UI behavior
   changes also need phone/desktop evidence for the affected flow, including
   keyboard/focus and waiting-state behavior.
4. Follow [deployment and promotion](deployment-promotion.md) and
   [the repository rollout policy](../.github/copilot-instructions.md):
   development first, active release, `/health`, paired computers online,
   sessions preserved, and the affected behavior exercised through the hub.
5. Once development proves a reversible change, promote that exact commit to
   production without another routine approval. Record previous/new releases
   and the merge/promoted SHA; check production and roll it back on failure.
   Ask first for unproven node-only behavior, inconclusive evidence, stored-state
   migrations/rewrites/deletions, or changes `rollback` cannot undo.

This documentation PR itself does not change a running service or require a
native build. Do not open all implementation PRs, switch a backend default, or
deploy a candidate merely because this plan has been merged.

## 5. Explicit later decisions

### SDK-first default

Revisit only after representative opt-in SDK sessions have exercised the full
matrix on the supported local/paired runtimes. Record which important CLI
workflows still require tmux and whether the user accepts the SDK restart
semantics. An actual default change is a separate product PR updating
`app-spec.md`, creation copy/preferences, and tests. It affects new sessions
only and must remain easy to opt out of. If parity or continuity is inadequate,
keep tmux as the default; the structured SDK improvements are still useful.

### Further backend decomposition

After S1/R1, use the call graph and change history to choose the next narrow
`AgentService` responsibility, such as SDK reply settlement or task
resynchronization. Keep one owner for admission, provider side effects, and
commit/publication ordering. Extract one workflow with its tests; do not move
the whole service into a second equally large class or replace
`SessionAdmissions` with competing locks.

### Storage

Review storage only after read-path and transport measurements separate
serialization cost from UI/network cost. If JSON snapshots still dominate at
the intended workload, first write a small decision PR comparing the current
checkpoint store with a per-computer SQLite implementation behind the same
store contract.

Any subsequent migration needs an explicit schema/version, durable queue and
retirement semantics, crash/failure tests, a private backup/restore procedure,
and an approved rollback strategy. Reverting application code alone is not a
database rollback. Do not silently dual-write, delete old state, copy state
between computers, or add a shared/cloud database to this roadmap.

## 6. Upstream guidance

The implementation's pinned types and actual runtime evidence take precedence
over a generic feature table. In particular, this repository already uses
structured command RPCs; "CLI-only" does not imply that every named workflow
lacks a usable structured equivalent.

- [Copilot SDK/CLI compatibility](https://docs.github.com/en/copilot/how-tos/copilot-sdk/troubleshooting/compatibility)
- [Using a specific local CLI](https://docs.github.com/en/copilot/how-tos/copilot-sdk/setup/local-cli)
- [Native stack decision and device gate](native-shell.md#23-why-tauri-and-when-to-reconsider)
