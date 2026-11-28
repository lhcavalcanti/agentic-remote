import WebSocket from 'ws'
import type { RegisteredComputer } from './computer-registry.js'
import {
  RemoteNodeRedirectError,
  RemoteNodeRequestError,
} from './remote-node-errors.js'
import { nodeAuthorization, nodeWebSocketUrl } from './remote-voice-client.js'

const CONNECT_TIMEOUT_MS = 10_000
// Text from a node is a few fields of at most 64 KiB each.
const MAX_NODE_MESSAGE_BYTES = 256 * 1024
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

export interface NodeDictationSocketOptions {
  signal?: AbortSignal
  /** Ends the socket when the computer is unpaired or paired again. */
  registrationSignal?: AbortSignal
  connectTimeoutMs?: number
}

/**
 * Opens a paired node's live dictation socket with its pairing token. A node
 * without the route answers the upgrade with 404, which rejects with a
 * `RemoteNodeRequestError` carrying that status.
 */
export function openNodeDictationSocket(
  computer: RegisteredComputer,
  options: NodeDictationSocketOptions = {},
): Promise<WebSocket> {
  const { signal, registrationSignal } = options
  if (signal?.aborted) {
    return Promise.reject(new Error(`${computer.name} dictation connection was cancelled`))
  }
  if (registrationSignal?.aborted) return Promise.reject(repairedError(computer))
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(nodeWebSocketUrl(computer, '/node-api/dictation'), {
      followRedirects: false,
      maxPayload: MAX_NODE_MESSAGE_BYTES,
      headers: nodeAuthorization(computer),
    })
    let settled = false
    const cleanup = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', cancel)
      registrationSignal?.removeEventListener('abort', repaired)
    }
    const fail = (error: Error) => {
      if (settled) return
      settled = true
      cleanup()
      socket.terminate()
      reject(error)
    }
    const cancel = () => fail(new Error(`${computer.name} dictation connection was cancelled`))
    // Audio must never reach a computer that is no longer the one paired under this name.
    const repaired = () => fail(repairedError(computer))
    const timer = setTimeout(
      () => fail(new Error(`${computer.name} did not answer the dictation connection`)),
      options.connectTimeoutMs ?? CONNECT_TIMEOUT_MS,
    )
    signal?.addEventListener('abort', cancel, { once: true })
    registrationSignal?.addEventListener('abort', repaired, { once: true })
    socket.once('unexpected-response', (_request, response) => {
      response.resume()
      const statusCode = response.statusCode ?? 500
      fail(REDIRECT_STATUSES.has(statusCode)
        ? new RemoteNodeRedirectError(computer.name, statusCode)
        : new RemoteNodeRequestError(`${computer.name} refused the dictation connection (${statusCode})`, statusCode))
    })
    socket.once('error', (error) => fail(error))
    socket.once('close', () => fail(new Error(`${computer.name} closed the dictation connection`)))
    socket.once('open', () => {
      if (settled) return
      if (registrationSignal?.aborted) {
        repaired()
        return
      }
      settled = true
      cleanup()
      if (registrationSignal) {
        const unpaired = () => socket.close(1001, 'The computer was paired again')
        registrationSignal.addEventListener('abort', unpaired, { once: true })
        socket.once('close', () => registrationSignal.removeEventListener('abort', unpaired))
      }
      resolve(socket)
    })
  })
}

function repairedError(computer: Pick<RegisteredComputer, 'name'>): Error {
  return new Error(`${computer.name} was paired again or removed`)
}
