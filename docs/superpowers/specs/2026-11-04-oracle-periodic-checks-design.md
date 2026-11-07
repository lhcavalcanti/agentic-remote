# Oracle Periodic Checks and Draft Status Design

> **Superseded by #511.** Periodic checks were removed before any hub ran them;
> Dreamer now keeps Oracle current with a periodic session-progress refresh
> ([design](2026-11-07-dreamer-periodic-refresh-design.md)). The
> draft-status change still stands.

## Status and scope

This follow-up contains two ordered changes:

1. Remove redundant ambient draft-save copy from Agentic Remote's session and
   Oracle composers while preserving recovery and storage-failure feedback.
2. Add an opt-in, read-only periodic Oracle status check after the UI change is
   validated.

The periodic check is separate from the lifecycle inbox roadmap in issue #408.
It does not activate `ManagerProactiveInbox`, suppress session notifications,
write memory, answer session requests, or perform follow-through actions.

## UI text audit

The exact shipped copy appears on two Agentic Remote surfaces:

- the selected session composer in `src/App.tsx`;
- the Oracle composer in `src/ManagerAssistant.tsx`.

Both surfaces already persist drafts locally. Repeating **Saved on this device**
for every non-empty draft adds permanent visual and screen-reader noise without
changing what the user can do. The meaningful exceptional states remain:

- **Recovered saved draft** after a reload or remount restored text;
- explicit storage errors when persistence is unavailable or uncertain.

The nearby Athena repository contains device-only file-staging language, but no
matching draft-save notice or duplicated composer copy. It is not a second
implementation surface for this request.

## Periodic check architecture

Oracle keeps its existing single `ManagerAgent`, SDK conversation, durable
message queue, recovery ladder, transcript, and notification path. A scheduler
inside `ManagerAgent` owns one exact `setTimeout` for the next eligible check.
It never starts a second Oracle runtime and never runs a fixed polling loop.

Settings are hub-owned and disabled by default:

- cadence: 60, 120, 240, or 480 minutes; default 120;
- timezone: valid IANA timezone; default UTC;
- quiet hours: local start and end hour; default 22:00-07:00;
- enabled: false until the user opts in.

The schedule state persists `nextCheckAt`. Enabling or changing cadence,
timezone, or quiet hours schedules the next check one cadence from the current
time, deferred to the end of quiet hours when necessary. Disabling clears the
timer and next check while retaining transcript history.

## Wake execution and idempotency

When due outside quiet hours, the scheduler appends one `source: "scheduled"`
message to Oracle's durable queue. Its ID is deterministic from the scheduled
instant. The message is written before `nextCheckAt` advances, so a crash
between the two writes is recovered by finding the same message ID rather than
creating a duplicate.

A restart with an overdue schedule creates at most one catch-up check, then
sets the next check from the current time. Missed intervals are never replayed
as a backlog. Later cadence ticks also coalesce while a scheduled check is
queued or running. Existing queued user messages remain ahead of the appended
scheduled message. A queued check is revalidated before execution, so it waits
when quiet hours begin while earlier user work is running. Pausing cancels a
scheduled check that has not started.

The scheduled prompt asks Oracle to review current work and status, report
meaningful progress, failures, or user attention, and otherwise say there is
nothing requiring attention. It is marked answer-only and handler-enforced
read-only. Read tools remain available; session actions, settings changes,
confirmations, and Markdown or structured-memory mutations are refused.

## Failure, retry, and activity semantics

Queue and model execution use ManagerAgent's existing recovery ladder. A failed
scheduled check remains visible with the existing Retry action. Scheduler
admission failures retry with bounded delays of 1, 5, and 15 minutes while the
feature remains enabled; only one retry timer exists.

The Oracle transcript labels scheduled messages **Scheduled check**. Settings
show enabled state, cadence, timezone, quiet hours, next check, and the latest
scheduled message state. Oracle assistant replies use the existing unread and
Oracle push-notification behavior, including the current `all` / `oracle` /
`off` notification scope. Quiet hours prevent inference as well as delivery.
A scheduled reply that started before quiet hours and completes inside them is
kept in the transcript without raising a push or native notification.

## Validation

- UI tests prove ordinary typing shows no ambient save notice, restored drafts
  still announce recovery, and storage failures remain actionable.
- Pure schedule tests cover cadence, timezone validation, quiet-hour deferral,
  overnight windows, and next-run calculation.
- ManagerAgent tests cover wake execution, user-message priority, deterministic
  deduplication, restart catch-up, missed-run coalescing, disablement, quiet
  hours, read-only tool enforcement, and visible failure/retry state.
- Run targeted Vitest files, `pnpm check`, `NODE_ENV=production pnpm check`,
  and refresh/check Graphify.
