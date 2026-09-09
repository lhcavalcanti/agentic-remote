# Performance investigation and improvement plan

Reviewed September 9, 2026. Source: `15a043e57234f7addfd8160f990dd22b38f1882a`,
application `1.1.0`. Tracking: #240. This is a measured baseline and a proposal,
not a shipped optimization, load-test certification or production SLO.

## Main conclusion

**Project summaries before cloning histories, then reduce full-session events.**
The normal session-list API already omits message bodies. However, the provider
strips them **after** `SessionStore.list()` clones every retained history.
With 100 retained sessions, only 10 open, and 1,000 messages per session, a
**5,307-byte** list response still copied **100,000 message entries** and took
**98.76 ms** median in-process. A new process repeated it at **99.21 ms**.
With only 10 retained sessions and 100 messages each, it took **1.09 ms**.

The event log already parses appended bytes incrementally, the store already
coalesces durable writes, and PDF/Mermaid already have separate build chunks.
Removing these existing safeguards or merely splitting source files would not
address the measured history-processing problem. Full-session upsert events
are a separate transport concern: the constructed 1,000-message event was
374,914 bytes before any transport compression.

**Measurement correction:** an earlier draft used a fake service that returned
raw store details instead of the real provider projection. Its 37.47 MB list
response and associated API timings were invalid for the shipped list path.
Both linked result files have been regenerated with
`real-AgentService-summary-projection-v3`; none of those earlier API numbers
is used as current evidence here.

## Evidence and reproduction

| Artifact | Contents |
| --- | --- |
| [Primary measurement](reviews/2026-09-09/performance-baseline.json) | Raw operation timings, clone counts, sizes, RSS and event-loop observations |
| [Independent repeat](reviews/2026-09-09/performance-repeat.json) | Same workloads in a new process; no code change between runs |
| [Measurement program](reviews/2026-09-09/measure-performance.mjs) | Real unstarted `AgentService` list projection, synthetic stores, real hub handlers, event logs and files |
| [Node-delay measurement](reviews/2026-09-09/node-delay-baseline.json) | Real hub/proxy with one authenticated synthetic loopback node |
| [Node-delay program](reviews/2026-09-09/measure-node-delay.mjs) | Controlled 600 ms node latency and overlapping-read coalescing |

From a checkout with the lockfile's dependencies installed:

```bash
pnpm build
node --test docs/reviews/2026-09-09/check-measurement-provenance.mjs
node --import tsx --expose-gc \
  docs/reviews/2026-09-09/measure-performance.mjs --smoke
timeout 120s node --import tsx --expose-gc --max-old-space-size=768 \
  docs/reviews/2026-09-09/measure-performance.mjs > /tmp/ar-performance.json
timeout 30s node --import tsx \
  docs/reviews/2026-09-09/measure-node-delay.mjs > /tmp/ar-node-delay.json
```

The smoke checks assert raw histories remain intact, real provider list/history
projections contain empty message arrays, and the API returns exactly the open
identities. It covers all-open and partly-closed cases without timed samples.

The programs create and remove their own synthetic directories. They do not read
provider history, contact a provider, register a real computer, invoke tmux,
restart a service or use production ports. The node-delay program verifies a
temporary listener on an OS-assigned loopback port and closes it afterwards.
Use a new output filename when preserving earlier results.

New measurement runs record the relevant tracked and untracked source-file
hashes, the checkout HEAD, and dirty status before importing application code.
`sourceCommit` is null when those measured inputs differ from HEAD; use the
recorded snapshot hash instead of attributing that run to a clean commit.
The program rejects source or measured-bundle changes during a run.
Bundle sizes independently record `dist/build-info.json`, HTML and asset hashes;
they do not assert that a pre-existing `dist` was built from the measured source.
Rebuild first and retain build provenance when that association matters.
The historical baseline files predate this additional provenance and are not
retroactively claimed to contain it.

### Environment and limitations

- Linux x64, Node `22.22.1`, pnpm `10.34.5`, AMD Ryzen AI 7 PRO 350,
  12 logical CPUs, approximately 47 GiB physical RAM.
- This was a shared development machine. The primary run's starting load
  averages were `0.83 / 1.16 / 1.94`; the repeat began at
  `1.02 / 1.19 / 1.93`. The completed real-tmux gate was not running during these
  corrected measurements. Results are still not an exclusive-host capacity
  measurement.
- Each synthetic message contains 256 ASCII bytes plus IDs/timestamps and
  envelope fields. Maximum workload: 100,000 messages. Million-message cases
  were deliberately not run.
- Heap limit: 768 MiB; the program also stops when a sampled RSS exceeds 1 GiB.
  This is not an operating-system memory reservation or a hard RSS limit.
- Operations use 5-30 measured samples after the warmups specified in the
  program. Median averages the two middle values for even sample counts, and
  per-operation `samplesMs` retains observed-order timings. P95 is nearest-rank;
  with small sample counts it is often the
  maximum, not a statistically strong tail-latency estimate.
- API measurements use the real, **never-started** `AgentService.listSessions`
  projection, actual `SessionStore`, `ComputerManager`, route registration and
  Fastify serialization. Provider/discovery/terminal callbacks are fail-fast
  fakes; no provider login/query or native operation can run.
- This is one local Copilot adapter, not dual-provider aggregation, discovery or
  live hydration. Fastify injection excludes sockets, TLS, WAN latency,
  compression and browser work. Upsert encoding is a constructed detail
  envelope, not an end-to-end provider event.
- `clonedMessageEntriesPerSample` counts message arrays on directly cloned
  session objects. It distinguishes full-history work from cheap metadata
  clones; it does not measure every allocation, nested object or garbage
  collector copy.
- RSS includes this measurement process, imported SDKs, the TS loader, fixture
  data and prior workloads. It is **not** the resident size of a production hub.
- The Node event-loop histogram uses 1 ms resolution with 2 ms yields between
  samples. It is diagnostic event-loop delay, not browser INP or provider
  inference latency. See [Node's measurement API][node-perf].

## Measured results

All timing values below are **median milliseconds from the primary run**.
Column headings are retained sessions x messages per session; the final column
has only 10 open sessions. Sizes are uncompressed bytes.

| Operation | 10 x 100 | 10 x 1,000 | 100 x 1,000, all open | 100 x 1,000, 10 open |
| --- | ---: | ---: | ---: | ---: |
| `SessionStore.list()` | 0.708 | 8.387 | 98.896 | 94.958 |
| One `SessionStore.get()` | 0.242 | 0.746 | 0.618 | 0.711 |
| One `readAfterWrites()` | 0.112 | 0.672 | 0.696 | 0.856 |
| `GET /api/sessions`, in-process | 1.085 | 8.004 | 103.090 | 98.758 |
| One durable metadata rename | 2.298 | 17.368 | 164.408 | 170.892 |
| Warm `streamMessage()` public snapshot | 0.115 | 0.730 | 0.736 | 0.841 |
| Encode one full `session.upserted` | 0.068 | 0.716 | 0.688 | 0.697 |
| Session-list response, bytes | 5,307 | 5,307 | 52,557 | 5,307 |
| Message entries cloned per API sample | 1,000 | 10,000 | 100,000 | 100,000 |
| One full-session event, bytes | 38,764 | 374,914 | 374,914 | 374,914 |

The first two columns have identical list payloads despite 10x history growth.
The final column proves that **closed histories still add list CPU work**:
`AgentService` filters open sessions only after the store clones them.
Raw `list()` made 10, 10, 100 and 100 complete-session clone calls. The API
adds one registry-array clone, but that extra call copies no message history.
The existing `backend()` accessor made **zero clones** even at 1,000 calls.

Warm `streamMessage()` returns one full session clone per append in this
isolated store measurement. The real provider's subsequent public-read/publish
path can add work; this row is not a complete streaming-turn measurement.

The largest API workload's sampled process RSS was about **495 MiB**; the
later partly-closed case reached **510 MiB**, and checkpointing reached about
**581 MiB**. These include the loader, fixtures and previous cases, not just a
production server's working set.

The repeat's API medians were `1.663 / 9.089 / 101.673 / 99.213 ms`, and durable
rename medians `2.883 / 19.022 / 156.608 / 160.429 ms`. The history-copy trend
survived; exact timings and RSS are not universal thresholds.

### Where the measured work is reached

Static provider tracing at this same baseline found:

- Copilot list/history methods (`agent-service.ts:2117-2133`) and Claude's
  equivalents (`claude-agent-service.ts:426-435`) strip messages after cloning.
  Provider routing also uses detail reads to select an adapter
  (`provider-session-service.ts:373-380`).
- Transcript polling is nominally 750 ms; discovery is 10 seconds. Both are
  single-flight. An unchanged, idle native-session path can make four
  history-bearing `get` calls for existence, dialogs, update notices and
  hidden questions before/around the unchanged-log gate.
- That count is conditional, not every session on every tick: active SDK turns
  can short-circuit polling; unopened stored SDK histories are not all in the
  transcript polling set. A simple unchanged attached-idle SDK path has two
  such reads. Discovery separately uses a full store list.
- Copilot and Claude streaming text paths call the store append/content methods,
  then publish full session details. The complete provider path has additional
  clones beyond the isolated `streamMessage` row.

These are source call-path observations, **not measured complete poll or
streaming latencies**. Keep the native-dialog, hidden-question, admission and
transcript-watermark guarantees when replacing these reads with cheaper views.

### Event log: preserve the optimization that already works

| Existing event count | Cold parse | Unchanged version `stat` | Warm reader | Read after one append |
| --- | ---: | ---: | ---: | ---: |
| 100 | 1.128 | 0.176 | 0.902 | 0.667 |
| 1,000 | 1.880 | 0.155 | 0.554 | 0.636 |
| 10,000 | 9.989 | 0.168 | 0.565 | 0.898 |

The append timing excludes writing the synthetic new line. The warm reader still
copies the returned event array; the service's version gate can avoid calling
that reader at all for unchanged logs. These results do not imply constant-time
projection of a changed transcript.

[`readSessionEvents`](../server/event-log.ts) retains parsed prefixes and
invalidates them for shrink, rewrite, changed inode/head and relevant timestamp
changes. The cache is limited to 16 logs, not a total byte budget. Measure
long-lived retention before changing eviction, and preserve all invalidation
cases when optimizing.

### A slow node delays the combined session list

The loopback fixture returned a small local session and a small remote session.

| Added delay on the node's session-list response | Median hub list |
| --- | ---: |
| 0 ms | 4.099 ms |
| 600 ms | 603.492 ms |

Two overlapping hub lists issued **one** node-list request, confirming the
existing in-flight deduplication. However,
[`listSessionsWithAuthority`](../server/computer-manager.ts) waits for all
remote reads before returning local sessions too.
[`RemoteNodeClient.request`](../server/remote-node-client.ts) ordinarily allows
15 seconds for a GET. A timeout-length bootstrap stall is therefore a
source-backed risk; **the 15-second offline case was not measured**.

Keep `answeredComputerIds`, last-known offline sessions, registration lifetimes
and event/snapshot reconciliation. A quicker response must not turn a partial
inventory into proof that sessions were deleted.

### Workspace browsing and binary previews

Listing 2,001 ordinary synthetic files took **540.24 ms** median, or
**548.60 ms** on repeat. Exactly 2,000 entries were returned, with no truncation
indicator. [`listWorkspace`](../server/workspace-browser.ts) reads the whole
directory, resolves and stats accepted entries serially, then sorts the capped
result. This is both a browsing-limit gap and a useful performance target.

Reading and packaging 10 MiB of synthetic `.pdf` bytes took **10.13 ms** median.
The returned base64 text occupied **13,981,016 bytes** before its JSON envelope.
This measures encoding and filesystem work only: the bytes are not a valid PDF,
and no PDF.js decoding or rendering was measured.

Text search has real bounds: 5,000 visited files, 50 results, 2 MiB per text file
and 20 MiB searched text. There is no separate directory-visit budget or
request-owned cancellation in `searchWorkspace`; deep/wide directory-only
trees and abandoned searches remain unmeasured scaling risks.

### Frontend build, not frontend responsiveness

The production build's HTML references:

| Asset | Raw bytes | Locally computed gzip bytes |
| --- | ---: | ---: |
| Entry JavaScript | 665,224 | 197,528 |
| Entry CSS | 97,891 | 17,452 |

Gzip was computed with Node's default `gzipSync`; it is not an assertion that
the application or its upstream proxy actually sends compressed responses.
The build also emits a separate approximately 430 kB PDF chunk and separate
Mermaid/diagram chunks. Summing all emitted files would overstate first-load
JavaScript.

Use the browser network trace to establish which chunks load for a particular
flow. Splitting cold dialogs may help first load, but should follow measurement.
Preserve update/rollback behavior: an old tab can reference a removed lazy
chunk, a case called out by [Vite's deployment guidance][vite-build].

The existing bounded conversation window reduces mounted history. It does not
eliminate server-side list clones, bound retained details, reduce full-session
event size, or limit the cost of one large Markdown message.
A source line count is not a rendering metric.
Use a profiling-enabled build and React's `actualDuration` to attribute render
cost rather than assuming a component extraction makes it faster. Profiling
has overhead and is disabled in ordinary production React builds
([React Profiler][react-profiler]).

## Recommended sequence

These are **proposed changes**, not changes implemented by this review. Reuse
the R1-R5 boundaries in the [existing roadmap](sdk-architecture-roadmap.md).

| Priority | Change | Evidence and boundary to preserve |
| --- | --- | --- |
| 1 | Add cheap committed metadata projections; replace history-bearing reads used only for existence/status/poll decisions. | Full clones grow with history while the metadata accessor does not. Keep admission ordering, `readAfterWrites`, retired IDs and transcript watermarks; never expose mutable store internals. |
| 2 | Add versioned selected-session deltas and explicit slow-consumer behavior on both WebSocket hops. | Both broadcasts encode complete upserts and send to every connected socket; a constructed 1,000-message upsert is about 375 kB. Define ordering, reconnect/gap recovery and snapshot barriers first. |
| 3 | Add bounded selected-session history pages and explicit loaded-detail state where needed. | Existing lists already strip bodies. Pagination targets detail reads and retained history, not a fictitious full-history list response. Carry changes through service, node, proxy, hub and browser with legacy fallback. |
| 4 | Reduce total-history work in durable checkpoints only after measuring actual write frequency. | A one-session rename writes the whole JSON store and reached 157-171 ms across the large-workload runs. Keep durable acceptance writes and failure atomicity; do not replace them with best-effort debouncing. |
| 5 | Decouple local/healthy-computer bootstrap from a slow node's refresh. | The 600 ms fixture delayed the combined list by the same amount. Preserve partial-inventory authority and visibly offline cached state. |
| 6 | Add paged/truncation-aware folder reads, bounded filesystem concurrency and search cancellation/budgets. | A capped listing still took about half a second; the omitted entry was undisclosed. Preserve root confinement and escaping-symlink checks. |
| 7 | Consider an authenticated binary response instead of base64 JSON for large previews. | 10 MiB became 13.33 MiB of base64. Carry the ownership and limit checks through the node and hub; revoke browser object URLs. |
| 8 | Profile composer, session switching, streaming Markdown and cold dialogs, then isolate or defer proven expensive rendering. | Bundle size is known, field interaction latency is not. Do not add a state framework, blanket memoization or a second virtualization library without evidence. |

For WebSockets, the current `broadcast` implementations in
[`hub-routes.ts`](../server/hub-routes.ts) and
[`node-routes.ts`](../server/node-routes.ts) check `readyState`, but do not impose
an application `bufferedAmount` budget, subscriber filter or explicit gap
protocol. This is a **static scaling risk**, not a reproduced production
out-of-memory incident. Slow-client stress was not part of this bounded run.

There is no evidence here that a new database, a global cache, more provider
processes, or GPU transcription should be the first optimization. Transcription
already admits one job at a time with explicit busy errors; uploads already
limit hub-side concurrency to two. Benchmark real media and owning hardware
separately before changing those limits.

## Proposed acceptance and measurement gates

| ID | Criterion for a future optimization |
| --- | --- |
| PERF-01 | An unchanged metadata-only poll clones zero full message arrays; increasing history 10x does not increase its history-processing work. |
| PERF-02 | Preserve the existing history-free summary payload while making list/filter work independent of retained message count. Cover many closed histories with few open sessions. Define a lossless policy for large pending-control/queue content separately. |
| PERF-03 | A history page returns at most the negotiated message count (100 is the roadmap proposal), with an explicit oversized-message policy and a cursor bound to identity/history generation. |
| PERF-04 | Delta traffic is independent of prior transcript length; slow clients cannot accumulate unbounded application output buffers. Both node-to-hub and hub-to-browser paths converge after a gap. |
| PERF-05 | A slow/offline computer does not delay usable local-session discovery to the remote timeout; partial snapshots cannot erase known sessions or pending actions. |
| PERF-06 | Folder limits are visible and navigable. Search respects directory/file/byte/time or cancellation budgets without bypassing path validation. |
| PERF-07 | Refused writes, unknown delivery and clear/replacement races retain their existing regression guarantees. Performance work must not create success-shaped persistence failures. |
| PERF-08 | Record repeated cold/warm production-browser runs at desktop and phone sizes with synthetic short/long histories, two streaming sessions, a reader open, and an interrupted connection. |

For field responsiveness, a useful **proposed product target** is INP at or below
200 ms at the 75th percentile, separately for phone and desktop, following
[web.dev's metric guidance][inp]. This is not interchangeable with these API
medians, a single Playwright click or React commit time.

Record browser paint/input latency, event convergence, network bytes, request
counts, heap/RSS and event-loop delay alongside operation-specific clone/write
counts. Use deterministic shape/work assertions in ordinary regression tests;
keep machine-dependent timing comparisons in repeated benchmark evidence.

Still needed: production-browser CPU profiling, real iPhone/iPad keyboard and
PWA runs, two-browser/slow-reader WebSocket stress, a real two-node network run,
real-provider parity measurements and media transcription timing. This review
does not claim those gates passed.

[node-perf]: https://nodejs.org/download/release/v22.22.1/docs/api/perf_hooks.html
[react-profiler]: https://react.dev/reference/react/Profiler
[vite-build]: https://vite.dev/guide/build.html#load-error-handling
[inp]: https://web.dev/articles/optimize-inp
