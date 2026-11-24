import path from 'node:path'
import fastifyStatic from '@fastify/static'
import type { FastifyInstance } from 'fastify'

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

/**
 * Serves the built client from `root`, falling back to `index.html` for client
 * routes. API paths, missing assets, and legacy icon probes get a JSON 404.
 *
 * The build's `.br` and `.gz` siblings go to clients that accept them, varying
 * on `Accept-Encoding`; they have no URLs of their own.
 */
export async function registerStaticFiles(app: FastifyInstance, root: string): Promise<void> {
  await app.register(fastifyStatic, {
    root,
    wildcard: false,
    preCompressed: true,
    globIgnore: ['**/*.br', '**/*.gz'],
    cacheControl: false,
    setHeaders(reply, file) {
      const hashed = path.relative(root, file).split(path.sep)[0] === 'assets'
      reply.header('cache-control', hashed ? HASHED_CACHE_CONTROL : UNHASHED_CACHE_CONTROL)
    },
  })
  app.setNotFoundHandler((request, reply) => {
    if (
      request.url.startsWith('/api/') ||
      request.url.startsWith('/node-api/') ||
      request.url.startsWith('/assets/') ||
      isAppleTouchIconProbe(request.url)
    ) {
      return reply.code(404).send({ error: 'Not found' })
    }
    return reply.sendFile('index.html')
  })
}
