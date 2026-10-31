# Proactive Oracle: lifecycle design and staged implementation

**Status:** Consolidated from design PR #409 into implementation PR #434 for
human review. Only the inactive inbox foundation is implemented; the roadmap
below is not runtime behavior or approval for autonomous actions.

**Builds on:** [Session manager](../../design/session-manager.md) and the
[inbox API and invariants](../../design/oracle-proactive-inbox.md).
Tracks [issue #408](https://github.com/lhcavalcanti/agentic-remote/issues/408),
which remains open until useful proactive behavior is delivered.

## Problem and direction

Oracle delegates work but does not automatically inspect or report the result.
The hub's existing raw notifications remain useful and must not be lost while
adding semantic summaries. The goal is an opt-in, event-driven Oracle that
reports relevant outcomes without a model call for every session update.

| Approach | Benefit | Cost | Decision |
|---|---|---|---|
| A. Bounded observation turns through Oracle's queue | Reuses user-priority scheduling, provider recovery, transcript and presentation | Requires durable job authority, explicit read-only tools, context and cost limits | Preferred future integration |
| B. Separate watcher conversation | Isolates event context | Second runtime, split knowledge and another privileged boundary | Not needed for the first feature |
| C. Deterministic notices only | No model cost, predictable fallback | Cannot assess semantic task results | Retain as fallback and a no-model option |

Implement natively rather than add another agent control plane. Existing
hub events, passive session reads, Oracle queue/recovery and notification
presenters are the integration points, not a new polling or heartbeat loop.
Do not add history scans, model work or provider resumes to transcript polling.

## 1. Implemented now: inactive lifecycle inbox

`ManagerProactiveInbox` is uninstantiated and disabled by default. Its contract,
API, limits and storage behavior are defined in the linked inbox document.
Nothing currently subscribes it to hub events or turns its events into jobs,
notifications, memory writes, speech or session actions.

The implemented flow is:

```text
trusted explicit computer-generation binding
  -> bounded owner observation with monotonic revision
  -> baseline / lifecycle reducer
  -> atomic cursor and metadata-only event snapshot
  -> detailed pending read
  -> explicit acknowledgment of named events
```

Only Oracle-owned sessions (`origin: 'manager'`) qualify. A first observation
establishes a baseline rather than announcing historical idle/error sessions.
An observed running task can produce one `finished` or `failed` outcome;
waiting, pending requests, queued input, suspension, recovery and closure
cannot fabricate a completion.

Event identities hash canonical tuples of hub, computer, durable computer
generation, session, task generation and kind. Timestamps and titles are not
identities. Current bindings, retired-generation fences, cursors and event
admission are durable together. Revisions reject stale/out-of-order observations;
retired generations cannot be rebound after restart or pruning.

The bounded private snapshot is `manager-proactive-inbox.json`, not the original
proposal's append-only `inbox.jsonl`. No titles, transcripts, request text,
working folders, credentials or audio enter it. Pending reads return at most
20 event details, failures first. Count-only overflow is never acknowledged:
remaining events stay pending for later detailed handling.

A future adapter must supply a real durable computer generation and
owner-issued revision. Runtime `registrationId` and optional snapshot
revisions are not substitutes. Recovery guarantees admitted events, not
unobserved transitions during disconnection; lossless producer replay would
require a separately designed owner-side sequence/outbox.

## 2. Next useful slice: opt-in, read-only summaries

These are proposed requirements, not additions in this PR:

1. Connect authoritative lifecycle observations only after their generation
   and revision domains exist. Baseline on first enablement; reconcile current
   state after reconnect without treating cached absence as deletion.
2. Add durable model jobs and notification intents. Extend the commit boundary
   so event dispositions and outbox intents publish atomically; acknowledging
   first and sending later through unrelated storage is not sufficient.
3. Admit only relevant Oracle-owned finished/failed events by default, behind
   explicit enablement. Broader user/discovered-session scope needs its own
   permission decision. Irrelevant updates require zero model calls.
4. Read results passively and fetch bounded excerpts only after admission.
   Distinguish "session reports finished" from verified task acceptance; missing
   task criteria or test evidence must remain uncertainty, not invented success.

### Deterministic scheduling and budgets

Use at most one coalesced pending wake and one running observation job. Proposed
initial ceilings are 12 observation turns and 6 Oracle push notices per hour,
with at most 20 detailed events per turn. Debounce for 20 seconds after the
latest eligible event, but cap the batching delay at 60 seconds so steady
traffic cannot starve reporting. User messages run first; a proactive job
must recheck eligibility and user work immediately before claiming a turn.

Quiet hours, cooldown, expiry, token/spend budget and current notification
preferences are checked before inference, not only before delivery. Invalid
policy is refused. Work deferred by a budget remains bounded and visible;
it does not suppress existing raw pushes. Lease recovery retries interrupted
jobs with a bounded attempt count and backoff; exhausted jobs retain a visible
failure disposition and Retry instead of silently consuming their events.

### Turn authority, privacy and memory

An event turn receives only allowlisted event metadata and bounded passive
evidence. Session titles, repository files, transcripts and pending-request
text are untrusted data, never instructions or authorization.

Enforce a distinct read-only tool capability in server handlers: no
`send_to_session`, `answer_session`, session creation/deletion, permission
answers, execution, or Markdown/structured-memory mutations. Do not inherit
authority from an earlier user turn in a reused conversation.

Structured memory already exists; the original design's Markdown-only
assumption is obsolete. This feature grants neither store new write authority.
Any later memory proposal must preserve explicit user intent, exact scope,
correction/forgetting and retention/tombstone rules. No embedding service or
external channel is required for lifecycle summaries.

The current hub is one trusted owner's boundary, not hostile multi-tenant
isolation. Never mix hub/computer/session scopes, send credentials to a model,
or let reconnect/replacement inherit an old request approval.

## 3. Notification contract before activation

The current implementation changes no notifications. Future summaries must use
the existing `all` / `oracle` / `off` scope and Oracle category, with current
device delivery preferences checked again at send time.

| Case | Required outcome |
|---|---|
| Summaries disabled, supervision off, or budget deferred | Existing raw notifications behave exactly as today; no implicit suppression |
| More than 20 eligible events | Process only detailed named events; overflow remains pending |
| Failed event's model job fails or expires | Create a deterministic Oracle-category failure notice independently of the raw completion path, subject to current delivery policy; retain an in-app failure when push is disabled |
| Notifications muted for a session | Mute delivery only; it is not permission to disable separately enabled supervision or to discard evidence |
| Replacement of a raw completion is not explicitly enabled | Raw completion delivery is unchanged; a separately opted-in summary must be presented without a second completion push |
| Explicit future raw-replacement mode | Durable per-event selection chooses the raw fallback or Oracle notice, never both |
| Replacement job exceeds its two-minute deadline | Atomically select the raw fallback and fence late Oracle push intents; a late summary may remain in the transcript, not emit a second push |
| Request is answered, replaced, closed or otherwise resolved | Invalidate its action-needed notice by exact request/generation before delivery; dismiss or replace already displayed notices where the client supports it |

A model turn completing is not acknowledgment of every batched event. Require
validated per-event dispositions. Raw replacement is a separate opt-in decision,
not the meaning of "Oracle notifies me"; turning summaries off always preserves
raw behavior. Immediate action-needed notices are never held for a summary.

Use stable notice identities, durable receipts and client/push replacement tags.
The contract is effectively-once presentation, not exactly-once external network
delivery. Crash ambiguity must retry the same intent, not allocate another
notice. Pending/in-flight selection and fallback races belong to one serialized
authority, not independent timers that can both win.

## 4. Presentation and human decisions

Settings must distinguish supervision scope, Oracle summary delivery and any
future action authority. They must not overload existing notification mute.
Proactivity starts off until explicitly enabled; the original proposed
"watch all / follow-through on" defaults are not authorization.

Future observation turns appear as compact transcript entries with linked
sessions, per-event outcomes and failure/retry status. Voice is an optional
presentation of that same approved summary, subject to foreground/quiet-hour
preferences; it is not a second autonomous runtime or model-specific API.

Automatic follow-through remains out of this slice. If proposed later, keep
planning separate from execution: a stored approval binds the exact task,
action, arguments, computer/session generation, request ID and policy revision.
Revalidate after approval and before execution; cancellation or replacement wins
over a stale approval. The original cap of two follow-ups per task is only a
possible upper bound, never a grant to answer permissions or perform destructive
actions. Dry-run, cancellation, audit and rollback requirements need approval
before any such capability is implemented.

## 5. Acceptance and dependency order

The inactive foundation must demonstrate baseline admission, duplicate and
out-of-order fencing, bounded overflow, restart recovery, retired-generation
rejection, corruption refusal, input snapshot isolation and private durable
storage. Directory creation and replacement must survive the documented sync
boundaries; overlapping initialization cannot overwrite committed work.
Abandoned owned staging files cannot accumulate without bound.

Before enabling summaries, add tests for zero inference on irrelevant events;
user-priority and bounded concurrency; fake-clock debounce, quiet hours and
budgets; per-event acknowledgments and atomic outbox publication; restart/lease
recovery; stale-generation/request rejection; cancellation/approval races;
prompt-injection/tool denial; and every notification case above. Test
effectively-once presentation under duplicate delivery, timeout and reconnect.
Exercise end-to-end flows only on disposable sandbox conversations, never reset
the live Oracle conversation.

Implementation order: durable generation/revision adapter; jobs and atomic
outbox; deterministic admission/budgets; read-only turns; presentation and
delivery receipts; sandbox end-to-end verification. Broader session scope,
memory proposals, scheduling/webhooks and action approvals are later decisions.
No merge or deployment is authorized by consolidating these PRs.
