# Task 9 report: Oracle voice packaging

## Result

Implemented explicit, disabled-by-default Oracle voice profile installation,
configuration preservation, operator/normative documentation, and the single
minor release bump from `1.17.2` to `1.18.0`. No Graphify files were changed.

## TDD evidence

### RED

Before production implementation:

```text
pnpm vitest run server/oracle-voice-assets.test.ts server/promotion-setup.test.ts
Test Files 2 failed
Tests 11 failed | 9 passed
```

Failures covered the absent manifest and `voice-install` command plus setup's
missing Oracle voice environment preservation.

### GREEN

```text
pnpm vitest run server/oracle-voice-assets.test.ts server/promotion-setup.test.ts server/version-policy.test.ts
Test Files 3 passed
Tests 22 passed
```

The first full-suite run exposed one test-harness dependency: extracted
`setup_service` did not include the newly called
`append_preserved_voice_configuration`. Adding that dependency to
`server/release-publication.test.ts` restored its 41 tests.

Final verification:

```text
pnpm test
Test Files 147 passed | 1 skipped
Tests 4608 passed | 1 skipped

pnpm lint
exit 0 (pre-existing warnings only)

pnpm build
tsc -b and vite build completed successfully
```

## Verified asset provenance

All downloaded-byte evidence is retained outside Git under the session
`voice-benchmark/asset-verification` and `voice-benchmark/realtime-candidates`
directories. `stat` and `sha256sum` were rerun against those files.

| Asset | Exact upstream URL | Bytes | SHA-256 | License |
| --- | --- | ---: | --- | --- |
| sherpa Zipformer English 20M | <https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-streaming-zipformer-en-20M-2023-02-17.tar.bz2> | 127887156 | `9c559283e8498d3fe95913c79ca1cb454bb26281ac2b102b41306c7d752765d9` | Apache-2.0, <https://www.apache.org/licenses/LICENSE-2.0> |
| sherpa Nemotron 3.5 0.6B 160 ms int8 | <https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-160ms-int8-2026-06-11.tar.bz2> | 475273363 | `a81909a1780d84cff16d73c15e13e67d9d81d8839faf14870d507d8499f7a61a` | OpenMDW-1.1, <https://openmdw.ai/license/1-1/> |
| Piper Linux x86-64 `2023.11.14-2` | <https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz> | 26460462 | `a50cb45f355b7af1f6d758c1b360717877ba0a398cc8cbe6d2a7a3a26e225992` | MIT source, <https://github.com/rhasspy/piper/blob/2023.11.14-2/LICENSE.md>; archive includes eSpeak NG GPL-3.0-or-later components, <https://github.com/espeak-ng/espeak-ng/blob/1.52.0/COPYING> |
| Lessac medium ONNX | <https://huggingface.co/rhasspy/piper-voices/resolve/c10ece1aade47bb51c153c893d14e5bf8e5b7117/en/en_US/lessac/medium/en_US-lessac-medium.onnx> | 63201294 | `5efe09e69902187827af646e1a6e9d269dee769f9877d17b16b1b46eeaaf019f` | Lessac/Voice Factory research-only licence, <https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html> |
| Lessac medium config | <https://huggingface.co/rhasspy/piper-voices/resolve/c10ece1aade47bb51c153c893d14e5bf8e5b7117/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json> | 4885 | `efe19c417bed055f2d69908248c6ba650fa135bc868b0e6abb3da181dab690a0` | Same Lessac/Voice Factory licence |
| Faber medium ONNX | <https://huggingface.co/rhasspy/piper-voices/resolve/c10ece1aade47bb51c153c893d14e5bf8e5b7117/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx> | 63201294 | `858555e3a064209c57088fe6bd70c4c3dc54d03eaa00c45d5ecaf43a33f95aa7` | CC0-1.0, <https://creativecommons.org/publicdomain/zero/1.0/legalcode.en> |
| Faber medium config | <https://huggingface.co/rhasspy/piper-voices/resolve/c10ece1aade47bb51c153c893d14e5bf8e5b7117/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx.json> | 4855 | `7e694de195ae3fc36dd732c445eb04fb49b649854893cb5506b978f0d50a1d6f` | CC0-1.0 |

GitHub release metadata and the immutable Hugging Face revision above were used
as the primary asset sources. The downloaded Piper binary successfully
synthesized smoke phrases with both pinned voice/config pairs.

## Profiles

- `fast-en`: streaming sherpa Zipformer English 20M int8, one thread, English,
  Piper standalone runtime, and Lessac medium. Total pinned download:
  217,553,797 bytes.
- `multilingual-quality`: Nemotron 3.5 FastConformer-RNNT 0.6B 160 ms int8,
  four threads, configured for `pt-BR`, Piper standalone runtime, and Faber
  medium pt-BR. Total pinned download: 564,939,974 bytes.

The manifest contains no default or automatic profile and supports only the
verified Linux x86-64 runtime asset.

## Files

Created:

- `config/oracle-voice-profiles.json`
- `docs/oracle-conversation.md`
- `docs/licenses/oracle-voice.md`
- `server/oracle-voice-assets.test.ts`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-9-report.md`

Modified:

- `bin/agentic-remote`
- `README.md`
- `docs/app-spec.md`
- `docs/architecture.md`
- `docs/design/session-manager.md`
- `server/promotion-setup.test.ts`
- `server/release-publication.test.ts`
- `package.json`
- `shell/package.json`
- `shell/src-tauri/tauri.conf.json`
- `shell/src-tauri/Cargo.toml`
- `shell/src-tauri/Cargo.lock`
- `shell/README.md`

## Self-review

- Installation stages beneath the configured data directory, prints notices
  before network access, checks byte count and SHA-256 before use, rejects
  parent/absolute archive paths and unsafe links, removes failed staging, and
  switches the active symlink atomically.
- A failed new install does not change the prior active profile. An identical
  installed version reactivates without downloading; conflicting same-version
  content fails closed.
- Setup preserves `AGENTIC_REMOTE_ORACLE_VOICE` and every existing/exported
  `AGENTIC_REMOTE_VOICE_*` value in the mode-`0600` environment file, does not
  download models, and does not print preserved values.
- Documentation distinguishes measured development evidence from pending Task
  11 browser, corpus, latency, quality, barge-in, and soak validation.

## Concerns

- Lessac's upstream training-material licence is research-only and is not a
  general commercial-use grant.
- The downloaded standalone Piper archive includes GPL eSpeak NG components;
  redistribution may require GPL notices and corresponding source obligations.
- Nemotron measured 0.58 CPU RTF on the development host, missing the design's
  `<0.2` target. The fast English sample missed initial words. Neither profile
  has Portuguese ASR quality or browser end-to-end evidence yet.
- The current configuration loader validates a local profile even when a paired
  node is selected, so the same configured profile must currently exist on the
  hub and node.
- Graphify remains at its pre-Task-9 version by instruction; Task 12 owns the
  single graph refresh.
