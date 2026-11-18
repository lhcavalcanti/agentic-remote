import { spawnSync } from 'node:child_process'
import { realpath } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { captureOutputDirectory } from './fixture-frontend'

vi.mock('node:fs/promises', async (importOriginal) => ({
  ...await importOriginal<typeof import('node:fs/promises')>(),
  realpath: vi.fn(),
}))

const root = fileURLToPath(new URL('../', import.meta.url))
const script = fileURLToPath(new URL('./capture-screens.ts', import.meta.url))

describe('screenshot capture safety', () => {
  afterEach(() => vi.mocked(realpath).mockReset())

  it.each([
    [['--base-url', 'http://127.0.0.1:4317'], 'never 4317 or 4318'],
    [['--base-url', 'http://localhost:4318'], 'never 4317 or 4318'],
    [['--output-dir', '/tmp/forbidden-capture'], 'outside system temporary directories'],
    [['--scene', 'unknown-scene'], 'Unknown scene'],
    [['--viewport', 'unknown-viewport'], 'Unknown viewport'],
  ])('refuses invalid arguments before starting a server: %j', (args, reason) => {
    const result = spawnSync(process.execPath, [
      '--import', 'tsx', script, '--', '--output-dir', '/tmp/forbidden-capture', ...args,
    ], { cwd: root, env: { ...process.env, TSX_DISABLE_CACHE: '1' }, encoding: 'utf8', timeout: 10_000 })
    expect(result.error).toBeUndefined()
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain(reason)
  })

  it('resolves missing output descendants using a canonical ancestor independently of checkout location', async () => {
    vi.mocked(realpath).mockImplementation(async (path) => {
      if (path === '/capture-fixture') return '/home/capture-fixture'
      throw Object.assign(new Error('Missing fixture directory'), { code: 'ENOENT' })
    })
    expect(await captureOutputDirectory('/capture-fixture/new/nested')).toBe('/home/capture-fixture/new/nested')
    expect(vi.mocked(realpath).mock.calls.map(([path]) => path)).toEqual([
      '/capture-fixture/new/nested', '/capture-fixture/new', '/capture-fixture',
    ])
  })

  it.each(['/tmp', '/var/tmp'])('refuses symlink escapes into %s before creating files', async (target) => {
    vi.mocked(realpath).mockImplementation(async (path) => {
      if (path === '/capture-fixture/linked-temporary') return target
      throw Object.assign(new Error('Missing fixture directory'), { code: 'ENOENT' })
    })
    await expect(captureOutputDirectory('/capture-fixture/linked-temporary/new/nested'))
      .rejects.toThrow('outside system temporary directories')
  })

  it.each(['/tmp', '/var/tmp'])('refuses real output under %s', async (directory) => {
    vi.mocked(realpath).mockResolvedValue(directory)
    await expect(captureOutputDirectory(`${directory}/forbidden-capture`))
      .rejects.toThrow('outside system temporary directories')
  })
})
