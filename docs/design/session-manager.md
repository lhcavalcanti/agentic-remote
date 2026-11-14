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
| `uploads/` | App | Private hub uploads referenced by typed conversation messages; see the Oracle attachment contract in [app-spec](../app-spec.md#37-oracle-session-manager). |
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
Open sessions (N): one line each — id · computer · title · status · provider/mode · model (when reported) · cwd · updated · origin · activity
Changes since your last turn: …
Memory index (MEMORY.md): … (only when changed, after a new SDK session, or after compaction)
Notes: … (an interrupted previous turn, or a recovery)
Response style (the user's setting): … (always last)
</agentic_remote_context>

<user_message>…</user_message>
```

The roster is capped at 80 open sessions, and each activity at 120 characters.

Typed attachments are uploaded once through `POST /api/manager/files`; messages
carry ordered opaque IDs and the transcript retains their metadata. Admission
resolves stored bytes to SDK `blob` (text) or `file` (PDF/images) payloads beside
the unchanged user text. The turn context marks files as untrusted shared data;
their contents cannot grant structured-memory intent. Unowned files can be
removed through `DELETE /api/manager/files/:id`; conversation ownership drives
retention and cleanup. Removing a reference already owned by a message detaches
only the draft. Name-only release tombstones prevent Retry, stale store
updates, or recovery briefs from resurrecting a removed attached message.

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

### New-session model precedence

Oracle never picks a model for the sessions it starts. `create_session` uses:

| Order | Source | Fallback |
|---|---|---|
| 1 | A model the user names, on Copilot unless the Claude Agent provider is asked for | Unavailable: nothing starts; Oracle lists models and asks |
| 2 | The provider's runtime in **App settings → Models** (`newSessionRuntimes` in the hub's settings profile), read as each session starts | Model not offered, or refused before creation: level 3 once, reported. Effort or context it refuses: the same model without that setting |
| 3 | No model: the provider's own default on that computer. For Copilot, its `model` setting (`/config model`) or `COPILOT_MODEL` | — |

Configured effort applies only to the configured model, and only where the
model offers and accepts it. The configured context size applies to whichever
model runs, the configured one or one the user names, where that model offers
and accepts it; otherwise the session runs with default context and the result
says so. An effort or context size the user asks for (`contextTier`) is kept:
if it cannot run (Copilot needs a model for an effort, and long context needs a
model that offers it), nothing starts and Oracle lists the models that offer it
and asks. With no model the provider's default carries no context size.
Copilot is the default provider.

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
| `list_models` | A provider's models on a computer (Copilot unless asked), by the exact ID `create_session` takes, from that provider's own discovery, marking those with long context. A provider recorded unavailable is asked again before it is refused, here and in `create_session`, so one that has recovered since is used. Read-only, so voice may use it |
| `list_sessions` | Open sessions, or recent history with `includeClosed` |
| `list_closed_sessions` | Recently closed sessions, newest first, with when each closed and is deleted and the short context kept at close (title, folder, last prompts, last reply), optionally filtered by words. Read-only, so Ask and voice may use it |
| `get_session` | Detail and the last N messages (default 6, maximum 30, each truncated), read as recorded: the session is never opened or resumed. A waiting session's request shows its `requestId`, options, choices, and form fields, so it can be answered |
| `ask_session` | A side question answered from a fork of the session's finished history, without prompting or interrupting it; a session mid-turn has its current state added (Copilot only) |
| `create_session` | Start a session (computer, cwd, title, prompt, provider, model, effort, context size, mode), name it, and send the task. Without a `cwd` it starts in Oracle's session folder for that computer, else your default folder. It opens with the Copilot SDK unless Oracle's `sessionBackend` setting is `terminal`; a provider without a terminal always uses its SDK. Without a provider it starts on Copilot; without a model it uses the configured default (see New-session model precedence). The model, effort, and context size are checked against the provider's catalog before anything is created (an unreadable catalog leaves that to the provider). A named model or asked-for context size it lacks starts nothing, and the failure lists that provider's models (for a context size, those that offer it) and tells Oracle to ask rather than switch model or provider; a configured default it lacks gives way to the provider's own default, which the result reports. A provider that refuses a listed model only once the task runs leaves the session with that failed turn, which Oracle reads and reports before asking. The result and activity name the session's recorded model: the catalog-checked one it was created with until the session reports its own. The result also says when the session runs with long context, or when the configured long context does not apply |
| `set_session_folder` | Change Oracle's session folder for a computer when you ask; checked on that computer, kept with Oracle's settings, and allowed in Ask mode since it touches no session |
| `set_session_backend` | Change how Oracle opens new sessions (`sdk` or `terminal`) when you ask; kept with Oracle's settings and allowed in Ask mode |
| `send_to_session` | Send a follow-up to any session. A busy session is steered: the message is typed into its running turn (a terminal that is not ready yet takes it as soon as its composer is back). Only a refusal that certainly sent nothing falls back to the session's queue; a possibly-delivered steer is never retried. A closed session is reopened and a suspended one resumed first. A folder-trust prompt is answered only when it is Copilot's genuine terminal prompt (exact options) naming the session's own folder |
| `answer_session` | Answer what a session waits on, so it carries on without you: a permission request (option by name, or approve/deny), including Copilot's folder trust; a question (a choice or free text), several choices, or a form's values; or dismiss it. An optional `requestId` stops an answer reaching a different prompt |
| `rename_session`, `cancel_session` | Rename it, or stop the current turn |
| `suspend_session`, `resume_session` | Suspend a session when you ask, never on Oracle's own initiative, or resume a suspended one, through the owning computer's Pause/Resume lifecycle. A refusal (not idle, background tasks, a delivery in flight, no terminal suspend) returns the computer's reason; an offline computer is refused without asking it. Suspending a suspended session, or resuming one that is not, changes nothing. Task turns may not use either. An instruction injected through a transcript can at most suspend idle sessions, which keep their history and can be resumed |
| `close_session` | Ask you to close it; a closed session stays reopenable for 14 days. You confirm or decline in the app; the agent cannot confirm for you, so a prompt injected through a transcript cannot close anything. With `sessionClosePolicy: 'oracle-started'` it closes an idle session Oracle started, named by its full id, without asking, under the checks in [Closing without asking](#closing-without-asking) |
| `reopen_session` | Reopen a recently closed session through the owning computer's reopen lifecycle, sending nothing; an offline computer is refused without asking it |
| `list_skills` | Your skills (name and description) through the runtime's `skills.discover`, so delegated prompts can name them |
| `memory_list`, `memory_read`, `memory_write`, `memory_append`, `memory_delete` | The agent's memory |
| `structured_memory_search` | Search active records in the exact scopes available to this Oracle turn |
| `structured_memory_remember`, `structured_memory_correct`, `structured_memory_forget` | Explicit, audited structured mutations; unavailable without current-message intent |

Sessions are addressed by ID; the computer is resolved from the live list. Tool
errors return as tool results the model can read, never as thrown failures that
end the turn.

### Closing without asking

`sessionClosePolicy` is `ask` by default; only the settings route changes it.
Under `oracle-started`, `close_session` still asks, naming the first reason,
unless every check passes. Each check fails closed: what cannot be read is a
reason to ask.

| Check | Asks when |
|---|---|
| Provenance | The message is not typed (the tool's guards already refuse voice, scheduled, proactive, task, and Ask turns) |
| Name | The session was named by a shortened id |
| Origin | The registry entry is not `origin: 'manager'`, or is removed or replaced |
| Live state | `readSession` fails, or the session is not idle, or has a pending permission or question, queued or dispatching messages, a failed prompt, a pin, or restart recovery |
| Background work | The list cannot be read or is unsupported, or a task is running or queued, as for suspending |
| Earlier work | A tool call from another turn, such as a stopped task's, is still running: what it starts or uses is recorded only when it ends. Calls are counted by turn at the tool boundary |
| Oracle tasks | Tasks cannot be read, or a task that is not completed or dismissed lists the session as its source or in an attempt, or, before reconciliation records it there, an attempt's turn used it: on the turn's message or a reply to it, in the whole conversation, counting activity recorded but not yet written |
| Turn | The turn the call started in has ended, been stopped, or belongs to an earlier conversation. Each tool call keeps that turn (`AsyncLocalStorage` at the tool boundary), so a late call cannot close under the next message's source or cap |
| Cap | 5 sessions were already closed without asking for this message. The turn and the cap are checked last, and the close is counted before anything is awaited, so parallel calls cannot exceed it. Retries and a restart count the transcript's records |

A close that passes is recorded as `{ state: 'closing', decidedBy: 'oracle' }`
before `closeSession`, then confirmed or failed like a close you confirmed.
Whatever a call records, a close, a request, or other activity, is filed under
the message whose turn made the call, even after Stop.
The tool result reports it, so no note is added; a restart that finishes it adds
one. **Residual risk:** with the policy on, an instruction injected through a
transcript during a typed turn can close up to 5 idle sessions Oracle started.
A session that becomes busy between the live read and the deletion is still
deleted, as with a close you confirm. After **Start over**, a session an
earlier conversation's task turn used counts only once reconciliation has
recorded it on the attempt; so does one a task turn was starting when the hub
restarted. The SDK does not say which turn a call belongs to, so a call the
runtime makes after Stop has drained it belongs to the next turn.

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
  carries your default computer and per-computer folders. Its legacy `mode`,
  `provider`, `model`, and `reasoningEffort` fields are accepted and ignored.
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
  its session folders, with `{ sessionBackend: 'sdk' | 'terminal' }` how
  it opens new sessions, and with `{ sessionClosePolicy: 'ask' | 'oracle-started' }`
  whether it may close idle sessions it started without asking; each part is optional and leaves the rest as it is.
  Only `null` clears a folder (a blank one is a 400), and a computer that is
  not paired is a 404 unless a folder kept for it is being removed.
  The snapshot reports them as `settings` and the socket as
  `manager.settings`; `sessionBackend` is always reported, `sdk` by default, and
  `sessionClosePolicy`, `ask` by default. `state.json` keeps `sessionFolders`,
  `sessionBackend` only when it is `terminal`, `sessionClosePolicy` only when it is `oracle-started`, the model the SDK
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
- The non-empty message draft and active queue edit are one versioned
  browser-local record. Open/close, Dock/Undock, responsive placement, remount,
  reconnect, and authoritative refresh do not clear or submit it. Restored
  text is identified as recovered; storage failure stays visible and blocks
  Send/Save. Accepted delivery clears the durable record before retiring the
  visible text, and a recovered edit whose queue item has gone moves into the
  message field with an explanation.
- **Dictate to Oracle** records and transcribes through `/api/transcriptions`
  (`src/voice-recorder.ts`), adding the words to the message.
- **Conversation** is a separate, explicit mode beside dictation. It streams
  microphone PCM to the configured local or paired-computer speech backend,
  shows partials without submitting them, sends each finalized utterance once
  to Oracle, and speaks stable reply segments. Stop remains available in every
  state. Unsupported AudioWorklet, denied permission, model failure, or TTS
  failure leaves typed messages and dictation usable. An ambiguously failed
  final submission or unconfirmed cancellation closes Conversation without
  returning or retrying the text because Oracle may already have retained it.
- The message field reads "Ask me anything"; while Oracle answers, a separate
  line says that anything sent now waits its turn.
- **Ask | Delegate**, a two-way switch under the message bar remembered per
  browser (`/oracle` in a session's message bar asks the same way). **Ask** is a
  conversation about your work while it carries on: Oracle reads and asks side
  questions, and the hub refuses every tool that would start, message, rename,
  suspend, resume, stop, or close a session for that message. Ask questions
  queue behind Oracle's own work only, never behind sessions. **Delegate** lets
  Oracle start and steer sessions.
- The model under the message bar opens **App settings → Oracle → Model**,
  where the model and effort are chosen; each computer's Oracle
  folder sits under **Folders**, beside the folder new sessions use. Both are
  kept on the hub (`useOracleSettings` in `src/use-oracle-settings.ts` holds
  the one copy both parts read).
- `Ctrl+Alt+O` on Windows/Linux and `Cmd+Alt+O` on Apple keyboards opens or
  closes Oracle without colliding with the browser's history/bookmark
  shortcuts. It focuses Oracle when opening and the active writable session
  composer when closing. While a pinned Oracle and session composer are both
  visible, it moves focus between them instead; unrelated fields, dialogs,
  pending questions and permissions, and IME composition keep their keys.
- The desktop panel defaults to a right-hand overlay and can instead be pinned
  beside the working session from the Dock/Undock control in its header.
  `Ctrl+Alt+P` on Windows/Linux and `Cmd+Alt+P` on Apple keyboards toggles the
  same choice while Oracle is open; App settings has no duplicate placement
  control. It is resizable from its left edge (340px up to whatever leaves the
  conversation 360px beside the sessions list, at most 960px; placement and
  width are remembered per browser, and shown narrower without forgetting the
  choice when the window narrows). The panel falls back to overlay when the
  340px panel and 360px conversation minimums cannot both fit. At 960px or
  narrower it is always a full-height sheet. It shows the transcript
  (Markdown), tool activity chips, and a composer whose Return behaviour
  follows the session composer.
- Session references, whether chips or `?computer=…&session=…` links, open that
  session.
- Every stored prompt, answer, notice, tool activity, and close card shows the
  time the hub recorded it (`createdAt`) through `MessageTime`
  (`src/MessageTime.tsx`), which session transcripts share: the viewer's
  locale, calendar, and timezone, the time alone today, the day added on other
  days, the year in other calendar years, and the full date as its title.
  Waiting prompts keep theirs in the queue, including while edited. A reply
  still streaming has no time until it is stored; an unreadable time shows
  nothing.
- Sessions Oracle started get a small **Oracle** badge in the session list.
- Startup, manual Refresh, reconnect, and visibility return re-read Oracle
  alongside sessions and Dreamer. An in-place refresh keeps the last snapshot
  visible, reports refreshing or stale state, and offers Retry without
  replaying a message or queue mutation.

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
destructive confirmation actions.

The normal persisted `ManagerMessage` stores immutable `source: 'voice'`;
historical user messages without a source load as typed. The store preserves
the first source for a message ID across queued edits, retries, event updates,
restart recovery, and compaction. At the manager tool handler, a centralized
read-only allowlist permits voice to inspect computers, sessions, skills, and
memory and to ask read-only side questions. Every other current or future tool
fails closed for voice, including memory changes and `set_session_folder`.
Typed Ask keeps its intentional memory/settings behavior and typed Delegate
remains unchanged.

The current transcript is escaped and delimited as acoustically untrusted in
the model prompt. It cannot be promoted into memory or settings, and a fresh
runtime's recovery brief excludes the voice message and its linked exchange.
Before every voice prompt enters Copilot, durable manager state binds the voice
taint to that exact SDK session ID. Queue recovery retires that session before
selecting any typed or retried work, and retirement clears the active session
pointer and matching taint in one persisted state update before best-effort SDK
deletion. Thus a crash after prompt entry cannot let a later typed Delegate turn
resume acoustically influenced context, even when remote deletion fails.
The message still appears as exactly one normal Oracle user message in visible
history and goes with the generated current-turn context to Oracle's remote
Copilot model. No separate voice transcript or recording artifact is
persisted. The panel warns both before Start and while active that speaker
identity is unverified, nearby or replayed audio may be submitted, Ask can read
session information, and finalized text is sent to remote Copilot.

A hub with `AGENTIC_REMOTE_VOICE_COMPUTER` needs only enablement and the paired
computer selection; it does not validate or load local speech paths. The node
advertises availability only after validating its own local profile. Local hub
mode still requires every configured path. The retained pt-BR Faber profile is
explicitly research-only and installation requires
`--accept-research-only`.

One stream per hub is supported initially. Local VAD can duck playback, but
the server owns endpoint and finalization decisions. Confirmed interruption
advances generation, cancels backend TTS first, then cancels each captured
voice-owned manager message by ID whether it is still queued or has become
running, without stopping unrelated typed work. It rejects stale STT, deltas,
and audio, and reconnect restores ownership only for queued/running voice
messages. Browser state returns to Listening only after the current generation
and segment have actually drained from Web Audio; stale drain callbacks from a
new segment, interruption, generation change, or close are ignored. A completed
reply with no speakable segment returns to Listening directly. Reconnect never
replays microphone frames. See
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
