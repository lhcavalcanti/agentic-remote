# Task 11 — Review fixes and corrected evidence

## Status and scope

All eight Task 11 review findings were corrected from review HEAD
`a6d451946171f70ba5d95adc19c32b945cb5bc14`. The work stayed in the isolated
Oracle Conversation worktree. No Graphify operation, push, merge, or deployment
was performed.

Task 11 still provides deterministic built-UI browser coverage, the committed
FLEURS-derived corpus, benchmark JSON/Markdown, a real
browser/hub/resident-sherpa test, and a real-time soak. This review round makes
their evidence accurately exercise and describe production behavior.

## Strict TDD evidence

Each finding had a failing regression before its minimal implementation:

1. `playwright-config.test.ts` failed both configurations because they built
   and served ordinary `dist`.
2. Benchmark tests failed because a recognizer endpoint ended the fixture,
   later audio was not processed, endpoint latency evidence was absent, and a
   new endpoint did not reset sequence numbering.
3. The pacing test observed no initial 80 ms capture wait, and the report-label
   test found throughput values presented as streaming latency. A low-amplitude
   English onset regression also failed.
4. The deterministic browser test reported a cancelled later synthesis request
   as played even though its source had never started.
5. The real-engine test had no generation-tagged browser scheduling or
   server-audio observations from which to derive post-interruption starts.
6. Soak lifecycle tests failed because the harness had no repeated
   socket/session lifecycle runner or startup-stop/immediate-restart evidence.
7. The production-session regression showed that a 6-byte in-flight frame plus
   a 4-byte queued frame incorrectly passed an 8-byte limit. The child-cleanup
   negative test also failed before the cleanup assertion helper existed.
8. The maintained script, docs, and report scan found the unsupported smaller
   English-model label.

Focused green command:

```text
pnpm vitest run playwright-config.test.ts \
  scripts/oracle-voice-benchmark.test.ts \
  scripts/oracle-voice-soak.test.ts \
  server/oracle-voice-session.test.ts
```

Final result: 4 files, 34 tests passed.

## 1. Isolated E2E builds

Both Playwright configurations run TypeScript and Vite directly into ignored
test outputs:

- `test-results/oracle-conversation-dist-e2e`
- `test-results/oracle-conversation-real-dist-e2e`

Their servers set `AGENTIC_REMOTE_RELEASE_DIR` to those directories. An
ordinary production build was hashed before and after deterministic browser
execution with the same digest,
`25f83620ec8839775c76504db13c60d4a2db53cf3e4d7ac0c06dbc05dd500c18`.
Searches of production `dist` found no `__oracleVoiceE2E`,
`deterministic-e2e`, or `fake-vad` seam.

## 2–3. Corrected benchmark semantics

The benchmark now consumes each WAV completely. Every recognizer endpoint
contributes a final transcript, then the remaining frames continue through a
fresh utterance whose sequence starts at zero. WER scores the aggregate final
transcript. Consumed duration and endpoint count are explicit.

STT evidence is split into:

- a `real-time-paced` latency pass, where each 80 ms captured frame becomes
  available only at the end of its real-time interval and first partial is
  measured from adaptive detected speech onset; and
- an `unpaced-full-fixture` compute pass for STT RTF and worker CPU.

Endpoint-final latency is measured from the triggering accepted frame or
explicit end request and retains early endpoint latency instead of clamping it
to zero. The JSON schema is version 2 and the Markdown labels these modes
honestly.

Corrected aggregate results:

| Profile/language | Clean WER | Real-time first partial | Endpoint final | STT compute RTF | TTS first audio | TTS RTF | Peak RSS | Endpoints | Consumed audio |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `fast-en` / en | 0.917 | 1,650 ms | 21 ms | 0.040 | 283 ms | 0.090 | 411 MiB | 13 | 29,370 ms |
| `multilingual-quality` / en | 0.517 | 965 ms | 577 ms | 0.757 | 286 ms | 0.086 | 1,246 MiB | 11 | 29,370 ms |
| `multilingual-quality` / pt-BR | 0.045 | 724 ms | 421 ms | 0.735 | 304 ms | 0.085 | 1,205 MiB | 6 | 23,940 ms |
| Whisper small prior | not re-scored | missing | missing | 0.720 derived | missing | missing | 885 MiB derived | — | 11,000 ms prior fixture |

The English quality and first-partial gates still fail. The compact pt-BR
quality result remains single-speaker evidence, not a general quality claim.

## 4. Genuine playback attribution

The fake backend assigns every synthesis request a unique PCM signature.
Browser audio instrumentation records the signature only when its corresponding
source actually starts. `playedText()` maps those observed signatures back to
synthesis text and deduplicates multiple protocol frames.

The regression schedules one response behind a controlled 1.5-second start
delay, cancels it before playback, then produces a later response. The
cancelled text is not reported as played; the later text appears only after its
own signed audio source starts. The visible UI delta, TTS request, and playback
claim therefore refer to the same response.

## 5. Real interruption proof

The real-engine run used the production coordinator, local backend, resident
sherpa Zipformer, and resident sherpa VITS. A controlled 1.5-second browser
slow-consumer delay created pending delivery/playback without replacing or
faking the engine.

- Generation 1 emitted 3 real audio frames and 1 `audio_end`.
- All 3 generation-1 browser sources were scheduled and pending at barge-in.
- Cancellation stopped all 3 pending starts.
- Generation 1 emitted 0 server audio frames after cancellation.
- Generation 2 emitted 3 frames and 1 `audio_end`; its first source actually
  started.
- `oldAudioStartsAfterInterruption` was derived from recorded generation and
  timestamp observations through test completion and was `0`.

Measured results were 1,140.2 ms first partial, 87.6 ms final after explicit
speech end, 0.173 STT RTF, 174.2 ms TTS first audio, 0.093 TTS RTF, 296.1 MiB
peak worker RSS, 69.5% sustained worker CPU, and 2 manager sends / 1
cancellation.

Limitation: resident VITS completed and emitted its sentence before barge-in.
This run accurately proves cancellation of pending real delivery/playback, not
native synthesis preemption.

## 6–7. Lifecycle and production queue soak

The soak retains production `LocalVoiceBackend` and
`EngineVoiceBackendSession` queue/delivery machinery around a controlled
engine. Input accounting now charges both queued and engine-in-flight bytes
against the production limit, and output backlog uses the production delivery
queue. The focused negative regression proves combined backlog is rejected.

Before the timed conversation phase, the same command completed 500 actual
conversation socket/session lifecycle cycles:

| Lifecycle metric | Result |
| --- | ---: |
| requested / completed cycles | 500 / 500 |
| socket connections | 520 |
| stop during startup / immediate restart | 20 / 20 |
| per-cycle cleanup checks | 520 |
| lifecycle elapsed | 502,616 ms |

The timed phase then ran for 1,800,000.05 ms at six turns/minute:

| Soak metric | Result |
| --- | ---: |
| utterances / manager sends / unique sends | 180 / 180 / 180 |
| queued / pending / total input backlog | 4,480 / 640 / 5,120 bytes |
| input queue limit | 64,000 bytes |
| maximum output backlog | 18,186 bytes |
| queue overflow rejections | 0 |
| backend cancellations / stale emissions / stale client deliveries | 681 / 681 / 0 |
| initial / peak / final RSS | 155.3 / 392.6 / 159.0 MiB |
| final-half RSS slope | 0.015 MiB/min |
| RSS samples | 232 |
| active backend sessions after stop | 0 |
| orphan child PIDs | 0 |
| unhandled rejections / uncaught exceptions | 0 / 0 |

A fixture-owned child PID was observed during the run and absent afterward.
The negative unit test supplies a surviving PID and proves the child-cleanup
assertion becomes false. All 19 artifact assertions passed.

## 8. Baseline correction

The only maintained prior baseline is now `Whisper small`: 0.720 derived STT
RTF and 885 MiB derived peak RSS from the prior 11-second fixture. It was not
re-scored and no first-partial, endpoint-final, or TTS values were fabricated.
The benchmark script, generated artifacts, user documentation, design, and
this report use that label.

## Browser and verification evidence

Deterministic Chromium and Firefox each passed the built-UI conversation test
(1 test in 12.1 seconds and 1 test in 13.1 seconds). Real-engine Chromium
passed its 1 test in 18.1 seconds with the generation evidence above. Browser
launches used the development host's extracted ALSA library. WebKit remains
unrunnable on this host because required GTK/media shared libraries are absent;
it is not reported as passed or skipped.

The focused suite passed 34/34 tests. Both `pnpm check` and
`NODE_ENV=production pnpm check` passed lint, the complete Vitest suite,
TypeScript, and the production Vite build. Lint emitted only the repository's
existing React warnings. Production-bundle isolation and `git diff --check`
also passed.

## Remaining concerns

- English STT quality and real-time first-partial targets are not met.
- The pt-BR corpus is compact and single-speaker.
- Resident VITS is sentence-complete rather than engine-incremental and remains
  bounded to 12 seconds per sentence.
- Native synthesis preemption is not established; pending real
  delivery/playback cancellation is.
- WebKit and physical Safari/device coverage remain host/device blockers.
- The JFK real-engine fixture remains session-only because independent
  primary-source provenance was not established.
- No merge or deployment was performed.
