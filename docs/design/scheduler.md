# Scheduler

Status: shared contracts and pure recurrence calculation only. Nothing registers a service, creates a session, writes scheduler state, or adds UI. Dreamer's existing schedule is unchanged.

## Schema

`shared/schedules.ts` exports strict zod schemas and inferred `Schedule`, `ScheduleTarget`, `ScheduleRecurrence`, `ScheduleRun`, and `ScheduleRunStatus` types.

- A schedule has an ID, name, exact prompt text (1–20,000 characters, not blank), target, workspace, recurrence, timezone, catch-up/overlap/notification policies, 5–480-minute runtime limit, enabled/archive state, creator, positive revision, and creation/update timestamps. Name uniqueness belongs to the planned store.
- Targets use the existing providers (`copilot`, `claude`), efforts, context tiers (`default`, `long_context`), and modes. Mode defaults to `autopilot`. Permission policy and folder trust independently default to `ask`; neither an Oracle creator nor a worktree changes these defaults. Folder authorization remains the future runner's responsibility.
- The default timezone is `America/Los_Angeles`. Validation uses `Intl.DateTimeFormat` and rejects numeric UTC offsets; supported IANA identifiers, aliases, and `UTC` are accepted. Timestamps are ISO strings with an explicit UTC or numeric offset.
- A run has its own ID, schedule ID, occurrence timestamp, trigger, lifecycle status, launch ID, computer ID, and optional accepted root-prompt receipt, session ID, start/end timestamps, summary, and error. The receipt is an opaque prompt ID, not assistant text or inferred success. A pending launch need not yet have a receipt or session ID. Lifecycle transition enforcement belongs to the planned dispatcher.

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

## Store — planned

Atomic owner-only storage, unique names, revision checks, bounded run history, and durable mutation records.

## Dispatcher — planned

Hub-only authority, durable occurrence/launch identity, catch-up, overlap/concurrency policy, crash reconciliation, and authoritative stop acknowledgement.

## Runner — planned

Capability-gated launch and prompt acceptance, explicit permissions/folder trust, allowed roots, safe worktree ownership, and prompt-bound terminal outcomes.

## UI — planned

List/form, next-five preview, run history, Settings defaults, preview gating, and notifications.

## Oracle — planned

Read tools and Delegate-only, exact-payload/revision-bound approved proposals before every write.
