# Agent workspace: supervise, read, act

Design study and implemented draft, September 5, 2026 (UTC).
Refs [#116](https://github.com/lhcavalcanti/agentic-remote/issues/116) and
[#46](https://github.com/lhcavalcanti/agentic-remote/issues/46).

## Direction

Agentic Remote is a remote agent manager with a reading workspace, not a
generic chat client or a second IDE. The central loop should be:

**Find the work that needs you -> understand its context -> act deliberately.**

This draft implements a coherent first slice of the broader polish request.
The mockups are captures of the actual React implementation with synthetic
data, not a separate interface that cannot be used. No provider conversation,
private document, real machine name, or credential appears in the fixtures.

## What the reference products contribute

The study used official product material, not assumptions about feature parity.
Only interaction principles are borrowed; no product artwork or screenshots
are copied into Agentic Remote.

| Reference | Useful pattern | Agentic Remote adaptation |
| --- | --- | --- |
| [GitHub Copilot app](https://github.com/features/ai/github-app) and [session documentation](https://docs.github.com/en/copilot/how-tos/github-copilot-app/agent-sessions) | A quiet navigation hierarchy, parallel sessions, visible execution context, and secondary actions kept out of the primary workspace. | Searchable sessions grouped by their owning **computer**, visible provider/runtime labels, and a labeled session-actions disclosure. No invented repository/worktree ownership model. |
| [Codex app introduction](https://openai.com/index/introducing-the-codex-app/) | Supervision of parallel work and switching between independent threads without losing context. | All / Needs you / Working views over existing session metadata. Filtering does not select a different session or reset its reading position. This is inspiration, not an added Codex provider. |
| [Claude Code Desktop](https://code.claude.com/docs/en/desktop) | Environment and session context are explicit, and permission decisions remain part of the working flow. | Question, permission, waiting, and error states are named rather than encoded only by a colored dot. Existing approval, takeover, and cancellation semantics remain intact. |
| Obsidian [workspace](https://obsidian.md/help/workspace), [tabs](https://obsidian.md/help/tabs), [outline](https://obsidian.md/help/plugins/outline), and [quick switcher](https://obsidian.md/help/plugins/quick-switcher) | Stable file navigation, persistent reading arrangements, quick retrieval, and documents with their own navigation. | Keep the existing tree in its established place, improve document typography, and add a safe document-to-draft handoff. Do not add note editing, a graph, sync, or a second Knowledge tab. |

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

Phone: reuse the same model, never squeeze the desktop split into two columns.

```text
Sessions drawer       Conversation           Full-width Knowledge
+------------------+  +--------------------+ +----------------------+
| Find a session   |  | = Session    Book :+| | Files  Knowledge  + X|
| All / Needs you  |  | Provider / folder  | | Root / document      |
|                  |  |--------------------| |----------------------|
| Every computer   |->| Question / reply   | | Read the note        |
| remains visible  |  | or conversation    | | with the existing    |
|                  |  |                    | | tree one tap away    |
| Existing tree    |  |--------------------| |----------------------|
| and settings     |  | Draft and actions  |<| Read-only / Ask agent|
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
  waiting sessions, and errors. Working includes background tasks even when
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

### 2. Give the conversation its header back

Knowledge, the current folder, and New session stay directly reachable.
Session actions contains rename, restart, clear, close, mute, and the
capability-gated move-to-tmux action.

Each action keeps its existing label, confirmation, and disabled state. The
disclosure uses ordinary focusable buttons and Tab navigation. Escape closes
only the disclosure and restores its trigger; outside interaction dismisses
it without stealing focus. A session switch remounts it closed.

### 3. Read, then ask deliberately

Knowledge retains rendered/raw Markdown, images, PDFs, headings, breadcrumbs,
and relative links. The document gets a calmer surface, 16px reading text,
more line spacing, and a bounded reading width in expanded mode.

Ask agent about file appends an absolute, owning-root-qualified file reference
to the current draft. It never uploads the document, copies its contents,
creates a session, sends a message, or discards existing text.

The handoff is available only when the selected session and root share an
online computer. Otherwise the disabled action explains which computer needs
a session or reconnection. On a phone it returns to the conversation; on
desktop it restores the docked view. The document can be reopened afterward.

### 4. Quiet surfaces, meaningful color

Use neutral graphite surfaces and consistent borders/radii. Keep the original
green and all existing per-tab accent presets. Reserve strong accent for
primary interaction and active work; retain amber attention, red errors, blue
background tasks, and computer identity colors.

Computer groups are labels rather than nested cards. Provider and runtime
badges remain above the title; folder context stays visible. Drag handles are
quiet for a mouse but revealed on focus and remain available on touch.
New session is a neutral action in the sidebar, leaving Send visually primary.
On a phone, Send is explicitly labeled and header actions have 40px targets.
The desktop sidebar gives sessions more space while retaining an independently
scrollable Knowledge tree. Offline sessions cannot be suspended or resumed
until their computer reconnects.

The welcome screen also offers Open Knowledge without creating a session.
There are no invented dashboards, usage metrics, or empty decorative charts.

## Reproduce the mockups

The capture uses the repository's existing Playwright dependency. Start a
frontend-only development server in the feature worktree:

```bash
pnpm exec vite --host 127.0.0.1 --port 4396 --strictPort
```

In another terminal, from the same worktree:

```bash
TSX_DISABLE_CACHE=1 pnpm exec node --import tsx e2e/capture-workspace.ts \
  --base-url http://127.0.0.1:4396 \
  --output-dir /path/to/ux-media/after --phase after

pnpm exec node --import tsx e2e/render-workspace-gifs.ts \
  --frames-dir /path/to/ux-media/after
```

Chromium must be installed with its normal runtime libraries. A minimal host
may need the distribution's NSS/NSPR libraries; this does not require a change
to application dependencies.

The harness refuses production ports 4317/4318 and non-loopback origins,
intercepts every API request and WebSocket, blocks service workers, and fails
on unmocked traffic or browser errors. It uses a fresh disposable browser
profile, fixed time, and fictional fixtures. No running provider is contacted.
Screenshots cover 1440x900 and 390x844; additional interaction assertions cover
360x780 and a short 390x430 viewport. Short-viewport emulation is not a claim
of testing a physical iPhone keyboard.

The GIFs are three-second-per-step walkthroughs assembled from actual captured
interaction states, not recordings of a live fleet. Static images accompany
them so motion is not required to understand the design. To regenerate the
before images, serve base commit `c9e501ad25dbb4638d27f43cc85e35f3cbc7ace0`
from a separate checkout/port and run the same capture with `--phase before`.

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
remain separate design slices. There are no new provider capabilities or
state migrations.

At the history-review snapshot, these open PRs already owned adjacent changes:
[#191](https://github.com/lhcavalcanti/agentic-remote/pull/191) (reader resizing and
branding), [#167](https://github.com/lhcavalcanti/agentic-remote/pull/167) (dialog,
form, and related behavior), [#150](https://github.com/lhcavalcanti/agentic-remote/pull/150)
and [#171](https://github.com/lhcavalcanti/agentic-remote/pull/171) (queue controls),
and [#160](https://github.com/lhcavalcanti/agentic-remote/pull/160) (collapsed paste).
This draft does not cherry-pick or reimplement those changes.

The branch is intentionally a **draft**. Development browser evidence uses
synthetic API fixtures on a loopback UI runtime. It is not a claim to have
validated a restart of the live paired fleet. Do not promote this unmerged
branch: the deployment profile's `origin/main` gate remains intact.
