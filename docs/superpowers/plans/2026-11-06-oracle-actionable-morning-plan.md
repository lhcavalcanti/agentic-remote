# Oracle Actionable Morning Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn manager-owned lifecycle findings into durable Morning Plan tasks with explicit ownership, real execution links, authoritative evidence, and honest follow-up state.

**Architecture:** Reuse the hub event stream, `ManagerProactiveInbox`, Oracle's durable queue, and Dreamer's review surface. A new task store persists structured findings and attempts; a coordinator idempotently converts inbox events into constrained Oracle turns, while explicit task dispatch uses the existing Oracle queue and session tools rather than a second scheduler or proactive endpoint.

**Tech Stack:** TypeScript, Fastify, Zod, React, Vitest, pnpm, Graphify

**Spec:** `docs/superpowers/specs/2026-11-06-oracle-actionable-morning-plan-design.md`

## Global Constraints

- Work from `origin/main` in `fix/oracle-actionable-morning-plan`; do not modify PR #487's worktree.
- Do not add a proactive/wake HTTP endpoint, browser poller, notification path, or second scheduler.
- Journal/session metadata is never execution or completion evidence.
- Completion requires the exact linked session's successful root `task_complete` evidence after its latest root user turn.
- Automatic findings cover manager-owned sessions only; execution remains explicitly user-triggered.
- Preserve Host/Origin checks, single-hub ownership, private atomic storage, stale-revision refusal, and bounded state.
- Keep user-visible copy concise and state what happened, what happens next, and who owns it.
- Bump the application and shell patch version from `1.37.2` to `1.37.3`.
- Do not deploy, restart production, merge, force-push, or modify unrelated worktrees.

## File map

- Create `shared/oracle-task.ts`: shared task, attempt, evidence, and action types.
- Create `server/oracle-task-store.ts`: private versioned task persistence and idempotency fences.
- Create `server/oracle-task-store.test.ts`: durable task state, bounds, migration, and replay tests.
- Modify `shared/dreamer.ts`: task references and task projection in `DreamerSnapshot`.
- Modify `server/dreamer-service.ts`: compose task state, project evidence, investigate suggestions, dispatch, retry, and confirm.
- Modify `server/dreamer-service.test.ts`: task lifecycle and authoritative evidence tests.
- Modify `server/dreamer-store.ts` and `server/dreamer-store.test.ts`: allow task-backed plan items without weakening legacy validation.
- Modify `server/node-identity.ts` and tests: persist local lifecycle generation.
- Modify `server/computer-registry.ts` and tests: persist pairing lifecycle generation.
- Modify `shared/contracts.ts`: expose lifecycle generation in `ComputerSummary`.
- Modify `server/computer-manager.ts` and multi-node tests: return stable lifecycle generation and preserve it across reconnect.
- Modify `server/manager-proactive-inbox.ts` and tests: add blocked events while retaining generation/revision fences.
- Modify `shared/manager.ts`: add `proactive` and `task` message provenance and task metadata.
- Modify `server/manager-store.ts` and tests: preserve new trusted provenance.
- Modify `server/manager-context.ts` and tests: build dedicated untrusted-data wrappers for automatic turns.
- Modify `server/manager-tools.ts` and tests: add constrained `record_proactive_outcomes`.
- Modify `server/manager-agent.ts` and tests: deterministic internal enqueue, user-priority claims, and task activity correlation.
- Create `server/manager-proactive-coordinator.ts`: inbox producer/consumer and replay-safe disposition handling.
- Create `server/manager-proactive-coordinator.test.ts`: end-to-end coordinator state tests with fakes.
- Modify `server/app.ts` and `server/dreamer-app.test.ts`: lifecycle wiring and startup/restart recovery.
- Modify `server/dreamer-routes.ts` and tests: investigate, dispatch, retry, and completion mutations.
- Modify `src/dreamer-api.ts` and tests: client methods and error mapping.
- Modify `src/OracleDreamer.tsx`, `src/OracleDreamer.test.tsx`, and `src/dreamer.css`: honest suggestion/task cards and evidence presentation.
- Modify `src/App.test.tsx`: coordinated authoritative refresh and duplicate-card coverage.
- Modify `docs/app-spec.md` and `docs/design/oracle-dreamer.md`: normative task/evidence contract and remaining limits.
- Modify version files and generated Graphify files listed by repository policy.

---

### Task 1: Durable Oracle task model and store

**Files:**
- Create: `shared/oracle-task.ts`
- Create: `server/oracle-task-store.ts`
- Create: `server/oracle-task-store.test.ts`
- Modify: `shared/dreamer.ts`
- Modify: `server/dreamer-store.ts`
- Modify: `server/dreamer-store.test.ts`

**Interfaces:**
- Produces:
  - `OracleTask`, `OracleTaskAttempt`, `OracleTaskEvidence`, `OracleTaskStatus`
  - `OracleTaskStore.initialize(): Promise<void>`
  - `OracleTaskStore.snapshot(): OracleTaskStoreSnapshot`
  - `OracleTaskStore.upsertFinding(input: OracleTaskFindingInput): Promise<OracleTask>`
  - `OracleTaskStore.beginAttempt(input: BeginOracleTaskAttemptInput): Promise<OracleTask>`
  - `OracleTaskStore.reconcileAttempt(input: ReconcileOracleTaskAttemptInput): Promise<OracleTask>`
  - `OracleTaskStore.confirmCompletion(input: ConfirmOracleTaskCompletionInput): Promise<OracleTask>`
- Consumes: existing Dreamer private-directory and atomic-write conventions.

- [ ] **Step 1: Write failing task-store tests**

Add tests that define the durable contract:

```ts
it('upserts one task for replayed source events and preserves user-owned fields', async () => {
  const store = await openTaskStore()
  const first = await store.upsertFinding(finding({
    sourceEventIds: ['a'.repeat(64)],
    title: 'Run the focused queue test',
    nextAction: 'Start a session and run the queue regression.',
  }))
  const replay = await store.upsertFinding(finding({
    sourceEventIds: ['a'.repeat(64)],
    title: 'Different generated title',
    nextAction: 'Different generated action',
  }))
  expect(replay.id).toBe(first.id)
  expect(store.snapshot().tasks).toHaveLength(1)
  expect(replay).toMatchObject({
    title: 'Run the focused queue test',
    nextAction: 'Start a session and run the queue regression.',
    status: 'ready',
  })
})

it('keeps journal-only plan items separate from task-backed items', async () => {
  const store = await openDreamerStoreWithPlan([
    sessionPlanItem(),
    { ...sessionPlanItem(), id: 'task-item', source: 'task', taskId: 'task-a' },
  ])
  expect(store.snapshot().plan?.items).toEqual(expect.arrayContaining([
    expect.objectContaining({ source: 'session', taskId: undefined }),
    expect.objectContaining({ source: 'task', taskId: 'task-a' }),
  ]))
})
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
pnpm vitest run server/oracle-task-store.test.ts server/dreamer-store.test.ts
```

Expected: FAIL because the shared types, task store, and task-backed plan-item validation do not exist.

- [ ] **Step 3: Add shared task types**

Create `shared/oracle-task.ts` with these exact public shapes:

```ts
import type { ManagerSessionRef } from './manager.js'

export type OracleTaskOwner = 'oracle' | 'user'
export type OracleTaskStatus =
  | 'ready' | 'queued' | 'running' | 'blocked'
  | 'failed' | 'review' | 'completed' | 'dismissed'

export interface OracleTaskSourceSession {
  computerId: string
  sessionId: string
  taskGeneration: number
}

export interface OracleTaskAttempt {
  id: string
  requestId: string
  managerMessageId: string
  status: Exclude<OracleTaskStatus, 'ready' | 'dismissed'>
  sessionRefs: ManagerSessionRef[]
  error?: string
  startedAt?: string
  finishedAt?: string
}

export interface OracleTaskCompletionProvenance {
  source: 'root-task-complete'
  attemptId: string
  computerId: string
  sessionId: string
  sessionRevision: number
  messageId: string
  toolCallId: string
  resultDigest: string
  completedAt: string
  confirmedAt: string
}

export interface OracleTaskCompletionCandidate {
  source: 'root-task-complete'
  attemptId: string
  computerId: string
  sessionId: string
  sessionRevision: number
  messageId: string
  toolCallId: string
  resultDigest: string
  completedAt: string
  summary: string
}

export interface OracleTaskEvidence {
  id: string
  kind: 'tool' | 'test' | 'completion'
  label: string
  status: 'running' | 'completed' | 'failed'
  result?: string
  durationMs?: number
}

export interface OracleTask {
  id: string
  revision: number
  title: string
  summary: string
  nextAction: string
  owner: OracleTaskOwner
  status: OracleTaskStatus
  sourceEventIds: string[]
  sourceSession?: OracleTaskSourceSession
  executionPrompt?: string
  attempts: OracleTaskAttempt[]
  completion?: OracleTaskCompletionProvenance
  createdAt: string
  updatedAt: string
}

export interface OracleTaskView extends OracleTask {
  evidence?: OracleTaskEvidence[]
  completionCandidate?: OracleTaskCompletionCandidate
  blockedReason?: string
}
```

Extend `DreamerPlanItemSource` with `'task'`, add `taskId?: string`, and add
`tasks: OracleTaskView[]` to `DreamerSnapshot`.

- [ ] **Step 4: Implement the private task store**

Use `dreamer-tasks.json`, version `1`, mode `0o600`, atomic temporary-file
rename, serialized writes, and the same ownership/symlink/size checks as
`DreamerStore`. Enforce:

```ts
export const ORACLE_TASK_MAX_ACTIVE = 100
export const ORACLE_TASK_MAX_ATTEMPTS = 20
export const ORACLE_TASK_MAX_SOURCE_EVENTS = 20
export const ORACLE_TASK_MAX_STATE_BYTES = 1_048_576
```

Derive task IDs from sorted source event IDs:

```ts
const taskId = `oracle-task-${createHash('sha256')
  .update([hubId, ...sourceEventIds.sort()].join('\0'))
  .digest('hex')
  .slice(0, 40)}`
```

Reject stale task revisions with `OracleTaskConflictError` (`statusCode: 409`),
capacity with `OracleTaskCapacityError` (`statusCode: 409`), and unavailable
storage with `OracleTaskUnavailableError` (`statusCode: 503`).

- [ ] **Step 5: Update Dreamer plan validation**

Require task-backed items to have `taskId` and forbid partial task/session
identity combinations:

```ts
if (value.source === 'task' && !isSafeIdentifier(value.taskId)) {
  throw new DreamerRecoveryError('Dreamer task item is invalid.')
}
if (value.source !== 'task' && value.taskId !== undefined) {
  throw new DreamerRecoveryError('Dreamer task reference is invalid.')
}
```

- [ ] **Step 6: Run task-store tests**

Run:

```bash
pnpm vitest run server/oracle-task-store.test.ts server/dreamer-store.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add shared/oracle-task.ts shared/dreamer.ts \
  server/oracle-task-store.ts server/oracle-task-store.test.ts \
  server/dreamer-store.ts server/dreamer-store.test.ts
git commit -m "feat: persist actionable Oracle tasks" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2: Durable lifecycle generation and blocked inbox events

**Files:**
- Modify: `server/node-identity.ts`
- Modify: `server/node-identity.test.ts`
- Modify: `server/computer-registry.ts`
- Modify: `server/computer-registry.test.ts`
- Modify: `shared/contracts.ts`
- Modify: `server/computer-manager.ts`
- Modify: `server/multi-node.test.ts`
- Modify: `server/manager-proactive-inbox.ts`
- Modify: `server/manager-proactive-inbox.test.ts`

**Interfaces:**
- Produces:
  - `NodeIdentityStore.lifecycleGeneration: string`
  - `RegisteredComputer.lifecycleGeneration: string`
  - `ComputerSummary.lifecycleGeneration: string`
  - inbox event kind `'blocked'`
- Consumes: `ManagerProactiveInbox.observe()` generation/revision fencing.

- [ ] **Step 1: Write failing persistence and inbox tests**

```ts
it('preserves the local lifecycle generation across restart', async () => {
  const first = new NodeIdentityStore(directory)
  await first.initialize()
  const generation = first.lifecycleGeneration
  const restarted = new NodeIdentityStore(directory)
  await restarted.initialize()
  expect(restarted.lifecycleGeneration).toBe(generation)
})

it('allocates a new paired generation only after remove and re-pair', async () => {
  const first = await manager.registerComputer(pairing)
  await manager.reconnectComputer(first.id)
  expect(manager.findComputer(first.id)?.lifecycleGeneration)
    .toBe(first.lifecycleGeneration)
  await manager.removeComputer(first.id)
  const pairedAgain = await manager.registerComputer(pairing)
  expect(pairedAgain.lifecycleGeneration).not.toBe(first.lifecycleGeneration)
})

it('admits one blocked event when a running task reaches a pending request', async () => {
  await inbox.observe(observation({ status: 'running', revision: 1 }))
  const result = await inbox.observe(observation({
    status: 'waiting',
    hasPendingRequest: true,
    revision: 2,
  }))
  expect(result).toMatchObject({ outcome: 'admitted', event: { kind: 'blocked' } })
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
pnpm vitest run server/node-identity.test.ts server/computer-registry.test.ts \
  server/manager-proactive-inbox.test.ts server/multi-node.test.ts \
  -t "lifecycle generation|blocked event|re-pair"
```

Expected: FAIL because lifecycle generation and blocked events are absent.

- [ ] **Step 3: Migrate node identity and computer registry**

Migrate `node.json` from version `1` to `2` by adding a UUID
`lifecycleGeneration`. Migrate `computers.json` from version `1` to `2`; assign
one UUID to each legacy pairing and persist the migration before returning from
`initialize()`.

When pairing:

```ts
const previous = this.registry.list().find(({ id }) => id === info.id)
const computer: RegisteredComputer = {
  id: info.id,
  name: input.name?.trim() || info.name,
  baseUrl,
  token,
  lifecycleGeneration: previous?.lifecycleGeneration ?? randomUUID(),
}
```

Removing the computer deletes that generation; a later pairing creates a new
one.

- [ ] **Step 4: Expose stable generation**

Replace process-local `registrationId` use in proactive ownership with
`lifecycleGeneration`. Keep `registrationId` for existing runtime freshness
semantics. Add the new required property to local and remote
`ComputerSummary`.

- [ ] **Step 5: Add blocked event admission**

Extend `EVENT_KINDS` to `['failed', 'blocked', 'finished']`. Admit `blocked`
when an active task generation has a pending request or reaches `waiting`;
mark the cursor inactive so repeated waiting revisions do not duplicate it.
Priority order is failed, blocked, finished.

- [ ] **Step 6: Run lifecycle tests**

Run:

```bash
pnpm vitest run server/node-identity.test.ts server/computer-registry.test.ts \
  server/manager-proactive-inbox.test.ts server/multi-node.test.ts \
  -t "lifecycle generation|blocked event|re-pair"
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add server/node-identity.ts server/node-identity.test.ts \
  server/computer-registry.ts server/computer-registry.test.ts \
  shared/contracts.ts server/computer-manager.ts server/multi-node.test.ts \
  server/manager-proactive-inbox.ts server/manager-proactive-inbox.test.ts
git commit -m "feat: persist proactive lifecycle ownership" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3: Trusted Oracle queue provenance and proactive outcome tool

**Files:**
- Modify: `shared/manager.ts`
- Modify: `server/manager-store.ts`
- Modify: `server/manager-store.test.ts`
- Modify: `server/manager-context.ts`
- Modify: `server/manager-context.test.ts`
- Modify: `server/manager-tools.ts`
- Modify: `server/manager-tools.test.ts`
- Modify: `server/manager-agent.ts`
- Modify: `server/manager-agent.test.ts`

**Interfaces:**
- Produces:
  - `ManagerMessageSource = 'typed' | 'voice' | 'proactive' | 'task'`
  - `ManagerAgent.enqueueInternal(input: ManagerInternalSubmission): Promise<ManagerMessage>`
  - `ManagerToolHost.recordProactiveOutcomes(input): Promise<string>`
- Consumes: Task 1's `OracleTaskStore` and Task 2's inbox event IDs.

- [ ] **Step 1: Write failing provenance, priority, and capability tests**

```ts
it('persists proactive and task provenance instead of degrading it to typed', async () => {
  await store.upsertMessage(userMessage({ id: 'p', source: 'proactive' }))
  await store.upsertMessage(userMessage({ id: 't', source: 'task' }))
  const reopened = await openStore(directory)
  expect(reopened.message('p')?.source).toBe('proactive')
  expect(reopened.message('t')?.source).toBe('task')
})

it('runs a later typed message before an automatic proactive message', async () => {
  await agent.enqueueInternal(proactiveSubmission('batch-a'))
  await agent.send('User request')
  await agent.start()
  expect(client.prompts[0]).toContain('<user_message>\\nUser request')
})

it('allows proactive turns to record outcomes but refuses session mutations', async () => {
  host.source = 'proactive'
  expect(await invoke('record_proactive_outcomes', validOutcomes())).toMatchObject({
    result: expect.stringMatching(/recorded/i),
  })
  expect(await invoke('create_session', sessionArgs())).toMatchObject({
    result: expect.stringMatching(/read-only/i),
  })
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
pnpm vitest run server/manager-store.test.ts server/manager-context.test.ts \
  server/manager-tools.test.ts server/manager-agent.test.ts \
  -t "proactive|task provenance|automatic proactive"
```

Expected: FAIL because the new sources and tool do not exist.

- [ ] **Step 3: Extend manager message contracts**

Add:

```ts
export interface ManagerAutomaticContext {
  kind: 'proactive' | 'task'
  taskId?: string
  eventIds?: string[]
}

export interface ManagerInternalSubmission {
  id: string
  content: string
  source: 'proactive' | 'task'
  answerOnly: boolean
  automatic: ManagerAutomaticContext
}
```

Persist `automatic` only on user messages and preserve it immutably across
retry. Exclude proactive turns from recovery briefs so they cannot evict user
context; include task turns because they represent user-authorized work.

- [ ] **Step 4: Add deterministic internal enqueue and user priority**

`enqueueInternal` checks the supplied ID before appending. The same immutable
payload returns the existing message; a different payload for the same ID
throws `409`.

Factor queue selection into:

```ts
function messagePriority(message: ManagerMessage): number {
  return message.source === 'proactive' ? 1 : 0
}
```

Within each priority retain durable insertion order. Re-read the selected
message after any awaited write before claiming it, as PR #487's review found
stale queue references unsafe.

- [ ] **Step 5: Wrap automatic prompts as untrusted data**

`managerPrompt()` must render:

```xml
<proactive_observation trusted_scope="manager-owned">
  <event id="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    kind="failed" computer_id="computer-a" session_id="session-a"
    task_generation="1" revision="7" />
</proactive_observation>
```

and:

```xml
<oracle_task_execution task_id="oracle-task-0123456789abcdef">
  <title>Run the focused queue test</title>
  <next_action>Start a session and run the queue regression.</next_action>
</oracle_task_execution>
```

Neither wrapper is a user message. The system prompt states that proactive
turns may read and record outcomes only, while task turns act only for their
bound task.

- [ ] **Step 6: Add `record_proactive_outcomes`**

Add a Zod schema with 1-20 outcomes and exact event ID validation:

```ts
z.object({
  outcomes: z.array(z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('task'),
      eventIds: z.array(eventId).min(1).max(20),
      title: z.string().trim().min(1).max(120),
      summary: z.string().trim().min(1).max(1000),
      nextAction: z.string().trim().min(1).max(1000),
      owner: z.enum(['oracle', 'user']),
      executionPrompt: z.string().trim().min(1).max(20_000).optional(),
    }).strict(),
    z.object({
      kind: z.literal('no-action'),
      eventIds: z.array(eventId).min(1).max(20),
      reason: z.string().trim().min(1).max(500),
    }).strict(),
  ])).min(1).max(20),
}).strict()
```

The host method verifies every current batch event appears exactly once, writes
tasks first, acknowledges only successful dispositions, and returns a bounded
summary. All other mutating tools refuse when `source === 'proactive'`.

- [ ] **Step 7: Run manager tests**

Run:

```bash
pnpm vitest run server/manager-store.test.ts server/manager-context.test.ts \
  server/manager-tools.test.ts server/manager-agent.test.ts \
  -t "proactive|task provenance|automatic proactive"
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add shared/manager.ts server/manager-store.ts server/manager-store.test.ts \
  server/manager-context.ts server/manager-context.test.ts \
  server/manager-tools.ts server/manager-tools.test.ts \
  server/manager-agent.ts server/manager-agent.test.ts
git commit -m "feat: add trusted Oracle task turns" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 4: Proactive coordinator and app lifecycle wiring

**Files:**
- Create: `server/manager-proactive-coordinator.ts`
- Create: `server/manager-proactive-coordinator.test.ts`
- Modify: `server/app.ts`
- Modify: `server/dreamer-app.test.ts`

**Interfaces:**
- Produces:
  - `ManagerProactiveCoordinator.initialize(): Promise<void>`
  - `ManagerProactiveCoordinator.handle(event: HubEvent): void`
  - `ManagerProactiveCoordinator.setEnabled(enabled: boolean): Promise<void>`
  - `ManagerProactiveCoordinator.drain(): Promise<void>`
  - `ManagerProactiveCoordinator.stop(): Promise<void>`
- Consumes: `ManagerProactiveInbox`, `ManagerAgent.enqueueInternal()`,
  `OracleTaskStore.upsertFinding()`, and stable `ComputerSummary.lifecycleGeneration`.

- [ ] **Step 1: Write failing coordinator tests**

```ts
it('turns an admitted failed event into one deterministic Oracle message', async () => {
  await coordinator.setEnabled(true)
  coordinator.handle(sessionEvent(runningSession({ revision: 1 })))
  coordinator.handle(sessionEvent(errorSession({ revision: 2 })))
  await coordinator.drain()
  expect(agent.enqueueInternal).toHaveBeenCalledTimes(1)
  expect(agent.enqueueInternal).toHaveBeenCalledWith(expect.objectContaining({
    source: 'proactive',
    id: expect.stringMatching(/^proactive-/),
  }))
})

it('replays pending events after restart without duplicating the task', async () => {
  await seedPendingEvent(directory)
  const restarted = await openCoordinator(directory)
  await restarted.initialize()
  await restarted.drain()
  await outcomeHost.recordProactiveOutcomes(validOutcomes())
  await restarted.drain()
  expect(taskStore.snapshot().tasks).toHaveLength(1)
  expect(inbox.pending()).toHaveLength(0)
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
pnpm vitest run server/manager-proactive-coordinator.test.ts server/dreamer-app.test.ts
```

Expected: FAIL because the coordinator does not exist and `app.ts` has no wiring.

- [ ] **Step 3: Implement coordinator admission and drain**

Use one serialized promise chain and one unref debounce timer. Do not poll.
`handle()` only projects `session.upserted` events. `drain()`:

1. reads up to 20 pending events;
2. returns if a proactive manager message is queued/running;
3. creates a deterministic ID from ordered event IDs;
4. enqueues a read-only proactive message;
5. leaves events pending until the outcome tool acknowledges them.

The prompt includes event kind, computer/session IDs, task generation, and a
bounded passive session projection. It excludes credentials, paths, full
transcripts, and unrelated sessions.

- [ ] **Step 4: Wire startup, settings, events, and shutdown**

Instantiate the inbox and coordinator only when Manager and Dreamer stores are
available. Attach the coordinator beside `JournalRecorder`, after both stores
initialize. Dreamer settings call `setEnabled`; startup calls `initialize` then
`drain`; close removes the event listener and awaits `stop`.

On startup, reconcile current authoritative sessions before draining so a
restart does not invent removals or stale state.

- [ ] **Step 5: Add app integration test**

Use fake manager SDK and session services to prove:

```ts
expect(await dreamerSnapshot()).toMatchObject({
  tasks: [expect.objectContaining({
    title: 'Run the focused queue test',
    status: 'ready',
    owner: 'oracle',
  })],
})
```

Restart the app on the same data directory and assert one task and no pending
inbox events after the replayed outcome.

- [ ] **Step 6: Run coordinator tests**

Run:

```bash
pnpm vitest run server/manager-proactive-coordinator.test.ts server/dreamer-app.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add server/manager-proactive-coordinator.ts \
  server/manager-proactive-coordinator.test.ts server/app.ts \
  server/dreamer-app.test.ts
git commit -m "feat: connect Oracle lifecycle findings" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 5: Task dispatch, execution reconciliation, and authoritative completion

**Files:**
- Modify: `server/dreamer-service.ts`
- Modify: `server/dreamer-service.test.ts`
- Modify: `server/manager-agent.ts`
- Modify: `server/manager-agent.test.ts`
- Modify: `server/oracle-task-store.ts`
- Modify: `server/oracle-task-store.test.ts`

**Interfaces:**
- Produces:
  - `DreamerService.investigateSuggestion(input): Promise<DreamerSnapshot>`
  - `DreamerService.dispatchTask(input): Promise<DreamerSnapshot>`
  - `DreamerService.confirmTaskCompletion(input): Promise<DreamerSnapshot>`
  - `DreamerService.reconcileTasks(): Promise<void>`
- Consumes: deterministic manager internal messages and task store from Tasks 1-4.

- [ ] **Step 1: Write failing lifecycle tests**

Cover all required transitions:

```ts
it('does not treat a journal suggestion as execution', async () => {
  const snapshot = await service.snapshotForApi()
  const suggestion = snapshot.plan!.items.find(({ source }) => source === 'session')!
  expect(suggestion.taskId).toBeUndefined()
  expect(snapshot.tasks).toEqual([])
})

it('dispatches once for a repeated request id and links execution activity', async () => {
  const first = await service.dispatchTask({
    revision: snapshot.revision,
    taskId,
    requestId: requestId,
  })
  const replay = await service.dispatchTask({
    revision: first.revision,
    taskId,
    requestId,
  })
  expect(agent.enqueueInternal).toHaveBeenCalledTimes(1)
  expect(replay.tasks[0].attempts).toHaveLength(1)
})

it.each([
  ['waiting', 'blocked'],
  ['error', 'failed'],
])('reconciles %s execution as %s', async (sessionStatus, taskStatus) => {
  session.status = sessionStatus
  await service.reconcileTasks()
  expect(service.snapshot().tasks[0].status).toBe(taskStatus)
})

it('requires trusted root completion after the latest user turn', async () => {
  session.messages = [plainAssistantMessage('Tests passed')]
  await service.reconcileTasks()
  expect(service.snapshot().tasks[0].status).not.toBe('review')
  session.messages = [rootTaskCompleteMessage()]
  await service.reconcileTasks()
  expect((await service.snapshotForApi()).tasks[0].status).toBe('review')
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
pnpm vitest run server/dreamer-service.test.ts server/oracle-task-store.test.ts \
  server/manager-agent.test.ts -t "journal suggestion|dispatches once|reconciles|trusted root completion"
```

Expected: FAIL because dispatch and reconciliation are absent.

- [ ] **Step 3: Add suggestion investigation**

`investigateSuggestion` accepts the current snapshot revision, plan/item ID,
and request UUID. It creates a deterministic proactive message bound to that
session suggestion. The action does not create a task immediately and does not
mark the suggestion running. Replay of the same request returns the current
snapshot.

- [ ] **Step 4: Add task dispatch**

For Oracle-owned ready/failed/blocked tasks with an `executionPrompt`, persist
the attempt before enqueue:

```ts
const attemptId = `attempt-${createHash('sha256')
  .update([task.id, requestId].join('\0'))
  .digest('hex')
  .slice(0, 32)}`
const managerMessageId = `task-${attemptId}`
```

Enqueue a `source: 'task'` message containing the immutable task ID, title,
next action, execution prompt, and latest source session. A user-owned task
returns `409` with “This task needs your action and cannot be dispatched.”

- [ ] **Step 5: Correlate manager activity and sessions**

When `ManagerAgent.recordActivity()` writes an activity for a task message,
retain its `sessionRefs`. Reconciliation reads all messages with
`replyTo === managerMessageId`, merges exact session refs, and maps manager
message state to attempt state.

For linked sessions, passively read only exact IDs. Project recent root tool
activity from `ChatMessage` fields; keep it transient and bounded to 10 entries
and 1,000 characters per result.

- [ ] **Step 6: Implement blocked, failed, retry, and replacement semantics**

Pending permission/user input or `waiting` -> blocked with exact next action.
Manager failure or session error -> failed. A retry is a new request ID and
attempt; previous attempts remain. The task status follows only its newest
attempt. Late older-attempt events update history but not current status.

- [ ] **Step 7: Reuse trusted completion validation**

Extract the existing session completion parser so legacy plan items and tasks
share one implementation. Bind task completion to `attemptId` and exact linked
session. Confirmation re-reads the message and calls
`OracleTaskStore.confirmCompletion`.

- [ ] **Step 8: Run lifecycle tests**

Run:

```bash
pnpm vitest run server/dreamer-service.test.ts server/oracle-task-store.test.ts \
  server/manager-agent.test.ts -t "journal suggestion|dispatches once|reconciles|trusted root completion"
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add server/dreamer-service.ts server/dreamer-service.test.ts \
  server/manager-agent.ts server/manager-agent.test.ts \
  server/oracle-task-store.ts server/oracle-task-store.test.ts
git commit -m "feat: reconcile Oracle task execution" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 6: Task action API and client

**Files:**
- Modify: `server/dreamer-routes.ts`
- Modify: `server/dreamer-routes.test.ts`
- Modify: `src/dreamer-api.ts`
- Modify: `src/dreamer-api.test.ts`

**Interfaces:**
- Produces:
  - `investigateDreamerSuggestion(input): Promise<DreamerSnapshot>`
  - `dispatchDreamerTask(input): Promise<DreamerSnapshot>`
  - `confirmDreamerTaskCompletion(input): Promise<DreamerSnapshot>`
- Consumes: Task 5's DreamerService methods.

- [ ] **Step 1: Write failing route and client tests**

```ts
it('dispatches a task idempotently through the authenticated hub route', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/manager/dreamer/tasks/${taskId}/dispatch`,
    headers: trustedHeaders,
    payload: { revision: 4, requestId },
  })
  expect(response.statusCode).toBe(202)
  expect(response.json().tasks[0].status).toBe('queued')
})

it('sends an investigate mutation without treating it as completion', async () => {
  await investigateDreamerSuggestion({
    revision: 4,
    planId: 'plan-a',
    itemId: 'session-a',
    requestId,
  })
  expect(fetch).toHaveBeenCalledWith('/api/manager/dreamer/plan', expect.objectContaining({
    method: 'PUT',
  }))
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
pnpm vitest run server/dreamer-routes.test.ts src/dreamer-api.test.ts
```

Expected: FAIL because schemas and client methods are absent.

- [ ] **Step 3: Extend plan mutation schemas**

Add exactly one of `order`, `item`, legacy `completion`, `investigate`, or
`taskCompletion`. UUID-validate request IDs. Task completion carries task ID,
attempt ID, computer/session/revision/message IDs, and digest.

- [ ] **Step 4: Add dispatch route**

```ts
app.post('/api/manager/dreamer/tasks/:taskId/dispatch', async (request, reply) => {
  reply.header('cache-control', 'no-store')
  const { taskId } = taskParams.parse(request.params)
  const input = dispatchSchema.parse(request.body ?? {})
  return reply.code(202).send(
    await requireService().dispatchTask({ taskId, ...input }),
  )
})
```

Do not register any proactive/wake route.

- [ ] **Step 5: Add client methods and precise errors**

Use `POST` only for dispatch; keep plan mutations on `PUT`. Map `409` to the
server's safe message when present so blocked/user-owned tasks explain the
required action instead of showing the generic stale-state message.

- [ ] **Step 6: Run API tests**

Run:

```bash
pnpm vitest run server/dreamer-routes.test.ts src/dreamer-api.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add server/dreamer-routes.ts server/dreamer-routes.test.ts \
  src/dreamer-api.ts src/dreamer-api.test.ts
git commit -m "feat: expose Oracle task actions" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 7: Morning Plan task and evidence UI

**Files:**
- Modify: `src/OracleDreamer.tsx`
- Modify: `src/OracleDreamer.test.tsx`
- Modify: `src/dreamer.css`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: Tasks 1 and 6's task snapshot and API methods.
- Produces: accessible suggestion/task cards with preserved expanded state.

- [ ] **Step 1: Write failing UI tests**

```tsx
it('labels journal metadata as an uninvestigated suggestion', async () => {
  renderMorningPlan(snapshotWithJournalSuggestion())
  const card = await screen.findByRole('listitem')
  expect(card).toHaveTextContent('Suggestion')
  expect(card).toHaveTextContent('Oracle has not investigated or assigned this work.')
  expect(within(card).queryByText(/Running|Completed/)).toBeNull()
  expect(within(card).getByRole('button', { name: /Ask Oracle to investigate/ }))
    .toBeEnabled()
})

it('shows task owner, next action, execution evidence, and retry', async () => {
  renderMorningPlan(snapshotWithFailedTask())
  const card = await screen.findByRole('article', { name: /Run the focused queue test/ })
  expect(card).toHaveTextContent('Failed')
  expect(card).toHaveTextContent('Owner: Oracle')
  expect(card).toHaveTextContent('Next action')
  expect(card).toHaveTextContent('vitest')
  expect(within(card).getByRole('button', { name: /Retry/ })).toBeEnabled()
})

it('preserves one task card and expanded evidence across authoritative refresh', async () => {
  render(<App />)
  await expandTaskEvidence()
  await triggerAuthoritativeRefresh()
  expect(screen.getAllByRole('article', { name: /focused queue test/ })).toHaveLength(1)
  expect(screen.getByText('Execution evidence')).toBeVisible()
})
```

- [ ] **Step 2: Run UI tests and verify failure**

Run:

```bash
pnpm vitest run src/OracleDreamer.test.tsx src/App.test.tsx \
  -t "uninvestigated suggestion|task owner|expanded evidence"
```

Expected: FAIL because the task card and actions are absent.

- [ ] **Step 3: Split suggestion and task rendering**

Keep `DreamerMorningPlan` as the data owner. Add focused local components:

```tsx
function DreamerSuggestionCard({
  item,
  disabled,
  onInvestigate,
}: SuggestionCardProps) {
  return (
    <article aria-label={item.label} className="dreamer-item">
      <header><strong>{item.label}</strong><span>Suggestion</span></header>
      <p>Oracle has not investigated or assigned this work.</p>
      <p>{item.reason}</p>
      <button disabled={disabled} onClick={onInvestigate} type="button">
        Ask Oracle to investigate
      </button>
    </article>
  )
}

function OracleTaskCard({
  task,
  disabled,
  onDispatch,
  onConfirm,
}: OracleTaskCardProps) {
  const actionLabel = task.status === 'ready' ? 'Start work' : 'Retry'
  return (
    <article aria-label={task.title} className="dreamer-task">
      <header><strong>{task.title}</strong><span>{task.status}</span></header>
      <p>Owner: {task.owner === 'oracle' ? 'Oracle' : 'You'}</p>
      <section><strong>Next action</strong><p>{task.nextAction}</p></section>
      <OracleTaskEvidence task={task} />
      {task.status === 'ready' || task.status === 'failed' || task.status === 'blocked'
        ? <button disabled={disabled} onClick={onDispatch} type="button">{actionLabel}</button>
        : null}
      {task.status === 'review'
        ? <button disabled={disabled} onClick={onConfirm} type="button">Confirm completed</button>
        : null}
    </article>
  )
}

function OracleTaskEvidence({ task }: OracleTaskEvidenceProps) {
  return (
    <details>
      <summary>Execution evidence</summary>
      {task.evidence?.map((entry) => (
        <p key={entry.id}>{entry.label}: {entry.status}</p>
      ))}
    </details>
  )
}
```

Suggestion copy must say no work was assigned. Task cards use one status badge,
one owner line, one **Next action** section, then execution/evidence details.

- [ ] **Step 4: Add state-specific actions**

- `ready`: **Start work** for Oracle-owned, **Needs you** for user-owned.
- `queued`/`running`: **Open session** when linked; no duplicate dispatch.
- `blocked`: show pending request and **Retry** only when server allows it.
- `failed`: show error and **Retry**.
- `review`: **Review result**, then **Confirm completed**.
- `completed`/`dismissed`: **Restore** only where supported by existing plan semantics.

Generate one request UUID per click and disable the action until its authoritative
response settles.

- [ ] **Step 5: Render bounded evidence**

Display tool/test activity as a compact list with status and duration. Display
result/error in `<pre>` only inside expanded details. Do not call generic
activity “completion evidence”; reserve that phrase for trusted
`task_complete`.

- [ ] **Step 6: Preserve refresh state**

Key expanded evidence by task ID and drop only IDs no longer present. The
coordinated refresh continues to load sessions, background tasks, and Dreamer;
it must not replay mutations or duplicate task cards.

- [ ] **Step 7: Run UI tests**

Run:

```bash
pnpm vitest run src/OracleDreamer.test.tsx src/App.test.tsx \
  -t "uninvestigated suggestion|task owner|expanded evidence"
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/OracleDreamer.tsx src/OracleDreamer.test.tsx \
  src/dreamer.css src/App.test.tsx
git commit -m "feat: show actionable Morning Plan evidence" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 8: Integration coverage, specification, release identity, and handoff

**Files:**
- Modify: `server/dreamer-app.test.ts`
- Modify: `docs/app-spec.md`
- Modify: `docs/design/oracle-dreamer.md`
- Modify: `package.json`
- Modify: `shell/package.json`
- Modify: `shell/src-tauri/tauri.conf.json`
- Modify: `shell/src-tauri/Cargo.toml`
- Modify: `shell/src-tauri/Cargo.lock`
- Modify: versioned shell examples found by the version-policy test
- Modify: `graphify/graph.json`
- Modify: `graphify/graph.html`
- Modify: `graphify/GRAPH_REPORT.md`
- Modify: `graphify/communities.json`
- Modify: `graphify/metadata.json`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: complete regression evidence, normative docs, exact release version, refreshed graph, and PR.

- [ ] **Step 1: Add focused end-to-end regression**

One fake-runtime app test must execute:

```text
manager-owned session running
-> failed lifecycle event
-> inbox admission
-> proactive Oracle outcome
-> one durable task
-> explicit dispatch
-> linked execution session with tool/test activity
-> blocked state
-> retry
-> trusted root task_complete
-> review
-> confirmed completion
-> restart and refresh
```

Assert every duplicate event, request ID, refresh, and restart retains one task
and the correct attempt count. Add a second case where only journal text exists
and the item remains a suggestion.

- [ ] **Step 2: Run the focused server/UI matrix**

Run:

```bash
pnpm vitest run \
  server/oracle-task-store.test.ts \
  server/manager-proactive-inbox.test.ts \
  server/manager-proactive-coordinator.test.ts \
  server/manager-agent.test.ts \
  server/manager-tools.test.ts \
  server/dreamer-service.test.ts \
  server/dreamer-routes.test.ts \
  server/dreamer-app.test.ts \
  src/dreamer-api.test.ts \
  src/OracleDreamer.test.tsx \
  src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Update normative documentation**

Replace the metadata-only completion claim in `docs/app-spec.md` with the three
source-of-truth objects, no-proactive-endpoint decision, task state machine,
explicit dispatch, and trusted evidence rule. Update
`docs/design/oracle-dreamer.md` phases and remaining limitations without
claiming notifications, user-origin supervision, or automatic follow-through.

- [ ] **Step 4: Bump all shipped versions to 1.37.3**

Update every version file required by repository policy. Run:

```bash
pnpm vitest run server/version-policy.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run lint, targeted tests, build, and production mode**

Run:

```bash
pnpm lint
pnpm test:fast
pnpm build
NODE_ENV=production pnpm check
```

Expected: PASS, except a host-wide tmux failure is acceptable only if reproduced
unchanged on `origin/main` and documented with exact output.

- [ ] **Step 6: Refresh and verify Graphify**

Stage new source files first, then run:

```bash
git add shared/oracle-task.ts server/oracle-task-store.ts \
  server/manager-proactive-coordinator.ts
python3 graphify/manage.py update
python3 graphify/manage.py check
```

Expected: graph current with no manual graph edits.

- [ ] **Step 7: Commit release and generated files**

```bash
git add docs/app-spec.md docs/design/oracle-dreamer.md \
  package.json shell/package.json shell/src-tauri/tauri.conf.json \
  shell/src-tauri/Cargo.toml shell/src-tauri/Cargo.lock \
  graphify/graph.json graphify/graph.html graphify/GRAPH_REPORT.md \
  graphify/communities.json graphify/metadata.json
git commit -m "release: prepare actionable Oracle tasks" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

- [ ] **Step 8: Review the full branch diff**

Run:

```bash
git diff --check origin/main...HEAD
git status --short --branch
git log --oneline origin/main..HEAD
```

Confirm no unrelated paths or worktree changes.

- [ ] **Step 9: Push and open the PR**

Push:

```bash
git push -u origin fix/oracle-actionable-morning-plan
```

Open a PR with:

```text
Refs #408
Refs #468
```

The body must report the root cause, no-proactive-endpoint decision, exact
branch/head SHA, data/API changes, user-visible task/evidence behavior, focused
and full validation, #487 overlap, and remaining limitations. Do not merge.

- [ ] **Step 10: Run the exact-head gate**

Run:

```bash
bin/agentic-remote-gate <PR_NUMBER>
```

Expected: `agentic-remote/full-gate` success for the exact PR head. If the
host-wide tmux test is blocked by another namespace, wait for that gate to
finish and rerun once; do not kill or alter another worktree's process.
