# Session origin and runtime work presentation

This presentation is behind Interface › Preview features › Composer refresh, off by default. Origin is separate from model family, execution provider, and Oracle ownership policy.

## Authoritative origin

The hub projects `ManagedSession.provenance` from the exact computer/session entry in `ManagerStore`, using a bounded field-only lookup. REST session lists and mutation/read replies, WebSocket upserts, message patches, and resyncs carry the same projection. Node-supplied provenance is discarded; unknown records remain unknown. No title, model, provider, or tool-text heuristic attributes a session.

Launch boundaries record source evidence explicitly: UI/API creation records `user` before returning its session; Oracle's launch recorder records `manager`; schedules record `schedule` with their run identity. Discovery records `discovered` both before and after the journal baseline. Baseline timing only suppresses journal noise and never determines origin. Replacement continuity carries the same evidence. Legacy `user` tags without explicit launch evidence are normalized to `discovered` on registry load and writes, not merely hidden by presentation. This migration preserves identity, task and lifecycle fields. Explicit user evidence and existing Oracle/schedule ownership remain unchanged; those latter origins were already recorded only by their launch paths.

With Oracle off, the hub loads only the session registry, not Oracle's conversation, memory, journal or uploads, and observes first discoveries without adding a polling loop. New records retain owner-only directory/file permissions. Optional attribution persistence failures are logged without reporting an already-created session as a failed creation.

The user, Oracle, schedule, and discovered/external origins have separate icons and accessible descriptions in session rows and the conversation header. When the preview is off, the existing Oracle badge and manager-snapshot behavior remain unchanged.

For schedules, recorded schedule/run IDs come from the registry; the current name comes from the scheduler store. A session may outlive a deleted schedule, in which case its run identity remains but no name is invented. Projection is display-only; recording source evidence at creation does not grant Oracle ownership, change queue behavior, or make scheduled sessions Oracle-owned.

Notification delivery metadata remains separate. A scheduled admission may already suppress ordinary notifications before a registry origin exists; `suppressOrdinaryNotifications` is never treated as proof of provenance. Both fields survive HTTP and socket projection without changing notification admission order or policy.

## Run access

A run link requires both Composer refresh and the effective Scheduler view preview, including its hub flag. It uses the scheduler's canonical root-page `schedule`/`run` link, opens the existing Scheduler view, and selects the recorded run history. The same URL works in another tab or as a bookmark. Opening it never starts, retries, stops, or modifies a schedule or session; missing or expired history uses the Scheduler view's existing unavailable states.

Session rows and the conversation header share that navigation. Rows retain the Tasks button's larger title clearance when Tasks and a schedule-run link are both present. The desktop rail reuses the same session row component. Notification rows, run-history entries, and host-process links use their own purpose-specific components; their existing session navigation reaches the same provenance-aware header without adding new badge surfaces.

## Runtime subagents

The existing runtime adapter already handles `subagent.started`, `subagent.completed`, and `subagent.failed` events and normalizes SDK task API agent records. The chip counts only distinct running `type: 'agent'` records from a supported `BackgroundTaskSnapshot`, including synchronous subagents. It does not infer a count from total background work, shell tasks, model family, transcript text, or activity groups.

The chip sits beside background work and opens the existing task panel. It is hidden when the preview is off or no supported running subagents have been reported. No new runtime field, polling loop, server route, or persisted counter is introduced.
