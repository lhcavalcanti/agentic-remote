# Session origin and runtime work presentation

This presentation is behind Interface › Preview features › Composer refresh, off by default. Origin is separate from model family, execution provider, and Oracle ownership policy.

## Authoritative origin

The hub projects `ManagedSession.provenance` from the exact computer/session entry in `ManagerStore`, using a bounded field-only lookup. REST session lists and mutation/read replies, WebSocket upserts, message patches, and resyncs carry the same projection. Node-supplied provenance is discarded; unknown records remain unknown. No title, model, provider, or tool-text heuristic attributes a session.

The user, Oracle, schedule, and discovered/external origins have separate icons and accessible descriptions in session rows and the conversation header. When the preview is off, the existing Oracle badge and manager-snapshot behavior remain unchanged.

For schedules, recorded schedule/run IDs come from the registry; the current name comes from the scheduler store. A session may outlive a deleted schedule, in which case its run identity remains but no name is invented. Provenance is display-only and does not change policy, ownership, queue behavior, or registry records.

## Run access

A run link requires both Composer refresh and the effective Scheduler view preview, including its hub flag. It reads the existing `GET /api/schedules/runs/:id` route and opens read-only details. Opening it never starts, retries, stops, or modifies a schedule or session. Missing runs show the existing API error with a retry action. The link's unmodified target is the same read-only run resource.

The isolated detail surface provides an actual run destination before the broader scheduler view exists. It uses existing dialog focus management and closes on Escape. Preview/session/run changes unmount its state and abort pending reads.

## Runtime subagents

The existing runtime adapter already handles `subagent.started`, `subagent.completed`, and `subagent.failed` events and normalizes SDK task API agent records. The chip counts only distinct running `type: 'agent'` records from a supported `BackgroundTaskSnapshot`, including synchronous subagents. It does not infer a count from total background work, shell tasks, model family, transcript text, or activity groups.

The chip sits beside background work and opens the existing task panel. It is hidden when the preview is off or no supported running subagents have been reported. No new runtime field, polling loop, server route, or persisted counter is introduced.
