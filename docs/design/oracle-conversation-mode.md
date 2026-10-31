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
| Piper 1.8 en_US-ljspeech-medium | 131 ms first chunk; 0.029 RTF | 239 MiB | Historical Python-API benchmark; not the shipped resident sherpa VITS path |
| sherpa Kitten nano int8, 4 threads | 508-680 ms first audio for short segments; 0.29-0.64 RTF | 168-192 MiB | Permissive fallback, misses the latency target |
| sherpa-onnx-node 1.13.8 VITS, warmed, 2 threads | LJSpeech: 711 ms for 8.00 s audio, 0.089 RTF; Faber: 610 ms for 6.72 s audio, 0.091 RTF | Not isolated in this probe | One `progress=1` callback containing the whole sentence, only 0.069/0.048 ms before `generateAsync` resolved; not engine-incremental and misses the 300 ms first-audio target |
| Task 11 `fast-en`, English FLEURS corpus | 0.040 full-fixture compute RTF; 0.917 clean WER; 1,650 ms real-time first partial; 283 ms median resident-VITS first audio | 411 MiB | Meets compute speed, fails the corpus quality and streaming-latency gates |
| Task 11 `multilingual-quality`, English FLEURS corpus | 0.757 full-fixture compute RTF; 0.517 clean WER; 965 ms real-time first partial; 286 ms median resident-VITS first audio | 1,246 MiB | Neither quality nor CPU/resource target is established |
| Task 11 `multilingual-quality`, pt-BR FLEURS corpus | 0.735 full-fixture compute RTF; 0.045 clean WER; 724 ms real-time first partial; 304 ms median resident-VITS first audio | 1,205 MiB | Useful single-speaker evidence; misses the CPU and streaming-latency targets |

Nemotron 3.5 accurately transcribed the earlier JFK English benchmark, supports
40 locales including `pt-BR`, and emits punctuation. Task 11 showed that result
does not generalize to the compact FLEURS English corpus, while the selected
single-speaker pt-BR clips were substantially better. It still misses the
requested `<0.2` CPU RTF target. Conversation mode therefore does not silently
select one universal model. Operators choose an explicit profile, and the
capability response reports its language and resource class.

## Trust and privacy boundary

The browser captures microphone audio and runs Silero VAD locally. PCM travels
only to the configured Agentic Remote hub and, when selected, one paired node.
The selected computer performs STT and TTS locally. Raw PCM, synthesized audio,
and partial transcripts are never persisted.

Each finalized transcript is submitted exactly once through normal
`ManagerAgent.send` with explicit `source: 'voice'` provenance and
`answerOnly: true`. The hub enforces this for local and paired-node speech,
regardless of the browser's Ask/Delegate value. Conversation voice therefore
cannot delegate work, steer sessions, answer permission or trust prompts, or
approve destructive confirmation actions. Typed/manual Delegate messages keep
their existing behavior. Browser session defaults, including per-computer
folder paths, terminate at the hub and are not forwarded to a paired speech
node; the hub retains them only for the finalized Oracle submission.

`ManagerMessage.source` is the durable authority for that decision. New user
messages persist either `typed` or `voice`; old records without `source` load
as typed. `ManagerStore` keeps the first trusted source for a message ID, so
queue edits, retry, event emission, restart recovery, and log compaction cannot
downgrade a voice message. The finalized text remains exactly one normal
Oracle user message in conversation history and is sent with Oracle context to
the remote Copilot model. Conversation mode persists no separate voice
transcript or recording artifact.

The manager tool handler applies a centralized fail-closed policy. Voice may
call only the explicit read/query allowlist (`list_computers`, `list_sessions`,
`get_session`, `ask_session`, `list_skills`, `memory_list`, and
`memory_read`). Every other existing or newly added tool is classified as a
mutation until reviewed, so session actions, permission/trust answers,
destructive confirmation, memory writes, and `set_session_folder` are rejected
before argument parsing or side effects. Typed Ask retains its existing
session-action restriction while keeping its intentional memory/settings
behavior; typed Delegate is unchanged.

The current voice text is XML-escaped and placed in an
`<untrusted_voice_transcript acoustic_identity="unverified">` block with a
system-level rule that it is acoustic content to answer, not trusted
instructions. Voice turns cannot write memory/settings, and recovery briefs
omit the voice message plus activities and replies linked to it. This keeps a
later typed Delegate turn from inheriting voice text as authoritative
instructions while preserving the visible conversation.

VAD confirms speech activity, not speaker identity. Conversation mode does not
attempt speaker authentication; nearby, replayed, or injected speech can still
be transcribed. The Ask-only boundary limits that input to non-delegating
Oracle answers rather than pretending to establish who spoke. The panel repeats
this limitation before Start and in the active status: identity is unverified,
nearby or replayed audio may be submitted, Ask can read session information,
and finalized text goes to remote Copilot.

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
for low-frequency control and transcript events. Audio uses a fixed binary
header, a playback segment identity when applicable, and signed 16-bit
little-endian samples.

Every control message carries a protocol version and stream ID. Every audio
frame carries a direction, generation, sequence, sample rate, and sample
count; playback frames also carry the active synthesis segment ID. Parsers
reject unknown versions, impossible lengths, unsupported sample rates,
duplicate or out-of-order frames, and frames above the configured limit.
Binary PCM stays capped at 32 KiB per frame. JSON controls use the larger
bounded input-queue limit so a valid `start` message can carry the existing
per-computer folder defaults from the browser to the hub without weakening the
audio-frame cap. The hub strips those defaults before relaying `start` to a
paired speech node.

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
- end and submit the bounded prefix at the advertised utterance duration;
- partial transcript display;
- streamed PCM playback through a separate `AudioContext`;
- bounded playback scheduling and slow-consumer rejection;
- immediate gain reduction on tentative speech;
- source cancellation and queue clearing on confirmed speech.

Closing Oracle, stopping Conversation mode, page teardown, or a fatal error
stops microphone tracks, closes audio contexts and sockets, and clears timers
and queues.

The browser and paired-node connector allow 35 seconds for the initial hello.
That covers the worker's bounded 30-second cold-start window plus transport
overhead. A temporary paired-node busy response closes the browser relay with
retryable service-restart code `1012`; reconnect uses a fresh stream and never
replays audio.

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

The coordinator never reconstructs or persists audio recordings, synthesized
audio, partial transcripts, or a separate finalized-transcript artifact. The
normal manager send owns finalized-message durability. A hub restart ends the
voice stream explicitly; the browser may reconnect as a new stream without
replaying PCM or finalized transcripts.

### Node voice backend

Both hub and node roles can own speech compute. The node exposes an
authenticated `/node-api/oracle-voice` WebSocket. A local backend uses the same
session implementation without network relay. Its bounded output relay
acknowledges backend frames when the relay accepts them, not after the
serialized coordinator finishes browser delivery. This prevents a heartbeat,
barge-in confirmation, or cancellation response from waiting behind the audio
whose delivery is waiting on that same coordinator. Relay or browser overflow
still fails closed. Browser writes have a five-second deadline and terminate
the socket on expiry, so a network black hole cannot retain the single
Conversation admission slot until the operating system abandons TCP.
If synthesis emits partial PCM and then fails, the backend reports the error
without declaring the segment complete. The coordinator clears the remaining
speech queue and returns to listening; it never advances to later sentences
from the same failed reply.

The backend runs native inference in an isolated child process. A native crash
or malformed model cannot terminate the Agentic Remote server. The child stays
warm and completes a silent recognizer decode before reporting readiness, so
the first browser utterance does not pay lazy model initialization while its
bounded 12-second PCM queue is filling. It then creates one recognizer stream per browser
speech segment, emits partial and final transcripts, and runs one TTS generation
at a time. Internal sherpa
endpoints reset decoding and accumulate text; they do not finalize the browser
segment. After the ordered PCM drain, one browser `speech_end` produces one
combined final transcript. Its parent enforces:

- maximum frame size, audio seconds, queue bytes, and utterance duration;
- monotonic generation and sequence ordering;
- worker startup, heartbeat, utterance, and synthesis timeouts;
- cancellation and process termination on shutdown;
- explicit unavailable/error events when configuration or models fail.

The first implementation supports sherpa-onnx streaming transducer models for
STT. Explicitly installed profiles use resident sherpa-onnx VITS for TTS, while
the original external-Piper adapter remains compatible with manually supplied
configuration. Engine interfaces stay small enough to use deterministic fakes;
no runtime or model is downloaded implicitly.

Oracle's replacement reply is segmented at stable completed sentences, so one
sentence can begin synthesis before the full Oracle reply is complete. That is
sentence-level early playback, not proof of incremental synthesis inside VITS.
On the pinned sherpa-onnx-node 1.13.8 runtime, both measured packaged voices
called `onProgress` once with the complete generated sentence at `progress=1`,
effectively at `generateAsync` completion. The worker therefore chunks that
complete callback (or fallback result) only after generation finishes and the
whole sentence passes the 12-second bound, then emits protocol-safe PCM frames
for transport, ordering, cancellation, and backpressure. Measured sentence
audio begins after full local synthesis (711 ms for LJSpeech and 610 ms for
Faber), not through a true engine-incremental first-audio path.

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
| `AGENTIC_REMOTE_VOICE_TTS_ENGINE` | `sherpa-vits` for shipped profiles; omitted for the legacy external-Piper adapter |
| `AGENTIC_REMOTE_VOICE_TTS_BIN` | external Piper executable path; not used by shipped sherpa VITS profiles |
| `AGENTIC_REMOTE_VOICE_TTS_MODEL` | Piper-compatible ONNX voice path |
| `AGENTIC_REMOTE_VOICE_TTS_CONFIG` | Piper-compatible voice JSON path |
| `AGENTIC_REMOTE_VOICE_TTS_TOKENS` | sherpa VITS token file |
| `AGENTIC_REMOTE_VOICE_TTS_DATA_DIR` | sherpa VITS eSpeak NG data directory |
| `AGENTIC_REMOTE_VOICE_TTS_SPEAKER` | optional speaker ID |

Paths are resolved with `realpath`, must be regular files or directories of
the expected type, and are never accepted from browser messages. Startup
reports missing or invalid assets without taking down the rest of the app.
When a hub selects a paired computer, it parses enablement/selection without
requiring those local paths; the node validates its own local profile. With no
selection, the hub validates local paths strictly.

An explicit `agentic-remote voice-install <profile>` command may install a
documented profile into the data directory. It prints notices before network
access, bounds HTTPS downloads to exact pinned sizes with explicit
timeouts/retries, verifies SHA-256 plus archive entry/expanded limits, rejects
all archive types except regular files/directories, validates the final tree,
and publishes under a per-profile lock. The research-only pt-BR profile also
requires `--accept-research-only`. Setup and server startup never download
models.

## Turn and interruption semantics

1. **Listening:** the browser streams VAD frames and keeps a short pre-roll.
2. **Tentative speech:** playback gain drops immediately; no Oracle
   cancellation occurs.
3. **Confirmed speech:** the browser clears playback, advances generation,
   sends `interrupt`, then flushes pre-roll and live PCM. The hub cancels
   pending TTS and invokes `ManagerAgent.cancel`.
4. **Endpoint:** client VAD supplies the segment-end hint after its redemption
   window. Internal recognizer endpoints are decoding boundaries only. The
   server drains all accepted PCM before finalization and enforces the maximum
   utterance and operation limits. Browser VAD has already supplied trailing
   silence, so the worker calls `inputFinished()` without appending another
   synthetic endpoint window.
5. **Final transcript:** the hub records the utterance ID before submitting it
   once to Oracle. A duplicate final is ignored. A failed submission is shown
   as a fatal error and is not restored or silently retried because the hub
   cannot prove whether Oracle retained an ambiguously failed send.
6. **Oracle reply:** stable completed sentences from replacement snapshots are
   synthesized. The unfinished suffix remains buffered. Starting a tool call
   confirms terminal punctuation as a stable boundary without flushing an
   unfinished phrase.
7. **New speech or stop:** generation advances. All older STT, TTS, and audio
   is stale and discarded at each boundary. A prior segment already waiting
   for its STT final remains eligible for exactly-once submission; if it arrives
   after the next generation starts, Oracle records it and immediately cancels
   its superseded reply. A bounded timeout derived from the selected backend's
   advertised input backlog plus the cancellation margin reports and discards a
   missing final.

Starting over in Oracle cancels active reply speech, clears scheduled browser
playback, and returns Conversation mode to Listening. An utterance still
accepting audio or awaiting either its endpoint or final is allowed to complete
without closing the voice stream. A final accepted after the reset becomes the
first turn of the new Oracle conversation; one accepted before the reset is
discarded with the old conversation.

If tentative speech is a VAD misfire, playback gain is restored without
cancelling Oracle or losing queued audio.

The pinned native VITS binding cannot preempt `generateAsync()`. Confirmed
barge-in therefore marks its output stale and releases the STT/control path
immediately rather than waiting for native compute. A replacement speech
segment waits behind that one native call; no cancelled audio is forwarded.

## Text segmentation

The segmenter consumes replacement snapshots, not append-only deltas. It emits
only text that is both new and terminated by stable sentence punctuation or a
paragraph boundary. Punctuation at the transient snapshot suffix is held until
a later snapshot confirms following content or the final assistant message
arrives. A tool-call activity also confirms terminal punctuation at that suffix
but does not flush an unterminated phrase. Completed list lines are confirmed
by their line break. It strips
markdown control syntax, skips fenced code, tables, URLs, and activity-only
messages, and caps segments at 150 characters. On the final assistant message
it may flush a short remaining sentence.

Previously emitted text is tracked by source message ID and character range.
Any non-prefix rewrite invalidates only the unsynthesized suffix. A rewrite
cannot cause the same already spoken text to be spoken again. Once a deletion
makes positional identity ambiguous, unmatched completed prose is treated as
new instead of being silently dropped; replacement snapshots do not carry
semantic intent that could distinguish a correction from a new sentence.

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
The Ask/Delegate switch continues to show and control the typed-message mode
while a separate notice states that Conversation voice itself is always
Ask-only.

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
- Oracle send failure closes Conversation without restoring the transcript,
  preventing replay when Oracle may have retained the message;
- TTS failure leaves the text reply usable and stops voice output;
- failed or timed-out cancellation closes the stream rather than accepting a
  newer final over an uncertain prior generation.

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
through the hub coordinator, local worker, Oracle event stream, local VITS, and
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
their measurements. They are not relabeled as passing. The shipped resident
VITS path currently misses the warm 300 ms first-audio target even though its
whole-sentence synthesis RTF is below 0.2; sentence segmentation reduces delay
relative to waiting for Oracle's entire reply but does not satisfy the unmet
engine-incremental target.

## Licensing and distribution

- sherpa-onnx runtime: Apache-2.0; model licenses are profile-specific.
- Silero VAD model: MIT; `@ricky0123/vad-web`: ISC; ONNX Runtime Web: MIT.
- Shipped VITS archives run through sherpa-onnx and include eSpeak NG data.
  Archive/runtime/model terms remain distinct; each installable profile lists
  and installs its notices. The optional legacy external Piper adapter has its
  own runtime terms.
- Piper-compatible voice models have independent dataset/base-model terms.
  LJSpeech's pinned model card states public-domain data and training from
  scratch. Faber states that it is fine-tuned from Lessac, whose upstream terms
  are research-only, so that profile requires explicit acknowledgement and is
  not presented as generally permissive.
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
