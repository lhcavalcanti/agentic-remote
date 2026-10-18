# Multi-computer architecture

## Roles

Every installation runs the same server in one of two roles:

- **Hub** owns the browser UI, local provider session services, and the registry
  of paired computers.
- **Node** owns only its local provider session services and exposes an
  authenticated machine API. It does not serve the UI.

A hub is also a node, so local and remote sessions follow the same routing
contract.

## Ownership

Sessions never move between computers. The owning node retains:

- Provider authentication and runtime processes
- Working directories and repository access
- Provider session history
- Tool permissions and execution

The hub stores remote node IDs, names, URLs, and pairing tokens in
`~/.agentic-remote/computers.json` with mode `0600`. It decorates session IDs
with their computer ID in the UI but does not copy repositories.

UI preferences meant to follow the user (appearance, accent, status line,
new-session defaults, sort, computer order) live in the hub's
`settings-profile.json`, also mode `0600`. Nodes keep none. See
[the settings profile](design/settings-profile.md).

Closing a session routes deletion to its owning node. That node disconnects any
active SDK session, deletes the session from provider storage, removes its local
rendered-history cache, and emits a removal event.

## Oracle (session manager agent)

The hub runs a manager agent, shown to you as Oracle: one Copilot SDK conversation in a runtime process
separate from the session service (`server/manager-agent.ts`). Its tools call
`ComputerManager`, so it starts, reads, and messages sessions on any paired
computer through the same routing as the browser, and sessions it starts are
ordinary sessions owned by their computer. A node never runs a manager.

`JournalRecorder` turns hub session events into an append-only journal, and each
turn begins with a roster and the journal entries since the last completed turn.
State, transcript, journal, registry, and the agent's Markdown memory live in
`<data>/manager/`. The manager's SDK session IDs are excluded from the session
service's discovery before they exist. See
[docs/design/session-manager.md](design/session-manager.md).

### Oracle Conversation speech path

Conversation mode is an optional extension of the hub-owned Oracle
conversation. The browser sends 16 kHz microphone PCM to a same-origin,
single-use-ticket WebSocket on the hub. The hub either uses its local voice
backend or relays the stream over the authenticated node API to the paired
computer named by `AGENTIC_REMOTE_VOICE_COMPUTER`. Both roles isolate native
STT/TTS in a child process; the node never receives Oracle's manager state.
The hub parses that selection before local engine paths: a remote selection
therefore needs no hub-local model inventory. The selected node independently
validates and advertises its local engine. With no selected computer, local
mode remains strict and invalid paths advertise voice as unavailable.

Raw PCM, synthesized audio, and partial transcripts stay in memory and are
never persisted. Each finalized transcript crosses exactly once through the
normal `ManagerAgent.send` path, is persisted as the normal Oracle user message
in Oracle conversation history, and enters remote Copilot's existing trust
boundary with the generated Oracle context. No separate voice transcript or
recording artifact is persisted. A restart or disconnect ends the stream and
stale audio or finalized transcripts cannot be replayed.

The feature is disabled unless `AGENTIC_REMOTE_ORACLE_VOICE=on`. Setup
preserves existing voice configuration but downloads nothing. Profiles are
installed only by `agentic-remote voice-install <profile>`, with pinned
compressed/expanded limits, regular-file/directory-only extraction,
per-profile publication locking, and atomic activation. The pt-BR profile is
research-only and requires `--accept-research-only` before network access.
Current shipped assets are Linux x86-64; browser requirements and measured
limits are documented in
[Oracle Conversation mode](oracle-conversation.md).

## Transport and authentication

The browser communicates only with the hub. The hub is a single trusted-admin
control plane, not a multi-tenant boundary. Every page, REST route, and
WebSocket upgrade must remain behind TLS and a deny-by-default upstream access
layer such as Cloudflare Access. Node REST and WebSocket routes retain a
separate random pairing token and must not be publicly reachable.

Pairing credentials are generated locally and displayed only by explicit
management commands. Use Cloudflare Access, an encrypted overlay, or TLS before
exposing the hub outside the trusted network.

## Routing

The hub exposes computer-aware routes under:

```text
/api/computers/:computerId/sessions/:sessionId
```

Local requests call the in-process session service. Remote requests are sent to
the paired node's `/node-api` routes. The node streams its native session events
over WebSocket; the hub adds computer identity and forwards them to browsers.

A browser that opens `/api/events?patches=1` receives `session.patched` instead
of a whole `session.upserted` once it has seen a session. A patch carries the
session without its messages plus `{from, to, keep, count, messages}`: keep the
first `keep` messages, append `messages`, expect `count` in total. Versions are
per socket and per session; the first event for a session, and every event to a
socket without the parameter, is the whole session. A patch that does not apply
to the browser's copy is dropped and the browser sends one
`{type: 'session.resync', computerId, sessionId}`; the hub answers with the
latest publication in full. Node→hub links still carry whole sessions.
Every event socket also accepts `{type: 'presence', oracleVisible}` (see
Notifications in the app spec); each message type is read only by its own
handler.

Each node advertises provider capabilities. Legacy nodes advertise Copilot only,
so a hub cannot accidentally create a Claude session on a node that has not
been upgraded and authenticated.

Copilot background tasks remain on the owning node. SDK-backed snapshots use
the session-scoped task RPC; tmux-backed snapshots use the persisted `/tasks`
event projection for agent and detached-shell lifecycle records. Both are
forwarded as separate task events; the hub never copies task output into
another session or into the conversation store.

The provider router keeps Copilot and Claude Agent state separate while
presenting one `SessionService` contract. Existing sessions without an explicit
provider are treated as Copilot sessions. Claude Agent uses the official
TypeScript Agent SDK, local Claude session persistence, and the owning host's
existing Claude authentication; Agentic Remote never transports that
authentication to the hub or another node.

### Read-only resource requests

Skills/MCP reads carry cancellation through the browser request, hub forwarding,
provider router and owning service. Each entry point has a ten-second deadline;
HTTP disconnect, shutdown and ownership changes cancel the same read. Completion
and failure remove every request-owned listener and timer. Provider readers must
settle their underlying work on cancellation, not race an uncancellable promise.

Copilot's generated RPC wrappers currently provide no per-request cancellation.
The adapter uses a distinct request ID on the already-owned stdio transport,
the SDK's shared serialized message writer, and its own bounded response reader.
Cancellation withdraws that request and removes its reader without adding a
permanent waiter to the SDK's response map or closing another request's channel.
Claude uses its existing control request's signal-aware cancellation; skill
descriptions are observed once from normal initialization and command updates.
These narrow SDK transport adapters are capability-guarded and covered against
the installed SDK implementations. Unsupported shapes fail closed instead of
starting/resuming a session or invoking an uncancellable wrapper.

Computer summaries expose a non-secret, in-memory registration ID so a browser
can distinguish same-ID re-pairings (and a new hub runtime) from ordinary status
or name updates. The resource view also owns its session, provider, cwd, execution
mode and suspension state. Event-time invalidation prevents a batched
change-and-revert from reviving an old catalog. Registration IDs and resource
observations are not written to stored session or pairing state.

## Failure behavior

- A failed node request marks that computer offline.
- WebSocket connections retry with backoff.
- Last-known remote session summaries remain visible while a node is offline.
- Overlapping remote session reads share a snapshot and reconcile live events
  received while it was loading. Replies from removed or replaced clients
  cannot repopulate the cache, and reconnect task reads cannot overwrite newer
  task events or explicit task reads.
- Commands against an offline node fail explicitly; they are not queued.
- The systemd user service restarts after failure and starts at boot when user
  lingering is enabled.
- Each node persists open-session backend ownership in
  `~/.agentic-remote/state.json`.
- A service restart reuses existing tmux processes. A full host reboot
  recreates missing tmux windows, with the same Copilot session IDs, for the
  sessions Agentic Remote manages: those it created, moved, reopened,
  suspended, resumed, reconfigured, restarted, cleared, or recovered, or sent
  a prompt, command, queued item, or answer. A Copilot process merely
  discovered in some other tmux pane is listed while it runs but is not
  recreated after it exits. Recovery intent recorded by earlier releases'
  discovery is kept until that session is closed.
- Each node checks every Copilot CLI version it updates to by starting a
  retired, disposable session in a detached tmux session of its own
  (`server/cli-canary.ts`). It records the result in
  `~/.agentic-remote/cli-canary.json`. A failure is relayed to the hub as an
  `error` event with `notify` set, which the hub shows and sends as a
  high-priority notification.
- Repositories, credentials, and provider session databases remain on the
  owning computer's persistent local filesystem; recovery does not use NFS.

### Session-store commit boundary

`SessionStore` prepares mutations against private candidates, writes compact
JSON to the existing replacement file, and installs the candidate only after
the atomic rename succeeds. All reads, including backend/dispatch metadata and
streaming snapshots, use the committed view. A failed write rejects every
mutation covered by that write without publishing or retaining its candidate.
Later queued mutations prepare against the last committed view. A callback
that throws is discarded without changing other mutations in its batch.

Writes queued behind an in-flight write still coalesce. The pending batch is
closed **before** preparing and serializing its snapshot, so a call received
during I/O waits for a subsequent write rather than receiving an acknowledgement
for a snapshot that does not include it. Results are read after installation;
they may include other mutations committed in the same batch. `flush()` waits
for outstanding writes and propagates write failure.

Serialization reuses each unchanged session's encoded bytes, keyed by the
committed session object. It writes the file in pieces of at most 1 MiB:
small pieces are joined, and large sessions are written as uncopied views
that end on whole characters. The bytes equal `JSON.stringify` of the state.
This relies on committed sessions never being mutated in place; tests set
`AGENTIC_REMOTE_STORE_FREEZE=1` to deep-freeze them and fail on any such write.

Session removal and replacement are separate commit boundaries, both before
and after the destructive operation. Earlier callers receive their successful
snapshot while its ID still exists; a later replacement can then inherit those
committed values without retroactively rejecting the earlier caller. Each
batch settles only its own mutations. This deliberately adds a boundary for
destructive operations, not for ordinary metadata, queue, or event bursts.

Synchronous text deltas remain volatile. An in-memory change journal preserves
their order relative to queued mutations, including a transcript replacement
that has not started writing yet. Adjacent tokens coalesce; the journal holds
changes, not history snapshots. Live messages detach from a checkpoint once per
view, rather than taking a transaction copy or serializing history per token.
The existing outward snapshot boundary and transcript/event-log caches remain
independent.

Only deltas, never pending durable mutations, are replayed over a newly
committed view. Deltas received during I/O remain pending for the next
checkpoint; after a failed write, its deltas are retained but its durable
mutations are discarded. Commit revisions account for intervening deltas,
including when the committed mutation clears their message.

Mutation callbacks must be synchronous and confined to the supplied session;
they run when their batch starts, not when the API call is admitted. Providers
must derive state-dependent changes and no-op comparisons from that candidate,
not from a previously returned snapshot. Runtime-event reduction and transcript
projections therefore merge the candidate's current runtime, notices, working
directory, and pending question. `updateIf()` can explicitly decline a change;
it does not turn a write or validation error into a no-op. Reply completion
clears only the matching request and preserves another request's waiting state.

Transcript reads capture an O(1) admission epoch before fetching history.
Installation rechecks that epoch and current SDK ownership against the actual
mutation candidate, before cloning history or running its projections. A
pending commit-to-registration handoff remains protected even before a live
prompt owner is installed. Rejected observations do not advance event-log
fingerprints or erase a newer live watermark. The same boundary protects SDK
hydration and recovered question cards; native/external reconciliation remains
available and retains its existing version and dispatch-watermark gates.

Clear acquires an exclusive lease from `SessionAdmissions`, without admitting
itself into the work it must join. Async-local permits allow already-admitted
handoffs to finish their nested work, but cannot be reused after they finish.
Clear refuses if any joined handoff committed work, then revalidates the
admission epoch, inactive state, and identity again in the replacement
transaction. No original provider/history is disposed on a busy refusal.
Failed exclusive operations release their lease and reawaken only deferred
queue demand. The existing post-commit replacement cleanup contract is unchanged.
Successful normal and recovery enqueues mark their admission committed and
record queue demand immediately after persistence, before publication can
throw. Send/command finalizers wake that demand only after releasing their
admission and queue locks; an exclusive Clear keeps it deferred until its own
lease is released. SDK command queue rejection is not acceptance when the
provider explicitly returns `queued: false`; a lost RPC result remains uncertain.
Direct native messages and commands share an effect latch: success or explicit
delivery uncertainty protects joined Clear before returning or throwing.
Uncertainty does not become known delivery. The controller includes lost paste
acknowledgements in its uncertainty boundary; pre-paste capture/buffer failures
and a paste process that could not spawn remain definite, effect-free failures.
This Clear effect latch is separate from the per-dispatch accepted receipt:
uncertain native effects never call `recordDelivery()` or acknowledge recovery.
Confirmed delivery still holds startup followers before fallible receipt work,
redacts accepted recovery immediately, and retains acknowledgement-only retries.
Deferred native demand uses the existing coalesced queue wakeup, which cannot
enter an exclusive Clear lease from an unrelated admission.

Native startup queue intent is captured from managed-open persisted sessions
before discovery can mark other live terminals open. Startup seeds the existing
guarded drain rather than waiting for a completion newer than the queued text.
Its stricter readiness checks require completed discovery, the existing owner,
and a readable empty composer; managed/open/native state is rechecked in the
claim transaction. The existing bounded claim/settlement retries retain this
startup intent across transient observation or persistence failures. Queued
sessions are not force-created by boot recovery, and repeated `start()` calls
join the same startup rather than reload state or install more pollers.
An accepted recovery awaiting acknowledgement retains its startup queue intent:
the acknowledgement's coalesced wake must still satisfy the original startup
owner, readable-composer, and managed-open claim checks. Unknown delivery remains
held rather than becoming an accepted receipt or an automatic retry.
Normal drain and failed-read retry cleanup use the same exact-token accepted
recovery predicate, after checking lifecycle eligibility. A scheduled startup
acknowledgement keeps that origin across write retries; closure, suspension,
deletion, stop, or a backend change cancels its automatic queue wake rather than
turning it into an ordinary unguarded drain.
Native receipts restored at startup keep that origin even when a closed or
unmanaged session never qualified for startup queue intent.
Eligibility comes from the original persisted intent, not discovery-observed
metadata; an acknowledgement cannot revive an intent already retired.

An SDK object's registration is not admission of its persisted identity.
Creation and clear buffer SDK metadata until the identity write succeeds, then
replay it after publishing the created/replacement session. Failed identity
writes discard dependent metadata, while genuine SDK creation/configuration
errors retain their existing reporting and recovery behavior.

Discovery waits for provider creation to settle, including cleanup of a refused
identity write. Rejected SDK identities are detached, deleted from the provider,
and excluded from later discovery; cleanup failures are surfaced and remain
quarantined in the running service. Late SDK attachments and events cannot
reinstall a retired owner. A clear keeps the original SDK identity until the
replacement commits, then retires it. Persisted replacement lineage prevents
stale provider listings from rediscovering the original after restart. Cleanup
failure after an accepted clear is reported without undoing the committed clear.

An indeterminate terminal discovery at cold start is reported without replacing
the last stored session view or preventing the HTTP runtime from starting.
Recovery and terminal admission wait for a successful discovery rather than
treating an unreadable or differently namespaced tmux server as absent. The
session read route returns the last committed view during that wait; opening a
read-only view must not close the retained identity or cancel boot recovery.
Explicit activation waits for ownership confirmation.

Even after aggregate discovery succeeds, an individual ownership probe can
remain unreadable. That session keeps its retained view, queued work, and
persisted managed-open/backend eligibility, including across a service restart.
Its ownership recovery stays pending on the existing discovery poll; an
unreadable probe is never evidence of absence. Other sessions confirm or recover
independently and remain usable. Successfully handled identities are not
recovered or startup-reconciled again while a different session is deferred.
Transcript refresh and runtime admission wait only for the affected identity.

Deferred recovery joins `SessionAdmissions` with transcript protection as well
as per-session lifecycle ownership, so Clear and stop cannot cross a late
ownership probe. It re-reads eligibility and configuration before creating a
missing owner. A queued candidate instead waits for a positively identified
owner: proven absence may close its live view without cancelling managed-open
intent, while an indeterminate probe preserves the retained view. The native
queue pump honors that per-session recovery gate. Accepted recovery claims are
restored before any startup queue cleanup, and a suspension attempt that still
can refuse does not discard the original queued startup intent.

Destructive operations retain their strict absence checks. A genuine launch failure still
closes that recovery candidate and reports `Boot recovery failed`; persistence
errors while recording either success or failure propagate rather than being
classified as probe failures. State validation and SDK startup errors are
likewise not swallowed by the discovery-only exception.

`SessionReplacementCleanupError` carries the exact replacement accepted by the
store when subsequent upload removal fails. Providers publish its removal and
replacement events before reporting that cleanup warning. A pre-commit write
failure remains a refusal and publishes no replacement identity. This
distinction concerns post-commit upload cleanup, not provider-history rollback.

Providers await mutations before publishing or acting on their results.
`readAfterWrites()` queues a read behind admitted changes before runtime,
dispatch, or lifecycle decisions; a read-only batch does not write or
checkpoint volatile tokens. Admission markers remain held across that wait.
It is not a lock: later provider work still requires the existing live checks
and queue/lifecycle ownership rules. Selecting and removing a queue head uses
one store transaction. Reorder operations use this same boundary and must not
add per-operation rollback. External provider delivery is not part of the
filesystem transaction.

SDK and Claude queue preparation durably reserves the current FIFO head without
removing its text. Turn admission then atomically appends the user/assistant
records, marks the turn running, and removes only the matching reserved head.
A refused admission leaves the FIFO item intact even if every subsequent write
also fails; there is no compensating enqueue that can fail and lose it. The
private reservation is discarded on restart, before any turn was sent, so the
original queued work remains available. Edits or a newer reservation invalidate
an older prepared admission.

Provider admissions share a tracked lifetime covering public sends, queued
drains, provider loading, commit, and query registration. Shutdown closes that
gate synchronously, cancels existing provider waits, and drains admitted
boundaries before teardown. It does not wait for a full turn before cancelling
the provider. Late SDK attachments are disposed rather than installed.
Claude registration has its own owned completion signal; a stopped or
superseded registration cannot launch a query or clear another owner's state.

Queued SDK/Claude admissions retain a private handoff marker and existing
uncertain-recovery text in the turn commit. A confirmed handoff clears that
marker without redelivering work. Shutdown before handoff restores the exact
committed queue entry and removes only its provisional transcript records.
If that restoration cannot be saved, restart exposes the retained text as
uncertain recovery instead of losing it or automatically replaying it.
Settlement of an older handoff does not overwrite a newer owner's activity.

Queue wake-ups are coalesced and scheduled only after reply and drain locks
have been released. A typed stale-reservation rejection requests a fresh pass
over the committed canonical FIFO; authentication/storage failures stop that
pass until a new trigger. Completion and durable reply settlement are both
triggers. Every pass rechecks ownership, pending cards, and stop/suspend/delete
state before committing or dispatching work.

`SessionStore.close()` fences new mutations and uploads, drains admitted
writes, and checkpoints remaining streamed text. Provider teardown and
owned-query cancellation precede that final storage boundary; late completion
callbacks cannot publish updates or write into a closed store.
Private batch scheduling remains enabled for admitted removal/replacement
boundaries. Late live deltas cannot recreate the state directory. This close
protocol requires no stored-state migration or history rewrite.

Claude recovery submissions honor the `acknowledgesFailure` value forwarded by
the provider router. `claimRecoveryPrompt()` compares it with the candidate's
current recovery, appends exactly one retry to canonical FIFO, records token
consumption, and clears only that recovery in one commit. The queue pump is
woken only after that commit. This is durable queue acceptance, not a claim that
an external provider received the retry. Plain direct sends retain their existing
behavior. Subsequent queued handoffs use fresh recovery timestamps, so a consumed
token cannot be reused for a later uncertain attempt.

Claude startup distinguishes three outcomes: lookup failed before any query
invocation, invocation outcome is uncertain before registration, and a registered
query completed. The first restores the matching unstarted admission without
calling `finishMessage()`; the second preserves explicit uncertain recovery
without automatic replay; only the third uses ordinary completion cleanup.
Restoration refuses to overwrite a newer active or registering owner. A failed
restoration retains the original durable admission for a later retry or restart.

Terminal queue delivery first atomically claims the exact FIFO head, moving its
content into the existing uncertain-recovery record before any keystrokes are
sent. A private `terminalQueueDispatch` identity hides that provisional recovery
from the public snapshot while delivery is in flight. Completion clears the
claim and records command feedback together. If completion persistence fails,
the service retries only that write, with bounded backoff on its existing poll;
it never repeats the terminal action. New delivery cannot consume an unresolved
claim or overlap an admitted direct dispatch. A refused pre-delivery claim is
retried even when no new terminal event arrives. If a delivered command's pane
cannot be read, observation is retried rather than assuming a turn started;
retried settlement rechecks current native work and overlay state, and the
next claim cannot run into a working pane. Overlay closure is observed before
continuing the FIFO. On restart an orphan
claim becomes visible uncertain recovery, not a
retryable queue item. Older runtimes also retain the existing recovery record.
Settlement preserves a newer native completion or permission state instead of
restoring the claim's obsolete running state.

Recovery resends use the existing `failedPrompt` record as a durable claim.
Before dispatch, a compare-and-set replaces the acknowledged `failedAt` token
with a fresh `resend:<UUID>` token, the actual submitted text (including edits), and
`uncertain: true`. A private `recoveryResend` record commits the same token and
content with `accepted: false` in that transaction. A refused write or rename
delivers nothing. The consumed
token no longer matches durable state, so another reader cannot replay it after
a crash even if every post-delivery write failed. In-flight ownership also
blocks use of the fresh token until that dispatch finishes.

An unresolved attempt's token never authorizes another delivery, even across a
restart. Asking to resend it commits a distinct decision token and returns 409
with that token, without sending input; the reader must check the conversation
and terminal and explicitly submit the new decision. The existing HTTP receipt
and composer-binding protocol preserves the edited draft across this boundary.
Even a pre-delivery refusal after the claim commits conservatively takes this
path. Successful sends acknowledge the attempted-delivery token; app-queued
resends pass that token to the existing atomic
answering-enqueue operation. Acknowledgement retries compare the token inside
the store mutation, so a delayed retry cannot erase a newer decision. Failed
acknowledgements report uncertainty instead of reporting a completed settlement.
Clear replacement carries the current marker, not the consumed token.

Delivery acceptance is tracked per dispatch, not by a session-wide boolean.
Terminal receipt, durable application queue admission, and handled command
results cross that boundary before activity/feedback writes. A confirmed external
receipt sets the private record's `accepted` bit in its own awaited transaction
before later bookkeeping. After restart, accepted records reconstruct only the
token-scoped acknowledgement task and remain unavailable for resend. If even
that receipt write fails, the persisted unconfirmed attempt still cannot deliver
again without the separate explicit-decision exchange described above; the
service does not invent certainty about an unsaved receipt. A later failure
keeps the recovery claim reserved and retries only acknowledgement of its own
token, following clear lineage when necessary. Public session reads do not offer
a known-accepted marker while acknowledgement is pending. An anonymous copy of
an unresolved `resend:` draft is refused instead of bypassing token validation.

The confirmed-delivery boundary establishes startup dispatch ownership before
any fallible receipt or publication work; an earlier readiness observation cannot
undo a later confirmed receipt. It marks the linked in-memory claim accepted and
publishes that projected state even when the receipt write is refused. A committed
receipt is published again at its durable revision. All public session-returning
methods, including reply/lifecycle results and nested queue-removal sessions,
use the same projection. It consults only current recovery metadata, hides
accepted and obsolete markers, and leaves internal failure/queue ownership and
newer unaccepted recoveries unchanged.

The same dispatch boundary and claimed token pass through admission wrappers,
SDK turn preparation, generated command prompts, and durable answering-enqueue
transactions. The first accepted acknowledgement belongs to the original send
admission. Each later token-only retry enrolls separately; its backoff sleep is
cancelled and resolved on shutdown. Teardown joins admitted sends and retries
before stopping providers or closing the store. A failed final checkpoint is
reported, with the fresh uncertainty retained for an explicit decision after
restart. SDK handoff markers cannot be consumed as recovery claims while their
queue admission still owns them.

Recovery acknowledgement wakes the owning backend's queue through the tracked,
coalesced wake-up path. A wake blocked by an existing drain is retained until that
drain releases ownership, but stop closes admission before any new pass. Neither
acknowledgement nor a delayed wake may clear a newer recovery, resurrect a retired
owner, or replay a delivered action.

Submission errors carry an optional `{ sessionId, failedAt, accepted }` receipt.
The node error handler, remote-node client, hub error handler and browser API
preserve that bounded metadata and the HTTP status. The browser captures the
submitted token before awaiting the request, defers snapshot reconciliation
while that submission is in flight, and binds a restored draft to the returned
token. Failed-response bindings persist beside drafts and follow session
replacement; navigation must not move the draft into the selected unrelated
session. If a response is lost or an older peer omits metadata, the original
binding remains rather than permitting an anonymous resend. Accepted receipts
do not restore submitted text. Unrelated writing remains untouched.

The browser also orders already-serialized HTTP results against observed
session events. API requests capture the client event sequence before fetching;
decoded session objects, arrays and queue-removal envelopes retain that local
provenance in a WeakMap, without wire fields or fabricated durable revisions.
The common session merger uses the existing per-session event watermark: an
overtaken equal/older-revision result may hydrate history or return mutation
data, but inherits the current recovery field instead of reviving an accepted
one or clearing a newer recovery. Fresh reads after the event and genuinely
newer durable results remain admissible. Removed session/computer ownership is
also checked. State observations discard request provenance so later local
reconciliation cannot misclassify them as pending HTTP responses.

The private `recoveryResend` field is additive within saved-state version 1.
It is omitted from public session snapshots and validated on load; malformed
receipt metadata fails startup rather than silently becoming retryable.
Legacy unstamped
recoveries remain readable and are claimed when their unchanged text is
resubmitted. Older runtimes that check `acknowledgesFailure` still reject an
already-consumed token because the saved token changed. They do not,
however, honor the private attempted-delivery and accepted-receipt record.
Rolling back to such a binary can re-enable a consumed attempt. Development validation
must exercise both write-refusal boundaries and restart before promotion; an
old-binary rollback needs an operator decision to settle or pause recovery
resends first. Do not rewrite stored recovery state merely to enable rollback.

### Durable identity retirement

Version-1 state can include an identifier-only `retiredSessionIds` ledger.
Clear and delete record retirement in the same atomic write as the identity
change, independently of any surviving session. Deleting the last replacement
therefore cannot make an ancestor discoverable again when external provider
cleanup failed. Direct creation, provider discovery, reads, and terminal
recovery all reject or exclude retired identities.

Legacy `replacedSessionIds` are indexed in memory without an eager file rewrite
and retained by subsequent successful writes. Retirement lookups are cached by
immutable snapshot array, so reads and streamed tokens do not scan the ledger.
Rejected candidate writes never expose their retirement entries.

The on-disk version and atomic-rename boundary remain unchanged, but the ledger
is additive persistent metadata. A runtime predating retirement support can
ignore it; rollout and rollback of this stateful change require explicit review
rather than assuming an older binary preserves retirement.

### Context recovery dispatch

Conversation replacement atomically retains archived history, lineage, uploads,
and FIFO together with a pending text-only seed. The recovery response returns
that durable identity immediately; neither the hub's Knowledge/mute carry-over
nor runtime startup waits for the provider turn. Session activity distinguishes
pending rebuilding from a later failed or uncertain seed.

`AgentService` tracks one seed dispatch per session and joins it during shutdown.
Startup and successful discovery schedule eligible pending seeds independently,
including terminal seeds previously deferred by aggregate or per-owner
discovery. A later discovery pass joins an existing dispatch rather than
claiming it twice. The durable pending/dispatching/failed state remains the
crash boundary: a restarted dispatching seed becomes uncertain and is not
resent. Preserved and newly queued work stay blocked until seed admission;
immediate sends cannot bypass the seed and replacement cannot race its handoff.

Seed handoff registers its `SessionAdmissions` and counted dispatch hold while
owning the existing per-session lifecycle lease. The lease is then released
before provider I/O; the handoff hold, not a global discovery lock, excludes
Restart and other runtime replacement. SDK turn completion remains outside
handoff admission. Clear/Recover refuse an already-dispatching seed immediately
and retain their exclusive admission and transactional rechecks for races.
Slash commands are refused before catalog/provider lookup and rechecked at
dispatch; no provider command is presumed to be a pure local observation.

Each new recovery replacement atomically stores its brief in the existing
`failedPrompt` queue barrier as well as `recoverySeed`. Claiming the seed marks
that barrier uncertain before provider handoff. Current projections hide this
compatibility marker in favor of recovery activity, and generic recovery-token
operations cannot consume it. Successful admission removes only the matching
seed-owned barrier in the same commit; a failed or interrupted seed retains it.
The unchanged 1.1.2 reader preserves this field when resetting status to idle,
and its startup/drain paths therefore cannot send the preserved queue. Returning
to a recovery-aware runtime admits only still-pending seeds; uncertain seeds
remain manual recovery decisions. This adds no migration or eager rewrite of
existing state and does not change CLI rollback policy. The compatibility test
boots committed 1.1.2 source twice with synthetic SDK and terminal providers,
then returns to the current reader/runtime. Its read-only source copy resolves
the installed test dependencies explicitly, independently of temporary-directory
ancestry.

## Pairing flow

1. Install the second computer with `--role node`.
2. Run `agentic-remote pair-info` on that computer.
3. Open **Computers** on the hub and enter the node URL and pairing token.
4. The hub authenticates to `/node-api/info`, records the stable node ID, opens
   the event stream, and aggregates its sessions.

Removing a computer from the hub deletes only its registry entry. It does not
delete sessions or configuration on that node.
