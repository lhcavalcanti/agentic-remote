import { randomBytes } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { brotliDecompressSync, gunzipSync } from 'node:zlib'
import { afterEach, describe, expect, it } from 'vitest'
import { precompressDirectory } from './precompress-assets.ts'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })))
})

async function fixture(files: Record<string, string | Buffer>): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'precompress-'))
  directories.push(directory)
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(directory, name)), { recursive: true })
    await writeFile(path.join(directory, name), content)
  }
  return directory
}

async function listing(directory: string): Promise<string[]> {
  return (await readdir(directory, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)))
    .sort()
}

const rows = (count: number) =>
  `export const rows = [${Array.from({ length: count }, (_, index) => `"row ${index}"`).join(', ')}]\n`

describe('precompressDirectory', () => {
  it('writes smaller brotli and gzip siblings that decode to each compressible file', async () => {
    const compressible = {
      'index.html': `<!doctype html><body>${'<div class="shell"></div>'.repeat(60)}</body>`,
      'sw.js': rows(150),
      'manifest.webmanifest': JSON.stringify({ icons: Array.from({ length: 120 }, (_, size) => ({ size })) }),
      'assets/index-AbC123xy.js': rows(400),
      'assets/index-AbC123xy.css': '.row { color: red; }\n'.repeat(80),
      'assets/nested/icon-AbC123xy.svg': `<svg>${'<path d="M0 0h1v1z"/>'.repeat(60)}</svg>`,
      'assets/data-AbC123xy.json': JSON.stringify({ rows: rows(150) }),
      'oracle-voice-assets/runtime.wasm': Buffer.alloc(8192, 7),
    }
    const directory = await fixture(compressible)

    await precompressDirectory(directory)

    for (const name of Object.keys(compressible)) {
      const original = await readFile(path.join(directory, name))
      const brotli = await readFile(path.join(directory, `${name}.br`))
      const gzip = await readFile(path.join(directory, `${name}.gz`))
      expect(brotliDecompressSync(brotli).equals(original), name).toBe(true)
      expect(gunzipSync(gzip).equals(original), name).toBe(true)
      expect(brotli.length, name).toBeLessThan(original.length)
      expect(gzip.length, name).toBeLessThan(original.length)
    }
  })

  it('leaves small, incompressible and binary files without siblings', async () => {
    const directory = await fixture({
      'assets/small-AbC123xy.js': 'export const a = "aaaaaaaaaaaaaaaaaaaaaaaaaaaa"\n'.repeat(19),
      'assets/noise-AbC123xy.js': randomBytes(16_384),
      'icons/icon-192.png': Buffer.alloc(16_384),
      'fonts/MonaSans.woff2': Buffer.alloc(16_384),
    })
    const before = await listing(directory)

    await precompressDirectory(directory)

    expect(await listing(directory)).toEqual(before)
  })
})
