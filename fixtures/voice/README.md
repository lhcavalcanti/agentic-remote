# Oracle voice benchmark fixtures

This compact corpus contains four unmodified FLEURS utterances plus deterministic
derived cases for noise, background speech, an interrupted false start and
restart, and silence.
FLEURS is licensed **CC-BY-4.0**. Cite:

> Alexis Conneau et al., “FLEURS: Few-shot Learning Evaluation of Universal
> Representations of Speech,” 2022, <https://arxiv.org/abs/2205.12446>.

Dataset and license: <https://huggingface.co/datasets/google/fleurs> and
<https://creativecommons.org/licenses/by/4.0/>. Speaker identities are not
published; the manifest records the dataset split and reported gender instead.
No private recording or Faber/Lessac-derived audio is present.

`manifest.json` is authoritative for every fixture’s source archive member,
expected and normalized transcript, language, anonymous speaker description,
derivation, duration, tags, and SHA-256 checksum. The English foreground clips
include distinct female and male speakers. The FLEURS `pt_br` development split
used here reports all 386 clips as male, so this corpus does not claim
multi-speaker Brazilian Portuguese coverage.

| Fixture | Language | Coverage | Duration |
| --- | --- | --- | ---: |
| `en-short-female-clean.wav` | en | clean, short, female | 4.14 s |
| `en-long-male-clean.wav` | en | clean, long, male | 11.46 s |
| `pt-BR-short-male-clean.wav` | pt-BR | clean, short | 5.52 s |
| `pt-BR-long-male-clean.wav` | pt-BR | clean, long | 12.90 s |
| `en-short-female-noisy.wav` | en | deterministic pink noise | 4.14 s |
| `pt-BR-short-male-noisy.wav` | pt-BR | deterministic white noise | 5.52 s |
| `en-short-background-speech.wav` | en | two-speaker foreground/interferer mix | 4.14 s |
| `en-false-start.wav` | en | interrupted 1.10 s fragment, pause, complete restart | 5.49 s |
| `silence-2s.wav` | und | generated digital silence | 2.00 s |

All files are 16 kHz mono PCM16 WAV. Raw source archives remain outside the
repository in the Task 11 session artifacts.

`parakeet-result-pt-BR-short.json` is the unmodified `getResult()` of
`sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra-int8` (sherpa-onnx-node 1.13.8,
`nemo_transducer`, greedy search, 128 features, 4 CPU threads, no padding) for
`pt-BR-short-male-clean.wav`. Live dictation's word agreement tests read its
tokens and per-token `timestamps` and `durations`, both in seconds. The model
heard the first word as "Aquí"; the fixture keeps that.
