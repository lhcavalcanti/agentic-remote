# Session Knowledge Base API Design

Date: 2026-11-05  
Issue: #489

## Decision

A session Knowledge base is a dedicated read-only Knowledge folder associated
with a stable session ID. It is not a working-directory change. Setting,
updating, or clearing it MUST NOT change `cwd`, start or resume an agent, send a
prompt, copy files, or mount a folder.

Agentic Remote already persists revision-checked session links to shared
Knowledge roots. This change extends that contract with a path-first operation
for automation. The operation safely creates or selects a dedicated folder
under the session's current working directory, adds or reuses that exact folder
in the existing Knowledge catalog, and links it to the session.

## Goals

- Let an API client establish a session Knowledge base with one request.
- Make the resulting canonical path explicit, durable, and retrievable.
- Preserve the existing shared-root and nested-root UI/API behavior.
- Constrain automated path selection to the session's own working directory.
- Reject traversal, hidden or sensitive paths, and symlink escapes.
- Work without activating active, suspended, or historical sessions.
- Preserve optimistic concurrency, replacement recovery, pairing ownership,
  offline reads, and deletion cleanup.

## Non-goals

- Changing the session working directory.
- Giving the Knowledge browser write access.
- Scanning arbitrary file contents for secrets.
- Exposing a paired node directly or giving an agent a pairing token.
- Replacing the existing Knowledge chooser or cross-computer root links.
- Automatically setting a folder for every session.

## Public API

The existing hub-only route remains authoritative:

```text
GET /api/computers/:computerId/sessions/:sessionId/knowledge-root
PUT /api/computers/:computerId/sessions/:sessionId/knowledge-root
```

### Read

`GET` returns:

```json
{
  "binding": {
    "computerId": "development",
    "sessionId": "01234567-89ab-cdef-0123-456789abcdef",
    "rootId": "root-uuid",
    "rootPath": ".",
    "knowledgeBasePath": "/home/user/src/project/knowledge",
    "revision": 1,
    "root": {
      "id": "root-uuid",
      "computerId": "development",
      "computerName": "Development",
      "path": "/home/user/src/project/knowledge",
      "name": "knowledge",
      "createdAt": "2026-11-05T00:00:00.000Z"
    },
    "available": true
  }
}
```

`knowledgeBasePath` is the canonical absolute path represented by
`root.path + rootPath`. It is `null` when the session is unlinked. It remains
visible from the retained root snapshot if a shared root is later removed, while
`available` becomes `false`.

### Path-first set or update

`PUT` accepts a mutually exclusive path mode:

```json
{
  "knowledgeBasePath": "knowledge",
  "create": true,
  "expectedRevision": 0
}
```

- `knowledgeBasePath` is a relative path under the session's unchanged `cwd`.
- `.` and an empty path are refused because this operation establishes a
  dedicated folder rather than aliasing the whole workspace.
- `create` defaults to `false`. When `true`, missing path segments are created
  with owner-only permissions.
- `expectedRevision` is the revision returned by the latest `GET`.
- The selected folder belongs to the session's owning computer. Existing
  `rootId` mode continues to support a Knowledge root on another computer.

The response is the same `{ "binding": ... }` shape as `GET`.

### Existing root set, nested update, and clear

The current request remains supported:

```json
{
  "rootId": "root-uuid",
  "rootPath": "team/project",
  "expectedRevision": 3
}
```

Clear remains explicit:

```json
{
  "rootId": null,
  "expectedRevision": 4
}
```

`rootId` and `knowledgeBasePath` MUST NOT appear in the same request.

### Idempotency and concurrency

- Saving the same resolved root and nested path at the current revision is a
  no-op and returns the existing binding without advancing its revision.
- A never-linked explicit clear still creates revision `1`, preserving the
  distinction between "never linked" and "deliberately cleared."
- Concurrent requests with the same expected revision serialize. One
  state-changing request commits; stale competitors receive `409` with the
  latest binding.
- Repeating a path request after reading the committed revision does not create
  another catalog root or another directory.

### Errors

| Status | Meaning |
| --- | --- |
| `400` | Malformed request, mixed request modes, absolute/empty/current-directory path, invalid revision, unreadable path, or a non-directory target. |
| `403` | Traversal, hidden or sensitive path, symlink component, symlink escape, or resolved path outside the session working directory. |
| `404` | Computer, session, catalog root, or non-created folder does not exist. |
| `409` | Stale revision, replaced session, or changed computer pairing. A revision conflict includes the latest `binding`. |
| `503` | The owning computer cannot validate the path, or durable metadata cannot be saved or recovered. |

Server errors MUST NOT expose raw filesystem paths beyond paths already
submitted or returned as accepted binding metadata.

## Authentication and ownership

The route inherits Agentic Remote's trusted-administrator boundary:

- The hub has no built-in user login. Every deployment MUST keep the hub behind
  its authenticated reverse proxy or private encrypted network.
- Every `/api/*` request remains subject to the hub Host and Origin policy.
- A remote path operation travels over the existing authenticated paired-node
  API. The client never receives or supplies the pairing token.
- The hub verifies the current computer registration and the session's passive
  active/history metadata before accepting the operation.
- Path mode always targets the session's owning computer and working directory.
  It cannot name another computer or an arbitrary absolute root.

## Path validation and creation

The owning computer performs the filesystem operation because only it can
authoritatively resolve the session working directory and symlinks.

1. Normalize separators and require a non-empty relative path.
2. Reject `.`, `..`, absolute paths, drive-qualified paths, empty segments,
   hidden segments, and sensitive names such as `.ssh`, `.aws`, `.gnupg`,
   `.env*`, `credentials`, `keychain`, browser profiles, private-key filenames,
   and certificate/key containers.
3. Resolve the persisted session `cwd` without changing it.
4. Walk existing path components with `lstat`; reject every symbolic-link
   component before creating descendants.
5. If `create` is true, create missing components one at a time with mode
   `0700`. If false, a missing target is `404`.
6. Resolve the final directory and require it to remain under the canonical
   session `cwd`.
7. Recheck the resolved relative segments for hidden or sensitive names and
   require read and execute access.

The API does not inspect file contents. Knowledge listing and search continue
to omit hidden entries, and all later reads remain confined by the existing
workspace browser's realpath checks. A user can still deliberately place a
secret in a visible file under an accepted folder; documentation MUST tell
agents never to use credential, environment, provider-state, or private-key
folders as Knowledge bases.

If folder creation succeeds but later metadata persistence fails, the folder is
left in place. The server MUST NOT recursively delete a path that may already
contain user or concurrent process data. A newly reserved catalog root is
rolled back when the binding does not commit.

## Internal operation

The hub calls a new session-scoped service operation:

```ts
ensureSessionKnowledgeBase(
  sessionId: string,
  relativePath: string,
  create: boolean,
): Promise<string>
```

Local sessions call the in-process provider aggregation service. Remote sessions
use:

```text
PUT /node-api/sessions/:sessionId/knowledge-base
```

with `{ "path": "knowledge", "create": true }`. The node route retains pairing
token authentication and returns `{ "path": "<canonical absolute path>" }`.
The operation reads stored session metadata and MUST NOT call `openSession`,
`activateSession`, or provider startup.

The hub then:

1. captures the session/computer generation;
2. resolves or creates the directory on the owning computer;
3. reserves the exact canonical folder in `KnowledgeStore`;
4. revision-checks and persists the existing `SessionKnowledgeStore` binding;
5. finalizes the catalog reservation after the guarded binding commit;
6. rolls back a newly reserved catalog root if the binding fails.

The binding store's existing validation callback owns the registration and
session-generation checks through its commit point. Finalization is
unconditional after that commit; attempting a second guarded commit boundary
could otherwise remove a root that the durable binding already references.

Confined roots and their confinement metadata persist in a new hub file,
`knowledge-confined.json`, which earlier releases never read, so a rollback
hides a confined root instead of serving it unconfined. `knowledge.json` keeps
only unconfined roots in the format those releases read;
`session-knowledge.json` and `session-knowledge-paths.json` are unchanged.
Startup migrates confinement metadata that pre-release builds of this API kept
in `knowledge.json`, moving those roots into the confined file.

## Lifecycle

- **Set/read/update/clear:** handled by the existing binding route and revision.
- **Resume/restart:** no special action; hub metadata reloads independently of
  provider runtime recovery.
- **Conversation clear/replacement:** existing replacement lineage carries the
  binding and canonical path to the replacement unless it has an explicit link.
- **Suspended session:** read and update are allowed without resuming it.
- **Closed/historical session:** read and update are allowed while passive
  history authoritatively identifies it and the folder remains reachable.
- **Offline owner:** persisted reads remain available. A path change returns
  `503` because the owner cannot validate or create the directory.
- **Root removal:** the session retains its path snapshot with
  `available: false`.
- **Session deletion:** removes only the binding, never the Knowledge root or
  filesystem folder.
- **Computer removal/re-pair:** existing generation guards retire stale
  responses and remove roots/bindings owned by the removed registration.

## UI

No UI change is planned. The current Knowledge chooser already lets a person
select, browse, save, update, and clear session roots with conflict handling.
The new path-first mode serves API and agent automation without duplicating
that surface or changing its interaction model. The browser API types will
accept and expose the additive contract for completeness.

## Documentation

Update the application specification and add a focused API document containing:

- request and response examples;
- trusted-admin authentication and computer/session ownership;
- error table;
- lifecycle behavior;
- security decisions and limits;
- a concise copy-paste `.copilot-instructions` block written against the final
  validated API.

The final instruction MUST tell an agent to establish the Knowledge base once
when meaningful durable reference material is first produced, use a dedicated
non-hidden folder under `cwd`, avoid secrets and provider state, read the
current revision before writing, and report the canonical path plus
computer/session association.

## Validation

Focused tests cover:

- relative-path normalization and refusal cases;
- safe creation, permissions, idempotency, and missing-folder behavior;
- traversal, hidden/sensitive names, symlink components, and escape targets;
- local and paired-node authorization/routing;
- active, suspended, and historical sessions without activation;
- computer/session ownership and pairing replacement;
- catalog reuse/reservation rollback;
- persistence/reload/recovery and replacement lineage;
- no-op updates, stale revisions, and concurrent path updates;
- clear and unavailable-root responses with `knowledgeBasePath`;
- browser client request/response compatibility.

Required gates:

```bash
pnpm check
NODE_ENV=production pnpm check
```

After the final PR head is pushed, run:

```bash
bin/agentic-remote-gate <PR>
```

This task does not deploy, restart, merge, alter ingress, or modify unrelated
worktrees.
