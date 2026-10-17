# Proactive Oracle: session events, follow-through, and notifications

**Status:** Proposed. Awaiting the user's review before any implementation.
**Builds on:** [Session manager design](../../design/session-manager.md),
[structured memory foundation](https://github.com/lhcavalcanti/agentic-remote/issues/404)
(which defers "event-driven workflow supervision" to this work).

## Problem

Oracle only acts when you write to it. It hands work to a session and then
never comes back: nothing tells it the session finished, failed, or is
waiting, so it cannot check the result, report it, or record it in memory.
Sessions you start yourself are recorded in its roster and journal, but it
only reads them when you ask a question.

Meanwhile the hub already sends a raw push for every session ("Finished · X",
"Action needed · X"). These are prompt but say nothing about whether the work
succeeded or whether you were waiting on it.

## Goal

Session lifecycle events wake Oracle on its own, so that it can:

1. **Follow through** on work it delegated: read the result, compare it with
   the task it gave, and report or nudge.
2. **Tell you what matters** through notifications, in its own words, and stay
   quiet about what does not.
3. **Keep its memory current** about every session, including yours.

It does this without a model turn per event and without interrupting any
session.

## Non-goals (this version)

- Messaging outside the app (Teams, WhatsApp, email). You asked to start with
  notifications; a channel interface is left for later.
- Acting on sessions you started, beyond reading them.
- Scheduled or recurring runs.
- Structured memory (#404 owns it); this uses the existing Markdown memory.

## Approaches considered

| Approach | Upside | Downside |
|---|---|---|
| **A. Wake turns in Oracle's own conversation** (recommended) | One conversation, so what it learns from events is there when you next ask; reuses the queue, recovery ladder, transcript, and tools | Event turns add to its context and cost; needs batching and a budget |
| B. A separate watcher conversation that writes summaries for Oracle | Keeps event chatter out of Oracle's context | Two runtimes, split knowledge, summaries can disagree with what Oracle tells you |
| C. Deterministic rules only (templated notifications) | No model cost | Cannot judge whether a result is what you wanted, which is the point |

Recommendation: **A, with a deterministic filter in front**, so rules decide
*whether* Oracle wakes and Oracle decides *what to say and do*.

## Lifecycle

```
session changes on a computer
  -> hub event (session.upserted / session.removed)
     -> JournalRecorder: roster + journal (unchanged)
     -> SessionWatcher: signal (finished | needs-input | failed | closed)
        -> inbox.jsonl (durable, deduplicated)
           -> wake policy: watched? muted? debounce, hourly budget
              -> one wake item in Oracle's queue (coalesced)
                 -> wake turn: events + roster + memory
                    -> notify_user / memory_* / follow-through tools
                    -> transcript entry, unread dot, push
                    -> signals acknowledged
```

### 1. Signals (`server/manager-watcher.ts`)

The watcher listens to the same hub events as the journal and turns
transitions into signals, using the rules the push service already uses:

| Signal | Rule | Dedupe key |
|---|---|---|
| `finished` | running → idle, nothing pending, nothing queued | session + `updatedAt` of the idle state |
| `needs-input` | a permission or question appears | session + `requestId` |
| `failed` | status becomes `error` | session + `updatedAt` |
| `closed` | session removed (not replaced) | session |

Signals carry the session's key, title, origin (Oracle's, yours, or
discovered), and time. They are appended to `<data>/manager/inbox.jsonl` and
kept until a wake turn acknowledges them, so a hub restart loses none and
replays none twice.

### 2. Wake policy (deterministic, no model)

- **Who wakes it:** a setting, *Oracle watches*:
  - **All sessions** (default, as you asked): `finished` and `failed` for every
    session; `needs-input` only for sessions Oracle started, since the raw
    "Action needed" push already reaches you at once for yours.
  - **Sessions Oracle started**.
  - **Off**: today's behavior.
- Muted sessions never wake Oracle.
- `closed` never wakes Oracle on its own; it rides along with the next wake so
  Oracle can fold the session into memory.
- **Batching:** a wake waits 20 seconds after the latest signal, so a burst
  (several sessions finishing, or one finishing and immediately taking its
  next queued prompt) becomes one turn.
- **One pending wake:** while Oracle is busy, new signals join the pending
  wake instead of queueing another.
- **Your messages first:** a waiting message of yours is answered before a
  wake.
- **Budget:** at most 12 wake turns an hour (configurable). Beyond that,
  signals wait for the next allowed turn, and raw pushes still go out.

### 3. Wake turn (`ManagerAgent`)

A wake is a queue item with its own kind (`event`), shown in the transcript as
a compact line ("Checked 2 sessions: *Docs*, *Fix login*") followed by
Oracle's reply. It goes through the same recovery ladder as your messages.

Its prompt carries, per signal: the roster line, the task Oracle recorded for
the session, the last assistant message (read passively, up to 1,500
characters), and any pending request with its id and options. Up to 20
signals per turn; beyond that, counts only. The instructions ask Oracle, for
each session:

1. Did it do what was asked? (`ask_session` for more, if needed.)
2. Should you hear about it now? If so, `notify_user`.
3. What is worth remembering? Update `sessions/<id>.md` and `MEMORY.md`.
4. For its own sessions only: is there a next step to send?

### 4. What Oracle may do on a wake turn

| Session | Allowed |
|---|---|
| Started by Oracle | Read, memory, `notify_user`; and with *follow-through* on: `answer_session` within the task, `send_to_session` for a next step |
| Yours or discovered | Read, memory, `notify_user` only (like Ask mode) |

Enforced in the tool handlers, as Ask mode is, not just requested in the
prompt. Follow-through is bounded: at most 2 automatic follow-ups per session
per task. Destructive or out-of-scope requests are denied or left for you, and
every answer appears in the transcript.

### 5. Notifications

- New tool `notify_user({ title, body, sessionId?, computer?, urgency })`
  sends a push through `PushNotificationService` and records it in the
  transcript. It links to the session, or to Oracle's panel.
- Rate limit: at most one Oracle notification per session per wake, and 6 an
  hour overall.
- **Raw "Finished" pushes:** for watched sessions, the hub holds the raw
  "Finished" push for up to 2 minutes. A wake turn that completes counts as
  having handled every signal in it, whether Oracle notified you or judged
  there was nothing to say, so the held push is dropped. If the turn fails, or
  has not completed within the 2 minutes, the held push is sent. "Action
  needed" pushes are never held.
- Oracle notifications need this device's push enabled, as today.

### 6. Settings

In **App settings → Notifications**, under an *Oracle* heading, kept on the
hub with Oracle's other settings:

- *Oracle watches*: All sessions / Sessions Oracle started / Off.
- *Oracle notifies me*: on/off.
- *Oracle follows through on its own sessions*: on/off.

### 7. Failure handling

- A wake turn that fails all recovery rungs marks its signals failed, sends
  any held raw pushes, and shows *Couldn't check sessions* with Retry.
- Oracle turned off or unavailable: the watcher records nothing and raw pushes
  behave as today.
- Unacknowledged signals after a restart are woken once more; duplicates are
  dropped by key.

## Testing

- **Watcher:** each rule, dedupe, restart replay, muted and unwatched
  sessions.
- **Wake policy:** debounce, coalescing while busy, user-first ordering, and
  the budget, using fake timers.
- **Agent:**
  - Wake turn prompt contents.
  - Tool gating by session origin and the follow-through cap.
  - Acknowledgement, and failure fallback.
- **Push service:** a held "Finished" push is dropped when Oracle handles the
  session, and sent when the turn fails or times out.
- **UI:** the settings, wake entries in the transcript, and the unread dot.
- **Sandbox end to end** (never the live hubs' conversations): Oracle starts
  a session, the session finishes, and Oracle notifies with a summary and
  updates memory without being asked.

## Decisions to confirm

These defaults follow what you asked; change any before implementation:

1. *Oracle watches* defaults to **All sessions**.
2. Oracle's summary **replaces** the raw "Finished" push for watched sessions,
   with the raw push as the fallback.
3. Follow-through is **on**, capped at **2** automatic follow-ups per session.
4. The budget is **12 wake turns an hour** and **6 notifications an hour**.
