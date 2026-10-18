# Task 9 report: Oracle voice packaging and review hardening

## Result

Task 9 now provides explicit disabled-by-default profile installation,
configuration preservation, current operator/normative documentation, and the
single minor release bump from `1.17.2` to `1.18.0`. The prior-review
hardening is integrated into the same worktree without changing Graphify.

## Prior-review fixes

- A hub configured for a paired voice computer no longer validates or loads
  hub-local STT/TTS paths. Nodes and hub-local mode still validate their own
  complete local configuration.
- Shipped profiles use one resident sherpa-onnx-node 1.13.8 VITS instance in
  the isolated voice child. The external Piper process remains only as a
  manually configured compatibility adapter.
- Sherpa progress samples are copied into one fixed-capacity 12-second sentence
  buffer and are not delivered until `generateAsync` completes. The cumulative
  callback total is validated before any audio escapes; when progress supplied
  samples, the duplicate `result.samples` buffer is ignored. The validated
  sentence is then split into encoded playback frames at or below the backend's
  32 KiB limit with monotonic sequences. Generation/delivery cancellation,
  overflow, and delivery failure suppress `audio_end`.
- Worker and browser now share a 12-second maximum playable segment. At
  22,050 Hz that is 264,600 samples, so the measured LJSpeech sentence
  (176,469 samples, 8.003 seconds) and Faber sentence (148,224 samples,
  6.722 seconds) pass end to end. A synchronous whole-sentence callback above
  the limit is rejected before any audio frame or `audio_end` is emitted.
  Protocol backpressure remains separate and unchanged: frames are at most
  32 KiB, the default backend/coordinator queue is 64,000 bytes, browser
  WebSocket buffering uses that advertised queue limit, and playback still
  caps scheduled sources at 512.
- Archive decoding is selected exactly from the manifest (`r|gz` or `r|bz2`).
  Headers are consumed one at a time; the installer rejects an entry before
  extraction when its count or declared expanded size would cross a pin.
  Compression mismatch, corrupt streams, sparse files, links, special entries,
  unsafe/duplicate paths, and path-type conflicts fail closed. Failed staging
  is removed and the prior active profile remains unchanged.
- Voice profile cleanup is publication-state aware. Staging or an unactivated
  final directory remains cleanup-owned through final rename and marker
  validation. Before the atomic active-symlink replacement, final-directory
  cleanup is disarmed while the EXIT trap remains responsible for a temporary
  activation link. Exit or SIGTERM before replacement leaves the previous
  complete profile active; exit or SIGTERM after replacement retains the new
  complete target. Deterministic tests cover both fault types before and after
  final rename and symlink replacement.

## Resident VITS deviation and measurement

The original plan used “streamed TTS” to describe both early sentence playback
and engine-incremental output. The shipped design deliberately keeps
sentence-level early playback: stable completed sentences from Oracle's
replacement stream are synthesized before the full reply finishes. It does
not claim that sherpa VITS emits audio incrementally within a sentence.

A warmed two-thread probe used the exact pinned packaged voices and
`sherpa-onnx-node@1.13.8`:

| Voice | Synthesis | Generated audio | RTF | Progress behavior |
| --- | ---: | ---: | ---: | --- |
| `en_US-ljspeech-medium` | 711.167 ms | 8.003 s | 0.089 | one `progress=1` callback with all 176,469 samples, 0.069 ms before resolution |
| `pt_BR-faber-medium` | 610.061 ms | 6.722 s | 0.091 | one `progress=1` callback with all 148,224 samples, 0.048 ms before resolution |

This meets the `<0.2` synthesis RTF target for these phrases but misses the
300 ms warm first-audio target. Sentence audio begins only after full local
synthesis completes: 711 ms for the measured LJSpeech sentence and 610 ms for
the measured Faber sentence. Transport chunking then makes the validated
whole-sentence buffer protocol-safe; it does not create true
engine-incremental synthesis. There is no speculative clause splitter: current
evidence shows both packaged measured sentences fit the coherent 12-second
bound. Longer speakable sentences fail synthesis explicitly while preserving
Oracle's text reply.

## TDD evidence

### Original Task 9 RED/GREEN

Before the packaging implementation:

```text
pnpm vitest run server/oracle-voice-assets.test.ts server/promotion-setup.test.ts
Test Files 2 failed
Tests 11 failed | 9 passed
```

After implementing the manifest, installer, and setup preservation:

```text
pnpm vitest run server/oracle-voice-assets.test.ts \
  server/promotion-setup.test.ts server/version-policy.test.ts
Test Files 3 passed
Tests 22 passed
```

### Important-finding RED

The realistic resident-VITS and archive regressions failed before the fixes:

```text
pnpm vitest run server/oracle-voice-child.test.ts \
  server/oracle-voice-assets.test.ts
Test Files 2 failed
Tests 7 failed | 56 passed
```

The failures proved that multi-second callback/result buffers were emitted as
one oversized event, the backend integration never completed, mislabeled
compression was accepted, all archive headers were materialized before count
rejection, and a declared dense over-expansion reached corrupt payload parsing.

### Important-finding GREEN

```text
pnpm vitest run server/oracle-voice-child.test.ts \
  server/oracle-voice-assets.test.ts
Test Files 2 passed
Tests 63 passed
```

The child tests reconstruct exact PCM from multi-second 22,050 Hz callbacks and
fallback results. The in-process child/parent integration passes the same
output through `EngineVoiceBackendSession`, verifies every encoded frame is at
most 32 KiB and ordered, reconstructs exact PCM length/content, and observes
`audio_end`. Overflow and cancellation tests verify no terminal event follows
failure.

### Remaining Important-finding RED/GREEN

The final review regressions failed before these fixes:

```text
server/oracle-voice-child.test.ts:
2 failed | 1 passed
- 176,469-sample LJSpeech output never reached audio_end
- a synchronous over-limit callback emitted partial audio

src/oracle-voice/playback.test.ts + src/oracle-voice/client.test.ts:
2 failed
- measured LJSpeech exceeded the eight-second browser bound
- the client did not establish a shared playable-segment bound

server/oracle-voice-assets.test.ts:
8 failed
- exit and SIGTERM fault injection at four publication stages was ignored
```

After implementation:

```text
pnpm vitest run server/oracle-voice-child.test.ts \
  server/oracle-voice-session.test.ts \
  src/oracle-voice/playback.test.ts \
  src/oracle-voice/client.test.ts \
  server/oracle-voice-assets.test.ts
Test Files 5 passed
Tests 121 passed
```

The measured LJSpeech and Faber cases reconstruct every sample in order through
the worker, child/parent engine, `EngineVoiceBackendSession`, protocol-safe
frames, and browser playback. The over-limit callback produces zero audio
frames and zero `audio_end`. Installer fault tests assert that `active` always
resolves to a complete existing profile, staging and activation links do not
leak, and concurrent same/conflicting-digest behavior remains covered.

### Remaining Important-finding RED/GREEN

The cumulative-overflow regression used two progress callbacks whose individual
sizes fit the limit but whose combined size exceeded 12 seconds. Before the
fix, the first callback's audio frames escaped while `generateAsync` was still
running:

```text
pnpm vitest run server/oracle-voice-child.test.ts \
  -t "rejects cumulative sherpa VITS callback overflow before delivering any audio"
Test Files 1 failed
Tests 1 failed | 40 skipped
```

After buffering and validating the full sentence, the same test passes with
zero audio and zero `audio_end`. A second regression cancels while the final
frame delivery is blocked and verifies that cancellation still suppresses
`audio_end`:

```text
pnpm vitest run server/oracle-voice-child.test.ts
Test Files 1 passed
Tests 42 passed
```

## Exact current asset and provenance facts

All network assets are checksum-pinned in
`config/oracle-voice-profiles.json`. Voice assets are downloaded explicitly;
they are not bundled with the application release.

| Asset | Bytes | Expanded bytes / entries | SHA-256 | Upstream and terms |
| --- | ---: | ---: | --- | --- |
| Zipformer English 20M | 127,887,156 | 136,398,588 / 15 | `9c559283e8498d3fe95913c79ca1cb454bb26281ac2b102b41306c7d752765d9` | k2-fsa ASR release; Apache-2.0 |
| LJSpeech VITS archive | 67,169,893 | 81,529,587 / 397 | `3dfb4b759d8be032a4903a9538d128b0fda2a06ab1de6cbc2d93a97e2dd83dba` | k2-fsa TTS release; Piper model card says public-domain LJSpeech, trained from scratch; archive includes GPL-3.0-or-later eSpeak NG data |
| LJSpeech model card | 517 | file | `fbee1529c89d36b3fe76d7e9f3f832dce17f44900a52d76a9bda735654766b4d` | immutable Hugging Face revision `c10ece1aade47bb51c153c893d14e5bf8e5b7117` |
| Nemotron 3.5 0.6B 160 ms int8 | 475,273,363 | 684,574,987 / 16 | `a81909a1780d84cff16d73c15e13e67d9d81d8839faf14870d507d8499f7a61a` | k2-fsa ASR release; OpenMDW-1.1 |
| Faber VITS archive | 67,183,065 | 81,199,149 / 397 | `7add3f923ad6bc25ca8a192805fd1a64d1b3893e4611c4a9719545a825039a83` | k2-fsa TTS release; direct dataset stated CC0, but model is fine-tuned from research-only Lessac; archive includes GPL-3.0-or-later eSpeak NG data |
| Faber model card | 279 | file | `01f1a5bcfd0538782726059ae407eae9c2dd1b5b35f7298fd53a68de91afe563` | same immutable Hugging Face revision |

Current profile totals:

- `fast-en`: 217,928,692 expanded bytes, 415 staged entries.
- `multilingual-quality`: 765,774,415 expanded bytes, 416 staged entries,
  explicitly marked research-only.

The sherpa runtime/VITS integration is Apache-2.0 at `v1.13.8`. The model
license, voice provenance, and eSpeak NG runtime-data terms remain separate.
The installer displays the profile notices before network access.

## Verification

Remaining-finding focused gate:

```text
pnpm vitest run server/oracle-voice-child.test.ts \
  server/oracle-voice-session.test.ts \
  src/oracle-voice/playback.test.ts \
  src/oracle-voice/client.test.ts \
  server/oracle-voice-assets.test.ts \
  server/oracle-voice-config.test.ts \
  server/app-build.test.ts \
  server/promotion-setup.test.ts \
  server/version-policy.test.ts
Test Files 9 passed
Tests 168 passed
```

Fresh static/build/full gate:

```text
pnpm exec tsc -b --pretty false
exit 0

pnpm lint
exit 0 (repository baseline warnings only)

pnpm build
exit 0; 4,338 modules transformed

NODE_ENV=production pnpm check
exit 0; lint, full Vitest suite, and production build completed
```

Review-fix focused gate:

```text
pnpm vitest run server/oracle-voice-child.test.ts \
  server/oracle-voice-session.test.ts \
  src/oracle-voice/playback.test.ts \
  src/oracle-voice/client.test.ts \
  server/oracle-voice-assets.test.ts
Test Files 5 passed
Tests 121 passed
```

All Task 9 packaging/version tests:

```text
pnpm vitest run server/oracle-voice-assets.test.ts \
  server/promotion-setup.test.ts \
  server/version-policy.test.ts
Test Files 3 passed
Tests 46 passed
```

Static and build gates:

```text
pnpm exec tsc -b --pretty false
exit 0

pnpm lint
exit 0 (repository baseline warnings only)

pnpm build
exit 0; 4,338 modules transformed
```

The broader prior Task 9 focused gate also remains recorded:

```text
pnpm vitest run server/oracle-voice-child.test.ts \
  server/oracle-voice-session.test.ts \
  server/oracle-voice-assets.test.ts \
  server/oracle-voice-config.test.ts \
  server/app-build.test.ts \
  server/promotion-setup.test.ts \
  server/version-policy.test.ts
Test Files 7 passed
Tests 125 passed
```

Full suite:

```text
pnpm test
Test Files 147 passed | 1 skipped
Tests 4645 passed | 1 skipped
Duration 1800.62 s
```

Production-environment aggregate gate:

```text
NODE_ENV=production pnpm check
lint: exit 0 (repository baseline warnings only)
Test Files 147 passed | 1 skipped
Tests 4645 passed | 1 skipped
build: exit 0; 4,338 modules transformed
```

## Remaining concerns

- True engine-incremental TTS first audio is still unavailable with the
  measured sherpa-onnx-node 1.13.8 VITS callback behavior; the 300 ms target
  remains unmet. Playback starts only after full sentence synthesis and
  validation (610/711 ms in the measured packaged-voice probes).
- One synthesized sentence cannot exceed 12 seconds at its native sample rate.
  Longer sentences are not partially played and currently require a shorter
  Oracle sentence rather than automatic clause splitting.
- Nemotron measured 0.58 CPU RTF on the development host, missing the `<0.2`
  STT target. The fast English sample missed initial words.
- No Portuguese ASR corpus, perceptual voice-quality study, browser
  end-to-end latency/barge-in result, isolated resident-worker RSS result, or
  30-minute soak exists yet.
- `multilingual-quality` remains research-only because Faber descends from
  Lessac; asset redistribution must separately satisfy OpenMDW, GPL/eSpeak NG,
  and model/provenance obligations.
- Graphify remains unchanged by explicit instruction.
