# Oracle Conversation mode

Oracle Conversation is an opt-in streaming speech interface for Oracle. It is
disabled unless `AGENTIC_REMOTE_ORACLE_VOICE=on`; typed messages and **Dictate
to Oracle** remain available whether Conversation mode is disabled,
unsupported, or fails.

## Privacy and topology

The browser sends 16 kHz mono PCM only to the Agentic Remote hub. Speech
recognition and synthesis run on the selected hub or paired node. Conversation
mode never persists raw PCM, synthesized audio, or partial transcripts.

The privacy boundary ends at finalized text: the hub submits each final exactly
once through normal `ManagerAgent.send`. It becomes the normal persisted Oracle
user message in conversation history and is sent with Oracle context to remote
GitHub Copilot. No separate voice transcript or recording artifact is kept.
Conversation mode is therefore local speech processing, not an offline assistant.

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
fails, Oracle's text reply remains usable. One Conversation stream is supported
per hub.

## Evidence and limitations

Measurements below are from the six-core development Xeon W-2235 and are not
hardware promises. The committed FLEURS corpus and
`scripts/oracle-voice-benchmark.ts` reproduce this table; medians exclude
silence and missing partials, WER is the mean of clean fixtures, and peak RSS
is the maximum resident child value:

| Profile/language | Clean WER | First partial median | STT RTF median | TTS first audio median | TTS RTF median | Peak RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `fast-en` / en | 0.958 | 102 ms (1/5 fixtures emitted a partial) | 0.027 | 288 ms | 0.094 | 407 MiB |
| `multilingual-quality` / en | 0.704 | 872 ms (4/5 emitted) | 0.511 | 318 ms | 0.092 | 1,254 MiB |
| `multilingual-quality` / pt-BR | 0.045 | 699 ms | 0.687 | 299 ms | 0.083 | 1,212 MiB |

The prior Whisper tiny baseline remains 0.72 RTF and about 885 MiB RSS.
Zipformer is fast but failed the FLEURS quality gate, returning an empty result
on four of five English non-silence cases. Nemotron established useful
Brazilian Portuguese evidence on one anonymous male speaker, including 0.000
WER on the long clean clip, but its CPU RTF and memory miss the `<0.2` and
low-resource targets. The corpus cannot establish multi-speaker Portuguese or
perceptual TTS quality.

The real browser/hub/WebSocket/resident-child run used the session-only NASA
JFK clip, Zipformer, and resident LJSpeech VITS. It measured 1,446 ms to first
partial, 96 ms from explicit speech end to final, 0.198 STT RTF, 224 ms from
manager delta to first audio, 0.108 TTS RTF, 289 MiB peak worker RSS, and 77.0%
sustained worker CPU.
Barge-in stopped queued playback, cancelled generation 1, submitted the second
utterance exactly once, and delivered zero old-generation audio afterward.
The first-partial target therefore missed; finalization, warm short-sentence
TTS, and RTF targets passed in that run.

The required real-time soak passed 30 minutes at six turns/minute after 500
rapid start/stop races: 680/680 unique manager sends, 500 cancellations and
stale backend emissions, zero stale client deliveries, a 640-byte maximum
input queue against the 64,000-byte limit, no orphan child/socket or unhandled
error, and a final-half RSS slope of 0.091 MiB/minute. RSS was 152 MiB initially,
169 MiB peak, and 128 MiB after cleanup.

Resident VITS still invokes progress only with the complete sentence, so it is
not engine-incremental within a sentence. The worker validates that complete
result before splitting it into protocol-safe frames. A sentence remains
bounded to 12 seconds at the native voice sample rate and fails explicitly
before playback when the bound is exceeded. Oracle text remains available when
synthesis fails.

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
