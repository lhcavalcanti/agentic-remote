# UI and interaction reference

## Scope and authority

Reviewed baseline: **v1.1.0**, commit
`15a043e57234f7addfd8160f990dd22b38f1882a`, September 9, 2026.
The [publication delta](../reviews/2026-09-09/code-and-issues.md) records v1.1.1
responsive Markdown margins and the newly arrived #241.

This browser reference is not a redesign or permission to change behavior.
[The application specification](../app-spec.md) remains normative, including
delivery, ownership, recovery, and accessibility obligations.

- **Implemented** describes a reachable source path at this baseline; it does
  not imply every device or provider path was exercised.
- **Required** refers to the normative specification. A known implementation
  gap remains a gap, not a newly accepted product decision.
- **Proposed / open request** identifies future criteria, not shipped guarantees.
  Issue or PR prose alone is not evidence of implementation or approval.

Coverage: `src/` including `components/`, `features/`, and the browser API;
public PWA assets; and `e2e/` synthetic fixtures. Provider execution, server
persistence, native-shell installation, deployment, and bundle measurements
have separate owners. Source links identify baseline ranges; follow symbols
if subsequent refactoring moves them.

## Product identity and information architecture

The primary job is supervising agents while retaining conversation, draft,
and reading position—not providing a general terminal or generic chat.

1. **Sessions:** computer-grouped conversations, metadata search, attention and
   work filters, explicit ordering, creation, and application settings.
2. **Conversation:** ownership and folder identity, chronological messages,
   required actions, optional status details, queue, and composer.
3. **Knowledge:** a shared root catalog, session root selection, persistent
   folder exploration, and a docked or expanded document reader.

Session files are a session-scoped dialog, not another saved library.
Resources, tasks, runtime, and lifecycle actions belong to the selected session.
See [App](../../src/App.tsx#L6176-L6620),
[navigation](../../src/SessionNavigation.tsx), and
[session actions](../../src/SessionActions.tsx).

The existing visual system uses local **Mona Sans**, Graphite/Light surfaces,
restrained borders, and navigation/panel/text/muted tokens. Agentic green is
the default accent; Ocean, Violet, Ember, Rose, and Teal are tab-local choices.
Warning, error, task, and computer colors retain separate meanings. Tab icon
and brand share artwork; accent changes do not rewrite installed-app icons.
See [tokens](../../src/index.css#L1-L181),
[appearance](../../src/appearance.ts), and [accent icon](../../src/accent-icon.ts).

## State ownership

| State | Authority / lifetime | Important boundary |
| --- | --- | --- |
| Computer availability and provider capabilities | Hub-facing API/event projection | A node remains an execution owner, not another UI hub. |
| Session identity, transcript, status, queue, tasks, runtime | Owning computer; browser projection | Identity is **computer ID + session ID**, never session ID alone. |
| Selected session and linked Knowledge file | URL plus current workspace state | Back/Forward and clear lineage must not select an unrelated session. |
| Custom computer/session order and selected sort | Browser-local storage; in-memory projection | Not synchronized between devices; see #239 below. |
| Session search and filter | Current App instance | Filtering does not mutate selection, draft, or saved custom order. |
| Composer text, paste payloads, queue-edit identity, pending submission | Versioned browser-local draft map per computer/session | Not a hub-synchronized draft service; local storage can fail. |
| History preview | Transient per-session history state | The hidden unsent draft, not the preview, is the durable draft. |
| Acceptance receipts and recovery bindings | Browser-local identities plus server response evidence | A matching transcript string is not a receipt. |
| Shared Knowledge roots and explicit session-root association | Hub metadata; association has a revision | Root selection is separate from session cwd and local reading position. |
| Knowledge open/docked/expanded mode and preferred pane widths | Browser-local workspace preferences | Switching sessions retains the workspace mode. |
| Knowledge root/folder/file position | Browser-local, per session; reserved sessionless position | Clear replacement carries position; another session does not inherit it. |
| Expanded folders / loaded folder contents | Saved per root / current in-memory cache | Collapsing a branch and refreshing it have different effects. |
| Tree scroll, current document scroll/fragment/Preview–Source state | Transient reader/workspace state | Same-document handoff can retain these; full reload persistence is not implied. |
| Question field values | Mounted card keyed by computer/session/request | Same-request updates retain edits; switching/remounting is not durable answer storage. |
| Appearance, shortcuts, status line, creation defaults | Browser-local preferences | Defaults affect future sessions; accent alone is tab-local session storage. |
| Session mute / device notification subscription | Hub mute metadata / device subscription | Opening a chat withdraws its device notifications. |

See [session keys](../../src/session-presentation.ts#L7-L11),
[draft storage](../../src/App.tsx#L436-L660),
[root association hook](../../src/use-session-knowledge-root.ts), and
[response provenance](../../src/session-response-order.ts).

## Desktop and phone layouts

**Implemented desktop:** above 960 CSS pixels, Sessions has a 320px left column,
adjustable within 220–560px. Conversation and docked Knowledge share the rest;
expanded Knowledge hides conversation without becoming a sidebar tab.
Navigation and content scroll independently.

The docked reader supports pointer resizing, Left/Right, Shift for larger
steps, and Home/double-click reset. Saved width is clamped to available space.
See [ReaderWorkspace](../../src/ReaderWorkspace.tsx).

**Implemented phone:** at 960px and below, Knowledge covers conversation.
Sessions and files have separate full-width drawers. Back to files restores
navigation; Return to conversation restores the composer.
See [phone surfaces](../../src/index.css#L5693-L5855) and
[reader controls](../../src/App.tsx#L5356-L5550).

**Required:** respect visual viewport height/offset, safe areas, and reachable
actions with the keyboard open. Phone fields use 16px text without disabling
zoom. The iOS standalone fallback is not a universal top inset.
See [viewport controller](../../src/App.tsx#L7336-L7377),
[mobile controls](../../src/index.css#L5970-L6138),
[standalone/reduced-motion rules](../../src/index.css#L6346-L6373), and
[specification §11](../app-spec.md#11-mobile-pwa-behavior).

## Navigation, session actions, and priority

Search matches title, folder, computer, provider, and mode—not transcript.
All, Needs you, and Working retain every computer, including empty groups.
Recent activity, Attention first, and Name are views over Custom order.
Next/previous shortcuts follow displayed order. Reordering is disabled while
filtered; session drags stay within a computer and require Custom.

The row's priority is question, permission, waiting, unconfirmed queue
delivery, error/recovery, suspended, running tasks, foreground work, then idle.
Offline replaces the visible live-state label and excludes work from Working;
the description retains last-known state and attention can remain discoverable.
Provider/mode badges sit above the title, not on computer headers.
See [classification](../../src/session-presentation.ts#L49-L117),
[filter projection](../../src/session-navigation-view.ts), and
[order handling](../../src/App.tsx#L12770-L12844).

New session selects an online computer, advertised provider, and folder;
Open previous is separate. Unavailable providers remain visible but disabled.
Copilot/tmux remain defaults; Claude is SDK-only. Status updates retain
deliberate choices; computer fallback invalidates the previous owner's folder.
See [NewSessionDialog](../../src/App.tsx#L1930-L2462) and
[specification §3](../app-spec.md#3-session-model).

The header keeps Knowledge/folder directly reachable. Session actions contains
resources, rename, mute, runtime, and lifecycle controls; Escape is independent.
The [UI offers Restart for online error](../../src/App.tsx#L7185-L7198); the provider audit reports Claude refusal.
Clear/delete are confirmed; clear retains draft/reader lineage, **not** custom rank.
[Computers](../../src/App.tsx#L2643-L2765) manages pairing/availability;
confirmed removal unpairs a computer without deleting its sessions.

## Timeline, questions, and background tasks

Messages are chronological with local-time persisted timestamps and distinct
user/assistant/notice/activity roles. Tools show individual status, duration,
compact details, and contiguous nested groups. Running tools are **not sticky**,
regardless of older issue descriptions or test names.
See [activity rendering](../../src/App.tsx#L3923-L4383) and
[current-tool CSS](../../src/index.css#L2260-L2286).

Initial rendering keeps 250 messages plus required running activities/ancestors.
Show earlier reveals all remaining history, not another page. Expansion
survives snapshot refresh; settled rows are memoized and history stays in memory.

Following latest is initially enabled. Scrolling more than 48px from the bottom
pauses it; Scroll to latest, sending, or switching sessions resumes it.
A newly arriving question/permission can force visibility without permanently
undoing a manual pause. New tool rows still trigger bottom-following when it
was enabled; #224 requests a stronger reader hold.
See [scroll controller](../../src/App.tsx#L9218-L9309).

Required actions outrank passive activity. Permission buttons use the supplied
safe choices. Questions support single/multiple choices, free text, and
structured fields with defaults and validation. Structured forms have explicit
Submit/Cancel; their local Escape action is a reply/cancellation, not the
global “hide a panel” behavior. Failed replies must retain an actionable card.
See [PromptCards](../../src/features/prompts/PromptCards.tsx) and
[specification §5](../app-spec.md#5-questions-and-permissions).

Background tasks are a separate read/manage dialog: queued/running first,
then settled tasks, with progress, times, output, results, and errors when
reported. Stop task requires confirmation and an advertised live handle;
otherwise the panel explains why stop is unavailable. Blue task treatment is
distinct from foreground status. Task snapshots resynchronize after reconnect.
See [task view](../../src/features/background-tasks/BackgroundTasksDialog.tsx),
[task ordering](../../src/features/background-tasks/task-order.ts), and
[task reads](../../src/App.tsx#L7244-L7318).

## Composer and delivery

Text and actions are separate panels: files/microphone leading, delivery
trailing. Queue/warnings scroll separately; there is no newline button.
Editor height is capped according to viewport:
[composer sizing](../../src/composer-sizing.ts).

| Input | Desktop | Phone/coarse pointer |
| --- | --- | --- |
| Enter | Immediate Send; Save to queue during a queued rewrite | Newline |
| Shift+Enter | Newline | Newline |
| Ctrl/Cmd+Enter | Queue; existing rewrite saves in place | Queue |
| Explicit Send | Request immediate delivery, not silent app queuing | Labeled Send, same delivery intent |

Command completion may first fill a suggestion; IME composition does not submit.
Arrow history preserves the hidden draft. Remappable defaults are Alt+Up/Down
(sessions), Alt+K (Knowledge), Alt+Shift+K (expand), Alt+T (tasks), respecting
editable/modal contexts. See [keyboard handling](../../src/App.tsx#L12413-L12614).

**Required:** immediate follow-up Send uses native steering when supported;
unsupported steering errors rather than silently becoming editable FIFO work.
Queue is Agentic Remote's FIFO; Stop is an explicit abort, not a side effect of
Send. An SDK background agent can keep Queue available without a foreground
turn; a detached shell is not equivalent.

Queue entries remain in place during editing. Save targets that exact item;
targeted Send now is capability-gated and idle-only. An unconfirmed dispatch
blocks repeat delivery and requires explicit resolution. Local resource/view
commands do not execute from queued rewrites.
See [submission](../../src/App.tsx#L11088-L11391),
[queue editing](../../src/App.tsx#L11690-L12164), and
[specification §6.2](../app-spec.md#62-keyboard-behavior).

Draft protection is a delivery contract, not just convenient persistence:

- Persist an owned pending submission before sending; new writing stays separate.
- Restore refused/unconfirmed submissions without automatically replaying them.
- Retain hidden history drafts and paste payloads across switches and clear IDs.
- Record acceptance by submission identity before retiring pending browser state.
- Warn on failed saves; startup read failures block submission rather than
  overwriting an unread saved draft. Best-effort preferences cannot authorize Send.
- A tab that cannot persist acceptance has an explicit residual uncertainty;
  client-only storage cannot provide server-side idempotency.

Pastes over 20 lines collapse to numbered labels; ordinary sends expand the
exact owned payload, including surrounding whitespace. Browser failure/reload
recovery can retain that shape. Accepted queue re-edit does not yet carry it,
and ambiguous legacy paste recovery has a loss path described below.
See [paste ownership](../../src/App.tsx#L715-L1114) and
[durable composer writes](../../src/App.tsx#L8234-L8399).

## Files and audio

Picker/drop items process in selection order. Upload appends a reference;
audio appends transcription to the originating draft, never auto-sending.
Appending during history preview updates the hidden draft.

Microphone capture uses browser-memory chunks. The action strip becomes
Cancel, timer, and Stop & transcribe. Cancel discards capture; stopping normally
transcribes into the originating draft. Capture stops at 15 minutes.
Unsupported recording and denied microphone access have explicit errors.
See [attachment/capture handlers](../../src/App.tsx#L11395-L11620).

Supported types, 25 MiB limits, transcription placement, and private cleanup
are governed by [specification §7](../app-spec.md#7-attachments-and-audio).
The browser does not delete the device's source file; successful UI responses
alone do not prove backend cleanup.

## Session files and Knowledge reading

Session files open at cwd with folder navigation, explicit scoped search,
document history, and Markdown/text/image/PDF preview. Search requires at
least two characters. Insert path and Ask agent add to the existing draft.
Move here is an explicit cwd mutation, separate from read-only browsing;
opening a document or choosing a Knowledge root does not move cwd.
See [WorkspaceDialog](../../src/App.tsx#L5552-L6174) and
[specification §8.1](../app-spec.md#81-read-only-workspace-browser).

Knowledge works without a session. An empty catalog opens the picker on the
active session's computer/cwd. Explicit choices are its folder, a shared root,
another folder, or unlink. Opening does not promote a local root into hub
metadata; revision conflicts retain the choice for review/retry.
Removing a root confirms shared impact, never deletes files, and leaves
referencing sessions with a named unavailable association.
See [root choices](../../src/KnowledgeRootChoices.tsx),
[root selector](../../src/KnowledgeRootSelector.tsx), and
[root binding](../../src/use-session-knowledge-root.ts).

Folders expand in place, load lazily, and sort directories first with natural
names. Refresh retains loaded entries/current document and exposes branch-local
errors with Retry. Tree arrows and Home/End move focus; expansion state and
depth are exposed programmatically. Request generations and pairing/session
ownership reject superseded results.
See [tree state](../../src/knowledge-tree.ts),
[restore decisions](../../src/knowledge-restore.ts), and
[tree interaction](../../src/App.tsx#L10636-L10757).

Markdown has Preview/Source, an outline, unique heading anchors, relative
document links, and root-qualified local images. Missing/refused links retain
the current document and show an error. External image references may still
load externally; “files stay on their computer” is not an offline-media promise.
Explicit code-fence Copy preserves exact text and reports clipboard failure.
PDF uses a lazy PDF.js canvas with Previous/Next; Mermaid is lazy and debounced,
with source fallback while incomplete or invalid.
See [document controls](../../src/DocumentViewControls.tsx),
[navigation](../../src/markdown-navigation.ts),
[code copy](../../src/MarkdownCodeBlock.tsx), and
[Mermaid](../../src/MermaidDiagram.tsx).

Add to draft is disabled with an explanation without a compatible online
owning session. It reveals the composer while retaining the unchanged document
for reopening. URL `computer`, `session`, and root-relative `file` navigation
must follow authoritative bindings and normal path validation.
See [specification §8.3](../app-spec.md#83-knowledge).

## Resources, runtime, settings, and notifications

Skills and MCP servers are read-only, session-scoped tabs reached from Session
actions or `/skill`, `/skills`, `/mcp` with an optional local filter. Refresh
does not send a prompt or start a provider merely to inspect it. Reported
session state, configured folder defaults, last-known capture time, unsupported
inspection, empty results, offline state, and errors have distinct copy.
Tab arrows/Home/End work; retiring a session/pairing invalidates its old view.
See [SessionResources](../../src/SessionResources.tsx),
[local commands](../../src/session-resource-commands.ts), and
[browser response validation](../../src/api.ts#L128-L253).

Model and context loads a fresh advertised catalog, presents numeric context
capacity, and applies supported settings only while idle. No model offerings
are embedded in this reference. App settings expose reading appearance, tab
accent, per-provider creation defaults, per-computer default folders, status
line options, keyboard shortcuts, notifications, and application updates.
See [RuntimeDialog](../../src/App.tsx#L4509-L4757) and
[AppSettingsDialog](../../src/App.tsx#L3360-L3921).

Notification priority is question, permission, completion. Mute is hub-owned;
device subscriptions are not. Opening the chat withdraws its tagged
notifications. Unsupported, installation-required, denied-permission, enabled,
and test-notification outcomes are separate settings states.
The optional [shell bridge](../../src/shell.ts) detects capabilities individually;
[shell notifications](../../src/shell-notifications.ts) avoid initial snapshot
bursts and prioritize required action over completion.

## PWA, offline behavior, and accessibility

[Manifest/icons](../../public/manifest.webmanifest) support installation.
[The worker](../../public/sw.js) caches shell/static resources, not API
responses or documents. Cached shell does not guarantee offline prompt delivery.

[PWA updates](../../src/pwa.ts) check startup, foreground return, hourly, and
on demand. Uncached build identity detects bundle-only changes. Dismiss keeps
availability; activation rechecks deployment, including rollback/legacy hubs.

[DialogFrame](../../src/components/DialogFrame.tsx) names its modal, takes
focus without overriding a deliberately focused child, contains Tab, and
restores focus. Global Escape closes the appropriate UI layer rather than
discarding a pending agent decision. Disclosures use groups/navigation rather
than pretending to be ARIA menus. Touch has explicit alternatives to swipes;
horizontal content scrolling and Safari browser Back are protected.

Required quality includes visible focus, practical 40px-or-larger phone
targets, 16px phone fields, meaningful status text beyond color, and reduced
motion. These source mechanisms are **not an accessibility conformance claim**.
Known accessibility gaps include PDF canvas-only content, a question listbox
whose keyboard highlight lacks programmatic active-option state, and generic
action errors without live/alert semantics. Assistive-technology verification
and resolved-color contrast measurement remain outstanding.

## Empty, waiting, error, and unavailable states

| Surface/state | Implemented response / caution |
| --- | --- |
| No selected conversation | Create/open guidance and Knowledge entry; no invented session. |
| Empty selected session / loading history | Ownership-aware starting prompt / loading indicator. |
| Empty or filtered Sessions | Counts, empty-group explanation, clear filters; computers remain visible. |
| Required action | Action card, priority row label, forced visibility; failed answer retains recovery path. |
| Offline computer | Offline/last-known labels; resource and reference actions explain restrictions. |
| Lost event connection | Exponential reconnect (1–30 seconds), snapshot refresh, and retained local state; no delivery guarantee. |
| Queue uncertainty / browser storage failure | Explicit warning; preserve identity/text and block unsafe repeated admission. |
| Knowledge load or refresh failure | Preserve current document/loaded branch; error plus retry where applicable. |
| Missing preview/clipboard support | Source/alt-text or explicit failure; never a false Copy success. |
| Workspace search with zero matches | Current result list is empty without dedicated “no matches” copy. |

## Known gaps and open-request dispositions

| Item | Baseline disposition and confidence |
| --- | --- |
| **#165: collapsed paste through queue** | **Partial, high confidence.** Ordinary paste/send/failure safeguards exist, but `SendMessageInput`/`QueuedPrompt` carry no presentation metadata and `editQueuedPrompt` restores plain expanded text. |
| **#165: ambiguous legacy labels** | **Current residual loss, high confidence.** Migration retains an unresolved payload rather than immediately deleting it; no recovery UI exposes it, and ordinary accepted Send submits labels and drops that unresolved copy. |
| **#224: answer displaced by activity** | **Current open request, high confidence in mechanism.** A followed view calls bottom scrolling on tool insertion; manual scroll-away already works. No new automatic reader-hold or tool compaction is implemented. Chronology remains required. |
| **#239: shared custom order / clear continuity** | **Current open request, high confidence.** Order is browser-local, not live-synchronized; clear prunes the old key and appends its replacement while preserving draft/Knowledge state. |
| **#241: Markdown question messages** | **New open request, source-confirmed.** Question-card branches render the question string as heading text. Safe Markdown rendering must preserve controls, original request data and reply/ownership semantics. |

For #239, hub-owned order and legacy bootstrap remain **proposals**, not
requirements. Conflicting legacy orders require a decision before migration;
no issue closure is implied. [Queue contracts](../../shared/contracts.ts#L143-L183),
[send input](../../shared/contracts.ts#L464-L475),
[order reconciliation](../../src/App.tsx#L8150-L8198), and
[replacement migration](../../src/App.tsx#L10046-L10081) anchor these findings.

## Testable acceptance reference

The **R** rows condense existing normative obligations; they are not assertions
that every edge case passes. **P** rows are proposed/open-request criteria.

| ID | Kind | Check |
| --- | --- | --- |
| UX-NAV-01 | R | Search/Needs you/Working retain every computer and preserve selected draft/reading position. |
| UX-NAV-02 | R | Computed sorts do not rewrite Custom; keyboard stepping follows visible order; failed saves report errors. |
| UX-OWNER-01 | R | Every action targets the selected computer/session/provider; no stale identity revives after clear or re-pair. |
| UX-ACTION-01 | R | Questions/permissions override passive status and become visible on arrival/entry without hiding after refusal. |
| UX-TIME-01 | R | Messages/tools remain chronological; running tools are not sticky; independent tool outcomes remain readable. |
| UX-TASK-01 | R | Active tasks have management controls or an explicit stop-unavailable explanation; stop is confirmed. |
| UX-COMP-01 | R | Desktop Enter sends, phone Return inserts newline, Shift+Enter inserts newline, modified Enter queues. |
| UX-COMP-02 | R | Explicit immediate delivery never silently falls back to editable FIFO; Queue/Stop remain distinct actions. |
| UX-QUEUE-01 | R | Save updates the named queue item in place; targeted Send is capability-gated; uncertainty prevents replay. |
| UX-DRAFT-01 | R | History, failed sends, reload, and clear preserve owned drafts and pending-submission identity. |
| UX-DRAFT-02 | R | Failed storage admission sends nothing; accepted receipt cleanup never resurrects an accepted prompt. |
| UX-PASTE-01 | R/gap | Long-paste payloads and surrounding text are preserved; ambiguous legacy recovery must not silently lose payloads. |
| UX-FILE-01 | R | Ordered uploads/transcription append only to the originating draft; cancel recording sends/transcribes nothing. |
| UX-KNOW-01 | R | Explicit root association is revisioned hub metadata independent from cwd and browser reading position. |
| UX-KNOW-02 | R | Mode survives session switches; position follows its session and clear lineage; stale responses cannot overwrite it. |
| UX-READ-01 | R | Preview/Source, outline, duplicate headings, links, code Copy, and file-to-draft handoff preserve their stated owners. |
| UX-RESOURCE-01 | R | Resource reads never send/resume/configure; loading, empty, unavailable, stale, and errors stay distinguishable. |
| UX-PHONE-01 | R | Conversation, files, reader, and final dialog actions fit the visual viewport and safe areas at narrow/short sizes. |
| UX-PWA-01 | R | New build identity prompts despite unchanged version/worker bytes; dismiss/recheck/rollback remain coherent. |
| UX-NOTIFY-01 | R | Required-action urgency exceeds completion; mute synchronizes and opening a chat clears device notifications. |
| UX-PASTE-P01 | P | Accepted queue re-edit/recovery retains paste display shape across providers, owning computers, and reload (#165). |
| UX-SCROLL-P01 | P | First live activity below readable assistant text pauses following until explicit reader intent, without reordering (#224). |
| UX-ORDER-P01 | P | Same-hub clients converge on reviewed custom order; clear substitutes identity in place after bootstrap policy approval (#239). |
| UX-A11Y-P01 | P | PDF content has an accessible text alternative; custom options expose active focus; asynchronous action errors are announced. |

## Evidence and verification limits

Focused existing tests: **13 App + 315 helper/component cases passed**; one
real-Mermaid case skipped. **11 isolated audit cases** cover delivery, scroll,
ordering, legacy loss, storage, and accessibility semantics.

**JSDOM controls:** 100 messages render 100 rows with no Show earlier; the source
tail window is **250**, not 100. At 1,000 messages: 250 initial/1,000 expanded rows.
Counted bottom-scroll calls: followed tool 1, paused tool 0, required action 1,
subsequent paused tool 0, explicit Latest 1, next tool 1; no pixel-anchor test.
With 20 other 2,000-character drafts, one input change writes three storage
values totaling 81,678 string characters. Counts are **not** paint latency or
capacity; shared CPU is noisy. [Performance](../performance.md) prioritizes
full-history read/transport, not initial DOM; PDF.js/Mermaid are already lazy.

Initial browser attempts were blocked by missing NSPR/NSS and a long Unix socket
path. The integration pass used session-local libraries and a short private
runtime, without installing system packages.
[Browser smoke](../reviews/2026-09-09/browser-smoke.mts) mounted Chromium at
**1440x900 and 390x844**, with no horizontal overflow and fully mocked APIs/events;
its listener and runtime were removed. This is not screenshot, scroll-anchor,
timing, physical-device or screen-reader proof. The
[combined review](../reviews/2026-09-09/code-and-issues.md) records the separate
full repository gate. No production service or deployment changed.
