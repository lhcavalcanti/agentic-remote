# Agentic Remote application specification

Status: Living product and behavior specification

Agentic Remote is a mobile-first progressive web application for supervising
GitHub Copilot and Claude Agent sessions across trusted computers. This
document records the product decisions and behavior contracts that must remain
stable as the app evolves.

The words MUST, MUST NOT, SHOULD, and MAY describe required, prohibited,
recommended, and optional behavior.

## 1. Product goals

Agentic Remote MUST:

- Let a user supervise local and remote agent sessions from one phone-first
  interface.
- Preserve the ownership, authentication, files, processes, and tools of each
  computer.
- Match important provider behavior rather than presenting a generic chat.
- Make questions and permissions more prominent than passive status updates.
- Keep sensitive files and audio private by default.
- Recover useful state after browser, hub, node, or provider process restarts.
- Remain installable and reliable as an iPhone/iPad PWA.

Agentic Remote is not:

- A cloud synchronization service for repositories or Copilot credentials.
- A second public hub on the production computer.
- A general terminal emulator.
- A permanent audio archive.
- A replacement for encrypted secret or database backups.

## 2. Deployment and ownership topology

The supported topology is:

| Computer | Role | Address | Responsibility |
| --- | --- | --- | --- |
| Hub host | Hub | Configured `HOST:PORT` | UI, local sessions, transcription, push, central Knowledge metadata |
| Worker host | Paired node | Configured `HOST:PORT` | Node-local sessions and authenticated node API |

Any public hostname MUST route to the hub. Paired-node listeners MUST remain
headless and MUST NOT serve the UI.

Transcription is the one hub responsibility a deployment MAY reassign to a
paired computer, because it needs Whisper rather than hub-owned state.

Every session MUST execute on its owning computer. The hub MUST route operations
to that computer without copying its repository, provider authentication,
session history, or tool permissions.

Paired-node requests MUST be authenticated. Pairing tokens and other secrets
MUST NOT appear in source control, browser responses, logs, or documentation.

## 3. Session model

### 3.1 Discovery and visibility

- The Sessions drawer MUST show all configured computers.
- Selecting, creating, or opening a session MUST NOT hide other computers.
- Sessions MUST offer metadata search and All, Needs you, and Working filters,
  plus a hub-owned Suspended visibility toggle that defaults to showing sessions
  paused through Agentic Remote. A committed visibility change MUST survive hub
  restarts and update every connected browser; a failed save MUST leave the last
  committed state visible and report the failure. Filtering MUST keep every
  configured computer visible and MUST NOT change the selected session, its
  draft, or its Knowledge position. Hidden suspended sessions MUST also be
  excluded from keyboard next/previous navigation. Search and the Needs you or
  Working filters MUST disable reordering. With Custom order, All selected and
  no search, active sessions MAY still be reordered while suspended sessions
  are hidden: each active session MUST move with the contiguous suspended
  sessions immediately following it, while leading suspended sessions without
  an active predecessor retain their position. Clearing filters MUST restore
  and persist suspended-session visibility.
- Session ordering MUST be explicit. Custom order remains the backward-
  compatible default; Recent activity, Attention first, and Name views MAY
  reorder the displayed sessions within each computer without rewriting the
  saved custom order. Keyboard next/previous navigation MUST follow the
  displayed order. A failed preference save MUST surface an error.
- The custom session order is owned by the hub, not by each browser. Every
  browser connected to the same hub MUST render the same order without a
  reload, and the order MUST survive a hub restart. Order changes carry a
  monotonic revision; a client MUST ignore a revision older than the one it
  holds. A drag MAY be applied optimistically, but a refused write MUST restore
  the last acknowledged order and report the failure rather than claim a local
  save. A drag MUST submit only the dragged computer's lane, and a session MUST
  NOT move between computers. Suspended visibility shares the same revisioned
  hub snapshot; computer-group order, sort mode, search, and the three primary
  filters remain browser-local.
- Search, the three primary filters, the selected session, and session-list
  scroll position MUST survive browser reloads and responsive layout changes.
  Sessions MUST expose one accessible **Refresh** action that reloads
  authoritative computers, sessions, Oracle, Dreamer, and background-task
  state. Manual refresh, reconnect, and visibility return MUST preserve the
  last usable snapshots and every composer draft, show loading or stale-error
  state with retry, and MUST NOT send, queue, resume, replay, or confirm work.
- Clearing a session replaces its identity, and the replacement MUST take the
  predecessor's exact position in the custom order. Deleting a session MUST
  remove it, and removing a computer MUST remove its lane; a partial or offline
  session listing MUST NOT be treated as evidence that an entry is gone. A
  browser-local order from before the hub owned it MAY seed an empty hub once,
  after which the hub snapshot is authoritative.
- Each session row MUST place **Close** above **Pause**/**Resume** in its
  lifecycle controls. Close MUST use the same confirmed, permanently deleting
  close lifecycle and owning-computer route as **Close session**; Pause and
  Resume retain their existing suspend lifecycle, availability, and labels.
- Pause MUST be unavailable, with a title naming the reason, while the session
  is busy (not idle, or holding a question or permission), owns queued or
  running background tasks, is interrupted or archived, or another suspend or
  resume is pending. The owning computer MUST enforce the same rules and refuse
  with a 409 naming the reason (501 where it cannot suspend terminal sessions),
  never a generic server error; suspending a suspended session returns it
  unchanged.
- Needs you MUST include pending questions, permissions, waiting sessions, and
  errors, including queued delivery that requires confirmation. Pending actions
  MUST take precedence over passive runtime status.
  Working MUST include running background tasks, but MUST NOT represent a
  disconnected computer's last-known activity as live work.
- The New session provider selector MUST show the selected computer's available
  and unavailable providers before creation.
- Computer-group headers MUST NOT show provider tags; provider identity belongs
  to individual sessions.
- Each session's provider and execution-mode badges MUST appear above its chat
  name rather than inline beside it.
- Every open session MUST identify whether it is tmux-backed or SDK-only. The
  UI MUST NOT imply that SDK-only sessions are available through `tmux attach`.
- Normal Copilot SDK sessions MUST discover the owning computer's existing
  Copilot CLI configuration, including configured plugins, MCP servers, skills,
  custom agents, instructions, repository hooks, and host Git operations. They
  MUST use the same local Copilot home and logged-in account as the CLI.
- Copilot SDK clients MUST use the SDK-bundled runtime by default.
  `COPILOT_SDK_BIN` MAY select an explicitly qualified SDK runtime;
  `COPILOT_BIN` MUST remain exclusive to interactive tmux sessions.
- Oracle MUST retain its isolated, skills-disabled configuration and MUST NOT
  inherit normal-session discovery merely because it uses the same SDK client
  factory.
- An idle Copilot SDK session MAY be moved to tmux while preserving its session
  ID, title, working directory, transcript, queue, and runtime settings.
- The move-to-tmux action MUST appear only when the owning computer explicitly
  advertises migration support; legacy nodes MUST fail closed without the
  action.
- A failed move to tmux MUST restore the Copilot SDK session and surface an
  explicit error.
- Claude Agent sessions MUST remain SDK-only and MUST NOT expose a move-to-tmux
  action.
- Active tmux sessions MUST be discovered from the Copilot session actually
  opened by the process.
- A late or ambiguous lock MAY be accepted only when `/proc/<pid>/fd` proves
  that the process has the corresponding `session.db` open.
- Historical sessions MAY be opened from the new-session flow. Reopening a
  retained tmux session MUST explicitly resume its provider session under the
  same ID and preserve its title, working folder, transcript, queue, runtime
  settings, and list identity.
- Reopen MUST serialize with other lifecycle changes and MUST NOT create a
  duplicate provider owner. Preserved queued work MUST resume in FIFO order only
  after the same-ID owner is ready. If saved provider state is unavailable or
  corrupt, the session MUST remain recoverable with its history, metadata, and
  queue unchanged, and the failure MUST be shown explicitly.
- On service startup, an interrupted Copilot SDK session MUST first attempt to
  resume the same provider session ID and reconcile durable provider events.
  Recovery MUST use a monotonically increasing persisted generation, reject
  callbacks from older generations, and coalesce overlapping attempts.
- A terminal provider event (`assistant.turn_end` or `session.idle`) MAY clear
  the interruption and release preserved queued work in FIFO order. An open
  turn, shutdown, abort, missing provider identity, or unsupported resume MUST
  remain explicitly interrupted; restored history MUST NOT be presented as
  restored stream continuity.
- A provider permission MAY become actionable after restart only when the
  installed SDK reports the exact durable pending request through its
  low-level permission RPC. The provider request ID MUST remain private,
  answers MUST be persisted before delivery, and queues MUST remain blocked
  until provider state confirms settlement. Multiple pending permissions or an
  unavailable RPC MUST fail closed.
- SDK user-input and elicitation callbacks are process-local. Their cards MUST
  become stale after restart and MUST NOT accept or replay an answer. A saved
  answer whose callback continuity cannot be proven MUST remain an explicit
  interruption rather than being sent again.
- Managed session records MUST remain visible by default when their provider
  process disappears, including after overnight inactivity. Process loss MUST
  appear as interrupted/recoverable rather than Working or a silent close.
- Session retention MUST be persisted on the owning computer and broadcast to
  connected devices. A user MAY pin a session for review or opt into elapsed-age
  archival; default retention MUST be unlimited for records, not live processes.
  Retention edits MUST be field-level so concurrent devices changing different
  fields do not overwrite each other.
- Implicit archival MUST require an absent provider owner, an idle or
  intentionally suspended session, and the configured elapsed age. It MUST NOT
  affect running/waiting work, queued, running, or detached background tasks,
  pending questions/permissions, queued or uncertain delivery,
  failed/recovering work, or review pins. It MUST NOT delete provider
  history, metadata, files, worktrees, or saved resumability. Archival MUST NOT
  run before startup recovery has probed managed owners, and MUST re-check
  ownership and eligibility when it commits.
- Interrupted and archived records MUST stay read-only until Reopen. Sends,
  queued work, commands, restart, clear, recovery, suspend, and runtime changes
  MUST be refused without consuming queued or failed work. Queue edits,
  removals, reorders, and immediate dispatches MUST be refused by the owning
  computer and disabled in the UI. Automatic dispatchers, including terminal
  and SDK queue drains and a pending context brief, MUST leave that work
  pending in FIFO order, and the durable queue claim MUST refuse a retained
  record so a retention committed mid-drain sends nothing. Reopen sends a
  held context brief once, ahead of the queue, and then drains the queue once
  in order. A refresh MUST NOT
  keep a deleted archived session selected.
- A node resync MUST NOT blank a transcript a browser already holds: roster
  summaries update metadata only. A cached session that reopened after the
  roster snapshot MUST stay listed.
- Restart recovery MUST retain queues without replaying uncertain admissions.
  Missing terminal owners and unrecoverable SDK turns MUST remain reviewable;
  expired user-input and elicitation callbacks MUST NOT become answerable by
  merely reopening a record. A recovered durable permission is the only SDK
  callback exception. The owning service MUST finish automatic SDK recovery
  before it accepts browser traffic. Browser bootstrap, event-stream
  reconnect, and foreground return MUST refresh authoritative session state;
  they MUST NOT issue a second resume mutation or present continuity before
  the owner reports recovery complete.
  Explicit Close/Delete MUST retain their existing user-confirmed semantics.
  See [Session retention](session-retention.md) for settings and cleanup cadence.
- An open new-session dialog MUST preserve user choices across computer status
  updates. If its computer becomes unavailable, it MUST select an available
  computer when one returns and require a new compatible historical selection.
- Automatic computer fallback MUST NOT submit the prior computer's folder.
  Creation waits for a folder owned by the replacement computer. An explicitly
  selected computer's saved default remains usable while its listing loads.
- Copilot sessions MUST expose tracked background tasks when the owning
  runtime advertises task support. The UI MUST show queued, running,
  completed, failed, and cancelled task states, including task progress and
  timestamps where available.
- A session MUST use the blue active-task treatment while at least one
  background task is running. With no running background task, the existing
  green and gray session treatments MUST remain unchanged.
- A foreground response in progress MUST show Working rather than Tasks,
  even while background tasks run. A separate Tasks status action MUST retain
  touch and keyboard access to the task panel without replacing the session's
  activity time. An idle foreground with running background tasks MUST still
  show Tasks; attention, suspension, and offline states retain their existing
  precedence.
- A running SDK background agent MUST make the session row read as active even
  when no foreground turn is open. The composer MUST keep immediate Send
  available and MUST offer Queue; queued text waits for the tracked background
  agent, while detached background shells do not block a new turn.
- Background task reads and cancellation MUST remain scoped to the owning
  computer and session. Task state MUST resynchronize after a reconnect
  instead of relying on a transient event count.
- Every queued or running task MUST expose a visible management area. When the
  owning runtime provides a live cancellation handle, the panel MUST offer a
  confirmed Stop task action. When it does not, the panel MUST explain why
  stopping is unavailable rather than hiding the management state or guessing
  at an operating-system process.

### 3.2 Creation

- The user MUST select the owning computer, available provider, and working
  folder.
- App settings MAY store one validated default session folder per computer in
  browser-local storage keyed by computer ID. A blank default uses that
  computer's home directory, and changing a default MUST affect only sessions
  created afterward.
- The New session and Open previous sheet MUST scroll independently when its
  content exceeds the visual viewport, including while the phone keyboard is
  open, so the final create/open action remains reachable.
- Copilot MUST remain the backward-compatible default provider.
- New Copilot sessions SHOULD be tmux-backed by default.
- Claude Agent sessions MUST use the official Agent SDK and MUST NOT claim to
  be tmux-backed.
- A computer MUST advertise provider availability before the UI permits
  creation with that provider.
- Allow all permissions SHOULD be checked by default.
- tmux allow-all sessions MUST launch with `--yolo`.
- SDK allow-all sessions MUST automatically approve permission callbacks.
- Disabling allow-all MUST preserve per-operation approval.
- Agentic Remote MUST use authentication already configured on the owning
  computer and MUST NOT store or expose provider credentials or implement a
  Claude subscription login flow.
- Submitting a valid new session MUST close the creation sheet immediately and
  show a noninteractive pending row in the owning computer group until creation
  finishes. The row MUST stand where the created session will appear in the
  current sort and be scrolled into view; in Custom order that is the end of
  its computer's lane. Creations on one computer MUST be sent in submission
  order, each after the previous one settles, so each finishes where its row
  stood. The row MUST identify the provider, execution mode, folder, and
  creation state without relying on motion alone. Success MUST replace it with
  the created session in that place; failure MUST remove it and surface the
  error in the active sheet, drawer, or conversation. An older creation
  response MUST NOT close or reset a newer sheet, re-enable its submission, or
  steal selection from newer navigation or creation intent.

### 3.3 Rename, restart, recover, clear, and delete

- Secondary session actions MAY live in a labeled disclosure rather than
  crowding the conversation header. They MUST remain keyboard- and
  touch-accessible, retain their confirmations and disabled states, and close
  independently of the Knowledge panel. Knowledge and the current-folder
  entry point MUST remain directly reachable.
- Rename MUST update the web state and owning tmux/Copilot session when
  supported.
- Restart MUST preserve session ID, title, working folder, transcript, queue,
  runtime settings, and tmux window.
- Restart MUST remain available for an online session in `error` state. Error
  recovery MUST NOT require a direct API call.
- Copilot sessions MUST offer **Recover conversation** in session actions when
  the owning computer advertises context recovery. It MUST be enabled for
  idle, provider-error, or stale-interaction sessions and remain visible but
  disabled while running, waiting, suspended, offline, holding a live prompt or
  queue claim, rebuilding context, or owning queued/running background work.
  Recovery MUST enforce the same ownership checks server-side. Claude sessions
  MUST NOT offer it.
- Recover MUST create a fresh provider session ID while preserving title,
  working folder, runtime settings, execution mode, queue, computer ownership,
  draft continuity, replacement lineage, and notification/Knowledge metadata.
- Recover MUST archive the prior visible transcript as read-only history,
  append a visible recovery boundary, and combine archived and current messages
  in public session projections. Provider transcript refresh MUST replace only
  the current-provider portion.
- Recover MUST seed the fresh provider before queued work with a deterministic,
  bounded, text-only brief containing earliest goal and newest context. The
  brief MUST report included message count and truncation and MUST exclude
  activities, opaque provider IDs, permissions, and tool state.
- After replacement commits, Recover MUST return the replacement ID with
  pending context-rebuild activity without waiting for the provider seed turn.
  The hub MUST carry Knowledge and notification metadata to that replacement
  independently of seed completion. Seed admission failures MUST be published
  and remain visible on subsequent session reads with the preserved queue
  blocked; delivery uncertainty MUST NOT cause an automatic resend.
- Pending seeds deferred by terminal ownership discovery MUST be reconsidered
  when discovery settles. Seed dispatch MUST NOT block startup, discovery, or
  another session's seed, and concurrent discovery MUST NOT dispatch it twice.
- Seed handoff MUST register under the owning session's lifecycle admission
  and remain protected through durable delivery confirmation. Restart MUST NOT
  replace a runtime underneath an admitted or in-flight seed.
- Pending, dispatching, and failed seeds MUST reject provider slash commands,
  including commands allowed during ordinary agent execution, before provider
  lookup or invocation. Stop and explicit conversation recovery MUST retain
  their existing admission and safety rules.
- Recovery MUST atomically persist an existing failed-prompt queue barrier
  alongside its seed so unmodified 1.1.2 startup cannot drain preserved work.
  Only confirmed seed admission may remove that seed-owned barrier. Rollback
  MUST NOT automatically replay uncertain seeds or bypass context rebuilding.
- Clear MUST remove old conversation history permanently. Because populated
  deleted Copilot IDs cannot be safely reused, clear MUST create a replacement
  session ID while preserving folder, title, runtime, and draft continuity.
- Clear MUST keep the reader on the live replacement unless they navigate
  elsewhere, including gaps between removal, replacement, and response delivery.
- Clearing a recovery MUST atomically remove its seed-owned failed-prompt
  compatibility barrier before dropping recovery ownership. An unrelated failed
  prompt MUST remain recoverable even when its content equals the old brief;
  a refused clear write MUST retain both the seed and its barrier.
- A refused replacement write MUST preserve the original provider history and
  uploads. A terminal clear MUST restore the original command and working
  folder before reporting that refusal, or explicitly report restoration failure.
- Cleanup failures after a replacement commits MUST be surfaced on the new
  session; they MUST NOT roll back the accepted identity or destroy its runtime.
- Clear MUST exclude new session admissions while joining earlier loading and
  delivery handoffs. It MUST NOT cancel those handoffs merely to become idle.
  Work admitted while Clear waits MUST cause refusal before the original
  provider or history is replaced, even if that work completes quickly.
  A successfully persisted enqueue MUST count as admitted work before its
  response is published, even if the previous turn becomes idle meanwhile.
  A refused queue write MUST NOT count as a successful admission. Deferred
  eligible FIFO work MUST wake after the enqueue and Clear release their locks.
  A native message or command with possible pane effects MUST protect joined
  Clear even when delivery is uncertain. It MUST still reject with uncertainty,
  not claim successful delivery. Definite preflight failures MUST NOT count as
  native activity.
  Replacement MUST revalidate idleness and identity at its mutation boundary.
- Cleared and deleted session identities MUST stay retired across restart,
  including after their last replacement is deleted. Retirement metadata MUST
  commit atomically with the identity change, and stale provider listings MUST
  NOT recreate those identities.
- Delete MUST close the owning provider process/session after confirmation and
  remove Agentic Remote state and session uploads. A session selected while
  another one is closing MUST stay selected; only a reader still on the closed
  session moves to a remaining one.

### 3.4 Host reboot and power-loss recovery

- Each owning computer MUST persist whether an open session is SDK- or
  tmux-backed.
- Actively discovered tmux Copilot sessions MUST be persisted as tmux-backed
  and listed as open while their process runs. Discovery alone MUST NOT add
  them to the persisted terminal recovery set; once such a process exits it
  MUST be listed as closed and MUST NOT be recreated.
- A tmux session MUST join the persisted terminal recovery set when Agentic
  Remote creates, moves to tmux, reopens, suspends, resumes, reconfigures,
  restarts, clears, or recovers it, or sends it a prompt, command, queued
  item, or answer.
- After host boot, missing terminal sessions in the recovery set MUST be
  recreated in tmux with the same Copilot session ID, cwd, title, allow-all
  setting, model, effort, context tier, and agent mode.
- Existing live tmux sessions MUST be detected and MUST NOT be duplicated.
- SDK sessions MUST remain visible and MAY resume lazily when opened.
- Claude Agent sessions MUST resume by their persisted provider session ID
  after an Agentic Remote restart.
- Closed or deleted sessions MUST NOT be recreated.
- One failed terminal recovery MUST surface an error for that session and MUST
  NOT prevent the service or other sessions from recovering.
- Recovery state MUST remain on persistent local storage on the owning
  computer. NFS MUST NOT be required for repositories, credentials, or Copilot
  session state.

### 3.5 Read-only session resources

- The selected session's action menu MUST expose **Skills** and **MCP servers**.
  `/skill`, `/skills`, and `/mcp` MUST open the same web-native views, with optional
  trailing text treated only as a local list filter.
- Opening or refreshing these views MUST NOT send or queue a prompt, invoke a
  provider command or MCP tool, change configuration, or create/resume a provider
  session solely for inspection.
- Catalogs MUST belong to the selected computer, session and provider. Existing
  live metadata, configured workspace defaults, last-known reports, unsupported
  inspection, genuine empty lists and fetch failures MUST be distinguished.
  Last-known reports MUST retain their original capture time.
- Copilot folder discovery MUST NOT be presented as live terminal configuration.
  Claude sessions without reported metadata MUST be shown as unavailable rather
  than starting a query or guessing from configuration files.
- Only explicit resource summaries MAY cross the API boundary. Raw MCP configs,
  environment values, headers, URLs, command arguments, account/credential
  information and provider error strings MUST NOT be exposed.
- Resource views MUST preserve hidden history drafts and collapsed pastes.
  Queued rewrites MUST NOT execute these local view commands. A changed or retired
  session/pairing MUST invalidate pending results and close its old view, including
  cwd, execution-mode, suspension and same-ID re-pair transitions.
- Resource reads MUST have an owning-server deadline. Cancellation, disconnect
  and shutdown MUST settle metadata requests and release their listeners without
  aborting an inference turn or disconnecting its shared provider transport.
  A refused clear MUST retain the authoritative session's resource observations;
  retirement follows the replacement commit, including post-commit cleanup failure.
  A committed replacement MUST publish its removal/replacement identity events
  even when upload cleanup fails, reporting cleanup separately so connected
  clients retire their old resource views.
- Lists MUST support filtering, refresh, keyboard tab navigation and phone-sized
  layouts. Loading, empty, unavailable and error states MUST remain actionable;
  viewing metadata MUST NOT dismiss an unanswered agent question or permission.

### 3.6 Side questions

- A Copilot session MUST offer **Ask** in its header, and `/ask` or `/btw` in
  the composer, when its owning computer advertises side questions. Other
  providers and computers that do not advertise them MUST NOT offer it, and
  there `/ask` goes to the agent like any other command.
- The owning computer MUST answer from the session's saved conversation
  through its Copilot SDK, without tools. A side question MUST NOT send or
  queue a prompt, type into a tmux pane, add to the session's history, or
  change its status, whether the session is SDK- or tmux-backed.
- The saved history is forked into a temporary session that is deleted
  afterwards. The fork MUST NOT appear in session lists or history, even
  after a restart, so one that cannot be deleted is retired. While a turn is
  unfinished, the fork MUST stop before that turn's first prompt, so the
  question is not answered as that prompt. A prompt that started while forking
  is caught from the fork's own history and the fork is forked again before it.
- Questions are limited to 4,000 characters. One deadline of two minutes covers
  starting the runtime, forking, and answering, and cleanup is bounded
  separately, so neither the request nor shutdown can hang on it. A failure
  MUST be shown beside its question with a retry and MUST NOT affect the
  session.
- Side questions MUST dock above the message bar, not open over the
  conversation. While the thread is open the message bar asks aside: it is
  labelled as a side question, shares the thread's dashed outline, offers
  **Ask** in place of Send, attachments, recording, and Queue, and MUST NOT
  send, queue, or run a command. **Stop** remains. Escape, **Back to
  message**, or **Ask** again returns the bar to the session's own draft,
  which MUST be left exactly as it was: message-history recall and dropped
  files MUST NOT reach it while the bar asks aside. Escape puts the dock away
  before a knowledge panel beside it, unless focus is in that panel or the
  panel covers the conversation.
- The thread belongs to its session. It MUST keep answering while another
  session is selected, and the answer, the open thread, and any follow-up
  being typed MUST be there on return.
- Follow-ups MUST carry up to six earlier answered questions from the thread,
  oldest first, as context. **Clear** empties the thread.
- One question per session is answered at a time. A follow-up can be typed
  while one is being answered, and **Ask** is available again once the answer
  arrives.
- A `/ask` question that cannot be asked yet, because the computer is offline
  or another question is pending, MUST wait in the bar rather than be lost.
- Answers belong to the page: kept per session until reload, discarded when the
  session is closed or removed, or its computer is removed, and never
  persisted or sent elsewhere.
- Return MUST follow the composer: it asks on a desktop and inserts a newline
  on a phone, where **Ask** sends; Ctrl/Cmd+Enter asks on either.

### 3.7 Oracle (session manager)

Oracle is the session manager agent. Its design is in
[docs/design/session-manager.md](design/session-manager.md). Only the
user-facing name is Oracle; routes (`/api/manager`), events (`manager.*`),
settings (`AGENTIC_REMOTE_MANAGER*`), and the data folder keep the manager name.

- A hub MUST offer Oracle from a round 48px bubble at the bottom right of the
  conversation, above the status line and message bar. **Scroll to latest**
  shares its dock and stacks above it, so neither MUST ever cover the other or
  Send. While Oracle's desktop panel is open over that corner, the dock moves
  to just left of the panel's edge, following it as it is resized, so Scroll
  to latest stays in reach; a docked Knowledge panel that the panel already
  covers counts toward the distance. Where the conversation is out of view, a compact Oracle icon stands in:
  in the Knowledge header while Knowledge covers the conversation (expanded,
  or open at all on a phone), in an open document's header on a phone, and in
  the phone's session list beside **Manage computers**. The button shows a
  working ring, an unread dot, and every current state in its accessible name,
  such as "Oracle, working, new reply". `Ctrl+Alt+O` on Windows/Linux and
  `Cmd+Alt+O` on Apple keyboards opens or closes Oracle. Opening focuses
  Oracle's message field; closing focuses the active writable session message
  field. With Oracle pinned beside the session, the shortcut instead moves
  focus between those two fields while either one owns focus. It MUST NOT take
  a key from another field, a dialog, a pending permission or question, or an
  IME composition.
- On desktop, Oracle opens as a non-modal overlay by default and MAY be pinned
  beside the working session with the visible **Dock Oracle** control in its
  header; the same control becomes **Undock Oracle** while pinned.
  `Ctrl+Alt+P` on Windows/Linux and `Cmd+Alt+P` on Apple keyboards toggles
  that choice while Oracle is open. App settings MUST NOT expose a second
  placement control. Both placements are resizable from the panel's left edge
  by drag or arrow keys (Home or a double-click resets it) and the placement
  and width are remembered on this device. Widening stops where the
  conversation would have less than 360px beside the sessions list; the panel
  is never narrower than 340px, so a window without room for both falls back
  to the overlay without changing the saved desktop preference. At 960px or
  narrower it is always a full-height overlay sheet. A hub with
  `AGENTIC_REMOTE_MANAGER=off` shows no button.
- Oracle's message field reads "Ask me anything" and is labelled "Message
  Oracle". While Oracle is answering, a line above it says that anything sent
  now waits its turn, and Send becomes **Queue message**. **Dictate to
  Oracle** records from the microphone (Cancel, a timer, **Stop &
  transcribe**; at most 15 minutes), transcribes on the hub as a session's
  recording does, and adds the words to the message rather than sending them.
  Closing the panel discards a recording in progress.
- Oracle's non-empty message draft and queued-message edit MUST be saved in
  versioned browser storage independently of whether the panel is open,
  docked, overlaid, or moved by a responsive layout. A remount or reload MUST
  restore the text without sending it and identify it as recovered. If a
  recovered queue item has already left the queue, its edited text MUST move
  to the message field with an explanation. A storage failure MUST remain
  visible and block Send or Save; accepted delivery MUST clear durable text
  before retiring the visible draft so cleanup failure cannot silently invite
  a duplicate.
- A separate **Conversation** control MAY stream speech continuously only when
  `AGENTIC_REMOTE_ORACLE_VOICE=on` and a complete explicitly installed profile
  is available. There MUST be no automatic/default profile, and setup and
  startup MUST NOT download models or enable the feature.
- Conversation microphone PCM MUST travel only to the hub and, when selected,
  one authenticated paired node. The selected computer MUST perform STT and
  TTS locally. Conversation mode MUST NOT persist raw PCM, synthesized audio,
  or partial transcripts. Each non-empty finalized transcript MUST be submitted
  exactly once through the normal `ManagerAgent.send` path with trusted voice
  provenance and `answerOnly: true`, regardless of the browser's current
  Ask/Delegate selection. That provenance MUST remain immutable on the normal
  persisted `ManagerMessage` through queueing, events, edits, retries, restart
  recovery, and compaction; historical messages without provenance MUST retain
  typed/manual semantics. The hub MUST enforce the same policy for hub-local
  and paired-node speech.
- A voice final MUST be read-only at the manager tool-handler boundary. It MAY
  use explicitly classified read/query tools needed to answer, including
  session reads and side questions, but MUST NOT delegate or steer sessions,
  answer permissions, trust prompts, or questions, request destructive
  confirmation, change the Oracle session folder, or write, append, or delete
  Oracle memory. Tools not explicitly classified as read-only MUST fail closed
  for voice. Typed Ask and typed Delegate policy MUST remain unchanged.
- The model prompt MUST delimit the current finalized transcript as
  acoustically untrusted, with speaker identity unverified. Voice text MUST NOT
  be promoted into Oracle memory, settings, trusted instructions, or recovery
  briefs, and recovery MUST omit the voice exchange linked to that message.
  This is a provenance and authorization boundary, not speaker authentication.
  Finalized text remains exactly one visible normal Oracle user message in
  conversation history and is sent with Oracle's generated context to remote
  Copilot inference. No separate voice transcript or recording artifact may be
  persisted.
- Before Conversation starts and while it is active, the UI MUST visibly state
  that speaker identity is not verified, nearby or replayed audio may be
  submitted, Ask can read session information, and finalized text is sent to
  remote Copilot. It MUST also state that Conversation voice is Ask-only and
  MUST NOT describe the complete experience as offline.
- Partials MUST remain display-only. If normal-message submission fails, or
  cancellation of a superseded submitted message cannot be confirmed,
  Conversation MUST fail closed without restoring or retrying the final text
  because Oracle may already have retained it. A disconnect MUST discard the
  current utterance rather than replay PCM or a finalized transcript. TTS
  failure MUST leave the text reply usable, and typed input plus **Dictate to
  Oracle** MUST remain available.
- Oracle replacement snapshots MAY start TTS for each stable completed
  sentence before the full reply finishes. This sentence-level early playback
  MUST NOT be described as engine-incremental synthesis unless the selected
  engine has measured evidence that it emits audio before finishing that
  sentence. Every engine callback or fallback result MUST be split into
  monotonic PCM frames that fit the advertised maximum encoded frame size;
  cancellation, output overflow, or delivery failure MUST stop further frames
  and MUST NOT emit `audio_end`.
- Conversation mode MUST require microphone permission, `getUserMedia`,
  `AudioWorklet`, Web Audio playback, and WebSocket support. If a required
  browser primitive is unavailable, it MUST refuse to start and offer
  dictation instead of using a deprecated capture fallback.
- Enablement and the selected speech computer MUST be parsed independently
  from local engine paths. A hub selecting a paired node MUST NOT require local
  STT/TTS assets; the selected node MUST validate its own complete local engine
  configuration. Hub-local mode MUST remain strict. A missing, offline, or
  incapable selected computer MUST advertise an explicit unavailable reason
  and MUST NOT silently fall back to another computer.
- Voice installation MUST stage below
  `<data>/models/oracle-voice/.staging-*`, show applicable licenses before any
  download, permit HTTPS for initial and redirected requests only, enforce the
  exact pinned byte count while streaming with bounded timeout/retry behavior,
  and verify SHA-256 before extraction or use. Every archive MUST pin expanded
  bytes and entry count. The manifest compression type MUST select the exact
  streaming decoder, and extraction MUST process one header at a time without
  materializing the complete member list. It MUST abort before extracting an
  entry that would exceed either pin and reject compression mismatch, corrupt
  streams, traversal, duplicate paths, path-type conflicts, sparse files,
  links, devices, FIFOs, and every type except regular files/directories. The
  final staged tree MUST be revalidated for containment, type, count, and bytes.
  Publication MUST serialize per profile, recheck installed content while
  locked, clean failed/conflicting staging, and atomically activate only a
  confirmed complete version. Failure MUST leave the prior active profile
  unchanged. A research-only profile MUST print its full notices and require
  explicit noninteractive acknowledgement before network access. Existing
  `AGENTIC_REMOTE_ORACLE_VOICE` and
  `AGENTIC_REMOTE_VOICE_*` values MUST survive setup in the mode-`0600`
  environment file without being printed.
- Oracle is one Copilot SDK conversation on the hub, run by a runtime process
  of its own. Its tools only manage sessions and its own memory, so it MUST NOT
  run commands or edit files; work it accepts becomes a normal session on a
  chosen computer, named, given its task, and badged **Oracle** in the session
  list.
- In **Delegate**, Oracle MUST be able to steer every session, not only the
  ones it started: it messages any session, reopening a closed one or resuming
  a suspended one first, and answers what a session waits on (a permission
  request, a question, or a form) so the session carries on without you.
  Creating or messaging a session answers Copilot's folder-trust prompt, and
  only that genuine prompt for the session's own folder, then delivers the
  message; anything else it is shown goes through Oracle's judgment instead. Oracle approves what a
  session needs for its task and denies, or asks you about, anything
  destructive or beyond it; every answer appears in its transcript.
- **Ask** is the panel's conversational mode: you ask Oracle about your
  sessions while their work carries on. Oracle answers from the current state,
  reading sessions as they are recorded and asking side questions that fork a
  session's finished history, with the current state of a session still in a
  turn added so its answer is not mistaken for the whole story, and MUST NOT
  interrupt, cancel, redirect, prompt,
  or otherwise change any session or its work. The hub refuses every tool that
  would start, message, rename, stop, or close a session for that message, and
  Oracle's reads never open, resume, or reconcile a session. Oracle's memory and
  settings are its own and stay writable. Under the message bar, an **Ask |
  Delegate** switch chooses the mode, remembered per browser; **Delegate** lets
  Oracle start and steer sessions. `/oracle <question>` in a session's message
  bar is a shortcut
  that asks the same way and never reaches that session. While Oracle is
  unavailable or still loading, `/oracle` stays in the message bar with the
  reason; a question that cannot be sent waits in Oracle's message bar with
  the error.
- Oracle's model and reasoning effort are chosen in **App settings → Models →
  Oracle** (also reached from the model shown under Oracle's message bar). The choice is
  kept on the hub for every browser and applies from Oracle's next answer: a
  chosen model is switched to in place; returning to Copilot's own default
  starts a new conversation briefed on the old one. The hub records what the
  conversation runs on, so a change takes effect even across a restart or
  while a switch is in progress. Unset, the hub uses
  `AGENTIC_REMOTE_MANAGER_MODEL` and `AGENTIC_REMOTE_MANAGER_REASONING_EFFORT`
  (either alone), else Copilot's default. The list shows the hub's own Copilot
  models, with **Retry** if they cannot be read. A model that cannot start
  falls back to the default and Oracle says so until the choice changes or you
  **Start over**.
- **App settings → Models → Oracle's answers** chooses Concise, Balanced
  (default), or Detailed. It is part of the settings profile (§9.3) and
  applies from Oracle's next answer, with no extra model request. Every style
  MUST keep:
  - the answer;
  - any uncertainty;
  - unrecovered errors;
  - each action taken or declined, and why;
  - anything waiting for the user;
  - the exact commands, code, paths, IDs, or log lines needed to act.

  A request for more or less detail in a message MUST win for that answer.
  Session output, tool results, and memory MUST NOT change the style.
- **App settings → Folders** chooses, per computer, where Oracle starts new
  sessions, beside where yours start; each folder is checked on its computer before it
  is kept on the hub. Oracle keeps them as its own settings and changes one
  when you ask it to, which App settings then shows. A session's task can
  still name another folder, and a computer without one uses your default
  session folder, else its home directory.
- **App settings → Oracle → Opens new sessions with** chooses how Oracle opens
  the sessions it starts: the Copilot SDK, which is the default, or a terminal
  (tmux). It is kept on the hub with Oracle's settings, Oracle changes it when
  you ask, and existing sessions are unaffected. A provider without a terminal
  always uses its SDK, and the New session dialog keeps its own choice. A hub
  from before this setting does not report it and still opens terminals, so
  App settings MUST say so instead of offering the choice, and MUST show an
  error rather than "Saved" when a hub's answer does not keep the choice.
- **App settings → Oracle → Periodic checks** MAY opt Oracle into read-only
  status reviews. It MUST be disabled by default and offer 1, 2, 4, or 8 hour
  cadences, an IANA timezone, and local whole-hour quiet hours; equal quiet
  start and end disables the quiet window. The default policy is every 2 hours
  in UTC with quiet hours from 22:00 to 07:00. Settings, the next eligible
  check, and the latest scheduled-check state are hub-owned and visible in App
  settings. Pausing MUST clear the next check and timer, cancel a scheduled
  check that is still waiting, and retain transcript history.
- Periodic checks MUST reuse Oracle's single durable queue and runtime. Exactly
  one timeout MAY wait for the next eligible instant; there MUST NOT be a
  polling loop or second Oracle process. A due check appends one deterministic
  **Scheduled check** after user work already waiting, advances the persisted
  cursor only after the message is durable, and coalesces missed intervals
  after restart or while a prior scheduled check is still queued/running into
  at most one catch-up rather than replaying a backlog. Quiet hours MUST defer
  inference itself, not only notification delivery. A scheduled result that
  crosses into quiet hours MUST remain in the transcript without raising a
  push or native notification.
- A scheduled check MUST be answer-only and handler-enforced read-only. It MAY
  inspect computers, sessions, history, and Oracle's read-only memory surfaces,
  but MUST NOT start, steer, rename, stop, close, or answer for a session,
  change settings, request confirmation, or mutate Markdown or structured
  memory. Unclassified tools MUST fail closed. Model/runtime failures use
  Oracle's normal recovery ladder and remain visible with **Retry**. Failure to
  admit the durable check retries after 1, 5, then 15 minutes while enabled,
  with only one retry timer. Replies use the existing Oracle unread and push
  notification scope; quiet hours do not create delayed duplicate notices.
- Every turn MUST start with a context block the hub generates: computers, open
  sessions (ID, computer, title, status, folder, origin, task, and activity),
  changes since the last completed turn, and `MEMORY.md` when it changed.
  Background changes MUST NOT be streamed to the model between turns.
- Structured memory MUST be optional and hub-local beside the existing
  Markdown memory. `AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY` MUST accept only
  `off`, `shadow`, and `on`, default to `off`, and fail startup for any other
  value. `off` MUST preserve the pre-feature prompt path and create no
  structured-memory file. `shadow` MUST run bounded local retrieval for safe
  count/timing/status metrics but inject no text and MUST give the model the
  same system prompt and tools as `off`; only `on` exposes memory tools. `on` MUST inject at most
  eight active records and 6,000 characters, escaped and delimited as
  untrusted evidence that cannot override policy or the current request.
  Retrieval MUST make no model or network request. Because search stores
  nothing, its query MUST be bounded to 1,000 characters rather than refused
  and MUST NOT be privacy-rejected; scopes keep structural validation.
- Structured records MUST use exact global, user, computer, project, or
  session scope and carry schema version, stable ID, kind, provenance,
  authority, confidence, validity, timestamps, and supersession. Direct-user
  writes MUST NOT use global scope or correct or forget global or
  policy-authorized records in any scope. Remember, correction, and forgetting MUST
  be explicit, idempotent, audited without raw values, and privacy-validated
  before any durable or temporary write; import MUST privacy-validate every
  free-text field, including provenance, tombstone, and audit metadata.
  Project roots MUST get every pattern check on the whole path, with
  entropy judged per path segment plus a whole-path token check. Correction MUST preserve and
  supersede history; forgetting MUST create a content-free tombstone that
  prevents retry or import from resurrecting the value. Oracle tools MUST
  require matching intent in the current user message and MUST NOT mutate a
  record outside that turn's exact scopes, fixed from the defaults the
  message was sent with when its turn starts. Session output MUST NOT be promoted
  automatically.
- Structured-memory persistence MUST serialize concurrent writes and use
  private, synced, atomic files with a validated prior snapshot. Corrupt,
  inconsistent, symlinked, oversized, or unsupported authoritative state MUST
  remain untouched and disable only structured memory with visible safe
  status. Size MUST be checked before reading. A state file other users can
  access MUST be tightened to 0600 when the hub user owns it and refused
  otherwise. A failed publication whose rollback also fails MUST make
  structured memory unavailable until restart. The rest of Oracle MUST remain available. Export MUST be
  deterministic; import MUST require an empty store, validate the complete
  state, and accept any export within the store size limit. Turning the feature off MUST leave state intact for rollback.
- Sending MUST NOT be refused because Oracle is busy, recovering, or offline.
  Messages wait in a durable first-in, first-out queue and are answered one at
  a time. Waiting messages are shown above the message bar, numbered in the
  order they will be answered and marked **Ask** where chosen. User-created
  messages can be edited or removed before Oracle starts on them; scheduled
  checks are labelled **Scheduled check** and are not editable or removable.
  **Edit** rewrites the
  message where it stands, keeping its identity and place in the queue rather
  than queueing a replacement, with **Save** and **Cancel** (Ctrl+Enter and
  Esc on a keyboard). Once Oracle has started on a message, including one a
  restart interrupted or Retry requeued, it cannot be edited; an edit that
  arrives too late is handed back to the message bar instead of being lost. Edits are kept in the
  hub's transcript like the queue itself. The queue is kept on the hub, so it
  survives a reload, a reconnect, and a hub restart, and a snapshot lists every
  waiting message however long the transcript. Only a blank message or
  one over 100,000 characters is refused. Oracle being busy is the only thing
  a question waits for: sessions working in the background never hold it up,
  and it never holds them up.
- A failed turn MUST recover by itself: retry on the same conversation, then
  restart the runtime and resume it, then start a new conversation briefed from
  memory and the latest exchanges. Only when all of these fail is the message
  marked failed, with **Retry**. A turn interrupted by a restart is retried once
  and told to check what already happened. A turn has a 15-minute watchdog.
- Oracle's SDK conversations MUST NOT appear in session lists or history.
  Their IDs are recorded and excluded before they are created.
- Oracle MUST NOT close a session itself. It can only ask, as a card with
  **Close session** and **Keep it**, and the session stays open until you
  confirm there. Your answer, and any deletion, reach the agent on its next
  turn so it can update its memory.
- Oracle's data lives in `<data>/manager/`: app-owned state, transcript,
  queue, journal, registry, and settings, plus the agent's Markdown memory under
  `memory/`, and optional `structured-memory.json` with its validated backup.
  Existing app-owned recoverable files that cannot be read are set aside
  rather than stopping the hub. Structured memory is stricter: corrupt or
  unsupported authoritative state is preserved in place and reported
  unavailable. **Start over** begins a new conversation and keeps both memory
  forms.
- Session links in replies use `?computer=<id>&session=<id>` and open that
  session. Each message carries your default computer and folders. Oracle
  MUST NOT choose a model itself; a session it starts uses, in order:
  1. a model you name (below);
  2. the provider's runtime in App settings → Models (model, effort, context,
     mode), read from the hub's settings profile as the session starts;
  3. no model, so the provider's own default on that computer applies. For
     Copilot that is its `model` setting (`/config model`) or `COPILOT_MODEL`.
- Copilot is the default provider. A configured default the provider lacks,
  or refuses before creating anything, gives way to the provider's own default
  once, and Oracle tells you. Configured effort or context the model lacks or
  refuses is dropped and the model kept. An effort you ask for is never
  dropped: if it cannot run, as on Copilot without a model, nothing starts and
  Oracle lists the models and asks.
- When you name a model, Oracle MUST start a Copilot session with that model's
  exact ID from discovery, because Copilot hosts Claude and other model
  families; it uses the Claude Agent provider only when you ask for that
  provider. It reports the model the session started with. A model the
  provider lacks starts nothing: Oracle lists the available models and asks,
  never switching model or provider itself. A provider that refuses a listed
  model only once the task runs leaves that session with a failed first turn,
  which Oracle reports before asking the same way.

### 3.8 Oracle Dreamer foundation

- Dreamer MUST be disabled by default and enabled explicitly in App settings
  with a saved hub-wide IANA timezone. Its fixed schedule is 02:00 local time;
  same-day catch-up ends at 08:00. DST repeats MUST NOT duplicate a daily run,
  and a missing 02:00 MUST use the first later valid local time. Enablement
  MUST disclose that it also opts the hub into proactive Oracle analysis,
  which MAY use the selected Oracle model to classify admitted lifecycle
  findings. It MUST NOT promise that enabling Dreamer makes no model calls.
- This first slice MUST perform deterministic local metadata review:
  journal-observed session state and eligible structured-memory metadata, not
  prompts, titles, general transcript contents, memory contents or external
  inference. Its only session-content adapter MAY passively read the exact
  owning session to validate a successful root `task_complete` result carrying
  the server's trusted marker. That result MUST remain transient and MUST NOT
  become planning input.
  Unavailable durable todos, incomplete history and source freshness limits
  MUST be visible rather than represented as a complete review. Session
  candidates MUST use the exact computer/session identity, deduplicate current
  and carried entries by that identity, and exclude invalid or partial IDs,
  generic open-session metadata, historical orphans, closed/completed sessions
  and entries with no actionable source. Exclusions MUST be reported as counts
  rather than rendered as review cards.
- Daily run claims, generation/lease fences, plans and user edits MUST persist
  before success. Disable, expiry, shutdown and restart MUST prevent stale
  workers from replacing a committed plan. Bounds and storage failures MUST
  be reported without silently resetting state.
- Oracle MUST present a dated morning plan with priority reorder, skip and
  restore. Memory and carried review items MAY also be marked done as plan
  review state. A session-derived item MUST NOT expose generic **Done**:
  only a trusted completion proposal may expose **Review completion**, and an
  explicit confirmation MUST re-read the exact message and persist bounded
  provenance before marking the item done. The same item/evidence pair MUST be
  idempotent; changed, missing, plain-text, background-agent, or failed-tool
  evidence MUST be refused. Completion evidence older than the latest root user
  turn MUST also be refused. These actions MUST never prompt, resume, stop,
  close, or otherwise mutate a session. Concurrent stale edits MUST be refused
  and refreshed.
- Refresh and evidence retry MUST reload and reconcile authoritative sessions,
  live background tasks and the current Dreamer plan without duplicating cards
  or discarding the active draft/order. Offline, pending, stale and error states
  MUST remain distinct and actionable. Background Tasks is the live provider
  task surface; the morning plan is durable review state. Review edits affect
  only the latter, while both participate in the same authoritative refresh.
- A journal-derived plan item is a suggestion only. It MUST say that Oracle has
  not investigated or assigned the work, MUST NOT expose a generic completion
  action, and MUST NOT be treated as execution evidence. Asking Oracle to
  investigate MUST create or reuse a durable task with an owner, next action,
  status and replay-safe source identity before the suggestion is retired.
  The task MUST retain its source plan/item identity, and the suggestion MUST
  persist the linked task ID in the same plan mutation that retires it. Replayed
  investigation requests, including carried session suggestions, MUST reuse
  that task and attempt.
- Durable Oracle tasks MAY be created from the existing proactive lifecycle
  inbox or an explicit Morning Plan investigation. They MUST persist before
  inbox acknowledgement or execution dispatch, use idempotent request IDs, and
  retain attempt history, linked execution sessions, bounded tool/test evidence
  and explicit failure or blocked reasons. A queued or running attempt MUST NOT
  be duplicated by another dispatch. Refresh, startup, manager updates and
  session updates MUST reconcile task state without polling or a second wake
  endpoint. A failed Oracle manager turn MUST NOT make a task retryable while
  an authoritatively linked execution session is still running.
- An Oracle task MUST reach `completed` only after the user reviews and confirms
  a successful root `task_complete` marker from the exact linked execution
  session in the exact root user turn dispatched for the current attempt.
  Durable prompt/message identity and transcript order, not cross-computer
  timestamps or the latest arbitrary user text, MUST bind the result to the
  attempt. Journal text, assistant prose, task labels, idle state and failed
  tools MUST NOT imply completion. Late evidence from an older attempt MAY
  update that attempt's history but MUST NOT replace the current attempt's
  status. User-owned tasks instead MUST expose explicit **Mark complete** and
  **Dismiss** actions; either terminal disposition MUST be durable,
  idempotent and release active-task capacity.
- Oracle-owned findings MUST include an executable prompt. Task-origin Oracle
  turns MAY create, continue, answer or cancel execution sessions only for the
  durable task; unrelated settings, naming, closure, proactive-outcome and
  memory mutations MUST fail closed. Generic Oracle queue edit/remove/retry
  controls MUST reject internal task messages so task identity cannot diverge.
- Proactive Oracle turns MUST limit session listing, transcript reads and side
  questions to the exact computer/session identities admitted in their current
  durable event batch. Terminal manager-message reconciliation MUST use exact
  durable lookup rather than depending on the bounded public Oracle snapshot.
- Every successful Dreamer or task mutation MUST return the reconciled
  authoritative plan, task, evidence and available action projection in that
  response; the UI MUST NOT temporarily lose task controls until refresh.
- Dreamer MUST NOT raise overnight notifications, send speech or automatically
  dispatch work. Proactive analysis uses the existing hub lifecycle stream and
  durable Oracle queue; execution begins only from an explicit task action.
  Optional morning delivery remains a separate follow-up described in
  [Oracle Dreamer](design/oracle-dreamer.md).

## 4. Conversation timeline

- User messages, assistant messages, notices, and tool activity MUST remain in
  chronological order.
- User and assistant messages MUST show their persisted creation time in the
  viewer's local time alongside the sender label.
- Running tools MUST flow with the conversation and MUST NOT remain sticky.
- Completed and failed root-level tools MUST remain as compact history entries.
- Parallel tools MUST retain independent running/completed/failed states.
- Unfinished tools at abort or error MUST become failed rather than spinning
  forever.
- Root agent launches MAY be shown; subagent internals SHOULD remain hidden.
- Successful `task_complete` summaries MUST render as normal Agent messages.
- Ordinary tool results MUST remain tool activity and MUST NOT be promoted into
  Agent messages or raw JSON chat output.
- Streaming content MUST update in place and finish without an empty permanent
  typing indicator.

## 5. Questions and permissions

Questions and permissions are the highest-priority UI state.

- Persisted SDK permission and user-input requests MUST be atomically marked
  stale and the session recoverable after service restart because their
  in-memory callbacks no longer exist. Reply endpoints MUST reject them with
  `409` and direct the reader to recovery. Terminal-backed persisted prompts
  MUST retain their existing live-terminal behavior.
- A stale prompt MUST render a focused inline recovery card with its original
  title or question rather than dead approval/form controls.

- SDK `ask_user` requests MUST render as actionable cards, including the
  structured `message`/`requestedSchema` form supported by current Copilot
  runtimes. Normal SDK sessions MUST select Copilot's elicitation `ask_user`
  variant when they register the structured-form handler.
- Structured question cards MUST remain within the phone timeline width.
  Checkboxes MUST keep their intrinsic control size, option and heading text
  MUST wrap inside the card, and long forms MUST remain vertically reachable
  without covering the composer.
- Question messages MUST render Markdown, including tables, emphasis, inline
  code, and fenced code blocks, without changing the original message or reply
  values. Raw HTML and unsafe link schemes MUST NOT execute. Wide tables and
  code blocks MUST scroll within the card rather than overflow the page.
- Terminal ask-user and permission dialogs MUST be parsed from the live pane.
- CLI folder-trust prompts MUST be shown as permission cards with the folder
  path, an explicit one-session trust action, and Stop. The app MUST NOT
  silently trust folders or select persistent trust.
- A CLI Session in use confirmation MUST expose Resume anyway and Go back in
  a permission card, including its warning about concurrent clients. Creating,
  recovering, or restarting a terminal, sending a message, or running a command
  MUST NOT implicitly approve a takeover. An old confirmation in scrollback
  MUST NOT block an active composer.
- Terminal replies MUST revalidate the exact live dialog before sending keys.
- Single-choice fields MUST accept the highlighted option before advancing;
  navigation alone MUST NOT substitute its previous default for the app's
  submitted value. Every field change MUST verify the next expected field.
  Intermediate choice acceptance MUST NOT count as whole-form submission.
- A form's free-text field MUST NOT be mistaken for the chat composer.
  Its accept/cancel controls identify a form for inspection, but replies MUST
  still verify the complete question and field headings before sending keys.
- Question identity matching MUST tolerate terminal line wrapping, including
  breaks within words, while still requiring the complete question and field
  headings. A failed match MUST preserve the pending request and surface an
  actionable error instead of typing into an unverified dialog.
- If the CLI clips a long form vertically or paginates its field tabs
  horizontally, answering or dismissing it MAY temporarily enlarge its owning
  single-pane window within bounded height and width limits. Horizontal
  pagination indicators MAY trigger that inspection, but the complete question
  and every field title MUST become visible and be verified before sending
  keys. The app MUST restore the previous size and sizing policy on completion
  or failure without overwriting intervening operator changes; it MUST NOT
  resize shared windows or a window whose ownership changed.
- Outer form-tab pagination arrows MUST remain recognizable when separated
  from visible tabs by one space. They MAY qualify read-only inspection only
  when the visible tab names match a contiguous subset of the known fields;
  they MUST NOT replace full question and field verification before input.
- A complete-looking question whose padded line wrapping prevents exact
  verification MAY trigger bounded read-only horizontal reflow. A
  whitespace-insensitive comparison MUST only qualify inspection, never
  authorize input; the complete question, word boundaries, and fields MUST
  still pass exact verification after reflow before any key is sent.
  Inspection MAY try a bounded sequence of wider layouts when the maximum
  width remains ambiguous, without shrinking below the original width or
  extending the operation deadline.
- The form reply budget MUST scale with the number of form fields while
  retaining a hard upper bound, so verified multi-field forms can complete
  without leaving an enlarged window indefinitely. Each persisted form accept,
  decline, or cancel MUST settle within one such budget that starts before it
  waits behind other terminal work and also covers captures, keystrokes,
  closure confirmation, and cleanup. Queued work whose budget expired MUST NOT
  begin, and keys MUST NOT be sent after expiry. Expiry before a commit key
  MUST return HTTP 409 with `uncertainDelivery: false`, keep the card pending,
  and ask the user to try again; expiry after a commit key may have been sent
  MUST return HTTP 409 with `uncertainDelivery: true` and warn against
  resending. Viewport restoration still runs to completion after expiry, but
  MUST NOT delay the reply.
- Bound leaf CLIs with explicit session arguments SHOULD revalidate their live
  process identity and pane directly rather than repeat host-wide discovery
  for every form key. Session-state ownership, process-start identity, and the
  exact pane root and ancestry MUST remain freshly checked. Wrapper and lock-only owners
  MUST retain discovery when that direct proof is unavailable.
- Wrapped control hints MAY trigger a bounded viewport check, but MUST NOT
  replace verification of the complete question. Each successive long form
  MUST independently verify its identity and restore its viewport.
- Completion of a fallback dismissal MUST NOT count as delivery of the answer.
  The running service MUST retain the original answer continuation across late
  dismissal confirmation and refuse conflicting retries or replay after an
  uncertain send. A receipt for an earlier question MUST NOT clear a newer one.
- A persisted question whose form neither fills nor dismisses is stale only
  when a bounded, read-only probe sees an empty, input-ready composer. A probe
  that fails or outlives the reply budget MUST count as not ready, return
  HTTP 409 with `uncertainDelivery: false`, and leave no retained answer.
- A stale card's answer MUST be typed only through idle-only delivery checked
  under the terminal send lock, never as steering. Drafts, forms, permissions,
  overlays, startup prompts, and working turns MUST refuse with
  `uncertainDelivery: false` and keep the card. Tool completion MUST be
  rechecked immediately before delivery; if it completed, nothing is sent.
- The stale card MUST stay until the terminal accepts the answer, so queued
  prompts cannot dispatch first; the answer then goes ahead of them. After
  acceptance the answer MUST NOT be resent: a failed card clear retries only
  the clear, and an uncertain send clears the card and refuses replay.
- Safe Yes/choice and Stop actions MUST be available.
- Cancelling or declining a persisted terminal question MUST dismiss the
  matching live form and confirm completion before hiding its card, unless the
  stale-card probe above sees an empty, input-ready composer; nothing is typed
  then. A failed dismissal MUST retain the question; it MUST NOT report a false
  success that leaves the terminal capturing subsequent messages.
- Pending SDK questions MUST be reconstructed from persisted tool events after
  a service restart, including structured ask-user forms.
- If an SDK callback was lost, answering the recovered question MUST resume as a
  normal user turn.
- While the owning service is running, an accepted SDK reply whose settlement
  write failed MUST remain retryable without resolving the provider callback
  again. A conflicting reply MUST be rejected, and settlement MUST preserve
  newer questions, permissions, and their waiting status.
- Multi-question flows MUST commit the next question card before advancing
  their private request identity or collected answers.
- A newly arriving question or permission MUST scroll into view.
- Entering a session that is already waiting MUST scroll to the action card.

## 6. Composer and prompt delivery

- Paste receipt MUST recognize both current and legacy CLI collapsed-paste
  markers, including multiline input shorter than the character collapse limit,
  and long lines scrolled within the composer. A late confirmed paste MUST NOT
  be reported as a failure solely because the first wait expired.
- Sending MUST NOT append to an existing terminal draft or uncertain paste.
  Eligible immediate sends to an idle or errored tmux session MUST request
  guarded terminal-draft replacement in the original attempt and MUST NOT show
  an intermediate banner or confirmation. The server MUST prepare the new
  buffer first, revalidate the same idle tmux owner and a stably readable
  composer across repaint frames, clear stale text only when it is present,
  observe a stable empty composer, then paste and submit exactly once.
  A changed, working, unreadable, dialog-owning, or newly occupied pane MUST
  refuse without pasting; that reason MUST restore the app draft and remain
  visible. When no stale text was present, nothing is cleared and the attempt
  MUST keep the readiness an ordinary immediate send would have: an agent that
  is already working receives it as an immediate follow-up instead of a false
  "new terminal text" refusal. After text was cleared, the pane MUST still be
  idle before the paste. Running or waiting sessions, uncertain delivery, queued sends,
  SDK/Claude sessions, and app-local commands MUST never request replacement.
- A first message to a terminal this service has not yet seen ready, such as
  after the hub restarts, MUST wait for a live composer. A Copilot started in
  the last 30 seconds can still open a startup dialog over an empty prompt,
  so its prompt MUST stay live for about three seconds first; one running
  longer MUST only need its prompt seen steady once. A steer to a settled,
  working Copilot that shows no usable composer within a brief subsecond
  readiness window MUST NOT hold the send lock for the startup timeout or
  fail: nothing is typed, and the message joins the app FIFO exactly once
  while the session is `running`, marked as a steer. A queued steer at the
  head of the FIFO MUST use a short steer-only readiness wake and be typed
  into the running turn as soon as the composer is ready and empty again, not
  held until the turn ends or coupled only to transcript polling. This
  includes a turn that outlived a hub restart. A steer behind an older queued
  prompt keeps its place and steers the turn that prompt starts. While a
  runnable retained head exists, a later immediate steer MUST join behind it
  instead of attempting direct delivery, including when both sends overlap
  before the first refusal settles. After restart, a running steer head blocked
  by a typed or unreadable composer MUST regain the same short steer-only
  readiness wake. A steer the terminal refuses again before anything was typed
  stays at the head without a new error; an uncertain one is never retyped.
  Steers that would replace a terminal draft, and refusals for any other
  reason, still return a 409.
- A working terminal composer MUST accept native queued messages and slash
  commands whose catalog explicitly allows execution during a turn. Other
  immediate messages MUST wait. These delivery modes MUST still reject
  startup screens, dialogs, non-composer frames, and existing drafts.
- Startup ownership MUST follow the same tmux pane and root process when the
  Copilot wrapper replaces itself with a native child. Stop MUST send an
  interrupt only while the terminal advertises active work; on an idle composer
  it MUST send nothing, and on a keyboard-owning dialog it MUST dismiss rather
  than terminate the CLI. Restarting a managed session whose terminal owner has
  vanished MUST persist its SDK fallback before reporting success.
- A Copilot that stops advertising its interrupt key, or words it differently,
  MUST still be interruptible. When the pane neither offers the key nor shows
  an idle composer and footer the grammar recognises, Copilot's event log
  decides. A foreground turn is open when its last foreground lifecycle event
  is a turn start or an answered permission, and no process has started or
  resumed the session since. Background agents do not count. Stop MUST then
  send the same interrupt, and send routing MUST treat the session as working.
  Whichever way it was decided, Stop MUST NOT interrupt a session again within
  five seconds of its last interrupt: the footer can still offer the key just
  after the turn ended, and a second Ctrl+C at an idle prompt starts quitting.
- A complete model, effort, and context footer MUST NOT make an otherwise live
  composer appear unavailable. A wrapped reasoning/model line after the
  command/sidebar hints MUST remain recognizable without a context counter.
  Unrelated output below the frame MUST still prevent it from being treated as
  a live composer, except as the focused-prompt rule below allows.
- A footer row that fits the hint cells and the reasoning/model hint on one
  line MUST remain recognizable when Copilot drops hint cells or cuts the last
  hint or the model short to fit. Any footer row that names a hint cell or
  carries that hint after other text MUST be judged by this grammar alone:
  every hint a known cell in Copilot's order, each slot at most once, and only
  the last cut short. Unknown, repeated, reordered or cut-short earlier cells,
  and an unknown model, MUST refuse input unless the focused-prompt rule below
  applies.
- While a turn runs, a footer row that carries the agent's status and the
  interrupt hint followed by the reasoning/model hint MUST remain a live
  composer for queued messages, wherever the model or its context is cut.
  Anything else after the interrupt hint MUST refuse input.
- Copilot 1.0.98 ends the footer row with its own model hint: the model, then
  the reasoning effort and the context in use (`GPT-5 mini · Low · (19%)`,
  `GPT-5.6 Sol · High · 922K context (0%)`), either later cell left out and
  only the last cut short. It MUST be recognised after the hint cells and
  after the interrupt hint, and after the queue key (`· ctrl+q enqueue`) that
  follows the interrupt hint while the prompt holds text. Just after a prompt
  is sent, the row offers `esc edit prompt` instead of the interrupt; that is
  work, and the composer MUST stay live for messages sent during it. Copilot
  queues a message sent then for after the current turn.
- Once a turn hands its work to background agents and ends, Copilot 1.0.101
  keeps its prompt open and its footer row reads `Waiting for background
  agents`, an optional output size, `esc esc stop agents`, then the model
  hint. That composer MUST be live and idle: Send delivers the message as a
  new prompt, which Copilot answers while the agents keep running, rather
  than refusing it as not ready. Anything else after the stop key MUST refuse
  input, and the session stays running until the agents finish.
- A footer that a newer Copilot draws differently MUST NOT stop tmux sessions
  from starting or taking input. Copilot shows the terminal cursor on its
  prompt row only while the prompt has the keyboard, and hides it while a form
  or picker does. When the cursor is shown inside the composer frame, read in
  the same tmux command as the capture, up to three footer rows the grammar
  does not recognise MUST be accepted, unless one of them:
  - is a list, picker or form entry;
  - asks anything, offers answers to choose between, or prompts for one;
  - moves through a list;
  - gives a job to a key this app sends to a composer (pasted text, Enter,
    Ctrl+Q, Ctrl+U), to Escape or Space, or to a plain key;
  - names an action that answers, commits or destroys something.

  With the cursor hidden or elsewhere, the grammar alone decides. Each
  unrecognised footer accepted this way MUST be logged once while it is among
  the most recent such footers, so the grammar can catch up.
- Under the same cursor rule, a composer that a newer Copilot draws with
  different rules, sides or prompt marker MUST also be found. When no known
  frame exists, the lowest region bounded by two rows of at least eight line
  or block characters (U+2500–U+259F) is the composer if all of these hold:
  - the cursor is inside it;
  - the rows after the cursor inside it, and every row below it, are footer
    the rule above accepts, within its limit of three unrecognised rows;
  - no form footer is shown;
  - its first row opens, after any side, with a single marker character
    followed by a space, or shows a known empty-composer placeholder.

  Line and block characters only ever draw the frame. A row of them is a
  rule, one opening every row inside is a side, and a marker is any other
  single character that is not a letter or digit. A side MUST never be read
  as a marker, or any box with the cursor in it would count as a prompt.

  That marker MUST read as the prompt marker, so an empty composer is not
  mistaken for a draft. Each such frame shape MUST be logged once, like an
  unrecognised footer.
- Copilot CLI updates itself in the background, so each computer MUST check
  every version it updates to before anyone's new session meets it. Every
  30 minutes, starting two minutes after the service is ready, a computer
  that can run tmux reads `copilot --version`. For a version not yet checked:
  - it MUST start Copilot as tmux sessions are created, in a detached tmux
    session of its own at 80 columns, in an empty folder in the data
    directory, made afresh for each attempt and removed afterwards;
  - it MUST answer the folder-trust prompt for that session only, then wait
    for the composer to be ready;
  - the probe MUST be retired before it starts, so it is never offered as a
    session, and its tmux session and Copilot files MUST be removed whatever
    the outcome, once Copilot has exited. A probe whose tmux session cannot
    be ended, or whose Copilot outlives it, MUST fail;
  - a probe a stopped service left running MUST be ended before the next one
    starts, and its files removed only if its session was retired;
  - stopping the service MUST cancel a check under way, recording and
    reporting nothing, so the version is checked again on the next start. No
    probe MAY start once stopping has begun, and one launched while the
    running ones were being ended MUST end itself.

  A version is recorded as passed or failed in `cli-canary.json` in the data
  directory. A failure gets one more attempt before it counts. A failed
  version MUST raise an alert, shown in the app and sent as a notification,
  and is checked again after a day.
- An exact downloaded-update notice and its wrapped continuation rows MUST
  NOT hide a readable composer or block terminal startup at any terminal width.
  The notice and the sidebar, mode, permission, help, and tab hint cells wrap
  independently over any number of rows; they MUST remain recognizable
  wherever they wrap. A strict version token and the exact hint cells in their
  fixed order are still required: incomplete notices, unknown, repeated or
  reordered words, unrelated output, and keyboard-owning dialogs MUST still
  refuse input.
- Losing a paste acknowledgement MUST report uncertain delivery rather than
  authorize an automatic retry. Readiness MUST be checked again after owner
  validation and before the paste.
- A recovered prompt or slash-command resend MUST durably consume its recovery
  token before delivery or queue admission. If that write cannot commit, no
  delivery may occur and the original token remains unused.
- The claim MUST preserve the actual submitted text and a fresh uncertain
  recovery token. An unresolved attempt MUST reject its old token across restart
  and clear replacement, and require an explicit new recovery decision; it MUST
  NOT be automatically acknowledged or replayed. A refusal after the claim
  commits may conservatively remain uncertain, but MUST offer a usable new
  decision rather than permanently blocking recovery.
- Successful delivery or durable queue admission MUST settle only its own
  recovery token. Failed acknowledgement writes after accepted delivery MUST be
  surfaced and retried without repeating delivery or clearing a newer recovery.
- A confirmed recovery receipt MUST be saved before later bookkeeping, separately
  from clearing its recovery marker. Restart MUST resume only acknowledgement for
  a saved accepted receipt, never delivery. If even the receipt cannot be saved,
  the attempted-delivery token MUST remain non-delivering: requesting it may
  prepare and return a distinct recovery decision, but MUST send nothing until
  the reader explicitly submits that new decision.
- Confirmed delivery MUST remain accepted when later activity, command feedback,
  or persistence fails. Its recovery claim MUST remain reserved until token-scoped
  acknowledgement settles; a fresh-token or anonymous retry MUST NOT deliver it
  again while that acknowledgement is pending.
- Confirmed startup delivery MUST establish its dispatch hold before receipt
  persistence or publication can fail, even if an earlier readiness observation
  was negative. Acceptance MUST update the linked claim and publish a redacted
  view before attempting its receipt write. Every public session response,
  including mutation results and queue-removal envelopes, MUST omit accepted or
  obsolete recovery markers without mutating internal recovery state or dropping
  a newer unaccepted recovery.
- A failed recovery submission MUST return its current recovery token and owning
  session through both local and paired-node HTTP paths. The browser MUST bind
  any restored draft to that token, including across navigation, reload and clear
  replacement. A confirmed accepted submission MUST NOT be restored as an unsent
  draft. Missing error metadata MUST retain the original binding rather than
  silently turning a retry into an independent message.
- HTTP session results serialized before an observed recovery event MUST NOT
  overwrite that event's recovery field at an equal or older durable revision.
  Immediate equal-revision redaction events and fresh reads issued after them
  MUST remain valid. The client MUST preserve detail hydration, genuinely newer
  revisions/recovery tokens, and session/computer replacement ownership rather
  than rejecting every equal-revision update.
- Automatic desktop-install decline MUST recapture the pane after awaited owner
  validation and confirm the same live prompt before sending `n`. Disappearance
  or replacement by a composer, draft, or another dialog MUST receive no input.
- Direct terminal commands MUST respect older app FIFO entries after startup
  reconciliation, except for the matching recovery claim. An immediate message
  serialized behind a startup dispatch MUST NOT trust its still-visible old
  composer as permission to submit a second message.
- The startup dispatch hold MUST also cover command/message interleavings.
  Turn-starting commands and commands whose feedback cannot be observed MUST
  retain that hold for serialized followers. A stable non-turn command response
  MAY release only its own hold. Explicit Queue requests MUST remain queued
  rather than becoming immediate sends after stale-idle reconciliation.
- Form identity MUST preserve word boundaries. Terminal form reads MUST use
  tmux's joined soft-wrap capture instead of guessing whether a line break
  separated words or split an identifier.

- Full-screen send protection MUST recognize active terminal dialogs, including
  single-field questions, without treating keyboard hints quoted in transcript
  or composer text as an open dialog.

### 6.1 Layout

- Text input and action buttons MUST use separate visual panels.
- On phone, the text panel MUST remain wide enough for useful composition.
- Queue/edit context and delivery warnings MUST scroll independently when a
  short viewport cannot show them above the editor. Input, save/send actions,
  and command suggestions MUST remain reachable without clipping.
- The bottom action panel MUST expose Files and Microphone on the leading side.
- While an agent is running, Queue, Send, and Stop MUST remain available.
- A dedicated newline button MUST NOT be shown.

### 6.2 Keyboard behavior

| Environment | Enter/Return | Shift+Enter | Ctrl/Cmd+Enter |
| --- | --- | --- | --- |
| Phone/coarse pointer | Insert newline | Insert newline | Queue when available |
| Desktop | Send immediately | Insert newline | Queue |

The Send button MUST request immediate delivery. While a Copilot SDK or tmux
turn is running, immediate delivery MUST use the provider's native steering
path so the follow-up reaches the current turn rather than waiting behind it.
Copilot holds a message typed mid-response as pending and logs it only when the
turn reaches it. Until the transcript has it, a message the tmux terminal took
MUST show as the person's own message marked Pending, paired with exactly one
later transcript message. It MUST never be resent; a session that settles
without logging it drops the mark after a short grace.
If immediate steering is unsupported, the app MUST surface an error and
restore the draft; it MUST NOT silently queue. Stop remains the explicit way
to abort the current turn; sending after Stop begins a new turn.
On phone, the composer MUST label the explicit Send action and explain that
keyboard Return inserts a newline.

The Queue button MUST add to Agentic Remote's editable FIFO. Queued prompts MUST
support edit and remove operations. Direct CLI-native queue entries are not
required to be individually editable.

The queue region MUST say **Steering when ready** only while a tmux session is
running and its runnable head is a non-command steer. An SDK fallback or idle
queue remains **Queued for later**, later steers behind an ordinary head do not
relabel the queue, and archived or interrupted queues say **Retained until
reopened**. The region's accessible name, description, and per-prompt steer
marker MUST match that same current state.

An app-queued terminal prompt MUST be durably removed from automatic retry
before delivery begins. A failed completion write MUST NOT resend the prompt;
the service MUST retain the delivery outcome and retry only persistence. After
restart, an unresolved delivery MUST expose its text as uncertain recovery and
hold later queued work until the reader explicitly deals with it.

An app-queued SDK or Claude prompt MUST remain durable until its complete turn
record is committed. Failed turn admission MUST NOT depend on a compensating
enqueue that can also fail during a storage outage. Native FIFO delivery MUST
recheck idleness at delivery rather than steer a turn that began while queued
command confirmation was being persisted.

Shutdown MUST close new admissions before awaiting provider or storage work.
Already-admitted work MUST finish its commit/registration boundary before
provider teardown; a commit completed during shutdown MUST NOT start a new
provider turn. Unsent queued text MUST be restored or remain as durable,
explicit recovery when the cancellation write is refused. Storage MUST finish
admitted writes and refuse late mutations after shutdown.

Recovery sends MUST retain their per-dispatch delivery boundary through that
admitted lifetime, including generated command prompts and answering-enqueue
transactions. Confirmed-delivery acknowledgement MUST finish before provider
teardown; acknowledgement retries MUST themselves be admitted, and shutdown
MUST wake cancelled retry waiters without attempting another delivery. A storage
outage MUST surface the failed settlement and retain the consumed-token
uncertainty rather than allowing replay or a late write into a closed store.

Queue drains MUST coalesce wake-ups and re-read the committed canonical queue
after a reserved head is edited or removed. Stale reservations MAY retry;
ordinary authentication or storage failures MUST NOT cause a hot retry loop.
A durable reply settlement MUST wake eligible queued work after releasing its
own locks, without clearing a newer question or dispatching from a stopped,
suspended, deleting, or already-owned session.

Startup MUST resume eligible persisted native queues without requiring a
post-enqueue completion event. Only previously managed-open native sessions
qualify, and delivery MUST still require current discovery, ownership, a
readable empty native composer, and the normal admission/claim guards.
Unavailable observations or refused claim writes MUST retain FIFO and use
bounded retry. A queued entry MUST NOT by itself create or reopen a native
runtime; unknown prior delivery or explicit closed/suspended state stays held.
Repeated startup MUST NOT duplicate delivery or create additional pollers.

An explicit recovery token MUST match the current failed prompt. For Claude,
accepting a token-bearing retry MUST atomically retain one canonical FIFO entry
and consume that recovery, including retries requested while idle. Replayed or stale tokens
MUST NOT dispatch or enqueue another copy, or clear a newer recovery. Unrelated
ordinary sends MUST NOT consume recovery. A new uncertain provider-start outcome
MUST remain explicitly uncertain; the supplied token is not proof of delivery.

If provider lookup fails before a query is registered, its unstarted queued
admission MUST be restored before completion cleanup can erase it. Refused
restoration MUST retain durable recovery, and cleanup MUST preserve newer owners.
Editing a queued prompt MUST leave the original in place until a save or
dispatch is accepted. Desktop Enter and Save to queue update that exact item
without moving it. When the owning provider advertises targeted dispatch,
the explicit Send action MUST send the named item and its rewritten contents,
not the queue head or a newly appended copy. Without that capability the UI
MUST offer an explicitly labelled save, not pretend to send immediately.
History previews MUST NOT be saved or dispatched as queued rewrites. Command
validation MUST use the owning session's current catalog and expanded paste
contents; app-only commands MUST NOT run as a side effect of editing.

Targeted queue delivery MUST be admitted only while the session is available
and idle. Its claim MUST be durable before provider invocation, preserve the
original item and queue position in public snapshots, and exclude that item
from automatic draining. A definitive refusal MUST restore the original,
unchanged item. An accepted receipt settles delivery independently of turn
completion. Missing receipts, transport timeouts, and failed outcome writes
MUST remain visibly unconfirmed and MUST NOT trigger automatic retry.
Discarding an unconfirmed claim MUST require explicit confirmation and its
exact attempt identity; discarding MUST neither resend nor cancel provider work.

Claims MUST remain safe across restart and rollback. The attempted item is
removed from the persisted runnable queue and retained in the existing
uncertain failed-prompt recovery format, with the original item recorded in
claim metadata for current readers. An older runtime therefore sees recovery
work, not an automatically runnable duplicate. The app does not claim an
atomic transaction with an external provider.
Drafts MUST persist independently per computer/session and MUST survive session
switches, failed sends, and clear replacement IDs.
Recalling history MUST preserve the unsent draft durably; a reload restores that
draft, not the historical preview. Sending a preview MUST NOT discard the draft
behind it or acknowledge a failed prompt owned by that hidden draft. This also
applies to local `/statusline`, `/clear`, `/restart`, and argumentless `/cwd`
previews, including any replacement session created by clearing.

A pending submission MUST retain its complete text and paste metadata until its
request is accepted, independently of anything written in the meantime. Reloads
and unsuccessful requests MUST restore that submission without automatically
sending or queuing it. When delivery cannot be confirmed, the composer MUST warn
that the message may already have been sent or queued. Matching transcript text
or the absence of a previous failure marker MUST NOT be treated as acceptance of
an unconfirmed request.

Queued-edit identity and pending-dispatch state MUST be stored with the
versioned composer draft, including collapsed-paste payloads. Starting a
targeted send MUST move its text into an owned pending submission, leaving new
writing independent. Acceptance uses the same durable receipt rules as an
ordinary send. A reload with unconfirmed queued delivery MUST keep the rewrite
attached to its target and block resending even if a later snapshot has an empty
queue. Compatibility text MUST not outlive the ownership protecting it during
partial browser writes.

A failure to save composer state MUST leave the current text editable and warn
that the saved copy may be out of date. Message and queue admission MUST require
successful writes of the pending state, generation marker, and expanded legacy
draft copy. Failed admission MUST dispatch nothing, preserve the editor and its
history draft, and release the sending gate. Repairing partial writes is
best-effort and MUST NOT turn failed admission into a send; if repair also fails,
the user MUST be told to copy their text before reloading. A later successful
save clears the storage warning but MUST NOT automatically send anything.
Storage failures after confirmed acceptance MUST NOT restore the accepted
message over newer writing. Unsaved recovery-identity changes are retried with
the next composer save.

Successful requests MUST record acceptance by submission identity before
retiring pending browser state. The generation marker reserves space for at
most 64 receipts containing the original computer/session key and submission
ID, not message contents. Receipts MUST survive failed draft cleanup, including
reload, and MUST NOT acknowledge another session's submission. Retirement writes
the legacy copy before removing the pending identity from the versioned copy;
only receipts no longer referenced there may be pruned. Newer legacy edits
still take precedence over an old snapshot.

If acceptance evidence cannot be written, the tab MUST retain the accepted
submission and newer editable draft in memory and explicitly warn that its
confirmation is not saved. A reload may then restore the submission as
unconfirmed; it MUST NOT be automatically resent or presented as definitely
unsent. Definitive recovery when all browser writes are denied requires server
support: a client request ID bound to the payload and logical session lineage,
durable acceptance recorded with the operation, and a receipt lookup or
idempotent retry that cannot submit it twice. The client-only fallback does not
provide that server guarantee.

Best-effort preference storage MUST NOT authorize composer submission or retire
delivery receipts. If saved draft storage cannot be read at startup, typing
remains available but sends and draft writes stay blocked until a reload can
recover the saved state. The UI MUST warn the user to copy new text first.
A recovered writable session draft MUST show **Recovered saved draft** until
edited. Ordinary draft persistence does not need a permanent success label.
The recovery indicator MUST NOT replace storage, delivery-uncertainty,
failed-submission, or queue warnings.

Pastes longer than 20 lines MUST appear in the composer as
`[Paste #N - L lines]`, numbered within the current session draft. The exact
pasted text MUST remain embedded in the draft and replace its label when the
message is sent or queued. Shorter pastes MUST remain ordinary editable text.
Collapsed pastes MUST survive reloads, session switches, failed sends, and
clear replacement IDs without losing, duplicating, or reordering content.

### 6.3 Recording state

- Starting microphone capture MUST replace the bottom action panel with a
  compact Cancel, timer, and Stop & transcribe strip.
- Recording controls MUST remain below the text panel.
- Cancel MUST discard browser-memory audio without transcription.
- Stop & transcribe MUST submit the recording for transcription and append only
  the resulting text to the originating draft.
- Recording MUST NOT send a prompt automatically.

## 7. Attachments and audio

### 7.1 Documents

- Multiple selected or dropped files MUST process in selection order.
- Supported documents include PDF, CSV/TSV, Kusto Query Language (`.kql`),
  Excel, Word, Markdown, text, JSON/YAML, OFX/QFX, and common images.
- Maximum file size is 25 MiB.
- Files MUST be stored on the selected session's owning computer under
  `~/.agentic-remote/uploads/<session-id>/`.
- Directories MUST use mode `0700`; files MUST use mode `0600`.
- Filenames MUST be sanitized, basename-only, normalized, and UUID-prefixed.
- Creation MUST prevent overwrite and symlink reuse.
- Upload paths MUST append to the originating draft without auto-send.
- Uploads MUST be removed on clear or delete.

### 7.2 Audio transcription

- Audio capture and selection MUST support AAC, FLAC, M4A, MP3, MP4, OGG, WAV,
  and WebM.
- Maximum audio size is 25 MiB and maximum duration is 15 minutes.
- Conversion and transcription MUST run on one computer the deployment
  designates, defaulting to the hub.
- A deployment MAY assign transcription to a paired computer. The hub MUST then
  forward the recording over the authenticated node API and MUST NOT retain it.
- An assignment naming an unpaired or offline computer MUST fail the recording
  with an actionable error instead of silently transcribing elsewhere.
- Source, converted WAV, and transcript artifacts MUST use private temporary
  storage and MUST be deleted after success or failure.
- Only transcript text MAY be retained in the draft.
- The original iPhone Voice Memo or Files item remains user-owned and MUST NOT
  be deleted by the web app.
- Copilot SDK audio attachments are not a transcription interface. The app MUST
  continue converting speech to text before calling Copilot.
- GPU acceleration MAY be enabled only when a working driver produces a
  measured improvement. CPU transcription MUST remain a safe fallback.

## 8. Session files and Knowledge

### 8.1 Read-only workspace browser

- The chat folder button MUST open at the selected session's current working
  directory.
- All paths MUST be relative to and confined within that directory.
- Absolute paths, traversal, hidden path segments, and symlinks escaping the
  root MUST be rejected.
- Hidden files/directories MUST be omitted by default.
- Markdown and HTML MUST support rendered and raw views labeled Preview and
  Source. HTML MUST be a distinct file kind, not rendered as Markdown.
- HTML Preview MUST render in an opaque-origin iframe sandbox without scripts,
  same-origin access, permissions, referrers, navigation, forms, popups,
  downloads, frames, plugins, or network assets. A restrictive CSP before the
  document content MUST allow only inline CSS plus data images and fonts.
  Audio, video, and their source/track elements MUST be removed, including
  data-backed media and elements inside templates; media loading MUST be
  denied by CSP. Interactive and navigation markup MUST also be neutralized
  before rendering. Source MUST preserve the exact file text.
- Rendered Markdown across the app MAY convert only exact `<br>`, `<br/>`, and
  `<br />` raw HTML nodes (case-insensitive) to hard breaks. All other raw HTML,
  including break tags with attributes, MUST remain inert; raw HTML parsing
  MUST NOT be enabled. Code fences, inline code, escaped tags, and Source mode
  MUST retain their original text.
- The document outline MUST remain Markdown-only and keyboard-accessible
  without pushing document content away.
  Repeated headings, colliding slugs, and reference headings MUST navigate to
  their own rendered positions in both Knowledge and session-file outlines.
  Copying a code fence MUST require an explicit action, retain its exact text,
  and report clipboard failure rather than claiming success.
- Relative Markdown document links MUST open through the owning workspace or
  Knowledge root without navigating away from the app. Section links MUST stay
  inside the displayed document, with unique anchors for repeated headings.
- Refused links, missing documents, and missing section anchors MUST report an
  explicit error without discarding the current document or conversation draft.
- Text previews MUST be limited to 2 MiB.
- PDF previews MUST be limited to 25 MiB and rendered in the browser with
  PDF.js.
- Search MUST be scoped to the currently viewed folder.
- Search MUST bound file count, result count, individual text size, and total
  text bytes, and SHOULD skip generated dependency/build directories.
- Insert path and Ask agent about file MUST update the draft without auto-send.
  File references MUST belong to the current online owning computer and session.
  A history preview MUST NOT replace the hidden unsent text or collapsed pastes
  when a reference is appended. A cached session-file preview MUST be reopened
  when the session or its working folder changes.

### 8.2 Phone reading mode

- Sessions, Knowledge file navigation, and the reader MUST fill the available
  phone viewport, rather than leaving an unused strip beside a narrow drawer.
  File navigation MUST have its own full-height phone surface, not share the
  visible height with the session list.
- Layout MUST honor the visual viewport and safe areas when the keyboard opens.
  Phone text inputs and selects MUST use at least 16px text without disabling
  browser zoom.
- Selecting a file on phone MUST hide the tree and search controls.
- The preview MUST use the full workspace panel with readable 16px-or-larger
  text.
- Back to files MUST restore folder navigation.
  Switching from files to Sessions and back MUST preserve the file tree's
  scroll position; a CSS-hidden surface MUST NOT overwrite it with zero.
- PDF page controls MUST remain reachable without overlapping the home
  indicator.

### 8.3 Knowledge

- Knowledge MUST be the single place for reading files; there is no separate
  saved-paths panel.
- Root creation MUST be entered from Knowledge itself, not from the Sessions
  sidebar.
- Opening Knowledge with an active session and no configured roots MUST open
  the root picker on that session's computer and current working folder. The
  user MAY add that folder directly or browse to another readable folder.
- A knowledge root is a computer plus an absolute folder and MUST be browsable
  with no session in existence.
- A session MAY explicitly link one root from the shared Knowledge catalog.
  The association MUST belong to its owning computer and stable session ID,
  survive hub/client restarts, and remain separate from the session's cwd.
  Several sessions MAY link the same root while keeping separate reading
  positions. Linking MUST NOT copy files, mount a remote folder, activate an
  agent, or send a prompt.
- A session MAY root its Knowledge tree at a nested folder inside a shared
  root. The nested path MUST persist with the hub-side session association and
  become the true top of that session's tree: parent folders above it MUST NOT
  appear in scoped list, file, breadcrumb, or relative-link responses.
- Choosing a shared root or the session folder MUST open a recursive subfolder
  browser without changing the shared root choices. Browsing changes only the
  pending session choice. **Save this root folder** MUST be the explicit action
  that adds the browsed folder to the shared catalog and selects it for the
  session.
- Root associations MUST use separate hub metadata. Opening Knowledge MUST NOT
  silently promote browser-local reading positions into hub associations.
  An unassigned session with no remembered position MUST offer an explicit
  working-folder suggestion or root choice, not another session's document.
- Root updates MUST compare the persisted revision. A rejected update MUST
  retain the pending choice for review/retry instead of silently overwriting
  another client's change. An explicit unlink MUST remain distinguishable
  from a session that has never had an association.
- Choosing a root MUST allow any folder on the owning computer that the user can
  read, not only the home directory. Session working directories remain
  confined; a root is read-only.
- A root MUST be validated on its owning computer, and every path browsed under
  it MUST stay inside it.
- Validation and pending Knowledge responses MUST belong to the same pairing
  lifetime that requested them. Re-pairing the same computer ID MUST NOT revive
  old responses or make a stale validation create a root.
- Root creation MUST recheck registration after persistence. A re-pairing
  announced by another tab MUST allow fresh requests without reviving older
  responses or removing the new pairing's roots.
- Initial and reconnect computer snapshots MUST preserve newer computer events.
  An older partial session refresh MUST NOT undo a newer computer removal.
- The reader MUST reopen the root, folder, and document last being read, so
  returning does not mean choosing them again. Changing folder MUST remain an
  explicit action.
- A URL MAY name a Knowledge document with `computer`, `session`, and a
  root-relative `file` query parameter. Opening or changing that URL MUST select
  the session, use its authoritative root association, load the document's
  ancestor folders, and open the document. File paths MUST continue through the
  owning computer's normal root-confinement validation.
- User-driven Knowledge file navigation MUST update `file` in the address.
  Closing the panel or returning to its folder MUST remove `file`; reopening a
  remembered document MUST restore it. Browser Back, Forward, reload, and a
  manually edited `file` value MUST update the reader without creating
  duplicate history entries during restoration.
- Knowledge MUST open as a panel beside the selected session, docked next to
  the conversation or expanded over it, and MUST NOT be a second sidebar tab.
- Whether the panel is open, and how much room it takes, is a workspace mode:
  it MUST persist across session switches, so a document being read is not
  dismissed by moving to another session.
- Hiding Knowledge MUST remember its last visible mode. The open/close shortcut
  MUST reopen an expanded panel as expanded and a docked panel as docked,
  retaining the docked reader's saved width. Hiding the panel MUST NOT replace
  that remembered visible mode.
- The docked desktop reader MUST support resizing its left edge with a pointer
  or the arrow keys, with Shift taking larger steps. Home or a double-click
  MUST restore the responsive default width. The preferred width MUST persist
  in browser-local storage, remain bounded by the available workspace without
  crowding out the conversation, and MUST NOT affect phone full-screen reading.
- Each session MUST keep its own reading position — root, folder, and
  document — and switching sessions MUST show that session's position.
- Reopening Knowledge or switching between docked and expanded modes MUST
  refetch the active document in place while preserving its root, path,
  fragment, view mode, and scroll position. A late refresh MUST NOT replace a
  newer root, folder, document, or session selection.
- Clearing a conversation replaces a session rather than deleting it, so the
  removal event MUST name the replacement and every client MUST carry that
  session's reading position across rather than discard it. The hub root
  association MUST follow the same replacement lineage, including
  reconciliation after missed events, without overwriting an explicit
  association on the recipient.
- File navigation MUST stay in the same place in every mode, so choosing a
  file does not depend on how much room the reader is taking.
- Reopening the panel MUST resume the tree where it was left rather than
  scrolling back to the top.
- Returning from a file-to-draft handoff to the same session's unchanged
  document MUST preserve its scroll, section anchor, and rendered/raw view.
- Folders MUST expand in place as a tree rather than replacing the listing, so
  a parent stays visible while a child is open. Children are loaded on first
  expansion and reused afterwards.
- File listings SHOULD put folders before files and sort names naturally.
  Root selection MUST identify the owning computer and keep full paths
  available. A compact selector MAY open a scoped chooser instead of keeping
  every root permanently expanded.
- Removing a shared root MUST require an explicit impact confirmation and
  MUST NOT delete files. Referencing sessions MUST retain a named unavailable
  association rather than silently switch to another root. Deleting a session
  removes its association, not a root shared with other sessions.
- Refreshing a folder MUST preserve the open document. Failed refreshes MUST
  remain visible beside their branch, with existing loaded entries retained
  and a reachable retry action.
  A superseded load MUST reject stale contents and release only its own loading
  state, without clearing a newer request's state across file, session, root,
  or pairing changes.
- Expanded folders MUST be remembered per root, and reopening a remembered
  document MUST open the folders above it.
- A folder that cannot be read MUST report the failure on its own branch and
  leave the rest of the tree usable.
- The tree MUST expose `tree`/`treeitem` semantics with expansion state and
  depth, and support ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, and End.
- Knowledge stores root metadata on the hub; file content MUST remain on the
  owning computer.
- Ask agent about file MUST append a root-qualified file reference to the
  selected session's existing draft without sending it. It MUST be disabled
  with an explanation when there is no session, the session belongs to
  another computer, or the owning computer is offline. This action MUST reveal
  the composer (docked reading on desktop, conversation on phone), retaining
  the document for reopening.


## 9. Runtime configuration

- The UI MUST expose model, reasoning effort, numeric context capacity, and
  agent mode.
- App settings MUST expose independent optional default model IDs for Copilot
  and Claude. Blank defaults MUST preserve each provider's own default.
- App settings MUST expose a default agent mode for Copilot and Claude,
  Interactive unless changed. A new session MUST start in that mode, whether
  SDK- or tmux-backed, and persist it so recovery restores it; a mode the
  provider refuses MUST fail creation rather than start another mode.
- Provider defaults MUST apply only when creating a new session; existing
  sessions MUST keep their selected runtime model and mode.
- Context choices MUST show token capacity rather than labels such as Default or
  Long.
- Supported modes are Interactive, Plan, and Autopilot.
- SDK mode changes MUST use the session mode RPC.
- tmux runtime changes MAY restart the process with model, effort, context, and
  mode flags while preserving session state.
- Partial runtime failures MUST surface explicitly and MUST NOT persist false
  success.
- Provider-specific capabilities MUST be derived from advertised runtime
  options rather than assuming Copilot and Claude have identical controls.
- Model IDs, names, and capabilities MUST come from Copilot CLI or Claude
  discovery, not an embedded model list. Documentation examples and test
  fixtures MUST use neutral synthetic models rather than named offerings.
- Opening Model and context or App settings MUST request a fresh catalog from
  the owning providers, bypassing browser and SDK lifetime caches without
  restarting sessions. Concurrent discovery requests MAY share one in-flight
  request; a subsequent opening MUST trigger another discovery request.
- A transient provider-authentication failure during startup MUST NOT leave the
  runtime model catalog permanently empty; model discovery MUST retry when
  runtime options are requested.
- Runtime option loading MUST reconcile stale terminal status before deciding
  whether Apply is available.
- Shared mode labels MUST NOT imply identical provider semantics. Provider
  differences MUST be documented in `docs/provider-compatibility.md`.
- A session MUST remain owned by exactly one provider. Agentic Remote MUST NOT
  merge, translate, or claim to transfer conversation history between Copilot
  and Claude.

### 9.1 Appearance

- App settings MUST offer named, accessible accent-color presets including the
  original Agentic green.
- The selected accent MUST apply to primary actions, focus states, activity
  indicators, and other non-semantic accent treatments.
- Warning, error, computer-identity, and background-task colors MUST retain
  their semantic meaning.
- The accent MUST follow the settings profile (§9.3) and fall back to Agentic
  green for an unknown value.
- Appearance MUST offer System, Graphite, and Light. System, and an
  appearance never chosen, MUST follow the device's `prefers-color-scheme`
  live; Graphite or Light MUST pin it on every device.
- The saved appearance MUST paint before the app bundle loads, so a Light
  choice never flashes dark.
- The top-left brand mark and browser-tab icon MUST use the fixed Relay
  artwork in Agentic green and remain independent of the chosen accent.

### 9.2 App settings layout

- App settings MUST group settings by what they are about, in this order:
  - **Models**: new sessions' defaults per provider.
  - **Folders**: one card per computer with the folder new sessions start in,
    then Oracle's (blank means the same as new sessions).
  - **Oracle**: Oracle's model and effort, response style, and which activity
    notifies you.
  - **Notifications**: this device's notification permission and subscription.
  - **Interface**: Appearance, Status line, Keyboard shortcuts.
  - **App**: Settings sync, Hub connection (native app only), App updates.
- Each section whose scope is not obvious MUST say whether it is **Synced** or
  kept on **This device**.
- A jump bar MUST reach each group and stay in view while the settings scroll.
- Opened from Oracle's model, App settings MUST open at Oracle's model;
  opened any other way, at the top.

### 9.3 Settings profile

The hub keeps one settings profile, shared by every device that opens it. The
hub has no per-user identity, so different hubs keep separate profiles and
people sharing a hub share its profile. See
[the design](design/settings-profile.md).

| Scope | Settings |
|---|---|
| **Synced** | Appearance, accent, status line, new-session runtimes, new-session folders, session sort, computer order, Oracle's response style, what notifies you |
| **This device** | Keyboard shortcuts, panel placement and widths, Oracle's Ask/Delegate mode, Knowledge reading positions, notification permission and push subscription |
| **Never in the profile** | Drafts, queues, transcripts, credentials, push subscriptions |

- A change MUST apply at once, persist on the hub before it is reported, and
  reach other open devices live.
- The hub MUST keep a newer value another device committed after the change
  was made, and the device MUST say so. It MUST NOT silently overwrite either
  value.
- While the hub is unreachable, edits MUST stay on the device and sync on
  reconnect.
- The hub MUST validate every key and value against an allowlist, bound the
  profile to 32 KB, and guard it with the `/api/` Host and Origin policy.
- A device without a copy MUST offer its earlier browser-local settings once;
  the hub MUST keep only settings no device has chosen yet.

## 10. Notifications

- Notification settings MUST be discoverable under App settings.
- **What notifies you** is synced (§9.3) and the hub applies it to every
  notification it sends, on every device. Unset MUST behave as All activity.

  | Scope | Sends |
  |---|---|
  | All activity | Session, alert, and Oracle notifications |
  | Oracle only | Oracle notifications only |
  | Disabled | Nothing; devices stay subscribed |

  - **Session:** a question, a permission request, or a finish, in any
    session, including those Oracle started.
  - **Alert:** the hub's own health, such as a Copilot CLI that failed its
    startup check.
  - **Oracle:**
    - "Oracle replied" when your message is done, with a plain-text brief;
    - "Oracle couldn't answer" when it fails;
    - "Oracle needs your OK" (high urgency) when it asks to close a session.

    Notifications Oracle decides to send on its own MUST also use this
    category.
- A test notification you ask for MUST be sent whatever the scope.
- **This device** (its browser permission and push subscription) stays per
  device. A blocked permission MUST NOT block choosing the scope.
- Each Oracle event MUST notify at most once.
- While any open app shows Oracle's panel on a visible screen, the hub MUST
  NOT push Oracle notifications. The app MUST report this over its event
  socket and renew it every 30 seconds. The hub MUST forget a report after 90
  seconds, so a frozen phone cannot hold notifications back.
- In a browser or installed PWA, Oracle notifications MUST open Oracle
  (`/?oracle=open`), and opening Oracle MUST clear them.
- One event MUST belong to one category, so a single event never sends both a
  session and an Oracle notification.
- The native shell has no Web Push. It MUST apply the same scope and Oracle
  rules to the notifications it raises itself, hub alerts included.
  - Its notifications have no click target yet, so tapping one brings the app
    forward.
  - Only iOS and Android let it withdraw them; desktop platforms offer no API.
  - Both limits already apply to its session notifications.
- There are no quiet hours. Browser permission behaviour is unchanged.
- Per-session mute MUST persist on the hub and synchronize across devices.
- Question and permission notifications MUST use high urgency.
- Completion notifications MUST use low urgency. RFC 8030 also defines
  `very-low`, but FCM rejects it, so `low` is the lowest portable value.
- Every session notification MUST include computer, session name, and a
  concise brief. Oracle notifications name Oracle and give a brief.
- Completion notifications MUST say that no action is needed.
- An alert that asks to be notified, such as a Copilot CLI version that failed
  its startup check, MUST use high urgency and replace the previous alert
  from the same computer.
- Opening the related chat MUST clear question, permission, and completion
  notifications from the device notification center.

Priority order:

1. User question
2. Permission request
3. Agent completion

## 11. Mobile PWA behavior

- The app MUST be installable over HTTPS.
- Swipe right anywhere appropriate MUST open Sessions.
- Swipe left MUST close Sessions.
- Horizontal code/table scrolling and Safari's native Back gesture MUST not be
  stolen.
- Mobile controls MUST use at least 40px targets where practical.
- Inputs MUST use 16px text on iOS to prevent browser zoom.
- In installed iOS mode, the app background MUST extend behind the status bar
  and Dynamic Island. Headers, drawer branding, dialogs, and full-height panel
  controls MUST remain below the safe-area inset.
- iOS standalone mode MUST use a safe top fallback when
  `env(safe-area-inset-top)` incorrectly reports zero.
- Mobile header controls MUST meet the safe-area boundary without adding a
  second centered-row gap below the Dynamic Island.
- Composer and dialogs MUST respect the home indicator and visual viewport.
- Keyboard-open sizing MUST follow `visualViewport.height` and `offsetTop`.
  Detection MUST compare the current visible height with a stable unfocused
  baseline rather than assuming `innerHeight` remains unchanged while the
  keyboard opens.
- In browser and split-size modes, the entire mobile shell MUST follow the
  current visual viewport height and offset even when the keyboard is closed;
  it MUST NOT assume full-screen dimensions.
- In installed standalone mode with the keyboard closed, the shell MUST use
  the full window height rather than leaving a browser-chrome-sized empty band
  when iOS reports a shorter idle visual viewport.
- Relay in Agentic green MUST be the fixed in-app brand, browser-tab icon,
  manifest icon, native icon, and Apple touch icon. App settings MUST NOT
  expose icon style or icon color controls.
- The credentialed Web App Manifest MUST be the sole Home Screen icon source;
  the HTML head and website root MUST NOT define Apple-touch icons that take
  precedence over it. The manifest MUST declare new opaque full-bleed Relay
  PNG URLs at 192px, 512px, and 1024px with purpose `any`, and the service
  worker MUST pre-cache them. Missing Apple-touch probe paths MUST return 404
  rather than the SPA document. An existing iPhone or iPad installation needs
  to be removed and re-added before a shipped launcher-icon or install-time
  status-bar change appears.

## 12. PWA updates

- The deployed package version is the source of truth for the displayed
  version. An immutable build identity MUST distinguish separately built
  releases, even when they share a package version.
- `/api/version` MUST be uncached.
- Its build identity MUST describe the same static release as the browser
  bundle and service worker, including after rollback. Version-only responses
  from older hubs MUST remain supported.
- The app MUST detect bundle-only releases even when service-worker bytes are
  unchanged.
- Update checks SHOULD run at startup, foreground return, and on demand.
- Update now MUST activate/reload the deployed release.
- The prompt MAY be dismissed without discarding update availability.
- A deployed UI change required to expose a newly available provider MUST
  trigger the main-shell update prompt; provider capability MUST NOT depend on
  visiting App settings to discover that an update exists.

## 13. Persistence and privacy

Persistent state MAY include:

- Session metadata and UI-open state
- Queues and drafts
- Notification mute settings
- Tool activity reconstructed from Copilot events
- Provider identity and provider-specific runtime metadata
- Knowledge bookmark metadata
- The settings profile (§9.3)
- Paired node registry and encrypted/external secret references
- Oracle conversation history, including finalized speech submitted as normal
  Oracle user messages through `ManagerAgent.send`

Persistent state MUST NOT include:

- Copied repositories
- Copilot/GitHub or Claude authentication
- SSH private keys
- Pairing tokens in Git
- Voice recordings
- Temporary transcription artifacts
- Live `.env` files or credentials
- Conversation-mode PCM, synthesized audio, partial transcripts, or separate
  voice transcript/recording artifacts

Awaited session mutations MUST become visible only after their state write
commits. A refused write MUST NOT leave the mutation in memory, subsequent
successful writes, snapshots, or queue dispatch decisions. Mutations sharing a
coalesced write MUST share its commit outcome; a later batch MUST start from
committed state, not a rejected batch. Validation failures MUST NOT leave
partially applied changes.

Removing or replacing a session MUST NOT turn an earlier committed mutation
into a rejected call. State-dependent reductions and equality guards MUST
respect admitted mutation order, including runtime permission changes, working
directories, and questions arriving while an earlier reply is being recorded.

Live streamed text MAY remain volatile until the next persisted mutation.
Publishing a live delta MUST NOT expose unrelated, uncommitted session or queue
changes.

History fetched before a newer local admission MUST NOT overwrite that turn,
its status, or its pending input when installed. Transcript ownership checks
MUST run at mutation preparation, including the commit-to-registration gap.
Rejecting stale history MUST preserve the polling version and live-watermark
guards without disabling legitimate external/native history refresh.

## 14. Error handling

- Invalid input MUST produce an explicit user-visible error.
- Failed sends MUST restore the draft.
- Remote-node errors MUST identify the owning computer where useful.
- The app MUST NOT silently convert errors into success-shaped data.
- Network or process restart recovery MUST preserve as much user-visible state
  as possible without claiming an operation succeeded.

### 14.1 Refusal diagnostics

Every computer counts the user-facing refusals it sends so a refusal that
fires falsely shows up without a user report:

- A refusal is a 4xx response from a matched route, or a 501 a route raises
  because this computer cannot do what was asked; 404s for unknown routes
  are not counted. A 401 or 403 a route raises as an error, such as a path
  outside the session folder or a refused memory change, is counted. The
  pairing-token and Host/Origin checks reply directly without a reason, so
  those are not counted.
- Each refusal is keyed by route template (for example
  `/api/computers/:computerId/sessions/:sessionId/messages`), method, status,
  and a stable reason code: the error's `reasonCode` (such as
  `terminal-draft-conflict.new-text` or `retained-session.archived`), else the
  `reasonCode` of an error it wraps, else its class name; `validation` for
  invalid input; `not-found`/`not-registered` for those fallbacks; and
  `http-<status>` for a plain error or a direct reply that names no reason.
  Each key keeps `count`, `firstAt`, and `lastAt`.
- Distinct keys are bounded at 256; further keys count in one `other` bucket.
  Counts live in memory only and start again when the process restarts.
- Each refusal emits one `info` log line,
  `{ event: 'request.refused', route, method, status, reason }`.
- Message text, prompts, paths, ids, query strings, headers, and client
  addresses are never recorded or logged by this counter.
- The hub serves its counts at `GET /api/diagnostics/refusals` as
  `{ since, refusals }`, sorted by count, under the same Host/Origin policy as
  every other `/api/` route. There is no reset. Browsers reach only the hub,
  so it counts every browser-facing refusal, including those a node returned
  through it (as `RemoteNodeRequestError`, or
  `remote-node.terminal-draft-conflict`). Nodes only log their own refusals;
  they expose no endpoint.

## 15. Release and operations

- Releases MUST be immutable and activated atomically.
- The active service MUST serve assets from the release directory, not the
  development `dist/`.
- The current release plus two rollback candidates SHOULD be retained.
- Hub and node MUST run as systemd user services and start after reboot.
- Application changes MUST be committed and pushed before deployment.
- Unrelated dirty worktree changes MUST be preserved and excluded from scoped
  releases.
- Every validated development fix MUST end with an explicit user decision about
  whether to update the production node.
- Production MUST NOT be updated implicitly from development approval or from
  approval granted for an earlier fix.
- A general release is complete only after targeted/full tests, production
  build, intended-host deployment, version verification, and live health
  checks. Provider rollouts MAY remain development-only pending manual
  approval; untouched nodes MUST continue advertising only their supported
  providers.

## 16. Acceptance regression matrix

Every material release SHOULD preserve:

- All computers visible and paired node online
- Provider capabilities visible before session creation
- Previously open tmux sessions restored after a simulated host reboot
- Active tmux and SDK session discovery
- Immediate Send, editable Queue, and Stop semantics
- Phone Enter newline and desktop Enter send
- Questions and permissions visible and scroll-targeted
- Task-complete summaries as Agent messages
- Ordinary tools as tool cards
- Clear/restart/delete lifecycle guarantees
- Notification priority, mute, and clearing
- Multiple document upload and cleanup
- Direct recording, cancel, transcription, and no auto-send
- Session-rooted path confinement and remote routing
- Markdown, PDF, search, reading mode, and Knowledge folders
- Numeric context and Interactive/Plan/Autopilot runtime controls
- Side questions answered without prompting or changing the session
- Side questions docked above the message bar, kept per session, with follow-ups
- Dynamic Island and home-indicator safe areas
- Bundle-only PWA update detection
- Synced settings matching across devices on the same hub, with no theme flash

## 17. Authoritative implementation areas

| Concern | Primary location |
| --- | --- |
| UI, composer, workspace, Knowledge | `src/App.tsx`, `src/index.css` |
| Session search, filters, and state labels | `src/SessionNavigation.tsx`, `src/session-presentation.ts` |
| Session-actions disclosure | `src/SessionActions.tsx` |
| Side questions | `src/SideQuestions.tsx`, `server/side-question.ts`, `AgentService.askSession` |
| Oracle (session manager agent) | `src/ManagerAssistant.tsx`, `src/OracleSettings.tsx`, `src/use-oracle-settings.ts`, `server/manager-*.ts`, `shared/manager.ts` |
| Browser API client | `src/api.ts` |
| Settings profile | `shared/settings-profile.ts`, `src/settings-profile.ts`, `server/settings-profile-*.ts`, `index.html` (appearance bootstrap) |
| Shared contracts | `shared/contracts.ts` |
| Session lifecycle and transcript recovery | `server/agent-service.ts` |
| Provider aggregation and Claude Agent lifecycle | `server/provider-session-service.ts`, `server/claude-agent-service.ts` |
| Persistent session/uploads | `server/session-store.ts` |
| tmux behavior | `server/terminal-session.ts` |
| Copilot CLI update check | `server/cli-canary.ts`, `AgentService.probeTerminalStartup` |
| Active-session discovery | `server/active-sessions.ts` |
| Hub/node routing | `server/hub-routes.ts`, `server/node-routes.ts`, `server/computer-manager.ts` |
| Workspace security/search | `server/workspace-browser.ts` |
| Knowledge persistence | `server/knowledge-store.ts` |
| Audio transcription | `server/transcription-service.ts` |
| Transcription on another computer | `server/delegated-transcription-service.ts` |
| Push notifications | `server/push-notification-service.ts`, `public/sw.js` |
| PWA update logic | `src/pwa.ts`, `public/sw.js` |

This specification and the architecture document MUST be updated when a product
decision intentionally changes one of these contracts.
