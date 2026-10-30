# Task 12 — Publication readiness

## Base and version

- Fetched and pruned origin on 2026-10-18.
- #398 is merged at `9870ae558b480d1353ffd5e6dfe7fc316ac53e47`.
- Rebased the 35 feature commits onto `origin/main`
  `d495ca20593214098d4c5b6b9c81097255fd4c43`.
- The only conflicts were shipped-version files. The final base is `1.17.3`;
  all application/native-shell versions are `1.18.0`, exactly one minor bump.
- Existing Oracle dictation remained covered by `src/voice-recorder.test.ts`.

## Review and security history

- Task 8 completed Conversation controls, accessibility, resource ownership,
  immutable active mode, error recovery, and preservation of dictation.
- Task 9 completed explicit checksum-pinned profiles, configuration
  preservation, licensing, resident sherpa VITS, and the version bump.
- Task 10 completed local/paired integration, ticket/auth/origin, malformed
  PCM, backpressure, path, child, log-redaction, disconnect, relay-shutdown,
  privacy, and retention coverage.
- Task 11 completed built-browser E2E, real-engine interruption, redistributable
  EN/pt-BR evidence, 500 socket/session lifecycle cycles, and the 30-minute
  production-queue soak.
- Security corrections force voice to Ask-only while preserving immutable
  `source: voice` provenance. Voice is escaped as untrusted, unverified
  acoustic content; recovery omits voice-linked content; current and unknown
  mutating tools fail closed, while answer-only reads and `ask_session` remain.
- The user confirmed the independent security review clean at the pre-rebase
  head. Rebase conflicts touched version text only. The affected integration,
  security, and browser-client suites then passed three independent iterations,
  and both complete gates passed.
- Supervisor reviewed publication head `9c9a99f65a6e` twice. The first pass
  reported 11 findings; the follow-up at the same head retained those findings
  and added bounded node-frame ingress and cancellable paired-node startup.
  The resulting 13 fixes isolate SDK context after voice, preserve voice
  provenance through trimming, scope barge-in to voice-owned work, remove stale
  queued voice turns, tolerate trailing PCM after early finals, acknowledge
  heartbeats, bound cancellation/exact-once histories and Piper output, verify
  installed profile trees, expose enforced Ask state, reject oversized node
  frames before decode, and abort remote startup when the browser disconnects.
- Supervisor then reviewed `51f86fe5c2ee` and found three remaining races:
  unscoped manager cancellation after an awaited TTS cancel, lost voice-work
  ownership after browser reconnect, and missing tree rehash in the
  concurrent-publisher path. The coordinator now revalidates the captured
  running voice ID immediately before global cancellation, reconstructs only
  queued/running `source: voice` ownership on start, and rehashes a
  same-digest published tree under the publication lock before activation.
- Supervisor reviewed `187cc4068fe4` and found two final coordinator blockers.
  Forwarded audio now advances a wall-clock playback cursor, so the next
  sentence starts only after already-forwarded active-segment audio should
  have been consumed; gaps between frames reduce the cursor instead of
  accumulating false backlog. Barge-in now admits current-generation PCM into
  an utterance-bounded retained queue outside manager/cancellation
  serialization, releases it only after backend `speech_confirmed`, drains it
  serially, counts retained bytes through delivery, fails once on overflow,
  and releases queued work on close. Backend cancellation still starts before
  scoped Oracle cancellation, and a new final remains serialized behind both.
- Supervisor reviewed `7c5200e3e933` and found three remaining lifecycle
  boundaries. Manager state now persists the exact voice-tainted SDK session
  before every prompt attempt, including resumed/restarted/fresh recovery
  rungs, and the pump retires persisted taint before selecting any queued work.
  Session and taint pointers clear atomically before best-effort deletion, so a
  delete failure cannot make restart resume acoustic context. Barge-in now
  captures voice message IDs and invokes an internal idempotent
  `cancelMessage(id)` after backend TTS cancellation; a queued message that
  becomes running is still cancelled, while unrelated typed work is untouched.
  Web Audio exposes a per-generation/per-segment drain promise settled by real
  source completion, interruption, or close. The client does not block socket
  delivery while waiting, ignores stale callbacks, and reaches Listening only
  for the still-current segment. Code-only or otherwise silent assistant
  completions receive an explicit Listening state from the coordinator.

## Publication gates before Graphify

### Critical races after Supervisor fixes

Exact plan command, three independent iterations:

```text
pnpm vitest run server/oracle-voice-integration.test.ts \
  server/oracle-voice-security.test.ts src/oracle-voice/client.test.ts
```

Each iteration: 3 files, 49 tests passed. Aggregate: 9 file executions,
147 tests, no retry, unhandled rejection, leak, or warning.

The complete changed-feature and version-policy selection passed 41 files and
1,366 tests. The first direct modified-file regression selection passed 12
files and 406 tests; the final Supervisor regressions passed 2 files and 76
tests.

After the `187cc4068fe4` findings, the final coordinator/session/integration/
security/client selection ran three clean iterations:

```text
pnpm vitest run server/oracle-voice-coordinator.test.ts \
  server/oracle-voice-session.test.ts \
  server/oracle-voice-integration.test.ts \
  server/oracle-voice-security.test.ts \
  src/oracle-voice/client.test.ts
```

Each iteration: 5 files and 123 tests passed. Aggregate: 15 file executions
and 369 tests, with no retry, unhandled rejection, leak, or warning. Coverage
includes 12 seconds of first-sentence browser queue, wall-clock consumption
between frames, stale generations, invalid sequence, timer cancellation,
backend confirmation/cancellation failure, cancellation timeout, fail-once
retained-queue overflow, close during a pending gate, and real local-session
delivery of 30 ordered PCM frames after blocked synthesis cancellation.

After the `7c5200e3e933` findings, strict red tests produced 12 expected
failures: four missing persisted/session-scoped manager behaviors, five stale
coordinator cancellation/listening behaviors, two missing playback-drain
promises, and one client drain transition. Green verification then passed:

- focused manager/store/context/tools, coordinator/integration/security,
  playback/client, hook, and Oracle UI: 11 files, 294 tests;
- critical manager/coordinator/session/integration/security/playback/client
  race selection, three independent runs: 7 files and 197 tests each, 591
  aggregate;
- route/app internal cancellation wiring: 2 files, 20 tests;
- TypeScript, oxlint, and Vite production build.

The final pre-commit rerun combined those focused and route/app selections:
13 files and 314 tests passed. Graphify remained current at 5,562 nodes,
15,302 edges, and 327 code files; `git diff --check` also passed.

Supervisor then reviewed `5c195ffe8370` and reported six final boundaries.
Red-first evidence reproduced each one:

- backend PCM admission remained pending behind a blocked
  `speech_confirmed` instead of rejecting the third frame at the 512-byte
  limit;
- coordinator `speech_end` reached the backend while an accepted audio
  delivery was still blocked;
- a successful assistantless turn emitted no Listening state and a user-done
  event discarded a later assistant row;
- plain GET and malformed-upgrade requests consumed their valid tickets, so
  the subsequent real upgrade failed with 401;
- a closed node socket left a blocked local acquisition busy;
- removing the fixture's scoped cancellation method made deterministic
  Chromium lose the Interrupted transition during barge-in.

The fixes synchronously reserve every backend input frame before control
ordering, use idempotent per-frame release accounting, snapshot a
gate/generation audio-delivery barrier for `speech_end`, admit only verified
WebSocket handshakes, abort node acquisition from socket close, implement the
fixture's exact-ID cancellation contract, and retain successful voice
associations until the manager's idle completion boundary. The completion
path covers no assistant row, empty and filtered assistants, a late assistant,
failed/cancelled/interrupted turns, and a newer generation without a timeout.

Round-5 focused verification passed 8 files and 246 tests across backend
session, coordinator, hub routes, node routes, integration, security, browser
client, and playback. The established critical
manager/coordinator/session/integration/security/playback/client selection
passed three independent runs at 7 files and 209 tests each, 627 aggregate.
Deterministic Chromium passed 1/1 after the scoped barge-in assertions proved
one live stream, the exact voice target cancelled, and unrelated typed work
still queued. TypeScript/Vite build and oxlint passed; oxlint emitted only the
existing React warnings. Graphify refreshed to 5,574 nodes, 15,334 edges, and
327 code files. Per the explicit instruction, the approximately 29-minute
normal and production `pnpm check` gates were not rerun; the parent owns those
exact-head gates after Supervisor approval.

Local rapid-interruption integration and authenticated paired-node integration
both invoke the captured voice message ID, never global cancellation. The
manager tests cover crash-state restart into typed Delegate work, every recovery
rung, historical optional state, terminal idempotence, unrelated typed-turn
protection, and SDK deletion failure.

### Repository gates

| Gate | Result |
| --- | --- |
| `pnpm check` | 152 files passed, 1 skipped; 4,761 tests passed, 1 skipped; build passed |
| `NODE_ENV=production pnpm check` | same counts; production build passed after one unrelated contended tmux command was killed by its command timeout and passed immediately in isolation |
| Deterministic Chromium | 1/1 passed |
| Deterministic Firefox | 1/1 passed |
| Real sherpa Chromium | 1/1 passed in 15.0 s after pacing the real microphone fixture |
| WebKit | host blocker: GTK4, Graphene, GStreamer/media, codec, WebKit support libraries absent |

Round-4 host exception: the new normal `pnpm check` was stopped after 17
minutes while its serial real-tmux tests were still progressing. A diagnostic
verbose run was then bounded at 600 seconds and recorded 253 passing test cases
with no failure; the final two completed
`terminal-session.test.ts` working-footer lookalike cases each took about 90
seconds under host tmux contention. Lint and build had already passed
independently. Per the instruction not to rerun blindly under host contention,
neither complete normal nor `NODE_ENV=production` check was repeated for this
round; the focused and three-pass race evidence above is the authoritative
round-4 result.

The real fixture is now delivered in 80 ms VAD frames with a 20 ms delay. This
preserves bounded production backpressure while avoiding the earlier
test-only 11-second instantaneous burst. The documented 3,000 ms production
endpoint passed.

Real local interruption evidence:

- 2 manager sends, 1 cancellation, 0 old audio starts after interruption;
- generation 1: 3 frames + `audio_end`, all cancelled before playback;
- generation 2: 3 frames + `audio_end`, replacement playback started;
- first partial 1,644.2 ms; final after speech 283.1 ms;
- STT RTF 0.399; TTS first audio 259.2 ms; TTS RTF 0.135;
- peak worker RSS 296.2 MiB; sustained worker CPU 100.2%.

### Clean exact-head verification

The pre-Supervisor detached worktree proof used
`~/src/agentic-remote-worktrees/oracle-conversation-publication-clean` at
`3d0d568629f6a1351917fc42772d918e47ce1d47`.

- `CI=true pnpm install --frozen-lockfile`: 572 packages reused, none
  downloaded; lockfile unchanged. pnpm reported its normal ignored-build-script
  notice for esbuild, koffi, and protobufjs.
- `pnpm check`: 152 files passed, 1 skipped; 4,731 tests passed, 1 skipped;
  build passed.
- Deterministic Chromium voice E2E: 1/1 passed in 13.6 s.
- The detached worktree stayed clean and was removed. No branch was created.
- The same frozen install, full check, and deterministic Chromium proof will
  be repeated at the final committed head. Its exact SHA and result are
  recorded on PR #425 so recording the proof cannot itself change that head.

## Existing benchmark and soak evidence

| Profile/language | WER | First partial | Final | STT RTF | TTS first audio | TTS RTF | Peak RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `fast-en` / en | 0.917 | 1,650 ms | 21 ms | 0.040 | 283 ms | 0.090 | 411 MiB |
| `multilingual-quality` / en | 0.517 | 965 ms | 577 ms | 0.757 | 286 ms | 0.086 | 1,246 MiB |
| `multilingual-quality` / pt-BR | 0.045 | 724 ms | 421 ms | 0.735 | 304 ms | 0.085 | 1,205 MiB |

The 30-minute artifact was not rerun because the rebase changed only version
text. `oracle-voice-soak.json` SHA-256 is
`da2f68c6129d8a7776eaeec92ff9adb2ef1799f27768e2fedde65f7429450d07`.
It records 1,800,000.09 ms, 180/180 unique sends, 500/500 lifecycle cycles,
20/20 startup-stop/immediate-restart races, zero queue overflow, zero stale
client delivery, zero orphan child PIDs, and zero unhandled/uncaught errors;
all 23 assertions are true.

## Privacy, licensing, and limitations

- Raw PCM, partials, and synthesized audio are memory-only. Only the finalized
  normal Oracle message persists and is sent to remote Copilot inference.
- Tickets are hashed, short-lived, single-use, origin/address bound; node
  transport uses the existing bearer boundary. No token, PCM, transcript,
  stream identity, or TTS text is logged.
- sherpa-onnx is Apache-2.0. Voice/model terms remain separate. LJSpeech is the
  permissive English profile but includes GPL eSpeak NG data; the Faber
  Portuguese profile is research-only because of Lessac ancestry plus
  OpenMDW/GPL/provenance obligations. Assets are explicit downloads, not
  release-bundled.
- Misses: English WER and first-partial targets; multilingual STT RTF; pt-BR
  corpus breadth; true within-sentence incremental VITS; native synthesis
  preemption; sentences over 12 seconds; WebKit/Safari and physical-device
  coverage.

## Warnings and review status

- Oxlint emits the repository’s existing React ref/effect/dependency warnings.
- Vite emits the existing >500 kB chunk warning.
- No unhandled rejection, uncaught exception, leak, or new deprecation appeared.
- The established Supervisor mechanism is a PR comment containing
  `/supervisor review`; the local service watches and reconciles it. The two
  `9c9a99f65a6e` passes and the `51f86fe5c2ee` pass requested changes; all 16
  findings from those rounds plus both `187cc4068fe4` blockers now have
  regression coverage. The three `7c5200e3e933` lifecycle findings also have
  crash, recovery, scoped-cancellation, paired/local, and real playback-drain
  regression coverage. The six `5c195ffe8370` queue, drain, admission,
  acquisition, fixture, and completion findings have focused red/green
  coverage and three-pass critical verification. The next exact-head request
  and verdict are authoritative on PR #425; GitHub Copilot review will not be
  requested.
- No merge or deployment is authorized.
