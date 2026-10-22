# Oracle Conversation mode

Oracle Conversation is an opt-in streaming speech interface for Oracle. It is
disabled unless `AGENTIC_REMOTE_ORACLE_VOICE=on`; typed messages and **Dictate
to Oracle** remain available whether Conversation mode is disabled,
unsupported, or fails.

## Privacy and topology

The browser sends 16 kHz mono PCM only to the Agentic Remote hub. Speech
recognition and synthesis run on the selected hub or paired node. Conversation
mode never persists raw PCM, synthesized audio, or partial transcripts.
Browser session defaults, including per-computer folder paths, remain on the
hub and are not forwarded to a paired speech node.

The privacy boundary ends at finalized text: the hub submits each final exactly
once through normal `ManagerAgent.send` with voice provenance and forced
Ask-only behavior. This hub policy is the same for local speech and speech
processed on a paired node, and it does not change when the panel is set to
Delegate. Conversation voice cannot delegate work, steer sessions, answer
permission or trust prompts, or approve destructive confirmation actions.
It also cannot change Oracle memory or its default session folders. Typed Ask
keeps its existing memory/settings behavior, and typed/manual Delegate messages
are unchanged.

The final becomes exactly one normal persisted Oracle user message in
conversation history and is sent with Oracle context to remote GitHub Copilot.
Its immutable `source: 'voice'` survives queueing, edits, retries, events,
restart recovery, and storage compaction. Existing historical messages without
source retain typed/manual behavior. No separate voice transcript or recording
artifact is kept. Conversation mode is therefore local speech processing, not
an offline assistant.

For hub-local speech, install and configure a profile on the hub. For speech
on a paired node, install and enable the profile on the node only. The hub
needs `AGENTIC_REMOTE_ORACLE_VOICE=on` plus
`AGENTIC_REMOTE_VOICE_COMPUTER=<paired name>`; it does not need local model
paths. The selected node independently validates and advertises its local
engine. Missing/offline/incapable selections fail explicitly rather than
falling back silently. The node remains headless and its voice WebSocket uses
the existing pairing token.

## Install

There is deliberately no automatic or default profile. On each computer that
needs the profile:

```bash
agentic-remote voice-install fast-en
# Research-only Faber/Lessac ancestry:
agentic-remote voice-install multilingual-quality --accept-research-only
```

The command prints licenses before any network access. Downloads permit HTTPS
for the initial request and every redirect, use explicit connection/total
timeouts and three attempts, and stop at the exact pinned byte count even for a
streaming response. The installer verifies SHA-256, archive expanded bytes and
entry counts, rejects traversal/sparse/link/FIFO/device entries, extracts only
regular files/directories, and validates the complete staged tree. Publication
is serialized per profile and rechecks the installed digest while locked. A
failed, conflicting, or interrupted install cleans staging and leaves the prior
active profile unchanged.

Copy the printed `AGENTIC_REMOTE_VOICE_*` assignments into
`~/.config/agentic-remote/environment`, then explicitly add:

```text
AGENTIC_REMOTE_ORACLE_VOICE=on
```

For a paired node, the hub environment needs only:

```text
AGENTIC_REMOTE_ORACLE_VOICE=on
AGENTIC_REMOTE_VOICE_COMPUTER=worker-node
```

For resident sherpa VITS, the canonical eSpeak data-directory path must be no
more than 251 bytes. Startup rejects deeper custom data roots explicitly rather
than allowing eSpeak NG to abort the worker.

Do not copy the node's local model paths to the hub. On the node, use the
installer's complete printed configuration and enable voice locally.

Run `agentic-remote setup` or restart the service after editing the protected
environment file. `setup` preserves existing voice values with mode `0600`;
it never downloads a model, selects a profile, or enables Conversation mode.

### Shipped profiles

| Profile | Installed inputs | Configured language | Download |
| --- | --- | --- | ---: |
| `fast-en` | sherpa-onnx Zipformer English 20M int8; resident sherpa VITS; Piper `en_US-ljspeech-medium` | `en` | 195,057,566 bytes |
| `multilingual-quality` | sherpa-onnx Nemotron 3.5 0.6B 160 ms int8; resident sherpa VITS; Faber medium (**research-only ancestry**) | `pt-BR` | 542,456,707 bytes |

`multilingual-quality` names the STT model's multilingual capability. Its
shipped TTS voice is specifically Brazilian Portuguese, so the generated
configuration uses `pt-BR`, not automatic language selection.
Faber is fine-tuned from the research-only Lessac base voice. The installer
therefore refuses network access without `--accept-research-only`; the profile
does not imply general commercial suitability.

The pinned runtime assets currently support Linux x86-64. Other server
platforms may use manually supplied compatible assets, but the installer
refuses to pretend a shipped profile supports them.

## Browser and failure behavior

Conversation mode requires microphone permission, `getUserMedia`,
`AudioWorklet`, Web Audio playback, and WebSocket support. It refuses to start
when those primitives are unavailable and directs the user to dictation.

The deterministic built-UI test passes in repository Playwright Chromium and
Firefox, including touch at 390×844. Chromium and Firefox need the development
host's extracted `libasound.so.2` workaround. The downloaded Playwright WebKit
binary cannot launch on this host because GTK 4, Graphene, GStreamer, Flite,
Soup, media-codec, and related shared libraries are absent. No system packages
were installed and WebKit is not reported as passed. Installed-PWA and physical
Safari/device testing remain open.

Only finalized STT text is submitted to Oracle. Partials are display-only. A
disconnect discards the current utterance rather than replaying audio. If an
Oracle submission fails, the finalized text returns to the composer. If TTS
fails, Oracle's text reply remains usable and remaining queued sentences are
not spoken. One Conversation stream is supported per hub.

Conversation voice remains Ask-only. The Ask/Delegate switch continues to show
and control the mode used by typed messages while Conversation is active.

A continuous speech segment is capped at the server-advertised 30 seconds. At
that boundary the browser sends one endpoint, submits the bounded prefix, and
shows a nonfatal warning; audio after the boundary is ignored until VAD observes
the next speech segment. This avoids losing the whole utterance to a backend
limit while keeping memory and transport bounded.

Cold local or paired workers have up to 30 seconds to initialize. The browser
and hub-to-node connector allow 35 seconds for the initial hello; a temporary
paired-node busy response remains reconnectable. PCM frames stay capped at
32 KiB, while JSON controls may use the bounded 384,000-byte input queue.

Silero VAD detects speech activity; it does not authenticate a speaker.
Nearby, replayed, or injected speech can be transcribed. Agentic Remote does
not add a partial speaker-authentication claim. Before Start and while active,
the panel warns that identity is unverified, nearby or replayed audio may be
submitted, Ask can read session information, and finalized text is sent to
remote Copilot.

The safety boundary is provenance plus authorization: the model receives the
current final in an escaped, acoustically-untrusted delimiter; the manager
tool handler allows only explicitly classified reads and fails closed for
unknown tools; voice cannot update memory/settings; and recovery briefs omit
the voice exchange. Use typed/manual Oracle input for delegation and the
dedicated UI controls for permission, trust, or destructive confirmations.

## Evidence and limitations

Measurements below are from the six-core development Xeon W-2235 and are not
hardware promises. The committed FLEURS corpus and
`scripts/oracle-voice-benchmark.ts` reproduce this table. STT quality and
compute RTF consume each complete fixture and aggregate every recognizer
endpoint. Latency is measured in a separate real-time-paced pass from detected
speech onset; each 80 ms frame becomes available only at the end of its
real-time interval. Medians exclude silence and missing partials, WER is the
mean of clean fixtures, and peak RSS is the maximum resident child value:

| Profile/language | Clean WER | Real-time first partial | Endpoint final | STT compute RTF | TTS first audio | TTS RTF | Peak RSS | Endpoints | Consumed audio |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `fast-en` / en | 0.917 | 1,650 ms | 21 ms | 0.040 | 283 ms | 0.090 | 411 MiB | 13 | 29,370 ms |
| `multilingual-quality` / en | 0.517 | 965 ms | 577 ms | 0.757 | 286 ms | 0.086 | 1,246 MiB | 11 | 29,370 ms |
| `multilingual-quality` / pt-BR | 0.045 | 724 ms | 421 ms | 0.735 | 304 ms | 0.085 | 1,205 MiB | 6 | 23,940 ms |

The prior Whisper small baseline remains 0.72 RTF and about 885 MiB RSS.
Zipformer is fast but failed the FLEURS quality gate, returning an empty result
on four of five English non-silence cases. Nemotron established useful
Brazilian Portuguese evidence on one anonymous male speaker, including 0.000
WER on the long clean clip, but its CPU RTF and memory miss the `<0.2` and
low-resource targets. The corpus cannot establish multi-speaker Portuguese or
perceptual TTS quality.

The latest real browser/hub/WebSocket/resident-child run used the committed
`pt-BR-short-male-clean.wav` fixture (SHA-256
`ea350ee4e045b127aa38bbb000b00975065b7cd30c6f3fef46f3a2d449575fcc`),
Nemotron, and resident Faber VITS. One browser segment repeated the 5.52-second
fixture around 1.3 seconds of silence, crossing the configured 1.2-second
internal endpoint, then supplied 1.4 seconds of browser-VAD trailing silence.
It produced one combined Oracle submission per browser segment without adding
another synthetic worker-side silence window.

The run measured 2,498 ms to first partial, 0.8 ms from explicit speech end to
final, 1.113 wall-clock paced STT RTF, 165 ms from manager delta to first
audio, 0.101 TTS RTF, 1,166 MiB peak worker RSS, and 130.7% sustained worker
CPU. Its STT RTF includes real-time browser pacing and is not comparable to the
corpus compute RTF table. Generation 1 was cancelled during a controlled
1.5-second playback delay; generation 2 synthesized three separate list/prose
segments. The browser started zero old-generation sources after interruption.
The first-partial target missed; finalization, warm short-sentence TTS, TTS
RTF, and stale-audio rejection passed.

The required real-time soak passed 30 minutes at six turns/minute after 500
actual conversation WebSocket/session lifecycle cycles. Those cycles opened
520 sockets and completed 520 socket cleanup checks in 7,406.61 ms. Twenty
explicit acquisition-gated races closed the old browser while backend startup
was unresolved, started the replacement before releasing that gate, cancelled
all 20 old acquisitions, leaked zero old hellos or stream messages, created
exactly 20 replacement hellos/sessions, and cleaned all 20 gated workers. The
timed phase then sent 180/180 unique manager submissions in 1,800,000.96 ms.

The soak retained production `LocalVoiceBackend` and
`EngineVoiceBackendSession` around a controlled engine. It measured 4,480
queued input bytes, 640 pending/in-flight input bytes, 5,120 total input
backlog against the then-current 64,000-byte limit, and 18,186 queued output
bytes, with no overflow. The current microphone backlog cap is 384,000 bytes
(12 seconds at 16 kHz PCM16); it remains below the 30-second utterance cap and
absorbs CPU contention while still failing closed. It observed 681
cancellation-triggered stale backend emissions and
zero stale client deliveries. A fixture-owned child PID was observed during
the run and absent afterward. RSS was 155.30 MiB initially, 272.28 MiB peak
during lifecycle cycling, and 172.79 MiB finally; the final-half slope was
0.04440 MiB/minute. All 23 assertions passed, including zero active
backend sessions, orphan child PIDs, unhandled rejections, or uncaught
exceptions after stop.

Resident VITS still invokes progress only with the complete sentence, so it is
not engine-incremental within a sentence. The worker validates that complete
result before splitting it into protocol-safe frames. Speakable segments are
capped at 150 characters and completed list lines are synthesized separately.
A segment remains bounded to 12 seconds at the native voice sample rate and
fails explicitly before playback when the bound is exceeded. A synthesis
failure stops the remaining speech queue without closing Conversation; Oracle
text remains available.

The native VITS binding cannot stop `generateAsync()` mid-call. Barge-in marks
that generation stale immediately, clears browser playback, and lets new speech
reach STT without waiting; a replacement TTS segment waits for the cancelled
native call to return. No old-generation audio is forwarded.

## Remove or replace

Disable the feature first by removing or changing
`AGENTIC_REMOTE_ORACLE_VOICE=on`, then rerun setup or restart. After confirming
the service no longer uses voice, remove one profile or the whole inventory:

```bash
rm -rf ~/.agentic-remote/models/oracle-voice/profiles/fast-en
rm -f ~/.agentic-remote/models/oracle-voice/active/fast-en
```

Use the configured `AGENTIC_REMOTE_DATA_DIR` instead of
`~/.agentic-remote` when set. Re-running `voice-install` for the same pinned
version is idempotent and reactivates it without downloading again.

## Troubleshooting

- `unknown voice profile`: use exactly `fast-en` or
  `multilingual-quality`.
- Size/checksum/extraction failure: retry after checking network and disk
  space; the prior active profile remains selected.
- Research-only acknowledgement required: review the printed Faber/Lessac
  ancestry, then rerun with `--accept-research-only` only if appropriate for
  the intended use.
- `Oracle voice configuration is invalid`: compare the environment file with
  the installer's printed paths and confirm the active symlink still exists.
- Paired computer missing/offline/unavailable: restore the selected node. Clear
  `AGENTIC_REMOTE_VOICE_COMPUTER` only when the hub itself has a complete local
  profile; local mode never accepts missing paths.
- Unsupported browser or denied microphone: use **Dictate to Oracle** or type.
- Speech works but no audio plays: Oracle text remains authoritative; inspect
  `agentic-remote logs` for a constant-style voice error, never transcript
  text.

See [Oracle voice licenses](licenses/oracle-voice.md) before using or
redistributing installed assets.
