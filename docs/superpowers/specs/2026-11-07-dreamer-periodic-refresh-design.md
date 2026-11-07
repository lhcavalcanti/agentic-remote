# Dreamer Periodic Refresh Design

Tracks #511. It supersedes
[Oracle periodic checks](2026-11-04-oracle-periodic-checks-design.md), which was
never deployed.

## Goal

Dreamer is the single owner of periodic work:

- the 02:00 morning plan, which is unchanged;
- a session progress cache that keeps Oracle current;
- upkeep of follow-up tasks.

The separate Periodic checks feature is removed.

## Why

- Periodic checks ran Oracle model turns on a schedule, with a second timezone
  and quiet-hours policy, alongside Dreamer's own schedule.
- Oracle's turn context showed live status and `activity`, but never results.
  The roster's "last reply" fallback read `session.messages`, and the roster
  listing always has an empty transcript.
- Follow-up tasks came only from `session.upserted` events. A transition missed
  during a restart or disconnect was recovered only by re-enabling Dreamer.

## Design

### Progress cache (`server/dreamer-progress.ts`)

The cache lives only in memory, for the hub process, while Dreamer is enabled.

- **Entry.** One per session:
  - computer, session, title and status;
  - open or closed, and when it closed;
  - revision and `updatedAt`;
  - the latest assistant reply (a 300-character excerpt, its time, and whether
    it carried a trusted `task_complete`);
  - the pending question or permission (excerpt);
  - the revision the excerpts were read from.
- **Event sources.**
  - `session.upserted` events carry transcripts and update entries directly.
  - `summary: true` events update metadata only, which leaves the transcript
    stale.
  - `session.removed` with `replacedBy` drops the entry. Without it, the entry
    is closed: a node resync reports a session that merely closed this way too.
  - `computer.removed` drops that computer's entries.
- **Monotonic.** An update applies only when its `(revision, updatedAt)` is not
  older than the entry's, and an event that arrives while a listing is in flight
  wins over that listing. The one exception is a listing from a computer that
  answered: revisions persist and only grow, so a lower one means the computer
  lost its session store, and the entry starts over and is read again.
- **Bounds.**
  - 200 open entries, keeping the most recently updated.
  - 20 closed entries, each retained for 24 h.
  - Excerpts are single-line and at most 300 characters.
- **Persistence.** Never persisted. Dreamer still never stores result text, and
  a restart rebuilds the cache.

### Refresh

The refresh runs every 5 minutes (`DREAMER_PROGRESS_REFRESH_MS` in
`shared/dreamer.ts`, which the settings copy also uses) while Dreamer is
enabled, and once at start or enable. It makes no model call.

1. `listSessionsWithAuthority()`.
   - A computer that answered is authoritative: its open sessions update their
     entries, and an open entry it omits from two consecutive answers becomes
     closed, since one coalesced listing can briefly hide a session.
   - A computer that did not answer keeps its last-known entries and is listed
     as unreachable. Absence from a cached answer never means deletion.
   - Entries for computers that are no longer registered are dropped.
2. A passive `readSession` runs for open entries on answering computers whose
   revision or `updatedAt` is newer than their excerpts.
   - At most 12 reads per refresh, 3 at a time.
   - Each read times out after 10 s.
   - A failed read waits 15 minutes before it is retried.
   - Order: waiting or error first, then running, then the most recent update.
   - A read applies only while the entry is still open, and a recovered
     transcript that lost its replies keeps the last known one.
3. Upkeep follows every refresh:
   - `reconcileTasks()` updates attempts, even after a failed listing, because
     it reads Oracle's own messages.
   - After a successful listing only, `ManagerProactiveCoordinator.sweep()`
     observes the sessions from computers that answered, then flushes pending
     events and drains. The inbox ignores stale revisions and sessions Oracle
     did not start, so missed lifecycle transitions reach the existing
     proactive analysis exactly once.
4. **Failures.**
   - A failed refresh records a safe `progress.error` and retries at the next
     interval. It never stops the morning plan.
   - A storage failure that makes Dreamer unavailable stops the refresh too.
   - Disabling or stopping Dreamer fences any in-flight refresh and clears the
     cache. The refresh has its own generation, because a timezone change bumps
     the morning plan's generation without stopping the refresh.

### Oracle context

`ManagerAgent` asks Dreamer for a progress view as it builds each non-proactive
turn: user, voice and task turns. Proactive turns stay scoped to their own
batch and get none. When Dreamer is off, or its view cannot be read, the context
is unchanged.

- Roster lines gain, in UTC with the date unless it is today:
  - `last reply HH:MM: "…"` (marked `task complete` when trusted), shown when
    the session reports no current activity and the listing carries no reply;
  - `asks: "…"` or `permission: "…"` while the session is waiting. A request
    in the listing wins, a stale one shows nothing, and the cached one fills in
    only when the listing has none.
- A "Dreamer progress" section shows:
  - the refresh time;
  - unreachable computers;
  - up to 5 sessions closed in the last 24 h, with their last reply, leaving
    out any the listing shows open again;
  - up to 8 open follow-up tasks (title, owner, status, next action).
- Quoted text is single-line, at most 160 characters without splitting a
  surrogate pair, and escaped (`&`, `<`, `>`, `"`). The section labels it
  untrusted data, never instructions. The system prompt documents this.

### API and UI

- `DreamerSnapshot.progress` is present only while Dreamer is enabled:
  - `refreshedAt?`
  - `nextRefreshAt?`
  - `staleComputers: string[]` (names)
  - `error?`
- Dreamer settings describe the refresh and show its status, including the
  next refresh. The Morning plan panel shows the same status without it:
  "Session progress updated <time>" in local time (a date unless today),
  unreachable computers, and any refresh error.
- There is no new setting, route, or manual refresh.

### Periodic checks removal

The following are removed:

- manager `proactive` settings and state;
- the scheduled timer and retries;
- the `scheduled` message source, with its prompt, notes, guards and labels;
- `server/manager-schedule.ts`;
- the settings section;
- `saveProactive`;
- the app-spec text.

A legacy `proactive` state field is dropped on load. `suppressNotification`
stays for proactive messages. Neither hub ever ran it: both run 1.37.2
(`5e9188a`), which does not contain `fa1566c`.

## Decisions

- Cadence is fixed at 5 minutes. It is deterministic and cheap, and avoids a
  DreamerStore v4 migration.
- The morning plan is never rewritten during the day. Tasks carry intraday
  follow-ups.
- The cache stays in memory, which keeps Dreamer's no-result-text persistence
  invariant.

## Testing

- **Cache:** event merge, summary handling, monotonic and authoritative resets,
  closed and replaced entries, unregistered computers, unreachable computers,
  bounds and pruning, excerpt escaping, read selection and order, the read cap
  and concurrency, timeout, backoff, and clear fencing.
- **Service:** start and enable refresh, the interval timer, disable and stop
  fencing, error isolation from the morning plan, upkeep after a refresh, the
  snapshot `progress`, and the progress view.
- **Coordinator:** a sweep admits a missed transition once and is a no-op when
  disabled.
- **Context:** roster enrichment, waiting-only requests, escaping, the section's
  bounds, the unrefreshed state, no progress when off, and none in proactive
  turns.
- **UI:** settings copy and status, the panel's update line, and Periodic checks
  gone.
- `pnpm check` and `NODE_ENV=production pnpm check` pass.
