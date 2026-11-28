/**
 * Live dictation on real speech. Streams the clean voice fixtures at
 * real-time pace, in 100 ms frames, through an in-process hub and a paired
 * node to the node's Parakeet worker, as a browser would, and reports for each
 * clip the time from speech onset to the first text, the time from Stop to
 * the final text, and the final text's word error rate beside a batch decode
 * of the same audio. A synthetic dictation of about 30 s, the clean clips
 * joined by 0.5 s pauses, measures a longer stream.
 *
 *   AGENTIC_REMOTE_PARAKEET_MODEL_DIR=<model directory> \
 *     node --import tsx scripts/live-dictation-benchmark.ts [--runs 3] [--show-text]
 *
 * Data directories are temporary and removed afterwards. Output names
 * fixtures, counts and timings; recognized text appears only with --show-text.
 */
import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import WebSocket from 'ws'
import {
  DICTATION_PROTOCOL,
  encodeDictationAudioFrame,
  parseDictationServerMessage,
} from '../shared/dictation.js'
import { buildApp } from '../server/app.js'
import { joinChunkTexts, splitForDecode } from '../server/parakeet-transcription.js'
import type { ParakeetWorker } from '../server/parakeet-worker.js'
import type { SessionService } from '../server/session-service.js'
import { normalizeTranscript, parsePcm16Wave, wordErrorRate } from './oracle-voice-benchmark.js'

const SAMPLE_RATE = 16_000
const FRAME_SAMPLES = 1_600
const DECODE_TIMEOUT_MS = 60_000
const HOST = 'live-dictation-benchmark.test'
const ORIGIN = `http://${HOST}`
const NODE_NAME = 'Benchmark node'

const repository = fileURLToPath(new URL('..', import.meta.url))
const fixtureDirectory = path.join(repository, 'fixtures', 'voice')

export interface Clip {
  name: string
  reference: string
  samples: Int16Array
  /** Where speech starts, when the samples alone would not say. */
  onsetSeconds?: number
}

/** Where speech starts: the first 20 ms frame at least a tenth as loud as the loudest. */
export function speechOnsetSeconds(samples: Int16Array, sampleRate = SAMPLE_RATE): number {
  const frame = Math.round(sampleRate * 0.02)
  const levels: number[] = []
  for (let start = 0; start + frame <= samples.length; start += frame) {
    let energy = 0
    for (let index = start; index < start + frame; index += 1) energy += (samples[index] / 32_768) ** 2
    levels.push(Math.sqrt(energy / frame))
  }
  const loudest = Math.max(0, ...levels)
  if (loudest === 0) return 0
  return (levels.findIndex((level) => level >= loudest / 10) * frame) / sampleRate
}

/** Clips joined by pauses, repeated until the dictation is at least `seconds` long. */
export function syntheticDictation(
  clips: readonly Clip[],
  seconds: number,
  pauseSeconds = 0.5,
  sampleRate = SAMPLE_RATE,
): Clip {
  if (clips.length === 0) throw new Error('A synthetic dictation needs at least one clip')
  const pause = new Int16Array(Math.round(pauseSeconds * sampleRate))
  const parts: Int16Array[] = []
  const references: string[] = []
  let total = 0
  for (let index = 0; total < seconds * sampleRate; index += 1) {
    const clip = clips[index % clips.length]
    if (parts.length > 0) {
      parts.push(pause)
      total += pause.length
    }
    parts.push(clip.samples)
    references.push(clip.reference)
    total += clip.samples.length
  }
  const samples = new Int16Array(total)
  let offset = 0
  for (const part of parts) {
    samples.set(part, offset)
    offset += part.length
  }
  return {
    name: `synthetic-${Math.round(total / sampleRate)}s`,
    reference: references.join(' '),
    samples,
    // A louder clip later on would otherwise move the onset past the first one.
    onsetSeconds: clips[0].onsetSeconds ?? speechOnsetSeconds(clips[0].samples, sampleRate),
  }
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

interface StreamResult {
  firstTextMs: number | null
  stopToFinalMs: number
  text: string
  updates: number
}

interface Row {
  clip: string
  seconds: number
  firstTextMs: number | null
  stopToFinalMs: number
  words: number
  liveEdits: number
  batchEdits: number
  live?: string
  batch?: string
}

/** A session service with no sessions: the benchmark only needs the dictation routes. */
class NoSessions extends EventEmitter {
  async start(): Promise<void> {}
  async stop(): Promise<void> {}
  providers(): [] { return [] }
  listSessions(): [] { return [] }
  listHistory(): [] { return [] }
}

function request(baseUrl: string, method: string, pathname: string, body?: unknown): Promise<{ status: number; body: unknown }> {
  const url = new URL(pathname, baseUrl)
  const payload = body === undefined ? undefined : JSON.stringify(body)
  return new Promise((resolve, reject) => {
    const outgoing = http.request({
      hostname: url.hostname,
      port: url.port,
      method,
      path: `${url.pathname}${url.search}`,
      agent: false,
      headers: {
        connection: 'close',
        host: HOST,
        origin: ORIGIN,
        ...(payload ? { 'content-type': 'application/json', 'content-length': String(Buffer.byteLength(payload)) } : {}),
      },
    }, (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve({ status: response.statusCode ?? 0, body: text ? JSON.parse(text) as unknown : undefined })
      })
    })
    outgoing.once('error', reject)
    if (payload) outgoing.write(payload)
    outgoing.end()
  })
}

const sleepUntil = async (time: number) => {
  const wait = time - performance.now()
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
}

/** Dictates one clip through the hub, in real time, and stops when it ends. */
async function dictate(hubUrl: string, clip: Clip): Promise<StreamResult> {
  const ticket = await request(hubUrl, 'POST', '/api/dictation/tickets')
  if (ticket.status !== 201) throw new Error(`The hub refused a dictation ticket (${ticket.status})`)
  const socket = new WebSocket(
    `${hubUrl.replace('http:', 'ws:')}/api/dictation?ticket=${encodeURIComponent((ticket.body as { ticket: string }).ticket)}`,
    { headers: { host: HOST }, origin: ORIGIN },
  )
  await new Promise((resolve, reject) => {
    socket.once('open', resolve)
    socket.once('error', reject)
  })
  let firstText: number | undefined
  let updates = 0
  let markReady!: () => void
  let markFinal!: (final: { text: string; at: number }) => void
  let fail!: (error: Error) => void
  const ready = new Promise<void>((resolve, reject) => {
    markReady = resolve
    fail = reject
  })
  const final = new Promise<{ text: string; at: number }>((resolve, reject) => {
    markFinal = resolve
    const previous = fail
    fail = (error) => {
      previous(error)
      reject(error)
    }
  })
  final.catch(() => undefined)
  socket.on('message', (data, isBinary) => {
    if (isBinary) return
    const message = parseDictationServerMessage(data.toString())
    if (message.type === 'ready') markReady()
    else if (message.type === 'text') {
      updates += 1
      if (firstText === undefined && (message.committedAppend || message.tentative)) firstText = performance.now()
    } else if (message.type === 'final') markFinal({ text: message.text, at: performance.now() })
    else if (message.type === 'error' && message.fatal) fail(new Error(`${message.code}: ${message.message}`))
  })
  socket.once('close', () => fail(new Error('The dictation connection closed')))
  try {
    socket.send(JSON.stringify({ protocol: DICTATION_PROTOCOL, type: 'start', streamId: `benchmark-${randomUUID()}` }))
    await ready
    const begin = performance.now()
    let sequence = 1
    for (let offset = 0; offset < clip.samples.length; offset += FRAME_SAMPLES) {
      await sleepUntil(begin + (offset / SAMPLE_RATE) * 1_000)
      const frame = clip.samples.subarray(offset, Math.min(clip.samples.length, offset + FRAME_SAMPLES))
      socket.send(Buffer.from(encodeDictationAudioFrame(sequence, frame)))
      sequence += 1
    }
    await sleepUntil(begin + (clip.samples.length / SAMPLE_RATE) * 1_000)
    const stopAt = performance.now()
    socket.send(JSON.stringify({ protocol: DICTATION_PROTOCOL, type: 'stop' }))
    const result = await final
    return {
      firstTextMs: firstText === undefined
        ? null
        : firstText - begin - (clip.onsetSeconds ?? speechOnsetSeconds(clip.samples)) * 1_000,
      stopToFinalMs: result.at - stopAt,
      text: result.text,
      updates,
    }
  } finally {
    socket.removeAllListeners('close')
    socket.close()
  }
}

/** What the batch engine would transcribe: the same windows and decodes as a recording. */
async function batchText(worker: ParakeetWorker, samples: Int16Array): Promise<string> {
  const floats = Float32Array.from(samples, (value) => value / 32_768)
  const texts: string[] = []
  for (const chunk of splitForDecode(floats)) {
    texts.push((await worker.decode(chunk, { timeoutMs: DECODE_TIMEOUT_MS })).text)
  }
  return joinChunkTexts(texts)
}

function editsFor(reference: string, hypothesis: string): { edits: number; words: number } {
  const words = normalizeTranscript(reference).split(' ').filter(Boolean).length
  return { edits: Math.round(wordErrorRate(reference, hypothesis) * words), words }
}

async function listen(app: Awaited<ReturnType<typeof buildApp>>['app']): Promise<string> {
  await app.listen({ host: '127.0.0.1', port: 0 })
  return `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      runs: { type: 'string', default: '3' },
      'show-text': { type: 'boolean', default: false },
    },
  })
  const runs = Number(values.runs)
  if (!Number.isInteger(runs) || runs < 1) throw new Error('--runs takes a positive count')
  if (!process.env.AGENTIC_REMOTE_PARAKEET_MODEL_DIR?.trim()) {
    throw new Error('Set AGENTIC_REMOTE_PARAKEET_MODEL_DIR to the Parakeet model directory')
  }
  process.env.AGENTIC_REMOTE_TRANSCRIPTION_ENGINE = 'parakeet'
  process.env.AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER = NODE_NAME
  process.env.AGENTIC_REMOTE_ALLOWED_ORIGINS = ORIGIN
  process.env.AGENTIC_REMOTE_ORACLE_VOICE = 'off'

  const manifest = JSON.parse(await readFile(path.join(fixtureDirectory, 'manifest.json'), 'utf8')) as {
    fixtures: Array<{ fixture: string; expectedTranscript: string; tags?: string[] }>
  }
  const clips: Clip[] = await Promise.all(manifest.fixtures
    .filter((fixture) => fixture.tags?.includes('clean'))
    .map(async (fixture) => ({
      name: fixture.fixture,
      reference: fixture.expectedTranscript,
      samples: parsePcm16Wave(await readFile(path.join(fixtureDirectory, fixture.fixture))).samples,
    })))

  const root = await mkdtemp(path.join(os.tmpdir(), 'live-dictation-benchmark-'))
  const apps: Array<{ close(): Promise<unknown> }> = []
  try {
    await mkdir(path.join(root, 'node'))
    await mkdir(path.join(root, 'hub'))
    const node = await buildApp({
      role: 'node',
      dataDirectory: path.join(root, 'node'),
      logger: false,
      service: new NoSessions() as unknown as SessionService,
      managerAgent: false,
    })
    apps.push(node.app)
    const nodeUrl = await listen(node.app)
    const worker = node.transcriptionEngine.worker
    if (!worker) throw new Error('The node did not start a Parakeet worker')
    await worker.start()
    const hub = await buildApp({
      role: 'hub',
      dataDirectory: path.join(root, 'hub'),
      logger: false,
      service: new NoSessions() as unknown as SessionService,
      managerAgent: false,
    })
    apps.push(hub.app)
    const hubUrl = await listen(hub.app)
    const paired = await request(hubUrl, 'POST', '/api/computers', {
      baseUrl: nodeUrl, token: node.identity.token, name: NODE_NAME,
    })
    if (paired.status !== 201) throw new Error(`Pairing the node failed (${paired.status})`)
    for (let attempt = 0; ; attempt += 1) {
      const capabilities = (await request(hubUrl, 'GET', '/api/dictation/capabilities')).body as { live?: boolean; reason?: string }
      if (capabilities.live) break
      if (attempt >= 100) throw new Error(`Live dictation is unavailable: ${capabilities.reason ?? 'no reason'}`)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const rows: Row[] = []
    const measure = async (clip: Clip, batch: string) => {
      const live = await dictate(hubUrl, clip)
      const liveScore = editsFor(clip.reference, live.text)
      const batchScore = editsFor(clip.reference, batch)
      rows.push({
        clip: clip.name,
        seconds: Number((clip.samples.length / SAMPLE_RATE).toFixed(2)),
        firstTextMs: live.firstTextMs === null ? null : Math.round(live.firstTextMs),
        stopToFinalMs: Math.round(live.stopToFinalMs),
        words: liveScore.words,
        liveEdits: liveScore.edits,
        batchEdits: batchScore.edits,
        ...(values['show-text'] ? { live: live.text, batch } : {}),
      })
    }
    for (const clip of clips) await measure(clip, await batchText(worker, clip.samples))
    const synthetic = syntheticDictation(clips, 30)
    const syntheticBatch = await batchText(worker, synthetic.samples)
    for (let run = 1; run <= runs; run += 1) {
      await measure({ ...synthetic, name: `${synthetic.name} #${run}` }, syntheticBatch)
    }

    const firstText = rows.flatMap((row) => row.firstTextMs === null ? [] : [row.firstTextMs])
    const syntheticRows = rows.filter((row) => row.clip.startsWith('synthetic-'))
    const clipRows = rows.filter((row) => !row.clip.startsWith('synthetic-'))
    const total = (list: Row[], key: 'liveEdits' | 'batchEdits' | 'words') =>
      list.reduce((sum, row) => sum + row[key], 0)
    console.log('| Clip | Audio s | First text ms | Stop→final ms | Live edits | Batch edits | Words |')
    console.log('|---|---:|---:|---:|---:|---:|---:|')
    for (const row of rows) {
      console.log(`| ${row.clip} | ${row.seconds} | ${row.firstTextMs ?? '—'} | ${row.stopToFinalMs} | ${row.liveEdits} | ${row.batchEdits} | ${row.words} |`)
    }
    console.log('')
    console.log(`First text from speech onset, p50: ${median(firstText)} ms`)
    console.log(`Stop → final, ${synthetic.name} p50: ${median(syntheticRows.map((row) => row.stopToFinalMs))} ms`)
    console.log(`Clips, live: ${total(clipRows, 'liveEdits')}/${total(clipRows, 'words')} edits; batch: ${total(clipRows, 'batchEdits')}/${total(clipRows, 'words')}`)
    console.log(`${synthetic.name}, live: ${total(syntheticRows, 'liveEdits')}/${total(syntheticRows, 'words')} edits; batch: ${total(syntheticRows, 'batchEdits')}/${total(syntheticRows, 'words')}`)
    if (values['show-text']) {
      for (const row of rows) console.log(`\n${row.clip}\n  live:  ${row.live}\n  batch: ${row.batch}`)
    }
  } finally {
    await Promise.allSettled(apps.map((app) => app.close()))
    await rm(root, { recursive: true, force: true })
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
