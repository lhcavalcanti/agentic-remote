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

Closing a session routes deletion to its owning node. That node disconnects any
active SDK session, deletes the session from provider storage, removes its local
rendered-history cache, and emits a removal event.

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
  recreates missing previously open tmux windows with the same Copilot session
  IDs, allowing Copilot to resume from its local session database.
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

Providers await mutations before publishing or acting on their results.
`readAfterWrites()` queues a read behind admitted changes before runtime,
dispatch, or lifecycle decisions; a read-only batch does not write or
checkpoint volatile tokens. Admission markers remain held across that wait.
It is not a lock: later provider work still requires the existing live checks
and queue/lifecycle ownership rules. Selecting and removing a queue head uses
one store transaction. Reorder operations use this same boundary and must not
add per-operation rollback. External provider delivery is not part of the
filesystem transaction.

Closing the store stops admission before draining existing batches and upload
writes. Private batch scheduling remains enabled for work already admitted,
including removal/replacement boundaries. The final close checkpoints volatile
streamed text; late durable mutations, live deltas, and uploads fail explicitly
without changing memory or recreating the state directory.

The on-disk version and atomic-rename durability boundary are unchanged; this
requires no stored-state migration or history rewrite.

## Pairing flow

1. Install the second computer with `--role node`.
2. Run `agentic-remote pair-info` on that computer.
3. Open **Computers** on the hub and enter the node URL and pairing token.
4. The hub authenticates to `/node-api/info`, records the stable node ID, opens
   the event stream, and aggregates its sessions.

Removing a computer from the hub deletes only its registry entry. It does not
delete sessions or configuration on that node.
