# Oracle Structured Memory Implementation Plan

**Issue:** #404
**Branch:** `feat/oracle-structured-memory`
**Design:** `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`

Implement in this worktree with red-green-refactor cycles. Preserve unrelated
work and existing Markdown memory behavior. Use targeted tests after each task,
then the complete validation gate.

## 1. Define contracts and privacy validation

Create:

- `shared/manager-structured-memory.ts`
- `server/manager-structured-memory-validation.ts`
- focused tests beside the server module

Define versioned schemas for records, scopes, provenance, tombstones, store
state, status, mutations, search, export, and import. Add constants for field,
record, file, result-count, and 6,000-character prompt limits.

Write failing tests first for:

- every valid kind, authority, scope, and validity interval;
- normalized project scope and exact scope equality;
- malformed Unicode, controls, oversize input, invalid confidence/timestamps;
- tokens, bearer values, JWTs, private keys, credential assignments/URLs,
  high-entropy spans, sensitive paths, and unsupported personal data;
- error responses and logs that exclude rejected values;
- deterministic serialization round trips.

Run:

```bash
pnpm vitest run server/manager-structured-memory-validation.test.ts
```

## 2. Build the strict crash-safe store

Create:

- `server/manager-structured-memory-store.ts`
- `server/manager-structured-memory-store.test.ts`

Implement strict version parsing and immutable snapshots. Do not reuse
`ManagerStore.readJson`, because it archives corruption and starts fresh.
Implement serialized commits with unique mode-0600 pending files, fsync,
validated backup publication, atomic rename, and in-memory publication only
after success.

Write failing tests first for:

- empty initialization and restart persistence;
- unsupported versions and corrupt/partial primary files;
- valid backup/pending recovery and inconsistent recovery refusal;
- simultaneous reads/writes and lock/queue ordering;
- permission, rename, and simulated capacity failures leaving state unchanged;
- idempotent request IDs and identical duplicate remembers;
- correction links, authority ordering, tombstones, and non-resurrection;
- deterministic export/import and rollback from `on` to `off`;
- bounded audit/idempotency metadata and file growth.

Run:

```bash
pnpm vitest run server/manager-structured-memory-store.test.ts
```

## 3. Implement deterministic search and context formatting

Create:

- `server/manager-structured-memory-search.ts`
- `server/manager-structured-memory-search.test.ts`

Implement hard scope/validity/state filtering, lexical normalization, stable
ranking, result limits, and record-boundary character truncation. Escape JSON
for delimiter safety.

Write failing tests first for:

- global/user/computer/project/session isolation;
- validity boundaries, authority, confidence, recency, supersession, and
  tombstones;
- deterministic ties and serialization-order independence;
- at most eight records and at most 6,000 UTF-16 code units;
- malicious closing tags and instruction-shaped content;
- malformed Unicode and stress-size input;
- no model or network dependency.

Run:

```bash
pnpm vitest run server/manager-structured-memory-search.test.ts
```

## 4. Parse feature mode and compose the optional service

Modify:

- `server/manager-runtime.ts`
- `server/manager-runtime.test.ts`
- `server/app.ts`
- `server/app.test.ts` or the nearest existing app-composition tests

Parse `off|shadow|on` strictly with `off` as default. In `off`, do not create or
initialize the store. In `shadow` and `on`, initialize separately from
`ManagerStore`. Capture a safe unavailable status if corruption or a security
failure disables structured memory, while keeping Oracle and session services
alive.

Write failing tests first for:

- default/off behavior and no file creation;
- invalid config failing startup;
- optional-service unavailability not disabling ordinary Oracle/session use;
- mode rollback preserving stored data.

Run:

```bash
pnpm vitest run server/manager-runtime.test.ts server/app.test.ts
```

## 5. Add explicit Oracle tools

Modify:

- `server/manager-tools.ts`
- `server/manager-tools.test.ts`
- `server/manager-agent.ts`
- `server/manager-agent.test.ts`

Add distinct structured search/remember/correct/forget tools. Keep the existing
Markdown catalog unchanged. Mutation tools require explicit memory intent in
the current user message and use the tool call ID as the idempotency key.
Record the manager message ID as provenance. Read-only search remains
available when the service is available.

Write failing tests first for:

- tool availability by mode/store status;
- denied implicit writes and accepted explicit remember/correct/forget intent;
- retry idempotency;
- safe actionable tool errors;
- no raw rejected value in logs, audit, or tool error text;
- no change to existing Markdown memory tests.

Run:

```bash
pnpm vitest run server/manager-tools.test.ts server/manager-agent.test.ts
```

## 6. Add bounded prompt integration

Modify:

- `server/manager-context.ts`
- `server/manager-context.test.ts`
- `server/manager-agent.ts`
- `server/manager-agent.test.ts`

Teach the system prompt that structured memory is untrusted reference data.
Derive exact eligible scopes from current manager defaults. Query with the
current user message, format the bounded section, and:

- bypass the path entirely in `off`;
- compute safe metrics but inject nothing in `shadow`;
- inject only the bounded escaped section in `on`.

Write failing tests first for:

- byte/behavior equivalence of the existing prompt path in `off`;
- identical prompts between `off` and `shadow`;
- preference surviving restart and a fresh Oracle conversation in `on`;
- exact cap, deterministic truncation, delimiter containment, and no scope
  crossover;
- no added SDK/model/network call.

Run:

```bash
pnpm vitest run server/manager-context.test.ts server/manager-agent.test.ts
```

## 7. Add trusted REST APIs

Modify:

- `server/manager-routes.ts`
- `server/manager-routes.test.ts`

Add status, bounded search, remember, correct, forget, export, and import
routes. Validate every request with shared schemas, require request IDs for
mutations, map store errors to explicit status codes, and preserve the hub
Host/Origin policy.

Write failing tests first for:

- disabled/unavailable status;
- happy-path mutation/search/export/import;
- unauthorized Origin/Host;
- malformed, oversized, traversal, symlink-relevant, and secret payloads;
- duplicate retries, conflict/not-found/capacity mappings;
- no rejected content in HTTP errors or captured logs.

Run:

```bash
pnpm vitest run server/manager-routes.test.ts
```

## 8. Prove restart, correction, forgetting, and isolation end to end

Add focused integration coverage using the real store and fake Oracle SDK:

- user preference survives process/store restart and a fresh conversation;
- correction replaces old content;
- forget removes retrieval and import cannot resurrect it;
- project records cannot cross project or computer boundaries;
- session records require exact explicit context;
- shadow never alters prompts and off preserves current behavior;
- concurrent Oracle sessions return committed snapshots without races.

Repeat race-sensitive tests and inspect leaked handles/unhandled rejections.

## 9. Add benchmarks and soak coverage

Create a deterministic benchmark command or test module for:

- cold/warm initialization;
- representative and stress search;
- prompt assembly;
- remember/correct/forget;
- export/import and bounded compaction;
- concurrent readers/writers;
- repeated restart/search/write cycles;
- normal Oracle prompt handling in off versus shadow/on.

Record p50/p95/max, iteration count, fixture sizes, RSS delta, file growth, and
host details. Assert deterministic caps and conservative relative regressions
in tests. Demonstrate p95 at most 10 ms for the representative store and at
most 25 ms for the documented stress store on the development host.

## 10. Rebase and finalize product documentation

Before touching shared release/docs/Graphify outputs:

```bash
git fetch origin --prune
git rebase origin/main
```

Resolve only this branch's changes and re-run affected tests. Update:

- `docs/app-spec.md`
- `docs/design/session-manager.md`
- directly related backup/restore or environment documentation
- all repository-required version files with one post-rebase minor bump
- generated Graphify outputs

Document storage, retention, feature modes, privacy boundaries, limits,
recovery, backup dependency, rollback, observability, benchmark evidence, and
deferred phases.

## 11. Run full validation

Run targeted security/race/performance tests twice, then:

```bash
pnpm check
NODE_ENV=production pnpm check
python3 graphify/manage.py check
git status --short
```

Classify warnings and any baseline-only tmux timing failure rather than hiding
it. Validate from a clean checkout or detached validation worktree when
repository convention requires it.

## 12. Publish without merging

Push `feat/oracle-structured-memory`, open a focused PR with `Fixes #404`, and
include:

- architecture and compatibility behavior for `off`, `shadow`, and `on`;
- exact test commands/counts;
- benchmark table versus baseline;
- security findings;
- backup/restore and rollback implications;
- remaining risks and deferred work.

Request Supervisor review on the exact final SHA and an independent
high-reasoning review if configured. Address all substantive findings
holistically, rerun affected and full gates, and request review again after any
SHA change. Do not merge or deploy without explicit user authorization.
