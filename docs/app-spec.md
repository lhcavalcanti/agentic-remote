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
- Copilot sessions MUST expose tracked background tasks when the owning
  runtime advertises task support. The UI MUST show queued, running,
  completed, failed, and cancelled task states, including task progress and
  timestamps where available.
- A session MUST use the blue active-task treatment while at least one
  background task is running. With no running background task, the existing
  green and gray session treatments MUST remain unchanged.
- Background task reads and cancellation MUST remain scoped to the owning
  computer and session. Task state MUST resynchronize after a reconnect
  instead of relying on a transient event count.

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

- Rename MUST update the web state and owning tmux/Copilot session when
  supported.
- Restart MUST preserve session ID, title, working folder, transcript, queue,
  runtime settings, and tmux window.
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
- Safe Yes/choice and Stop actions MUST be available.
- Cancelling or declining a persisted terminal question MUST dismiss the
  matching live form and confirm completion before hiding its card. A failed
  dismissal MUST retain the question; it MUST NOT report a false success that
  leaves the terminal capturing subsequent messages.
- Pending SDK questions MUST be reconstructed from persisted tool events after
  a service restart, including structured ask-user forms.
- If an SDK callback was lost, answering the recovered question MUST resume as a
  normal user turn.
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
- Form identity MUST preserve word boundaries. Terminal form reads MUST use
  tmux's joined soft-wrap capture instead of guessing whether a line break
  separated words or split an identifier.

- Full-screen send protection MUST recognize active terminal dialogs, including
  single-field questions, without treating keyboard hints quoted in transcript
  or composer text as an open dialog.

### 6.1 Layout

- Text input and action buttons MUST use separate visual panels.
- On phone, the text panel MUST remain wide enough for useful composition.
- The bottom action panel MUST expose Files and Microphone on the leading side.
- While an agent is running, Queue, Send, and Stop MUST remain available.
- A dedicated newline button MUST NOT be shown.

### 6.2 Keyboard behavior

| Environment | Enter/Return | Shift+Enter | Ctrl/Cmd+Enter |
| --- | --- | --- | --- |
| Phone/coarse pointer | Insert newline | Insert newline | Queue when available |
| Desktop | Send immediately | Insert newline | Queue |

The Send button MUST request immediate delivery. If immediate SDK steering is
unsupported, the app MUST surface an error and restore the draft; it MUST NOT
silently queue.
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

Drafts MUST persist independently per computer/session and MUST survive session
switches, failed sends, and clear replacement IDs.

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
- Markdown MUST support rendered and raw views.
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

### 8.2 Phone reading mode

- Selecting a file on phone MUST hide the tree and search controls.
- The preview MUST use the full workspace panel with readable 16px-or-larger
  text.
- Back to files MUST restore folder navigation.
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
- Choosing a root MUST allow any folder on the owning computer that the user can
  read, not only the home directory. Session working directories remain
  confined; a root is read-only.
- A root MUST be validated on its owning computer, and every path browsed under
  it MUST stay inside it.
- The reader MUST reopen the root, folder, and document last being read, so
  returning does not mean choosing them again. Changing folder MUST remain an
  explicit action.
- Knowledge MUST open as a panel beside the selected session, docked next to
  the conversation or expanded over it, and MUST NOT be a second sidebar tab.
- Whether the panel is open, and how much room it takes, is a workspace mode:
  it MUST persist across session switches, so a document being read is not
  dismissed by moving to another session.
- Each session MUST keep its own reading position — root, folder, and
  document — and switching sessions MUST show that session's position.
- Clearing a conversation replaces a session rather than deleting it, so the
  removal event MUST name the replacement and every client MUST carry that
  session's reading position across rather than discard it.
- File navigation MUST stay in the same place in every mode, so choosing a
  file does not depend on how much room the reader is taking.
- Reopening the panel MUST resume the tree where it was left rather than
  scrolling back to the top.
- Folders MUST expand in place as a tree rather than replacing the listing, so
  a parent stays visible while a child is open. Children are loaded on first
  expansion and reused afterwards.
- Expanded folders MUST be remembered per root, and reopening a remembered
  document MUST open the folders above it.
- A folder that cannot be read MUST report the failure on its own branch and
  leave the rest of the tree usable.
- The tree MUST expose `tree`/`treeitem` semantics with expansion state and
  depth, and support ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, and End.
- Knowledge stores root metadata on the hub; file content MUST remain on the
  owning computer.


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

## 10. Notifications

- Notification settings MUST be discoverable under App settings.
- Per-session mute MUST persist on the hub and synchronize across devices.
- Question and permission notifications MUST use high urgency.
- Completion notifications MUST use low/very-low urgency.
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
