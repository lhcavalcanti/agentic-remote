# Oracle Conversation Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a disabled-by-default, local realtime voice conversation path for Oracle with streaming STT, streamed TTS, exact-once turns, and barge-in.

**Architecture:** The browser runs Silero VAD and sends bounded 16 kHz PCM over a ticketed hub WebSocket. A hub coordinator submits final transcripts once to the existing manager agent, segments Oracle's replacement text stream, and relays speech work to a local or paired-node backend whose native engines run in an isolated resident child process. Stream, generation, utterance, and sequence identifiers reject stale work across cancellation and reconnect.

**Tech Stack:** TypeScript, React 19, Fastify WebSocket, Node child processes, `sherpa-onnx-node`, `@ricky0123/vad-web`, ONNX Runtime Web, Piper raw PCM, Vitest, Testing Library, Playwright.

**Spec:** `docs/design/oracle-conversation-mode.md`

## Global Constraints

- Keep `AGENTIC_REMOTE_ORACLE_VOICE=off` as the production default.
- Keep #398 dictation and upload-based Whisper behavior unchanged and available.
- Capture and transport 16 kHz mono PCM; never persist Conversation-mode raw audio or transcripts.
- Partial STT is display-only; each final utterance is submitted through `ManagerAgent.send` at most once.
- Tentative speech ducks locally; confirmed speech clears TTS and completes Oracle cancellation before final submission.
- Every asynchronous voice event is scoped by stream ID and generation; stale events are discarded at browser, hub, backend, and worker boundaries.
- Enforce explicit byte, duration, queue, timeout, and one-active-stream limits.
- Serve VAD, worklet, WASM, and model assets locally; never use a CDN or auto-download speech models at server startup.
- Resolve operator-configured model paths with `realpath`; browser messages cannot choose executable or model paths.
- Do not log PCM, transcripts, model output text, or pairing tokens.
- State clearly that STT/VAD/TTS are local while Oracle's Copilot inference is remote.
- Do not merge or deploy without explicit user authorization.

---

### Task 1: Versioned PCM Protocol and Bounded Queues

**Files:**
- Create: `shared/oracle-voice.ts`
- Create: `shared/oracle-voice.test.ts`
- Create: `src/oracle-voice/pcm.ts`
- Create: `src/oracle-voice/pcm.test.ts`
- Create: `src/oracle-voice/bounded-queue.ts`
- Create: `src/oracle-voice/bounded-queue.test.ts`

**Interfaces:**
- Produces: `VoiceCapabilities`, `VoiceClientControl`, `VoiceServerControl`, `VoiceAudioHeader`, `encodeVoiceAudioFrame`, `decodeVoiceAudioFrame`, `floatToPcm16`, `Pcm16Resampler`, and `BoundedQueue<T>`.
- Binary header: 24 bytes, little-endian; magic `ARVC`, protocol `1`, direction byte, generation `uint32`, sequence `uint32`, sample rate `uint32`, sample count `uint32`.
- Queue overflow throws `VoiceQueueOverflowError`; it never drops input silently.

- [ ] **Step 1: Write failing protocol and malformed-frame tests**

```ts
it('round-trips a generation-scoped PCM frame', () => {
  const pcm = new Int16Array([-32768, -1, 0, 32767])
  const encoded = encodeVoiceAudioFrame({
    direction: 'microphone',
    generation: 7,
    sequence: 11,
    sampleRate: 16_000,
    samples: pcm,
  })
  expect(decodeVoiceAudioFrame(encoded)).toEqual({
    direction: 'microphone',
    generation: 7,
    sequence: 11,
    sampleRate: 16_000,
    samples: pcm,
  })
})

it.each([
  new Uint8Array(12),
  new Uint8Array(24).fill(255),
])('rejects malformed binary input', (payload) => {
  expect(() => decodeVoiceAudioFrame(payload.buffer)).toThrow(VoiceProtocolError)
})
```

- [ ] **Step 2: Run the protocol test and confirm it fails**

Run: `pnpm vitest run shared/oracle-voice.test.ts`

Expected: FAIL because `shared/oracle-voice.ts` does not exist.

- [ ] **Step 3: Implement exact protocol constants, discriminated unions, and binary parsing**

```ts
export const ORACLE_VOICE_PROTOCOL = 1 as const
export const VOICE_AUDIO_HEADER_BYTES = 24
export type VoiceAudioDirection = 'microphone' | 'playback'

export interface VoiceAudioFrame {
  direction: VoiceAudioDirection
  generation: number
  sequence: number
  sampleRate: number
  samples: Int16Array
}

export function decodeVoiceAudioFrame(payload: ArrayBuffer): VoiceAudioFrame
export function encodeVoiceAudioFrame(frame: VoiceAudioFrame): ArrayBuffer
```

Define controls for `hello`, `start`, `speech_tentative`, `speech_confirmed`,
`speech_end`, `stop`, `partial`, `final`, `state`, `synthesize`, `cancel`,
`audio_end`, `error`, and `heartbeat`. Use exhaustive type guards that reject
unknown keys affecting routing identity.

- [ ] **Step 4: Write failing PCM conversion and stateful resampling tests**

```ts
it('clips floats and maps endpoints to signed PCM16', () => {
  expect([...floatToPcm16(new Float32Array([-2, -1, 0, 0.5, 1, 2]))])
    .toEqual([-32768, -32768, 0, 16384, 32767, 32767])
})

it('resamples split 48 kHz input without a boundary discontinuity', () => {
  const input = sineWave(48_000, 440, 0.2)
  const whole = new Pcm16Resampler(48_000, 16_000).push(input)
  const split = new Pcm16Resampler(48_000, 16_000)
  const pieces = concatInt16([
    split.push(input.subarray(0, 3_111)),
    split.push(input.subarray(3_111)),
  ])
  expect([...pieces]).toEqual([...whole])
})
```

- [ ] **Step 5: Implement saturating conversion and phase-preserving linear resampling**

```ts
export function floatToPcm16(samples: Float32Array): Int16Array

export class Pcm16Resampler {
  constructor(readonly inputRate: number, readonly outputRate = 16_000)
  push(samples: Float32Array): Int16Array
  reset(): void
}
```

Reject non-finite samples and rates outside 8-192 kHz. Retain interpolation
phase and the last input sample between calls.

- [ ] **Step 6: Write failing bounded-queue tests**

```ts
it('accounts bytes and refuses overflow without mutating the queue', () => {
  const queue = new BoundedQueue<Uint8Array>(6, (item) => item.byteLength)
  queue.push(new Uint8Array(4))
  expect(() => queue.push(new Uint8Array(3))).toThrow(VoiceQueueOverflowError)
  expect(queue.bytes).toBe(4)
  expect(queue.shift()?.byteLength).toBe(4)
})
```

- [ ] **Step 7: Implement queue accounting, clear, and abortable wait**

```ts
export class BoundedQueue<T> {
  constructor(maxBytes: number, sizeOf: (item: T) => number)
  push(item: T): void
  shift(): T | undefined
  wait(signal?: AbortSignal): Promise<T>
  clear(reason?: unknown): void
  readonly bytes: number
  readonly length: number
}
```

- [ ] **Step 8: Run Task 1 tests and commit**

Run: `pnpm vitest run shared/oracle-voice.test.ts src/oracle-voice/pcm.test.ts src/oracle-voice/bounded-queue.test.ts`

Expected: PASS.

```bash
git add shared/oracle-voice.ts shared/oracle-voice.test.ts src/oracle-voice
git commit -m "feat: define bounded Oracle voice protocol" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 2: Endpoint, Ordering, Deduplication, and Speakable Segments

**Files:**
- Create: `server/oracle-voice-turn.ts`
- Create: `server/oracle-voice-turn.test.ts`
- Create: `server/oracle-voice-segments.ts`
- Create: `server/oracle-voice-segments.test.ts`

**Interfaces:**
- Consumes: `VoiceAudioFrame` from Task 1.
- Produces: `VoiceTurnState.acceptFrame`, `confirmSpeech`, `hintSpeechEnd`, `finalize`, `advanceGeneration`, `rememberSubmission`, and `SpeakableSegmenter.update/finalize`.

- [ ] **Step 1: Write failing ordering and endpoint state tests**

```ts
it('accepts monotonic frames and rejects duplicate, old, and skipped sequences', () => {
  const turn = new VoiceTurnState({ maxAudioSamples: 160_000 })
  turn.confirmSpeech(3, 'utterance-a')
  expect(turn.acceptFrame(frame(3, 0))).toEqual({ accepted: true })
  expect(turn.acceptFrame(frame(3, 0))).toEqual({ accepted: false, reason: 'duplicate' })
  expect(turn.acceptFrame(frame(2, 1))).toEqual({ accepted: false, reason: 'stale-generation' })
  expect(() => turn.acceptFrame(frame(3, 2))).toThrow('out of order')
})

it('makes final submission IDs durable for the stream lifetime', () => {
  const turn = new VoiceTurnState()
  expect(turn.rememberSubmission('utterance-a')).toBe(true)
  expect(turn.rememberSubmission('utterance-a')).toBe(false)
})
```

- [ ] **Step 2: Run and confirm the turn-state tests fail**

Run: `pnpm vitest run server/oracle-voice-turn.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the explicit turn state machine**

```ts
export type VoiceTurnPhase =
  | 'idle'
  | 'tentative'
  | 'listening'
  | 'endpoint-pending'
  | 'finalized'
  | 'cancelled'

export class VoiceTurnState {
  confirmSpeech(generation: number, utteranceId: string): void
  acceptFrame(frame: VoiceAudioFrame): { accepted: boolean; reason?: string }
  hintSpeechEnd(generation: number): void
  finalize(generation: number, transcript: string): VoiceFinalTranscript
  rememberSubmission(utteranceId: string): boolean
  advanceGeneration(generation: number): void
}
```

Cap utterance samples, require generation increases by one, and keep submitted
utterance IDs until the socket closes.

- [ ] **Step 4: Write failing replacement-snapshot segmentation tests**

```ts
it('emits only completed new prose from replacement snapshots', () => {
  const segmenter = new SpeakableSegmenter('message-1')
  expect(segmenter.update('Hello there')).toEqual([])
  expect(segmenter.update('Hello there. I am check')).toEqual(['Hello there.'])
  expect(segmenter.update('Hello there. I am checking now.')).toEqual(['I am checking now.'])
})

it('does not speak fenced code, tables, URLs, or a rewritten suffix twice', () => {
  const segmenter = new SpeakableSegmenter('message-1')
  expect(segmenter.update('Result:\n```ts\nalert(1)\n```\nVisit https://example.com.\nDone.'))
    .toEqual(['Result:', 'Done.'])
  expect(segmenter.update('Result:\n```ts\nalert(2)\n```\nVisit https://example.com.\nDone.'))
    .toEqual([])
})
```

- [ ] **Step 5: Implement stable sentence extraction**

```ts
export class SpeakableSegmenter {
  constructor(messageId: string, maxSegmentCharacters = 320)
  update(replacementSnapshot: string): string[]
  finalize(finalSnapshot: string): string[]
  reset(messageId: string): void
}
```

Track emitted source offsets, sanitize Markdown without rendering HTML, and
invalidate only the unspoken suffix when a snapshot ceases to share the
previous prefix.

- [ ] **Step 6: Run Task 2 tests and commit**

Run: `pnpm vitest run server/oracle-voice-turn.test.ts server/oracle-voice-segments.test.ts`

Expected: PASS.

```bash
git add server/oracle-voice-turn.ts server/oracle-voice-turn.test.ts \
  server/oracle-voice-segments.ts server/oracle-voice-segments.test.ts
git commit -m "feat: enforce Oracle voice turn identity" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 3: Validated Voice Configuration and Worker Contract

**Files:**
- Create: `server/oracle-voice-config.ts`
- Create: `server/oracle-voice-config.test.ts`
- Create: `server/oracle-voice-engine.ts`
- Create: `server/oracle-voice-engine.test.ts`
- Create: `server/oracle-voice-worker-protocol.ts`
- Modify: `server/app.ts`

**Interfaces:**
- Produces: `OracleVoiceConfig`, `readOracleVoiceConfig(dataDirectory)`, `VoiceSttEngine`, `VoiceTtsEngine`, `VoiceEngineFactory`, and typed parent/child IPC messages.
- `BuildAppOptions` accepts `voiceEngineFactory?: VoiceEngineFactory` for deterministic tests.

- [ ] **Step 1: Write failing feature-flag and path-validation tests**

```ts
it('is disabled without an explicit on value', async () => {
  expect(await readOracleVoiceConfig(dataDir, {})).toEqual({ enabled: false })
})

it('rejects a symlinked model file escaping the configured model directory', async () => {
  await expect(readOracleVoiceConfig(dataDir, enabledEnv({
    AGENTIC_REMOTE_VOICE_STT_MODEL_DIR: modelDirWithEscapingSymlink,
  }))).rejects.toThrow('must stay inside')
})
```

- [ ] **Step 2: Run and confirm configuration tests fail**

Run: `pnpm vitest run server/oracle-voice-config.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement strict environment parsing and canonical path checks**

```ts
export type OracleVoiceConfig =
  | { enabled: false }
  | {
      enabled: true
      computerName?: string
      language: string
      threads: number
      endpointMs: number
      stt: {
        profile: 'zipformer' | 'nemotron'
        modelDirectory: string
      }
      tts: {
        binary: string
        model: string
        config: string
        speaker?: number
      }
    }

export async function readOracleVoiceConfig(
  dataDirectory: string,
  env?: NodeJS.ProcessEnv,
): Promise<OracleVoiceConfig>
```

Use ranges: threads `1..16`, endpoint `300..3000` ms, language `1..35`
printable characters, speaker non-negative integer. Return disabled before
touching model paths.

- [ ] **Step 4: Write failing fake-engine lifecycle and cancellation tests**

```ts
it('cancels generation-scoped STT and TTS without late callbacks', async () => {
  const engine = new FakeVoiceEngine()
  const seen: VoiceEngineEvent[] = []
  engine.onEvent((event) => seen.push(event))
  await engine.startUtterance({ generation: 4, utteranceId: 'u4', language: 'en' })
  await engine.synthesize({ generation: 4, segmentId: 's4', text: 'Hello.' })
  await engine.cancelGeneration(4)
  engine.emitLateEventsForTest(4)
  expect(seen).toEqual([])
})
```

- [ ] **Step 5: Define narrow engine and IPC contracts**

```ts
export interface VoiceSttEngine {
  start(input: VoiceStartUtterance): Promise<void>
  accept(frame: VoiceAudioFrame): Promise<void>
  end(input: VoiceEndUtterance): Promise<void>
  cancel(generation: number): Promise<void>
  close(): Promise<void>
}

export interface VoiceTtsEngine {
  synthesize(input: VoiceSynthesisRequest): Promise<void>
  cancel(generation: number): Promise<void>
  close(): Promise<void>
}
```

The factory emits typed partial, final, audio, audio-end, readiness, heartbeat,
and fatal-error events. Fakes must support delayed and stale event injection.

- [ ] **Step 6: Wire configuration construction without starting a worker**

Add `voiceConfig` and injectable `voiceEngineFactory` to `buildApp`. Do not
register routes or load native modules yet. A disabled or invalid voice
configuration must leave `/health`, Oracle, and transcription behavior intact;
invalid enabled configuration is reported as an unavailable capability rather
than crashing the hub.

- [ ] **Step 7: Run Task 3 tests and commit**

Run: `pnpm vitest run server/oracle-voice-config.test.ts server/oracle-voice-engine.test.ts server/app-build.test.ts`

Expected: PASS.

```bash
git add server/oracle-voice-config.ts server/oracle-voice-config.test.ts \
  server/oracle-voice-engine.ts server/oracle-voice-engine.test.ts \
  server/oracle-voice-worker-protocol.ts server/app.ts
git commit -m "feat: validate local Oracle voice engines" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 4: Resident sherpa STT and Piper TTS Child

**Files:**
- Create: `server/oracle-voice-worker.ts`
- Create: `server/oracle-voice-child.ts`
- Create: `server/oracle-voice-child.test.ts`
- Create: `server/sherpa-onnx-node.d.ts`
- Create: `scripts/oracle-voice-engine-smoke.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: Task 3 IPC and engine contracts.
- Produces: `ChildVoiceEngine` implementing the engine factory and a forked
  worker entry that dynamically imports `sherpa-onnx-node`.

- [ ] **Step 1: Add the pinned native dependency**

Run: `pnpm add sherpa-onnx-node@1.13.8`

Expected: manifest and lockfile change; platform binaries remain optional
dependencies selected by pnpm.

- [ ] **Step 2: Add focused declarations for only used sherpa APIs**

```ts
declare module 'sherpa-onnx-node' {
  export class OnlineRecognizer {
    constructor(config: OnlineRecognizerConfig)
    createStream(): OnlineStream
    isReady(stream: OnlineStream): boolean
    decode(stream: OnlineStream): void
    isEndpoint(stream: OnlineStream): boolean
    getResult(stream: OnlineStream): { text: string }
    reset(stream: OnlineStream): void
  }
}
```

Declare `acceptWaveform`, `inputFinished`, and stream `setOption` without
introducing `any`.

- [ ] **Step 3: Write failing parent lifecycle, heartbeat, crash, and timeout tests**

```ts
it('surfaces worker exit and rejects pending operations', async () => {
  const child = fakeChildProcess()
  const engine = new ChildVoiceEngine(config, { fork: () => child })
  const ready = engine.initialize()
  child.emit('exit', 139, null)
  await expect(ready).rejects.toThrow('voice worker exited')
  expect(engine.capability().available).toBe(false)
})
```

Cover startup timeout, missing heartbeat, graceful close, SIGTERM then
SIGKILL timeout, malformed IPC, no orphan process, and no stale events after
cancel.

- [ ] **Step 4: Implement parent supervision**

```ts
export class ChildVoiceEngine implements VoiceEngineFactory {
  initialize(config: EnabledOracleVoiceConfig): Promise<VoiceEngineSession>
  stop(): Promise<void>
  capability(): VoiceBackendCapability
}
```

Fork with an explicit entry path and minimal environment. Never send tokens or
transcripts to logs. Bound pending requests and reject all of them on exit.

- [ ] **Step 5: Write failing worker tests with a fake sherpa module and fake Piper process**

```ts
it('emits changing partials and exactly one final after endpoint', async () => {
  const worker = createWorkerHarness({ sherpa: fakeSherpa(['hel', 'hello']), piper: fakePiper() })
  await worker.startUtterance(start(1, 'u1'))
  await worker.accept(frame(1, 0))
  await worker.end(end(1, 'u1'))
  expect(worker.eventsOfType('partial').map((event) => event.text)).toEqual(['hel', 'hello'])
  expect(worker.eventsOfType('final')).toHaveLength(1)
})
```

Cover language pinning, endpoint recognition, tail silence, maximum utterance,
Piper stdin framing, partial stdout chunks, non-zero exit, stderr truncation,
generation cancellation, and TTS backpressure.

- [ ] **Step 6: Implement resident sherpa and Piper adapters**

Construct one `OnlineRecognizer` at child startup. Create/reset a stream per
utterance, decode while ready after each frame, and emit a partial only when
text changes. On speech end, feed bounded silence and `inputFinished`, decode
until not ready, and emit one final.

Spawn Piper once per segment with:

```ts
[
  '--model', config.tts.model,
  '--config', config.tts.config,
  '--output-raw',
  ...(speaker === undefined ? [] : ['--speaker', String(speaker)]),
]
```

Write one segment to stdin, split stdout into even-byte PCM16 chunks, emit
24 kHz playback frames, and kill the exact child PID on cancellation.

- [ ] **Step 7: Run Task 4 tests and a real engine smoke**

Run:

```bash
pnpm vitest run server/oracle-voice-child.test.ts
AGENTIC_REMOTE_VOICE_STT_MODEL_DIR="$VOICE_STT_MODEL" \
AGENTIC_REMOTE_VOICE_TTS_BIN="$VOICE_PIPER_BIN" \
AGENTIC_REMOTE_VOICE_TTS_MODEL="$VOICE_PIPER_MODEL" \
AGENTIC_REMOTE_VOICE_TTS_CONFIG="$VOICE_PIPER_CONFIG" \
pnpm tsx scripts/oracle-voice-engine-smoke.ts "$VOICE_TEST_WAV"
```

Expected: test PASS; smoke prints partial, final, first-audio latency, RTF, and
RSS without writing a recording.

- [ ] **Step 8: Commit the worker**

```bash
git add package.json pnpm-lock.yaml server/sherpa-onnx-node.d.ts \
  server/oracle-voice-worker.ts server/oracle-voice-child.ts \
  server/oracle-voice-child.test.ts scripts/oracle-voice-engine-smoke.ts
git commit -m "feat: run resident local voice engines" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 5: Authenticated Node Voice Transport

**Files:**
- Create: `server/oracle-voice-session.ts`
- Create: `server/oracle-voice-session.test.ts`
- Create: `server/remote-voice-client.ts`
- Create: `server/remote-voice-client.test.ts`
- Modify: `server/node-routes.ts`
- Modify: `server/remote-node-client.ts`
- Modify: `shared/contracts.ts`
- Modify: `server/multi-node.test.ts`

**Interfaces:**
- Produces: `VoiceBackendSession`, `/node-api/oracle-voice`, node
  `voice?: VoiceBackendCapability`, and `RemoteVoiceClient`.
- Node WebSocket requires the existing bearer token during upgrade.

- [ ] **Step 1: Write failing local session tests for limits and stale work**

```ts
it('closes on a skipped sequence before passing audio to the engine', async () => {
  const session = voiceSession(fakeEngine(), limits)
  await session.control(confirm(2, 'u2'))
  await session.audio(frame(2, 0))
  await expect(session.audio(frame(2, 2))).rejects.toMatchObject({ closeCode: 1008 })
  expect(fakeEngine().acceptedSequences).toEqual([0])
})
```

Cover max frame bytes, two seconds of input queue, 30-second utterance, idle
timeout, heartbeat, one final, and cleanup on socket close.

- [ ] **Step 2: Implement `VoiceBackendSession` around the worker**

```ts
export interface VoiceBackendSession {
  control(message: VoiceClientControl): Promise<void>
  audio(frame: VoiceAudioFrame): Promise<void>
  close(reason: string): Promise<void>
}
```

Serialize control transitions, but let bounded audio enqueue independently.
Worker events use a single outbound queue and preserve event order.

- [ ] **Step 3: Write node upgrade authentication tests**

Use a real listening Fastify test server and `ws`:

```ts
await expect(openNodeVoiceSocket(url)).rejects.toMatchObject({ statusCode: 401 })
const socket = await openNodeVoiceSocket(url, `Bearer ${identity.tokenForTest()}`)
expect(await nextJson(socket)).toMatchObject({ type: 'hello', protocol: 1 })
```

Also reject invalid protocol, missing backend, and a second concurrent stream.

- [ ] **Step 4: Register the authenticated node socket and capability**

Extend `registerNodeRoutes` with an optional voice backend. The existing
`onRequest` token check must execute for the WebSocket route. Advertise only
non-sensitive capability fields: availability, language, profile, sample
rates, resource class, and unavailable reason.

- [ ] **Step 5: Write remote relay tests**

```ts
it('forwards binary frames and preserves control ordering', async () => {
  const remote = await RemoteVoiceClient.connect(computer, streamId)
  await remote.send(confirm(1, 'u1'))
  await remote.send(frame(1, 0))
  expect(node.received).toEqual([confirm(1, 'u1'), frame(1, 0)])
})
```

Cover bearer auth, redirect refusal, connect timeout, node disconnect,
backpressure, stop, and no reconnect/replay inside an active stream.

- [ ] **Step 6: Implement `RemoteVoiceClient`**

Create a dedicated node WebSocket per browser voice stream. Set the pairing
authorization header, validate every incoming payload, expose engine-equivalent
events, and abort immediately when the node's registration lifetime changes.

- [ ] **Step 7: Run Task 5 tests and commit**

Run: `pnpm vitest run server/oracle-voice-session.test.ts server/remote-voice-client.test.ts server/multi-node.test.ts`

Expected: PASS.

```bash
git add shared/contracts.ts server/oracle-voice-session.ts \
  server/oracle-voice-session.test.ts server/remote-voice-client.ts \
  server/remote-voice-client.test.ts server/node-routes.ts \
  server/remote-node-client.ts server/multi-node.test.ts
git commit -m "feat: relay voice through paired computers" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 6: Hub Tickets, Oracle Coordinator, and Exact-Once Submission

**Files:**
- Create: `server/oracle-voice-tickets.ts`
- Create: `server/oracle-voice-tickets.test.ts`
- Create: `server/oracle-voice-coordinator.ts`
- Create: `server/oracle-voice-coordinator.test.ts`
- Create: `server/oracle-voice-routes.ts`
- Create: `server/oracle-voice-routes.test.ts`
- Modify: `server/app.ts`
- Modify: `server/manager-routes.ts`
- Modify: `server/hub-routes.ts`

**Interfaces:**
- Consumes: `ManagerRouteAgent`, `ManagerEventSource`, local/remote backend
  factory, Tasks 2 and 5.
- Produces: capability/ticket/socket routes and
  `OracleVoiceCoordinator`.

- [ ] **Step 1: Write failing ticket tests**

```ts
it('consumes a same-origin ticket once and expires it', () => {
  const tickets = new VoiceTicketStore({ ttlMs: 30_000, now: clock.now })
  const ticket = tickets.issue({ origin: 'https://hub.test', address: '10.0.0.4' })
  expect(tickets.consume(ticket, sameClient)).toBeTruthy()
  expect(tickets.consume(ticket, sameClient)).toBeUndefined()
  clock.advance(30_001)
  expect(tickets.consume(tickets.issue(sameClient), sameClient)).toBeUndefined()
})
```

- [ ] **Step 2: Implement random, hashed, bounded single-use tickets**

Store only SHA-256 ticket hashes, cap outstanding tickets at 64, and prune on
issue/consume. Bind to normalized Origin and remote address. Never log ticket
values.

- [ ] **Step 3: Write failing coordinator tests**

```ts
it('submits one final transcript once after confirmed interruption cancels Oracle', async () => {
  const coordinator = harness()
  await coordinator.receive(confirm(5, 'u5'))
  coordinator.backend.emit(final(5, 'u5', 'Please stop and check tests.'))
  coordinator.backend.emit(final(5, 'u5', 'Please stop and check tests.'))
  await coordinator.idle()
  expect(coordinator.calls).toEqual([
    'tts.cancel:4',
    'manager.cancel',
    'manager.send:Please stop and check tests.',
  ])
})
```

Cover display-only partials, cancel timeout, failed send returned to composer,
queue semantics, replacement deltas, sentence ordering, final suffix, stale
manager events, stale TTS audio, disconnect, and selected paired-node loss.

- [ ] **Step 4: Implement coordinator sequencing**

```ts
export class OracleVoiceCoordinator {
  start(): Promise<void>
  receive(message: VoiceClientControl | VoiceAudioFrame): Promise<void>
  managerEvent(event: ManagerEvent): Promise<void>
  close(reason: string): Promise<void>
}
```

Record the utterance ID before awaiting `ManagerRouteAgent.send`. On confirmed
speech, await backend TTS cancellation and `ManagerRouteAgent.cancel` with a
bounded timeout before allowing final submission. Use the same defaults and
Ask/Delegate selection that the browser sends at stream start.

- [ ] **Step 5: Write route origin, ticket, busy, and cleanup tests**

```ts
const ticket = await app.inject({
  method: 'POST',
  url: '/api/oracle-voice/tickets',
  headers: { host: 'hub.test', origin: 'https://evil.test' },
})
expect(ticket.statusCode).toBe(403)
```

Use a listening server for successful WebSocket tests. Verify unticketed and
reused tickets fail, one active stream returns 409/close 1013, socket close
releases the backend, and disabled voice returns an explicit capability.

- [ ] **Step 6: Register hub routes and lifecycle**

Construct the local backend on every role when configured. On the hub, select
the configured paired computer by exact name or local backend when blank.
Register `/api/oracle-voice/*` under the existing Host/Origin hook. Add
`voiceService.stop()` to `onClose` before stopping session services.

- [ ] **Step 7: Run Task 6 tests and commit**

Run: `pnpm vitest run server/oracle-voice-tickets.test.ts server/oracle-voice-coordinator.test.ts server/oracle-voice-routes.test.ts server/api-origin.test.ts server/manager-routes.test.ts`

Expected: PASS.

```bash
git add server/oracle-voice-tickets.ts server/oracle-voice-tickets.test.ts \
  server/oracle-voice-coordinator.ts server/oracle-voice-coordinator.test.ts \
  server/oracle-voice-routes.ts server/oracle-voice-routes.test.ts \
  server/app.ts server/manager-routes.ts server/hub-routes.ts
git commit -m "feat: coordinate realtime speech with Oracle" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 7: Browser VAD Capture, Reconnect, and Streaming Playback

**Files:**
- Create: `src/oracle-voice/client.ts`
- Create: `src/oracle-voice/client.test.ts`
- Create: `src/oracle-voice/capture.ts`
- Create: `src/oracle-voice/capture.test.ts`
- Create: `src/oracle-voice/playback.ts`
- Create: `src/oracle-voice/playback.test.ts`
- Create: `src/oracle-voice/vad-assets.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: `OracleVoiceClient`, `VoiceCapture`, `VoicePlayback`, and locally
  resolved VAD asset URLs.

- [ ] **Step 1: Add pinned browser VAD dependencies**

Run: `pnpm add @ricky0123/vad-web@0.0.31 onnxruntime-web@1.24.2`

Expected: dependency and lockfile changes only.

- [ ] **Step 2: Write failing capture tests**

```ts
it('buffers tentative pre-roll, flushes it once on confirmation, and emits 16 kHz PCM', async () => {
  const capture = harness({ inputRate: 48_000 })
  capture.frame(silenceFrame)
  capture.tentative()
  capture.frame(speechFrame)
  capture.confirmed()
  capture.frame(speechFrame)
  expect(capture.sentControls()).toEqual([tentative(1), confirmed(1, expect.any(String))])
  expect(capture.sentAudio().every((frame) => frame.sampleRate === 16_000)).toBe(true)
})
```

Cover permission denied, no media devices, no AudioWorklet, stop while
permission is pending, VAD misfire gain restore, pre-roll cap, frame queue
overflow, and microphone track release.

- [ ] **Step 3: Implement MicVAD capture with local assets**

Create one user-gesture `getUserMedia` call and pass its stream into `MicVAD`.
Require `AudioWorkletNode` before loading the VAD chunk. Configure
`baseAssetPath`, `onnxWASMBasePath`, and model URLs from Vite `?url` imports;
never default to the package CDN. Convert frames to PCM16 and sequence them.

- [ ] **Step 4: Write failing playback tests with a fake audio clock**

```ts
it('ducks tentatively and clears old generation sources on confirmation', () => {
  const playback = harness()
  playback.enqueue(audio(2, 0, 24_000))
  playback.tentativeSpeech()
  expect(playback.gain()).toBeCloseTo(0.12)
  playback.confirmSpeech(3)
  expect(playback.stoppedGenerations()).toContain(2)
  expect(playback.queuedSeconds).toBe(0)
})
```

Cover monotonic audio sequence, 8-second cap, stale generation, scheduled
source cleanup, sample-rate conversion by Web Audio, and audio-context close.

- [ ] **Step 5: Implement separate playback context and bounded scheduling**

Use one gain node and scheduled `AudioBufferSourceNode`s. Reject a frame gap,
cap queued future audio at eight seconds, and remove ended sources. Tentative
speech ramps to 0.12 over 20 ms; misfire restores to 1 over 80 ms; confirmed
speech stops all sources immediately.

- [ ] **Step 6: Write failing client reconnect tests**

```ts
it('reconnects as a fresh stream without replaying frames', async () => {
  const client = harness()
  await client.start()
  client.send(frame(1, 0))
  client.socket.close(1006)
  await client.advanceReconnect()
  expect(client.ticketRequests).toBe(2)
  expect(client.secondSocket.binaryMessages).toEqual([])
  expect(client.state()).toBe('listening')
})
```

Cover ticket failure, protocol mismatch, exponential delays `0.5/1/2/4/8` s,
manual stop cancelling reconnect, final transcript events, slow-consumer close,
and explicit fatal errors.

- [ ] **Step 7: Implement ticketed WebSocket client**

`OracleVoiceClient.start` fetches capability then a ticket, opens the socket,
validates hello, and only then starts capture. State callbacks are typed:

```ts
type OracleVoiceUiState =
  | 'off' | 'starting' | 'listening' | 'speech'
  | 'transcribing' | 'thinking' | 'speaking'
  | 'interrupted' | 'reconnecting' | 'error'
```

- [ ] **Step 8: Run Task 7 tests and commit**

Run: `pnpm vitest run src/oracle-voice/pcm.test.ts src/oracle-voice/capture.test.ts src/oracle-voice/playback.test.ts src/oracle-voice/client.test.ts`

Expected: PASS.

```bash
git add package.json pnpm-lock.yaml vite.config.ts src/oracle-voice
git commit -m "feat: stream browser speech and playback" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 8: Oracle Conversation UI and Accessibility

**Files:**
- Create: `src/use-oracle-conversation.ts`
- Create: `src/use-oracle-conversation.test.tsx`
- Modify: `src/api.ts`
- Modify: `src/api.test.ts`
- Modify: `src/ManagerAssistant.tsx`
- Modify: `src/ManagerAssistant.test.tsx`
- Modify: `src/index.css`
- Modify: `server/composer-layout.test.ts`
- Modify: `server/safe-area.test.ts`

**Interfaces:**
- Consumes: `OracleVoiceClient` and capability/ticket API.
- Produces: `useOracleConversation` and explicit composer UI states.

- [ ] **Step 1: Load the repository `frontend-design` skill before editing UI**

Apply product-workspace, accessibility, mobile input, motion, and performance
rules while preserving the established Oracle panel language.

- [ ] **Step 2: Add capability and ticket API tests**

```ts
it('requests a no-store Oracle voice ticket', async () => {
  mockFetchJson({ ticket: 'voice-ticket', expiresAt: '2026-10-16T00:00:30Z' })
  await expect(createOracleVoiceTicket()).resolves.toMatchObject({ ticket: 'voice-ticket' })
  expect(fetch).toHaveBeenCalledWith('/api/oracle-voice/tickets', expect.objectContaining({ method: 'POST' }))
})
```

- [ ] **Step 3: Implement typed API helpers and hook lifecycle**

```ts
export function useOracleConversation(options: {
  defaults: ManagerClientDefaults
  answerOnly: boolean
  open: boolean
  onFinalTranscript: (text: string) => void
  onError: (message: string) => void
}): {
  capability?: VoiceCapabilities
  state: OracleVoiceUiState
  partial: string
  error?: string
  start(): Promise<void>
  stop(): void
}
```

Closing the panel stops Conversation mode. StrictMode mount/unmount must not
keep a stream, socket, microphone, or audio context alive.

- [ ] **Step 4: Write failing component tests for all user-visible states**

```tsx
it.each([
  ['listening', 'Listening'],
  ['speech', 'Speech detected'],
  ['transcribing', 'Transcribing'],
  ['thinking', 'Oracle is thinking'],
  ['speaking', 'Speaking'],
  ['interrupted', 'Interrupted'],
  ['reconnecting', 'Reconnecting'],
])('shows %s state as text', (state, label) => {
  voiceHook.mockReturnValue(voiceState(state))
  renderManager()
  expect(screen.getByText(label)).toBeVisible()
})
```

Also test permission denial, unsupported AudioWorklet, local/remote privacy
copy, partial text, explicit Start/Stop, dictation availability while off,
dictation disabled while conversation owns the microphone, panel close, mobile
viewport, keyboard focus, reduced motion, and switching back to dictation.

- [ ] **Step 5: Implement the composer UI**

Add a compact Conversation pill beside dictation. While active, replace the
normal recording panel with a status strip containing state, partial
transcript, privacy text, and Stop. Do not mutate the typed draft with partials.
On a failed final submission, place the final text in the draft once.

- [ ] **Step 6: Add responsive, accessible styling**

Keep a 44 px touch target, safe-area padding, visible focus, non-color state
text, and `prefers-reduced-motion` guards. Avoid a waveform animation; use the
existing restrained activity marker.

- [ ] **Step 7: Run Task 8 tests and commit**

Run:

```bash
pnpm vitest run src/api.test.ts src/use-oracle-conversation.test.tsx \
  src/ManagerAssistant.test.tsx server/composer-layout.test.ts server/safe-area.test.ts
```

Expected: PASS.

```bash
git add src/api.ts src/api.test.ts src/use-oracle-conversation.ts \
  src/use-oracle-conversation.test.tsx src/ManagerAssistant.tsx \
  src/ManagerAssistant.test.tsx src/index.css server/composer-layout.test.ts \
  server/safe-area.test.ts
git commit -m "feat: add Oracle Conversation controls" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 9: Explicit Model Installation, Configuration, Docs, and Version

**Files:**
- Create: `config/oracle-voice-profiles.json`
- Create: `docs/oracle-conversation.md`
- Create: `docs/licenses/oracle-voice.md`
- Create: `server/oracle-voice-assets.test.ts`
- Modify: `bin/agentic-remote`
- Modify: `server/promotion-setup.test.ts`
- Modify: `README.md`
- Modify: `docs/app-spec.md`
- Modify: `docs/architecture.md`
- Modify: `docs/design/session-manager.md`
- Modify: `package.json`
- Modify: `shell/package.json`
- Modify: `shell/src-tauri/tauri.conf.json`
- Modify: `shell/src-tauri/Cargo.toml`
- Modify: `shell/src-tauri/Cargo.lock`
- Modify: `shell/README.md`

**Interfaces:**
- Produces: `agentic-remote voice-install <profile>` and preserved voice env.
- Profiles include exact URL, byte size, SHA-256, license URL, language, and
  model type.

- [ ] **Step 1: Add failing manifest integrity and installer tests**

```ts
it('pins every voice asset by HTTPS URL, bytes, sha256, and license', () => {
  for (const profile of manifest.profiles) {
    for (const asset of profile.assets) {
      expect(asset.url).toMatch(/^https:\/\//)
      expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(asset.bytes).toBeGreaterThan(0)
      expect(asset.licenseUrl).toMatch(/^https:\/\//)
    }
  }
})
```

Shell tests must prove checksum mismatch leaves the active profile unchanged,
partial extraction is cleaned, a profile license is printed before download,
and `setup` performs no voice download.

- [ ] **Step 2: Create pinned profiles from measured assets**

Include:

- `fast-en`: measured small streaming sherpa model plus Piper Lessac;
- `multilingual-quality`: Nemotron 3.5 160 ms int8 plus configured TTS voice;
- no automatic/default profile.

Record exact upstream notices and the GPL implications of Piper/eSpeak.

- [ ] **Step 3: Implement atomic explicit install**

Download to `$AGENTIC_REMOTE_DATA_DIR/models/oracle-voice/.staging-*`, verify
byte count and SHA-256 before extraction, reject archive path traversal, write
license notices, then rename to the final versioned directory. Print the exact
environment variables the operator must enable; do not edit the environment
file automatically.

- [ ] **Step 4: Preserve voice configuration in setup**

Read and rewrite every `AGENTIC_REMOTE_VOICE_*` value already in the protected
environment file with mode `0600`, matching manager and transcription
preservation. Never print the paired token or voice transcripts.

- [ ] **Step 5: Update normative and operator documentation**

Document topology, privacy boundary, state semantics, feature flag, local and
remote profiles, browser support, English/Portuguese status, fallback,
installation, uninstall, troubleshooting, benchmark limitations, and licenses.

- [ ] **Step 6: Apply one minor version bump**

Rebase on the eventual target first. If the base remains `1.17.0`, set all
shipped versions to `1.18.0`; otherwise increment the current target minor
once. Keep `package.json`, shell manifests, Cargo lock, and bundle examples
synchronized.

- [ ] **Step 7: Run packaging/version tests and commit**

Run:

```bash
pnpm vitest run server/oracle-voice-assets.test.ts \
  server/promotion-setup.test.ts server/version-policy.test.ts
```

Expected: PASS.

```bash
git add config/oracle-voice-profiles.json docs/oracle-conversation.md \
  docs/licenses/oracle-voice.md bin/agentic-remote README.md docs/app-spec.md \
  docs/architecture.md docs/design/session-manager.md package.json \
  shell/package.json shell/src-tauri/tauri.conf.json \
  shell/src-tauri/Cargo.toml shell/src-tauri/Cargo.lock shell/README.md \
  server/oracle-voice-assets.test.ts server/promotion-setup.test.ts
git commit -m "docs: package local Oracle voice profiles" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 10: Cross-Layer Integration and Security Tests

**Files:**
- Create: `server/oracle-voice-integration.test.ts`
- Create: `server/oracle-voice-security.test.ts`

**Interfaces:**
- Consumes all server layers and deterministic fake workers.
- Produces no new production interface.

- [ ] **Step 1: Add browser-to-local-hub integration tests**

Exercise: start, ordered PCM, partial, endpoint, one final manager submission,
manager deltas, two TTS segments, ordered audio, final audio-end, and cleanup.

```ts
expect(manager.send).toHaveBeenCalledTimes(1)
expect(manager.send).toHaveBeenCalledWith('Run the focused tests.', defaults, { answerOnly: true })
expect(browser.audioGenerations()).toEqual([1, 1])
```

- [ ] **Step 2: Add hub-to-node integration tests**

Use two listening Fastify apps and a paired token. Exercise the same full flow
with compute on the node. Verify no whole audio body is buffered at the hub and
node disconnect becomes an explicit reconnecting/error sequence.

- [ ] **Step 3: Add failure and race integration tests**

Cover disconnect during capture, STT, Oracle thinking, TTS, and playback;
duplicate/out-of-order frames; worker crash; slow browser; slow node; Oracle
cancel timeout; rapid generation `7 -> 8 -> 9`; fallback after unavailable
voice; and no duplicate manager messages.

- [ ] **Step 4: Add security/privacy tests**

Reject cross-origin ticket and upgrade, missing/invalid node auth, oversized
and malformed audio, control floods, excessive outstanding tickets, forbidden
model paths, unsupported language/profile combinations, and transcript/PCM
content in captured logs.

- [ ] **Step 5: Run the integration/security suite repeatedly**

Run:

```bash
pnpm vitest run server/oracle-voice-integration.test.ts \
  server/oracle-voice-security.test.ts --repeat=10
```

Expected: ten clean passes, no unhandled rejection or leaked-handle warning.

- [ ] **Step 6: Commit**

```bash
git add server/oracle-voice-integration.test.ts \
  server/oracle-voice-security.test.ts server/oracle-voice-*.ts
git commit -m "test: exercise Oracle voice boundaries" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 11: Browser E2E, Real Corpus, Benchmark, and Soak

**Files:**
- Create: `e2e/oracle-conversation.test.ts`
- Create: `e2e/fixtures/fake-voice.ts`
- Create: `scripts/oracle-voice-benchmark.ts`
- Create: `scripts/oracle-voice-soak.ts`
- Create: `fixtures/voice/README.md`
- Add only redistributable/generated audio fixtures with source, author,
  license, expected transcript, language, speaker, and checksum recorded.
- Modify: `playwright.config.ts`

**Interfaces:**
- Test-only fake engines are activated only by an injected `BuildAppOptions`
  factory or test process environment unavailable in production.

- [ ] **Step 1: Add deterministic browser E2E**

Cover permission granted/denied, start/stop, partial UI, a complete turn,
multiple turns, barge-in while speaking, three rapid interruptions, network
drop/recovery, 390x844 viewport, and switching back to dictation.

```ts
await page.getByRole('button', { name: 'Start Conversation' }).click()
await fakeVoice.speak('What is running?')
await expect(page.getByText('What is running?')).toBeVisible()
await fakeVoice.oracleDelta('Two sessions are still running.')
await expect.poll(() => fakeVoice.playedText()).toContain('Two sessions are still running.')
```

- [ ] **Step 2: Run Chromium, Firefox, and available WebKit tests**

Run:

```bash
pnpm playwright test e2e/oracle-conversation.test.ts --project=chromium
pnpm playwright test e2e/oracle-conversation.test.ts --project=firefox
pnpm playwright test e2e/oracle-conversation.test.ts --project=webkit
```

Report unsupported host-browser behavior explicitly; do not mark skipped
families as passed.

- [ ] **Step 3: Build the licensed quality corpus**

Include clean/noisy English and Brazilian Portuguese, short/long utterances,
silence, false starts, background speech, and two speakers. Generate noise and
silence locally. Use only public-domain/CC0/CC-BY fixtures and record
attribution; do not commit user recordings.

- [ ] **Step 4: Implement benchmark output**

Write JSON and Markdown with:

```ts
interface VoiceBenchmarkRow {
  fixture: string
  language: string
  wer: number
  firstPartialMs?: number
  finalAfterSpeechMs: number
  sttRtf: number
  ttsFirstAudioMs: number
  ttsRtf: number
  peakRssMiB: number
  sustainedCpuPercent: number
}
```

Compare selected profiles with the existing Whisper baseline. Label measured
and derived values separately.

- [ ] **Step 5: Exercise one real end-to-end path including interruption**

Start a sandbox hub with its own data directory, allowed origin, tmux root,
fake Oracle runtime, and real sherpa/Piper worker. Stream a fixture through the
actual hub WebSocket, observe final manager submission, stream a fake Oracle
delta through real Piper, consume audio, begin a second utterance during
playback, and prove old-generation audio stops.

- [ ] **Step 6: Run the 30-minute soak and start/stop race**

Run:

```bash
pnpm tsx scripts/oracle-voice-soak.ts --minutes 30 --turns-per-minute 6 \
  --rapid-start-stop 500 --output "$SESSION_ARTIFACTS/oracle-voice-soak.json"
```

Assert bounded queue bytes, one manager send per utterance, no orphan child
PIDs, no open sockets after stop, final RSS slope below 1 MiB/minute, and no
unhandled rejection.

- [ ] **Step 7: Commit tests and redistributable fixtures**

```bash
git add e2e/oracle-conversation.test.ts e2e/fixtures/fake-voice.ts \
  scripts/oracle-voice-benchmark.ts scripts/oracle-voice-soak.ts \
  fixtures/voice playwright.config.ts
git commit -m "test: validate realtime Oracle conversation" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Keep raw benchmark and soak output in the session workspace; commit only the
concise reproducible table required by operator docs.

### Task 12: Full Verification, Security Review, Graph, and Pull Request

**Files:**
- Regenerate: `graphify/graph.json`
- Regenerate: `graphify/graph.html`
- Regenerate: `graphify/GRAPH_REPORT.md`
- Regenerate: `graphify/communities.json`
- Regenerate: `graphify/metadata.json`

**Interfaces:**
- Produces the reviewed feature branch and focused PR. Does not merge or deploy.

- [ ] **Step 1: Run targeted critical races three more times**

Run:

```bash
for run in 1 2 3; do
  pnpm vitest run server/oracle-voice-integration.test.ts \
    server/oracle-voice-security.test.ts src/oracle-voice/client.test.ts
done
```

Expected: all passes without timing retries.

- [ ] **Step 2: Run repository gates**

Run:

```bash
pnpm check
NODE_ENV=production pnpm check
pnpm test:e2e
```

Expected: all gates pass; inspect output for warnings, unhandled rejections,
leaked handles, and deprecations. Distinguish unchanged baseline warnings.

- [ ] **Step 3: Verify from a clean install**

Create a temporary clean worktree at the exact feature head, run
`CI=true pnpm install --frozen-lockfile`, `pnpm check`, and the deterministic
voice E2E. Remove only that verified clean temporary worktree.

- [ ] **Step 4: Run the required security review**

Invoke the `security-review` agent over the feature diff with emphasis on
microphone permissions, ticket/auth/origin boundaries, malformed PCM,
backpressure/DoS, path validation, child execution, log redaction, and
retention. Fix all confirmed findings, rerun affected tests, then rerun both
full gates.

- [ ] **Step 5: Refresh and verify Graphify**

```bash
git add shared/oracle-voice.ts src/oracle-voice server/oracle-voice-*.ts
python3 graphify/manage.py update
python3 graphify/manage.py check
git add graphify/graph.json graphify/graph.html graphify/GRAPH_REPORT.md \
  graphify/communities.json graphify/metadata.json
git commit -m "chore: refresh code graph for Oracle voice" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

- [ ] **Step 6: Rebase on the current #398 head and reverify**

Fetch, confirm #398 status, rebase without losing its dictation behavior, rerun
version-policy, focused voice tests, `pnpm check`, and
`NODE_ENV=production pnpm check`.

- [ ] **Step 7: Push and open the stacked focused PR**

The body must include:

```md
Fixes #400
Depends on #398

## Evidence
- exact unit/integration/E2E counts and commands
- English and pt-BR quality/latency table
- 30-minute soak result
- real local interruption result
- supported browsers/platforms
- Piper/sherpa/model licensing implications
- missed targets and remaining risks
```

- [ ] **Step 8: Request current-head Supervisor review and iterate**

Do not request GitHub Copilot review and do not approve automatically. Address
all findings across review rounds holistically, keep comments concise, rerun
affected and full gates, and request review again for the new head.

- [ ] **Step 9: Stop before merge or deployment**

Report branch, PR, architecture, exact tests, benchmark table, supported
profiles, licenses, missed targets, and remaining risks. Await explicit user
authorization before merge or any development/production rollout.
