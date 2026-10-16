# Oracle Conversation mode

## Status

Approved for implementation behind a disabled-by-default feature flag. This
design implements #400 on top of #398. It does not replace Oracle dictation or
the upload-based Whisper transcription path.

## Goals

Conversation mode lets a person speak naturally with Oracle while keeping
microphone audio, speech recognition, and speech synthesis on computers they
control. Copilot language-model inference remains remote and the UI says so.

The first production profile targets CPU-only Linux while keeping protocol and
configuration boundaries portable to macOS and Windows. It must:

- stream 16 kHz mono PCM without recording whole utterances to files;
- show partial transcripts, but submit only one finalized transcript;
- begin speaking stable parts of Oracle's streamed reply;
- support tentative ducking and confirmed barge-in;
- reject stale work after cancellation, reconnect, or a newer turn;
- preserve dictation and typed-message fallbacks;
- stay bounded under slow clients, malformed input, and network loss.

## Measured constraints

Measurements were taken on the development host, a six-core Intel Xeon W-2235.
They are implementation evidence, not promises for other hardware.

| Engine and model | CPU result | Peak RSS | Decision |
|---|---:|---:|---|
| Current Whisper small upload path | 7.96 s median for 11 s audio; 0.72 RTF | 885 MiB | Keep as compatibility fallback |
| sherpa Zipformer English 20M int8 | 0.40 s for 11 s audio; 0.036 RTF | 99 MiB | Fast English profile, subject to corpus quality gate |
| sherpa x-asr zh/en punctuation int8 | 1.10 s for 11 s audio; 0.10 RTF | 275 MiB | Quality reference, not a streaming profile |
| sherpa Nemotron 3.5 multilingual 0.6B int8, 4 threads | 6.39 s compute for 11 s audio; 0.58 RTF | 986 MiB | Explicit multilingual quality profile, not the low-resource default |
| Piper 1.8 Lessac medium | 131 ms first chunk; 0.029 RTF | 239 MiB | Preferred external streaming TTS sidecar |
| sherpa Kitten nano int8, 4 threads | 508-680 ms first audio for short segments; 0.29-0.64 RTF | 168-192 MiB | Permissive fallback, misses the latency target |

Nemotron 3.5 accurately transcribed the English benchmark, supports 40
locales including `pt-BR`, and emits punctuation, but does not meet the
requested `<0.2` CPU RTF target on this host. Conversation mode therefore does
not silently select one universal model. Operators choose an explicit profile,
and the capability response reports its language and resource class.

## Trust and privacy boundary

The browser captures microphone audio and runs Silero VAD locally. PCM travels
only to the configured Agentic Remote hub and, when selected, one paired node.
The selected computer performs STT and TTS locally. Neither raw audio nor
transcripts are written to disk by Conversation mode.

Final text is sent to Oracle through its existing manager-agent API. Oracle's
Copilot model is remote, so final transcripts and Oracle context leave the
local network under the existing Copilot trust boundary. The UI must not call
the complete experience "offline."

The browser-to-hub socket uses a short-lived, single-use ticket minted by a
same-origin REST request. Existing Host and Origin policy protects both the
ticket route and WebSocket upgrade. Hub-to-node sockets use the paired
computer's bearer token and the existing timing-safe verification. Tickets do
not create a new account system; they bind a voice stream to an allowed
same-origin browser session and prevent an unticketed upgrade.

## Components

### Shared protocol

`shared/oracle-voice.ts` owns versioned control messages, capabilities, limits,
generation IDs, sequence numbers, and binary PCM framing. JSON is used only
for low-frequency control and transcript events. Audio uses fixed binary
headers and signed 16-bit little-endian samples.

Every control message carries a protocol version and stream ID. Every audio
frame carries a direction, generation, sequence, sample rate, and sample
count. Parsers reject unknown versions, impossible lengths, unsupported sample
rates, duplicate or out-of-order frames, and frames above the configured
limit.

### Browser client

`@ricky0123/vad-web` supplies local Silero VAD, 16 kHz frames, and an
AudioWorklet capture path. Model, ONNX Runtime, and worklet assets are served
from the Agentic Remote origin; no CDN or runtime model download is allowed.
Conversation mode refuses to start without AudioWorklet support and points to
dictation instead of silently falling back to ScriptProcessor.

The browser client owns:

- microphone permission and track lifetime;
- a bounded pre-roll ring and bounded outbound frame queue;
- reconnect with a fresh generation and no audio replay;
- partial transcript display;
- streamed PCM playback through a separate `AudioContext`;
- bounded playback scheduling and slow-consumer rejection;
- immediate gain reduction on tentative speech;
- source cancellation and queue clearing on confirmed speech.

Closing Oracle, stopping Conversation mode, page teardown, or a fatal error
stops microphone tracks, closes audio contexts and sockets, and clears timers
and queues.

### Hub coordinator

The hub exposes:

- `GET /api/oracle-voice/capabilities`;
- `POST /api/oracle-voice/tickets`;
- `GET /api/oracle-voice?ticket=...` as a WebSocket upgrade.

One active Conversation-mode socket is allowed per hub initially. A second
start receives a busy response rather than mixing microphones or Oracle
generations.

The coordinator:

- chooses the local computer or configured paired node;
- relays PCM to that computer's voice backend;
- treats partial STT as display-only;
- deduplicates finalized utterance IDs and invokes `ManagerAgent.send` once;
- watches `manager.delta` replacement snapshots;
- extracts only completed, speakable sentence segments;
- requests TTS for each segment in order;
- cancels Oracle before accepting an interrupting final transcript;
- drops events whose stream or generation is no longer current.

The coordinator never reconstructs audio recordings and never persists voice
state. A hub restart ends the voice stream explicitly; the browser may
reconnect as a new stream.

### Node voice backend

Both hub and node roles can own speech compute. The node exposes an
authenticated `/node-api/oracle-voice` WebSocket. A local backend uses the same
session implementation without network relay.

The backend runs native inference in an isolated child process. A native crash
or malformed model cannot terminate the Agentic Remote server. The child stays
warm, creates one recognizer stream per utterance, emits partial and final
transcripts, and runs one TTS generation at a time. Its parent enforces:

- maximum frame size, audio seconds, queue bytes, and utterance duration;
- monotonic generation and sequence ordering;
- worker startup, heartbeat, utterance, and synthesis timeouts;
- cancellation and process termination on shutdown;
- explicit unavailable/error events when configuration or models fail.

The first implementation supports sherpa-onnx streaming transducer models for
STT and an external Piper process for raw PCM TTS. Engine interfaces stay
small enough to use deterministic fakes in tests. Piper is never linked,
bundled, or downloaded implicitly.

## Configuration

Conversation mode is unavailable unless
`AGENTIC_REMOTE_ORACLE_VOICE=on`. Configuration is preserved by
`agentic-remote setup` but remains opt-in.

| Variable | Meaning |
|---|---|
| `AGENTIC_REMOTE_ORACLE_VOICE` | `on` enables the local voice backend |
| `AGENTIC_REMOTE_VOICE_COMPUTER` | paired computer name; blank means hub |
| `AGENTIC_REMOTE_VOICE_STT_MODEL_DIR` | explicit sherpa model directory |
| `AGENTIC_REMOTE_VOICE_STT_PROFILE` | `zipformer` or `nemotron` |
| `AGENTIC_REMOTE_VOICE_LANGUAGE` | model-supported language, such as `en`, `pt-BR`, or `auto` |
| `AGENTIC_REMOTE_VOICE_THREADS` | bounded CPU thread count |
| `AGENTIC_REMOTE_VOICE_ENDPOINT_MS` | trailing-silence endpoint target |
| `AGENTIC_REMOTE_VOICE_TTS_BIN` | Piper executable path |
| `AGENTIC_REMOTE_VOICE_TTS_MODEL` | Piper ONNX voice path |
| `AGENTIC_REMOTE_VOICE_TTS_CONFIG` | Piper voice JSON path |
| `AGENTIC_REMOTE_VOICE_TTS_SPEAKER` | optional speaker ID |

Paths are resolved with `realpath`, must be regular files or directories of
the expected type, and are never accepted from browser messages. Startup
reports missing or invalid assets without taking down the rest of the app.

An explicit `agentic-remote voice-install <profile>` command may install a
documented profile into the data directory. It prints licenses and sizes,
downloads pinned HTTPS URLs, verifies SHA-256 before extraction, stages into a
temporary directory, and atomically activates only a complete profile. Setup
and server startup never download models.

## Turn and interruption semantics

1. **Listening:** the browser streams VAD frames and keeps a short pre-roll.
2. **Tentative speech:** playback gain drops immediately; no Oracle
   cancellation occurs.
3. **Confirmed speech:** the browser clears playback, advances generation,
   sends `interrupt`, then flushes pre-roll and live PCM. The hub cancels
   pending TTS and invokes `ManagerAgent.cancel`.
4. **Endpoint:** client VAD supplies a hint. The server recognizer and maximum
   silence/utterance timers make the authoritative finalization decision.
5. **Final transcript:** the hub records the utterance ID before submitting it
   once to Oracle. A duplicate final is ignored. A failed submission is shown
   as an error and is not silently retried.
6. **Oracle reply:** stable completed sentences from replacement snapshots are
   synthesized. The unfinished suffix remains buffered.
7. **New speech or stop:** generation advances. All older STT, TTS, and audio
   is stale and discarded at each boundary.

If tentative speech is a VAD misfire, playback gain is restored without
cancelling Oracle or losing queued audio.

## Text segmentation

The segmenter consumes replacement snapshots, not append-only deltas. It emits
only text that is both new and terminated by stable sentence punctuation or a
paragraph boundary. It strips markdown control syntax, skips fenced code,
tables, URLs, and activity-only messages, and caps segment length. On the final
assistant message it may flush a short remaining sentence.

Previously emitted text is tracked by source message ID and character range.
Any non-prefix rewrite invalidates only the unsynthesized suffix. A rewrite
cannot cause already spoken text to be spoken again.

## State and UX

The composer gains an explicit **Conversation** control next to dictation.
Starting it always requires a user gesture and microphone permission. States
are visible text, not color alone:

- Listening
- Speech detected
- Transcribing
- Oracle is thinking
- Speaking
- Interrupted
- Reconnecting
- Error

The control exposes Stop at all times. Dictation remains available when
Conversation mode is stopped or unavailable. The panel describes processing
as “Speech stays on your selected computer; Oracle uses remote Copilot.”

Announcements use the existing polite live region. Meter animation honors
`prefers-reduced-motion`. Controls remain usable at the repository's supported
mobile viewport and with touch input.

## Failure behavior

No failure is success-shaped:

- permission denial leaves the microphone off and names the denied permission;
- unsupported AudioWorklet offers dictation;
- model or worker failure marks Conversation mode unavailable;
- queue overflow identifies a slow producer or consumer and closes the stream;
- node loss enters Reconnecting, discards the current utterance, and creates a
  fresh generation after recovery;
- Oracle send failure preserves the final text in the composer for manual send;
- TTS failure leaves the text reply usable and stops voice output;
- cancellation timeout closes the stream rather than submitting over an
  uncertain prior generation.

Logs contain stream IDs and counters, never PCM, full transcripts, pairing
tokens, or model output text.

## Validation and acceptance

Deterministic tests cover PCM conversion/framing, resampling, endpoint state,
ordering, deduplication, bounded queues, segmentation, cancellation,
reconnect, timeouts, worker failures, auth/origin rejection, and fallback.
Browser tests use fake VAD, STT, TTS, and audio clocks for permission, turns,
barge-in, rapid interruption, mobile layout, reconnect, and dictation
switching.

A real-engine development-host run must exercise microphone-equivalent PCM
through the hub coordinator, local worker, Oracle event stream, Piper, and
browser-equivalent playback handling, including one interruption. The corpus
records English and Brazilian Portuguese quality, latency, RTF, CPU, and RSS.
A 30-minute simulated stream checks bounded memory, duplicates, orphan
processes, and start/stop cleanup.

Targets on the development CPU are:

- first useful partial at or before 800 ms where the selected profile permits;
- final transcript within 1 s of endpoint;
- warm TTS first audio within 300 ms;
- STT and TTS RTF below 0.2;
- bounded memory with no upward soak trend.

Profiles that miss a target remain explicit alternatives and are reported with
their measurements. They are not relabeled as passing.

## Licensing and distribution

- sherpa-onnx runtime: Apache-2.0; model licenses are profile-specific.
- Silero VAD model: MIT; `@ricky0123/vad-web`: ISC; ONNX Runtime Web: MIT.
- Piper engine: GPL-3.0 because it incorporates eSpeak NG. Agentic Remote runs
  an operator-installed executable as a separate process and does not bundle
  it. Anyone distributing a release with Piper included must satisfy GPL
  source and notice obligations.
- Piper voice models have independent dataset/model licenses. Each installable
  profile lists and installs its license notice.
- Nemotron 3.5 model: NVIDIA Open Model License; the exact model notice is
  shown before explicit installation.

No model or voice is enabled merely because it was downloaded. Configuration
must name the installed assets and the feature flag must be on.

## Rollout

The feature remains off by default. Validation runs in the isolated feature
worktree and then through a development release only after review. Because the
user explicitly prohibited merge and deployment without authorization, the PR
stops after current-head Supervisor review and complete evidence. No production
default changes in this work.
