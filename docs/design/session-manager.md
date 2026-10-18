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
| `structured-memory.json` | App | Optional schema-v1 semantic and episodic records, deletion tombstones, safe audit metadata, and idempotency keys. |
| `structured-memory.backup.json` | App | Last validated structured-memory snapshot used only when the primary is missing. |

The memory tools accept relative `.md` paths only. Absolute paths, `..`,
hidden segments, and symlinks are rejected. Limits are 256 KiB per file and
4 MiB in total. The system prompt forbids storing secrets.

### Structured memory

`AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY` is `off` by default and accepts
exactly `off`, `shadow`, or `on`; any other value stops startup. `off` does not
initialize the structured store or change Oracle's prompt. `shadow` performs
the same local bounded retrieval as `on` and records only count/timing/status
metrics. `on` adds the retrieved records to Oracle's prompt. Neither retrieval
path makes a model or network request.

Records are typed as preferences, facts, procedures, decisions, or outcomes.
They carry a stable ID, exact global/user/computer/project/session scope,
provenance, authority, confidence, validity interval, timestamps, and
supersession links. Direct-user tools and APIs cannot write global records;
those are reserved for policy-authorized imports. Correction preserves and
supersedes the previous record. Forgetting keeps a content-free tombstone, so
retry or import cannot resurrect the value.

Every write is strictly validated before persistence. Credentials, secret-like
entropy, private keys, credential URLs, sensitive paths, unsupported categories
of personal data, malformed Unicode, invalid scopes, and oversized input are
rejected without echoing or logging the value. Files are `0600`; writes use a
synced unique pending file, atomic rename, directory sync, and serialized
in-process commits. Corrupt or unsupported authoritative state is preserved
and makes only structured memory unavailable. It is never replaced with an
empty store.

Retrieval uses exact eligible scopes and current validity, then ranks lexical
relevance, scope specificity, authority, confidence, recency, and stable ID.
At most eight active records are returned. Prompt data is escaped JSON inside
an untrusted-data delimiter, capped at 6,000 characters at whole-record
boundaries; it cannot override policy or the current request. Oracle tool
mutations additionally require explicit remember/correct/forget intent in the
current user message. No session output is promoted automatically.

Back up the whole `<data>/manager/` directory to retain Markdown and structured
memory together. The export API returns deterministic schema-v1 JSON; import
requires an empty store and validates the complete state. V1 rejects unknown
schema versions rather than guessing a migration. Switching from `on` or
`shadow` to `off` leaves the files untouched for rollback.

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
Response style (the user's setting): … (always last)
</agentic_remote_context>

<user_message>…</user_message>
```

The roster is capped at 80 open sessions, and each activity at 120 characters.

## Prompt composition

The text is the same on every hub and for every model. Only the runtime's own
base prompt varies, with the Copilot CLI version (`COPILOT_BIN`).

| Order | Layer | Source | Changes when |
|---|---|---|---|
| 1 | Copilot runtime base prompt, with its safety sections | Copilot CLI | The CLI is updated |
| 2 | Oracle's system prompt, appended (`mode: 'append'`) | `MANAGER_SYSTEM_PROMPT`, `server/manager-context.ts` | A release changes it; sent when the conversation starts or resumes |
| 3 | Turn context: roster, changes, memory index, notes, response style | `buildTurnContext`, `server/manager-context.ts` | Every turn |
| 4 | Recovery brief | `recoveryBrief` | A new conversation replaces a lost one |
| 5 | The user's message, in `<user_message>` | Oracle's message bar | Every turn |

Earlier layers win. Ask mode is a note in layer 3 that the tools also enforce.

Model and effort sit beside the prompt, not in it. Precedence: the
**App settings → Oracle** choice, then `AGENTIC_REMOTE_MANAGER_MODEL` and
`AGENTIC_REMOTE_MANAGER_REASONING_EFFORT`, then Copilot's default.

### Notifications

`OracleNotifier` (`shared/notifications.ts`) turns Oracle's events into
notifications. The hub's Web Push and the native shell both use it.

- **Events:**
  - "Oracle replied" when your message is done;
  - "Oracle couldn't answer" when it fails;
  - "Oracle needs your OK" when it asks to close a session.
- **Once per event.** A retried message that fails again notifies again.
- **Held while watched.** Nothing is sent while an open app shows Oracle's
  panel on a visible screen. That report is renewed every 30 seconds and
  lapses after 90.
- **Category.** These are the `oracle` category for the user's **What notifies
  you** setting. Notifications Oracle decides to send on its own belong there
  too.

### Response style

**App settings → Models → Oracle's answers** offers Concise, Balanced (the
default, and what Oracle did before) and Detailed. The choice is kept in the
hub's [settings profile](settings-profile.md), so it follows you to every device.

- **Where it goes.** `responseStyleInstruction` words it once, as the last line
  of layer 3, every turn.
  - It needs no extra model request and no new conversation.
  - A change applies from the next answer.
  - It also reaches conversations that started under an older system prompt.
- **What no style drops.** The line itself carries the floor:
  - the actual answer;
  - uncertainty;
  - unrecovered errors, with their message;
  - every action taken or declined, with links and reasons;
  - what waits for the user;
  - exact commands, code, paths, IDs and log lines;
  - one entry per session in a status.
- **Precedence.**
  - A request for more or less detail in your message wins for that answer.
  - Session output, tool results and memory cannot change the style.
  - To change it for good, use the setting.
- **Injection.**
  - The style is one of three fixed values, validated on the hub, never free
    text.
  - Roster text is flattened to one line, so a session cannot forge a style
    line.
  - Session text still appears inside the trusted context block, a risk that
    predates this design.

## Tools

| Tool | Purpose |
|---|---|
| `list_computers` | Computers, online state, and providers |
| `list_sessions` | Open sessions, or recent history with `includeClosed` |
| `get_session` | Detail and the last N messages (default 6, maximum 30, each truncated), read as recorded: the session is never opened or resumed. A waiting session's request shows its `requestId`, options, choices, and form fields, so it can be answered |
| `ask_session` | A side question answered from a fork of the session's finished history, without prompting or interrupting it; a session mid-turn has its current state added (Copilot only) |
| `create_session` | Start a session (computer, cwd, title, prompt, provider, model, mode), name it, and send the task. Without a `cwd` it starts in Oracle's session folder for that computer, else your default folder |
| `set_session_folder` | Change Oracle's session folder for a computer when you ask; checked on that computer, kept with Oracle's settings, and allowed in Ask mode since it touches no session |
| `send_to_session` | Send or queue a follow-up to any session; always queued, so a busy session does not refuse it. A closed session is reopened and a suspended one resumed first. A folder-trust prompt is answered only when it is Copilot's genuine terminal prompt (exact options) naming the session's own folder |
| `answer_session` | Answer what a session waits on, so it carries on without you: a permission request (option by name, or approve/deny), including Copilot's folder trust; a question (a choice or free text), several choices, or a form's values; or dismiss it. An optional `requestId` stops an answer reaching a different prompt |
| `rename_session`, `cancel_session` | Rename it, or stop the current turn |
| `close_session` | Ask you to close it. You confirm or decline in the app; the agent cannot confirm for you, so a prompt injected through a transcript cannot delete anything |
| `list_skills` | Your skills (name and description) through the runtime's `skills.discover`, so delegated prompts can name them |
| `memory_list`, `memory_read`, `memory_write`, `memory_append`, `memory_delete` | The agent's memory |
| `structured_memory_search` | Search active records in the exact scopes available to this Oracle turn |
| `structured_memory_remember`, `structured_memory_correct`, `structured_memory_forget` | Explicit, audited structured mutations; unavailable without current-message intent |

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
  queue; `PUT /api/manager/messages/:id` with `{ content }` rewrites a waiting
  one in place (409 once Oracle has started on it, which a message's
  `startedAt` records through restarts and Retry; 400 blank; 413 too long), keeping its id and its place,
  which is its first line in `conversation.jsonl`; `PUT /api/manager/settings` with `{ model, reasoningEffort }` (null for
  the hub default) chooses Oracle's model, and with `{ sessionFolders: { <computer id>: path | null } }`
  its session folders; each part is optional and leaves the rest as it is.
  Only `null` clears a folder (a blank one is a 400), and a computer that is
  not paired is a 404 unless a folder kept for it is being removed.
  The snapshot reports them as `settings` and the socket as
  `manager.settings`. `state.json` keeps `sessionFolders`, the model the SDK
  conversation runs on (`sessionRuntime`), and the model and effort that
  could not start (`unavailableRuntime`); each answer compares the choice with
  `sessionRuntime`, so a change survives a restart or a switch in progress.
- Structured-memory routes are under `/api/manager/structured-memory`: `GET
  /status`, `POST /search`, `POST /records`, `POST
  /records/:id/correct`, `POST /records/:id/forget`, `GET /export`, and `POST
  /import`. Mutations require an idempotency `requestId`; import takes a
  deterministic JSON string and an empty store. All inherit the hub's Host and
  Origin policy.
- WebSocket: `manager.status`, `manager.message` (upsert), and
  `manager.delta` (streamed text, throttled).

## UI

- A round bubble at the bottom right of the conversation opens the panel. It
  sits in one dock with **Scroll to latest**, which stacks above it, laid over
  the timeline's grid area so it stays in the corner however short the
  conversation and never covers Send. Where the conversation is out of view, a
  compact icon stands in: the Knowledge header while Knowledge covers the
  conversation (expanded, or open on a phone), an open document's header on a
  phone, and the phone's session list. The bubble shows an activity ring while
  Oracle works and a dot for replies you have not read.
- While the desktop panel is open, the dock sits 16px left of the panel's
  edge: the panel reports its width (`onWidthChange`), the dock gets
  `data-oracle-open` and `--oracle-panel-width`, and CSS subtracts a docked
  Knowledge panel's `--knowledge-width`, never pushing the dock out of the
  conversation. A phone's full-screen sheet moves nothing.
- Waiting messages sit above the message bar, numbered in answer order, each
  editable in place (Save, Cancel; Ctrl+Enter, Esc) or removable until Oracle
  starts on it. An edit Oracle overtakes goes back to the message bar.
- **Dictate to Oracle** records and transcribes through `/api/transcriptions`
  (`src/voice-recorder.ts`), adding the words to the message.
- **Conversation** is a separate, explicit mode beside dictation. It streams
  microphone PCM to the configured local or paired-computer speech backend,
  shows partials without submitting them, sends each finalized utterance once
  to Oracle, and speaks stable reply segments. Stop remains available in every
  state. Unsupported AudioWorklet, denied permission, model failure, or TTS
  failure leaves typed messages and dictation usable; a failed final returns
  to the composer rather than being silently retried.
- The message field reads "Ask me anything"; while Oracle answers, a separate
  line says that anything sent now waits its turn.
- **Ask | Delegate**, a two-way switch under the message bar remembered per
  browser (`/oracle` in a session's message bar asks the same way). **Ask** is a
  conversation about your work while it carries on: Oracle reads and asks side
  questions, and the hub refuses every tool that would start, message, rename,
  stop, or close a session for that message. Ask questions queue behind
  Oracle's own work only, never behind sessions. **Delegate** lets Oracle start
  and steer sessions.
- The model under the message bar opens **App settings** at **Models →
  Oracle**, where the model and effort are chosen; each computer's Oracle
  folder sits under **Folders**, beside the folder new sessions use. Both are
  kept on the hub (`useOracleSettings` in `src/use-oracle-settings.ts` holds
  the one copy both parts read).
- The panel is a right-hand drawer on desktop, resizable from its left edge
  (340px up to whatever leaves the conversation 360px beside the sessions
  list, at most 960px; remembered per browser, and shown narrower without
  forgetting the choice when the window narrows). The 340px minimum wins on a
  window without room for both, where the panel overlays more of the
  conversation. On a phone it is a full-height sheet. It shows the transcript (Markdown), tool activity chips, and a
  composer whose Return behaviour follows the session composer.
- Session references, whether chips or `?computer=…&session=…` links, open that
  session.
- Sessions Oracle started get a small **Oracle** badge in the session list.

## Conversation-mode operations

Conversation mode is off unless `AGENTIC_REMOTE_ORACLE_VOICE=on` and a complete
profile is configured. `agentic-remote voice-install <profile>` is the only
model installation path; ordinary setup and startup do not download assets.
The selected speech computer performs STT and TTS locally without persisting
raw PCM, synthesized audio, or partial transcripts. Each finalized transcript
is submitted exactly once through normal `ManagerAgent.send` with hub-trusted
voice provenance and forced Ask-only semantics. The panel's Ask/Delegate
selection applies to typed messages only; it cannot make Conversation voice
delegate work, steer sessions, answer permission or trust prompts, or approve
destructive confirmation actions. The message persists as the normal Oracle
user message in conversation history and goes with the normal generated turn
context to Oracle's remote Copilot model. No separate voice transcript or
recording artifact is persisted.

A hub with `AGENTIC_REMOTE_VOICE_COMPUTER` needs only enablement and the paired
computer selection; it does not validate or load local speech paths. The node
advertises availability only after validating its own local profile. Local hub
mode still requires every configured path. The retained pt-BR Faber profile is
explicitly research-only and installation requires
`--accept-research-only`.

One stream per hub is supported initially. Local VAD can duck playback, but
the server owns endpoint and finalization decisions. Confirmed interruption
advances generation, cancels Oracle and TTS, and rejects stale STT, deltas, and
audio. Reconnect never replays microphone frames. See
[Oracle Conversation mode](../oracle-conversation.md) for profile evidence,
browser requirements, topology, and licences.

## Testing

- Unit tests for the store (path confinement, limits, journal rotation), the
  roster and context builder, the journal recorder (transitions only, removal,
  replacement), and each tool against a fake host.
- Runtime tests with a fake SDK client: queueing, streaming, watchdog,
  rung-by-rung recovery, restart mid-turn, and exclusion from discovery.
- Route tests: validation, `202`, Origin refusal, and WebSocket events.
- Structured-memory tests cover privacy rejection, exact scope isolation,
  ranking and prompt caps, supersession/tombstones, restart and corruption
  recovery, atomic failures, import/export, concurrent writes, and tool/API
  authorization. Performance gates enforce retrieval plus prompt assembly at
  p95 <=10 ms for 1,000 records and <=25 ms for 10,000 records.
- UI tests: bubble, panel, sending while busy, retry, and session links.
- Live check on the development hub: ask the manager to start a disposable
  session, confirm it appears with its badge, ask what it did, close it, and
  confirm the manager records the removal.
