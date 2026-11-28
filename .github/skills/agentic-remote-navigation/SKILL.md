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
| Reading sessions ahead | `src/session-prefetch.ts`, `src/use-session-prefetch.ts` |
| Shared request/response types | `shared/contracts.ts` |
| Copilot session lifecycle, transcript recovery | `server/agent-service.ts` |
| Claude Agent lifecycle | `server/claude-agent-service.ts` |
| Provider aggregation | `server/provider-session-service.ts` |
| Session persistence | `server/session-store.ts` |
| Shared Sessions list state: custom order, hidden, unread; categories in their own file | `server/session-order-store.ts`; `shared/session-categories.ts`, `server/session-category-store.ts`, `server/session-category-routes.ts`, `src/use-session-categories.ts`, `src/session-navigation-view.ts` |
| Recoverable close, Recently closed, 14-day expiry | `shared/closed-sessions.ts`, `server/closed-session-sweeper.ts`, `src/RecentlyClosed.tsx` |
| Side questions (`/ask`) | `src/SideQuestions.tsx`, `server/side-question.ts`, `AgentService.askSession` |
| Oracle (session manager agent; "manager" internally) | `src/ManagerAssistant.tsx` (panel, bubble, mode switch, resizer, queue editing), `src/voice-recorder.ts` (dictation), `src/OracleSettings.tsx` (model and folder-status parts placed in App settings groups), `src/use-oracle-settings.ts` (`useOracleSettings`); `server/manager-agent.ts` (runtime, queue, recovery, settings, session folders), `manager-tools.ts`, `manager-context.ts` (system prompt, including model routing: a named model stays on Copilot, otherwise `create_session` reads App settings → Models from the hub's settings profile), `manager-journal.ts`, `manager-store.ts`; `docs/design/session-manager.md` |
| Copilot event log reading | `server/event-log.ts` |
| tmux behavior | `server/terminal-session.ts` |
| Hub routes and origin policy | `server/hub-routes.ts` |
| Node routes (`/node-api`) | `server/node-routes.ts` |
| Hub to node routing | `server/computer-manager.ts`, `server/remote-node-client.ts` |
| Gzip of large JSON responses (both roles) | `server/response-compression.ts` |
| Built client files: precompression, cache headers | `server/static-files.ts`, `scripts/precompress-assets.ts` |
| Workspace listing, reading, search | `server/workspace-browser.ts` |
| Knowledge root metadata | `server/knowledge-store.ts` |
| Session cwd containment | `server/session-directory.ts` |
| Folder picker containment | `server/directory-browser.ts` |
| Audio transcription | `server/transcription-service.ts` |
| Transcription on another computer | `server/delegated-transcription-service.ts` |
| Live dictation (stream, word agreement, composer span) | `server/live-dictation-session.ts`, `server/dictation-agreement.ts`, `server/live-dictation-host.ts`, `server/dictation-routes.ts`, `shared/dictation.ts`, `src/dictation/`; `docs/design/live-dictation.md` |
| Push notifications | `server/push-notification-service.ts`, `public/sw.js` |
| Install and service management | `bin/agentic-remote` |
| Merge gate (full checks on an exact SHA) | `bin/agentic-remote-gate` |

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
externally reachable service before validation completes. After each host's
health check it runs the `canary` Vitest project in that host's checkout
(private `TMUX_TMPDIR`, fake Copilot; failure rolls that host back) and, after a
successful rollout, logs each hub's refusal counts. See
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
  Overlapping reads of one log wait for each other, so they share one parse.
- A tmux session's log is projected incrementally: `AgentService` keeps one
  `SessionEventProjection` per session (background tasks, transcript rows,
  pending question, status, runtime, folder) that takes in only appended
  events. Each read revalidates it by first event id, count, and the id at
  count-1, and anything else rebuilds it; `/tasks` and the transcript refresh
  share it, and it is forgotten with the session. Settle whatever depends on
  the end of the log in the snapshot step, never in projector state, and never
  hand out what a projector keeps: tasks are fresh copies, and transcript rows
  are frozen and reused only while unchanged. Route new fixtures through the
  `checked*` test helpers, which feed them in several chunkings and compare
  every prefix.
- `SessionStore.get` copies the whole transcript; `/tasks`, the poll, and
  provider routing use `has` or `inspect` instead. `get(id, { window })` and
  `readMessages` copy only the rows they return: the browser reads a window of
  each transcript (`shared/transcript-window.ts`) and pages earlier rows, and
  its event socket (`?patches=1&window=500`) is never sent a whole long
  session. Server-side readers still read whole transcripts.
- The browser reads ahead (`src/session-prefetch.ts`) the windows of the
  sidebar's top 8 sessions it holds no transcript for, one at a time while the
  page is idle and at most about 2 MB a pass. Keep those reads passive, so they
  resume nothing and mark nothing read, never send them to a node older than
  1.15.1 (it ignores `?passive=1` and opens the session), and never poll: the
  event socket keeps them fresh.
- The browser holds background-task summaries (`summarizeBackgroundTask`):
  lists come with `?summary=1`, its socket adds `&tasks=changes` and is sent
  only the tasks that changed, and an opened task is read whole through
  `…/tasks/:taskId`, which the owner answers from its tracker's last list
  without asking the runtime again. Sockets and requests that do not ask, and
  hub-side readers (Oracle, the scheduler), still get whole tasks.
- `SessionStore.persist` writes compact JSON and coalesces writes queued behind
  an in-flight write; the snapshot is taken when the write starts, so every
  caller's mutation is still durable when its promise resolves.
- Avoid adding work proportional to total history to the 750 ms transcript poll.
- Between polls, a 100 ms check reads only each terminal session's event-log
  size and time; a change is taken in at once, but no session more than once
  per 750 ms, so busy sessions cost no more than the poll alone.
- Process discovery places candidates in tmux from the parents in its single
  `ps` listing; do not reintroduce per-pane `/proc` ancestry walks.
- `server/response-compression.ts` gzips JSON of at least 64 KiB on zlib's
  thread pool for clients that accept it, on hub and node alike. Never
  compress on the event loop; a route whose JSON carries file contents opts
  out with `config: { compress: false }`.
- Built files are compressed once, by `vite build` (`scripts/precompress-assets.ts`:
  brotli 11, 5 above 4 MiB, and gzip 9 siblings), and `server/static-files.ts`
  serves the one a request accepts. Hashed `/assets/*` is `immutable` for a
  year and everything else `no-cache`, so only hashed output may land in
  `assets/` (`vite.config.ts` refuses a `public/assets`).
- The page reads its version and build ID from `index.html`'s
  `agentic-remote-version` and `agentic-remote-build` metas
  (`runningAppVersion` in `src/pwa.ts`). Never compile a per-build or
  per-release value into the bundle: the chunk holding it, and every chunk
  importing that one, would be renamed and downloaded again on each release.
  `server/app-build.test.ts` rebuilds the app to check that every name survives.
- A tmux session's `/commands` comes from its folder's catalog, read through
  one single-flight temporary SDK session per folder. It is fresh for 60 s,
  when a known tmux session skips process discovery, and is served for up to
  10 minutes while one background read refreshes it.
- Oracle's conversation rows are memoized and receive stable callbacks and
  Markdown components, so a keystroke or streamed word re-renders only changed
  rows. Do not pass inline callbacks or per-render objects to them.
- Knowledge and session-file Markdown go through `useMarkdownDocument`
  (`src/markdown-document/`): long documents are parsed in a per-document Web
  Worker, opening first, and drawn a part per frame, top-level parts each in a
  `div.document-chunk`. A long table, list, quote, paragraph, or fence is
  filled in place across parts (`draw.ts`). A component's element is drawn
  whole unless it is marked `drawnInParts`; such a component gets
  `drawing: true` until it is complete (a fence's copy waits on it). Keep
  `pipeline.ts` identical to
  react-markdown's processing (plugins, raw HTML as text, URL filter,
  `toJsxRuntime` options); its parity tests guard that. The worker bundle must
  not import DOM builds: `vite.config.ts` redirects the entity decoder, and
  only the Chromium spec `e2e/document-render.pw.ts` catches a regression.
  Chat, Oracle, and side answers keep ReactMarkdown.

## Validating a change

```bash
pnpm check                      # oxlint + vitest + tsc/vite build
pnpm vitest run server/x.test.ts -t "name"   # targeted
pnpm test:canary                # real-tmux send/readiness subset, ~1 min
pnpm test:fast                  # every file needing no host tmux/Copilot/Claude
pnpm test:quick                 # fast minus slowTests; the hosted check's tests
NODE_ENV=production pnpm check  # guards the inherited-env regression
bin/agentic-remote-gate <PR>    # merge gate: both checks + Chromium specs on the exact head
```

- Vitest projects `fast`, `canary`, and `tmux` partition the files, so
  `pnpm test` still runs each file once, serially. Add a new real-tmux file to
  `canaryTests` or `tmuxTests` in `vite.config.ts`; otherwise it lands in
  `fast`, which must pass without tmux, Copilot, or Claude.
- `tsconfig.e2e.json` type-checks `e2e/` with the DOM and the server its
  fixtures boot, so `tsc -b` catches fixture drift. The fixtures' own unit
  tests run in `fast`; Playwright specs (`*.pw.ts`,
  `e2e/oracle-conversation*.test.ts`) stay out of Vitest. The full gate runs
  their `chromium` project after both checks; hosted CI runs no browser.
- `.github/workflows/light-check.yml` is an advisory hosted check on ready pull
  request heads, on Node 22 (the `engines` floor): install, lint, `tsc -b`,
  `vite build`, and `pnpm test:quick`, sized to one billed minute (about
  1,200 minutes a month at roughly 1,200 runs). Never make it required; the
  local gate stays authoritative. A new
  `fast` file joins `test:quick` by default; add it to `slowTests` when it
  takes 0.1 s or more. Disable with `gh workflow disable light-check.yml`.
  See `docs/deployment-promotion.md`.
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

### Owned work follow-through

`.github/copilot-instructions.md` holds the canonical contract: terminal
states, live exact-head evidence, merge eligibility, recovery, and reporting.
Keep one concise evidence record per owned PR:

- PR number, full head SHA, and the `main` SHA observed;
- the Supervisor marker and verdict for that head;
- hosted checks and the `agentic-remote/full-gate` state for that head;
- GitHub mergeability and merge state; and
- the next action and its owner.

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
5. **Gate the exact final head.** Run `bin/agentic-remote-gate <PR>` once the
   head is final. It clones that SHA afresh, runs `pnpm check`,
   `NODE_ENV=production pnpm check`, and then Playwright's `chromium` specs
   serially under a host-wide lock (promotion
   validation takes it too, so a gate can queue behind one) inside a
   credentialless `bwrap` sandbox, with `bwrap` itself started from the
   scrubbed environment (it fails rather than run unsandboxed). The sandbox
   has no host network: install (`--ignore-scripts`) and `pnpm rebuild` reach
   only public HTTPS through the gate's filtering proxy, and the checks run
   offline. The clone's git directory stays read-only and outside the sandbox's
   one writable mount, `/tmp` is a fresh tmpfs per phase, and nothing inside
   that mount is ever a mount source or followed by the gate. It posts the `agentic-remote/full-gate` commit status; success needs passed
   and zero failed Vitest counts from both runs and passing Chromium specs. A
   new push needs a new gate.
6. **Merge only when the exact head is eligible** under Owned work
   follow-through in `.github/copilot-instructions.md`: Supervisor `APPROVE`,
   every required check, an `agentic-remote/full-gate` `success`, and clean
   mergeability. GitHub does not enforce this: `main` has no ruleset or
   branch protection.
   Follow the review loop below; delete the branch after graduation.
7. **Deploy and verify on development**, then follow the promotion policy in
   `.github/copilot-instructions.md` (see Rolling out).
8. **Close issues with evidence.** If a PR did not auto-close them, close each
   one with what changed, how it was verified, and any deliberate deviation
   from the issue's suggested fix. Record measurements where the issue was
   about performance.

### PR review loop

- Prefer small, single-purpose PRs. Split unrelated fixes into separate PRs.
- Apply the owned-work contract in `.github/copilot-instructions.md`. Do not
  request GitHub Copilot as a reviewer.
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
  prerequisites pass on the current exact head, merge promptly in dependency
  order without another user-approval loop. Merging does not authorize a
  production rollout.

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

Delete every session a test or verification creates as soon as its evidence is
recorded, on development and production hubs alike. **Close** keeps a session
reopenable under Recently closed for 14 days; only Delete permanently, the
`DELETE` route, removes it at once.

1. Record each test session's ID when it is created, and give it a disposable
   prompt that says it is a synthetic check.
2. Before deleting, verify that provenance: the expected title or prompt, the
   expected working folder, and no real user work in the transcript.
3. Delete it with `DELETE /api/computers/:computerId/sessions/:sessionId` on
   the owning hub, not `POST .../close`. Then confirm it has no tmux pane,
   Copilot process, or session-state directory under the owning runtime's
   Copilot home (`$COPILOT_HOME/session-state/<id>`, which defaults to
   `~/.copilot/session-state/<id>`).
4. A production hub can rediscover a development fixture or SDK smoke session
   from shared provider history. After any restart or discovery interval,
   check the open, history, and Recently closed (`GET /api/closed-sessions`)
   lists for the recorded IDs and delete any that reappear.
5. Delete stalled test probes created by other tooling, such as evaluation
   scenarios stuck on a trust prompt, only when their prompt proves they are
   disposable. Archive their transcripts first if their results may matter.

Never delete a session only because its title looks like a test, and never
close or delete user work.

## Rolling out

1. Deploy and validate on the **development hub** first.
2. `./bin/agentic-remote update` pulls the branch, installs, builds, publishes
   an immutable release, and restarts the service. `KillMode=process` keeps
   tmux sessions alive across the restart.
3. Verify development: service active, `/health` 200, computers still
   `online`, sessions preserved, and **the behavior the change was made for
   actually exercised**. That last part is what makes development "stable"; a
   green deploy alone does not.
4. **Stop before production until the user explicitly authorizes that live
   operation.** Merge authority and successful development validation do not
   grant deployment or restart authority. After authorization, run the same
   `update` on the production host over the operator SSH path configured for
   this machine. The host, account, and SSH options belong to the local
   promotion profile, never to this repository.
5. Before requesting or acting on production authorization, state whether
   development proved the behavior, whether the change touches node-only or
   stored-state behavior, and whether `agentic-remote rollback` can reverse it
   (`.github/copilot-instructions.md`).
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
absence host-wide, which any other tmux the scan cannot rule out (one starting
up, or in a mount namespace it may not inspect) leaves indeterminate. A
detached watchdog, armed before the server starts and told its identity over a
pipe, retires the namespace, panes included, when its creating
process ends without teardown (a throwing or timed-out `afterEach` skips the
rest of that test's hooks; a killed run skips all of them). It verifies the
server as teardown does; on any doubt it kills nothing and keeps the root, with
the reason in `abandoned-retirement-failed`.
