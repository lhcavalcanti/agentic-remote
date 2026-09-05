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
| How are builds promoted and cleaned up? | `docs/deployment-promotion.md` |
| Why is there a native shell, and how does it connect? | `docs/native-shell.md` |
| Rollout approval policy | `.github/copilot-instructions.md` |
| Host topology and deployment | The machine-local promotion profile and `docs/deployment-promotion.md` |

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
| Transcription on another computer | `server/delegated-transcription-service.ts` |
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
- Previewable types are Markdown, PDF, images (`.png .jpg .jpeg .gif .webp
  .svg`), and a text extension allowlist (`.csv .json .log .md .markdown .tsv
  .txt .yaml .yml`). Anything else is refused with `415`.
- Limits: 2 MiB text, 25 MiB PDF, 10 MiB image, 2000 directory entries; search
  is bounded and skips `node_modules`, `dist`, `build`, `coverage`.
- A refused path carries its reason: `400` for a path that is not allowed,
  `403` for one outside the root, `404` for one that is not there, `413` for
  one that is too large.
- **Knowledge is metadata only.** A `KnowledgeRoot` stores
  `(computerId, computerName, path, name)`; content never leaves the owning
  computer. A root is browsed through `/api/knowledge/roots/:rootId/entries`
  and read through `.../file`, both of which resolve on the owning computer.
- A root is independent of any session, and `validateKnowledgeRoot` allows any
  directory the user can read -- read-only browsing, unlike a session working
  directory, which stays confined because an agent executes there.
- Removing a computer removes the roots that named folders on it.

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

## Known gaps

- The tmux-backed integration tests are timing-sensitive and fail roughly one
  run in ten when the machine is busy (`active-sessions.test.ts`,
  `terminal-session.test.ts`, `agent-service.test.ts`). Because local
  validation is the whole promotion gate, re-run before concluding a change
  broke something.
- Markdown is rendered without heading anchors. The outline is matched to the
  document by position among the rendered headings, so anything that renders a
  heading has to be counted by `outlineFromMarkdown`.
- A session can appear `idle` while its agent is running; the tmux-backed
  status derivation described above is the place to investigate.
