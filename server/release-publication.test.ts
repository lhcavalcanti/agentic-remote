import { execFile } from 'node:child_process'
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  symlink,
  unlink,
  utimes,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'

const exec = promisify(execFile)
const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ))
})

async function publicationFixture() {
  const directory = await mkdtemp(path.join(tmpdir(), 'release-publication-'))
  directories.push(directory)
  const repository = path.join(directory, 'source')
  const config = path.join(directory, 'config')
  for (const name of ['dist', 'server', 'shared', 'node_modules']) {
    await mkdir(path.join(repository, name), { recursive: true })
  }
  for (const name of ['package.json', 'tsconfig.json', 'tsconfig.server.json']) {
    await writeFile(path.join(repository, name), '{}')
  }
  await writeFile(path.join(repository, 'dist', 'sw.js'), '// unchanged worker')
  const script = await readFile(new URL('../bin/agentic-remote', import.meta.url), 'utf8')
  const functions = ['publish_release', 'rollback_service'].map((name) => {
    const match = script.match(new RegExp(`^${name}\\(\\) \\{[\\s\\S]*?^\\}`, 'm'))
    if (!match) {
      throw new Error(`Missing ${name} function`)
    }
    return match[0]
  }).join('\n')
  const run = (
    command: 'publish_release' | 'rollback_service',
    environment: Record<string, string> = {},
  ) => exec(
    'bash',
    ['-euc', `
      die() { printf '%s\\n' "$*" >&2; exit 1; }
      systemctl() { printf '%s\\n' "$*" > "$CONFIG_DIR/service-call"; }
      mv() { if [[ "\${FAIL_ACTIVATION:-0}" == 1 ]]; then return 9; fi; command mv "$@"; }
      ${functions}
      ${command}
    `],
    {
      cwd: directory,
      env: {
        ...process.env,
        REPO_ROOT: repository,
        CONFIG_DIR: config,
        SERVICE_NAME: 'fixture.service',
        ...environment,
      },
    },
  )
  const build = async (buildId: string) => {
    const version = { version: '91.0.0', buildId }
    await writeFile(path.join(repository, 'dist', 'build-info.json'), JSON.stringify(version))
    await writeFile(path.join(repository, 'dist', 'index.html'), buildId)
    return version
  }
  return { repository, config, run, build }
}

describe('immutable build publication', () => {
  it('preserves build identity through copying, republishing, and rollback without Git', async () => {
    const { config, run, build } = await publicationFixture()
    const current = path.join(config, 'releases', 'current')
    const versionA = await build('build-a')
    await run('publish_release')
    const releaseA = await realpath(current)
    expect(JSON.parse(await readFile(path.join(current, 'dist', 'build-info.json'), 'utf8')))
      .toEqual(versionA)
    await run('publish_release')
    expect(await realpath(current)).not.toBe(releaseA)
    expect(JSON.parse(await readFile(path.join(current, 'dist', 'build-info.json'), 'utf8')))
      .toEqual(versionA)

    const versionB = await build('build-b')
    await run('publish_release')
    expect(JSON.parse(await readFile(path.join(current, 'dist', 'build-info.json'), 'utf8')))
      .toEqual(versionB)
    await run('rollback_service')
    expect(JSON.parse(await readFile(path.join(current, 'dist', 'build-info.json'), 'utf8')))
      .toEqual(versionA)
    expect(await readFile(path.join(current, 'dist', 'index.html'), 'utf8')).toBe('build-a')
    expect(await readFile(path.join(current, 'dist', 'sw.js'), 'utf8')).toBe('// unchanged worker')
    expect(await readFile(path.join(config, 'service-call'), 'utf8'))
      .toBe('--user restart fixture.service\n')
  })

  it('refuses a build without identity before changing the current pointer', async () => {
    const { repository, config, run, build } = await publicationFixture()
    const current = path.join(config, 'releases', 'current')
    await build('build-a')
    await run('publish_release')
    const previous = await realpath(current)
    await unlink(path.join(repository, 'dist', 'build-info.json'))

    await expect(run('publish_release')).rejects.toThrow('production build identity is missing')
    expect(await realpath(current)).toBe(previous)
  })

  it('does not let a retained rejected release evict or replace healthy rollback candidates', async () => {
    const { config, run, build } = await publicationFixture()
    const releases = path.join(config, 'releases')
    const current = path.join(releases, 'current')
    await build('older-healthy')
    await run('publish_release')
    const older = await realpath(current)
    await utimes(older, 1, 1)
    await build('previous-healthy')
    await run('publish_release')
    const previous = await realpath(current)
    await utimes(previous, 2, 2)
    const rejected = path.join(releases, 'rejected')
    await mkdir(rejected)
    await writeFile(path.join(rejected, '.promotion-failed'), 'failed candidate')
    await build('new-healthy')
    await run('publish_release')

    expect(await readFile(path.join(older, 'dist', 'index.html'), 'utf8')).toBe('older-healthy')
    expect(await readFile(path.join(previous, 'dist', 'index.html'), 'utf8')).toBe('previous-healthy')
    await run('rollback_service')
    expect(await realpath(current)).toBe(previous)
    expect(await readFile(path.join(rejected, '.promotion-failed'), 'utf8')).toBe('failed candidate')
  })

  it('does not expose a partially copied or unactivated release to rollback', async () => {
    const { repository, config, run, build } = await publicationFixture()
    await build('healthy')
    await run('publish_release')
    const current = path.join(config, 'releases', 'current')
    const previous = await realpath(current)
    await build('rejected')
    await expect(run('publish_release', { FAIL_ACTIVATION: '1' })).rejects.toThrow()
    expect(await realpath(current)).toBe(previous)
    expect((await readdir(path.join(config, 'releases'), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory()).map((entry) => entry.name))
      .toEqual([path.basename(previous)])
    await rm(path.join(repository, 'shared'), { recursive: true })
    await expect(run('publish_release')).rejects.toThrow()
    expect(await realpath(current)).toBe(previous)
    expect((await readdir(path.join(config, 'releases'), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory()).map((entry) => entry.name))
      .toEqual([path.basename(previous)])
  })

  it('copies a linked dependency directory into the immutable release', async () => {
    const { repository, config, run, build } = await publicationFixture()
    const dependencies = path.join(repository, 'dependencies')
    await rename(path.join(repository, 'node_modules'), dependencies)
    await writeFile(path.join(dependencies, 'fixture.txt'), 'published dependency')
    await symlink(dependencies, path.join(repository, 'node_modules'))
    await build('healthy')
    await run('publish_release')
    const published = await realpath(path.join(config, 'releases', 'current'))
    expect(await realpath(path.join(published, 'node_modules')))
      .toBe(path.join(published, 'node_modules'))
    await writeFile(path.join(dependencies, 'fixture.txt'), 'changed development dependency')
    expect(await readFile(path.join(published, 'node_modules', 'fixture.txt'), 'utf8'))
      .toBe('published dependency')
  })
})
