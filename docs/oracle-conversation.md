# Oracle Conversation mode

Oracle Conversation is an opt-in streaming speech interface for Oracle. It is
disabled unless `AGENTIC_REMOTE_ORACLE_VOICE=on`; typed messages and **Dictate
to Oracle** remain available whether Conversation mode is disabled,
unsupported, or fails.

## Privacy and topology

The browser sends 16 kHz mono PCM only to the Agentic Remote hub. Speech
recognition and synthesis run on the selected hub or paired node. Conversation
mode does not write PCM, synthesized audio, or transcripts to disk.

The privacy boundary ends at finalized text: the hub submits that transcript,
Oracle's generated context, and the conversation to remote GitHub Copilot.
Conversation mode is therefore local speech processing, not an offline
assistant.

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
Cross-browser and installed-PWA evidence is pending Task 11; current unit tests
do not establish a Safari, Firefox, or device support matrix.

Only finalized STT text is submitted to Oracle. Partials are display-only. A
disconnect discards the current utterance rather than replaying audio. If an
Oracle submission fails, the finalized text returns to the composer. If TTS
fails, Oracle's text reply remains usable. One Conversation stream is supported
per hub.

## Evidence and limitations

Measurements below are from the six-core development Xeon W-2235 and are not
hardware promises:

- Zipformer English 20M int8 used 0.40 seconds of compute for an 11-second JFK
  clip (0.036 RTF, about 99 MiB peak RSS). Its single output missed the
  beginning of the sentence, so this is speed evidence, not a quality claim.
- Nemotron 3.5 160 ms int8 with four threads used 6.39 seconds of compute
  (0.58 RTF, about 986 MiB peak RSS) and reproduced that English clip with
  punctuation. It misses the design's `<0.2` CPU RTF target.
- The earlier Piper 1.8 Python-API benchmark used
  `en_US-ljspeech-medium`, not Lessac: 131 ms median first chunk, 0.029 RTF,
  and about 239 MiB peak RSS. Shipped profiles now use resident sherpa VITS
  with k2-fsa-packaged archives, so those figures are historical context, not
  measured performance for the installed path.
- A warmed two-thread sherpa-onnx-node 1.13.8 probe of the exact pinned VITS
  archives measured 711 ms to generate 8.00 seconds of LJSpeech audio
  (0.089 RTF) and 610 ms for 6.72 seconds of Faber audio (0.091 RTF).
  Each voice invoked `onProgress` exactly once, with `progress=1` and the
  complete sentence buffer, only 0.069 ms and 0.048 ms before
  `generateAsync` resolved. The current engine path is therefore not
  incremental within a sentence and misses the 300 ms warm first-audio target.
- Conversation can still start a completed Oracle sentence before the full
  Oracle reply finishes. For each sentence, the worker buffers and validates
  the complete local synthesis result before splitting it into ordered
  protocol-safe PCM frames. Sentence audio therefore began after 711 ms for the
  measured LJSpeech phrase and 610 ms for Faber, not incrementally during
  engine generation. This is sentence-level early playback relative to the
  Oracle reply, not evidence of true incremental synthesis.
  A single synthesized sentence is bounded to 12 seconds at the voice's native
  sample rate in both the worker and browser. The measured LJSpeech
  (176,469 samples at 22,050 Hz) and Faber (148,224 samples) sentences fit; a
  longer whole-sentence callback fails explicitly before any of that callback
  is queued. Oracle text remains available when synthesis fails.
  No Portuguese ASR corpus, perceptual quality study, browser end-to-end
  latency, barge-in timing, isolated resident-worker RSS, or soak result exists
  yet.

Task 11 owns real browser/profile measurements. Until then, do not describe
either profile as meeting a general quality or latency target.

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
