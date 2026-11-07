# Session Knowledge Base API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe path-first API that creates or selects a dedicated Knowledge folder under a session's unchanged working directory and durably associates it with that session.

**Architecture:** Extend the existing revision-checked session Knowledge binding route with a mutually exclusive `knowledgeBasePath` request mode. The owning session service validates or creates the directory, the hub adds or reuses the exact folder in the existing Knowledge catalog, and the existing binding store persists the association; no new metadata store or UI surface is introduced.

**Tech Stack:** TypeScript 7, Fastify 5, Zod 4, Node.js filesystem APIs, Vitest 5, React browser API client, Graphify.

**Spec:** `docs/superpowers/specs/2026-11-05-session-knowledge-api-design.md`

## Global Constraints

- The Knowledge base remains separate from `cwd`; no route may mutate the working directory or activate an agent.
- Path mode accepts only a dedicated non-hidden relative path beneath the session's canonical `cwd`.
- Existing `{ rootId, rootPath, expectedRevision }` clients and cross-computer roots remain compatible.
- Hub routes retain Host/Origin checks; remote filesystem work retains pairing-token authentication.
- No new runtime dependency or persistence file.
- No UI surface unless implementation proves the existing chooser cannot express the behavior.
- Do not deploy, restart, merge, alter ingress, or modify unrelated worktrees.
- Prepare release version `1.38.0` from current `1.37.2`.

---

### Task 1: Safe session-relative Knowledge directory

**Files:**
- Modify: `server/session-directory.ts`
- Modify: `server/session-directory.test.ts`

**Interfaces:**
- Consumes: `SessionDirectoryError`, `isWithin()`, persisted session `cwd`.
- Produces:

```ts
export async function ensureSessionKnowledgeBase(
  cwd: string,
  relativePath: string,
  create: boolean,
): Promise<string>
```

- [ ] **Step 1: Write failing normalization and creation tests**

Add focused cases that prove:

```ts
await expect(ensureSessionKnowledgeBase(cwd, 'knowledge', true))
  .resolves.toBe(path.join(cwd, 'knowledge'))
expect((await stat(path.join(cwd, 'knowledge'))).mode & 0o777).toBe(0o700)
await expect(ensureSessionKnowledgeBase(cwd, 'knowledge', true))
  .resolves.toBe(path.join(cwd, 'knowledge'))
```

Also cover an existing readable directory with `create: false`, a missing
directory with `create: false` returning `404`, and nested creation such as
`docs/knowledge`.

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
pnpm vitest run server/session-directory.test.ts -t "session Knowledge"
```

Expected: FAIL because `ensureSessionKnowledgeBase` is not exported.

- [ ] **Step 3: Write failing security tests**

Use table tests for `''`, `.`, absolute paths, drive-qualified paths, `..`,
hidden segments, `.env.production`, `credentials`, `keychains`, `id_ed25519`,
and `private.p12`. Add fixtures for:

```ts
await symlink(outside, path.join(cwd, 'linked'))
await expect(ensureSessionKnowledgeBase(cwd, 'linked/notes', true))
  .rejects.toMatchObject({ statusCode: 403 })
```

and a symlink resolving to a hidden or sensitive directory inside `cwd`.

- [ ] **Step 4: Implement minimal safe path walking**

Add private helpers with explicit responsibilities:

```ts
function normalizeSessionKnowledgePath(value: string): string[]
function assertSafeKnowledgeSegments(segments: readonly string[]): void
```

Resolve `cwd`, walk existing components with `lstat`, reject symbolic links,
create missing components one at a time with `mkdir(component, { mode: 0o700 })`,
then `realpath` the final directory, recheck containment and sensitive segments,
and require `R_OK | X_OK`. Use `SessionDirectoryError(message, status)` with
`403` for traversal/sensitive/symlink refusals and `404` for a missing
non-created directory.

- [ ] **Step 5: Run the focused tests**

Run:

```bash
pnpm vitest run server/session-directory.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add server/session-directory.ts server/session-directory.test.ts
git commit -m "feat: validate session Knowledge directories"
```

---

### Task 2: Owning-computer filesystem operation

**Files:**
- Modify: `server/session-service.ts`
- Modify: `server/agent-service.ts`
- Modify: `server/claude-agent-service.ts`
- Modify: `server/provider-session-service.ts`
- Modify: `server/node-routes.ts`
- Modify: `server/remote-node-client.ts`
- Modify: `server/computer-manager.ts`
- Modify: `server/multi-node.test.ts`
- Modify: `server/remote-node-client.test.ts`

**Interfaces:**
- Consumes: Task 1 `ensureSessionKnowledgeBase(cwd, relativePath, create)`.
- Produces on `SessionService`, `RemoteNodeClient`, and `ComputerManager`:

```ts
ensureSessionKnowledgeBase(
  sessionId: string,
  relativePath: string,
  create: boolean,
): Promise<string>
```

`ComputerManager` additionally accepts `computerId` before `sessionId`.

- [ ] **Step 1: Add failing service tests for passive metadata**

In the existing provider service tests, create active, suspended, and historical
session records and assert:

```ts
await service.ensureSessionKnowledgeBase(sessionId, 'knowledge', true)
expect(openSession).not.toHaveBeenCalled()
expect(activateSession).not.toHaveBeenCalled()
expect(store.get(sessionId)?.cwd).toBe(cwd)
```

The method must use committed session metadata and throw `404` for an unknown
session.

- [ ] **Step 2: Implement provider methods**

Add the interface method and implement it in both provider services by locating
the stored session without activation and calling Task 1. Delegate from
`ProviderSessionService` to the provider that owns the session using the same
ownership rules as workspace reads.

- [ ] **Step 3: Add failing authenticated node-route tests**

Extend `server/multi-node.test.ts` with:

```text
PUT /node-api/sessions/:sessionId/knowledge-base
{ "path": "knowledge", "create": true }
```

Assert `401` without the pairing bearer token, `200` with it, response
`{ path: canonical }`, malformed bodies return `400`, and the service receives
the exact session ID/path/create values.

- [ ] **Step 4: Implement node route and remote client**

Add a strict Zod body schema:

```ts
const sessionKnowledgeBaseSchema = z.object({
  path: z.string().trim().min(1).max(4096),
  create: z.boolean().optional().default(false),
}).strict()
```

Register the route under the existing authenticated node scope. Add the
corresponding `RemoteNodeClient` request and `ComputerManager` local/remote
dispatch.

- [ ] **Step 5: Add remote-client transport assertions**

In `server/remote-node-client.test.ts`, assert the encoded session path, `PUT`
method, authenticated request, JSON body, parsed canonical path, and explicit
propagation of node `403`, `404`, and `503` errors.

- [ ] **Step 6: Run focused transport tests**

Run:

```bash
pnpm vitest run server/session-directory.test.ts server/multi-node.test.ts server/remote-node-client.test.ts -t "Knowledge base"
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add server/session-service.ts server/agent-service.ts server/claude-agent-service.ts \
  server/provider-session-service.ts server/node-routes.ts server/remote-node-client.ts \
  server/computer-manager.ts server/multi-node.test.ts server/remote-node-client.test.ts
git commit -m "feat: route session Knowledge directory setup"
```

---

### Task 3: Explicit binding path and idempotent store updates

**Files:**
- Modify: `shared/contracts.ts`
- Modify: `server/session-knowledge-store.ts`
- Modify: `server/session-knowledge-store.test.ts`
- Modify: `shared/knowledge-path.ts`
- Modify: `shared/knowledge-path.test.ts`

**Interfaces:**
- Produces:

```ts
export interface SessionKnowledgeBinding {
  // existing fields
  knowledgeBasePath: string | null
}

export type UpdateSessionKnowledgeRootInput =
  | {
      rootId: string | null
      rootPath?: string
      expectedRevision: number
    }
  | {
      knowledgeBasePath: string
      create?: boolean
      expectedRevision: number
    }
```

- [ ] **Step 1: Add failing path projection tests**

Add a shared helper:

```ts
knowledgeAbsolutePath('/srv/notes', 'team/project') === '/srv/notes/team/project'
```

and store expectations that linked snapshots return canonical
`knowledgeBasePath`, unlinked snapshots return `null`, and unavailable retained
roots keep their last path.

- [ ] **Step 2: Add failing idempotency tests**

Prove that a stored binding updated to the same `rootId` and normalized
`rootPath` with the current revision returns the same revision, emits no event,
and performs no write. Preserve the existing test that an initial explicit
unlink advances revision `0` to `1`.

- [ ] **Step 3: Implement additive response projection**

Compute `knowledgeBasePath` from the retained root snapshot and normalized
`rootPath` in `SessionKnowledgeStore.snapshot()`. Do not persist the derived
field; update the strict persistence schema to strip or reject it as appropriate
so existing state files remain version `1`.

- [ ] **Step 4: Implement no-op current-state update**

Inside the serialized transaction, after revision validation and root
resolution, return the current snapshot without a write when `current.revision
> 0`, `rootId`, and normalized `rootPath` already match.

- [ ] **Step 5: Run focused store tests**

Run:

```bash
pnpm vitest run shared/knowledge-path.test.ts server/session-knowledge-store.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add shared/contracts.ts shared/knowledge-path.ts shared/knowledge-path.test.ts \
  server/session-knowledge-store.ts server/session-knowledge-store.test.ts
git commit -m "feat: expose session Knowledge base paths"
```

---

### Task 4: Atomic public path-first binding route

**Files:**
- Modify: `server/session-knowledge-routes.ts`
- Modify: `server/session-knowledge-routes.test.ts`
- Modify: `server/knowledge-store.ts`
- Modify: `server/knowledge-store.test.ts`

**Interfaces:**
- Consumes: Task 2 `ComputerManager.ensureSessionKnowledgeBase(...)`.
- Consumes: Task 3 request union and binding response.
- Preserves: existing `GET` and `PUT` route paths.

- [ ] **Step 1: Add failing request-shape tests**

Add route cases for:

```json
{"knowledgeBasePath":"knowledge","create":true,"expectedRevision":0}
```

and reject mixed `rootId` plus `knowledgeBasePath`, missing both modes,
unexpected `cwd`, absolute paths, and invalid `create` values with `400`.

- [ ] **Step 2: Add failing success and lifecycle tests**

Assert path mode:

- calls `ensureSessionKnowledgeBase` on the session's owning computer;
- reserves/reuses the returned canonical folder with that computer and basename;
- returns the binding with `knowledgeBasePath`;
- never calls `getSession`, `openSession`, or `activateSession`;
- works for active, suspended, and historical sessions;
- does not mutate `cwd`;
- reads the saved binding while the computer is offline;
- returns `503` for an offline path change.

- [ ] **Step 3: Add failing rollback and concurrency tests**

Hold catalog/binding writes to prove:

- a stale revision rolls back only a newly reserved catalog root;
- a reused root is never removed by another request's failure;
- two same-revision path updates produce one `200` and one `409`;
- the winner's binding is included in the conflict;
- retrying the same path with the current revision is a no-op;
- pairing or session replacement during filesystem/catalog work commits
  neither binding nor root.

- [ ] **Step 4: Implement strict request union**

Use a discriminated/refined Zod union that defaults `create` only in path mode.
Normalize the path on the owner, reserve the canonical catalog root, then call
`store.update()` with `{ rootId: reservation.root.id, rootPath: '.',
expectedRevision }`. The store validation callback owns session and registration
guards through its commit point. Finalize the reservation unconditionally after
the binding commits. On any binding failure call `reservation.rollback()` before
rethrowing.

- [ ] **Step 5: Preserve existing mode and conflict envelope**

Keep current root validation and nested-path checks unchanged. Continue sending:

```json
{"error":"...","binding":{"revision":2}}
```

for `SessionKnowledgeConflictError`.

- [ ] **Step 6: Run focused route/store tests**

Run:

```bash
pnpm vitest run server/knowledge-store.test.ts server/session-knowledge-store.test.ts \
  server/session-knowledge-routes.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add server/session-knowledge-routes.ts server/session-knowledge-routes.test.ts \
  server/knowledge-store.ts server/knowledge-store.test.ts
git commit -m "feat: set session Knowledge bases by path"
```

---

### Task 5: Browser API compatibility and public documentation

**Files:**
- Modify: `src/api.ts`
- Modify: `src/session-knowledge-api.test.ts`
- Modify: `docs/app-spec.md`
- Create: `docs/session-knowledge-api.md`

**Interfaces:**
- Consumes: Task 3 request union and additive binding field.
- Produces: final copy-paste `.copilot-instructions` text in
  `docs/session-knowledge-api.md`.

- [ ] **Step 1: Add failing browser API tests**

Assert `updateSessionKnowledgeRoot()` serializes path mode exactly:

```ts
{
  knowledgeBasePath: 'knowledge',
  create: true,
  expectedRevision: 0,
}
```

and parses `knowledgeBasePath` on success and on a `409` latest-binding
envelope. Existing root-ID tests must remain unchanged.

- [ ] **Step 2: Implement typed browser compatibility**

No new fetch helper is needed. Update types and any runtime checks so the
existing helper sends either request mode and returns the additive binding.

- [ ] **Step 3: Update normative behavior**

Add concise MUST language to `docs/app-spec.md` covering path mode, unchanged
`cwd`, owning-computer containment, sensitive/symlink refusals, passive closed
and suspended sessions, offline reads, and optimistic concurrency.

- [ ] **Step 4: Write the API document and final instruction**

Document request/response, route, trusted-admin auth, node ownership, status
codes, set/read/update/clear lifecycle, recovery/replacement, and security
limits. Only after the route tests pass, write the copy-paste instruction using
the exact implemented request fields and response properties. It must say when
to establish the folder, require the latest revision, choose a dedicated
non-hidden path under `cwd`, prohibit credential/environment/provider-state/key
folders, forbid changing `cwd`, and report the returned canonical path with its
computer/session association.

- [ ] **Step 5: Run client/docs-adjacent tests**

Run:

```bash
pnpm vitest run src/session-knowledge-api.test.ts \
  src/use-session-knowledge-root.test.tsx server/session-knowledge-routes.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/api.ts src/session-knowledge-api.test.ts docs/app-spec.md \
  docs/session-knowledge-api.md
git commit -m "docs: publish the session Knowledge API"
```

---

### Task 6: Release identity, graph, and full validation

**Files:**
- Modify: `package.json`
- Modify: `shell/package.json`
- Modify: `shell/src-tauri/tauri.conf.json`
- Modify: `shell/src-tauri/Cargo.toml`
- Modify: `shell/src-tauri/Cargo.lock`
- Modify: `shell/README.md`
- Modify generated: `graphify/graph.json`
- Modify generated: `graphify/graph.html`
- Modify generated: `graphify/GRAPH_REPORT.md`
- Modify generated: `graphify/communities.json`
- Modify generated: `graphify/metadata.json`

**Interfaces:**
- Consumes: all implementation tasks.
- Produces: release candidate `1.38.0`, current Graphify snapshot, validated PR head.

- [ ] **Step 1: Run all targeted feature tests**

Run:

```bash
pnpm vitest run server/session-directory.test.ts server/multi-node.test.ts \
  server/remote-node-client.test.ts server/knowledge-store.test.ts \
  server/session-knowledge-store.test.ts server/session-knowledge-routes.test.ts \
  shared/knowledge-path.test.ts src/session-knowledge-api.test.ts \
  src/use-session-knowledge-root.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Bump every shipped version**

Change `1.37.2` to `1.38.0` in the six versioned application/shell files listed
above. Do not modify dependency versions.

- [ ] **Step 3: Run version policy and normal gate**

Run:

```bash
pnpm vitest run server/version-policy.test.ts
pnpm check
```

Expected: PASS with no failed tests.

- [ ] **Step 4: Run production-environment gate**

Run:

```bash
NODE_ENV=production pnpm check
```

Expected: PASS with no failed tests.

- [ ] **Step 5: Refresh Graphify**

Stage any new source files, then run:

```bash
git add server src shared
python3 graphify/manage.py update
python3 graphify/manage.py check
git add graphify/graph.json graphify/graph.html graphify/GRAPH_REPORT.md \
  graphify/communities.json graphify/metadata.json
```

Expected: graph current.

- [ ] **Step 6: Commit release and graph**

```bash
git add package.json shell/package.json shell/src-tauri/tauri.conf.json \
  shell/src-tauri/Cargo.toml shell/src-tauri/Cargo.lock shell/README.md graphify
git commit -m "release: prepare session Knowledge API"
```

- [ ] **Step 7: Push and open the PR**

```bash
git push -u origin feat/session-knowledge-api
gh pr create --title "Add a safe path-first session Knowledge API" \
  --body-file <prepared-pr-body>
```

The body MUST include `Fixes #489`, exact API examples, security decisions,
validation results, no-UI rationale, unresolved ambiguity, and the final
instruction text.

- [ ] **Step 8: Run the exact-head gate**

Run:

```bash
bin/agentic-remote-gate <PR-number>
```

Expected: `agentic-remote/full-gate` success on the current head.

- [ ] **Step 9: Record exact branch and SHA**

Run:

```bash
git branch --show-current
git rev-parse HEAD
gh pr view <PR-number> --json number,url,headRefName,headRefOid,state
```

Report the exact values. Do not merge or deploy.
