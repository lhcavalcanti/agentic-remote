# Scheduler

Status: shared contracts, pure recurrence, durable storage, hub dispatcher, and HTTP/event contracts. The hub constructs the store and dispatcher only with `AGENTIC_REMOTE_FEATURE_SCHEDULER=on` (default off). Nodes never construct or dispatch schedules. The runner, UI, Oracle tools, and notification integration are separate work; the default no-op runner creates no sessions. Dreamer's existing schedule is unchanged.

## Schema

`shared/schedules.ts` exports strict zod schemas and inferred `Schedule`, `ScheduleTarget`, `ScheduleRecurrence`, `ScheduleRun`, and `ScheduleRunStatus` types.

- A schedule has an ID, name (1–200 characters), exact prompt text (1–20,000 characters, not blank), target, workspace, recurrence, timezone, catch-up/overlap/notification policies, 5–480-minute runtime limit, enabled/archive state, creator, positive revision, and creation/update timestamps. Non-archived names are unique case-insensitively.
- Targets use the existing providers (`copilot`, `claude`), efforts, context tiers (`default`, `long_context`), and modes. Mode defaults to `autopilot`. Permission policy and folder trust independently default to `ask`; neither an Oracle creator nor a worktree changes these defaults. Folder authorization remains the future runner's responsibility.
- The default timezone is `America/Los_Angeles`. Validation uses `Intl.DateTimeFormat` and rejects numeric UTC offsets; supported IANA identifiers, aliases, and `UTC` are accepted. Timestamps are ISO strings with an explicit UTC or numeric offset.
- A run has its own ID, schedule ID, occurrence timestamp, trigger, lifecycle status, launch ID, computer ID, and optional creation time, offline retry deadline, accepted root-prompt receipt, session ID, start/end timestamps, summary, and error. The receipt is an opaque prompt ID, not assistant text or inferred success. A pending launch need not yet have a receipt or session ID.

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

Hourly windows start inclusively and end exclusively, anchored anew at each local window start. Omitted endpoints mean `00:00` and `24:00`; an earlier end crosses midnight and equal endpoints mean a full day. `24:00` is allowed only as a window end. Intervals need not divide the window or the day; they reset at the next window start, not after a fixed UTC duration.

The dependency graph has no cron parser. The MIT `cron-parser` package was evaluated, but its runtime dependency on Luxon conflicts with this layer's Intl-only timezone requirement. The small shared parser adds no dependency and supports numeric values, comma lists, ascending ranges, positive steps, case-insensitive `JAN`–`DEC`/`SUN`–`SAT`, and Sunday as 0 or 7. A single value with a step extends through that field's maximum. There is no seconds field, command suffix, macro, `L`, `W`, `#`, or `?` syntax. Both restricted day fields use standard DOM/DOW **OR** semantics; if either begins with `*` (including `*/n`), both must match. Invalid calendar dates are skipped, not clamped: the 31st skips short months and February 29 skips non-leap years. A recurrence with no matching date in a complete 400-year Gregorian cycle produces no occurrences and fails creation validation.

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
- **Overlap:** `skip` records the new run as missed; `queue` keeps it pending FIFO; `replace` stops older pending intents without launching them, moves existing live work to `stopping`, and waits for authoritative termination before the replacement can launch.
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

## Runner — planned

Capability-gated launch and prompt acceptance, explicit permissions/folder trust, allowed roots, safe worktree ownership, and prompt-bound terminal outcomes.

## UI — planned

List/form, next-five preview, run history, Settings defaults, preview gating, and notifications.

## Oracle — planned

Read tools and Delegate-only, exact-payload/revision-bound approved proposals before every write.
