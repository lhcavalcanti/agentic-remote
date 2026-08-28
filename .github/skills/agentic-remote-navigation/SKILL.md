---
name: agentic-remote-navigation
description: Use when working on the Agentic Remote application itself — locating UI or server behavior, understanding the hub/node and session model, changing Knowledge or workspace browsing, or validating and rolling out a change.
---

# Agentic Remote navigation

Use this skill to find the right code, understand a behavior contract, and
validate a change in the Agentic Remote application repository.

Agentic Remote is a mobile-first PWA for supervising GitHub Copilot and Claude
Agent sessions across trusted computers. `docs/app-spec.md` is the normative
product specification and wins over this skill whenever the two disagree.

## Authoritative documents

| Question | Read |
|---|---|
| What must the product do? | `docs/app-spec.md` (MUST/SHOULD/MAY language) |
| How do hub and node relate? | `docs/architecture.md` |
| What differs between providers? | `docs/provider-compatibility.md` |
| How is it installed and secured? | `README.md` |
| Rollout approval policy | `.github/copilot-instructions.md` |
| Host topology and deployment | `homelab-development-navigation` skill |

## Where behavior lives

The frontend is one large component file; use these anchors instead of reading
it end to end.

| Concern | Location |
|---|---|
| Entire UI, all dialogs, all state | `src/App.tsx` (~5000 lines) |
| Styling, safe areas, mobile breakpoints | `src/index.css` |
| Browser API client | `src/api.ts` |
| Shared request/response types | `shared/contracts.ts` |
| Copilot session lifecycle, transcript recovery | `server/agent-service.ts` |
| Claude Agent lifecycle | `server/claude-agent-service.ts` |
| Provider aggregation | `server/provider-session-service.ts` |
| Session persistence | `server/session-store.ts` |
| Copilot event log reading | `server/event-log.ts` |
| tmux behavior | `server/terminal-session.ts` |
| Hub routes and origin policy | `server/hub-routes.ts` |
| Node routes (`/node-api`) | `server/node-routes.ts` |
| Hub to node routing | `server/computer-manager.ts`, `server/remote-node-client.ts` |
| Workspace listing, reading, search | `server/workspace-browser.ts` |
| Knowledge bookmark persistence | `server/knowledge-store.ts` |
| Session cwd containment | `server/session-directory.ts` |
| Folder picker containment | `server/directory-browser.ts` |
| Audio transcription | `server/transcription-service.ts` |
| Push notifications | `server/push-notification-service.ts`, `public/sw.js` |
| Install and service management | `bin/agentic-remote` |

Useful `src/App.tsx` landmarks: `WorkspaceDialog`, `KnowledgeDialog`,
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
- Previewable types are Markdown, PDF, and a text extension allowlist
  (`.csv .json .log .md .markdown .tsv .txt .yaml .yml`). **Images are not
  previewable**, so images embedded in Markdown do not resolve today.
- Limits: 2 MiB text, 25 MiB PDF, 2000 directory entries; search is bounded and
  skips `node_modules`, `dist`, `build`, `coverage`.
- **Knowledge is metadata only.** A `KnowledgeBookmark` stores
  `(computerId, sessionId, path, kind, name)`; content never leaves the owning
  computer. Because every bookmark is tied to a session, a bookmark breaks when
  its session is deleted, and there is no session-independent knowledge root.
- Opening a bookmark selects its session and reopens the session-scoped
  workspace dialog; Knowledge itself has no tree, search, or sorting.

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
- Uploads, transcripts, and audio stay on the owning computer.

## Performance invariants

- `readSessionEvents` parses only appended bytes and caches the parsed prefix
  per session, invalidating on shrink, in-place rewrite, inode change, or a
  changed head sample. Preserve that invalidation set when editing it.
- `SessionStore.persist` writes compact JSON and coalesces writes queued behind
  an in-flight write; the snapshot is taken when the write starts, so every
  caller's mutation is still durable when its promise resolves.
- Avoid adding work proportional to total history to the 750 ms transcript poll.

## Validating a change

```bash
pnpm check                      # oxlint + vitest + tsc/vite build
pnpm vitest run server/x.test.ts -t "name"   # targeted
NODE_ENV=production pnpm check  # guards the inherited-env regression
```

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
5. **Merge the PR**, then delete the branch.
6. **Deploy and verify on development**, then ask before production
   (see Rolling out).
7. **Close issues with evidence.** If a PR did not auto-close them, close each
   one with what changed, how it was verified, and any deliberate deviation
   from the issue's suggested fix. Record measurements where the issue was
   about performance.

Notes:

- Another agent session may be editing this checkout. Stage only your own
  paths, and prefer `git worktree add` for branch work so the shared working
  tree is left untouched.
- The service runs from a published release, so merging alone changes nothing
  on either host until a rollout.

## Rolling out

1. Deploy and validate on the **development hub** first.
2. `./bin/agentic-remote update` pulls the branch, installs, builds, publishes
   an immutable release, and restarts the service. `KillMode=process` keeps
   tmux sessions alive across the restart.
3. Verify: service active, `/api/health` 200 for the hub, computers still
   `online`, sessions preserved.
4. **Ask the user explicitly before updating production.** Approval for
   development never implies approval for production
   (`.github/copilot-instructions.md`).
5. Update production over the approved operator SSH path, then verify node
   health, hub connectivity, and the behavior the change affected. A node
   answers `404` on `/`; check it through the hub's computer list instead.
6. `./bin/agentic-remote rollback` activates the previous release.

The service runs from `~/.config/agentic-remote/releases/current`, not from the
working tree, so uncommitted edits are never live.

## Known gaps

- Invalid workspace or session paths surface as an opaque `500` rather than a
  `4xx` with the reason, so the UI cannot explain a refused folder.
- Knowledge cannot define a computer-plus-root knowledge base independent of
  sessions, and has no integrated Markdown reading experience. Planned in
  issue #11 (PRD), with the near-term panel navigation work in issue #12.
- Markdown is rendered without heading anchors, relative-image resolution, or
  intra-document navigation. Images are not previewable at all, so an embedded
  `![](./x.png)` cannot resolve.
- A session can appear `idle` while its agent is running; the tmux-backed
  status derivation described above is the place to investigate.
