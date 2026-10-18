# Task 11 — Browser E2E, Corpus, Benchmark, Real Engine, and Soak

## Status

Task 11 was implemented from approved HEAD
`0111cec94671e94f095dd99431641f1d213524f1` without Graphify, reviewers,
merge, or deployment.

The repository now contains deterministic built-UI browser coverage, a compact
redistributable English/Brazilian Portuguese corpus, measured JSON/Markdown
benchmark tooling, a real browser/hub/resident-sherpa transport test, and a
real-time WebSocket soak harness. Raw benchmark, real-engine, and soak artifacts
remain in the session workspace.

## Strict TDD and debugging evidence

- `e2e/oracle-conversation.test.ts` was run before its fixture existed and
  failed on the missing test seam.
- `scripts/oracle-voice-benchmark.test.ts` failed because the benchmark module
  did not exist, then passed after implementation.
- `scripts/oracle-voice-soak.test.ts` failed because the soak module did not
  exist, then passed after implementation.
- The real-engine browser test first failed on its missing server fixture.
- A final real-engine requirement check failed because sustained worker CPU was
  absent from the artifact, then passed after `/proc` tick instrumentation.
- The first full `pnpm check` passed 153 Vitest files and then exposed that the
  two Playwright `*.test.ts` files were also being collected by Vitest. The
  repository test configuration now extends Vitest's default exclusions with
  `e2e/**`; the complete final Vitest suite then passed.
- Browser/server failures were isolated rather than hidden: exact VAD aliasing,
  stale release selection, origin policy, fake recorder EventTarget behavior,
  protocol frame sizing, coordinator reentrancy, endpointing, and host browser
  library failures were reproduced and corrected or recorded.
- The soak smoke test exposed origin binding, a missed WebSocket hello, backend
  callback reentrancy, and upgraded-socket shutdown ordering before the
  required run was started.

## Deterministic browser E2E

The test exercises the built React UI, `ManagerAssistant`,
`useOracleConversation`, `OracleVoiceClient`, ticket route, browser WebSocket,
coordinator, and backend transport. Test-only seams are limited to:

- an exact-match Vite alias for `@ricky0123/vad-web` only when
  `AGENTIC_REMOTE_E2E_BUILD=1`;
- browser MediaStream, AudioContext/AudioWorklet, VAD, MediaRecorder, and audio
  output fakes in `e2e/fixtures`; and
- injected fake manager/backend instances through existing `buildApp` seams.

The test proves permission denial and recovery, keyboard focus and touch,
start/stop, visible partial text, one normal Oracle user message per final
without composer echo, visibly replacing manager deltas, TTS from those same
deltas, multiple turns, barge-in, three rapid interruptions, stale generation
rejection, reconnect with a fresh stream and no replay, 390×844 layout,
privacy text, and switching back to dictation.

### Browser matrix

| Project | Result | Exact support/failure |
| --- | --- | --- |
| Chromium | PASS, 1 test, 2.5 s | Needed the existing extracted `libasound.so.2` through `LD_LIBRARY_PATH`; without it launch failed. |
| Firefox | PASS, 1 test, 3.9 s | Repository Playwright browser was downloaded; used the same extracted ALSA library. |
| WebKit | NOT RUNNABLE | Repository Playwright WebKit downloaded, but launch failed before test execution because the host lacks GTK 4, Graphene, GStreamer codec/audio/video libraries, Flite voices, Soup 3, Manette, Enchant, Secret, Hyphen, GLES, x264, WebP/AVIF/JPEG, and HarfBuzz ICU shared libraries. No system packages were installed. |

Commands:

```text
LD_LIBRARY_PATH=... pnpm playwright test e2e/oracle-conversation.test.ts --project=chromium
pnpm playwright test e2e/oracle-conversation.test.ts --project=firefox
pnpm exec playwright install firefox webkit
LD_LIBRARY_PATH=... pnpm playwright test e2e/oracle-conversation.test.ts --project=firefox
LD_LIBRARY_PATH=... pnpm playwright test e2e/oracle-conversation.test.ts --project=webkit
```

The first Firefox command recorded the absent browser executable. WebKit is
not counted as skipped or passed.

## Corpus and provenance

`fixtures/voice` is 1,781,571 bytes and contains nine 16 kHz mono PCM16 WAV
fixtures plus metadata. Four source utterances come from Google FLEURS,
CC-BY-4.0:

- dataset: <https://huggingface.co/datasets/google/fleurs>
- authors: Alexis Conneau, Min Ma, Simran Khanuja, Yu Zhang, Vera Axelrod,
  Siddharth Dalmia, Jason Riesa, Clara Rivera, and Ankur Bapna
- paper: <https://arxiv.org/abs/2205.12446>
- license: <https://creativecommons.org/licenses/by/4.0/>

The manifest records exact source archive members, metadata URLs, transcripts,
language, anonymous speaker description, derivation, duration, tags, and
SHA-256. Derived fixtures add deterministic pink/white noise, an English
two-speaker foreground/interferer mix, a spoken restart, and generated silence.
No private recording, generated Faber/Lessac audio, or nonredistributable model
output is committed.

English has distinct anonymous female and male speakers. The selected FLEURS
`pt_br` development split reports all 386 clips as male, so multi-speaker
Brazilian Portuguese quality is not claimed.

## Benchmark

The full command produced 16 measured rows:

```text
pnpm tsx scripts/oracle-voice-benchmark.ts \
  --fast-stt-dir <Zipformer directory> \
  --multilingual-stt-dir <Nemotron directory> \
  --tts-en-dir <resident LJSpeech VITS directory> \
  --tts-pt-dir <resident Faber VITS directory> \
  --output-json <session>/oracle-voice-benchmark.json \
  --output-markdown <session>/oracle-voice-benchmark.md
```

Medians below exclude silence and missing partials. WER is the mean of clean
fixtures; RSS is the maximum resident child value.

| Profile/language | Clean WER | First partial | STT RTF | TTS first audio | TTS RTF | Peak RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `fast-en` / en | 0.958 | 102 ms; only 1/5 emitted | 0.027 | 288 ms | 0.094 | 407 MiB |
| `multilingual-quality` / en | 0.704 | 872 ms; 4/5 emitted | 0.511 | 318 ms | 0.092 | 1,254 MiB |
| `multilingual-quality` / pt-BR | 0.045 | 699 ms | 0.687 | 299 ms | 0.083 | 1,212 MiB |
| prior Whisper tiny.en | not re-scored | missing | 0.720 derived | missing | missing | 885 MiB derived |

All JSON/Markdown metrics carry `measured`, `derived`, or `missing` basis
labels. CPU percent is derived from measured worker `/proc` ticks and wall
time. Fixture checksums, WAV structure, duration, and normalized references are
validated before model startup.

The quality gate is not met generally:

- Zipformer was fast but returned an empty result on four of five English
  non-silence cases.
- Nemotron's clean pt-BR WER was 0.045, including 0.000 on the long clean clip,
  but this is one anonymous male speaker and not a general Portuguese claim.
- Nemotron missed the `<0.2` CPU RTF target and exceeded the Whisper memory
  baseline.
- Warm resident TTS RTF passed. Fast English and pt-BR median first audio met
  300 ms; multilingual English missed at 318 ms.

## Real browser/hub/resident-engine proof

Command: `pnpm playwright test --config playwright.real-voice.config.ts` with
the normal production voice environment set to the session Zipformer and
resident LJSpeech VITS assets, endpointing at 3,000 ms to keep the long pause in
the JFK source inside one explicit utterance.

Result: Chromium PASS, 1 test, 9.0 s (18.6 s including build/server).

The path used the built browser UI, ticket and hub WebSocket protocol,
production coordinator/local backend, resident child, real sherpa streaming
STT, real resident sherpa VITS PCM, and a deterministic fake Oracle manager
only. It proved:

- first utterance became exactly one normal manager submission and visible
  user message;
- the visible manager replacement delta was the text sent to real VITS;
- second confirmed speech began while browser playback was active;
- generation 1 was cancelled and browser queued playback stopped;
- a second utterance submitted normally; and
- zero engine or browser old-generation audio starts occurred afterward.

Measured artifact:

| Metric | Result |
| --- | ---: |
| first partial | 1,446.2 ms |
| final after explicit speech end | 96.3 ms |
| STT RTF | 0.198 |
| manager delta to first audio | 223.6 ms |
| TTS RTF | 0.108 |
| peak child RSS | 288.5 MiB |
| sustained child CPU | 77.0% |
| manager sends / cancellations | 2 / 1 |
| old audio after cancellation | 0 |

The first-partial target missed. Finalization, short warm TTS first audio, both
RTF targets, memory boundedness, and interruption correctness passed in this
run. The session-only JFK WAV had SHA-256
`59dfb9a4acb36fe2a2affc14bacbee2920ff435cb13cc314a08c13f66ba7860e`.
It was not committed because an independent primary-source provenance URL was
not established during Task 11.

## Soak

The required command writes raw evidence only to:

`/home/lcavalcanti/.copilot/session-state/5453f433-54c9-4c50-95bb-92097e6807ff/files/oracle-voice-soak.json`

The harness uses a real Fastify hub, ticket exchange, WebSocket protocol,
coordinator, manager event stream, protocol PCM, speech start/end, manager
delta/TTS path, and real elapsed time. Its deterministic injected backend
emits stale output after every cancellation so the coordinator/client boundary
must reject it. RSS is sampled every 10 seconds and the final-half linear slope
is calculated in MiB/minute.

Command:

```text
pnpm tsx scripts/oracle-voice-soak.ts \
  --minutes 30 --turns-per-minute 6 --rapid-start-stop 500 \
  --output <session>/oracle-voice-soak.json
```

Result: PASS after 1,800,000.95 ms of timed conversation.

| Metric | Result |
| --- | ---: |
| utterances / manager sends / unique sends | 680 / 680 / 680 |
| manager / backend cancellations | 500 / 500 |
| stale backend emissions / client deliveries | 500 / 0 |
| maximum queue / limit | 640 / 64,000 bytes |
| initial / peak / final RSS | 152.0 / 169.4 / 127.5 MiB |
| final-half RSS slope | 0.091 MiB/min |
| RSS samples | 182 |
| active backend sessions after stop | 0 |
| orphan child PIDs | 0 |
| unhandled rejections / uncaught exceptions | 0 / 0 |

All eleven assertions passed, including real elapsed duration, exact and unique
manager sends, bounded queue and RSS slope, stale rejection, closed socket,
backend cleanup, child cleanup, and empty asynchronous error lists.

## Verification

```text
All Oracle voice/Task 11 tests:  17 files, 254 tests passed
Full Vitest suite:               151 passed, 1 skipped file
                                 4,702 passed, 1 skipped test
Deterministic Chromium project:  3 passed, including Oracle Conversation
Deterministic Firefox:          1 passed
Deterministic WebKit:           host libraries missing; no test executed
Real-engine Chromium:           1 passed
Lint:                           passed; pre-existing React warnings only
TypeScript + production build:  passed
```

Final commands included `pnpm test`, `pnpm lint`, `pnpm build`, the targeted
17-file Oracle voice Vitest command, both supported deterministic browser
projects, the real-engine Playwright configuration, the 16-row benchmark, and
the required 30-minute soak. The ordinary production bundle contains no
`__oracleVoiceE2E` or deterministic-test marker.

## Limitations and concerns

- WebKit is an explicit host dependency blocker, not a passing or skipped
  browser family.
- The current resident VITS callback completes a whole sentence before the
  worker emits protocol frames; it is sentence-level early playback, not
  engine-incremental audio.
- Synthesis is capped at 12 seconds per sentence.
- General English quality is not established for either measured profile.
- Brazilian Portuguese evidence is compact and single-speaker.
- Faber remains research-only ancestry; no Faber-derived audio is committed.
- The real JFK source stayed session-only because primary-source URL
  provenance was not independently completed.
- No merge or deployment was performed.
