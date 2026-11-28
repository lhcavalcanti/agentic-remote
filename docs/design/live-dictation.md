# Live dictation

## Status

Implements #722 on top of the Parakeet worker from #721. It does not replace
record-and-upload dictation, which remains the fallback, and it is separate
from Oracle Conversation mode: nothing it hears is sent to Oracle or spoken.

## Goal

Words appear in the session composer and in **Dictate to Oracle** while the
user speaks, and the final text is ready about a second after Stop. Speech is
decoded on the computer that transcribes audio for the hub, by the warm
Parakeet worker, and audio, partial text and transcripts are never stored.

## How it works

```
browser                         hub                           transcription computer
AudioWorklet → 16 kHz PCM16 ──▶ /api/dictation (ticket) ──▶ /node-api/dictation (node token)
100 ms frames                   relay: checks and bounds      LiveDictationHost
                                every message                 LiveDictationSession
draft span at the caret ◀────── text / final ◀──────────────  word agreement over Parakeet passes
```

1. The microphone control asks `GET /api/dictation/capabilities`. When the
   transcription computer can stream, it takes a ticket
   (`POST /api/dictation/tickets`) and opens the `/api/dictation` WebSocket.
2. The hub sends the stream to the computer that transcribes its audio:
   `AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER`, else itself. A paired computer is
   reached over its authenticated node API; the hub only relays.
3. That computer runs one `LiveDictationSession` per stream. About every
   750 ms it decodes the audio from a second before the last confirmed word
   to the end, plus a second of silence, with the worker's idle-only
   `tryDecode`, so it never queues behind a recording being transcribed.
4. Word agreement confirms the words two consecutive passes agree on
   (LocalAgreement-2); the rest of the latest pass is tentative. Each change
   goes back as `text`: the newly confirmed words, and the tentative words
   that replace the last ones.
5. At Stop, a stream of 12 s or less is decoded whole for its final text. A
   longer one keeps its confirmed words verbatim and decodes only the tail.

VoiceInk's local Parakeet live text (`Beingpax/VoiceInk@b5d1be9`, GPLv3)
uses the same method. It is a design reference only; no code was copied.

## Word agreement

| Parameter | Value |
|---|---|
| Pass interval | 750 ms; a pass needs 500 ms of new audio and 400 ms of unconfirmed audio |
| Lead-in | Each window starts 1 s before the last confirmed word |
| Padding | 1 s of zeros after every window |
| Alignment | A pass is lined up with the confirmed text by finding the last confirmed word again by its text, within 0.3 s of where it was; failing that, words starting more than 0.12 s before the confirmed end are old |
| Agreement | Longest common prefix of the two latest hypotheses after the confirmed text, compared case- and punctuation-blind; the newest spelling is kept |
| Window bound | Past 15 s of unconfirmed audio, tentative words ending 5 s before its end are confirmed |
| Silence | 2 s or more of unconfirmed audio without a word moves the confirmed end to 0.5 s before the window's end |
| Pass timeout | 10 s; three failed passes in a row end the stream with its confirmed text |
| Final text | Whole decode up to 12 s of audio; otherwise confirmed words plus a tail decode from the same lead-in |
| Memory | Once a stream is longer than 12 s, audio before the next window is dropped |

Words come from the per-token `timestamps` and `durations` Parakeet returns:
a token starting with a space starts a word, and punctuation joins the word
before it. A word ends no later than the audio in its window; the last
token's duration otherwise runs on into the padding.

Parakeet drops or garbles a word that starts right at the beginning of its
window. Starting each window at the first tentative word, as a first version
did, lost words on real speech: a pass that missed the word at its start
moved the next window past it for good. The lead-in keeps every unconfirmed
word in context. Durations are not trusted for alignment either, because a
word's duration runs on through the pause after it; when two passes confirm
a word, the earlier of their end times counts.

## Stream limits and policies

| Limit | Value |
|---|---|
| Sample rate | 16 kHz mono PCM16 |
| Frames | 100 ms (3,200 bytes) recommended; a frame over 32 KiB is fatal `frame_too_large` |
| Max stream audio | 15 min; reaching it ends the stream with a `final` and `{ reason: 'duration_limit' }` |
| Backlog | Inbound frames waiting at the session plus relay `bufferedAmount` ≤ 384,000 bytes (12 s); over it is fatal `backpressure` |
| Heartbeats | Every 5 s both ways; 15 s without any frame or heartbeat is fatal `stalled` |
| Stop → final timeout | 30 s server side; the client waits 35 s, then keeps the committed text and shows the error |
| Concurrency | At most one active live stream per transcription computer. A second `start` gets fatal `busy`, and that client falls back to record-and-upload. The node enforces it; the hub also tracks it to fail fast. |
| Tickets | A separate `VoiceTicketStore` instance (30 s TTL, single use, origin/address bound) |
| Engine warm-up | A stream started while the worker is still starting waits up to 60 s for it; a stopped worker, before its first use or after a crash, is started first |

Audio frames reuse the Oracle voice codec (`shared/oracle-voice.ts`) as
microphone frames of generation 1, numbered from 1 with no gaps; a gap or a
repeat is fatal `protocol`. Control messages are version 1 JSON
(`shared/dictation.ts`): the browser sends `start`, `stop`, `cancel` and
`heartbeat`; the computer answers `ready`, `text`, `final`, `error` and
`heartbeat`.

## In the composer

- Dictated text is a span at the caret, replacing any selection. Confirmed and
  tentative words are both in the text box; the span is redrawn on each
  update, with a space only where the words would otherwise touch.
- The text box shows the draft with the span while dictating, but the saved
  draft changes only when dictation ends, so tentative words are never
  stored, not even in the browser.
- An edit beside the span is kept and the span moves with it. An edit that
  touches the dictated words hands the text over: dictation is cancelled, the
  user's text stays, and "Dictation stopped" is announced.
- The microphone control becomes **Stop dictation**, with **Cancel
  dictation** beside it and a status that says *Connecting…*, *Listening ·
  0:07* or *Finishing…*. The composer has an accent edge. Send and Queue wait
  until the final text arrives ("Finish dictation first").
- Stop puts the final text in the span. Cancel restores the draft and any
  selection it replaced, keeping edits made beside the span.
- The saved draft can still change underneath, as when a send that failed
  gives its words back. Ending dictation keeps that change: text added before
  or after the draft dictation started from stays around the result, and any
  other change keeps the saved draft with the dictated words after it.
- Asking a side question and editing a queued message wait until dictation
  ends.
- A failure shows in the composer's error area, the confirmed words stay, and
  "Dictation stopped" is announced.
- Opening another session stops dictation, and its final text goes into the
  draft of the session it started in.
- **Dictate to Oracle** works the same way on Oracle's message. Closing the
  panel stops dictation and keeps its text.
- Losing the microphone, the page going to the background, or the audio
  session being interrupted (an iPhone call or lock) stops dictation, keeps
  the confirmed words and announces "Dictation stopped: the microphone was
  interrupted".

## Fallback

| Situation | Result |
|---|---|
| The transcription computer has no Parakeet engine, or it failed | Records and uploads; the reason is announced |
| That computer is unpaired or offline | Records and uploads ("… is offline") |
| That computer runs a release without live dictation | Records and uploads ("Update … to use live dictation") |
| Another live stream is running there | Records and uploads ("… already in use") |
| The browser has no AudioWorklet, or its audio does not start | Records and uploads |
| Microphone permission is denied | Shows the error; recording would fail the same way |
| Three passes fail in a row, or the final decode fails or times out | Keeps the confirmed words and shows the error |
| The connection stalls, drops, or falls 12 s behind | Keeps the confirmed words and shows the error |

## Privacy

Audio, partial text and final text exist only in memory on the transcription
computer and in the requesting browser. Text goes only to the socket that sent
the audio. The hub relays without storing. Logs carry the stream ID, audio
seconds, pass count, first-text and final latency, and the outcome, never
text. Nothing is submitted to Oracle and nothing is spoken.

## Measured results

`scripts/live-dictation-benchmark.ts` streams the clean voice fixtures in real
time, in 100 ms frames, through an in-process hub and paired node to the
node's Parakeet worker, and compares the final text with the batch engine's
on the same audio. It also dictates the four clips joined by 0.5 s pauses
(35.5 s), three times. On development (Xeon W-2235, 4 threads, Parakeet Ultra
int8):

| Measure | Result | Target |
|---|---|---|
| First text after speech starts, p50 | 523 ms (clips 388–1,231 ms) | ≤ 1.5 s |
| Stop → final text, 35.5 s dictation, p50 | 251 ms (clips 334–815 ms) | ≤ 1 s |
| Word errors, the four clips | 4 of 77 words, the same as batch | ≤ batch |
| Word errors, 35.5 s dictation | 3 of 77 words per run; batch 34 of 77 | ≤ batch |

Three clips are 12 s or shorter and end with a whole decode; the 12.9 s one
ends with its confirmed words and a tail decode, and matched the batch text as
well. On the long dictation, live dictation did far better than the batch
engine, whose decode of the same audio dropped its English half. The one word
it lost there ("bhajans", where one speaker stops and another starts after the
pause) was left out by two passes in a row.

```bash
AGENTIC_REMOTE_PARAKEET_MODEL_DIR=<model directory> \
  node --import tsx scripts/live-dictation-benchmark.ts [--runs 3] [--show-text]
```
