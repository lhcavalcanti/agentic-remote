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

### Repository gates

| Gate | Result |
| --- | --- |
| `pnpm check` | 152 files passed, 1 skipped; 4,753 tests passed, 1 skipped; build passed |
| `NODE_ENV=production pnpm check` | same counts; production build passed |
| Deterministic Chromium | 1/1 passed |
| Deterministic Firefox | 1/1 passed |
| Real sherpa Chromium | 1/1 passed in 15.0 s after pacing the real microphone fixture |
| WebKit | host blocker: GTK4, Graphene, GStreamer/media, codec, WebKit support libraries absent |

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
  reported findings now have regression coverage. The next exact-head request
  and verdict are authoritative on PR #425; GitHub Copilot review will not be
  requested.
- No merge or deployment is authorized.
