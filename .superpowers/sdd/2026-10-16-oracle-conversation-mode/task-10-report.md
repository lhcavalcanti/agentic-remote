# Task 10 — Cross-Layer Integration and Security Tests

## Status

GREEN at approved base `e1a949535b943ea05d1d03c5ccf0fb8cd6db23c5`.

Created:

- `server/oracle-voice-integration.test.ts`
- `server/oracle-voice-security.test.ts`

Production fixes proved by RED tests:

- `server/oracle-voice-routes.ts`
- `server/oracle-voice-session.ts`

## Strict TDD evidence

### RED 1 — required suites did not exist

```text
pnpm vitest run server/oracle-voice-integration.test.ts server/oracle-voice-security.test.ts
No test files found, exiting with code 1
```

### RED 2 — slow-browser close leaked the active route

The actual listening hub, real browser WebSocket, local backend, and bounded
output queue reproduced a close that delivered `1013` to the browser but left
`app.close()` pending. Root cause: connector shutdown awaited an output relay
drain without a bound after the downstream browser had stopped consuming.

GREEN fix: local and remote connector shutdown now bounds relay draining to one
second after the backend/client has already been closed. The relay still drains
normally when delivery is healthy; shutdown cannot remain wedged indefinitely.

### RED 3 — unsupported browser language reached the engine

The actual browser-to-hub WebSocket advertised only `["en"]`, but a
`start(language: "pt-BR")` remained open instead of failing.

GREEN fix: production `LocalVoiceBackend` supplies its configured language to
the engine-backed session, which rejects unsupported start languages with
policy close `1008`. This also protects direct authenticated node WebSockets.

## Exact automated scenario count

`22` Vitest cases:

- `15` integration cases
  - local full-turn production flow: 1
  - success/no-echo and failed composer recovery: 1
  - paired-node full flow: 1
  - slow paired node/backpressure: 1
  - disconnect phases (`capture`, `STT`, `manager thinking`, `TTS`,
    `playback`): 5 parameterized cases
  - duplicate plus out-of-order PCM: 1
  - rapid generations `7 -> 8 -> 9` and stale work: 1
  - worker crash: 1
  - slow browser/backpressure and shutdown cleanup: 1
  - Oracle cancel timeout: 1
  - unavailable/dictation fallback: 1
- `7` security/privacy cases
  - Host/Origin/client/ticket binding, one-time use, and 64-ticket cap: 1
  - missing/invalid/valid node bearer and token-log proof: 1
  - oversized binary, malformed binary, malformed JSON, forbidden control: 1
  - bounded control flood: 1
  - unsupported advertised language: 1
  - four invalid configuration cases (profile, absolute path, escaping
    symlink, invalid TTS sample rate): 1 table-driven case
  - log/filesystem privacy and manager-only transcript persistence: 1

## Integration evidence

### Browser -> local hub

The suite uses a real listening `buildApp`, real Fastify WebSocket upgrade,
single-use ticket, Host/Origin policy, production coordinator, production local
backend/session/turn/segmenter/relay, deterministic engine, and a deterministic
manager backed by the real `ManagerStore`.

It proves:

- capability and no-store ticket response;
- start at generation 7, confirmed speech at generation 8;
- ordered 16 kHz PCM sequences `0, 1`;
- display-only partial and speech-end/final;
- exactly one
  `manager.send("Run the focused tests.", defaults, { answerOnly: true })`;
- the normal user `manager.message` identity seen over `/api/events`;
- cumulative replacement `manager.delta` snapshots seen over the same
  `/api/events` WebSocket used by the Oracle UI;
- TTS inputs `First stable sentence.` and `Second stable sentence.` are derived
  from those exact visible snapshots, followed only by the stored final suffix
  `Final stored suffix.`;
- no independent or hidden response text source exists in the harness;
- ordered native-rate PCM and `audio_end`, every frame under the advertised
  limit;
- successful final is not returned to the composer path;
- failed manager submission returns the final exactly once for recovery;
- stop closes normally and releases the backend.

This is the regression for the current UX/API question: model text is visible
incrementally through normal `manager.delta` events, and the exact same
cumulative event contents feed the production speakable segmenter/TTS path
(subject only to the documented Markdown filtering).

### Hub -> paired node

The suite starts two real listening apps, pairs them through `/api/computers`,
uses the real `RemoteVoiceClient` bearer-authenticated WebSocket, and confirms
the hub has only remote selection configuration and no local engine factory or
model paths.

It proves:

- each microphone frame reaches the node engine before the next frame/end;
- partial/final, one manager submission, manager delta, node TTS, playback
  frames, and `audio_end` relay incrementally;
- no recording body/file is created on hub or node;
- node worker loss produces fatal browser error plus non-normal close without
  replay or a duplicate manager send;
- a deliberately stalled node overflows its bounded incremental queue, closes
  explicitly with `1013`, and never submits a manager message.

### Races and failures

Covered with condition-based waits:

- disconnect during capture, STT, manager thinking, TTS, and playback;
- duplicate frame suppression and out-of-order rejection;
- worker fatal error;
- slow browser and slow node;
- manager cancellation timeout;
- rapid `7 -> 8 -> 9`;
- stale manager delta, stale final, stale TTS, and stale audio rejection;
- unavailable fallback;
- exact-once/no duplicate manager messages.

## Security and privacy proof

- Host and Origin are rejected at the real hub boundary.
- Tickets are origin/address-bound, mismatch attempts are burned, reuse fails,
  and the oldest of 65 outstanding tickets is evicted.
- Node WebSocket requires the timing-safe bearer path; missing and invalid
  tokens fail.
- Oversized/malformed binary, malformed JSON, browser-originated synthesize,
  and control flood fail closed.
- Unsupported language and invalid/escaping model configuration fail closed.
- Captured hub/node logs do not contain transcript, PCM values, ticket,
  stream bearer identity, or node token.
- No `.pcm`, `.wav`, `.webm`, `.ogg`, `.mp3`, or `.m4a` file is created.
- No file contains the raw PCM byte sequence.
- The final transcript appears in exactly one persisted file:
  `oracle-manager/conversation.jsonl`, through the normal manager
  message/store path.

## Verification

```text
Task 10 suites:                 2 files, 22 tests passed
Ten-iteration loop:            10/10 clean, 220 test executions
Affected Oracle voice tests:   29 files, 1,137 tests passed
Typecheck:                     passed
Lint:                          passed (pre-existing React warnings only)
Build:                         passed
Full suite:                    151 passed, 1 skipped files
                               4,686 passed, 1 skipped tests
                               1,781.58 seconds
Production-environment check: `NODE_ENV=production pnpm check` passed
                               (lint, full suite, and build; exit 0)
```

Vitest 5.0.3 rejects the plan's literal `--repeat=10` flag with
`Unknown option --repeat`. After recording that tool incompatibility, the exact
two-file command was executed in a fail-fast shell loop ten times; all ten
iterations passed with no unhandled rejection or leaked-handle warning.

## Concerns

- The one-second output-relay drain bound applies only after the backend/client
  close has begun. It prevents shutdown wedging; it may stop waiting for an
  already-doomed downstream delivery, whose rejection remains internally
  observed.
- Repository lint still reports the existing React hook/ref warnings outside
  this task. No new Task 10 lint warning remains.
- Graphify remains intentionally stale for the plan's final Task 12 refresh.
