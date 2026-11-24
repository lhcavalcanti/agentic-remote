import path from 'node:path'
import { Readable } from 'node:stream'
import fastifyStatic from '@fastify/static'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

/**
 * Everything under `assets/` is Vite output named by its content hash (and
 * vite.config.ts refuses a `public/assets`), so its bytes never change.
 */
const HASHED_CACHE_CONTROL = 'public, max-age=31536000, immutable'
/** Every other file keeps its name across releases and is revalidated on each use. */
const UNHASHED_CACHE_CONTROL = 'no-cache'

function isAppleTouchIconProbe(url: string): boolean {
  const pathname = url.split(/[?#]/, 1)[0]
  const name = pathname.slice(pathname.lastIndexOf('/') + 1)
  return /^apple-touch-icon(?:-\d+x\d+)?(?:-precomposed)?\.png$/i.test(name)
}

function isApiPath(url: string): boolean {
  return url.startsWith('/api/') || url.startsWith('/node-api/')
}

/** What described the file in a response that is refused instead. */
const FILE_HEADERS = ['accept-ranges', 'cache-control', 'content-length', 'content-range', 'etag', 'last-modified']

interface AcceptedEncodings {
  /** Explicit weights for the built encodings, for @fastify/static to choose from. */
  built: string
  /** Whether an unencoded response is acceptable. */
  identity: boolean
}

/**
 * Reads `Accept-Encoding` as RFC 9110 does: `*` covers only codings the header
 * does not name, x-gzip is gzip, and an unencoded response is acceptable unless
 * `identity;q=0`, or `*;q=0` without an identity entry, refuses it.
 * @fastify/static reads `*` as gzip, which would send gzip for `gzip;q=0, *`.
 */
function acceptedEncodings(header: string): AcceptedEncodings {
  const named = new Map<string, number>()
  let any: number | undefined
  for (const entry of header.split(',')) {
    const [coding = '', ...parameters] = entry.split(';').map((part) => part.trim())
    const name = coding.toLowerCase() === 'x-gzip' ? 'gzip' : coding.toLowerCase()
    const weight = parameters.find((parameter) => /^q\s*=/i.test(parameter))
    const parsed = weight === undefined ? 1 : Number(weight.slice(weight.indexOf('=') + 1).trim())
    const quality = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0
    if (name === '*') any = quality
    else if (name) named.set(name, Math.max(named.get(name) ?? 0, quality))
  }
  return {
    built: ['br', 'gzip'].map((coding) => `${coding};q=${named.get(coding) ?? any ?? 0}`).join(', '),
    identity: (named.get('identity') ?? any ?? 1) > 0,
  }
}

/**
 * Serves the built client from `root`, falling back to `index.html` for client
 * routes. API paths, missing assets, and legacy icon probes get a JSON 404.
 *
 * The build's `.br` and `.gz` siblings go to clients that accept them, varying
 * on `Accept-Encoding`; they have no URLs of their own. A client that refuses
 * both those and the unencoded file gets 406.
 */
export async function registerStaticFiles(app: FastifyInstance, root: string): Promise<void> {
  const refusingIdentity = new WeakSet<FastifyRequest>()
  // Replies that would send a client an unencoded file it refuses.
  const unacceptable = new WeakSet<FastifyReply>()
  app.addHook('onRequest', async (request) => {
    const header = request.headers['accept-encoding']
    if (header === undefined || isApiPath(request.url)) return
    const accepted = acceptedEncodings(header)
    request.headers['accept-encoding'] = accepted.built
    if (!accepted.identity) refusingIdentity.add(request)
  })
  app.addHook('onSend', async (_request, reply, payload) => {
    if (!unacceptable.has(reply)) return payload
    if (payload instanceof Readable) payload.destroy()
    for (const name of FILE_HEADERS) reply.removeHeader(name)
    reply.code(406).type('application/json; charset=utf-8')
    return JSON.stringify({ error: 'Not acceptable' })
  })
  await app.register(fastifyStatic, {
    root,
    wildcard: false,
    preCompressed: true,
    globIgnore: ['**/*.br', '**/*.gz'],
    cacheControl: false,
    setHeaders(reply, file) {
      const hashed = path.relative(root, file).split(path.sep)[0] === 'assets'
      reply.header('cache-control', hashed ? HASHED_CACHE_CONTROL : UNHASHED_CACHE_CONTROL)
      if (reply.statusCode < 300 && !/\.(?:br|gz)$/.test(file) && refusingIdentity.has(reply.request)) {
        unacceptable.add(reply)
      }
    },
  })
  app.setNotFoundHandler((request, reply) => {
    if (
      isApiPath(request.url) ||
      request.url.startsWith('/assets/') ||
      isAppleTouchIconProbe(request.url)
    ) {
      return reply.code(404).send({ error: 'Not found' })
    }
    return reply.sendFile('index.html')
  })
}
