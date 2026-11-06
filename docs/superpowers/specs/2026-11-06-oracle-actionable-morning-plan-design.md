# Oracle Actionable Morning Plan Design

## Status and scope

This design fixes the gap between an Oracle lifecycle observation and useful
Morning Plan work. It covers manager-owned sessions only. It does not merge or
modify PR #487, deploy either hub, add notifications, or authorize unattended
session actions.

The current implementation is internally consistent but incomplete:

1. `JournalRecorder` stores a session's first user message plus status metadata.
2. Dreamer converts only `waiting` and `error` journal entries into generic
   review cards.
3. `ManagerProactiveInbox` is durable but is instantiated only by its tests.
4. Dreamer cannot enqueue Oracle, persist Oracle's finding, assign work, or
   correlate a real execution.
5. The card can later display trusted completion from its source session, but
   the card itself never caused or assigned that work.

The reported journal-only card is therefore not execution evidence. The chain
stops before Oracle investigation, durable task creation, and execution.

## Source-of-truth semantics

The product distinguishes three objects:

- A **journal observation** is metadata that a session changed state. It is not
  a task and never proves that work ran.
- A **Morning Plan suggestion** asks Oracle or the user to investigate an
  observation. It has no execution status and says explicitly that no work has
  been assigned.
- An **Oracle task** is a durable, structured finding with a clear owner, next
  action, workflow status, source events, and optional execution attempts.

Only an Oracle task may show `queued`, `running`, `blocked`, `failed`,
`review`, or `completed`. Labels, journal text, assistant prose, an idle
session, and a provider's generic completed state are never completion
evidence.

Completion requires a successful root `task_complete` result from the exact
linked execution session after its latest root user turn. The server persists
bounded provenance: computer ID, session ID, session revision, message ID, tool
call ID, digest, completion time, and confirmation time. Tool activity and test
output may be displayed as execution evidence, but do not complete the task by
themselves.

## Chosen architecture

Use the existing hub event stream, durable proactive inbox, Oracle queue, and
Dreamer store as one pipeline:

```text
HubEvent
  -> Proactive coordinator
  -> ManagerProactiveInbox
  -> deterministic Oracle observation message
  -> record_proactive_outcomes tool
  -> durable Dreamer task
  -> Morning Plan task card
  -> explicit dispatch/retry
  -> deterministic Oracle execution message
  -> linked session/activity
  -> reconciliation and trusted completion review
```

There is no new proactive HTTP endpoint and no second scheduler or polling
loop. PR #487's periodic status checks remain a separate producer for the same
Oracle queue. The implementation may generalize queue provenance and priority
helpers so `scheduled`, `proactive`, and `task` turns can coexist after a
future rebase, but it does not copy or alter #487's worktree.

### Why not the alternatives

- Keeping deterministic journal cards and adding only **Open session** cannot
  expose the process, test, or follow-up Oracle found.
- A browser or HTTP-triggered proactive endpoint duplicates the existing event
  and queue control planes, loses work while no client is connected, and adds
  avoidable lease and polling behavior.
- Dispatching directly from journal metadata cannot infer a safe task and
  would grant automatic action authority that the user did not approve.

## Durable computer and event identity

The inbox requires a durable computer generation. The current
`registrationId` is process-local and must not be used because a hub restart
would supersede pending events.

Add a persisted opaque `lifecycleGeneration`:

- the local hub identity owns one generation until its identity is replaced;
- a paired computer owns one generation per pairing record;
- removing and pairing the same computer again creates a new generation;
- reconnecting or restarting either process preserves the generation.

The coordinator binds the inbox to this generation. Session revision and inbox
`taskGeneration` continue to fence duplicate and out-of-order observations.

Eligible manager-owned transitions are:

- `finished`: a running generation reaches idle with no queue or request;
- `failed`: a running generation reaches error with no queue or request;
- `blocked`: a running generation reaches waiting or exposes a pending request.

First observation is a baseline. Missing computers are not deletion evidence.
Reconnect reconciliation observes authoritative listings only for computers
that answered.

## Proactive coordinator

The hub owns one `ManagerProactiveCoordinator`. It is enabled when Dreamer is
enabled and otherwise records nothing and runs no model turns.

For each authoritative session upsert it:

1. resolves the computer's durable generation;
2. projects only bounded lifecycle metadata into the inbox;
3. admits eligible transitions;
4. schedules one process-local drain after the inbox commit.

On startup, enablement, reconnect, refresh, and after every completed drain it
checks the durable pending inbox. One deterministic batch contains at most 20
events, failed and blocked before finished. Its Oracle message ID is the digest
of the ordered event IDs, so admission is idempotent across restart.

Typed, voice, and explicit task execution messages have priority over
observation messages. At most one observation turn is queued or running.
Failure uses Oracle's existing recovery ladder. Exhausted failure remains
visible with **Retry** and leaves inbox events pending. A successful turn is
not enough to acknowledge the batch: every event needs a validated disposition
from `record_proactive_outcomes`.

The coordinator writes tasks first, then acknowledges inbox events. A crash
between those writes replays the same event IDs and deterministically upserts
the same tasks. No finding is duplicated or lost.

## Oracle turn capabilities

Extend trusted manager message provenance with:

- `proactive`: read-only observation turn;
- `task`: explicit execution turn.

A proactive turn may passively read only the sessions in its event batch and
may call `record_proactive_outcomes`. It cannot create, send to, answer, rename,
stop, close, or mutate a session or memory.

`record_proactive_outcomes` requires one outcome for every event:

- `task`: validated title, summary, next action, owner, execution prompt, and
  source event IDs;
- `needs-user`: a user-owned task with the exact requested decision/action;
- `no-action`: a bounded reason that closes the event without a task.

The tool rejects foreign, duplicate, missing, or unbatched event IDs. Task IDs
are deterministic from the hub ID and canonical source-event set.

A task execution turn is created only by an explicit user dispatch or retry.
It may use the existing session tools, but its prompt and tool policy bind it to
one task. Activities and session references written under that manager message
become the task's execution links. Destructive actions and permission answers
retain their existing confirmation and policy boundaries.

## Task data model

Dreamer state adds a bounded `tasks` collection. A plan item may reference one
task by `taskId`; legacy session and memory review items remain readable.

```ts
type DreamerTaskOwner = 'oracle' | 'user'

type DreamerTaskStatus =
  | 'ready'
  | 'queued'
  | 'running'
  | 'blocked'
  | 'failed'
  | 'review'
  | 'completed'
  | 'dismissed'

interface DreamerTask {
  id: string
  revision: number
  title: string
  summary: string
  nextAction: string
  owner: DreamerTaskOwner
  status: DreamerTaskStatus
  sourceEventIds: string[]
  sourceSession?: { computerId: string; sessionId: string; taskGeneration: number }
  executionPrompt?: string
  attempts: DreamerTaskAttempt[]
  completion?: DreamerTaskCompletionProvenance
  createdAt: string
  updatedAt: string
}

interface DreamerTaskAttempt {
  id: string
  requestId: string
  managerMessageId: string
  status: 'queued' | 'running' | 'blocked' | 'failed' | 'review' | 'completed'
  sessionRefs: ManagerSessionRef[]
  error?: string
  startedAt?: string
  finishedAt?: string
}
```

Persist no unrestricted transcript or tool output in task state. The API
projects bounded transient evidence from the exact linked manager message and
execution sessions:

- manager queue state and errors;
- linked session identity and current status;
- pending user or permission request summary;
- recent root tool names, status, duration, and bounded result text;
- trusted completion candidate.

Keep at most 100 unresolved tasks, 20 attempts per task, 20 source events per
task, and the existing 1 MiB Dreamer state limit. Completed and dismissed tasks
may be pruned only after their idempotency keys are retained in bounded fences.

## Task lifecycle and reconciliation

### Creation and update

An event set upserts one task. Replayed events update only still-open tasks and
cannot replace a user's title, owner, disposition, or a newer execution state.
Related later events may update `nextAction` and append source IDs under the
same source session/task generation.

### Dispatch

The task card's **Start work** action calls:

```text
POST /api/manager/dreamer/tasks/:taskId/dispatch
{ revision, requestId }
```

The route inherits the hub's Host/Origin checks and single-owner boundary.
`requestId` is a client-generated UUID. The service persists an attempt and
deterministic manager message before returning. Repeating the same request is
idempotent; another request while an attempt is queued or running returns the
current task. User-owned tasks expose the requested action instead of dispatch.

### Retry

The same route with a new request ID retries only a failed or blocked Oracle
attempt. Oracle first reads the linked session and continues it when safe;
otherwise it creates a replacement execution session. The new attempt retains
the previous attempt and evidence. A failed enqueue leaves the task unchanged.

### Reconciliation

Refresh, startup, manager events, and session events reconcile persisted task,
manager message, and session links:

- queued manager message -> `queued`;
- running manager message or active linked session -> `running`;
- pending request or waiting session -> `blocked` with explicit next action;
- failed manager message or error session -> `failed` with **Retry**;
- trusted completion candidate -> `review`;
- confirmed candidate -> `completed`;
- journal-only text or idle state -> no completion transition.

Late events from an older attempt cannot replace the current attempt. Missing
or offline sources are `blocked`, not failed or completed. Reconciliation is
idempotent and never creates a new attempt.

### Completion

**Review result** expands the trusted completion summary and execution
evidence. **Confirm completed** re-reads the exact session message and persists
the provenance. The same candidate is idempotent; changed or stale evidence is
refused with refresh guidance.

## Morning Plan UI

The existing ordered Morning Plan remains the review surface.

Journal-only suggestions render:

- `Suggestion`, never a work status;
- “Oracle has not investigated or assigned this work”;
- source session link;
- **Ask Oracle to investigate**.

Task cards render:

- status badge and owner;
- finding summary and **Next action**;
- source and execution session links;
- attempt history;
- bounded tool/test activity;
- explicit blocked or failure reason;
- trusted completion review.

Actions are status-specific: **Start work**, **Retry**, **Open session**,
**Review result**, **Confirm completed**, **Needs you**, **Skip**, and
**Restore**. Refresh preserves order, expanded evidence, and in-progress
actions while applying authoritative state.

Background Tasks remains the provider's live child-task surface. Morning Plan
shows durable Oracle workflow tasks and links to Background Tasks when the
execution session exposes them.

## API changes

Extend `GET /api/manager/dreamer` with tasks and transient task evidence.

Extend the existing plan mutation route for suggestion investigation and task
completion confirmation:

```text
PUT /api/manager/dreamer/plan
{ revision, planId, investigate: { itemId, requestId } }
{ revision, planId, taskCompletion: { taskId, attemptId, ...evidenceRef } }
```

Add only the explicit task action route:

```text
POST /api/manager/dreamer/tasks/:taskId/dispatch
{ revision, requestId }
```

There is no `/proactive`, `/wake`, scheduler, browser polling, force-run, or
node task mutation endpoint.

## Failure, quiet-hours, and user-visible status

Observation and task queue state is always visible in Oracle and Morning Plan.
Storage failure leaves the inbox/task pending and reports a safe error. Model
failure leaves a retryable Oracle message and does not acknowledge events.
Dispatch failure leaves a failed attempt with its exact next action.

This change sends no push notification or speech. Existing notification quiet
hours therefore need no new policy. A later notification slice must use the
existing notification outbox and #487's configured timezone/quiet hours rather
than add another setting or timer.

## Migration

Dreamer state version increases once. Existing plans load unchanged. Existing
session-derived items remain suggestions and cannot be interpreted as tasks or
completion. New task collections default empty. Unsupported or oversized state
is preserved and Dreamer reports unavailable under its existing recovery
contract.

## Test strategy

Add focused tests that fail on current main:

1. lifecycle event -> inbox -> proactive message -> durable task;
2. duplicate event, replay after restart, and duplicate tool outcome create one
   task;
3. journal-only suggestion has no execution/completion state;
4. task dispatch creates one durable attempt and links manager/session activity;
5. blocked and failed execution render exact next actions;
6. retry preserves prior attempts and reconciles to the replacement/current
   session;
7. trusted completion reaches review and confirmation; plain text, labels,
   idle state, failed tools, and stale completion do not;
8. refresh/restart reconciliation changes status without duplicating tasks or
   attempts;
9. UI cards show owner, status, next action, execution/tool/test evidence,
   retry, review, and explicit journal-only copy;
10. Host/Origin refusal, stale revisions, foreign event IDs, malformed inputs,
    capacity, and storage failure.

Run targeted server and UI tests, `pnpm lint`, `pnpm test:fast`, `pnpm build`,
`NODE_ENV=production pnpm check`, Graphify update/check, and the exact-head
normal production gate. Do not deploy, merge, or modify other worktrees.

## Remaining limitations

- Only manager-owned sessions produce automatic findings.
- Oracle task text is bounded but still model-generated; task execution remains
  explicitly user-triggered.
- Completion proves the linked agent reported `task_complete`; it does not
  independently prove external acceptance criteria beyond the recorded
  execution evidence.
- Notifications, user-origin session supervision, todo/history integrations,
  and automatic follow-through remain separate work.
