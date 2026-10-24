# Copilot SDK Restart Recovery

Status: Proposed for review

## Goal

Agentic Remote must recover the durable part of a Copilot SDK-backed session
after its service process restarts without replaying an uncertain turn,
discarding queued work, or presenting a new provider runtime as uninterrupted
stream continuity.

This design covers normal SDK sessions. Tmux sessions keep their existing
process-preserving recovery. Oracle keeps its separate SDK identity, queue,
generation, and bounded uncertainty retry; no Oracle UX, voice, memory,
OpenClaw, or Tidbyt behavior changes.

## Verified Provider Boundary

The locked dependency is `@github/copilot-sdk` 1.0.22 with bundled Copilot CLI
1.0.98. The current npm release inspected for comparison is SDK 1.0.26 with
bundled CLI 1.0.103.

Both versions expose:

- durable provider session IDs;
- `listSessions`, `resumeSession`, and `getEvents`;
- `disconnect`, `abort`, and `deleteSession`;
- `ResumeSessionConfig.continuePendingWork`;
- experimental `permissions.pendingRequests()` and
  `permissions.handlePendingPermissionRequest()`;
- equivalent low-level recovery for externally registered tools.

They do not expose a supported way for a new Agentic Remote process to connect
to the SDK child owned by the old process. `client.stop()` shuts that child
down. Experimental attach operations attach only inside an already-running SDK
runtime.

User-input and elicitation requested/completed events are explicitly ephemeral
in the generated SDK contract. They are not a durable callback registry.

Controlled probes used isolated temporary Copilot homes and did not touch the
Agentic Remote service or live session store:

| Scenario | Measured result |
| --- | --- |
| Normal stop during permission | Resume did not re-emit the permission |
| Explicit SDK suspend during permission | The request was completed before shutdown and was not available for a user response |
| Abrupt owner loss during permission | The event log retained the unresolved request, but the high-level callback was not re-emitted |
| Low-level permission recovery | The exact request was listed and answered; the original turn completed with one durable user message |
| Abrupt owner loss during `ask_user` | No durable request ID remained and resume did not recreate the callback |
| Abrupt owner loss during model generation | History resumed, but streaming did not resume and the turn did not complete |

The design therefore distinguishes durable conversation recovery from live
stream recovery.

## Current Failure

`AgentService` owns the SDK client process, `CopilotSession` objects, event
subscriptions, active turn promises, permission resolvers, question resolvers,
and stream trackers in memory. Shutdown resolves pending callbacks as
unavailable or cancelled, disconnects sessions, and stops the client runtime.

`SessionStore.initialize()` retains managed records and durable queues, marks
formerly active SDK sessions interrupted, and marks SDK callbacks stale. Idle
SDK sessions can later resume under the same provider ID, while startup
proactively recovers only tmux owners.

That behavior is safe against duplicate prompt delivery, but it leaves
recoverable provider outcomes and pending permissions behind an unconditional
manual recovery boundary.

## Decisions

1. **Keep the in-process SDK runtime.** A separate worker is not justified
   while the provider cannot reconnect a lost worker or host process anyway.
2. **Resume only the same provider identity.** A populated session is never
   recreated if provider state is missing.
3. **Keep `interruption` as the durable write fence.** Optional recovery
   metadata refines the visible state without weakening older releases.
4. **Fence every SDK owner by generation.** A callback or reconciliation from
   an older owner cannot mutate the replacement owner.
5. **Reconcile provider facts before accepting new work.** Queues remain FIFO
   and blocked during recovery.
6. **Recover permissions only from the provider's pending-request RPC.** A
   persisted card alone does not prove that a provider callback still exists.
7. **Never replay a model prompt or transient callback automatically.** An
   uncertain active turn or question remains an explicit interruption.
8. **Persist accepted replies before provider delivery.** Recovery either
   completes a still-pending durable permission response or presents a
   delivery-uncertain answer; it never sends a transient answer twice.
9. **Do not store credentials or provider runtime files.** Recovery uses the
   existing Copilot home and authentication.

## Persisted State

The state file remains version 1 and gains optional private fields:

```ts
interface SdkRestartRecovery {
  generation: number
  state: 'pending' | 'recovering' | 'waiting-permission' | 'interrupted' | 'failed'
  detectedAt: string
  previousStatus: SessionStatus
  providerRequestId?: string
  message?: string
}

interface SdkAcceptedReply {
  generation: number
  requestId: string
  kind: 'permission' | 'user-input' | 'elicitation'
  acceptedAt: string
  optionId?: string
  input?: UserInputReplyInput
}
```

`providerRequestId` is private. The browser continues to use Agentic Remote's
opaque request ID. `SdkAcceptedReply` contains no token or runtime state; it is
the exact user decision that Agentic Remote had already accepted.

The public session contract gains:

```ts
interface SessionRestartRecovery {
  state: 'recovering' | 'waiting-permission' | 'interrupted' | 'failed'
  detectedAt: string
  message?: string
}
```

The generation and provider request ID stay server-private.

## State Machine

Startup normalizes an SDK recovery left in `recovering` to `pending`. A new
claim increments `generation`, writes `recovering`, and owns that generation
until it reaches a stable result.

```text
active process lost
        |
        v
     pending
        |
        v
    recovering
      /  |  \
     /   |   \
ready  waiting-permission  interrupted
                          \ failed
```

- `ready`: provider events prove the prior turn is terminal and no durable
  request is pending. Transcript is reconciled, recovery metadata and
  interruption are cleared, and the session becomes idle.
- `waiting-permission`: exactly one provider permission is pending. The session
  remains fenced from prompts but accepts that permission response.
- `interrupted`: provider history exists, but an active model turn or transient
  interaction has no resumable callback.
- `failed`: provider state is missing, corrupt, or recovery RPCs failed.

A process crash while `recovering` leaves a reclaimable record. The next
process increments the generation. Every event handler, transcript write,
reply, cancellation, and recovery completion compares the captured generation
with the current durable value and confirms that the same SDK session object is
still installed.

Within one process, `loadingSessions`, lifecycle serialization, and a
`sdkRecoveryRuns` map coalesce duplicate startup attempts. Across processes,
the durable generation makes the former owner stale.

## Startup Algorithm

After SDK startup and provider discovery, before SDK queue drainage:

1. Select open, managed, SDK-backed, non-suspended sessions with
   `interruption` and no terminal owner.
2. Claim each candidate through session admission and lifecycle serialization.
3. Resume the same provider ID with `suppressResumeEvent: true` and
   `continuePendingWork: true`.
4. Subscribe with the claimed generation before reading provider state.
5. Read durable events and `permissions.pendingRequests()`.
6. Reconcile transcript history through the existing transcript epoch guard.
7. Classify the result:
   - a pending permission becomes a live recovered card;
   - a terminal foreground event becomes `ready`;
   - an open foreground turn, stale question, or stale elicitation remains
     `interrupted`;
   - missing/corrupt state or RPC failure becomes `failed`.
8. Drain the SDK queue only after recovery reaches `ready`.

An empty session whose provider state is missing may retain the existing
same-ID empty fallback because it has no conversation context to misrepresent.
A populated session fails closed.

## Permission Recovery

The pending-permission RPC is canonical. Agentic Remote converts its prompt
shape into the existing title and two options, persists the provider request ID
privately, clears `stale`, and publishes `waiting-permission`.

Reply handling:

1. Validate the public request ID and recovery generation.
2. Persist `SdkAcceptedReply`.
3. Call `handlePendingPermissionRequest()` with the private provider request ID
   and either interactive `approve-once` or `reject`.
4. Re-read pending requests and durable events.
5. If the request is gone, clear the card and accepted reply, then either
   reconcile a completed turn or leave the session `recovering`.
6. If the RPC reports the request was already resolved, reconcile rather than
   issuing another decision.

This route is idempotent because the provider request ID identifies one
request and the pending list establishes whether delivery remains possible.

## Questions, Elicitations, and Accepted Answers

Pending question and elicitation cards survive as stale evidence. Their SDK
events are ephemeral, and the high-level handler does not expose a recoverable
provider request ID. Agentic Remote must not claim those callbacks survived.

An accepted answer is written before its in-memory resolver is called. If the
service restarts before the normal settlement write:

- the original card remains visible;
- the accepted values remain durable;
- recovery labels delivery as uncertain;
- the old callback is never invoked or recreated;
- continuing uses the existing explicit conversation-recovery boundary or a
  new user turn.

The accepted answer is not automatically inserted into the provider
conversation. That would be indistinguishable from duplicate delivery.

## Ordering, Cancellation, and Queues

- Existing SDK admissions and delivery receipts remain authoritative.
- A queue does not drain while `interruption` or restart recovery exists.
- Recovery never reconstructs or resends the active user prompt.
- Queued prompts retain their IDs and FIFO order.
- Cancellation captures the current generation and SDK owner; a late
  cancellation cannot abort the replacement owner.
- A recovered permission response settles before queue drainage.
- Drafts remain browser-owned under the unchanged Agentic session ID.
- Upload ownership and recovery briefs retain their current ordering.

## User-visible Behavior

New clients map public recovery metadata to:

- `Recovering`: provider history is being reconciled;
- `Permission`: a recovered provider permission can be answered;
- `Interrupted`: history is retained, queued work was not sent, and live
  continuity could not be restored;
- `Recovery failed`: provider identity could not be resumed.

Older clients continue to see the existing `interruption` and read-only error
state. Copy must say that partial history may be retained and that queued work
was not replayed. It must not say that a model stream resumed.

## Oracle

Oracle is not stored in `SessionStore` and remains on its existing dedicated
runtime. Its durable SDK session ID, message queue, generation, context
builder, and single uncertainty retry already form an explicit recovery
boundary. Tests must prove this change does not alter that behavior.

No shared normal-session permission recovery is installed in Oracle, and no
Oracle UX, prompt, voice, memory, OpenClaw, or Tidbyt code changes are in scope.

## Testing

Focused tests must cover:

1. idle same-ID restart;
2. a completed turn reconciled after ownership loss;
3. crash during an open model turn;
4. pending permission reconstructed and answered;
5. unsupported or missing resume;
6. duplicate startup recovery coalescing;
7. queue blocking and FIFO after successful recovery;
8. pending question and elicitation remaining stale;
9. accepted-answer durability without replay;
10. cancellation against a stale generation;
11. stale events and writes rejected after owner replacement;
12. Recovering, Permission, Interrupted, and failed presentation;
13. Oracle restart behavior unchanged.

The final gate is targeted recovery tests, the isolated SDK permission probe,
`pnpm check`, `NODE_ENV=production pnpm check`, and Graphify freshness. No live
service restart or deployment is part of implementation validation.

## Migration, Rollback, and Operations

No destructive migration is required. Optional version-1 fields are validated
when present. Startup converts an abandoned `recovering` record into a new
generation rather than leaving it stuck.

An older release ignores the private fields and still respects `interruption`,
stale cards, and queue barriers. Rolling back can make a recovered permission
card stale again, but it cannot replay the current turn or discard its queue.

After explicit code review, rollout must use the normal development-first
promotion policy. Development must prove service health, computer
connectivity, retained sessions, same-ID recovery, permission recovery, and
queue order before production receives the exact reviewed commit. Production
verification failure requires rollback.

## What Remains Impossible

Without additional SDK support, Agentic Remote cannot:

- reconnect a new process to the terminated SDK child;
- recover missed streaming deltas;
- resume an in-flight model generation;
- recreate transient user-input or elicitation callbacks;
- guarantee exactly-once external side effects that completed without a
  durable provider completion event.

A separately supervised SDK worker could preserve streams across a web-service
restart, but not across worker or host loss. It would require a durable RPC
protocol, ownership leases, independent health supervision, coordinated
upgrades, and another rollback boundary. That complexity is deferred unless
uninterrupted live streams become a product requirement.
