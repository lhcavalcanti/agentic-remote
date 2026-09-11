# Agent workspace: supervise, read, act

Design study and implemented draft, September 5, 2026 (UTC).
Refs [#116](https://github.com/lhcavalcanti/agentic-remote/issues/116) and
[#46](https://github.com/lhcavalcanti/agentic-remote/issues/46).

## Direction

Agentic Remote is a remote agent manager with a reading workspace, not a
generic chat client or a second IDE. The central loop should be:

**Find the work that needs you -> understand its context -> act deliberately.**

The PR contains earlier visual proposals and captures of the implemented React
application; those two forms of evidence are labeled separately. Application
captures use synthetic data. No provider conversation, private document, real
machine name, or credential appears in the fixtures.

## Full-viewport workbench and session roots

The implemented follow-up removes the phone sidebar's `min(86vw, 310px)` cap.
Sessions, Knowledge files, the document reader, and the root chooser use the
available phone width. Files have their own full-height surface instead of
being squeezed underneath the sessions list. Back to files and returning from
Sessions retain the tree's position, including a dense tree with many files.

The phone reader combines repeated chrome into one compact document header.
Safe-area and visual-viewport handling remain in place, and phone inputs use
16px text without disabling zoom. Desktop reading starts with balanced panes;
saved reader/sidebar widths and resize controls remain authoritative.

The paired Graphite and Light appearances use the same type and component
hierarchy. Graphite remains the default. A separate saved appearance preference
does not overwrite the per-tab accent or favicon identity. Mona Sans is served
locally from `public/fonts/MonaSans.woff2`, from `github/mona-sans` revision
`0f7dc66ddd766605eb0e75c3f47bf9d1dd38ceca`; its SIL Open Font License is retained
in `public/fonts/OFL.txt`. The existing Agentic mark and installed icon identity
are preserved.

### One shared catalog, one optional root per session

The root chooser names the affected session, its working-folder suggestion,
and the computer/path of every saved root. **Use for this session** saves only
that session's association. A selected root opens an inline subfolder browser;
the chosen subfolder becomes the true session root without changing the shared
catalog. **Save this root folder** is the explicit action that adds that folder
to the shared catalog and selects it. Choosing a root does not change cwd, copy
or mount files, start an agent, or send a prompt. Root removal is behind a
separate impact confirmation rather than beside the everyday switch control.

| State | Owner |
| --- | --- |
| Knowledge root catalog | Existing hub `knowledge.json`; files remain on the root's computer |
| Root association | Existing rollback-compatible hub `session-knowledge.json` keeps the shared root ID; additive `session-knowledge-paths.json` stores matching nested paths by session/root/revision |
| Root/folder/document position | Existing browser-local per-session state |
| Expanded folders | Browser-local, per shared root and nested session scope |
| Reader mode and preferred sizes | Browser workspace, unchanged by session switching |
| Appearance | Browser preference, separate from tab-local accent |

Revision-checked writes detect conflicting clients, including a change that
arrives while a new folder is being validated. Rejected choices remain in the
chooser for an explicit retry. A removed root keeps its last metadata as an
unavailable association; it is never replaced silently with a convenient
default. Session clear/replacement and missed-event lineage preserve the link,
while explicit session deletion removes only its association.

Older per-session reading positions remain usable but are not automatically
imported into hub metadata. Explicit unlinking remains distinct from never
having linked a root, so old browser state cannot relink it. A second client
gets the same hub root; it restores only its own matching local document
position, or starts at that root if it has none.

An accepted binding can introduce a folder created by another client after
this tab loaded its catalog. Older catalog responses cannot replace newer
entries or revive a removed folder or pairing. Unavailable root snapshots
remain recognizable but never become browsable catalog entries.
Fresh, explicit folder additions are validated against pairing and removal
lifetimes separately from delayed binding observations.

Once clear succeeds, its replacement session is returned even if carrying
Knowledge or notification metadata fails. The failure is logged and shown
separately, so a legacy node's plain-removal event does not cost this client
its draft or reading position. Opening the replacement's Knowledge panel or
reloading the browser retries a pending root transfer within the same computer
registration. Genuine clear failures and obsolete pairing responses still fail.

Binding writes publish a complete private recovery journal by atomic rename
before replacing the state file. An interrupted temporary journal does not
prevent restart; a malformed published journal still fails closed.

The session search/filter selector is also shared with next/previous
shortcuts. Keyboard navigation cannot open a conversation hidden by the
displayed filter, and changing views does not rewrite custom ordering. Failed
custom-order saves, including drag-and-drop, show an error rather than silently
losing the preference on reload.

## Professional workspace revision

The follow-up focuses on four surfaces the owner identified as insufficient:
sessions, their order, the document tree, and the Markdown viewer. The official
Copilot App's restrained navigation rows and compact file chrome are the
reference, not a reason to remove Agentic Remote's computer/provider identity.

| Surface | Revised treatment |
| --- | --- |
| Sessions | More readable titles, quiet provider/runtime metadata, explicit status treatments, local activity times, and flatter computer groups. A new default sidebar width of 320px gives titles room; saved user widths remain respected. |
| Ordering | Explicit Custom, Recent activity, Attention first, and Name views. Custom order is not overwritten; drag is unavailable in computed/filtered session views, and next/previous shortcuts follow the visible order. |
| File explorer | A compact root trigger opens a session-scoped chooser, retaining owner/path context and separating shared-root removal from selection. File-kind icons, indentation, natural folder-first ordering, and branch-local refresh/retry remain in place. |
| Markdown | Shared Preview/Source controls in Knowledge and workspace previews, an overlay outline with proper focus behavior, a measured reading column, clearer heading/table/quote hierarchy, and explicit exact-text code copying. |

The old `knowledge-roots-open` display preference is no longer read or written;
it is left intact for rollback rather than migrated or deleted. Existing root
catalog and node session files are not migrated. New associations use their
own metadata file. Folder refresh updates the listing, not the document being
read; source view remains read-only.

The browser walkthrough exercises real ordering selection and keyboard
drag-and-drop, outline navigation, source view, and clipboard copying using
fictional data. The file explorer and session list have their own scroll
regions: variable-length titles are not forced into a fixed visible-row count.

## What the reference products contribute

The study used official product material, not assumptions about feature parity.
Only interaction principles are borrowed; no product artwork or screenshots
are copied into Agentic Remote.

| Reference | Useful pattern | Agentic Remote adaptation |
| --- | --- | --- |
| [GitHub Copilot app](https://github.com/features/ai/github-app) and [session documentation](https://docs.github.com/en/copilot/how-tos/github-copilot-app/agent-sessions) | A quiet navigation hierarchy, parallel sessions, visible execution context, and secondary actions kept out of the primary workspace. | Searchable sessions grouped by their owning **computer**, visible provider/runtime labels, and a labeled session-actions disclosure. No invented repository/worktree ownership model. |
| [Codex app introduction](https://openai.com/index/introducing-the-codex-app/) | Supervision of parallel work and switching between independent threads without losing context. | All / Needs you / Working views over existing session metadata. Filtering does not select a different session or reset its reading position. This is inspiration, not an added Codex provider. |
| [Claude Code Desktop](https://code.claude.com/docs/en/desktop) | Environment and session context are explicit, and permission decisions remain part of the working flow. | Question, permission, waiting, and error states are named rather than encoded only by a colored dot. Existing approval, takeover, and cancellation semantics remain intact. |
| Obsidian [workspace](https://obsidian.md/help/workspace), [tabs](https://obsidian.md/help/tabs), [outline](https://obsidian.md/help/plugins/outline), and [quick switcher](https://obsidian.md/help/plugins/quick-switcher) | Stable file navigation, persistent reading arrangements, quick retrieval, and documents with their own navigation. | Keep the tree in its established place and preserve a safe document-to-draft handoff. Do not add note editing, file-content synchronization, or a second Knowledge tab. |

The user's reference to "Obsidia markdown" is interpreted as Obsidian.

## Decisions recovered from the project history

The history review screened 115 pull-request titles and examined more than 30
relevant issues, PR bodies, and discussions. Later decisions and the current
[application specification](../app-spec.md) take precedence over older mockups.

| Evidence | Decision preserved in this draft |
| --- | --- |
| [#46](https://github.com/lhcavalcanti/agentic-remote/issues/46), [#116](https://github.com/lhcavalcanti/agentic-remote/issues/116) | Improve visual quality and modularity without cutting features. This remains a partial slice, not a claim to finish the entire redesign checklist. |
| [#113](https://github.com/lhcavalcanti/agentic-remote/pull/113) and its [corrective discussion](https://github.com/lhcavalcanti/agentic-remote/pull/113#issuecomment-5497223177) | Reader visibility/size belong to the workspace; root/folder/document belong to each session. The file tree stays in the same location. |
| [#38](https://github.com/lhcavalcanti/agentic-remote/pull/38), [#98](https://github.com/lhcavalcanti/agentic-remote/pull/98), [#170](https://github.com/lhcavalcanti/agentic-remote/pull/170) | Knowledge roots are independent of sessions. Retain the lazy, accessible tree and start root creation in Knowledge, not Sessions. |
| [#187](https://github.com/lhcavalcanti/agentic-remote/pull/187), [#193](https://github.com/lhcavalcanti/agentic-remote/pull/193), [#195](https://github.com/lhcavalcanti/agentic-remote/pull/195) | Never hide an unanswered terminal form, approve a takeover by sending, or retry an uncertain paste silently. No provider transport code changes. |
| [#45](https://github.com/lhcavalcanti/agentic-remote/issues/45), [#144](https://github.com/lhcavalcanti/agentic-remote/pull/144), [#149](https://github.com/lhcavalcanti/agentic-remote/pull/149) | Preserve deliberate reading and draft continuity. Do not replace the existing follow-latest, suspend, or session-selection logic. |
| [#109](https://github.com/lhcavalcanti/agentic-remote/pull/109), [#159](https://github.com/lhcavalcanti/agentic-remote/pull/159), [#178](https://github.com/lhcavalcanti/agentic-remote/pull/178) | Keep responsive composer behavior and tab-local accent preferences. Warning, error, computer identity, and background-task colors retain their meaning. |

The existing badge-above-title requirement wins over #116's earlier one-line
row suggestion. Likewise, the older Sessions/Knowledge tab mockup in #46 is
not implemented: it conflicts with the later persistent-panel decision.

## Layout mockup

Desktop: one workspace, three coordinated areas.

```text
+-----------------------+--------------------------------+-----------------------+
| Agentic Remote        | Session title     Knowledge + :| Knowledge             |
| New session      PCs  | Provider / runtime / computer  | Root / owning computer|
|                       | Clickable working folder       |-----------------------|
| Sessions   2/3 online |--------------------------------| Document / Raw / TOC  |
| Find a session...     |                                | Root / folder / note  |
| All | Needs you | Work| Conversation                   |-----------------------|
|                       |                                |                       |
| Studio                | Tool activity remains in order | Markdown document     |
| Copilot / tmux / Idle |                                |                       |
| Plan the workspace    | Questions and permissions      | Readable line length  |
|                       | remain actionable cards        | Relative links        |
| Build node            |                                | Tables and images     |
| Claude / SDK / Question|                               |                       |
| Review recovery       |--------------------------------|                       |
|                       | Existing Send / Queue / Stop   |-----------------------|
| Knowledge / Read-only | Draft, attachments, microphone | Read-only   Ask agent |
| Roots > file tree     | Model / context controls       | Adds a draft, not send|
| App settings          |                                |                       |
+-----------------------+--------------------------------+-----------------------+
```

Phone: full-width surfaces, never a narrowed desktop split.

```text
Full-width sessions   Conversation           Full-width Knowledge
+------------------+  +--------------------+ +----------------------+
| Find a session   |  | = Session    Book :+| | Files  Knowledge  + X|
| All / Needs you  |  | Provider / folder  | | Root / document      |
|                  |  |--------------------| |----------------------|
| Every computer   |->| Question / reply   | | Read the note        |
| remains visible  |  | or conversation    | | with the existing    |
|                  |  |                    | | tree one tap away    |
| Knowledge opens |  |--------------------| |----------------------|
| its own files   |  | Draft and actions  |<| Read-only / Add draft|
+------------------+  +--------------------+ +----------------------+
```

The PR's before/after images and flow recording are the visual source of truth
for exact spacing and appearance. These diagrams explain the relationships,
not additional controls.

## Implemented improvements

### 1. Find the right session without losing your place

- Search title, computer, provider, execution mode, or working folder. Multiple
  search terms must all match; search never scans transcripts or files.
- All shows the existing ordered list. Needs you shows questions, permissions,
  waiting sessions, and errors, including a persisted failed delivery after the
  passive status returns to idle. Working includes background tasks even when
  the foreground is idle.
- Counts describe the whole workspace; the filtered result reports how many
  sessions match. Every configured computer stays present, including empty
  groups and offline computers.
- Offline rows explicitly show last-known state rather than claiming an agent
  is still working. A pending offline decision remains discoverable in Needs
  you, but the filter itself does not execute or approve anything.
- Search/filter state is transient. Selection, drafts, browser session URLs,
  and Knowledge state keep their current owners. Clear filters restores the
  existing order; reordering is unavailable while items are filtered.
- The owning computer's current name is used for search and accessible labels,
  without rewriting a cached session's metadata.

### 2. Give the conversation its header back

Knowledge, the current folder, and New session stay directly reachable.
Session actions contains rename, restart, clear, close, mute, and the
capability-gated move-to-tmux action.

Each action keeps its existing label, confirmation, and disabled state. The
disclosure uses ordinary focusable buttons and Tab navigation. Escape closes
only the disclosure and restores its trigger; outside interaction dismisses
it without stealing focus. A session switch remounts it closed.
Offline lifecycle actions are unavailable, and pending questions or permissions
block idle-only actions even if the passive status is stale. Close session
explicitly describes its permanent deletion of the session and history.
Notification mute remains hub-owned and usable while a computer is offline.

### 3. Read, then ask deliberately

Knowledge retains rendered/raw Markdown, images, PDFs, headings, breadcrumbs,
and relative links. The document gets a calmer surface, 16px reading text,
more line spacing, and a bounded reading width in expanded mode.

Ask agent about file appends an absolute, owning-root-qualified file reference
to the current draft. It never uploads the document, copies its contents,
creates a session, sends a message, or discards existing text.
An active history preview is not that draft: the handoff restores and extends
the original text and collapsed-paste metadata. Pending submission identities,
failure ownership, and newer writing continue through clear replacements.
Storage failures remain visible and cannot authorize delivery.

The handoff is available only when the selected session and root share an
online computer. Otherwise the disabled action explains which computer needs
a session or reconnection. On a phone it returns to the conversation; on
desktop it restores the docked view. The document can be reopened afterward.
Reopening the unchanged document in the same session preserves its scroll,
anchor, and rendered/raw view instead of rebuilding the reader. A session-file
preview is separately scoped to its session and working folder; cached offline
references are disabled with an explanation.

### 4. Quiet surfaces, meaningful color

Use neutral graphite surfaces and consistent borders/radii. Keep the original
green and all existing per-tab accent presets. Reserve strong accent for
primary interaction and active work; retain amber attention, red errors, blue
background tasks, and computer identity colors.

Computer groups are labels rather than nested cards. Provider and runtime
badges remain above the title; folder context stays visible. Drag handles are
quiet for a mouse but revealed on focus and remain available on touch.
New session is a compact action in the Sessions heading, leaving Send visually
primary. Computer management remains directly reachable in the sidebar footer.
On a phone, Send is explicitly labeled and header actions have 40px targets.
The desktop sidebar gives sessions more space while retaining an independently
scrollable Knowledge tree. Offline sessions cannot be suspended or resumed
until their computer reconnects.
Cached task counts are identified as last known while offline. Short viewports
remain scrollable; phone session and file navigation do not compete for the
same visible height. The session-actions disclosure is bounded by the
conversation's actual width, including a wide sidebar and a resized reader.
It stays above the composer on short screens; the capture checks pointer
actionability without executing a destructive action, not only bounding boxes.

The welcome screen also offers Open Knowledge without creating a session.
There are no invented dashboards, usage metrics, or empty decorative charts.

## Reproduce the mockups

The capture uses the repository's existing Playwright dependency. Build and
serve static frontend assets without a proxy to a running hub:

```bash
pnpm build
python3 -m http.server 4397 --bind 127.0.0.1 --directory dist
```

In another terminal, from the same worktree:

```bash
TSX_DISABLE_CACHE=1 pnpm exec node --import tsx e2e/capture-workspace.ts \
  --base-url http://127.0.0.1:4397 \
  --output-dir /path/to/ux-media/after --phase after

pnpm exec node --import tsx e2e/render-workspace-gifs.ts \
  --frames-dir /path/to/ux-media/after

TSX_DISABLE_CACHE=1 pnpm exec node --import tsx e2e/capture-workbench-review.ts \
  --base-url http://127.0.0.1:4397 \
  --output /path/to/ux-media/review
```

Chromium must be installed with its normal runtime libraries. A minimal host
may need the distribution's NSS/NSPR libraries; this does not require a change
to application dependencies.

The harness refuses production ports 4317/4318 and non-loopback origins,
intercepts every API request and WebSocket, blocks service workers, and fails
on unmocked traffic or browser errors. It uses a fresh disposable browser
profile, fixed time, and fictional fixtures. No running provider is contacted.
The review harness measures 320x568, 360x740, 390x844, 430x932, and 844x390
surfaces, dense-tree scroll restoration, a full-height phone root chooser,
root changes across sessions, a second client, both appearances, and a
simulated keyboard/safe-top viewport. It records geometry instead of relying
only on an absence of horizontal overflow. Server tests cover actual metadata
persistence separately from these browser API fixtures.

Short-viewport and VisualViewport simulation are not a claim of physical
iPhone/Android keyboard or assistive-technology certification. Development and
production rollout still follow the repository's approval and continuity gates.

The review can also run with `--browser webkit`. For an existing browser in an
isolated environment, `--executable-path` selects its executable; native library
and resource paths remain machine-local rather than hard-coded in the repository.

The GIFs are three-second-per-step walkthroughs assembled from actual captured
interaction states, not recordings of a live fleet. Static images accompany
them so motion is not required to understand the design. To regenerate the
before images, serve base commit `c9e501ad25dbb4638d27f43cc85e35f3cbc7ace0`
from a separate checkout/port and run the same capture with `--phase before`.

The professional revision adds walkthroughs for session ordering and document
reading, including keyboard rearrangement, the outline, Source mode, and code
copying. Existing browser-local custom order and reading positions remain the
underlying state rather than being recreated for the visuals.

## Review flows

| Flow | Expected outcome |
| --- | --- |
| Search by computer + provider, then clear | Matching rows only; all computer groups persist; current draft and selection remain unchanged. |
| Needs you -> waiting session | Existing actionable card is reached through the existing selection path. No automatic approval. |
| Working with foreground idle + active tasks | The row is included and its task count still opens the task panel. |
| Session actions -> Rename; Escape | Original action works; Escape dismisses only the top disclosure, not Knowledge or a pending answer. |
| Knowledge -> expand -> Ask agent | Existing draft gains a file reference; desktop docks, phone returns to chat; nothing is sent. |
| Root on another computer | Reader remains usable; Ask agent is disabled with the owning-computer explanation. |
| Switch sessions with Knowledge open | Workspace mode persists; each session recovers its own reading position using the existing logic. |
| Narrow phone / keyboard / tab accent | Controls remain reachable, input text does not shrink below 16px, and the selected accent remains tab-local. |

## Boundaries and follow-up work

This draft does not implement every idea from #116. Light appearance, inline
session creation, a complete command palette, and deeper composer organization
remain separate design slices. The UI design itself adds no provider transport,
credential or topology migration; frozen core integrations are recorded below.

At the history-review snapshot, these open PRs already owned adjacent changes:
[#191](https://github.com/lhcavalcanti/agentic-remote/pull/191) (reader resizing and
branding), [#167](https://github.com/lhcavalcanti/agentic-remote/pull/167) (dialog,
form, and related behavior), [#150](https://github.com/lhcavalcanti/agentic-remote/pull/150)
and [#171](https://github.com/lhcavalcanti/agentic-remote/pull/171) (queue controls),
and [#160](https://github.com/lhcavalcanti/agentic-remote/pull/160) (collapsed paste).
This draft does not cherry-pick or reimplement those changes.

The first coordinated local review candidate integrated reviewed core commit
`125ec298fdc6748cca5fde8a49690030f41bf739` through the PR #191 reader/branding
candidate with normal merges. The reader retains its responsive/saved-width
contract and the 36px shared accent-aware SVG. The existing capture comparator
still permits at most 12 differing decoded RGBA pixels and rejects larger or
dimension-changing frames. The synthetic fixture can optionally seed storage
only once to exercise real reload persistence without accessing a live service.
Queue APIs were left unchanged in that pass for the separate #150 integration.

The complete frozen #150 core is now integrated through #191 into this client
candidate. Queued rewrites retain structured ownership, collapsed pastes and
pending/accepted submission receipts through Knowledge/file handoffs and hidden
history. The primary action says Save on runtimes without immediate queued
dispatch and Send now when that capability is advertised. Unconfirmed server
dispatches appear as Check delivery in Needs you, never as definitely unsent.
Queue context and warnings can scroll above the editor on short viewports;
command suggestions remain anchored outside that scroller, and banner actions
retain the core's 44px phone targets.

The branch is intentionally a **draft**. Development browser evidence uses
synthetic API fixtures on a loopback UI runtime. It is not a claim to have
validated a restart of the live paired fleet. Do not promote this unmerged
branch: the deployment profile's `origin/main` gate remains intact.
