# Session retention

Open **Session actions > Session retention** on a computer advertising retention
support. Settings belong to that session on its owning computer, not the browser.

| Setting | Behavior |
| --- | --- |
| Never (default) | Keep managed records reviewable regardless of overnight inactivity or process loss |
| Keep for review | Protect the record from implicit archival on every device |
| After 7 / 30 / 90 days | Archive eligible inactive records from the active roster; reopen from session history |

The API accepts field-level patches such as `{ "pinned": true }` or
`{ "idleDays": 30 }` at
`PATCH /api/computers/:computerId/sessions/:sessionId/retention`. Omitted fields
keep their current value, so devices editing different fields concurrently never
undo each other; `"idleDays": null` disables archival. Accepted ages are whole
days from 1 through 3650. Empty patches, unknown fields, and invalid values are
rejected without a write. There is no global idle-process TTL.

Age is elapsed time since the conversation's last activity or explicit Reopen,
whichever is later, not local midnight, a calendar date, or process shutdown.
Reopen starts a fresh retention interval without changing conversation order.
An already-old eligible
record can archive on the next pass: Copilot discovery runs every 10 seconds;
Claude checks every 60 seconds, and both reconcile at startup. Archival requires
no live provider owner and an idle or intentionally suspended state. Queues,
unconfirmed dispatches, queued, running, or detached background tasks,
questions, permissions, failures, context recovery, and review pins prevent it. A previously running/waiting interrupted turn is not
reclassified as idle just because its process disappeared.

Nothing archives until startup recovery has probed every managed terminal owner.
A terminal whose owner probe is live or uncertain stays visible; one recovery
confirms absent archives instead of relaunching only if it is already expired.
Eligibility and ownership are re-checked when the archive is committed, so a
session that gained an owner, an admitted send, or a lifecycle change after
discovery's snapshot is never archived.

Archival is not Delete or Close. It never terminates a live process, removes
history, deletes a folder/worktree, or erases resumability. Close and Delete
permanently are confirmed user actions ([app spec §3.3](app-spec.md)): Close
keeps a session reopenable for 14 days, then deletes it. Default
retention does not start a process for every retained record. Existing safe
startup recovery may restore an owned terminal; ordinary discovery does not
respawn a missing one. Failed recovery leaves a visible interruption.

**Interrupted** means the provider owner disappeared or an SDK turn outlived the
hub runtime. Read the saved conversation, then use **Reopen session**. Terminal
reopen resumes the same ID and waits for readiness before dispatching preserved
FIFO work. SDK reopen does not retry the interrupted turn or automatically
release its queue; explicitly continue after reviewing its result. Interrupted
and archived records are read-only until Reopen: sends, queued prompts, retries,
commands, restart, clear, recovery, suspend, tmux moves, and runtime changes are
refused with nothing consumed, and resuming an archived record also requires
Reopen. Queued prompts cannot be edited, removed, reordered, or dispatched until
Reopen, and a pending context brief waits too; Reopen sends it once before the
queue continues. Automatic queue drains skip retained records, and the queue
claim itself refuses one, so an interruption landing mid-drain sends nothing. Expired
questions/approvals remain visible but cannot invoke dead callbacks. Copilot
supports **Recover conversation**; Claude can continue with a new prompt.

Lifecycle upserts carry interruption/archive metadata to all connected clients,
including patched connections. Retention-capable nodes include archival metadata
in authenticated snapshots, so reconnect distinguishes retained history from
explicit deletion without fetching each archived transcript. Metadata-only lifecycle logs identify the
session, transition, interruption cause, and UTC detection time (with a failed
relaunch's bounded error), and record each completed suspend, resume, close,
reopen of a closed session, and expiry; they contain no prompts or provider
credentials. Concurrent lifecycle changes invalidate stale discovery; retention
is decided against the current durable record, not a previously read snapshot.
An authoritative refresh keeps an unlisted archived row only while it is the
open conversation, and drops it when its detail is gone, so a missed deletion
event cannot leave a deleted session selected.

## Investigated development incident

On 2026-10-19, several development providers shut down together around
**05:40:53 UTC**. A separate smoke script's teardown invoked `tmux kill-server`
with an alternate `TMUX_TMPDIR` but inherited `TMUX`. A read-only socket probe
confirmed that inherited `TMUX` still selected the shared server. Script teardown
and graceful provider shutdown logs correlate at that instant. The hub had
started at 05:31:54 UTC and did not restart at the shutdown; no matching kernel
OOM entry was found. The performance session's **06:52:50 UTC** event was a
resume, not evidence of a 06:52 cleanup schedule.

Agentic Remote's subsequent 10-second discovery reconciled missing terminal
processes to closed roster entries despite their retained managed-open intent.
History and provider state survived, but active rows disappeared and unfinished
transcripts could still report Running. Retention now preserves these records
and reports process loss explicitly. Oracle's separate ten-minute idle stop and
the two-minute side-question runtime stop do not close ordinary sessions.

No hub retention setting can prevent an unrelated script from killing a shared
tmux server. Sandbox scripts must clear inherited `TMUX` on **every** command,
including teardown, and target only their verified owned socket/server. Tests
should use `isolatedTmuxEnv` and `stopIsolatedTmuxServer` from
`server/tmux-test-helpers.ts`; changing `TMUX_TMPDIR` alone is insufficient.
The external incident script is outside this repository and was not changed.
