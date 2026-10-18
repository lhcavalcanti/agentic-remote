# Task 10 — Cross-Layer Integration and Security Tests

## Status

The Task 10 review findings are addressed on top of
`dab81efe912dd8822466ecca0e316e8f70cb77f9`.
The remaining Important disconnect-classification issue at
`ec094f43aed832478bdd11300b0acf8ddc171863` is also resolved.

The implementation and focused validation are green. The ordinary full suite
also passed. A later `NODE_ENV=production pnpm check` run reached one unrelated
environmental failure in `server/tmux-errors.integration.test.ts`; details are
recorded under Verification and Concerns.

No Graphify refresh, deployment, or production runtime change was made.

## Privacy and persistence contract

The normative application specification, architecture, design, user guide,
README, and implementation plan now state the same contract:

- raw PCM, partial transcripts, and synthesized audio are ephemeral and are
  never persisted;
- the finalized transcript is submitted exactly once through normal
  `ManagerAgent.send`;
- that finalized text is persisted as the normal Oracle user message and
  conversation history;
- normal Oracle context, including the finalized text, is sent to remote
  Copilot inference; and
- no separate voice transcript or recording artifact is persisted.

The Oracle UI adds the concise durable-history disclosure:
“Final messages stay in Oracle history.”

`server/oracle-voice-security.test.ts` proves duplicate same-identity final
delivery results in one manager send, one normal conversation persistence, and
no voice transcript or audio artifact.

## Retryable paired-node disconnect

Backend disconnect handling now carries explicit `retryable` and `cause`
metadata from the local session or remote voice client into the coordinator.
The coordinator no longer guesses from the WebSocket close code:

- established paired-node abnormal socket loss (`1006`), socket errors, and
  explicitly classified transport delivery failures are reported as nonfatal
  and closed with a browser-reconnectable code;
- local session failures, worker/internal `1011`, registration or pairing
  changes, protocol and invalid-audio failures, policy/auth failures, and
  backpressure remain terminal;
- a paired-node transport delivery failure is retryable only when the failed
  payload is not retained or replayed; reconnect still creates a fresh ticket,
  stream, and generation;
- explicit worker `fatal_error` controls remain terminal and their following
  disconnect is not reported a second time.

During an existing reconnect cycle, temporary capability unavailability keeps
the browser in reconnect mode instead of falling back to dictation. Every
attempt obtains a fresh ticket, stream, and generation. Audio and finalized
text from the previous stream are never replayed.

The two-app production-client integration test abruptly destroys the paired
node transport during an active stream, restarts the node on the same address,
and proves:

- the browser observes `reconnecting`;
- a fresh stream, generation, and ticket are used once the node returns;
- old PCM and finalized text are not replayed; and
- the manager receives no duplicate send.

## Real ManagerAgent and React proof

The local cross-layer integration now uses the production
`OracleVoiceCoordinator`, production local backend, a real `ManagerAgent`, a
real `ManagerStore`, and deterministic `ManagerSdkClient`/`ManagerSdkSession`
fakes.

It drives the real manager lifecycle from queued to running, emits cumulative
replacement `manager.delta` snapshots, and stores the final assistant message.
The assertions prove:

- duplicate same-identity final delivery creates one persisted/live user
  message;
- `/api/events` snapshots equal the real `ManagerAgent` replacement deltas;
- TTS segments are derived from those same replacement snapshots; and
- the stored assistant message uses the same streamed message identity.

`src/ManagerAssistant.test.tsx` subscribes to the corresponding event sequence
and proves cumulative text renders in the normal transcript before the final
stored assistant message replaces the live delta.

## Output relay shutdown

`backendOutputRelay` now owns an explicit bounded FIFO queue with at most one
delivery in flight. It no longer retains work through an unbounded promise
tail.

`close` and `abort`:

- mark the relay closed;
- reject queued and in-flight acceptance promises;
- release queued output references and byte accounting immediately;
- prevent queued delivery;
- settle `drain`; and
- ignore late completion or rejection callbacks from an aborted delivery.

Connector shutdown gives healthy delivery a bounded drain interval. On timeout
it aborts the relay and retries closure of the associated transport.

The tests cover ordered healthy drain, end-to-end backpressure, a deliberately
never-settling delivery, late callback isolation, released references and byte
accounting, prompt shutdown, and an independent fresh stream.

## Paired-node privacy proof

The full authenticated paired turn captures both hub and node loggers and uses
unique sentinels for:

- microphone PCM;
- finalized transcript;
- manager delta and TTS text;
- ticket;
- stream identity; and
- node token.

None appear in either log. No raw PCM or audio file is created on either
computer. The RED test exposed the stream ID in Fastify's automatic node request
log; the authenticated node voice WebSocket route now disables that automatic
request log.

The finalized transcript remains present only through the expected normal
Oracle conversation persistence path.

## Strict TDD evidence

Each finding began with a failing test:

1. privacy tests rejected duplicate persistence and separate voice artifacts;
2. coordinator/client tests rejected terminal handling of transient node loss,
   followed by the failing real node-restart scenario;
3. the old self-confirming manager fixture was replaced by assertions that
   failed until the real ManagerAgent event and store path was connected;
4. a never-settling delivery proved shutdown could retain queued work, and a
   late-rejection test proved an aborted relay could still disconnect later;
5. paired privacy sentinels exposed the node stream ID in automatic logs.

The production changes described above were made after their corresponding RED
tests were observed. This follow-up classification fix began with failing
session, coordinator, route, and remote-client regressions, including a
separate RED proof that a local backend startup failure previously closed with
reconnectable `1011`.

## Verification

```text
Classification focused suites: 8 files, 136 tests passed
Task 10 suites:                 2 files, 24 tests passed
Ten-iteration repeat loop:      10/10 clean, 240 test executions
Affected manager/UI/client:     9 files, 213 tests passed
Oracle voice suite:             22 files, 369 tests passed
Relay focused suite:            1 file, 9 tests passed
TypeScript project build:       passed
Lint:                           passed (pre-existing React warnings only)
Production build:               passed
Ordinary full suite:            151 files passed, 1 skipped
                                 4,711 tests passed, 1 skipped
```

The final ordinary full-suite result includes the disconnect-classification
follow-up and its paired-node internal `1011` integration regression.

`NODE_ENV=production pnpm check` ran lint successfully and then failed one
unrelated existing integration test:

```text
server/tmux-errors.integration.test.ts
keeps empty and cold-start sessions working through the hub without a tmux server
```

The test's conservative `/proc` inspection found ambient isolated tmux test
servers whose socket directories had already disappeared, so it could not
prove that no tmux server existed. A targeted production-mode retry reproduced
the same environmental failure. No shared or unowned tmux process was
terminated. The production build was then run directly and passed.

## Concerns

- Exact `NODE_ENV=production pnpm check` completion remains blocked by ambient
  stale isolated tmux test servers on the shared development host. This is not
  caused by the Oracle voice changes; the ordinary full suite passed, all
  affected production-mode code built, and the targeted failure reproduces
  independently.
- Task 11 still owns real browser audio E2E, corpus quality, latency benchmark,
  and soak evidence.
- No deployment or production host modification was performed for Task 10.
