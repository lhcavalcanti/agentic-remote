---
name: agentic-remote-navigation
description: Use when working on Agentic Remote — query its maintained Graphify code graph for architecture and relationships, locate UI or server behavior, understand hub/node and session ownership, change Knowledge or workspace browsing, and validate or roll out a change.
---

# Agentic Remote navigation

Use this skill to find the right code, understand a behavior contract, and
validate a change in the Agentic Remote application repository.

Agentic Remote is a mobile-first PWA for supervising GitHub Copilot and Claude
Agent sessions across trusted computers. `docs/app-spec.md` is the normative
product specification and wins over this skill whenever the two disagree.

For UI/UX design, visual polish, or frontend implementation, also load the
repository's `frontend-design` skill. It supplies design craft; this skill and
the product specification retain ownership of behavioral and rollout rules.

## Query the maintained code graph first

For architecture, ownership, call chains, dependencies, and cross-file
questions, start with the repository's `graphify/` snapshot rather than reading
the whole application component or report.

```bash
python3 graphify/manage.py check
python3 graphify/manage.py query "KnowledgeRoot KnowledgeReader"
python3 graphify/manage.py explain "KnowledgeStore"
python3 graphify/manage.py path "App.tsx" "KnowledgeReader"
python3 graphify/manage.py affected "WorkspaceFile"
```

- Run from this checkout, not another worktree's graph. `check` compares
  content hashes, including generator/tool versions and output hashes; a
  different HEAD alone does not mean the graph is stale.
- If the graph is stale or missing, run `python3 graphify/manage.py update`.
  If the isolated tool is missing, run `python3 graphify/manage.py setup`
  first (Python 3.12+). The generated report and graph JSON can be read without
  setup; freshness checking uses only Python's standard library.
- Queries are local with a target budget (`--budget 1500` by default).
  Graphify can retain complete edge sets above that target and reports when
  it does. Prefer precise questions. Use exact labels or qualified IDs when
  a symbol is ambiguous, then inspect source ranges before changing behavior.
- `EXTRACTED` means present in syntax; `INFERRED` means resolved by Graphify.
  Neither proves dynamic HTTP routing or runtime reachability. External
  package identifiers are not local source paths.
- Code, including tests and installation scripts, is structurally extracted.
  Docs/styles/media are inventoried, not semantically interpreted. Read the
  normative docs directly for product intent.
- For a simple edit to a known file, read that file directly. The graph is a
  navigation aid, not a mandatory detour for every lookup.

After relevant source changes, refresh before handing off the work:

```bash
# Stage only intended new source files; untracked files are never indexed.
git add path/to/new-source.ts
python3 graphify/manage.py update
python3 graphify/manage.py check
git add graphify/graph.json graphify/graph.html graphify/GRAPH_REPORT.md \
  graphify/communities.json graphify/metadata.json
```

Keep generated changes with the source change. Never hand-edit graph data to
hide staleness. Use the repository wrapper rather than native Graphify
update/install commands: it enforces tracked-only inputs, no network or LLM
calls during generation/query, offline HTML, and scoped writes. Do not install
global hooks, a hosted graph service, or an automatic watcher.

See `graphify/README.md` for scope, provenance, limitations, and tool upgrades.
Open `graphify/graph.html` for an offline visual overview. Read
`graphify/GRAPH_REPORT.md` only when a broad overview is actually needed.

## Authoritative documents

| Question | Read |
|---|---|
| What must the product do? | `docs/app-spec.md` (MUST/SHOULD/MAY language) |
| How do hub and node relate? | `docs/architecture.md` |
| What differs between providers? | `docs/provider-compatibility.md` |
| How is it installed and secured? | `README.md` |
| How are builds promoted and cleaned up? | `docs/deployment-promotion.md` |
| Why is there a native shell, and how does it connect? | `docs/native-shell.md` |
| Rollout approval policy | `.github/copilot-instructions.md` |
| Host topology and deployment | The machine-local promotion profile and `docs/deployment-promotion.md` |

## Where behavior lives

Most workflow state lives in `src/App.tsx`. Use graph results and these
landmarks rather than reading it end to end; source locations can change.

| Concern | Location |
|---|---|
| Main UI, dialogs, workflow state | `src/App.tsx` |
| Styling, safe areas, mobile breakpoints | `src/index.css` |
| Browser API client | `src/api.ts` |
| Shared request/response types | `shared/contracts.ts` |
| Copilot session lifecycle, transcript recovery | `server/agent-service.ts` |
| Claude Agent lifecycle | `server/claude-agent-service.ts` |
| Provider aggregation | `server/provider-session-service.ts` |
| Session persistence | `server/session-store.ts` |
| Side questions (`/ask`) | `src/SideQuestions.tsx`, `server/side-question.ts`, `AgentService.askSession` |
| Oracle (session manager agent; "manager" internally) | `src/ManagerAssistant.tsx` (panel, bubble, mode switch, resizer, queue editing), `src/voice-recorder.ts` (dictation), `src/OracleSettings.tsx` (model and folder-status parts placed in App settings groups), `src/use-oracle-settings.ts` (`useOracleSettings`); `server/manager-agent.ts` (runtime, queue, recovery, settings, session folders), `manager-tools.ts`, `manager-context.ts`, `manager-journal.ts`, `manager-store.ts`; `docs/design/session-manager.md` |
| Copilot event log reading | `server/event-log.ts` |
| tmux behavior | `server/terminal-session.ts` |
| Hub routes and origin policy | `server/hub-routes.ts` |
| Node routes (`/node-api`) | `server/node-routes.ts` |
| Hub to node routing | `server/computer-manager.ts`, `server/remote-node-client.ts` |
| Workspace listing, reading, search | `server/workspace-browser.ts` |
| Knowledge root metadata | `server/knowledge-store.ts` |
| Session cwd containment | `server/session-directory.ts` |
| Folder picker containment | `server/directory-browser.ts` |
| Audio transcription | `server/transcription-service.ts` |
| Transcription on another computer | `server/delegated-transcription-service.ts` |
| Push notifications | `server/push-notification-service.ts`, `public/sw.js` |
| Install and service management | `bin/agentic-remote` |

Useful `src/App.tsx` landmarks: `WorkspaceDialog`, `KnowledgeReader`, `AddKnowledgeRootDialog`,
`UserInputCard`, `SortableSessionItem`, `SortableComputerGroup`,
`upsertSession`, `orderedComputers`, `sessionsByComputer`.

## Core model

- A **computer** is a hub or a paired node. The hub serves the UI and owns
  local sessions; a node exposes authenticated `/node-api` routes only.
- A **session** belongs to exactly one computer and always executes there.
  Sessions are never migrated between computers.
- `registerNodeRoutes` runs for every role; `registerHubRoutes` runs only when
  `role === 'hub'`. Hub-only concerns such as the Host/Origin policy therefore
  do not apply to a node.
- Copilot sessions may be SDK-only or tmux-backed; an idle SDK session may move
  to tmux when the owning computer advertises support. Claude sessions are
  always SDK-only.
- Session status for tmux-backed sessions is derived from the Copilot event log
  by `statusFromEvents`, behind a size+mtime version gate, a `length:lastId`
  fingerprint gate, and a live-transcript watermark. `terminal-session.ts` sets
  no status itself.

## Files, workspace, and Knowledge

This is the area most likely to be extended, so its current limits matter.

- The workspace browser is **session-scoped**: it is rooted at `session.cwd`
  and reached through `/api/computers/:computerId/sessions/:sessionId/workspace`.
- Paths are relative and confined to the root. Absolute paths, `..`, hidden
  segments, and escaping symlinks are rejected by `resolveWorkspacePath`.
- Previewable types include Markdown, PDF, supported images, and an allowed
  set of text extensions. Read `server/workspace-browser.ts` for the current
  allowlists and size limits rather than inferring support from an extension.
- Markdown supports rendered/raw views, heading anchors, an outline, relative
  document links, and supported relative images through the owning root.
- Limits: 2 MiB text, 25 MiB PDF, 2000 directory entries; search is bounded and
  skips `node_modules`, `dist`, `build`, `coverage`.
- **Knowledge stores root metadata on the hub.** A root identifies an owning
  computer and readable absolute folder and is browsable without a session.
  Files remain on that computer and are read through its API.
- Knowledge is a docked/expanded reading panel with a persistent lazy folder
  tree. Panel mode belongs to the workspace; root/folder/document position
  belongs to each session. Preserve those separate owners when changing UI
  navigation, session switching, or clear/replacement handling.
- Root creation starts in Knowledge. With no roots and an active session, its
  initial picker uses that session's owning computer and working folder.
- Refused paths carry their reason: `400` for a disallowed path, `403` for
  escaping the root, `404` for a missing file, `413` for excessive size, and
  `415` for an unsupported preview type.
- `validateKnowledgeRoot` permits readable directories independently of session
  execution roots. Removing a computer retires its Knowledge roots and
  invalidates responses from the old pairing.

## Deployment topology

Keep the deployment channel separate from the runtime role. `hub` and `node`
describe where sessions and UI traffic execute; `development` and `production`
describe which checkout or release serves them.

For every machine setup, prefer a machine-local profile outside the repository
with explicit development root, production runtime root, immutable release
root, service name, health/external checks, validation policy, promotion policy,
and rollback policy. Do not store credentials or pairing tokens in that
profile.

The production service must run from the immutable `current` release. The
repository provides generic `bin/agentic-remote-promotion-monitor`,
`bin/agentic-remote-promotion-setup`, and
`config/agentic-remote-promotion.env.example` assets. Installing them copies
the monitor and profile into machine-local paths; the systemd timer must not
execute from the mutable development checkout. The local-only monitor may pull
and validate the development checkout, then graduate the exact validated
commit to the production runtime. It must not run tests against or replace the
externally reachable service before validation completes. See
`docs/deployment-promotion.md` for the full contract.

## Security invariants

Do not weaken these without an explicit product decision.

- Session working directories are confined to `$HOME`, extendable only through
  `AGENTIC_REMOTE_ALLOWED_ROOTS`. Apply the check on creation, never on load, so
  existing sessions are not stranded.
- The hub validates `Host` and `Origin` on every `/api/*` request and fails
  closed. When `AGENTIC_REMOTE_ALLOWED_ORIGINS` is unset it derives the policy
  from the hub's own `HOST:PORT` and allows loopback; any explicit list is
  honoured verbatim, which turns the loopback allowance off. A malformed entry
  fails at startup.
- Node access is authenticated by a pairing token. Never run
  `agentic-remote pair-info` for troubleshooting; it prints that token.
- Never copy state, pairing tokens, provider credentials, repositories, or SSH
  keys between hosts. Each host pulls from GitHub independently.
- Uploads, transcripts, and audio stay on the owning computer, except when
  `AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER` sends a recording to a paired computer
  to be transcribed. The hub buffers that audio in memory only, never on disk.

## Performance invariants

- `readSessionEvents` parses only appended bytes and caches the parsed prefix
  per session, invalidating on shrink, in-place rewrite, inode change, or a
  changed head sample. Preserve that invalidation set when editing it.
- `SessionStore.persist` writes compact JSON and coalesces writes queued behind
  an in-flight write; the snapshot is taken when the write starts, so every
  caller's mutation is still durable when its promise resolves.
- Avoid adding work proportional to total history to the 750 ms transcript poll.
- Between polls, a 100 ms check reads only each terminal session's event-log
  size and time; a change is taken in at once, but no session more than once
  per 750 ms, so busy sessions cost no more than the poll alone.
- Process discovery places candidates in tmux from the parents in its single
  `ps` listing; do not reintroduce per-pane `/proc` ancestry walks.

## Validating a change

```bash
pnpm check                      # oxlint + vitest + tsc/vite build
pnpm vitest run server/x.test.ts -t "name"   # targeted
pnpm test:canary                # real-tmux send/readiness subset, ~1 min
pnpm test:fast                  # every file needing no host tmux/Copilot/Claude
NODE_ENV=production pnpm check  # guards the inherited-env regression
```

- Vitest projects `fast`, `canary`, and `tmux` partition the files, so
  `pnpm test` still runs each file once, serially. Add a new real-tmux file to
  `canaryTests` or `tmuxTests` in `vite.config.ts`; otherwise it lands in
  `fast`, which hosted CI runs without tmux.
- `server/send-matrix.integration.test.ts` drives sends with the app's real
  options from `shared/send-policy.ts` against real tmux panes. Extend its
  table when send, queue, or draft-replacement behavior changes.

- `vite.config.ts` pins `NODE_ENV=development` for tests because React's
  production build omits `act`.
- Server tests that create sessions must set
  `AGENTIC_REMOTE_ALLOWED_ROOTS` to `tmpdir()`, since sessions are confined to
  `$HOME`.
- A packaged-media digest test fails whenever `ffmpeg-static` or
  `ffprobe-static` moves, and prints the replacement digests.

## Development workflow

Work is tracked in GitHub issues and lands through pull requests. **Do not push
directly to `main`.**

### Pre-task cleanup and refresh

Before creating a feature branch or worktree:

1. Inspect the primary checkout with `git status --short --branch`,
   `git worktree list --porcelain`, and `git branch -vv`.
2. Run `git fetch origin --prune`, then classify every auxiliary worktree and
   branch against its PR and `origin/main`. A squash merge needs PR or
   patch-equivalence evidence; ancestry alone is not enough.
3. Preserve the intentional detached production runtime worktree. Never remove
   a dirty, unmerged, or unowned worktree, and never discard its changes to
   make cleanup convenient.
4. Remove only clean worktrees whose work is merged, superseded by a reachable
   remote branch, or otherwise positively recoverable. Delete their local
   branches only after the same check; leave ambiguous branches in place.
5. Run `git worktree prune`, return the primary checkout to `main`, and use
   `git pull --ff-only`. Confirm that it is clean and that `HEAD` equals
   `origin/main` before branching.

### Versioning releases

Treat `package.json` as the authoritative application version and apply one
SemVer bump for every release candidate:

- **PATCH** (`1.0.0` → `1.0.1`) for fixes and hotfixes.
- **MINOR** (`1.0.0` → `1.1.0`) for features and code refactoring.
- **MAJOR** (`1.0.0` → `2.0.0`) for redesigns and breaking changes.

When a release contains more than one kind of change, use the highest applicable
bump. Documentation, tests, and build-only maintenance do not bump the version
unless they change shipped behavior or packaging. Rebase onto the target branch
before choosing the next number; do not reserve versions on concurrent,
unmerged branches or bump again when the current release candidate already
contains the required increment.

Keep every shipped shell version synchronized with the application version:
update `package.json`, `shell/package.json`,
`shell/src-tauri/tauri.conf.json`, `shell/src-tauri/Cargo.toml`, the local shell
package entry in `shell/src-tauri/Cargo.lock`, and versioned bundle examples.
Run the version-policy test before handoff. The build identity remains separate
and must still change on every build.

1. **Start from an issue.** File one first if the work is not already tracked,
   so the change has a rationale to link to.
2. **Branch** with a short prefixed name: `fix/…`, `feat/…`, `perf/…`,
   `docs/…`.
3. **Validate before opening**: `pnpm check`, plus
   `NODE_ENV=production pnpm check` when the change touches tests or config.
4. **Open a PR that links its issues** using closing keywords, so merging
   closes them automatically:

   ```
   Fixes #3
   Fixes #4
   ```

   Use `Refs #11` for a partial slice that should leave the issue open.
5. **Merge only after Supervisor `APPROVE` for the current head.** Follow the
   review loop below; delete the branch after graduation.
6. **Deploy and verify on development**, then follow the promotion policy in
   `.github/copilot-instructions.md` (see Rolling out).
7. **Close issues with evidence.** If a PR did not auto-close them, close each
   one with what changed, how it was verified, and any deliberate deviation
   from the issue's suggested fix. Record measurements where the issue was
   about performance.

### PR review loop

- Prefer small, single-purpose PRs. Split unrelated fixes into separate PRs.
- Merge only after an explicit Supervisor `APPROVE` for the current PR head.
  A signed verdict counts even when GitHub labels the review `COMMENTED`;
  passing checks, local-agent reviews, and other comments are not substitutes.
  Do not request GitHub Copilot as a reviewer.
- Keep fix comments minimal: one or two short sentences naming the actual fix
  and affected behavior. Do not paste long logs, review transcripts, or repeated
  status reports. For example: `Fixed startup queue recovery; pending messages
  now resume once after restart.`
- For user-visible changes, include current screenshots with synthetic or
  redacted data. For nonvisual changes, concise reproduction or validation
  evidence is enough. Keep detailed evidence in artifacts, not long comments.
- Iterate quickly: address related findings together, validate the affected
  behavior, and push promptly for Supervisor re-review. If a finding is no
  longer valid, explain why briefly with evidence. Once approved and merge
  prerequisites pass, merge promptly in dependency order without another
  approval loop. Preserve the existing development-first rollout and rollback
  rules.

Notes:

- Another agent session may be editing this checkout. Stage only your own
  paths, and prefer `git worktree add` for branch work so the shared working
  tree is left untouched.
- The service runs from a published release, so merging alone changes nothing
  on either host until a rollout.

### Post-merge cleanup

After the PR is merged and the commit is graduated:

1. Verify the PR merge SHA and promoted SHA.
2. Delete the merged remote branch.
3. Remove the temporary worktree and local branch created for the task.
4. Prune stale worktree metadata and leave the primary checkout clean on
   `main`.
5. Preserve the intentional production runtime worktree, if present; keep it
   detached and clean.

Only clean up paths owned by the task. Do not remove dirty, unmerged, or
unowned worktrees without explicit approval.

### Test session cleanup

Close every session a test or verification creates as soon as its evidence is
recorded, on development and production hubs alike. In Agentic Remote,
closing a session permanently deletes it.

1. Record each test session's ID when it is created, and give it a disposable
   prompt that says it is a synthetic check.
2. Before closing, verify that provenance: the expected title or prompt, the
   expected working folder, and no real user work in the transcript.
3. Close it with `DELETE /api/computers/:computerId/sessions/:sessionId` on
   the owning hub. Then confirm it has no tmux pane, Copilot process, or
   session-state directory under the owning runtime's Copilot home
   (`$COPILOT_HOME/session-state/<id>`, which defaults to
   `~/.copilot/session-state/<id>`).
4. A production hub can rediscover a development fixture or SDK smoke session
   from shared provider history. After any restart or discovery interval,
   check the open and history lists for the recorded IDs and close any that
   reappear.
5. Close stalled test probes created by other tooling, such as evaluation
   scenarios stuck on a trust prompt, only when their prompt proves they are
   disposable. Archive their transcripts first if their results may matter.

Never close a session only because its title looks like a test, and never
close user work.

## Rolling out

1. Deploy and validate on the **development hub** first.
2. `./bin/agentic-remote update` pulls the branch, installs, builds, publishes
   an immutable release, and restarts the service. `KillMode=process` keeps
   tmux sessions alive across the restart.
3. Verify development: service active, `/health` 200, computers still
   `online`, sessions preserved, and **the behavior the change was made for
   actually exercised**. That last part is what makes development "stable"; a
   green deploy alone does not.
4. **Once development is stable, continue to production without asking.** Run
   the same `update` on the production host over the operator SSH path
   configured for this machine. The host, account, and SSH options belong to the
   local promotion profile, never to this repository.
5. Ask first only when development could not prove the change — node-only
   behavior that was never exercised through the hub, anything that migrates or
   deletes stored state, inconclusive verification, or a rollout that
   `rollback` cannot undo (`.github/copilot-instructions.md`).
6. Verify production: runtime health, hub connectivity, and the affected
   behavior. Both roles answer `/health`; only a hub answers `/api/health`, and
   only `/api/` URLs are Host-allowlisted. A node answers `404` on `/`, so check
   it through the hub's computer list.
7. `./bin/agentic-remote rollback` activates the previous release. If
   production verification fails, roll it back rather than leaving the hosts
   diverged.

The service runs from `~/.config/agentic-remote/releases/current`, not from the
working tree, so uncommitted edits are never live.

## Investigating gaps

Do not treat an older issue, graph, or skill note as proof a bug still exists.
Check graph freshness, inspect the current implementation, and reproduce the
behavior. For a session that appears idle while running, trace the event-log
status derivation and live transcript watermarks described above; the graph
locates the code but does not report the live state.

Issue #260 tracks timing-sensitive tmux fixtures. Serialize real-tmux runs,
scope discovery to fixture-owned processes, and investigate failures rather
than repeatedly rerunning the promotion gate until it passes.
`createIsolatedTmuxRoot()` (tmux 3.4+) starts a fixture-owned server that stays
up with no sessions, so teardown retires that exact process instead of proving
absence host-wide, which any tmux in another mount namespace leaves
indeterminate.
