# Oracle Dreamer

Tracks #468. This is a new first slice on current main, not a continuation of
an unpushed research branch. PR #434 remains an independent, unmerged
lifecycle-inbox proposal. Dreamer borrows its serialized durable admission,
generation fencing and explicit failure concepts, not its event producer or
an OpenClaw runtime.

## Scope and phases

1. **Foundation: metadata-only morning review.** Opt-in settings, explicit IANA
   timezone, fixed 02:00 schedule, durable daily run/lease and deterministic
   local prioritization. Persist a bounded plan with stable IDs. In Oracle,
   review priority order, move items up/down, skip, mark memory/carried review
   items done, or restore. These actions change only the plan, never the source
   session/task/memory.
2. **Trusted completion adapter.** For a session item only, passively read its
   owning session and propose completion from a successful root
   `task_complete` result carrying the server's trusted marker. Explicit
   confirmation revalidates the exact message and stores bounded provenance.
   This does not mutate the source session or create a general transcript
   planning input.
3. **Authoritative source adapters.** Add a durable todo API with completion,
   due date, scope and revision; define owner metadata replay for offline and
   closed sessions. Then collect these sources with bounded cancellable reads,
   visible per-source completeness and scope isolation.
4. **Semantic planning, separately approved.** Explicitly opt into bounded
   redacted summaries, provider egress and spend ceilings; use a read-only
   capability with schema-validated proposals. No planner tool may send
   prompts, answer permissions, create/delete/modify sessions or memory.
5. **Presentation refinements.** Optional morning delivery after quiet hours
   through the existing notification policy/outbox; no 02:00 push or speech.
   Do not add a second notification/control plane.

Current repository sources do not support claiming a full semantic review of
all sessions and durable todos. The journal registry holds observed session
metadata, including stale/offline observations and retained tombstones, not
every historical transcript. BackgroundTaskTracker is in-memory, not a durable
todo store. Structured memory has no todo kind. The UI must name these limits.

## Safety and privacy

No model calls, embeddings, general transcript/prompt reads, directory walks,
external services, task/session mutations, automatic execution or new memory authority.
Use only identity/status/update metadata and structured-memory identity/kind/
scope/authority/validity metadata. Never persist or render source titles,
canonical keys, paths, prompts, task descriptions or memory content in a plan.
Use generic evidence-based labels plus opaque source IDs.

Respect structured-memory mode: off/shadow must not expose record contents or
turn shadow retrieval into visible memory authority. Use active on-mode records
only, excluding forgotten, superseded, low-confidence, not-yet-valid and expired
records. The planner need not parse any text to prioritize. All metadata is data,
not instructions. Source IDs must be bounded and encoded, never executable URLs.
The structured-memory store projects metadata before it leaves the store;
Dreamer does not obtain a full memory snapshot and redact it afterwards.

The narrow completion adapter is the sole content-read exception: it reads the
exact owning session through remote-aware routing, accepts only a successful
root `task_complete` marker projected by the server, and returns a bounded
transient summary plus SHA-256 digest. Plain assistant text, background-agent
results, failed tools and stale UI state are not completion evidence. Result
text is never persisted in Dreamer state.

Single trusted hub owner and single process writer; this does not add hostile
multi-user isolation. APIs inherit hub Host/Origin checks and no-store responses;
no node endpoints or tools expose Dreamer mutations. Unsupported storage or
corruption disables Dreamer alone and reports an explicit safe error.

## Schedule and run lifecycle

- Disabled by default. Saving enablement requires a valid explicit IANA timezone;
  show the saved zone, never silently follow browser travel or host TZ changes.
- Fixed 02:00 local calendar time; evaluate on a coarse unref timer only while
  enabled, and immediately on startup/enablement. No model heartbeat.
- Spring-forward missing 02:00 runs at the first valid later local minute.
  Fall-back repeated 02:00 produces one run for the date.
- Startup catch-up is limited to the current local date, between 02:00 and
  08:00; do not replay past dates. Show missed/unavailable status rather than
  invent yesterday's review. Each plan is dated for the morning after its run,
  i.e. that run's local calendar date.
- Durable key is hub-owned and includes timezone/local date, not wall-clock
  titles, process identity or random event timestamps. Retained high-water
  fences prevent replay when old plans are pruned or the clock goes backward.
- Claim a durable lease before collection. Use a unique claim token, settings
  generation and expiry (10 minutes). At most one process-local worker; stale
  completions cannot publish after disable, settings change, expiry or reclaim.
  One committed plan per key. Failed/expired attempts retry at most three times
  within the window; failure is visible. No busy retry loop.
- Disabling cancels future scheduling and fences in-flight publication.
  The previous plan remains available to review. Stop clears the timer and
  invalidates pending completion before shutdown returns.

## Plans and user review

Local priority: unresolved session errors first, waiting sessions second,
other open/active sessions next, then active memory review candidates.
Tie-break on stable source identity. Exclude removed/replaced/closed registry
entries from current-session suggestions. Metadata is not evidence that work
succeeded. Unfinished Dreamer plan items can be carried as this feature's own
durable review todos, with stable IDs and preserved status/order; they are not
provider tasks. Done/skip items do not spontaneously reappear on the next day
for an unchanged source fingerprint. Changed source evidence may create a new
review candidate.

Keep at most 20 plan items and 35 daily run records with bounded state
(at most 1 MiB); expose omitted counts, unavailable sources and stale metadata.
Pruning cannot evict pending review items or the idempotency fences silently.
If bounds are reached, refuse with an explicit capacity status. Store settings,
claim, plan and edits in one private versioned atomic snapshot. Serialize
candidate commits, sync staged data and directory entries before publication.
Refuse malformed, foreign, oversized, symlinked state and stale edits rather than
resetting. Clean recognized abandoned staging files without touching unrelated
files; failures remain visible. New directories must be durably/private created.
Retain at most 16 timezone fences; refuse admission to a new timezone at that
bound without preventing disable or a switch to an already known timezone.
Prune run records only when their replay authority is covered by a fence.

Morning writes carry snapshot revision plus run/item IDs; reject concurrent
stale reorder/status requests with 409 and refresh. Reorder requires the exact
item set, not a lossy filtered subset. For memory and carried items, Done means
"done in this plan", not completion of linked work. Session items do not expose
generic Done: **Review completion** is available only for transient trusted
evidence, and **Confirm completed** revalidates it before persisting
computer/session/message/tool IDs, digest, completion time and confirmation
time. The same item/evidence pair is idempotent. Display failures, empty results, off mode and
metadata-only coverage explicitly. No overnight notification; ordinary morning
opening of Oracle reads the persisted plan, not triggers a hidden model turn.

## API contract

Shared types live in `shared/dreamer.ts`:

- `DreamerSnapshot`: `revision`, `settings: { enabled, timeZone }`,
  optional `plan`, optional safe `lastError`, and `available` boolean.
- `DreamerPlan`: `id`, `localDate`, `timeZone`, `createdAt`, ordered `items`,
  `coverage: string[]`, `omitted: number`.
- `DreamerPlanItem`: `id`, `label`, `reason`, `status: pending|skipped|done`,
  `source: session|memory|carry`, optional `computerId`, `sessionId`,
  `memoryId`, transient `completionCandidate`, and persisted metadata-only
  `completion`. Labels/reasons are generic server-authored text only.

Routes (JSON snapshot responses, no envelope):

```text
GET /api/manager/dreamer
PUT /api/manager/dreamer/settings
  { revision, enabled, timeZone }
PUT /api/manager/dreamer/plan
  { revision, planId, exactly one of:
    order: string[]
    item: { id, status }
    completion: { itemId, messageId, resultDigest }
  }
```

No manual run endpoint, task mutations, force-unlock or model tool. All invalid
inputs reject with 400; absent/unavailable subsystem 503; stale revisions,
plan IDs or item references 409. Errors never echo sensitive field values.

## Acceptance evidence

Fake-clock tests cover UTC/non-hour offsets, invalid zones, spring gap/fall
overlap, 02:00 boundaries, catch-up expiry, restart/reclaim, duplicate ticks,
lease expiry, disable/stop races and timezone changes. Real-filesystem tests
cover private durable commits, corruption refusal, capacity and failed write
rollback; concurrent initialization and edits cannot lose state.

Planner tests use synthetic secret-bearing titles/prompts/memory values and
prove no text is collected or persisted, zero source mutations/model calls,
correct tombstone/expiry/mode filters, deterministic order/IDs, visible coverage
and bounded overflow. Route tests exercise settings persistence, daily publication,
reorder/skip/review-state done, verified completion, idempotency, malformed or
mixed mutations, and stale-edit rejection. UI tests exercise
enable/disable/timezone errors, plan ordering, skip/done/restore, explicit
completion confirmation, error recovery, empty state and unchanged-source-state
wording.

## Exact follow-ups before claiming the complete requested feature

1. Define and implement hub-readable durable todo metadata with source revision
   and explicit user-owned completion; integrate only after read-only tests.
2. Add bounded authoritative open/history metadata collection with per-computer
   freshness/offline statuses; never interpret cached absence as deletion.
3. Add source-linked review detail using on-demand scope-checked reads and
   deterministic redaction, honoring correction/forgetting in derived plans.
4. Only then consider semantic provider planning with explicit egress consent,
   per-run token/spend limits, cancellation and no execution tools.
5. Add optional morning notifications using existing quiet-hours/preferences
   and durable receipt semantics; do not notify at the scheduled 02:00 run.
