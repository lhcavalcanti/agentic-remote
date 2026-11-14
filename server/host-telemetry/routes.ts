import type { FastifyInstance, FastifyRequest } from 'fastify'
import type WebSocket from 'ws'
import { HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError, type HostTelemetryTarget } from './service.js'
import { HostTelemetrySocket } from './socket.js'

type HostRequest = FastifyRequest<{ Params: { computerId?: string }; Querystring: { range?: string } }>

/** Uses the same WebSocket transport as session events, with isolated viewer lifetimes. */
export function registerHostTelemetryRoutes(
  app: FastifyInstance,
  prefix: string,
  resolve: (computerId: string | undefined) => HostTelemetryTarget | Promise<HostTelemetryTarget>,
  signal?: AbortSignal,
): void {
  const sockets = new Set<WebSocket>()
  const viewers = new Map<string, number>()
  const targets = new WeakMap<HostRequest, HostTelemetryTarget>()
  const noStore = async (_request: FastifyRequest, reply: { header(name: string, value: string): unknown }) => {
    reply.header('cache-control', 'no-store')
  }
  app.get<{ Params: { computerId?: string } }>(prefix, { onRequest: noStore }, async (request) =>
    (await resolve(request.params.computerId)).snapshot())
  app.get<{ Params: { computerId?: string }; Querystring: { range?: string } }>(
    `${prefix}/history`, { onRequest: noStore }, async (request) => {
      if (request.query.range !== undefined && request.query.range !== '24h') {
        throw hostTelemetryError('Host history range must be 24h', 400)
      }
      return (await resolve(request.params.computerId)).history()
    },
  )
  app.get<{ Params: { computerId?: string } }>(`${prefix}/processes`, { onRequest: noStore }, async (request) =>
    (await resolve(request.params.computerId)).processes())
  app.get<{ Params: { computerId?: string }; Querystring: { range?: string } }>(
    `${prefix}/live`,
    {
      websocket: true,
      onRequest: noStore,
      preValidation: async (request) => {
        // Fail capability negotiation before upgrading, so browsers receive the actionable 409.
        targets.set(request, await resolve(request.params.computerId))
      },
    },
    (socket, request) => {
      const key = request.params.computerId ?? 'local'
      const count = viewers.get(key) ?? 0
      if (count >= HOST_TELEMETRY_MAX_VIEWERS) {
        const refused = new HostTelemetrySocket(socket, () => {})
        socket.once('close', () => refused.dispose())
        refused.close(1013, 'Too many host monitor viewers')
        return
      }
      viewers.set(key, count + 1)
      sockets.add(socket)
      let unsubscribe: (() => void) | undefined
      let closed = false
      const output = new HostTelemetrySocket(socket, () => {
        if (closed) return
        closed = true
        sockets.delete(socket)
        const remaining = (viewers.get(key) ?? 1) - 1
        if (remaining) viewers.set(key, remaining)
        else viewers.delete(key)
        unsubscribe?.()
      })
      socket.on('close', () => output.dispose())
      socket.on('error', () => output.close())
      // This subscription is receive-only; client payloads never trigger work.
      socket.on('message', () => output.close(1008, 'Host monitoring is receive-only'))
      const target = targets.get(request)!
      targets.delete(request)
      try {
        void Promise.resolve(target.subscribe(output.send, () => output.close()))
          .then((close) => {
            unsubscribe = close
            if (closed) close()
          })
          .catch(() => output.close(1011, 'Host monitoring is unavailable'))
      } catch {
        output.close(1013, 'Host monitoring is unavailable')
      }
    },
  )
  const stop = () => {
    for (const socket of sockets) socket.terminate()
    sockets.clear()
  }
  signal?.addEventListener('abort', stop, { once: true })
  app.addHook('preClose', async () => stop())
  app.addHook('onClose', async () => signal?.removeEventListener('abort', stop))
}
