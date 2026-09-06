import { EventEmitter, getEventListeners } from 'node:events'
import { PassThrough, Writable } from 'node:stream'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Query } from '@anthropic-ai/claude-agent-sdk'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { CopilotClient, RuntimeConnection } from '@github/copilot-sdk'
import { readClaudeMcp, readCopilotResource } from './session-resource-transport.js'
import { ResourceReads } from './session-resources.js'

type Frame = { id?: string | number; method?: string; params?: { id?: string | number }; result?: unknown; error?: unknown }
const disposals: (() => void)[] = []

function frame(message: unknown): Buffer {
  const body = Buffer.from(JSON.stringify(message))
  return Buffer.concat([Buffer.from(`Content-Length: ${body.length}\r\n\r\n`), body])
}

function copilotTransport(asyncWrites = false) {
  const output = new PassThrough()
  const messages: Frame[] = []
  let buffered = Buffer.alloc(0)
  const input = new Writable({
    write(chunk: Buffer, _encoding, done) {
      buffered = Buffer.concat([buffered, chunk])
      for (;;) {
        const end = buffered.indexOf('\r\n\r\n')
        if (end < 0) break
        const length = Number(buffered.subarray(0, end).toString().match(/Content-Length: (\d+)/)?.[1])
        if (buffered.length < end + 4 + length) break
        messages.push(JSON.parse(buffered.subarray(end + 4, end + 4 + length).toString()) as Frame)
        buffered = buffered.subarray(end + 4 + length)
      }
      if (asyncWrites) setImmediate(done)
      else done()
    },
  })
  const sdkListener = vi.fn()
  output.on('data', sdkListener)
  const child = Object.assign(new EventEmitter(), { stdin: input, stdout: output, exitCode: null, signalCode: null })
  const client = {}
  Reflect.set(client, 'cliProcess', child)
  Reflect.set(client, 'messageWriter', { write: async (message: object) => { input.write(frame(message)) } })
  disposals.push(() => { input.destroy(); output.destroy() })
  const baseline = output.listenerCount('data')
  const clean = (signal: AbortSignal) => {
    expect(output.listenerCount('data')).toBe(baseline)
    for (const event of ['end', 'close', 'error']) expect(output.listenerCount(event)).toBe(0)
    expect(input.listenerCount('error')).toBe(0)
    expect(child.listenerCount('exit')).toBe(0)
    expect(getEventListeners(signal, 'abort')).toHaveLength(0)
  }
  return { client, child, input, output, messages, sdkListener, clean }
}

afterEach(() => {
  disposals.splice(0).forEach((dispose) => dispose())
  vi.useRealTimers()
})

describe('cancellable existing Copilot transport', () => {
  it('multiplexes safely with the installed SDK writer and leaves its other pending requests intact', async () => {
    const fixture = copilotTransport(true)
    const client = new CopilotClient({
      connection: RuntimeConnection.forStdio({ path: '/synthetic/not-executed' }),
    })
    Reflect.set(client, 'cliProcess', fixture.child)
    const connect = Reflect.get(client, 'connectToChildProcessViaStdio') as () => Promise<void>
    await connect.call(client)
    const connection = Reflect.get(client, 'connection') as { dispose: () => void }
    try {
      const listeners = fixture.output.listenerCount('data')
      const models = client.rpc.models.list({})
      const controller = new AbortController()
      const reading = readCopilotResource(client, 'session.skills.list', { sessionId: 'session' }, controller.signal)
        .catch((error: unknown) => error)
      await vi.waitFor(() => expect(fixture.messages).toHaveLength(2))
      const modelId = fixture.messages.find((message) => message.method === 'models.list')!.id
      const resourceId = fixture.messages.find((message) => message.method === 'session.skills.list')!.id
      controller.abort()
      await reading
      await vi.waitFor(() => expect(fixture.messages.at(-1)).toMatchObject({
        method: '$/cancelRequest', params: { id: resourceId },
      }))
      fixture.output.write(frame({ id: resourceId, result: { skills: [] } }))
      fixture.output.write(frame({ id: modelId, result: { models: [] } }))
      expect(await models).toEqual({ models: [] })
      expect(fixture.output.listenerCount('data')).toBe(listeners)
      expect(fixture.input.destroyed).toBe(false)
      expect(fixture.output.destroyed).toBe(false)
    } finally {
      connection.dispose()
    }
  })

  it('does not write or subscribe for an already-aborted request', async () => {
    const { client, messages, clean } = copilotTransport()
    const controller = new AbortController()
    controller.abort()
    await expect(readCopilotResource(client, 'session.skills.list', { sessionId: 'session' }, controller.signal)).rejects.toThrow()
    expect(messages).toEqual([])
    clean(controller.signal)
  })

  it('does not read a loaded session through a replacement SDK connection', async () => {
    const fixture = copilotTransport()
    Reflect.set(fixture.client, 'connection', {})
    await expect(readCopilotResource(
      fixture.client, 'session.skills.list', { sessionId: 'session' },
      new AbortController().signal, { connection: {} },
    )).rejects.toMatchObject({ statusCode: 409 })
    expect(fixture.messages).toEqual([])
  })

  it('withdraws and releases a request after a writer failure without closing the shared channel', async () => {
    const fixture = copilotTransport()
    const writer = { write: vi.fn<(message: object) => Promise<void>>() }
    writer.write.mockRejectedValueOnce(new Error('Synthetic writer failure')).mockResolvedValue(undefined)
    Reflect.set(fixture.client, 'messageWriter', writer)
    const controller = new AbortController()
    await expect(readCopilotResource(fixture.client, 'session.skills.list', { sessionId: 'session' }, controller.signal))
      .rejects.toThrow('Synthetic writer failure')
    const first = writer.write.mock.calls[0][0] as Frame
    expect(writer.write.mock.calls[1][0]).toMatchObject({ method: '$/cancelRequest', params: { id: first.id } })
    fixture.clean(controller.signal)
    expect(fixture.input.destroyed).toBe(false)
    expect(fixture.output.destroyed).toBe(false)
  })

  it.each(['success', 'provider-error', 'abort', 'timeout', 'close', 'exit', 'malformed'] as const)(
    'releases every request resource after %s without closing the inference transport',
    async (outcome) => {
      vi.useFakeTimers()
      const fixture = copilotTransport()
      const controller = new AbortController()
      const reads = new ResourceReads()
      let signal!: AbortSignal
      const reading = reads.run(controller.signal, (request) => {
        signal = request.signal
        return readCopilotResource(fixture.client, 'session.skills.list', { sessionId: 'session' }, signal)
      }).then((value) => ({ value }), (error: unknown) => ({ error }))
      const id = fixture.messages[0].id
      expect(fixture.messages[0]).toMatchObject({ method: 'session.skills.list', params: { sessionId: 'session' } })
      if (outcome === 'success') {
        const bytes = Buffer.concat([
          Buffer.from('end of a previous SDK frame"}'),
          frame({ id: 'unrelated-sdk-request', result: { safe: true } }),
          frame({ id, result: { skills: [{ name: 'safe' }] } }),
        ])
        fixture.output.write(bytes.subarray(0, 45))
        fixture.output.write(bytes.subarray(45, 98))
        fixture.output.write(bytes.subarray(98))
      } else if (outcome === 'provider-error') {
        fixture.output.write(frame({ id, error: { code: -32601, message: 'Synthetic unavailable method' } }))
      } else if (outcome === 'abort') controller.abort()
      else if (outcome === 'timeout') await vi.advanceTimersByTimeAsync(10_001)
      else if (outcome === 'close') fixture.output.emit('close')
      else if (outcome === 'exit') fixture.child.emit('exit', 1)
      else fixture.output.write('Content-Length: 999999999\r\n\r\n')
      const result = await reading
      if (outcome === 'success') expect(result).toEqual({ value: { skills: [{ name: 'safe' }] } })
      else expect(result).toHaveProperty('error')
      if (outcome === 'abort' || outcome === 'timeout') {
        expect(fixture.messages.at(-1)).toMatchObject({ method: '$/cancelRequest', params: { id } })
      }
      fixture.clean(signal)
      expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0)
      expect(vi.getTimerCount()).toBe(0)
      expect(fixture.input.destroyed).toBe(false)
      expect(fixture.output.destroyed).toBe(false)
      fixture.output.write(frame({ id, result: { skills: [{ name: 'late' }] } }))
      expect(fixture.sdkListener).toHaveBeenCalled()
      fixture.clean(signal)
    },
  )

  it('does not accumulate observers or pending SDK RPCs across cancelled retries', async () => {
    const fixture = copilotTransport()
    for (let index = 0; index < 25; index += 1) {
      const controller = new AbortController()
      const reading = readCopilotResource(fixture.client, 'mcp.discover', { workingDirectory: '/fixture' }, controller.signal)
        .catch((error: unknown) => error)
      controller.abort()
      await reading
      fixture.clean(controller.signal)
    }
    expect(fixture.messages.filter((message) => message.method === '$/cancelRequest')).toHaveLength(25)
  })

  it('fails closed for unsupported transports rather than invoking an uncancellable SDK wrapper', async () => {
    const list = vi.fn()
    const client = { rpc: { skills: { discover: list } } }
    await expect(readCopilotResource(client, 'skills.discover', {}, new AbortController().signal))
      .rejects.toMatchObject({ code: -32601 })
    expect(list).not.toHaveBeenCalled()
  })
})

describe('Claude metadata cancellation', () => {
  it('removes the actual installed SDK pending control request without aborting its query', async () => {
    const stdout = new PassThrough()
    const envelopes: { type: string; request_id?: string; request?: { subtype: string } }[] = []
    let buffered = ''
    const stdin = new Writable({
      write(chunk: Buffer, _encoding, done) {
        buffered += chunk.toString()
        while (buffered.includes('\n')) {
          const end = buffered.indexOf('\n')
          const message = JSON.parse(buffered.slice(0, end)) as typeof envelopes[number]
          buffered = buffered.slice(end + 1)
          envelopes.push(message)
          if (message.request?.subtype === 'initialize') {
            stdout.write(`${JSON.stringify({
              type: 'control_response',
              response: { subtype: 'success', request_id: message.request_id, response: { commands: [], models: [], agents: [] } },
            })}\n`)
          }
        }
        done()
      },
    })
    const child = Object.assign(new EventEmitter(), {
      stdin, stdout, killed: false, exitCode: null,
      kill: vi.fn(() => true),
    })
    const turn = new AbortController()
    const active = query({
      prompt: 'Synthetic lifecycle fixture',
      options: {
        abortController: turn,
        spawnClaudeCodeProcess: () => child,
      },
    })
    try {
      await active.initializationResult()
      const pending = Reflect.get(active, 'pendingControlResponses') as Map<string, unknown>
      expect(pending).toBeInstanceOf(Map)
      const baseline = pending.size
      for (let index = 0; index < 3; index += 1) {
        const controller = new AbortController()
        const reading = readClaudeMcp(active, controller.signal).catch((error: unknown) => error)
        expect(pending.size).toBe(baseline + 1)
        const id = envelopes.at(-1)!.request_id
        expect(envelopes.at(-1)!.request?.subtype).toBe('mcp_status')
        controller.abort()
        await reading
        expect(pending.size).toBe(baseline)
        expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0)
        expect(envelopes.at(-1)).toMatchObject({ type: 'control_cancel_request', request_id: id })
      }
      expect(turn.signal.aborted).toBe(false)
      expect(child.kill).not.toHaveBeenCalled()
    } finally {
      child.emit('exit', 0, null)
      stdout.end()
      active.close()
      stdin.destroy()
      stdout.destroy()
    }
  })

  it('does not call an uncancellable public method when the control adapter is absent', async () => {
    const mcpServerStatus = vi.fn()
    const active = { mcpServerStatus } as unknown as Query
    await expect(readClaudeMcp(active, new AbortController().signal)).rejects.toMatchObject({ code: -32601 })
    expect(mcpServerStatus).not.toHaveBeenCalled()
  })
})
