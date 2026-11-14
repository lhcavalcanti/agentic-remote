# Hub notification records

The hub enables this API-only service with `AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER=on`. The shared hub flag reader owns the startup-only, default-off decision; `/api/features` reports its effective state. With the flag off, the hub creates no notification directory, starts no notification service, and returns `404` from every notification endpoint. Nodes never instantiate it. The default-off `notificationPanel` Interface preview adds the client panel; no new native notification producer is added.

## Classification and delivery

The existing push ingress first admits hub and Oracle signals to the canonical classifier. Classification and persistence do not depend on global delivery scope, session mute, subscriptions, Oracle presence, or the foreground native session. External push delivery waits for the corresponding atomic commit. Existing channel decisions are captured at event time, not after disk I/O: changing presence, mute, scope, or clearing a conversation while a write is pending cannot change its delivery decision. Push payloads, urgency, tags, test notifications, startup reprocessing, and mute transfer remain unchanged. The native shell continues using its existing session, Oracle, and health-alert rules; the new socket invalidation raises no native notification.

| Signal | Record |
| --- | --- |
| Running → idle, with no request, queued work, suspension, or recovery | `session.completed` |
| Transition to error | `session.failed` |
| Permission request, question request, or transition to waiting | `session.needs-input` |
| Oracle assistant reply, completed user message, failed user message, or pending confirmation | `oracle.message` |
| Existing error event with `notify: true` | `host.alert` |
| Known online computer → offline | `computer.offline` |

`schedule.run.*` is reserved; nothing emits it yet. The internal per-kind channel preference structure defaults to the current behavior and has no settings mutation API.

Session identities hash the kind, computer ID, session ID, and request ID (including permission/question namespace) or durable root user-message ID. A failed queued delivery also includes its existing durable recovery decision token. Transcript-free roster summaries preserve the last root ID. When necessary the hub reads the existing passive session endpoint, without opening or resuming anything; a newer passive response cannot supply a different turn's root to an older event. If no root ID can be established, it does not invent a completion from a timestamp or status alone. Initial terminal history is not a new completion. Revision fences discard older snapshots.

Oracle replies use the answered message ID, or the assistant message ID for an unsolicited reply. A completed user-message fallback and its assistant reply share one identity. Health alerts use the computer and exact alert message, so replayed startup diagnostics coalesce. Offline identities use the computer pairing generation and a durably counted online→offline episode. Titles, arrival timestamps, and observer-generated IDs never identify a session outcome.

Muted sessions still have records. The record's `muted` field captures the session mute **at admission**, not its current setting; unmuting does not retroactively deliver old events. Global scope and Oracle presence suppress delivery only. Oracle's proactive inbox is a separate work queue: list/read/dismiss operations never acknowledge or otherwise mutate it.

## Storage and recovery

State is single-writer, hub-local JSON at `<data directory>/notifications/records.json`, using the application's resolved data directory. The directory is `0700`; state, exclusive staging files, and quarantined files are `0600`. Existing owned state is secured, symlinks are refused, and a replaced directory is rejected. Commits synchronize the staging file, atomically rename it, and synchronize the directory before publishing state and broadcasting an invalidation. Shutdown drains admitted work.

Visible records, including read and dismissed records, are bounded to the newest 1,000 and expire after 30 days. Pruning occurs at initialization and on every read or mutation. Dismissal is a durable mark, not deletion. Identity-only dedupe fences survive visible-record capacity eviction for 30 days (up to 10,000 IDs); at that fence limit, admission fails explicitly rather than deleting a live fence and admitting a replay. Up to 2,000 most recently observed session/computer cursors preserve status, request, root-prompt, and offline-episode continuity. These are bounded reducer metadata, not visible notifications. Dedupe beyond the retained identity/cursor horizon is not an unlimited event archive.

Unread counts exclude read and dismissed records. Duplicate admission never changes a record's read/dismissed state or emits another invalidation. JSON/schema corruption is quarantined under `records.json.corrupt-<id>`, logged once, and replaced with empty state. Ownership, symlink, and I/O failures fail closed rather than being mistaken for corrupt JSON.

## HTTP and socket contract

All routes use the hub's existing canonical Host/Origin enforcement, including encoded `/api` prefixes. Responses containing notification data have `Cache-Control: no-store`.

| Route | Result |
| --- | --- |
| `GET /api/notifications` | `{ notifications: NotificationRecord[] }`, newest first, excluding dismissed |
| `GET /api/notifications/unread-count` | `{ unreadCount: number }` |
| `POST /api/notifications/:id/read` | Idempotent mark read, or `404` for an unknown ID |
| `POST /api/notifications/:id/dismiss` | Idempotent dismiss, or `404` for an unknown ID |
| `POST /api/notifications/read-all` | Mark only matching records read |

List, unread-count, and read-all accept query filters `unread=true|false`, `failed=true|false`, `kind`, `sessionId`, and `computerId`. `failed` means error severity, including Oracle and health failures. Include the computer when scoping a potentially non-unique session ID. Invalid filters/IDs return `400`; unknown records return `404`.

After a committed visible change, ordinary and patch-enabled hub sockets receive the typed invalidation `{ type: "notifications.changed", revision, unreadCount }`. Clients can refetch their current filtered list; this message is not a second channel delivery signal. Original hub/Oracle signals also wait for their own admission before reaching the socket, so the existing native producer cannot notify before the corresponding record is durable. The client uses invalidations and reconnects to refetch the authoritative list and badge; no session transcript sequence is advanced. The fail-closed workspace fixture mocks every route, defaults to disabled, and can opt into fictional records through its `notifications` option.

The existing active session GET and explicit session-open POST mark that computer/session's records read after the open succeeds. Passive reads, including Oracle reads and classifier identity enrichment, do not. This does not claim that future events are already read while a session stays visible.

No new node capability is required: classification stays at the hub and consumes the already negotiated session/event protocol and passive reads. Replayed node events, reconnect summaries, and startup pending requests all pass through the same durable reducer.

## Client panel preview

Scheduled outcomes use the canonical `schedule.run.*` records, with outcome-specific icons and explicit Scheduled labels. A same-hub root URL containing `schedule` and optional `run` identifiers opens the scheduler when its preview is available; otherwise a bound session remains the fallback. Foreign origins, non-root paths, duplicate identifiers and invalid IDs cannot navigate the feature view. The runner's notification policy and channel suppression remain unchanged.

`notificationPanel` requires the hub's effective `notificationCenter` flag. Its bell is available in the rail, or the existing drawer footer if the rail preview is off. The badge counts unread, non-dismissed records. The desktop popover and narrow-screen sheet use the existing modal focus/restore contract. Rows group matching records by computer and session, display the latest record and count, and otherwise retain a record's coalescing identity.

All, Unread, Failed and Oracle tabs combine with case-insensitive title/body search. Mark-all uses the corresponding server filter; with search it marks only the visible matching IDs. Row read/dismiss affects that row's group. Opening a session or Oracle marks its group read without changing Oracle's work queue. Read errors and disabled/empty states are explicit. The global hub socket forwards typed invalidations to a small client event subscription; reconnects refetch too. This never raises a native notification or changes session transcript ordering.
