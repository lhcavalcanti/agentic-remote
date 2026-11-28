# Oracle voice asset notices

Agentic Remote remains MIT-licensed. STT, TTS, and transcription models are
not bundled into the application release. `voice-install` prints the notices below before network
access, downloads only checksum-pinned files from
`config/oracle-voice-profiles.json`, and writes the selected profile's notices
beside the installed assets.

The browser release does bundle `@ricky0123/vad-web`, Silero VAD, and
`onnxruntime-web` runtime assets. Every production build emits their
redistribution notices and ONNX Runtime's pinned upstream third-party notice
inventory at `oracle-voice-assets/THIRD_PARTY_NOTICES.txt`; the checked-in
sources are [`oracle-voice-browser.txt`](oracle-voice-browser.txt) and
[`onnxruntime-1.24.2-third-party-notices.txt`](onnxruntime-1.24.2-third-party-notices.txt).
The latter is the unmodified file from ONNX Runtime tag `v1.24.2` (SHA-256
`0e07b95f3a8d6230037707c5c4a2b554d12c4cb67369669ac255635528ffcee2`).

| Asset | Upstream terms and provenance |
| --- | --- |
| sherpa-onnx Zipformer English 20M archive | Apache-2.0: <https://www.apache.org/licenses/LICENSE-2.0> |
| NVIDIA Nemotron 3.5 model converted for sherpa-onnx | OpenMDW-1.1: <https://openmdw.ai/license/1-1/> |
| sherpa-onnx runtime/VITS integration | Apache-2.0 at pinned runtime tag `v1.13.8`: <https://github.com/k2-fsa/sherpa-onnx/blob/v1.13.8/LICENSE> |
| eSpeak NG data in the VITS archives | GPL-3.0-or-later: <https://github.com/espeak-ng/espeak-ng/blob/1.52.0/COPYING> |
| `en_US-ljspeech-medium` | Pinned model card says the LJSpeech dataset is public domain and the voice was trained from scratch: <https://huggingface.co/rhasspy/piper-voices/raw/c10ece1aade47bb51c153c893d14e5bf8e5b7117/en/en_US/ljspeech/medium/MODEL_CARD> |
| `pt_BR-faber-medium` | Pinned model card says its direct dataset is CC0 and that the voice is fine-tuned from U.S. English Lessac: <https://huggingface.co/rhasspy/piper-voices/raw/c10ece1aade47bb51c153c893d14e5bf8e5b7117/pt/pt_BR/faber/medium/MODEL_CARD> |
| Lessac base voice/training material | Research-only Lessac/Voice Factory terms: <https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html> |
| Moondream Parakeet Ultra, converted for sherpa-onnx (`parakeet-ultra`) | CC-BY-4.0: <https://huggingface.co/moondream/parakeet-ultra> |
| NVIDIA `parakeet-tdt-0.6b-v3`, Parakeet Ultra's base model | CC-BY-4.0: <https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3> |

`fast-en` uses the pinned LJSpeech voice rather than Lessac. The model card's
dataset and training statements are provenance evidence, not a legal assurance
about every runtime component or use.

`parakeet-ultra` is a transcription profile for dictation, not a Conversation
profile. Moondream post-trained NVIDIA's Parakeet TDT 0.6B v3 into Parakeet
Ultra, and the sherpa-onnx project exported it; both models are CC-BY-4.0,
which requires crediting Moondream and NVIDIA, linking the license, and stating
changes when redistributing them. The installed `NOTICES.txt` records these
notices.

`multilingual-quality` is deliberately marked **research-only**. Its Faber
voice is fine-tuned from Lessac, so the direct CC0 dataset statement does not
make the full model ancestry generally permissive. Installation refuses all
network access unless the operator supplies:

```bash
agentic-remote voice-install multilingual-quality --accept-research-only
```

The flag records only an explicit noninteractive acknowledgement that the
notices were shown. It does not grant rights or provide a commercial-use
assurance.

The shipped VITS archives include eSpeak NG data and run through sherpa-onnx.
The optional legacy external-Piper adapter remains available for manually
configured installations and has separate runtime obligations. Anyone
redistributing assets must review and satisfy the actual upstream terms,
required notices, and source obligations rather than relying on this summary.

OpenMDW-1.1 requires a distributed copy of the agreement and applicable
copyright/origin notices. An installer URL alone is not a substitute when
redistributing the model.

This document records upstream statements and is not legal advice.
