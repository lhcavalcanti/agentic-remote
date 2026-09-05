import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'
import { parseAppVersion } from '../shared/app-version.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ))
})

describe('production app build identity', () => {
  it('embeds one identity in the client, metadata and worker, and changes it on rebuild', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'app-build-'))
    directories.push(directory)
    await writeFile(path.join(directory, 'index.html'),
      '<html><script type="module" src="/entry.js"></script></html>')
    await writeFile(path.join(directory, 'entry.js'),
      'globalThis.app = { version: __APP_VERSION__, buildId: __APP_BUILD_ID__ }')

    const compile = async () => {
      await build({
        configFile: fileURLToPath(new URL('../vite.config.ts', import.meta.url)),
        configLoader: 'runner',
        root: directory,
        cacheDir: path.join(directory, 'cache'),
        publicDir: fileURLToPath(new URL('../public', import.meta.url)),
        logLevel: 'silent',
        build: { minify: false },
      })
      const output = path.join(directory, 'dist')
      const metadata = JSON.parse(await readFile(path.join(output, 'build-info.json'), 'utf8'))
      const identity = parseAppVersion(metadata)
      expect(Object.keys(metadata).sort()).toEqual(['buildId', 'version'])
      expect(identity.buildId).toMatch(/^[0-9a-f-]{36}$/)
      const scripts = (await readdir(path.join(output, 'assets')))
        .filter((name) => name.endsWith('.js'))
      expect(scripts).toHaveLength(1)
      const client = await readFile(path.join(output, 'assets', scripts[0]), 'utf8')
      expect(client).toContain(JSON.stringify(identity.buildId))
      expect(client).toContain(JSON.stringify(identity.version))
      expect(client).not.toContain('__APP_BUILD_ID__')
      const worker = await readFile(path.join(output, 'sw.js'), 'utf8')
      expect(worker).toBe(
        `self.AGENTIC_REMOTE_BUILD_ID = ${JSON.stringify(identity.buildId)};\n${
          await readFile(new URL('../public/sw.js', import.meta.url), 'utf8')
        }`,
      )
      return identity
    }

    const first = await compile()
    const second = await compile()
    expect(second.version).toBe(first.version)
    expect(second.buildId).not.toBe(first.buildId)
  }, 20_000)
})
