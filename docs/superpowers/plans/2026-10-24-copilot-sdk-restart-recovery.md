# Copilot SDK Restart Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recover durable Copilot SDK session state after an Agentic Remote service restart without replaying uncertain work or claiming lost stream continuity.

**Architecture:** Keep the SDK runtime in the service process, persist a monotonic owner generation and recovery phase, and cold-resume the same provider ID during startup. Reconcile durable events and low-level pending permissions before releasing the existing queue barrier; leave model streams and transient callbacks explicitly interrupted.

**Tech Stack:** TypeScript, Node.js, `@github/copilot-sdk` 1.0.22, Vitest, React.

**Spec:** `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`

## Global Constraints

- Do not deploy, merge, restart services, or change live host state.
- Do not recreate a populated provider session when same-ID resume fails.
- Do not replay an uncertain active prompt or transient callback.
- Keep queued prompts durable, blocked during recovery, and FIFO.
- Keep provider request IDs and owner generations server-private.
- Do not store credentials, tokens, Copilot runtime files, or generated provider state.
- Do not change Oracle UX, voice, memory, OpenClaw, or Tidbyt behavior.
- Preserve compatibility with older clients through the existing `interruption` field.

---

### Task 1: Persist the recovery state machine

**Files:**
- Modify: `shared/contracts.ts:99-163,300-370`
- Modify: `server/session-store.ts:25-135,310-365,397-577,1019-1064`
- Test: `server/session-store.test.ts`

**Interfaces:**
- Produces: `SessionRestartRecovery`, public `SessionSummary.restartRecovery`.
- Produces: private `SdkRestartRecovery`, `SdkAcceptedReply`.
- Produces: `SessionStore.sdkRecovery(id)`, `claimSdkRecovery(id)`,
  `settleSdkRecovery(id, generation, outcome)`,
  `bindRecoveredPermission(id, generation, requestId, providerRequestId, permission)`,
  `acceptSdkReply(id, generation, reply)`, and
  `clearSdkReply(id, generation, requestId)`.

- [ ] **Step 1: Write failing store tests**

Add tests that persist a running SDK session, initialize a second store, and
assert that it exposes `restartRecovery.state === 'interrupted'`, retains FIFO
and pending cards, and returns generation 1 from the first claim. Add a second
initialization from persisted `recovering` and assert generation 2 is claimed.
Add conditional-settlement tests proving generation 1 cannot settle generation
2. Add accepted-reply round-trip tests with exact input values.

```ts
const first = await reopened.claimSdkRecovery('sdk')
expect(first).toMatchObject({ generation: 1, state: 'recovering' })
await reopened.settleSdkRecovery('sdk', first.generation, {
  state: 'interrupted',
  message: 'The model stream could not be restored.',
})
expect(reopened.get('sdk')?.restartRecovery?.state).toBe('interrupted')

const stale = await reopened.settleSdkRecovery('sdk', 1, { state: 'ready' })
expect(stale).toBeUndefined()
```

- [ ] **Step 2: Run the store tests and verify failure**

Run:

```bash
pnpm vitest run server/session-store.test.ts -t "SDK restart recovery"
```

Expected: FAIL because recovery contracts and store methods do not exist.

- [ ] **Step 3: Add contracts and private storage**

Add:

```ts
export interface SessionRestartRecovery {
  state: 'recovering' | 'waiting-permission' | 'interrupted' | 'failed'
  detectedAt: string
  message?: string
}
```

Add `restartRecovery?: SessionRestartRecovery` to `SessionSummary`. Define the
private stored interfaces from the spec and strip them in `cloneSession`, where
they are projected to the public shape.

Validate every optional field during `initialize()`. Convert abandoned
`recovering` to `pending`, keep `interruption`, mark transient SDK interactions
stale, and leave queues unchanged.

- [ ] **Step 4: Implement generation-checked store methods**

`claimSdkRecovery` must commit `generation + 1`, `state: 'recovering'`, and the
existing interruption timestamp. `settleSdkRecovery` must use `mutateIf` or
equivalent conditional mutation and return `undefined` for a stale generation.
Only `ready` clears `interruption`; waiting, interrupted, and failed keep it.

`bindRecoveredPermission` stores the provider request ID privately and exposes
the existing `PendingPermission` shape with `stale: false`.

`acceptSdkReply` commits the exact choice before provider delivery.
`clearSdkReply` clears only an exact generation/request match.

- [ ] **Step 5: Run store tests**

Run:

```bash
pnpm vitest run server/session-store.test.ts -t "SDK restart recovery"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add shared/contracts.ts server/session-store.ts server/session-store.test.ts
git commit -m "feat: persist SDK restart recovery state

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 2: Fence SDK runtime ownership by generation

**Files:**
- Modify: `server/agent-service.ts:169-331,1784-1910,8060-8137,9200-9765`
- Test: `server/agent-service-recovery.test.ts`

**Interfaces:**
- Consumes: `SessionStore.claimSdkRecovery`, `SessionStore.settleSdkRecovery`.
- Produces: private `SdkOwner { session: CopilotSessionLike; generation: number }`.
- Produces: `attachSdkSession(sessionId, recoveryGeneration?)`.
- Produces: `isCurrentSdkOwner(sessionId, session, generation)`.

- [ ] **Step 1: Write failing owner-generation tests**

Extend the SDK fixture so two fake sessions can emit events. Claim generation
1, replace it with generation 2, emit an assistant delta and idle event from
generation 1, and assert no message/status mutation. Emit from generation 2 and
assert the mutation is accepted.

Add concurrent `ensureLoaded()` calls and assert `resumeSession` runs once.

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
pnpm vitest run server/agent-service-recovery.test.ts -t "SDK owner generation"
```

Expected: FAIL because callbacks are not generation-fenced.

- [ ] **Step 3: Install generation-aware owners**

Replace the raw session map value with owner metadata or add a parallel
generation map. Every `attachSession` callback must capture the session object
and generation:

```ts
private isCurrentSdkOwner(
  sessionId: string,
  session: CopilotSessionLike,
  generation: number,
): boolean {
  return this.sessions.get(sessionId) === session &&
    this.sdkOwnerGenerations.get(sessionId) === generation
}
```

Guard event handling, transcript writes, active-prompt settlement, runtime
configuration results, cancellation, and teardown commits with this predicate.
Normal newly created and lazily resumed sessions use generation 0 unless a
durable recovery claim supplies a larger value.

- [ ] **Step 4: Preserve current coalescing and teardown semantics**

Keep `loadingSessions` as the within-process attach coalescer. A stale attach
must disconnect its own returned SDK session and leave the current owner
installed. `stop()`, delete, suspend, terminal activation, and clear remove the
generation only when removing the matching owner.

- [ ] **Step 5: Run generation and lifecycle tests**

Run:

```bash
pnpm vitest run server/agent-service-recovery.test.ts server/agent-service-lifecycle.test.ts -t "SDK owner|stale generation|resume"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add server/agent-service.ts server/agent-service-recovery.test.ts server/agent-service-lifecycle.test.ts
git commit -m "feat: fence SDK session owners by generation

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 3: Recover SDK sessions during startup

**Files:**
- Modify: `server/agent-service.ts:2280-2436,8060-8251`
- Modify: `server/startup-phases.ts`
- Test: `server/agent-service-recovery.test.ts`
- Test: `server/startup-phases.test.ts`

**Interfaces:**
- Consumes: generation-aware `attachSdkSession`.
- Produces: `recoverSdkSessions(): Promise<void>`.
- Produces: `recoverSdkSession(id): Promise<'ready' | 'waiting-permission' | 'interrupted' | 'failed'>`.

- [ ] **Step 1: Write failing startup-recovery tests**

Add independent tests for:

- an interrupted session whose events end in `assistant.turn_end` becoming idle;
- events ending in `assistant.turn_start` remaining interrupted;
- missing populated provider state becoming failed without `createSession`;
- missing empty provider state preserving the existing empty same-ID fallback;
- two startup recovery calls sharing one resume;
- queues remaining untouched while interrupted;
- FIFO draining after a completed-turn reconciliation.

Assert `resumeSession` receives:

```ts
expect.objectContaining({
  suppressResumeEvent: true,
  continuePendingWork: true,
})
```

- [ ] **Step 2: Run startup recovery tests and verify failure**

Run:

```bash
pnpm vitest run server/agent-service-recovery.test.ts -t "SDK startup recovery"
```

Expected: FAIL because startup does not proactively resume SDK sessions.

- [ ] **Step 3: Add the startup phase and candidate selection**

Add `copilot.recovery.sdk` to startup phases. In
`finishStartupRecovery()`, run SDK recovery after provider/terminal discovery
and before transcript refresh or SDK queue drainage.

Candidates must be open, SDK-backed, non-suspended, interrupted, not hidden,
not externally terminal-owned, and still present when the lifecycle lock is
acquired.

- [ ] **Step 4: Implement event-based classification**

Resume the same ID with the claimed generation and `continuePendingWork: true`.
Subscribe before calling `getEvents()`. Reconcile messages through
`replaceMessages()` using the existing transcript observation.

Use `foregroundTurnOpen(events)` and `statusFromEvents(events)`:

- no open turn and terminal/idle status settles ready;
- an open turn settles interrupted;
- resume/list/get-events failure settles failed;
- a populated missing identity never invokes fallback creation.

Publish each committed state. Do not drain a queue until ready settlement has
cleared the interruption.

- [ ] **Step 5: Run startup and durability tests**

Run:

```bash
pnpm vitest run server/agent-service-recovery.test.ts server/recovery-resend-durability.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add server/agent-service.ts server/startup-phases.ts server/agent-service-recovery.test.ts server/startup-phases.test.ts
git commit -m "feat: reconcile SDK sessions during startup

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 4: Recover durable permission requests

**Files:**
- Modify: `server/agent-service.ts:287-310,7292-7399,10393-10434`
- Test: `server/agent-service-recovery.test.ts`
- Test: `server/agent-service-permissions.test.ts`

**Interfaces:**
- Extends: `CopilotSessionLike.rpc.permissions` with
  `pendingRequests` and `handlePendingPermissionRequest`.
- Consumes: `SessionStore.bindRecoveredPermission`,
  `SessionStore.acceptSdkReply`, and `SessionStore.clearSdkReply`.

- [ ] **Step 1: Write failing permission-recovery tests**

Create a fake `pendingRequests()` result:

```ts
{
  items: [{
    requestId: 'provider-permission',
    request: {
      kind: 'commands',
      fullCommandText: 'printf safe',
      intention: 'Run a controlled command',
      commandIdentifiers: ['printf'],
      canOfferSessionApproval: false,
    },
  }],
}
```

Assert startup exposes a non-stale permission card, keeps the queue blocked,
and stores no provider ID in the public session. Reply `allow-once`, assert one
low-level handler call with `approvedInteractively: true`, then return no
pending requests and terminal events; assert the card clears and FIFO drains.

Add rejection, already-resolved, RPC-failure, and stale-generation tests.

- [ ] **Step 2: Run permission tests and verify failure**

Run:

```bash
pnpm vitest run server/agent-service-recovery.test.ts server/agent-service-permissions.test.ts -t "recovered permission"
```

Expected: FAIL because the low-level RPC is not represented or used.

- [ ] **Step 3: Extend the SDK session facade**

Use exact SDK types:

```ts
permissions?: Pick<
  CopilotSession['rpc']['permissions'],
  'pendingRequests' | 'handlePendingPermissionRequest'
>
```

Treat absence as unsupported recovery, not an empty list.

- [ ] **Step 4: Reconstruct and bind permission cards**

During SDK recovery, query pending requests. Zero requests follow event
classification. Exactly one request becomes `waiting-permission`. Multiple
requests fail closed with an explicit unsupported message because the public
contract has one pending card.

Build a safe title from `PermissionPromptRequest.kind`; never persist command
output, environment values, or secrets beyond the SDK-provided prompt metadata
already shown to the user.

- [ ] **Step 5: Add idempotent recovered replies**

Before calling the provider, persist `SdkAcceptedReply`. Translate:

```ts
const result = optionId === 'allow-once'
  ? { kind: 'approve-once' as const, approvedInteractively: true }
  : { kind: 'reject' as const, feedback: 'Rejected from Agentic Remote' }
```

After the call, re-query pending requests and events. A request no longer
listed is settled even if the handler result says it was already resolved.
Keep recovery fenced until events prove terminal or another permission appears.

- [ ] **Step 6: Run permission, queue, and restart tests**

Run:

```bash
pnpm vitest run server/agent-service-recovery.test.ts server/agent-service-permissions.test.ts server/recovery-resend-durability.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add server/agent-service.ts server/agent-service-recovery.test.ts server/agent-service-permissions.test.ts
git commit -m "feat: recover pending SDK permissions

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 5: Preserve transient answer uncertainty and cancellation safety

**Files:**
- Modify: `server/agent-service.ts:7240-7785,10436-10525`
- Modify: `server/session-store.ts`
- Test: `server/agent-service-user-input.test.ts`
- Test: `server/agent-service-recovery.test.ts`

**Interfaces:**
- Consumes: durable `SdkAcceptedReply`.
- Produces: generation-aware acceptance and settlement for SDK permissions,
  user input, and elicitation.

- [ ] **Step 1: Write failing accepted-answer tests**

Block the post-resolver state write, submit a user-input answer, copy the state
file, initialize a new store, and assert:

- the exact accepted values remain stored privately;
- the public card is stale;
- the public recovery message says delivery is uncertain;
- startup does not invoke the old callback or send a new prompt.

Add equivalent elicitation and cancellation tests. Replace the owner after
capturing cancellation generation and assert the late abort does not target
the replacement.

- [ ] **Step 2: Run answer tests and verify failure**

Run:

```bash
pnpm vitest run server/agent-service-user-input.test.ts server/agent-service-recovery.test.ts -t "accepted SDK answer|stale cancellation"
```

Expected: FAIL because reply acceptance is process-local.

- [ ] **Step 3: Persist before resolving live callbacks**

Change live SDK reply acceptance to:

```ts
await this.store.acceptSdkReply(sessionId, generation, reply)
if (!this.isCurrentSdkGeneration(sessionId, generation)) throw staleReplyError()
resolve()
return this.settleSdkReply(sessionId, requestId, choice)
```

Normal settlement clears the durable reply. Restart keeps it and marks the
callback unavailable. Never call the old resolver or synthesize a provider
request ID.

- [ ] **Step 4: Fence cancellation and answer settlement**

Capture owner generation before `abort()`. After every await, verify the owner
and generation before clearing active prompts, pending cards, or status.
Return `409` for stale browser replies without modifying the current owner.

- [ ] **Step 5: Run focused interaction tests**

Run:

```bash
pnpm vitest run server/agent-service-user-input.test.ts server/agent-service-permissions.test.ts server/agent-service-recovery.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add server/agent-service.ts server/session-store.ts server/agent-service-user-input.test.ts server/agent-service-recovery.test.ts
git commit -m "fix: retain uncertain SDK answers across restart

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 6: Present honest recovery states

**Files:**
- Modify: `src/session-presentation.ts:35-130`
- Modify: `src/App.tsx:8270-8300,14100-14160,15340-15450`
- Test: `src/session-presentation.test.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: `SessionSummary.restartRecovery`.
- Produces: presentation state `recovering`.

- [ ] **Step 1: Write failing presentation tests**

Add table-driven tests:

```ts
[
  ['recovering', 'Recovering', true, true],
  ['waiting-permission', 'Permission', true, false],
  ['interrupted', 'Interrupted', true, false],
  ['failed', 'Recovery failed', true, false],
]
```

Assert recovery takes precedence over generic `status === 'error'`, while a
live recovered permission card still presents Permission. Add App tests that
the composer is disabled during recovery and that interruption copy says
queued work was not replayed.

- [ ] **Step 2: Run UI tests and verify failure**

Run:

```bash
pnpm vitest run src/session-presentation.test.ts src/App.test.tsx -t "restart recovery|Recovering"
```

Expected: FAIL because the presentation does not know recovery metadata.

- [ ] **Step 3: Implement presentation state**

Add `recovering` to `SessionState`, labels, attention rank, and working
semantics. Order precedence:

1. live pending user input;
2. live pending permission;
3. restart recovery `recovering`;
4. restart recovery `failed` or `interrupted`;
5. existing states.

Use the server-provided recovery message in the detail boundary. Do not claim
the model stream resumed.

- [ ] **Step 4: Run UI tests**

Run:

```bash
pnpm vitest run src/session-presentation.test.ts src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/session-presentation.ts src/App.tsx src/session-presentation.test.ts src/App.test.tsx
git commit -m "feat: show SDK restart recovery states

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 7: Document compatibility and validate the complete change

**Files:**
- Modify: `docs/app-spec.md`
- Modify: `docs/provider-compatibility.md`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `shell/package.json`
- Modify: `shell/src-tauri/tauri.conf.json`
- Modify: `shell/src-tauri/Cargo.toml`
- Test: `server/manager-agent.test.ts`

**Interfaces:**
- No new runtime interfaces.
- Documents the verified SDK boundary and recovery contract.

- [ ] **Step 1: Add Oracle regression coverage**

Run the existing manager restart tests and add one assertion that normal SDK
recovery never claims or resumes the hidden Oracle SDK session. Assert Oracle's
persisted queue, SDK ID, generation, and one-retry uncertainty behavior are
unchanged.

- [ ] **Step 2: Update normative documentation**

In `docs/app-spec.md`, replace the unconditional stale-SDK-callback restart
rule with the state machine from the spec: same-ID recovery, durable permission
reconstruction, blocked FIFO, and explicit interruption for streams and
transient callbacks.

In `docs/provider-compatibility.md`, document that SDK 1.0.22 supports durable
permissions through experimental RPCs but not process reattachment, stream
continuation, or durable user-input/elicitation callbacks.

- [ ] **Step 3: Bump shipped versions**

Change application and shell versions from `1.31.0` to `1.32.0` in the listed
manifests and regenerate lock metadata with:

```bash
pnpm install --lockfile-only
```

- [ ] **Step 4: Run targeted recovery validation**

Run:

```bash
pnpm vitest run \
  server/session-store.test.ts \
  server/agent-service-recovery.test.ts \
  server/recovery-resend-durability.test.ts \
  server/agent-service-permissions.test.ts \
  server/agent-service-user-input.test.ts \
  server/manager-agent.test.ts \
  src/session-presentation.test.ts \
  src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Run repository gates**

Run:

```bash
pnpm check
NODE_ENV=production pnpm check
```

Expected: lint, tests, type-check, and production build all PASS.

- [ ] **Step 6: Repeat the isolated permission probe**

Run the controlled probe with a disposable `COPILOT_HOME`. Verify one durable
user message, one recovered provider permission request, one response, and a
terminal turn event. Delete the probe's provider session and temporary home.
Do not point the probe at Agentic Remote's service state.

- [ ] **Step 7: Verify Graphify and repository scope**

Run:

```bash
git diff --check
git status --short
git diff --stat origin/main...HEAD
```

Run the repository Graphify freshness check documented in
`.github/skills/agentic-remote-navigation/SKILL.md`. Expected: graph current and
only the planned SDK recovery files changed.

- [ ] **Step 8: Commit**

```bash
git add docs/app-spec.md docs/provider-compatibility.md package.json pnpm-lock.yaml \
  shell/package.json shell/src-tauri/tauri.conf.json shell/src-tauri/Cargo.toml \
  server/manager-agent.test.ts
git commit -m "docs: define SDK restart recovery contract

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

- [ ] **Step 9: Stop for review**

Report the branch, commits, exact validation results, provider limitations,
migration and rollback behavior, and the fact that no service, deployment, or
live host was changed. Do not deploy, merge, or restart `agentic-remote.service`.
