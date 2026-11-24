import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { brotliCompressSync, brotliDecompressSync, gunzipSync, gzipSync } from 'node:zlib'
import Fastify, { type FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { registerStaticFiles } from './static-files.js'

const IMMUTABLE = 'public, max-age=31536000, immutable'
const script = `export const rows = [${Array.from({ length: 200 }, (_, index) => `"row ${index}"`).join(', ')}]\n`
const shell = `<!doctype html><html><body>${'<div class="shell"></div>'.repeat(80)}</body></html>`
const asset = '/assets/index-AbC123xy.js'

let root: string
let app: FastifyInstance

async function write(name: string, content: string, precompressed = false) {
  const file = path.join(root, name)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, content)
  if (precompressed) {
    await writeFile(`${file}.br`, brotliCompressSync(content))
    await writeFile(`${file}.gz`, gzipSync(content))
  }
}

function get(url: string, headers: Record<string, string> = {}) {
  return app.inject({ method: 'GET', url, headers })
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'static-files-'))
  await write('index.html', shell, true)
  await write(asset.slice(1), script, true)
  await write('assets/small-AbC123xy.css', 'a{}')
  await write('sw.js', `self.AGENTIC_REMOTE_BUILD_ID = "build";\n${script}`, true)
  await write('manifest.webmanifest', '{"name":"Agentic Remote"}')
  app = Fastify({ logger: false })
  await registerStaticFiles(app, root)
})

afterEach(async () => {
  await app.close()
  await rm(root, { recursive: true, force: true })
})

describe('static files', () => {
  it('serves the brotli, gzip or plain file the client accepts, varying on it', async () => {
    const cases: Array<[string | undefined, string | undefined, (body: Buffer) => Buffer]> = [
      ['gzip, deflate, br', 'br', brotliDecompressSync],
      ['gzip;q=1, br;q=0', 'gzip', gunzipSync],
      ['x-gzip', 'gzip', gunzipSync],
      // An explicit exclusion outranks `*`, which accepts only codings not listed.
      ['gzip;q=0, *;q=1', 'br', brotliDecompressSync],
      ['br;q=0, gzip;q=0, *', undefined, (body) => body],
      [undefined, undefined, (body) => body],
    ]
    for (const [acceptEncoding, encoding, decode] of cases) {
      const response = await get(asset, acceptEncoding ? { 'accept-encoding': acceptEncoding } : {})
      expect(response.statusCode).toBe(200)
      expect(response.headers['content-encoding']).toBe(encoding)
      expect(response.headers['content-type']).toBe('application/javascript; charset=utf-8')
      expect(response.headers['content-length']).toBe(String(response.rawPayload.length))
      expect(response.headers.vary).toMatch(/accept-encoding/i)
      expect(decode(response.rawPayload).toString()).toBe(script)
    }
  })

  it('caches hashed assets for a year and has the shell, worker and manifest revalidated', async () => {
    const cases: Array<[string, string]> = [
      [asset, IMMUTABLE],
      ['/assets/small-AbC123xy.css', IMMUTABLE],
      ['/', 'no-cache'],
      ['/index.html', 'no-cache'],
      ['/sessions/example?computer=hub', 'no-cache'],
      ['/sw.js?v=build', 'no-cache'],
      ['/manifest.webmanifest', 'no-cache'],
    ]
    for (const [url, cacheControl] of cases) {
      for (const headers of [{ 'accept-encoding': 'br, gzip' }, {}] as Array<Record<string, string>>) {
        const response = await get(url, headers)
        expect(response.statusCode, url).toBe(200)
        expect(response.headers['cache-control'], url).toBe(cacheControl)
        expect(response.headers.vary, url).toMatch(/accept-encoding/i)
      }
    }
    const fallback = await get('/sessions/example', { 'accept-encoding': 'gzip;q=0, *' })
    expect(fallback.headers['content-type']).toBe('text/html; charset=utf-8')
    expect(fallback.headers['content-encoding']).toBe('br')
    expect(brotliDecompressSync(fallback.rawPayload).toString()).toBe(shell)
  })

  it('validates each encoding separately and answers HEAD without a body', async () => {
    const brotli = await get(asset, { 'accept-encoding': 'br' })
    const plain = await get(asset)
    expect(brotli.headers.etag).toBeTruthy()
    expect(brotli.headers.etag).not.toBe(plain.headers.etag)
    const revalidated = await get(asset, {
      'accept-encoding': 'br',
      'if-none-match': String(brotli.headers.etag),
    })
    expect(revalidated.statusCode).toBe(304)
    expect(revalidated.headers['cache-control']).toBe(IMMUTABLE)
    expect(revalidated.rawPayload.length).toBe(0)

    const fallback = await get('/sessions/example', { 'accept-encoding': 'gzip' })
    expect(fallback.headers['content-encoding']).toBe('gzip')
    const fallbackRevalidated = await get('/sessions/other', {
      'accept-encoding': 'gzip',
      'if-none-match': String(fallback.headers.etag),
    })
    expect(fallbackRevalidated.statusCode).toBe(304)
    expect(fallbackRevalidated.headers['cache-control']).toBe('no-cache')

    const head = await app.inject({ method: 'HEAD', url: asset, headers: { 'accept-encoding': 'br' } })
    expect(head.statusCode).toBe(200)
    expect(head.headers['content-encoding']).toBe('br')
    expect(head.headers['content-length']).toBe(String(brotli.rawPayload.length))
    expect(head.headers['cache-control']).toBe(IMMUTABLE)
    expect(head.rawPayload.length).toBe(0)
  })

  it('serves byte ranges of the representation it selected', async () => {
    const brotli = brotliCompressSync(script)
    const encoded = await get(asset, { 'accept-encoding': 'br', range: 'bytes=0-9' })
    expect(encoded.statusCode).toBe(206)
    expect(encoded.headers['content-encoding']).toBe('br')
    expect(encoded.headers['content-range']).toBe(`bytes 0-9/${brotli.length}`)
    expect(encoded.rawPayload).toEqual(brotli.subarray(0, 10))

    const plain = await get(asset, { range: 'bytes=0-9' })
    expect(plain.statusCode).toBe(206)
    expect(plain.headers['content-encoding']).toBeUndefined()
    expect(plain.headers['content-range']).toBe(`bytes 0-9/${Buffer.byteLength(script)}`)
    expect(plain.rawPayload.toString()).toBe(script.slice(0, 10))
  })

  it('answers API paths, missing assets and compressed siblings with a JSON 404', async () => {
    for (const url of [
      '/api/missing',
      '/node-api/missing',
      '/assets/missing-AbC123xy.js',
      `${asset}.br`,
      `${asset}.gz`,
      '/apple-touch-icon.png',
    ]) {
      const response = await get(url, { 'accept-encoding': 'br, gzip' })
      expect(response.statusCode, url).toBe(404)
      expect(response.json(), url).toEqual({ error: 'Not found' })
    }
  })
})
