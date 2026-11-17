# Scheduler

Status: shared contracts, pure recurrence, durable storage, hub dispatcher, policy-explicit session runner, HTTP/event contracts, Oracle proposal tools, confirmation cards and canonical notifications. The hub constructs the store, runner and dispatcher only with `AGENTIC_REMOTE_FEATURE_SCHEDULER=on` (default off). Nodes never construct or dispatch schedules. The schedule editor remains separate work. Dreamer's existing schedule is unchanged.

## Schema

`shared/schedules.ts` exports strict zod schemas and inferred `Schedule`, `ScheduleTarget`, `ScheduleRecurrence`, `ScheduleRun`, and `ScheduleRunStatus` types.

- A schedule has an ID, name (1–200 characters), exact prompt text (1–20,000 characters, not blank), target, workspace, recurrence, timezone, catch-up/overlap/notification policies, 5–480-minute runtime limit, enabled/archive state, creator, positive revision, and creation/update timestamps. Non-archived names are unique case-insensitively.
- Targets use the existing providers (`copilot`, `claude`), efforts, context tiers (`default`, `long_context`), and modes. Mode defaults to `autopilot`. Permission policy and folder trust independently default to `ask`; neither an Oracle creator nor a worktree changes these defaults. The owner validates the folder against its existing allowed roots. Optional `target.worktreeRoot` selects one of that computer's explicitly configured worktree roots.
- The default timezone is `America/Los_Angeles`. Validation uses `Intl.DateTimeFormat` and rejects numeric UTC offsets; supported IANA identifiers, aliases, and `UTC` are accepted. Timestamps are ISO strings with an explicit UTC or numeric offset.
- A run has its own ID, schedule ID, occurrence timestamp, trigger, lifecycle status, launch ID, computer ID, and optional creation time, offline retry deadline, accepted root-prompt receipt, session ID, start/end timestamps, summary, and error. The existing `rootPromptReceipt` remains an opaque prompt ID; additive `rootPromptAcceptance` retains the full identified acceptance/outcome receipt. Optional `worktree` records ownership and cleanup state. Older rows without these fields still load. A pending launch need not yet have a receipt or session ID.

Launch IDs and accepted root-prompt receipt IDs reuse the launch API's opaque token schema: 1–128 characters, starting with an ASCII letter or digit and containing only letters, digits, `.`, `_`, `:`, or `-`. Identity bytes are never trimmed.

## Recurrence semantics

`nextOccurrences(recurrence, timezone, after, count)` returns strictly increasing `Date` values strictly after `after`. `occurrencesBetween(recurrence, timezone, from, to, cap = 1000)` uses `[from, to)` and returns the earliest occurrences up to the cap. Equal endpoints and zero limits return no occurrences; reversed intervals, invalid clocks/timezones, malformed recurrence, and negative or fractional limits are errors. These functions only calculate: they do not enforce creation-time policy or mutate inputs.

Recurrence uses the `type` discriminator:

| Type | Fields and meaning |
| --- | --- |
| `once` | `at`: one absolute ISO timestamp; retained historical occurrences are representable |
| `hourly` | `everyHours`: positive, whole-minute interval up to 24 hours; optional `windowStart`/`windowEnd` in local `HH:mm` |
| `daily` | `time`: local `HH:mm` |
| `weekdays` | `time`: Monday through Friday |
| `weekly` | `days`: nonempty unique day numbers, Sunday = 0 through Saturday = 6; `time` |
| `cron` | `expression`: exactly five fields, minute/hour/day-of-month/month/day-of-week |

Hourly windows start inclusively and end exclusively, anchored anew at each local window start. Omitted endpoints mean `00:00` and `24:00`; an earlier end crosses midnight and equal endpoints mean a full day. `24:00` is allowed only as a window end. Intervals need not divide the window or the day; they reset at the next window start, not after a fixed UTC duration. Whole-minute fractional hours such as 4.1 hours (246 minutes) tolerate floating-point rounding; expansion uses integer minutes.

The dependency graph has no cron parser. The MIT `cron-parser` package was evaluated, but its runtime dependency on Luxon conflicts with this layer's Intl-only timezone requirement. The small shared parser adds no dependency and supports numeric values, comma lists, ascending ranges, positive steps, case-insensitive `JAN`–`DEC`/`SUN`–`SAT`, and Sunday as 0 or 7. A single value with a step extends through that field's maximum. There is no seconds field, command suffix, macro, `L`, `W`, `#`, or `?` syntax. Both restricted day fields use DOM/DOW **OR** semantics, including stepped day fields such as `*/2`; only a bare `*` is unrestricted and requires both fields to match. Invalid calendar dates are skipped, not clamped: the 31st skips short months and February 29 skips non-leap years. A recurrence with no matching date in a complete 400-year Gregorian cycle produces no occurrences and fails creation validation.

## DST policy

Timezone conversion uses only Gregorian `Date` arithmetic and `Intl.DateTimeFormat`, not the host timezone or a timezone package.

- Missing wall times shift forward by the size of the gap, preserving their position within it: Los Angeles `2026-03-08 02:30` becomes `03:30`, not `03:00`.
- Ambiguous wall times use the **first** instant: Los Angeles `2026-11-01 01:30` uses PDT, never the second PST occurrence. Querying between the two instants does not resurrect the second one.
- All recurrence types use the same policy. Shifted times are sorted by actual instant; coincident shifted and ordinary times coalesce. An hourly schedule therefore fires once at spring-forward `03:00`, and skips the repeated fall-back hour.
- Non-hour transitions and skipped calendar days follow the same rules. Offset candidates are sampled on both sides of each local date, so half-hour DST and a full-day date-line change are not treated as one-hour shifts.

## Minimum spacing and creation validation

`validateRecurrence(recurrence, timezone = 'America/Los_Angeles', now = new Date())` returns `{ valid, errors }`. Pass an explicit clock for deterministic creation validation. One-off timestamps at or before that clock are invalid for creation, but remain valid stored data.

Recurring schedules require at least **15 minutes between distinct instants**. Validation checks within-day and cross-midnight spacing over the complete Gregorian weekday/date cycle, including DOM/DOW semantics. For multi-occurrence days it also checks actual instants near timezone transitions over the next 400 calendar years according to the host's Intl timezone data; a nominally safe interval cannot become too short at spring-forward. Offset-transition discovery samples UTC days, and conversion samples offsets every 12 hours around a date. Cached formatters and transition calendars are bounded. Timezone rule updates take effect with the runtime's timezone data.

## Durable hub store

`SchedulerStore` writes `<data directory>/scheduler/state.json`. It uses the application's resolved data directory, not a second home-directory lookup. The real directory is owner-only (0700), and state/staging files are owner-only (0600), with owner and symlink checks. A commit writes an exclusive staging file, syncs it, atomically replaces the state, and syncs the directory before publishing a change. Writes are serialized. A post-replace durability failure poisons the writer until restart rather than permitting a second interpretation of an uncertain commit.

The single transaction holds schedules, runs, the `(scheduleId, occurrenceAt) → runId` index, due cursors, and an immutable schedule definition for each retained run. Editing a target or prompt cannot retarget already accepted work. Every mutation checks the submitted schedule revision; conflicts return 409 without a partial update. Names are unique among non-archived schedules, including when restoring an archive. Archive disables recurrence; unarchive stays disabled. Delete requires archive, revision agreement, and no in-flight runs.

Retain at most 200 runs per schedule, newest first in API pages. Evict the oldest terminal row first; never discard an in-flight run or free its slot for retention. If all 200 rows are live or pending, admission returns 409 until work settles. Identity-only occurrence tombstones outlive visible history; due cursors also fence already evaluated time. Delete explicitly removes that schedule's rows, snapshots, cursor, and tombstones. Storage has a 64 MiB safety ceiling; reaching it refuses a write without evicting an identity fence.

Malformed JSON, invalid schema, and inconsistent identities quarantine the complete state as `state.json.corrupt-<uuid>`, log one warning during initialization, and start empty. A repeated initialize/restart does not warn again about the quarantined file. Permission, ownership, or symlink failures fail closed rather than treating an inaccessible file as empty. Abandoned exclusive staging files are removed at startup.

## Hub dispatcher and launcher seam

The `scheduler.start` startup phase initializes storage and reconciles **every** in-flight intent (`pending`, `launching`, `running`, `needs-input`, `stopping`) before evaluating due work. The dispatcher then uses a non-overlapping timer at the next due instant or within 30 seconds. Shutdown stops the timer and joins durable operations; unresolved external calls remain durably reserved for restart, without cancelling sessions as a side effect of hub shutdown.

The runner implements `ScheduleLauncher`:

- `launch(run, schedule): Promise<void>` receives the persisted run identity and its accepted schedule snapshot. Successful return alone does not establish completion or even prompt acceptance.
- `reconcile(run): Promise<ScheduleReconciliation>` returns `absent`, `unknown`, `launching`, `running`, `needs-input`, `stopping`, or `terminated`, with optional session ID, accepted root-prompt receipt, outcome, and display details. `absent` authoritatively proves no accepted or in-progress launch; a missing session entry while creation may still be in transit, an offline target, or a failed lookup is `unknown`. `terminated` proves foreground, queued, and provider-owned background quiescence; a terminal outcome alone or session idleness is insufficient.
- `stop(run): Promise<ScheduleStopAcknowledgement>` returns `stopped` only after authoritative termination proof, or `unknown`. A signal-only abort is not proof.

Authoritative `absent` reconciliation also settles a `stopping` run as `stopped`, releasing its slot and allowing deletion. Absence cannot settle an unresolved in-process launch call: a request still in transit could yet create work.

Admission atomically saves the run as `pending`, its fresh launch ID, and its occurrence fence. A second durable write moves it to `launching` **before** calling the launcher. Calls are asynchronous, so an unresolved response cannot block the other global slot or subsequent reconciliation. The default global limit is two; `launching`, `running`, `needs-input`, and `stopping` all hold slots.

On restart an authoritative absent lookup permits a still-`pending` intent to proceed. An already-`launching` absent intent becomes `interrupted`, never relaunched. An unknown lookup retains an already-held slot; reconcile errors are unknown, not absent. A pending intent without positive launch evidence (an owning session, accepted root receipt, or affirmative launch state) stays pending and retryable after unknown/no-op results. Its persisted `retryUntil` still applies, after which it becomes `missed` without holding a slot. Only `ScheduleTargetUnavailableError`, a definitive refusal **before any side effect**, permits returning an attempted launch to pending with the same identity. Other exceptions and lost responses after the durable launch boundary are reconciled, never automatically resubmitted. The no-op runner refuses launches definitively, but cannot claim authority to reconcile or stop old work.

Policies:

- **Catch-up:** occurrences more than ten minutes late are `missed` with `skip`; `once` collapses a missed range and any recent due occurrence into one `catch-up` run at the latest due instant. Exactly ten minutes is still eligible. The same cursor-based calculation runs after startup, sleep, and forward clock jumps. Backward jumps never reopen evaluated time. Only the newest 200 missed rows need materializing when a longer range would immediately be evicted.
- **Overlap:** `skip` records the new run as missed; `queue` keeps it pending FIFO; `replace` stops older pending intents without launching them, moves existing live work to `stopping`, and waits for authoritative termination before the replacement can launch. FIFO follows persisted admission order across restart and target edits: an earlier pending run blocks later runs of the same schedule even when its computer is offline or retrying. Pending runs still hold no global concurrency slot, and their existing retry/missed-window rules are unchanged; unrelated schedules can proceed.
- **Runtime:** the accepted definition's `maxRuntimeMin` moves live work to `stopping`. Offline targets and unknown stop acknowledgements retain the slot until stop/reconcile proves termination. A launch still awaiting its response cannot accept premature negative lookup/stop proof; once reconciliation binds a session, the runner's durable admission fence protects cancellation from late prompt delivery.
- **Offline launch:** retry a pending occurrence until ten minutes after its occurrence. Manual and catch-up runs use their admission time instead. Persist the deadline so a target returning after expiry cannot launch stale work. Queue/concurrency waiting alone does not consume an offline retry window.
- **Enable/archive:** disabling stops future recurrence, not accepted work; manual Run now is allowed while disabled. Archive prevents new/manual work and stops never-launched pending intents, without implicitly cancelling live sessions. The pending-to-launching transition checks archive state inside the same serialized store commit queue: an archive ordered first prevents launch; an already committed launch boundary remains in flight.

## Hub API and events

All routes below inherit the hub's canonical Host/Origin checks, including escaped `/api` path segments. Reads send `Cache-Control: no-store`. With the flag off, routes return 404 and no store, timer, service, or startup phase is constructed.

| Method | Route | Request / response |
| --- | --- | --- |
| GET | `/api/schedules` | Optional `archived=true/false`; `{ schedules }` |
| POST | `/api/schedules` | `scheduleCreateSchema`; 201 `{ schedule }` |
| GET | `/api/schedules/:id` | `{ schedule }` |
| PATCH | `/api/schedules/:id` | Partial mutable fields plus `revision`; `{ schedule }` |
| DELETE | `/api/schedules/:id` | `{ revision }`; archived/resolved only; `{ ok: true }` |
| POST | `/api/schedules/:id/enabled` | `{ revision, enabled }`; `{ schedule }` |
| POST | `/api/schedules/:id/archived` | `{ revision, archived }`; `{ schedule }` |
| POST | `/api/schedules/:id/run` | Empty body; 202 `{ run }`, with manual trigger and normal overlap/concurrency |
| GET | `/api/schedules/:id/runs` | Per-schedule run page |
| GET | `/api/schedules/runs` | Global run page |
| GET | `/api/schedules/runs/:id` | `{ run }` |
| POST | `/api/schedules/runs/:id/stop` | Empty body; `{ run }`, possibly still `stopping` |

Run pages accept `offset` (0–1,000,000), `limit` (1–200, default 50), and an optional lifecycle `status`, returning `{ runs, total, nextOffset }`. HTTP creation labels the creator as `user`; caller-supplied identity, revision, archive state, timestamps, or Oracle attribution are rejected. Defaults are checkout, skip catch-up/overlap, 60-minute runtime, attention notifications, enabled, and the shared target/timezone defaults. Updates never apply creation defaults to omitted fields.

Manual triggers use unique sub-millisecond occurrence strings so simultaneous clicks do not coalesce with one another or a recurrence's millisecond-canonical key. Each accepted run has a distinct durable launch identity.

After a committed visible mutation the hub event socket broadcasts typed `{ type: 'schedules.changed', revision, scheduleId, runId? }`. The revision is the store's monotonic invalidation revision, distinct from a schedule's optimistic-concurrency revision; clients should refresh authoritative reads. Fictional schedule/run fixtures mock every route and the event contract while keeping the feature off unless explicitly supplied.

## Session runner

`SessionScheduleLauncher` uses the policy-neutral `SessionLauncher` over `ComputerManager`, for both hub-local and paired-node sessions. It creates an SDK session with the run's `launchId`, the schedule's exact provider/model/effort/context/mode, explicit permission and folder-trust policies, and a title `⏱ <name> · <occurrence date/time and timezone>`. Names are sanitized and shortened to the normal session rename limit. It never uses Oracle defaults or retries an uncertain session creation.

An explicitly selected model and its requested effort/context are checked against the owning computer's runtime catalog before workspace allocation or session creation. Long context requires an explicitly selected supporting model; Claude's automatic default context never silently satisfies a long-context request. Runtime capability validation remains launch-time because the durable schedule store has no live provider dependency.

Runtime-model discovery can refresh again inside owner-side creation. Catalog transport failures, timeouts, and 5xx responses remain retryable within the offline window when the owner proves that no launch began; only definitive configuration refusals fail the run. Lost or uncertain creation responses still require reconciliation and never authorize a blind retry.

Catalog lookup and selection validation are distinct prelaunch steps. Failed lookups without a definitive owner rejection, including local SDK errors, timeouts and throttling, retry for both local and paired targets. A completed catalog that does not offer the requested model, effort or context is a definitive refusal with its selection reason preserved; explicit owner 4xx refusals fail as well, except retryable timeout/rate-limit responses. Catalog retries keep the original launch identity and offline deadline and do not accept a session or prompt.

The existing manager registry adds the additive `schedule` origin, plus schedule/run references. This is the authority for provenance, not a second UI-only origin field. Existing `manager`, `user`, and `discovered` records retain their meaning without a destructive migration. Schedule provenance is committed before prompt delivery, restored by launch reconciliation, and follows session replacement. Schedule-created sessions are not Oracle-owned: autonomous close continues to require exactly `manager`, the journal refuses to adopt a `schedule` session, and proactive observations do not make scheduled work Oracle work. The registry remains available with Oracle disabled; scheduler-only initialization is logged under `scheduler.provenance`. Provenance storage is owner-only.

The prompt is delivered through the durable queue with `deliveryId = launchId + ':root'`; the accepted receipt is persisted on the run. Reconciliation queries the owning computer's `reconcileLaunch(launchId)` and reads the bound session passively. A positive launch binding without a receipt can finish idempotent root acceptance after a creation-only crash, but never create another session. A root already recorded as accepted by the hub is never resubmitted if its owner receipt disappears. A negative query for an already-launching run stays unknown because creation may still be in transit; only an unlaunched pending intent is absent. Deleted sessions without termination proof, offline queries, and mismatched root/session evidence remain unknown. A never-launched pending intent targeting a computer without launch capability fails explicitly; previously launched work retains its slot on a capability downgrade.

Idle alone, another root's completion, and unknown outcomes never complete a run. Only the exact accepted root's terminal receipt, with no pending foreground/queue/recovery work and authoritative empty provider-owned background membership, permits success/failure/stopped. Providers unable to enumerate background work retain their slot; current Claude adapters therefore cannot prove full quiescence even after a root result. A pending permission or question becomes `needs-input` without being answered automatically, including before root acceptance. The last non-streaming assistant excerpt is display-only, bounded to 280 characters; it never completes an Oracle task.

Max-runtime and replacement cancellation use `cancelWithAck`, never signal-only `cancel`. Unknown/offline acknowledgements leave the run `stopping` and keep its slot. A stopped acknowledgement is bound to the owning session before releasing capacity. A launch fenced for stopping is never sent a late root.

## Owned worktrees

Each executing computer independently configures `AGENTIC_REMOTE_SCHEDULE_WORKTREE_ROOTS`, a comma-separated list of existing absolute real directories. There is no implicit root, no automatic root creation, and no expansion of `AGENTIC_REMOTE_ALLOWED_ROOTS`. Every configured root and source repository must also pass the existing session-directory authorization. Setup/update preserve the worktree-root variable. `target.worktreeRoot`, when supplied, must resolve to one of the configured roots; otherwise the first configured root is used.

Nodes advertise `scheduleWorktrees: {version: 1, enabled}` on authenticated `/node-api/info`. `ComputerManager` routes local operations to the same owner-side service and remote operations through the authenticated node client. Missing capability fails before session creation with “Update this computer”; there is no hub-side Git fallback.

| Method | Authenticated owner route | Purpose |
| --- | --- | --- |
| POST | `/node-api/schedule-worktrees` | `{launchId, folder, root?}`; allocate/recover the launch-owned detached checkout |
| GET | `/node-api/schedule-worktrees/:launchId` | Read the durable ownership record |
| POST | `/node-api/schedule-worktrees/:launchId/cleanup` | Attempt conservative cleanup and return its recorded result |

Operations are serialized on the owner. Before `git worktree add --detach`, an owner-only atomic record reserves a deterministic child path below the allowed root. Recovery verifies launch, repository/common-Git-directory, and real root/path identities; it never adopts an unrecorded destination or recreates a removed worktree. Records live under `<data>/schedule-worktrees/` (0700 directory, 0600 files), retain removal tombstones, and use fsync plus atomic replace.

The hub persists `worktreeIntent` before allocation, so a lost response remains discoverable by launch ID even while the owner is offline. Retrying allocation is idempotent and does not create another checkout.

If a run becomes terminal without a confirmed session after allocation, the same durable transaction marks its retained worktree `deferred` for manual cleanup. This covers creation refusals, retry expiry, cancellation and archive; startup also repairs older terminal allocation records. No uncertain or potentially active checkout is removed merely because session creation did not return.

An open completed session may immediately accept user follow-up work. Its worktree is therefore retained with a durable `deferred` reason; a quiet snapshot alone never authorizes removal. Only acknowledged termination that fences future sends permits automatic cleanup, which checks `git status --porcelain --untracked-files=all --ignored --ignore-submodules=none` and `git rev-list --max-count=1 HEAD --not --remotes`. Modified, untracked, ignored, unpushed, unverifiable, or locked work is retained with a durable `deferred` reason. Missing remote refs are not evidence of a push. Removal uses ordinary `git worktree remove`, never `--force`, and never deletes ownership records. The run carries the cleanup result; an unavailable owner is also recorded as deferred when its ownership record is known. Deferred cleanup requires manual review; no independent cleanup timer is started.

### Compatibility and rollback

The current reader accepts legacy runs without full receipts or worktree records. Earlier scheduler readers use a strict schema and cannot read the new optional run metadata: resolve live work, retain a state backup, and disable the scheduler hub flag before downgrading. Keep the flag off on the older runtime so it does not quarantine the newer state. Disabling dispatch does not cancel sessions; identity-aware owning nodes must remain in place while any launch is unresolved. The additive manager-registry `schedule` origin is never converted to `manager`.


## UI — planned

List/form, next-five preview, run history, Settings defaults, preview gating, and notifications.

## Oracle proposals

The scheduler transaction also retains at most 1,000 typed proposals (24-hour pending lifetime). Each binds an immutable operation, normalized payload, and existing schedule revision, with Oracle attribution and a pending/approved/rejected/expired/applied/failed lifecycle. Terminal proposals are evicted oldest-first; unresolved approvals are never evicted. Storing proposals with scheduler state makes schedule application and proposal settlement atomic, including the Run now admission fence. Repeated approvals, concurrent clicks, and restarts cannot apply a proposal twice.

Approval revalidates the 20-active-Oracle-schedule limit, recurrence spacing, exact revision, and permission policy in the mutation transaction. The hub settings profile's `schedulerAllowAllForOracle` defaults to false when unset; true permits proposing allow-all but never bypasses explicit approval. Disabling or archiving does not grant any execution permission. Pending proposals expire at startup, scheduler sweeps, reads, and confirmation.

Origin-enforced routes are `GET /api/schedules/proposals` (pending only, no-store), `POST /api/schedules/proposals/:id/approve`, and `POST /api/schedules/proposals/:id/reject`; actions accept no replacement payload. Socket invalidations use `schedule-proposals.changed` with a monotonic revision and proposal ID. These routes and storage remain unavailable without the hub scheduler flag. Oracle tools and confirmation cards are described below.

## Oracle tools and confirmation cards

Scheduler-enabled hubs register `list_schedules`, `get_schedule`, and bounded `list_schedule_runs` for Ask, Delegate, voice and proactive reads. List tools return at most 20 compact summaries within a 13K-character output budget, with omitted counts and continuation offsets; exact prompts and targets remain available through `get_schedule`. Approval cards retain full one-off timestamps and disable approval at proposal expiry or when a proposed one-off time passes, including after a background tab resumes. `create_schedule`, revision-checked `update_schedule`, `set_schedule_enabled`, `run_schedule_now` and `archive_schedule` only create proposals in typed Delegate turns. Voice, proactive, Ask and durable-task turns cannot propose writes; there is no delete tool or confirmation bypass.

Each proposal and observed outcome is recorded in the manager journal, including confirmation, rejection, expiry and failure, with startup replay for interrupted journal delivery. Proposal IDs are not session ownership. Schedule-started sessions retain the registry's `schedule` origin and cannot be promoted to Oracle ownership; Oracle-created schedules are not Oracle-owned sessions.

With Interface › Preview features › Scheduler enabled and the authoritative hub flag on, the Oracle panel renders pending confirmation cards. Before expanding anything, each card shows the operation, human recurrence and timezone, the next run from the shared recurrence engine, and labeled computer, folder, permissions, folder trust and workspace facts. Creates include a prompt preview; updates show changed fields as before → after, while enable/disable/Run now/archive explain their consequences. Allow-all displays the explicit warning “Runs tools without asking”. Before-state is read only at the proposal's exact base revision; a missing or stale revision disables approval rather than displaying a misleading diff. The immutable JSON stays under “Exact payload to approve”, with expiry and Approve/Reject actions bound only to the proposal ID. Socket changes and reconnects refresh the pending list. The Interface › Scheduler setting permits allow-all proposals, defaults off, and never approves a proposal itself.

## Canonical run notifications

The canonical classifier resolves `notify` from the immutable definition accepted for the run, not today's edited schedule. A run outcome produces one stable identity from schedule ID, run ID and outcome. Needs-input is an attention outcome; a stopped run uses the interrupted kind. Pending, launching, running and stopping are not outcomes.

Needs-input alerts are dated at the attention transition, not the original launch. Recovered success uses its current summary, and needs-input uses an action prompt; neither displays stale transient launch errors.

| Accepted policy | Succeeded | Failed | Needs input | Missed | Interrupted |
| --- | --- | --- | --- | --- | --- |
| `always` | Notify | Notify | Notify | Notify | Notify |
| `attention` | Suppress | Notify | Notify | Notify | Notify |
| `never` | Suppress | Suppress | Suppress | Suppress | Suppress |

`ScheduleNotificationService` admits the canonical record before external delivery and broadcasts `schedule.run.notification` with the resolved notification. The notification-center flag controls in-app storage, not scheduler push/native behavior. Both channels consume the same canonical outcome and stable tag. Scheduler state retains up to 100,000 durable identity fences (inside its existing 64 MiB ceiling); reaching that bound fails closed rather than reopening an old outcome. Restart, repeated status updates and node resync cannot announce an outcome again, and notification-store tombstones preserve read/dismissed state. Delivery is at most once: a crash after the external-delivery fence or a push transport failure is not automatically retried.

Ordinary session action/completion paths are suppressed for every schedule policy, including `never`. Before session binding, the resolver matches the owner-persisted launch ID plus computer against admitted runs; after binding it also uses session ID and the registry's schedule provenance (including replacements). It never treats a generic automation launch ID as Oracle ownership. Scheduler storage and replacement provenance initialize before the single notification/push listener attaches, ahead of Oracle and Dreamer startup. A dedicated listener records replacement ancestry synchronously before notification ingress with Oracle on or off; Oracle's journal batches independently. Replacement ancestry remains authoritative even after schedule deletion or run-history eviction.

The hub annotates HTTP and socket session projections with `suppressOrdinaryNotifications` for native clients; this is hub-derived delivery metadata, not owner-side provenance. Session state and transcript events still flow unchanged otherwise, including patch/resync metadata. Push retains notification scope and session mute; native additionally suppresses the active visible session and duplicate identities. In-app records survive mute/scope suppression. No notification service exists without the scheduler hub flag.
