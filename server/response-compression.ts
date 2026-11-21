import { promisify } from 'node:util'
import { gzip } from 'node:zlib'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyContextConfig {
    /**
     * False on a route whose JSON carries file contents: base64 media gains
     * little from gzip, so it is sent as it is.
     */
    compress?: boolean
  }
}

/** JSON responses at least this large are gzipped for a client that accepts it. */
const THRESHOLD_BYTES = 64 * 1024
/**
 * On a 13.8 MB transcript level 4 gave 2.79 MB in 137 ms against level 6's
 * 2.68 MB in 178 ms: nearly all of the saving for three quarters of the work.
 */
const GZIP_LEVEL = 4
// zlib's callback API runs on the libuv threadpool, never on the event loop.
const gzipAsync = promisify(gzip)
const JSON_TYPE = /^application\/json\s*(?:;|$)/i

/** Whether an Accept-Encoding header admits gzip, honouring q=0 and `*`. */
function acceptsGzip(header: string | undefined): boolean {
  if (!header) return false
  let gzipQuality: number | undefined
  let anyQuality: number | undefined
  for (const entry of header.split(',')) {
    const [coding = '', ...parameters] = entry.split(';').map((part) => part.trim())
    const name = coding.toLowerCase()
    if (name !== 'gzip' && name !== 'x-gzip' && name !== '*') continue
    const weight = parameters.find((parameter) => /^q\s*=/i.test(parameter))
    const parsed = weight === undefined ? 1 : Number(weight.slice(weight.indexOf('=') + 1).trim())
    const quality = Number.isFinite(parsed) ? parsed : 0
    if (name === '*') anyQuality = quality
    else gzipQuality = Math.max(gzipQuality ?? 0, quality)
  }
  return (gzipQuality ?? anyQuality ?? 0) > 0
}

function header(reply: FastifyReply, name: string): string {
  const value = reply.getHeader(name)
  return Array.isArray(value) ? value.join(', ') : String(value ?? '')
}

function varyOnAcceptEncoding(reply: FastifyReply): void {
  const values = header(reply, 'vary').split(',').map((value) => value.trim()).filter(Boolean)
  if (values.some((value) => value === '*' || value.toLowerCase() === 'accept-encoding')) return
  reply.header('vary', [...values, 'Accept-Encoding'].join(', '))
}

function eligible(request: FastifyRequest, reply: FastifyReply, payload: unknown): payload is string | Buffer {
  if (typeof payload !== 'string' && !Buffer.isBuffer(payload)) return false
  const status = reply.statusCode
  return request.method !== 'HEAD' &&
    request.headers.upgrade === undefined &&
    status >= 200 && status !== 204 && status !== 304 &&
    request.routeOptions.config?.compress !== false &&
    JSON_TYPE.test(header(reply, 'content-type')) &&
    !header(reply, 'content-encoding') &&
    !/(?:^|,)\s*no-transform\s*(?:,|$)/i.test(header(reply, 'cache-control')) &&
    Buffer.byteLength(payload) >= THRESHOLD_BYTES
}

/**
 * Gzips large JSON responses for clients that accept it, on every route of
 * either role. Streams, media, and anything already encoded pass through.
 * Register before any route plugin so every route inherits the hook.
 */
export function registerResponseCompression(app: FastifyInstance): void {
  app.addHook('onSend', async (request, reply, payload) => {
    if (!eligible(request, reply, payload)) return payload
    varyOnAcceptEncoding(reply)
    if (!acceptsGzip(request.headers['accept-encoding'])) return payload
    let compressed: Buffer
    try {
      compressed = await gzipAsync(payload, { level: GZIP_LEVEL })
    } catch (error) {
      request.log.warn({ err: error }, 'Sending a response uncompressed after gzip failed')
      return payload
    }
    reply.header('content-encoding', 'gzip')
    reply.removeHeader('content-length')
    return compressed
  })
}
