# Application review: code, gaps and open issues

Review date: September 9, 2026. Baseline:
`15a043e57234f7addfd8160f990dd22b38f1882a` (`main`, application `1.1.0`).
Tracking: #240.

Publication was synchronized to `46a4d04ab8af27effc6ade29d2fa5d72e45cb321`
(v1.1.1), which landed during the review as #243. Its runtime delta is responsive
Markdown-reader padding; the version and generated graph also changed.
The detailed audit and benchmark artifacts remain explicitly tied to `15a043e`.
No provider, persistence, transport or question-rendering code changed in that
late delta, so their findings remain applicable. The new #241 was also triaged.

This review documents the application; it does not implement the proposed
runtime fixes, change provider defaults, migrate stored state or authorize a
deployment. The [reference index](../../README.md) links the separate UI/UX,
functional and machine-setup specifications.

## Scope and evidence standard

The baseline inventory contains approximately 129,000 lines of tracked code,
styles, tests and maintenance programs. The refreshed Graphify snapshot extracts
202 code files into 3,244 nodes and 9,065 edges. Those are navigation/coverage
facts, not a claim that a graph proves runtime behavior.

| Area | Review boundary |
| --- | --- |
| Browser and PWA | `src/`, including nested components/features; `public/sw.js`; synthetic browser fixtures |
| Provider/session runtime | Copilot SDK, tmux, Claude, provider routing, admissions, queues, resources and background tasks |
| Persistence | Session checkpoints/deltas, identity retirement, event logs, Knowledge roots/associations, computer registry and push preferences |
| Hub/node transport | Routes, input schemas, owner forwarding, partial inventories, stale responses, reconnect and broadcasts |
| Files and audio | Session/root confinement, directory and preview limits, upload ownership, local/delegated transcription and cleanup |
| Operations and native client | Installer, promotion/setup/profile scripts, release/version policy, native shell, build/test and graph tooling |

Source tracing, current issue/PR reads, existing tests and bounded synthetic
experiments are separate forms of evidence. A source-backed limitation is not
automatically a reproduced incident. A proposed design is not an implemented
feature. This is not a line-by-line certification of every test or generated
asset, a penetration test, a device certification or a production load test.

Six product issues were open at the initial GitHub snapshot; #241 arrived during
the audit and is included below. #240 is
the new tracking issue for this review and is not counted as a pre-existing
product gap. Unmerged work must be assessed separately from this source commit.

## Open issues: still relevant, with narrower current descriptions

**All seven inspected product issues remain relevant. None should be closed
from this review.**
Relevance was checked against current source and counterexamples, not age.
Component/fake-provider observations are not live device or provider-network tests.

| Issue | Current disposition | Evidence and next action |
| --- | --- | --- |
| #165 | **Partial, with a high-impact residual loss path.** | Accepted queue re-edit loses compact-paste metadata in both mocked provider shapes. Legacy ambiguity no longer deletes payload on initial load, but normal accepted Send submits labels and removes the unresolved copy. Preserve both parts; narrow the issue's migration wording. |
| #169 | **Partially mitigated; keep open.** | File serialization, isolated socket roots and readiness polling exist. Global discovery and ownership/final-exit acceptance remain incomplete. One passing gate does not establish a current failure percentage or determinism. |
| #207 | **Current defect.** | Real service methods with in-memory failures rename SDK, native-window or Claude surfaces before local persistence. Successful and suspended counterexamples distinguish scope. Historical post-restart reappearance was not rerun on a live provider. |
| #224 | **Current request; presentation decision needed.** | SDK/tmux-shaped component updates request bottom following on tool insertion. Manual scroll-away already pauses it; current tools are not sticky. Keep chronology unless another presentation is approved. Pixel displacement was not measured. |
| #235 | **Missing on main; pending implementation is separate.** | Main has same-identity Restart, destructive Clear and delivery-token recovery, not fresh-context recovery retaining a read-only transcript/brief. The latest inspected #236 remained unmerged at `09bc06b260946c59e8d399783b79c7f54d194180`; it is not shipped evidence. |
| #239 | **Current request; bootstrap policy unresolved.** | Order is browser-local. Mocked Clear changes A,B,C to A,C,B-replacement while retaining draft/selection; a storage event does not update mounted order. Same-hub synchronization and conflicting legacy-order bootstrap remain proposals requiring a decision. |
| #241 | **New during the audit; current feature request.** | Both question-card branches interpolate `request.question` into an `h3` (`PromptCards.tsx:459,565`) rather than a Markdown renderer. Add safe Markdown presentation while retaining original request data, controls, reply/stale-state handling and phone overflow protection. No example operation should execute. |

#235 also needs precision: ordinary waiting SDK state is normalized on load,
and Copilot can reconstruct a question that resumes as a new user turn. Neither
preserves an old callback or implements fresh-context recovery.
For #239, do not copy GAP-01's mutation-before-write pattern into a new order store.

## Existing safeguards to preserve

| Implemented boundary | Evidence |
| --- | --- |
| Session mutation commit boundary | `SessionStore` prepares private candidates, closes a coalesced batch before serialization, and installs it after rename; rejected durable mutations are not replayed into the live view. This is distinct from GAP-01's auxiliary stores. |
| Stream/checkpoint separation | Live text has its own ordered change journal and detaches messages once per live view; later durable work does not become visible merely because a delta was published. |
| Knowledge association concurrency | `SessionKnowledgeStore` validates revisions, serializes candidates and uses guarded persistence/recovery; bindings and the root catalog are separate owners. |
| Remote snapshot authority | `ComputerManager` reconciles events received during a shared in-flight read, rejects obsolete client lifetimes and returns `answeredComputerIds`. The delay fixture confirmed deduplication rather than assuming it was missing. |
| Bounded file/media admission | Workspace reads enforce path/type/size checks; document uploads have a 25 MiB per-file limit and two hub-side admissions; transcription admits one job and reports busy/unavailable states explicitly. |
| Incremental event-log reads | The real append reader was measured at 100, 1,000 and 10,000 events; warm/append work did not repeat the cold full parse. |

These observations do not imply that every failure combination is covered.
They explain why the recommended fixes should extend existing owners rather
than replace them wholesale.

## New confirmed findings

### GAP-01: Failed auxiliary metadata writes still change live state

**Priority: high. Evidence: deterministic filesystem reproduction.**

[`KnowledgeStore.addRoot/removeRoot`](../../../server/knowledge-store.ts)
(baseline lines 45-99), [`ComputerRegistry.upsert/remove`](../../../server/computer-registry.ts)
(45-69), and [`PushNotificationService.setSessionMuted`](../../../server/push-notification-service.ts)
(145-160, 381-390) mutate their live state before awaiting persistence.

An atomic temporary-file rename protects the destination file from a partial
replacement; it does not roll back the object already installed in memory.
These auxiliary stores do not share `SessionStore`'s newer candidate/commit
boundary.

The reproduction creates a directory at each **synthetic** store's `.json.tmp`
path to make its next write fail with `EISDIR`:

| Store | Observed result after the rejected operation |
| --- | --- |
| Knowledge roots | The refused root is visible in memory. Repeating `addRoot` returns that root successfully without another write, even while storage is still blocked. Disk and a fresh store still have zero roots. |
| Computer registry | The refused computer is visible in memory. A later unrelated successful upsert persists both the new computer and the previously rejected one. |
| Push mute | The refused mute changes the live settings, but the persisted mute list remains empty. |

Impact: the UI/caller can receive an error while the application has already
changed behavior, or receive a later success for state that will disappear on
restart. A subsequent operation can unintentionally make rejected state durable.
The finding is about mutation atomicity, not disclosure of pairing credentials.

**Bounded fix:** prepare mutations against a private candidate, serialize
operations, persist the candidate, then publish it and emit effects. Preserve
last-committed reads on failure and make no-op/retry decisions against committed
state. Reuse the established persistence pattern rather than exposing mutable
objects or catching the exception as success. Computer disconnect/re-pair and
root-removal effects also need to follow the accepted lifecycle boundary.

```bash
node --import tsx docs/reviews/2026-09-09/reproduce-findings.mjs
```

[Program](reproduce-findings.mjs) and [recorded result](platform-gap-reproduction.json).
The program asserts the dated defects; a corrected implementation should make
those assertions fail. Future regression tests should instead assert unchanged
memory/disk after refusal, correct retries, restart behavior and concurrent
ordering. No live state or provider was used.

### GAP-02: Directory truncation is invisible and has no continuation

**Priority: medium. Evidence: real filesystem fixture and response inspection.**

[`listWorkspace`](../../../server/workspace-browser.ts), baseline lines 54-109,
returns at most 2,000 entries after reading the whole directory. The
[`WorkspaceListing`](../../../shared/contracts.ts) response contains entries and
parent/path, but no cursor or truncation indicator.

A directory containing 2,001 ordinary fixture files returned exactly 2,000 and
no indication of the omitted file. The initial enumeration is capped before
sorting; this is not a sorted first page with a navigable continuation.
The existing product specification documents a limit, so this is a product
completeness gap, not a claim that the current implementation violates a
promised pagination contract.

**Bounded fix:** add explicit truncation/continuation metadata and a usable
continuation flow through node, proxy, hub and browser. Bound filesystem
concurrency and preserve symlink/root checks. Do not merely raise the cap or
launch thousands of unconstrained `stat` calls.

The same fixture took roughly 540-549 ms to list. See the
[performance report](../../performance.md) for raw evidence and measurement
limits.

### GAP-03: A lost SDK command-enqueue receipt is classified as definitely unsent

**Priority: high. Evidence: in-memory fake-provider reproduction and serializer trace.**

In [`AgentService.dispatchCommand`](../../../server/agent-service.ts), baseline
lines 5520-5540, the `commands.enqueue` error path protects joined Clear by
marking possible admission effects, but does not retain delivery uncertainty.
`executeAdmittedCommand` and `submissionFailure` (5143-5180 and 3713-3732)
can therefore produce `uncertainDelivery: false`.

The fake SDK recorded one native queued command, then threw a lost-receipt
error. The returned classification was definite non-delivery. The equivalent
`commands.invoke` counterexample correctly reported uncertainty.
This review did not create a duplicate automatically or invoke an actual HTTP
request for this case; it demonstrated the false classification that can make
a subsequent user retry unsafe.

**Bounded fix:** preserve definite refusals such as an explicit `queued: false`,
but classify an unknown enqueue outcome as uncertain. Keep the existing Clear
admission protection and do not add automatic resend. Add local and paired-node
HTTP regression cases so the explicit uncertainty survives serialization.
See functional acceptance **FR-008**.

### GAP-04: Claude Restart rejects the error state it should recover

**Priority: medium. Evidence: real service method with an in-memory fixture.**

[`ClaudeAgentService.restartSerialized`](../../../server/claude-agent-service.ts),
baseline lines 833-855, uses `requireIdle` (2467-2487), which refuses `error`.
An error-state fixture returned `Session must be idle`, made zero provider
calls and remained in error. An idle-state counterexample restarted lazily.

This conflicts with app-spec section 3.3 and functional acceptance **FR-020**.
It does not mean that all Claude error sessions require Clear: a fresh ordinary
message may still be admitted.

**Bounded fix:** use a restart-specific idle-or-error precondition while retaining
active-query, pending-action, dispatch, suspension and lifecycle guards. Do not
weaken `requireIdle` globally for destructive operations. Preserve identity,
history, settings and queue without eagerly starting a new query.

The provider findings and #207 have a portable, fake-only
[reproduction program](reproduce-provider-findings.mts) and
[recorded nine-case result](provider-gap-reproduction.json):

```bash
TSX_DISABLE_CACHE=1 node --import tsx \
  docs/reviews/2026-09-09/reproduce-provider-findings.mts
```

Its in-memory store refusals are distinct from GAP-01's actual filesystem
refusals. It includes successful/suspended/invoke/idle counterexamples and
intentionally asserts the dated defects rather than desirable future behavior.

## Additional UI findings

### UI-165-LEGACY: Retained ambiguous paste payload is lost on accepted Send

**Priority: high; part of existing #165, not a duplicate implementation ticket.**

`resolveComposerPastes` (`src/App.tsx:736-788`) correctly refuses to guess which
of two identical labels owns a legacy payload, retaining `unresolvedPastes`.
The component reproduction confirms both that metadata and its compatibility
copy survive loading. However, ordinary `submitMessage` (11220-11244) sends the
display labels and removes the unresolved copy after acceptance; there is no
user-facing recovery choice for that material.

The 21-line synthetic payload was absent from the accepted request and from
both saved recovery locations afterwards. This is distinct from the ordinary
queue issue, where expanded text survives but its compact presentation does not.
**Fix scope:** retain unresolved material through submission/reload and offer
an explicit recover/insert/discard decision; do not silently guess ownership.

The [UI reproduction suite](reproduce-ui-findings.tsx) has a dedicated
[configuration](ui-reproduction.config.mts):

```bash
pnpm exec vitest run --no-cache \
  --config docs/reviews/2026-09-09/ui-reproduction.config.mts
```

Its filename intentionally does not match the normal test-discovery pattern:
these cases assert dated defects and must not make a future fix fail the
ordinary application gate.

### Accessibility and empty-state follow-ups

| Finding | Evidence and proposed scope |
| --- | --- |
| PDF text alternative missing / medium | `PdfViewer`, `src/App.tsx:4839-4923`, exposes a canvas and paging controls, not a text layer or equivalent accessible document content. Provide a nonvisual alternative without removing paging. Assistive technology was not exercised. |
| Question active option unannounced / medium | `PromptCards.tsx:95-119,220-244,315-374`; the component test highlights option two while focus stays on the listbox, with no active-descendant reference and the old committed selection still exposed. Add deliberate active-option semantics, not a visual redesign. |
| Generic error lacks announcement / low | `App.tsx:13420-13429`; a reproduced failed preference save shows a plain banner without alert/live semantics. Composer warnings already have such semantics. Announce actionable errors without announcing every streaming update. |
| Zero-match workspace search unclear / low | `App.tsx:5763-5789,5992-6057`; successful empty results map to no rows without dedicated no-match copy. Add outcome/retry guidance. This is source inspection, not a subjective visual usability result. |

## Source-confirmed operational gaps

These are source/contract findings, **not live rollout or native exploit
reproductions**. The [machine-setup reference](../../specs/machine-setup.md)
describes the current boundaries and OPS acceptance criteria.

| ID / priority | Gap and impact | Source and bounded correction |
| --- | --- | --- |
| OPS-F001 / high | The monitor's HTTP/service/pointer checks do not prove online computers, surviving sessions or the affected behavior before downstream promotion. | `bin/agentic-remote-promotion-monitor:387-431,1019-1031,1107-1140`. Add a machine-local behavioral/exception gate; a successful health request alone cannot satisfy the documented release gate. |
| OPS-F002 / high | Downstream previous heads are in-memory, restoration rebuilds old source, and restored health is not verified. Interruption can lose the per-host recovery baseline. | Same file, `158-197,527-619`. Journal each host before mutation, preserve original artifacts, verify restoration and retain incomplete recovery as a failure. |
| OPS-F003 / high, conditional | A profile accepts another service name, but setup still writes/restarts `agentic-remote.service`; verification may target a different service from the one mutated. | Monitor `29-40,312-354,389-415`; `bin/agentic-remote:7-10,99-139,429-435`. Reject unsupported service names before mutation until identity is consistently parameterized. |
| OPS-F004 / medium | A profile/exported data directory is ignored by setup unless already present in its generated environment file. | `bin/agentic-remote:358-367,405-414`; profile template `40-47`. Honor explicit supported configuration without silently relocating data; a real relocation still needs migration approval. |
| OPS-F005 / medium | Updating via setup drops unlisted provider/history/media overrides placed in the generated environment file. | `bin/agentic-remote:358-393,405-427`. Define supported key preservation or a separate private operator-owned override file, with explicit unset semantics and round-trip coverage. |
| OPS-F007 / medium | `test:e2e` invokes Playwright without a configured Playwright suite; current `e2e/*.test.ts` files are Vitest helpers, while browser captures are direct scripts. | `package.json:19-22`, `e2e/workspace-fixtures.test.ts:1-11`, `e2e/capture-workspace.ts:23-49`. Provide a scoped runnable suite or rename/document the actual commands; do not call mocked capture a live end-to-end gate. |
| OPS-F008 / medium | Native URL normalization does not explicitly reject all wildcard, credential-bearing or malformed authorities before capability construction. | `shell/src-tauri/src/config.rs:47-55,159-188`, `lib.rs:147-161,401-422`. Use parsed canonical HTTP(S) origins and pure validation tests. Unauthorized IPC was **not** demonstrated; platform consequences remain unverified. |
| OPS-F009 / medium | The former unqualified Node 22 minimum did not satisfy the locked validation dependencies; the root manifest has no engine preflight. | Locked `jsdom@30.0.1` requires `^22.22.2 || ^24.15.0 || >=26.0.0`. Prerequisite prose is corrected here; a compatible-baseline install/gate and explicit preflight remain future work. |

OPS-F006 is the existing #169 fixture-ownership issue, not a new duplicate.
The benchmark host's Node `22.22.1` remains accurately recorded in the raw
measurement evidence; successful execution on it does not prove support against
the locked dependency engine declarations.

## Performance and maintainability gaps

| Gap | Evidence | Recommended next slice |
| --- | --- | --- |
| Full-history read cost behind thin lists | Provider lists strip bodies after cloning. With 100 retained histories and only 10 open sessions, the 5,307-byte API response still copied 100,000 message entries and took about 99 ms in both final runs. | Project committed summaries before cloning/filtering. Do not claim the existing session-list response transports all histories. |
| Full-history events and slow consumers | Hub and node broadcasts encode full upserts and have no application buffer budget or transcript subscription. | Versioned deltas on both hops, explicit resync and bounded slow-consumer behavior; retain legacy compatibility. This is a static risk, not a reproduced OOM. |
| Whole-store checkpoint cost | A one-session durable rename took 157-171 ms across the large retained-history fixtures because persistence serializes the complete store. | Measure real checkpoint frequency; reduce copying/serialization without weakening acceptance durability. No database migration is justified yet. |
| Slow-node coupling | A synthetic node's added 600 ms delayed the combined hub list to 603 ms despite a usable local session. | Return usable local/known state independently of slow refresh while preserving `answeredComputerIds` and offline authority. |
| Search and preview scaling | Search bounds files/results/text bytes but not directories or a request-owned cancellation lifetime. Binary previews are base64 JSON. | Directory/time/cancellation budgets; consider authenticated binary transport after measuring browser decoding. |
| Large UI/runtime coordination owners | `App.tsx` is 14,414 lines and `agent-service.ts` 8,546 at this baseline. | Continue narrow responsibility extractions with unchanged behavior; line count alone is not a performance finding. |
| Frontend work per input | A JSDOM fixture with 20 other 2,000-character drafts counted three storage writes totaling 81,678 string characters for one input change. Initial 1,000-message history rendered 250 rows; Show earlier rendered all 1,000. | Preserve draft receipts/ownership while profiling serialization and incremental history expansion. These are work counts, not paint latency or storage bytes. |
| Evidence gaps | No field INP, physical iOS run, real provider throughput run, slow-WebSocket-client stress or power-loss recovery drill was performed here. | Add targeted evidence before capacity claims or default/storage/topology changes. |

Detailed measurements, existing optimizations that must survive, and proposed
PERF acceptance IDs live in [Performance investigation](../../performance.md).
The older [SDK roadmap](../../sdk-architecture-roadmap.md) is a useful sequencing
document, not a current issue-status list.

The late #243 change removes the fixed `72ch` reading-width centering and applies
`padding-inline: clamp(18px, 3%, 40px)` to Markdown previews while retaining
vertical padding. This is recorded as an upstream change, not a fix performed by
the audit, and does not turn the v1.1.0 measurements into new-version benchmarks.

## Documentation drift corrected by this change

The baseline `app-spec.md` section 15 required a new manual production decision
for every fix, while `.github/copilot-instructions.md` and
`deployment-promotion.md` required promotion after proven development, with
explicit exceptions. The specification now points to the current repository and
profile policy and repeats those exception gates. No profile, timer, service,
deployment authorization or running release was changed.

The maintained graph was also stale for the already-merged `App.tsx` and
`App.test.tsx` changes when this review began. It was regenerated locally before
tracing the current code. A stale graph or an older roadmap's issue list must
not be used as proof of present application behavior.

The new raw JSON evidence also exposed a tooling integration limit: Graphify
classified it as code but produced no source nodes, correctly refusing to
publish an incomplete graph. A small tested `inventory_only_patterns` option
now inventories review JSON without semantic extraction. The data stays tracked
and hashed, so edits still invalidate freshness; review programs and ordinary
manifests retain code extraction. This is maintenance tooling, not an application
runtime or storage-format change.

Peer review also caught an investigation-fixture error before publication:
the first fake provider returned raw `store.list()` results rather than the real
provider's message-stripping projection. Its 37.47 MB session-list response was
**not representative of the shipped list API**. The final performance evidence
uses the real public list method, checks exact open identities/empty message
arrays, includes closed histories and retains individual timing samples.
Raw store clones and constructed full upsert events remain separate
measurements. The older roadmap's corresponding list-payload
description was corrected too.

## Decisions that this review does not silently make

- Whether the first device, last device or an explicit choice seeds shared
  custom ordering from conflicting browser-local orders.
- Whether to reorder transcript narration around tools or keep chronology and
  improve the reading anchor.
- Whether SDK should replace tmux as the Copilot creation default.
- Whether to migrate JSON persistence to a different storage engine.
- Whether to move the hub, copy state across hosts, or change upstream access.

These choices have user-visible, compatibility or state-migration consequences.
The topic specifications identify current behavior and known gaps rather than
presenting an unapproved proposal as a completed feature.

## Validation and remaining proof

The core-baseline `pnpm check` passed on the isolated review checkout: **94 test files
passed, one skipped; 3,281 tests passed, one skipped**, followed by the production
build. The skipped file was `src/MermaidDiagram.real.test.tsx`. Existing
React/hooks lint warnings and the build's chunk-size warning remain.
See [machine-readable validation](validation.json).

After synchronizing to v1.1.1 and adding the Graphify data-inventory support,
the publication candidate passed **`NODE_ENV=production pnpm check`**:
**3,284 tests passed, one skipped**, across the same 94 passed/one skipped files,
followed by the production build. The three additional cases validate the
inventory selector and invalid configurations. The complete Graphify-focused
suite also passed independently (11 cases).

The first attempt waited up to 900 seconds for another session's real-tmux
validation and expired **before starting tests**. The completed gate began only
after that runner exited. The later gate validated the changed publication
candidate; it was not a retry of a failed application test run. There was no
retry-until-green loop, competing tmux gate, service restart or rollout.

Provider-specific fake cases, actual filesystem refusal experiments, repeated
performance measurements and browser-fixture evidence have their own scope.
None proves physical iPhone/iPad behavior, native signing/authentication, a
real-provider compatibility matrix, power-loss durability or production capacity.
Neither a passing gate nor a healthy HTTP endpoint alone closes those gaps.

The integration pass also reran all **11 UI audit cases** successfully. They
assert dated defects/counterexamples, not that those defects are fixed.
Chromium `151.0.7922.34` subsequently mounted the synthetic application at
**1440x900 and 390x844** with no horizontal document overflow. Missing NSPR/NSS
libraries were unpacked into the session, not installed system-wide; a short
private runtime directory resolved Chromium's singleton-socket path limit.
The frontend listener and runtime directory were closed/removed. A dev-server
public-asset import warning was observed; this pass did not establish a
production icon defect.

That browser smoke is not screenshot review, pixel scroll-anchor verification,
input latency, real-provider end-to-end testing or physical iOS acceptance.
