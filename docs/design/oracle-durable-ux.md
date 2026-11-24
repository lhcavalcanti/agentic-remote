# Oracle durable UX

Issue: #475

## Scope and evidence

This design covers two ordered vertical slices:

1. Keep session and Oracle input safe while one authoritative refresh updates
   sessions, pending work, Oracle, and Dreamer without sending or resuming
   anything.
2. Let a person confirm a Dreamer session item complete only when the server
   can point to a successful `task_complete` result in that exact session.

The current product has a daily morning plan. It has no weekly-plan schedule,
store, route, or UI. This slice keeps carried daily review items durable across
days and records weekly review as a separate future feature rather than
inventing a second scheduler inside a data-loss fix.

## Requirements matrix

| Surface | Current reproduction | Required result | Owner |
|---|---|---|---|
| Session composer | Per-session text survives reload in `composer-drafts-v2`, but the UI does not distinguish a saved draft from transient text. | Keep the existing admission and receipt protocol; show saved/recovered state and keep storage failures explicit. | `App` composer store |
| Oracle composer | Type in **Message Oracle**, reload the page or remount Oracle: the text is empty because it is component-local `useState`. | Persist a versioned local draft on every edit and restore it without sending. Clear it only after accepted delivery and durable cleanup. | Oracle draft store |
| Oracle queue editor | Edit a queued Oracle message, then reload: the edit disappears because `editing` is component-local `useState`. | Persist the message ID and edited text. Restore the editor when the queued message still exists; otherwise move the text into the Oracle composer with an explanation. | Oracle draft store |
| Oracle open, docking and responsive layout | The component normally remains mounted, but no durable contract protects text from a recoverable remount. | Draft ownership is independent of panel visibility and placement. Layout changes never clear, submit, or focus a covered composer. | `ManagerAssistant` |
| Session navigation | Selection is URL-backed, but search/filter and list scroll reset on reload. | Persist search, filter and list scroll locally. Refresh keeps keyed rows and current keyboard focus. | App navigation state and `SessionNavigation` |
| Reconnect and visibility return | Sessions refresh on socket open/visible; Oracle reloads only on socket epoch; Dreamer polls/focuses. Each surface has different error semantics. | One read-only refresh signal starts all three loads. Each surface preserves its last snapshot, exposes refreshing/stale/error state, and offers retry. | App refresh coordinator |
| Manual Refresh | There is no global session/Oracle/Dreamer refresh action; **Retry loading sessions** only repeats startup loading. | Add one accessible Refresh action in Sessions. It reloads server snapshots and durable files, preserves drafts, and never sends, resumes, or replays mutations. | App refresh coordinator |
| Browser refresh | Sessions, Oracle and Dreamer load independently; Oracle input is lost. | Durable drafts load first; server state then replaces only authoritative data. Pending prompts and review state remain server-owned. | Client stores plus existing APIs |
| Daily review | The server persists a revisioned plan, leases and history. Expired windows show an error. Repeated equal status writes still advance state and `Done` has no evidence. | Preserve last plan on errors, make repeated dispositions idempotent, retain missed-window detail, and never revert a newer completed/skipped item on refresh. | Dreamer store/service |
| Weekly review | No weekly scheduler or data model exists. | Do not imply support. Carried pending items remain reviewable; add weekly review only as a separately designed feature. | Intentional boundary |
| Session task completion | A successful `task_complete` summary is rendered as an ordinary assistant message, so downstream code cannot distinguish it from transcript text. | Tag successful tool results at the trusted event projection. Dreamer may expose that exact result as a proposal; confirmation persists only bounded provenance. | Session projection and Dreamer |
| Completion retry | A stale revision returns conflict even if the same completion already landed. | The same item/evidence pair is idempotent. Different or missing evidence is refused and refreshed. | Dreamer store/service |

## Client state and presentation

The existing colors, typography and layout remain unchanged. New state is
communicated with compact text beside the affected control:

- **Saved on this device** or **Recovered saved draft** below a non-empty
  composer.
- **Refreshing** or **Data may be stale**, with **Retry** in the Sessions and
  Oracle surfaces. A successful refresh returns to the ordinary compact state.
- A completion proposal shows the authoritative session result, its time, and
  **Confirm complete**. Confirmation is never implicit in Refresh or Oracle
  output.

The session list keeps its left-aligned dense workspace layout:

```text
Sessions  12                         [Refresh]
Search sessions                         [Sort]
[All] [Needs you] [Working] [Unread]
------------------------------------------------
computer
  session
  session
```

No modal is added for ordinary draft recovery or refresh. Completion uses an
inline two-step confirmation so keyboard and phone users retain context.

## Refresh contract

Refresh is a read operation. A refresh request has a reason: startup, manual,
reconnect, or visibility return. It:

1. starts session/computer, Oracle, and Dreamer reads;
2. preserves the last usable snapshot and every browser-owned draft;
3. applies only responses that are not superseded by a newer request;
4. reports partial failure as stale rather than clearing data;
5. never sends a prompt, dispatches a queue, resumes a session, repeats a
   review mutation, or confirms a task.

The existing per-computer session generations remain authoritative. The
coordinator only adds a shared trigger and presentation state.

## Completion evidence

A successful root-session `task_complete` tool result receives a trusted
message marker during event projection. Plain assistant text, background-agent
results, stale browser snapshots, and untagged transcripts are not evidence.

For a Dreamer session item, the server reads that exact owning session
passively and may return the latest marked result as a transient proposal. The
proposal summary is not written into Dreamer's metadata-only file. On explicit
confirmation, Dreamer persists:

- computer ID and session ID;
- authoritative message/tool reference;
- SHA-256 digest of the result;
- result completion timestamp;
- user confirmation timestamp.

Repeating the same item/reference succeeds without another state transition.
Any changed, missing, or unmarked reference returns a conflict and requires a
refresh. Completing a Dreamer item changes review/task metadata only; it does
not send to, resume, stop, close, or otherwise act on the session.

The current review model has no separate deferred status. A pending item that
is not resolved is carried into later daily plans; **Skip** is an explicit
disposition, not defer. Weekly review remains a separately designed future
feature.
