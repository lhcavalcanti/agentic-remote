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
on a paired node, the current configuration loader requires a valid installed
profile on both the hub and node; enable it on both, and set
`AGENTIC_REMOTE_VOICE_COMPUTER` to the paired computer's name on the hub only.
The node remains headless and its voice WebSocket uses the existing pairing
token.

## Install

There is deliberately no automatic or default profile. On each computer that
needs the profile:

```bash
agentic-remote voice-install fast-en
# or
agentic-remote voice-install multilingual-quality
```

The command prints licenses before downloading, verifies every byte count and
SHA-256, rejects unsafe archive paths, writes `NOTICES.txt`, and atomically
activates a versioned profile under
`<data>/models/oracle-voice/`. A failed or interrupted install removes its
staging directory and leaves the prior active profile unchanged.

Copy the printed `AGENTIC_REMOTE_VOICE_*` assignments into
`~/.config/agentic-remote/environment`, then explicitly add:

```text
AGENTIC_REMOTE_ORACLE_VOICE=on
```

For a paired node, also add this on the hub:

```text
AGENTIC_REMOTE_VOICE_COMPUTER=worker-node
```

Run `agentic-remote setup` or restart the service after editing the protected
environment file. `setup` preserves existing voice values with mode `0600`;
it never downloads a model, selects a profile, or enables Conversation mode.

### Shipped profiles

| Profile | Installed inputs | Configured language | Download |
| --- | --- | --- | ---: |
| `fast-en` | sherpa-onnx Zipformer English 20M int8; Piper standalone CLI; Lessac medium | `en` | 217,553,797 bytes |
| `multilingual-quality` | sherpa-onnx Nemotron 3.5 0.6B 160 ms int8; Piper standalone CLI; Faber medium | `pt-BR` | 564,939,974 bytes |

`multilingual-quality` names the STT model's multilingual capability. Its
shipped TTS voice is specifically Brazilian Portuguese, so the generated
configuration uses `pt-BR`, not automatic language selection.

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
- Piper 1.8 with Lessac measured a 131 ms median first chunk, 0.029 RTF, and
  about 239 MiB peak RSS through the Python API. The shipped profile uses the
  compatible standalone `2023.11.14-2` CLI, so those numbers are not a claim
  about the installed profile.
- The pinned standalone CLI successfully synthesized English Lessac and pt-BR
  Faber smoke phrases. No Portuguese ASR corpus, perceptual quality study,
  browser end-to-end latency, barge-in timing, or soak result exists yet.

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
- `Oracle voice configuration is invalid`: compare the environment file with
  the installer's printed paths and confirm the active symlink still exists.
- Paired computer offline or unavailable: restore that node or clear
  `AGENTIC_REMOTE_VOICE_COMPUTER` to use the hub's local configured profile.
- Unsupported browser or denied microphone: use **Dictate to Oracle** or type.
- Speech works but no audio plays: Oracle text remains authoritative; inspect
  `agentic-remote logs` for a constant-style voice error, never transcript
  text.

See [Oracle voice licenses](licenses/oracle-voice.md) before using or
redistributing installed assets.
