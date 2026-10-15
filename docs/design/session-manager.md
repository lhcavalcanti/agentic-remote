# Oracle: the session manager agent

Oracle is the user-facing name. Routes (`/api/manager`), events (`manager.*`),
environment variables (`AGENTIC_REMOTE_MANAGER*`), and the data folder keep the
"manager" name, so existing installs need no migration.

A hub-owned agent you can ask about all your sessions from any page. It knows
every session's name, ID, owner computer, and recent activity; it starts and
steers sessions on your behalf; and it keeps its own memory. It manages work
and never does the work itself: every task it accepts becomes a normal session
you can see, open, and talk to.

## Prior art

| System | Idea adopted here |
|---|---|
| OpenClaw (Clawdbot) | The gateway (here, the hub) owns session state; the agent manages sessions only through tools: `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`. Memory is plain Markdown the agent maintains (`MEMORY.md`). |
| Meta Muse Code | An orchestrator that delegates to persistent background agents, an append-only event log for crash-safe recovery, and remote control from a phone. |

## Decisions

1. **Copilot SDK, not tmux.** The manager runs as one persistent Copilot SDK
   session in its own runtime process on the hub. SDK sessions take in-process
   custom tools with direct access to `ComputerManager`, report structured
   errors that recovery can act on, and never depend on terminal prompts,
   footers, or trust dialogs, which have caused most of this app's tmux
   breakages. Running in its own process means a failing manager cannot affect
   your sessions.
2. **Management tools only.** `availableTools` is limited to the manager's own
   tools. It has no shell, file-edit, or web tools, so the only way it can act
   is to start or message a session.
3. **Context on demand, not streamed.** Background changes are not pushed to
   the model as they happen. The hub records lifecycle changes in a journal, and
   every manager turn starts with a generated context block: computers, open
   sessions, changes since the last turn, and the memory index when it changed.
4. **Hub only.** A node serves no UI and runs no manager. Manager-created
   sessions can run on any online computer.

## Files

Everything lives under `<data>/manager/`. `<data>` is
`AGENTIC_REMOTE_DATA_DIR`, by default `~/.agentic-remote`.

| Path | Owner | Contents |
|---|---|---|
| `state.json` | App | Current SDK session ID, generation, retired SDK session IDs, acknowledged journal sequence, memory hash last shown to the model, and the last client defaults. |
| `conversation.jsonl` | App | The chat transcript the UI shows. It survives SDK session replacement. |
| `journal.jsonl` | App | Append-only session lifecycle events with a sequence number: `created`, `status`, `renamed`, `replaced`, `removed`. Rewritten to the newest 2,000 entries once it holds 4,000. |
| `sessions.json` | App | Registry keyed by `computerId:sessionId`: origin (`manager`, `user`, or `discovered`), task (the first prompt, truncated), first-seen time, last status, and removal tombstones. Tombstones are kept for 30 days, up to 500. |
| `memory/**/*.md` | Agent | The agent's own notes, changed only through memory tools. Suggested layout: `MEMORY.md` as the index and durable preferences, `sessions/<id>.md` per session, `projects/<name>.md`. |

The memory tools accept relative `.md` paths only. Absolute paths, `..`,
hidden segments, and symlinks are rejected. Limits are 256 KiB per file and
4 MiB in total. The system prompt forbids storing secrets.

## Session lifecycle

| Event | App action | Manager's next turn |
|---|---|---|
| Created by you or the manager | Registry entry with its origin and task; journal `created` | Listed as new |
| Status changes (running, idle, waiting for input or permission, error) | Journal `status`, transitions only | Listed under changes |
| Renamed | Journal `renamed` | Listed under changes |
| Cleared (replaced) | Journal `replaced`; the registry carries origin and task to the new ID | Told the old and new IDs |
| Closed (deleted) | Journal `removed`; registry tombstone | Told to archive the session's notes and fold outcomes into `MEMORY.md` |

Journal entries stay unacknowledged until a manager turn that included them
completes, so a failed turn shows them again next time.

## Turn context

Every prompt sent to the SDK is the user's text wrapped like this:

```
<agentic_remote_context generated="ISO time">
Computers: …
Open sessions (N): one line each — id · computer · title · status · provider · cwd · updated · origin · activity
Changes since your last turn: …
Memory index (MEMORY.md): … (only when changed, after a new SDK session, or after compaction)
Notes: … (an interrupted previous turn, or a recovery)
</agentic_remote_context>

<user_message>…</user_message>
```

The roster is capped at 80 open sessions, and each activity at 120 characters.

## Tools

| Tool | Purpose |
|---|---|
| `list_computers` | Computers, online state, and providers |
| `list_sessions` | Open sessions, or recent history with `includeClosed` |
| `get_session` | Detail and the last N messages (default 6, maximum 30, each truncated) |
| `ask_session` | A side question answered from the session's conversation without prompting it (Copilot only) |
| `create_session` | Start a session (computer, cwd, title, prompt, provider, model, mode), name it, and send the task |
| `send_to_session` | Send or queue a follow-up; always queued, so a busy session does not refuse it |
| `rename_session`, `cancel_session` | Rename it, or stop the current turn |
| `close_session` | Ask you to close it. You confirm or decline in the app; the agent cannot confirm for you, so a prompt injected through a transcript cannot delete anything |
| `list_skills` | Your skills (name and description) through the runtime's `skills.discover`, so delegated prompts can name them |
| `memory_list`, `memory_read`, `memory_write`, `memory_append`, `memory_delete` | The agent's memory |

Sessions are addressed by ID; the computer is resolved from the live list. Tool
errors return as tool results the model can read, never as thrown failures that
end the turn.

## Runtime and recovery

- Messages go into a durable FIFO queue. Sending is never refused because the
  manager is busy, recovering, or offline. The only refusals are a blank
  message and one over 100,000 characters.
- One turn runs at a time, bounded by a 15-minute watchdog. On expiry it aborts
  and moves on.
- Recovery ladder for a failed turn:
  1. Retry on the same SDK session (at most two attempts, with backoff).
  2. Restart the runtime process and resume the same SDK session.
  3. Start a new SDK session (generation + 1). Its first prompt carries a
     recovery brief: `MEMORY.md`, the last 20 exchanges from
     `conversation.jsonl`, and the roster. The retired session is deleted on a
     best-effort basis and stays excluded from discovery.
  4. Mark the message failed with its reason and offer **Retry**. The next
     message starts again from step 1.
- A restart in the middle of a turn marks that turn interrupted and retries it
  once. Its context notes that some actions may already have happened and that
  the roster and journal should be checked before repeating them. Queued
  messages resume automatically.
- Discovery never lists the manager's SDK sessions. The session service reads
  the manager's current and retired IDs as exclusions before discovery runs.

## API (hub only, under the existing Host and Origin policy)

- `GET /api/manager`: snapshot of status, messages (newest 200, plus every
  older waiting or running one), queue length,
  manager-created session keys, and the last error.
- `POST /api/manager/messages` with `{ content, defaults? }`: `202`. `defaults`
  carries your default mode, model, and per-computer folders.
- `POST /api/manager/messages/:id/retry`, `POST /api/manager/cancel`,
  `POST /api/manager/reset` (new conversation; memory is kept).
- `POST /api/manager/messages/:id/confirmation` with `{ accept }`: your answer to
  a close request. The outcome reaches the agent as a note on its next turn.
- `POST /api/manager/messages` also takes `answerOnly`;
  `POST /api/manager/messages/:id/remove` takes a waiting message out of the
  queue; `PUT /api/manager/settings` with `{ model, reasoningEffort }` (null for
  the hub default) chooses Oracle's model, which the snapshot reports as
  `settings` and the socket as `manager.settings`. `state.json` records the
  model the SDK conversation runs on (`sessionRuntime`) and a chosen model that
  could not start (`unavailableModel`); each answer compares the choice with
  `sessionRuntime`, so a change survives a restart or a switch in progress.
- WebSocket: `manager.status`, `manager.message` (upsert), and
  `manager.delta` (streamed text, throttled).

## UI

- An **Oracle** button in the conversation header, beside Knowledge, opens the
  panel; while Knowledge covers the conversation (expanded, or open on a
  phone) the Knowledge header carries it, and an open document's header does
  on a phone. Nothing floats over the conversation, so **Scroll to latest** and Send
  stay clear. The button shows an activity ring while Oracle works and a dot
  for replies you have not read.
- Waiting messages sit above the message bar, numbered in answer order, each
  removable until Oracle starts on it.
- **Oracle only** (a box under the message bar, remembered per browser, or
  `/oracle` from a session's message bar) asks Oracle alone: the hub refuses
  every tool that would start, message, rename, stop, close, or question a
  session for that message.
- The model under the message bar opens **App settings → Oracle**, where the
  model and effort are chosen and kept on the hub.
- The panel is a right-hand drawer on desktop and a full-height sheet on a
  phone. It shows the transcript (Markdown), tool activity chips, and a
  composer whose Return behaviour follows the session composer.
- Session references, whether chips or `?computer=…&session=…` links, open that
  session.
- Sessions Oracle started get a small **Oracle** badge in the session list.

## Testing

- Unit tests for the store (path confinement, limits, journal rotation), the
  roster and context builder, the journal recorder (transitions only, removal,
  replacement), and each tool against a fake host.
- Runtime tests with a fake SDK client: queueing, streaming, watchdog,
  rung-by-rung recovery, restart mid-turn, and exclusion from discovery.
- Route tests: validation, `202`, Origin refusal, and WebSocket events.
- UI tests: bubble, panel, sending while busy, retry, and session links.
- Live check on the development hub: ask the manager to start a disposable
  session, confirm it appears with its badge, ask what it did, close it, and
  confirm the manager records the removal.
