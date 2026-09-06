import { randomUUID } from 'node:crypto'
import type { ChildProcess } from 'node:child_process'
import type { Query } from '@anthropic-ai/claude-agent-sdk'
import { SessionResourceError } from './session-resources.js'

export type CopilotResourceMethod =
  | 'session.skills.list' | 'session.mcp.list' | 'skills.discover' | 'mcp.discover'

export interface CopilotResourceClient {
  /** Adapters must cancel and settle the request, not just abandon its promise. */
  requestResource?(
    method: CopilotResourceMethod, params: Record<string, unknown>, signal: AbortSignal,
  ): Promise<unknown>
}

function unavailable(): Error {
  return Object.assign(new Error('Cancellable resource transport is unavailable'), { code: -32601 })
}

/**
 * The SDK's generated RPC wrappers cannot cancel individual requests, and its
 * JSON-RPC connection retains cancelled promises until a peer replies. Use a
 * separate request ID/listener on the already-running stdio transport instead.
 * Never dispose that shared transport: it also owns inference and approvals.
 */
export async function readCopilotResource<T>(
  client: object, method: CopilotResourceMethod,
  params: Record<string, unknown>, signal: AbortSignal, owner?: object,
): Promise<T> {
  signal.throwIfAborted()
  const requestResource = Reflect.get(client, 'requestResource') as CopilotResourceClient['requestResource']
  if (typeof requestResource === 'function') return await requestResource.call(client, method, params, signal) as T
  if (owner && Reflect.get(owner, 'connection') !== Reflect.get(client, 'connection')) {
    throw new SessionResourceError('changed')
  }
  const child = Reflect.get(client, 'cliProcess') as ChildProcess | undefined
  const writer = Reflect.get(client, 'messageWriter') as { write: (message: object) => Promise<void> } | undefined
  if (!child?.stdin || !child.stdout || typeof writer?.write !== 'function') throw unavailable()
  const input = child.stdin
  const output = child.stdout
  if (input.destroyed || input.writableEnded || input.writableNeedDrain || output.destroyed || output.readableEnded ||
    child.exitCode !== null || child.signalCode !== null) throw new SessionResourceError('failed')
  return new Promise<T>((resolve, reject) => {
    const id = `agentic-resource:${randomUUID()}`
    let settled = false
    let sent = false
    let buffer = Buffer.alloc(0)
    let length: number | undefined
    const write = (message: object) => {
      // Its writer serializes header/body pairs. Writing to stdin ourselves
      // could interleave with a prompt's frame and corrupt the shared channel.
      void writer.write(message).catch((error: unknown) => withdraw(error))
    }
    const cleanup = () => {
      signal.removeEventListener('abort', abort)
      output.off('data', data)
      output.off('end', closed)
      output.off('close', closed)
      output.off('error', closed)
      input.off('error', closed)
      child.off('exit', closed)
      buffer = Buffer.alloc(0)
    }
    const finish = (error?: unknown, result?: T) => {
      if (settled) return
      settled = true
      cleanup()
      if (error !== undefined) reject(error)
      else resolve(result!)
    }
    const withdraw = (error: unknown) => {
      if (settled) return
      if (sent && !input.destroyed && !input.writableEnded) {
        try { write({ jsonrpc: '2.0', method: '$/cancelRequest', params: { id } }) } catch { /* Transport may already be closed. */ }
      }
      finish(error)
    }
    const abort = () => withdraw(signal.reason)
    const closed = () => withdraw(new SessionResourceError('failed'))
    const data = (chunk: Buffer | string) => {
      if (settled) return
      buffer = Buffer.concat([buffer, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)])
      try {
        while (!settled) {
          if (length === undefined) {
            const end = buffer.indexOf('\r\n\r\n')
            if (end < 0) {
              // A read may start halfway through an unrelated SDK frame.
              buffer = buffer.subarray(Math.max(0, buffer.length - 4096))
              return
            }
            const header = buffer.subarray(0, end).toString('ascii')
            const match = [...header.matchAll(/Content-Length:\s*(\d+)/gi)].at(-1)
            buffer = buffer.subarray(end + 4)
            if (!match) continue
            length = Number(match[1])
            if (!Number.isSafeInteger(length) || length < 0 || length > 16 * 1024 * 1024) {
              throw new SessionResourceError('invalid')
            }
          }
          if (buffer.length < length) return
          const body = buffer.subarray(0, length)
          buffer = buffer.subarray(length)
          length = undefined
          const response = JSON.parse(body.toString('utf8')) as { id?: unknown; error?: unknown; result?: T }
          if (response?.id !== id) continue
          if (response.error !== undefined) finish(response.error)
          else if (Object.hasOwn(response, 'result')) finish(undefined, response.result)
          else finish(new SessionResourceError('invalid'))
        }
      } catch (error) {
        withdraw(error)
      }
    }
    signal.addEventListener('abort', abort, { once: true })
    output.on('data', data)
    output.once('end', closed)
    output.once('close', closed)
    output.once('error', closed)
    input.once('error', closed)
    child.once('exit', closed)
    if (signal.aborted) { abort(); return }
    try {
      sent = true
      write({ jsonrpc: '2.0', id, method, params })
    } catch (error) {
      withdraw(error)
    }
  })
}

/** The installed SDK control transport removes its pending entry on abort. */
export async function readClaudeMcp(query: Query, signal: AbortSignal): Promise<unknown> {
  signal.throwIfAborted()
  const request = Reflect.get(query, 'request') as undefined | ((
    input: { subtype: 'mcp_status' }, options: { signal: AbortSignal },
  ) => Promise<{ response: { mcpServers: unknown } }>)
  if (typeof request !== 'function') throw unavailable()
  const result = await request.call(query, { subtype: 'mcp_status' }, { signal })
  signal.throwIfAborted()
  return result.response.mcpServers
}
