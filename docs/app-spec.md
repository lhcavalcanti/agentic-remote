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
- Sessions MUST offer metadata search and All, Needs you, and Working filters.
  Filtering MUST keep every configured computer visible and MUST NOT change
  the selected session, its draft, or its Knowledge position. Reordering MUST
  be disabled while filtered so hidden sessions are not reordered implicitly.
- Session ordering MUST be explicit. Custom order remains the backward-
  compatible default; Recent activity, Attention first, and Name views MAY
  reorder the displayed sessions within each computer without rewriting the
  saved custom order. Keyboard next/previous navigation MUST follow the
  displayed order. A failed preference save MUST surface an error.
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
- Historical sessions MAY be opened from the new-session flow.
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

### 3.3 Rename, restart, clear, and delete

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
- Clear MUST remove old conversation history permanently. Because populated
  deleted Copilot IDs cannot be safely reused, clear MUST create a replacement
  session ID while preserving folder, title, runtime, and draft continuity.
- Clear MUST keep the reader on the live replacement unless they navigate
  elsewhere, including gaps between removal, replacement, and response delivery.
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
  remove Agentic Remote state and session uploads.

### 3.4 Host reboot and power-loss recovery

- Each owning computer MUST persist whether an open session is SDK- or
  tmux-backed.
- Actively discovered tmux Copilot sessions MUST be migrated into the persisted
  terminal recovery set.
- After host boot, missing previously open terminal sessions MUST be recreated
  in tmux with the same Copilot session ID, cwd, title, allow-all setting, model,
  effort, context tier, and agent mode.
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

- SDK `ask_user` requests MUST render as actionable cards, including the
  structured `message`/`requestedSchema` form supported by current Copilot
  runtimes.
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
- Question identity matching MUST tolerate terminal line wrapping, including
  breaks within words, while still requiring the complete question and field
  headings. A failed match MUST preserve the pending request and surface an
  actionable error instead of typing into an unverified dialog.
- If the CLI clips a long form, answering or dismissing it MAY temporarily
  enlarge its owning single-pane window within a bounded limit. The complete
  question and fields MUST still be verified before sending keys. The app MUST
  restore the previous size and sizing policy on completion or failure without
  overwriting intervening operator changes; it MUST NOT resize shared windows
  or a window whose ownership changed.
- Wrapped control hints MAY trigger a bounded viewport check, but MUST NOT
  replace verification of the complete question. Each successive long form
  MUST independently verify its identity and restore its viewport.
- Completion of a fallback dismissal MUST NOT count as delivery of the answer.
  The running service MUST retain the original answer continuation across late
  dismissal confirmation and refuse conflicting retries or replay after an
  uncertain send. A receipt for an earlier question MUST NOT clear a newer one.
- Safe Yes/choice and Stop actions MUST be available.
- Cancelling or declining a persisted terminal question MUST dismiss the
  matching live form and confirm completion before hiding its card. A failed
  dismissal MUST retain the question; it MUST NOT report a false success that
  leaves the terminal capturing subsequent messages.
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
  Such input MUST be left untouched with an actionable conflict, not cleared,
  duplicated, or submitted automatically.
- A working terminal composer MUST accept native queued messages and slash
  commands whose catalog explicitly allows execution during a turn. Other
  immediate messages MUST wait. These delivery modes MUST still reject
  startup screens, dialogs, non-composer frames, and existing drafts.
- A complete model, effort, and context footer MUST NOT make an otherwise live
  composer appear unavailable. Unrelated output below the frame MUST still
  prevent it from being treated as a live composer.
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
If immediate steering is unsupported, the app MUST surface an error and
restore the draft; it MUST NOT silently queue. Stop remains the explicit way
to abort the current turn; sending after Stop begins a new turn.
On phone, the composer MUST label the explicit Send action and explain that
keyboard Return inserts a newline.

The Queue button MUST add to Agentic Remote's editable FIFO. Queued prompts MUST
support edit and remove operations. Direct CLI-native queue entries are not
required to be individually editable.

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
- Supported documents include PDF, CSV/TSV, Excel, Word, Markdown, text,
  JSON/YAML, OFX/QFX, and common images.
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
- Provider defaults MUST apply only when creating a new session; existing
  sessions MUST keep their selected runtime model.
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
- The browser-tab icon MUST track the selected accent immediately and after
  reload, without changing other tabs or the shared installed-app icons.
- Warning, error, computer-identity, and background-task colors MUST retain
  their semantic meaning.
- The accent choice MUST be scoped to the current browser tab, persist across
  reloads in that tab, and fall back to Agentic green for an unknown value.
- The top-left brand mark MUST use the same SVG artwork and selected accent as
  the tab icon, including after reload, rather than a separate generic glyph.

## 10. Notifications

- Notification settings MUST be discoverable under App settings.
- Per-session mute MUST persist on the hub and synchronize across devices.
- Question and permission notifications MUST use high urgency.
- Completion notifications MUST use low urgency. RFC 8030 also defines
  `very-low`, but FCM rejects it, so `low` is the lowest portable value.
- Every notification MUST include computer, session name, and a concise brief.
- Completion notifications MUST say that no action is needed.
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
- All headers, drawer branding, dialogs, and full-height panels MUST remain
  below the Dynamic Island.
- iOS standalone mode MUST use a safe top fallback when
  `env(safe-area-inset-top)` incorrectly reports zero.
- Composer and dialogs MUST respect the home indicator and visual viewport.
- Keyboard-open sizing MUST follow `visualViewport.height` and `offsetTop`.
- In browser and split-size modes, the entire mobile shell MUST follow the
  current visual viewport height and offset even when the keyboard is closed;
  it MUST NOT assume full-screen dimensions.

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
- Paired node registry and encrypted/external secret references

Persistent state MUST NOT include:

- Copied repositories
- Copilot/GitHub or Claude authentication
- SSH private keys
- Pairing tokens in Git
- Voice recordings
- Temporary transcription artifacts
- Live `.env` files or credentials

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
- Dynamic Island and home-indicator safe areas
- Bundle-only PWA update detection

## 17. Authoritative implementation areas

| Concern | Primary location |
| --- | --- |
| UI, composer, workspace, Knowledge | `src/App.tsx`, `src/index.css` |
| Session search, filters, and state labels | `src/SessionNavigation.tsx`, `src/session-presentation.ts` |
| Session-actions disclosure | `src/SessionActions.tsx` |
| Browser API client | `src/api.ts` |
| Shared contracts | `shared/contracts.ts` |
| Session lifecycle and transcript recovery | `server/agent-service.ts` |
| Provider aggregation and Claude Agent lifecycle | `server/provider-session-service.ts`, `server/claude-agent-service.ts` |
| Persistent session/uploads | `server/session-store.ts` |
| tmux behavior | `server/terminal-session.ts` |
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
