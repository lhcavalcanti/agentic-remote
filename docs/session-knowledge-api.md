# Session Knowledge base API

Agentic Remote can associate one durable Knowledge folder with a session without
changing the session working directory. The folder is read through the existing
Knowledge browser; setting it does not start an agent, send a prompt, copy files,
or mount another filesystem.

## Route

The hub owns the association:

```text
GET /api/computers/:computerId/sessions/:sessionId/knowledge-root
PUT /api/computers/:computerId/sessions/:sessionId/knowledge-root
```

The hub is a trusted-administrator control plane with no built-in user login.
These routes inherit the `/api/` Host and Origin policy and MUST remain behind
the deployment's authenticated reverse proxy or private encrypted network.
When the session belongs to a paired computer, the hub performs filesystem
validation through that node's pairing-token-authenticated API.

## Read

```http
GET /api/computers/development/sessions/01234567-89ab-cdef-0123-456789abcdef/knowledge-root
```

```json
{
  "binding": {
    "computerId": "development",
    "sessionId": "01234567-89ab-cdef-0123-456789abcdef",
    "rootId": "fba3b42c-f809-49b2-94d7-38a9cab5ff60",
    "rootPath": ".",
    "knowledgeBasePath": "/home/user/src/project/knowledge",
    "revision": 1,
    "root": {
      "id": "fba3b42c-f809-49b2-94d7-38a9cab5ff60",
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

`knowledgeBasePath` is the canonical absolute path on the root's owning
computer. An unlinked session returns `null`. A removed shared root retains its
last path and metadata with `available: false`.

Older hubs omit `knowledgeBasePath`; clients that support version skew can
derive it from `root.path` and `rootPath`.

## Create or select a dedicated session folder

Path mode accepts a relative path under the session's unchanged `cwd`:

```http
PUT /api/computers/development/sessions/01234567-89ab-cdef-0123-456789abcdef/knowledge-root
Content-Type: application/json

{
  "knowledgeBasePath": "knowledge",
  "create": true,
  "expectedRevision": 0
}
```

- `knowledgeBasePath` is required and relative. Absolute paths, `.`, `..`,
  hidden segments, sensitive names, symlinks, and escapes are refused.
- `create` defaults to `false`. `true` creates missing path segments with mode
  `0700` through verified directory handles, so replacing the session `cwd` or
  an earlier segment with a symbolic link cannot redirect creation.
- `expectedRevision` comes from the latest `GET`.
- The folder is created or validated on the session's owning computer and added
  to the existing shared Knowledge catalog.
- The owning computer supplies the canonical folder path and canonical session
  `cwd`; aliases and symbolic-link spellings are not persisted.
- Repeating the same current binding with its current revision is a no-op.

Path mode intentionally cannot choose another computer. Existing catalog-root
mode remains available for deliberate cross-computer Knowledge:

```json
{
  "rootId": "fba3b42c-f809-49b2-94d7-38a9cab5ff60",
  "rootPath": "team/project",
  "expectedRevision": 2
}
```

`rootId` and `knowledgeBasePath` are mutually exclusive.

## Clear

```json
{
  "rootId": null,
  "expectedRevision": 3
}
```

Clearing removes only the session association. It does not delete the shared
Knowledge root or any filesystem folder.

## Errors

| Status | Meaning |
| --- | --- |
| `400` | Malformed/mixed request, unsafe path syntax, invalid revision, unreadable path, or non-directory target. |
| `403` | Host/Origin refusal, traversal, hidden/sensitive path, symbolic link, or escape from the session working directory. |
| `404` | Computer, session, root, or non-created folder does not exist. |
| `409` | Stale revision, replaced session, changed pairing, or a paired node that cannot prove it enforced read confinement. Revision conflicts include the latest `binding`; incompatible nodes must be updated before confined roots can be read. |
| `503` | The owning computer cannot validate the path, or metadata persistence/recovery failed. A post-commit catalog-cleanup failure includes the committed `binding`; continue from that revision rather than retrying the stale request. |

Filesystem errors do not expose unsubmitted private paths. If directory creation
succeeds but metadata persistence fails, Agentic Remote leaves the directory in
place rather than risking deletion of user or concurrent data. A newly reserved
catalog entry is rolled back.
If the hub stops between cataloging and binding, startup recovery keeps the
root only when a durable path-mode session binding references its exact root ID
and claimed root path at the exact committed revision; otherwise the
provisional catalog entry or confinement is removed. Post-commit finalization
can promote only the reservation claim that performed that binding commit.

## Lifecycle

- Active, suspended, and historical/closed sessions can be read or updated
  without being opened or resumed.
- A path update needs the owning computer online so it can validate the
  filesystem. The persisted association remains readable while that computer is
  offline.
- Hub/browser restarts reload the same association.
- Conversation clear/replacement carries the association through the existing
  session lineage unless the replacement already has an explicit association.
- Removing a shared root leaves a named unavailable association.
- Deleting a session removes its association, not the root or folder.
- Removing or re-pairing a computer retires stale path responses and follows
  the existing root/binding cleanup rules.

## Security boundary

Automated path mode is deliberately narrower than manual shared-root creation:
it can select only a dedicated folder beneath the session `cwd`. It rejects
hidden and common credential-bearing names, including `.env*`, `.ssh`, `.aws`,
`.gnupg`, credential/keychain/browser-profile folders, private-key filenames,
and PEM/P12/PFX containers. The owning computer walks existing components
without following symbolic links. Every later list and file read re-resolves
the saved root and verifies that it remains a non-symlinked descendant of the
original session `cwd`. Adding this confinement to an existing catalog root is
transactional: startup recovery keeps it only when the intended session
binding and revision were committed.
File previews also open the resolved file without following a replacement
symbolic link and verify that the opened file is the same regular file that was
validated before reading.

The API does not scan file contents for secrets. Do not put credentials,
provider state, private keys, environment files, or other sensitive material in
a Knowledge base. Knowledge remains read-only through Agentic Remote and
continues to omit hidden entries.

For paired computers, every confined list or file response must explicitly
acknowledge that the node applied confinement. The hub rejects responses from
older or rolled-back nodes that omit that acknowledgment rather than trusting
an unconstrained read. Root-ID associations also persist the canonical
owner-returned root path, so aliases cannot weaken later validation.

## Default `.copilot-instructions` text

Copy this into the default session instructions:

> When an Agentic Remote session starts producing reusable reference material,
> establish its Knowledge base once using the provided hub, computer ID, and
> session ID. GET
> `/api/computers/<computerId>/sessions/<sessionId>/knowledge-root`, then PUT
> the same route with
> `{"knowledgeBasePath":"knowledge","create":true,"expectedRevision":<binding.revision>}`.
> Use a dedicated non-hidden folder under the unchanged session cwd; never use
> `.env`, credential, key, provider-state, or other secret-bearing paths. After
> success, use the returned `binding.knowledgeBasePath` for durable Knowledge
> files and report `<computerId>/<sessionId> -> <knowledgeBasePath>`. If the hub
> or IDs are unavailable, report that instead of guessing.
