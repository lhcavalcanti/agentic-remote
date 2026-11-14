import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, symlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { captureOutputDirectory } from './fixture-frontend'

const root = fileURLToPath(new URL('../', import.meta.url))
const script = fileURLToPath(new URL('./capture-screens.ts', import.meta.url))

describe('screenshot capture safety', () => {
  it.each([
    [['--base-url', 'http://127.0.0.1:4317'], 'never 4317 or 4318'],
    [['--base-url', 'http://localhost:4318'], 'never 4317 or 4318'],
    [['--output-dir', '/tmp/forbidden-capture'], 'outside system temporary directories'],
    [['--scene', 'unknown-scene'], 'Unknown scene'],
    [['--viewport', 'unknown-viewport'], 'Unknown viewport'],
  ])('refuses invalid arguments before starting a server: %j', (args, reason) => {
    const result = spawnSync(process.execPath, [
      '--import', 'tsx', script, '--', '--output-dir', 'test-results/screens', ...args,
    ], { cwd: root, env: { ...process.env, TSX_DISABLE_CACHE: '1' }, encoding: 'utf8', timeout: 10_000 })
    expect(result.error).toBeUndefined()
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain(reason)
  })

  it('resolves new output paths and refuses symlink escapes before creating files', async () => {
    await mkdir(resolve(root, 'test-results'), { recursive: true })
    const directory = await mkdtemp(resolve(root, 'test-results/capture-path-'))
    try {
      expect(await captureOutputDirectory(`${directory}/new/nested`)).toBe(`${directory}/new/nested`)
      await symlink('/tmp', `${directory}/linked-temporary`)
      await expect(captureOutputDirectory(`${directory}/linked-temporary/new/nested`))
        .rejects.toThrow('outside system temporary directories')
      await expect(captureOutputDirectory('/var/tmp/forbidden-capture'))
        .rejects.toThrow('outside system temporary directories')
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
