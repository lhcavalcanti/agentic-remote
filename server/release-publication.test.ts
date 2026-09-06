import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
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
  const functions = [
    'config_value', 'validate_host', 'validate_port', 'validate_role', 'validate_name', 'validate_release_id',
    'derived_origins', 'sync_release_paths', 'quarantine_inactive_rejected_releases', 'publish_release',
    'setup_service', 'rollback_service',
  ].map((name) => {
    const match = script.match(new RegExp(`^${name}\\(\\) \\{[\\s\\S]*?^\\}`, 'm'))
    if (!match) {
      throw new Error(`Missing ${name} function`)
    }
    return match[0]
  }).join('\n')
  const run = (
    command: 'publish_release' | 'rollback_service' | 'setup_service',
    environment: Record<string, string> = {},
    arguments_: string[] = [],
  ) => exec(
    'bash',
    ['-euc', `
      die() { printf '%s\\n' "$*" >&2; exit 1; }
      require_command() { :; }
      pnpm() { printf '%s\\n' "$*" >> "$REPO_ROOT/setup-commands"; }
      write_service() { :; }
      enable_linger() { :; }
      systemctl() { printf '%s\\n' "$*" > "$CONFIG_DIR/service-call"; }
      mv() {
        if [[ "\${FAIL_ACTIVATION:-0}" == 1 ]]; then return 9; fi
        command mv "$@"
      }
      node() {
        if [[ "\${FAIL_QUARANTINE:-0}" == 1 && "\${@: -1}" == *releases.rejected/* ]]; then return 9; fi
        command node "$@"
      }
      ${functions}
      ${command}${command === 'setup_service' ? ' --name fixture' : ''} "$@"
    `, 'fixture', ...arguments_],
    {
      cwd: directory,
      env: {
        ...process.env,
        REPO_ROOT: repository,
        CONFIG_DIR: config,
        ENV_FILE: path.join(config, 'environment'),
        SYSTEMD_DIR: path.join(config, 'systemd'),
        COMMAND_LINK: path.join(config, 'agentic-remote'),
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

type PublicationSyncEvent = {
  current: string | null
  restarted: boolean
} & (
  { operation: 'fsync'; path: string; directory: boolean } |
  { operation: 'rename'; from: string; to: string }
)

async function publicationSyncTrace(config: string, candidate: string, failure = '') {
  const trace = path.join(path.dirname(config), 'publication-sync.jsonl')
  const preload = path.join(path.dirname(config), 'publication-sync.cjs')
  await writeFile(preload, `
    const fs = require('node:fs')
    const path = require('node:path')
    const root = process.env.CONFIG_DIR
    const releases = path.join(root, 'releases')
    const current = path.join(releases, 'current')
    const candidate = process.env.PUBLICATION_SYNC_CANDIDATE
    const selected = () => fs.existsSync(current) ? fs.realpathSync(current) : null
    const record = (event) => fs.appendFileSync(
      process.env.PUBLICATION_SYNC_TRACE,
      JSON.stringify({
        ...event, current: selected(),
        restarted: fs.existsSync(path.join(root, 'service-call')),
      }) + '\\n',
    )
    const fsync = fs.fsyncSync
    fs.fsyncSync = (fd) => {
      const file = fs.readlinkSync('/proc/self/fd/' + fd)
      const directory = fs.fstatSync(fd).isDirectory()
      record({ operation: 'fsync', path: file, directory })
      const staged = file.startsWith(path.join(root, '.release-stage.'))
      const failure = process.env.PUBLICATION_SYNC_FAILURE
      const refused =
        (failure === 'file' && staged && !directory) ||
        (failure === 'directory' && staged && directory) ||
        (failure === 'inventory' && file === releases &&
          fs.existsSync(candidate) && selected() !== candidate) ||
        (failure === 'staging-parent' && file === root && fs.existsSync(candidate)) ||
        (failure === 'activation' && file === releases && selected() === candidate)
      if (refused) {
        throw Object.assign(new Error('Injected release fsync failure: ' + failure), { code: 'EIO' })
      }
      return fsync(fd)
    }
    const rename = fs.renameSync
    fs.renameSync = (from, to) => {
      record({ operation: 'rename', from, to })
      return rename(from, to)
    }
  `)
  return {
    environment: {
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --require=${JSON.stringify(preload)}`,
      PUBLICATION_SYNC_TRACE: trace,
      PUBLICATION_SYNC_CANDIDATE: candidate,
      PUBLICATION_SYNC_FAILURE: failure,
    },
    events: async (): Promise<PublicationSyncEvent[]> =>
      (await readFile(trace, 'utf8')).trim().split('\n').map((line) => JSON.parse(line)),
  }
}

describe('immutable build publication', () => {
  it('syncs release contents and inventory before and after activating current', async () => {
    const { repository, config, run, build } = await publicationFixture()
    const trace = path.join(repository, 'sync-trace')
    const hook = path.join(repository, 'trace-sync.cjs')
    await writeFile(hook, `
const fs = require('node:fs')
const sync = fs.fsyncSync
const rename = fs.renameSync
const record = (event) => fs.appendFileSync(process.env.RELEASE_SYNC_TRACE, JSON.stringify(event) + '\\n')
fs.fsyncSync = (fd) => {
  record({ kind: 'sync', path: fs.readlinkSync('/proc/self/fd/' + fd), current: fs.existsSync(process.env.RELEASE_CURRENT) ? fs.realpathSync(process.env.RELEASE_CURRENT) : null })
  return sync(fd)
}
fs.renameSync = (from, to) => { record({ kind: 'rename', from, to }); return rename(from, to) }
`)
    await build('durable')
    await run('publish_release', {
      NODE_OPTIONS: `--require=${hook}`, RELEASE_SYNC_TRACE: trace,
      RELEASE_CURRENT: path.join(config, 'releases/current'),
    }, ['candidate'])
    const events = (await readFile(trace, 'utf8')).trim().split('\n').map((line) => JSON.parse(line))
    const release = path.join(config, 'releases/candidate')
    const renameIndex = events.findIndex((event) => event.kind === 'rename' && event.to === release)
    expect(renameIndex).toBeGreaterThanOrEqual(0)
    expect(events.slice(0, renameIndex)).toContainEqual(expect.objectContaining({
      kind: 'sync', path: expect.stringMatching(/\.release-stage\.[^/]+\/dist\/index\.html$/),
    }))
    expect(events.slice(renameIndex + 1)).toContainEqual({
      kind: 'sync', path: path.join(config, 'releases'), current: null,
    })
    expect(events.slice(renameIndex + 1)).toContainEqual({
      kind: 'sync', path: path.join(config, 'releases'), current: release,
    })
  })

  it.each(['staged tree', 'published inventory', 'active pointer'] as const)(
    'surfaces a refused %s sync without deleting the healthy or active release',
    async (phase) => {
      const { repository, config, run, build } = await publicationFixture()
      await build('healthy')
      await run('publish_release', {}, ['healthy'])
      const current = path.join(config, 'releases/current')
      const healthy = await realpath(current)
      const candidate = path.join(config, 'releases/candidate')
      const hook = path.join(repository, 'refuse-sync.cjs')
      await writeFile(hook, `
const fs = require('node:fs')
const sync = fs.fsyncSync
fs.fsyncSync = (fd) => {
  const entry = fs.readlinkSync('/proc/self/fd/' + fd)
  const current = fs.realpathSync(process.env.RELEASE_CURRENT)
  const candidate = process.env.RELEASE_CANDIDATE
  const phase = process.env.REFUSE_SYNC_PHASE
  if ((phase === 'staged tree' && entry.includes('/.release-stage.')) ||
      (entry === require('node:path').dirname(candidate) && fs.existsSync(candidate) &&
       ((phase === 'published inventory' && current !== candidate) ||
        (phase === 'active pointer' && current === candidate)))) {
    throw Object.assign(new Error('Synthetic release fsync refused: ' + phase), { code: 'EIO' })
  }
  return sync(fd)
}
`)
      await build('candidate')
      await expect(run('publish_release', {
        NODE_OPTIONS: `--require=${hook}`, RELEASE_CURRENT: current,
        RELEASE_CANDIDATE: candidate, REFUSE_SYNC_PHASE: phase,
      }, ['candidate'])).rejects.toThrow('Synthetic release fsync refused')
      expect(await readFile(path.join(healthy, 'dist/index.html'), 'utf8')).toBe('healthy')
      if (phase === 'active pointer') {
        expect(await realpath(current)).toBe(candidate)
        expect(await readFile(path.join(candidate, 'dist/index.html'), 'utf8')).toBe('candidate')
      } else {
        expect(await realpath(current)).toBe(healthy)
        expect(existsSync(candidate)).toBe(false)
      }
    },
  )

  describe('release ID namespace', () => {
    it.each([
      { command: 'publish_release', inventory: 'live' },
      { command: 'publish_release', inventory: 'rejected' },
      { command: 'setup_service', inventory: 'live' },
      { command: 'setup_service', inventory: 'rejected' },
    ] as const)('rejects a $inventory ID before $command changes either inventory', async ({ command, inventory }) => {
      const { repository, config, run, build } = await publicationFixture()
      await build('healthy')
      await run('publish_release', {}, ['known-good'])
      const releases = path.join(config, 'releases')
      const archive = `${releases}.rejected`
      const current = await realpath(path.join(releases, 'current'))
      await mkdir(archive)
      const retained = path.join(inventory === 'live' ? releases : archive, 'taken')
      await mkdir(retained)
      await writeFile(path.join(retained, '.promotion-failed'), 'retained rejection')
      const other = path.join(releases, 'other-rejection')
      await mkdir(other)
      await writeFile(path.join(other, '.promotion-failed'), 'unrelated rejection')
      const liveBefore = (await readdir(releases)).sort()
      const archivedBefore = (await readdir(archive)).sort()
      await build('candidate')

      await expect(run(command, {}, command === 'setup_service'
        ? ['--release-id', 'taken']
        : ['taken'])).rejects.toThrow(/release.*already.*exist/i)

      expect(await realpath(path.join(releases, 'current'))).toBe(current)
      expect((await readdir(releases)).sort()).toEqual(liveBefore)
      expect((await readdir(archive)).sort()).toEqual(archivedBefore)
      expect(await readFile(path.join(retained, '.promotion-failed'), 'utf8')).toBe('retained rejection')
      expect(await readFile(path.join(other, '.promotion-failed'), 'utf8')).toBe('unrelated rejection')
      expect(existsSync(path.join(repository, 'setup-commands'))).toBe(false)
      expect((await readdir(config)).some((entry) => entry.startsWith('.release-stage.'))).toBe(false)

      await run('publish_release', {}, ['fresh-id'])
      expect(await readFile(path.join(releases, 'current', 'dist', 'index.html'), 'utf8')).toBe('candidate')
      expect(await readFile(path.join(archive, 'taken', '.promotion-failed'), 'utf8')).toBe('retained rejection')
    })

    it.each(['directory', 'file', 'symlink', 'dangling symlink'])(
      'reserves archived %s IDs even before a live inventory exists',
      async (kind) => {
        const { config, run, build } = await publicationFixture()
        const releases = path.join(config, 'releases')
        const archive = `${releases}.rejected`
        const entry = path.join(archive, 'taken')
        await mkdir(archive, { recursive: true })
        if (kind === 'directory') {
          await mkdir(entry)
        } else if (kind === 'file') {
          await writeFile(entry, 'retained archive data')
        } else {
          if (kind === 'symlink') await mkdir(path.join(config, 'kept'))
          await symlink('../kept', entry)
        }
        await build('candidate')

        await expect(run('publish_release', {}, ['taken']))
          .rejects.toThrow(/release.*already.*exist.*rejected/i)

        expect(existsSync(releases)).toBe(false)
        expect(await readdir(archive)).toEqual(['taken'])
        if (kind === 'file') expect(await readFile(entry, 'utf8')).toBe('retained archive data')
        if (kind.includes('symlink')) expect(await readlink(entry)).toBe('../kept')
      },
    )

    it('checks the canonical rejected inventory when the live root is a symlink', async () => {
      const { repository, config, run, build } = await publicationFixture()
      const physical = path.join(path.dirname(repository), 'release-inventory')
      const archive = `${physical}.rejected`
      await mkdir(physical)
      await mkdir(path.join(archive, 'taken'), { recursive: true })
      await writeFile(path.join(archive, 'taken', '.promotion-failed'), 'kept physical archive')
      await mkdir(config)
      await symlink(physical, path.join(config, 'releases'))
      await build('candidate')

      await expect(run('publish_release', {}, ['taken']))
        .rejects.toThrow(/release.*already.*exist.*rejected/i)

      expect(await readdir(physical)).toEqual([])
      expect(await realpath(path.join(config, 'releases'))).toBe(physical)
      expect(await readFile(path.join(archive, 'taken', '.promotion-failed'), 'utf8'))
        .toBe('kept physical archive')
    })
  })

  it('flushes the complete staged tree and both rename parents before durably activating it', async () => {
    const { repository, config, run, build } = await publicationFixture()
    const releases = path.join(config, 'releases')
    const candidate = path.join(releases, 'durable-release')
    const nested = path.join(repository, 'node_modules', '.pnpm', 'fixture', 'node_modules', 'fixture')
    await mkdir(nested, { recursive: true })
    await writeFile(path.join(nested, 'index.js'), 'module.exports = true')
    await writeFile(path.join(repository, 'server', 'entry.ts'), 'export {}')
    const external = path.join(repository, 'outside-release.txt')
    await writeFile(external, 'must not be followed')
    await symlink(external, path.join(repository, 'shared', 'external'))
    await symlink('missing', path.join(repository, 'shared', 'dangling'))
    await symlink('.', path.join(repository, 'shared', 'cycle'))
    await symlink('.pnpm/fixture/node_modules/fixture', path.join(repository, 'node_modules', 'fixture'))
    await build('durable-build')
    const trace = await publicationSyncTrace(config, candidate)

    await run('publish_release', trace.environment, ['durable-release'])

    const events = await trace.events()
    const publication = events.findIndex((event) => event.operation === 'rename' && event.to === candidate)
    expect(publication).toBeGreaterThanOrEqual(0)
    const rename = events[publication]
    if (rename?.operation !== 'rename') throw new Error('The staged release rename was not observed')
    const staging = rename.from
    const flushed = events.slice(0, publication).filter((event) => event.operation === 'fsync')
    const paths = flushed.map((event) => path.relative(staging, event.path))
    expect(paths).toEqual(expect.arrayContaining([
      'dist/build-info.json', 'dist/index.html', 'dist/sw.js', 'dist',
      'server/entry.ts', 'server', 'shared', 'package.json', 'tsconfig.json',
      'tsconfig.server.json', 'node_modules/.pnpm/fixture/node_modules/fixture/index.js',
      'node_modules/.pnpm/fixture/node_modules/fixture', 'node_modules/.pnpm/fixture/node_modules',
      'node_modules/.pnpm/fixture', 'node_modules/.pnpm', 'node_modules', '',
    ]))
    for (const file of paths.filter(Boolean)) {
      const parent = path.dirname(file) === '.' ? '' : path.dirname(file)
      expect(paths.indexOf(file)).toBeLessThan(paths.indexOf(parent))
    }
    expect(events.some((event) => event.operation === 'fsync' && event.path === external)).toBe(false)
    const activated = events.findIndex((event) =>
      event.operation === 'fsync' && event.path === releases && event.current === candidate)
    expect(activated).toBeGreaterThan(publication)
    expect(events.slice(publication + 1, activated)).toEqual(expect.arrayContaining([
      expect.objectContaining({ operation: 'fsync', path: releases, current: null }),
      expect.objectContaining({ operation: 'fsync', path: config, current: null }),
    ]))
    expect(events[activated].restarted).toBe(false)
    expect(await realpath(path.join(releases, 'current'))).toBe(candidate)
  })

  it.each(['file', 'directory', 'inventory', 'staging-parent', 'activation'])(
    'reports a %s flush failure before setup can restart the service',
    async (failure) => {
      const { config, run, build } = await publicationFixture()
      await build('known-good')
      await run('publish_release')
      const current = path.join(config, 'releases', 'current')
      const previous = await realpath(current)
      const candidate = path.join(config, 'releases', 'flush-refused')
      await build('candidate')
      const trace = await publicationSyncTrace(config, candidate, failure)

      await expect(run('setup_service', trace.environment, ['--release-id', 'flush-refused']))
        .rejects.toThrow(`Injected release fsync failure: ${failure}`)

      expect(await readFile(path.join(previous, 'dist', 'index.html'), 'utf8')).toBe('known-good')
      expect(existsSync(path.join(config, 'service-call'))).toBe(false)
      expect((await readdir(config)).some((entry) => entry.startsWith('.release-stage.'))).toBe(false)
      expect((await readdir(path.join(config, 'releases')))
        .some((entry) => entry.startsWith('.current-'))).toBe(false)
      if (failure === 'activation') {
        // The monitor's prepared journal must restore this indeterminate switch;
        // publication must retain its fully copied target rather than dangling current.
        expect(await realpath(current)).toBe(candidate)
        expect(await readFile(path.join(candidate, 'dist', 'index.html'), 'utf8')).toBe('candidate')
      } else {
        expect(await realpath(current)).toBe(previous)
        expect(existsSync(candidate)).toBe(false)
      }
    },
  )

  it('flushes a rollback pointer before restarting the service', async () => {
    const { config, run, build } = await publicationFixture()
    await build('previous')
    await run('publish_release')
    const releases = path.join(config, 'releases')
    const previous = await realpath(path.join(releases, 'current'))
    await build('current')
    await run('publish_release')
    const trace = await publicationSyncTrace(config, previous)

    await run('rollback_service', trace.environment)

    expect(await trace.events()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        operation: 'fsync', path: releases, current: previous, restarted: false,
      }),
    ]))
    expect(await readFile(path.join(config, 'service-call'), 'utf8'))
      .toBe('--user restart fixture.service\n')
  })

  it('rejects special staged files without blocking or changing the active release', async () => {
    const { repository, config, run, build } = await publicationFixture()
    await build('known-good')
    await run('publish_release')
    const current = path.join(config, 'releases', 'current')
    const previous = await realpath(current)
    await exec('mkfifo', [path.join(repository, 'shared', 'unexpected-pipe')])
    await build('candidate')

    await expect(run('publish_release')).rejects.toThrow(/unsupported release entry/i)

    expect(await realpath(current)).toBe(previous)
    expect((await readdir(path.join(config, 'releases'), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())).toHaveLength(1)
  })

  it.each(['publish_release', 'setup_service'] as const)(
    'rejects reserved current in %s before creating paths or running setup',
    async (command) => {
      const { repository, config, run, build } = await publicationFixture()
      await build('valid-build')
      let error: unknown
      try {
        await run(command, {}, command === 'setup_service' ? ['--release-id', 'current'] : ['current'])
      } catch (caught) {
        error = caught
      }
      expect.soft(String(error)).toMatch(/current.*reserved|reserved.*current/i)
      expect.soft(existsSync(config)).toBe(false)
      expect.soft(existsSync(path.join(repository, 'setup-commands'))).toBe(false)
      await run('publish_release')
      expect(await realpath(path.join(config, 'releases', 'current')))
        .not.toBe(path.join(config, 'releases', 'current'))
    },
  )

  it('rejects reserved current before touching an existing healthy release or rejected inventory', async () => {
    const { repository, config, run, build } = await publicationFixture()
    await build('healthy')
    await run('publish_release')
    const current = path.join(config, 'releases', 'current')
    const previous = await realpath(current)
    const rejected = path.join(config, 'releases', 'rejected')
    await mkdir(rejected)
    await writeFile(path.join(rejected, '.promotion-failed'), 'do not move for an invalid setup')
    await expect(run('setup_service', {}, ['--release-id', 'current'])).rejects.toThrow(/reserved/i)
    expect(await realpath(current)).toBe(previous)
    expect(await readFile(path.join(previous, 'dist', 'index.html'), 'utf8')).toBe('healthy')
    expect(existsSync(path.join(repository, 'setup-commands'))).toBe(false)
    expect(await readFile(path.join(rejected, '.promotion-failed'), 'utf8')).toBe('do not move for an invalid setup')
  })

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
    expect(await readFile(path.join(`${releases}.rejected`, 'rejected', '.promotion-failed'), 'utf8')).toBe('failed candidate')
  })

  it('quarantines a formerly active rejection after manual rollback and keeps healthy artifacts', async () => {
    const { config, run, build } = await publicationFixture()
    const releases = path.join(config, 'releases')
    const current = path.join(releases, 'current')
    await build('older')
    await run('publish_release')
    const older = await realpath(current)
    await utimes(older, 1, 1)
    await build('previous')
    await run('publish_release')
    const previous = await realpath(current)
    await utimes(previous, 2, 2)
    await build('rejected')
    await run('publish_release')
    const rejected = await realpath(current)
    await writeFile(path.join(rejected, '.promotion-failed'), 'rejected candidate')

    await run('rollback_service')
    expect(await realpath(current)).toBe(previous)
    const quarantined = path.join(`${releases}.rejected`, path.basename(rejected))
    expect(await readFile(path.join(quarantined, '.promotion-failed'), 'utf8')).toBe('rejected candidate')
    expect(await readFile(path.join(quarantined, 'dist', 'index.html'), 'utf8')).toBe('rejected')
    expect((await readdir(releases)).includes(path.basename(rejected))).toBe(false)
    await run('rollback_service')
    expect(await realpath(current)).toBe(older)
    expect(await readFile(path.join(previous, 'dist', 'index.html'), 'utf8')).toBe('previous')
  })

  it('retains an active rejection when no healthy rollback exists', async () => {
    const { config, run, build } = await publicationFixture()
    await build('only-release')
    await run('publish_release')
    const current = path.join(config, 'releases', 'current')
    const active = await realpath(current)
    await writeFile(path.join(active, '.promotion-failed'), 'rejected')
    await expect(run('rollback_service')).rejects.toThrow('no previous release is available')
    expect(await realpath(current)).toBe(active)
    expect(await readFile(path.join(active, 'dist', 'index.html'), 'utf8')).toBe('only-release')
    expect(await readFile(path.join(active, '.promotion-failed'), 'utf8')).toBe('rejected')
  })

  it('leaves a recovered healthy current active when quarantine fails and retries cleanup before another rollback', async () => {
    const { config, run, build } = await publicationFixture()
    const releases = path.join(config, 'releases')
    const current = path.join(releases, 'current')
    await build('older')
    await run('publish_release')
    const older = await realpath(current)
    await utimes(older, 1, 1)
    await build('previous')
    await run('publish_release')
    const previous = await realpath(current)
    await utimes(previous, 2, 2)
    await build('rejected')
    await run('publish_release')
    const rejected = await realpath(current)
    await writeFile(path.join(rejected, '.promotion-failed'), 'rejected candidate')
    await expect(run('rollback_service', { FAIL_QUARANTINE: '1' }))
      .rejects.toThrow('previous release was activated')
    expect(await realpath(current)).toBe(previous)
    await expect(run('rollback_service', { FAIL_QUARANTINE: '1' }))
      .rejects.toThrow('current release was not changed')
    expect(await realpath(current)).toBe(previous)
    expect(await readFile(path.join(rejected, '.promotion-failed'), 'utf8')).toBe('rejected candidate')
    await run('rollback_service')
    expect(await realpath(current)).toBe(older)
    expect(await readFile(path.join(previous, 'dist', 'index.html'), 'utf8')).toBe('previous')
    expect(await readFile(path.join(`${releases}.rejected`, path.basename(rejected), '.promotion-failed'), 'utf8'))
      .toBe('rejected candidate')
  })

  it('refuses publication before activation if an inactive rejection cannot be quarantined', async () => {
    const { config, run, build } = await publicationFixture()
    const releases = path.join(config, 'releases')
    const current = path.join(releases, 'current')
    await build('healthy')
    await run('publish_release')
    const healthy = await realpath(current)
    const rejected = path.join(releases, 'rejected')
    await mkdir(rejected)
    await writeFile(path.join(rejected, '.promotion-failed'), 'rejected candidate')
    await build('next')
    await expect(run('publish_release', { FAIL_QUARANTINE: '1' }))
      .rejects.toThrow('could not quarantine inactive rejected releases before publication')
    expect(await realpath(current)).toBe(healthy)
    expect(await readFile(path.join(healthy, 'dist', 'index.html'), 'utf8')).toBe('healthy')
    expect((await readdir(releases, { withFileTypes: true })).filter((entry) => entry.isDirectory()))
      .toHaveLength(2)
  })

  it.each(['symlink', 'occupied target'])('does not overwrite an unrelated quarantine %s', async (kind) => {
    const { config, run, build } = await publicationFixture()
    const releases = path.join(config, 'releases')
    const current = path.join(releases, 'current')
    await build('healthy')
    await run('publish_release')
    const healthy = await realpath(current)
    const rejected = path.join(releases, 'rejected')
    await mkdir(rejected)
    await writeFile(path.join(rejected, '.promotion-failed'), 'rejected candidate')
    const unrelated = path.join(config, 'unrelated')
    await mkdir(unrelated)
    await writeFile(path.join(unrelated, 'keep.txt'), 'unrelated state')
    if (kind === 'symlink') {
      await symlink(unrelated, `${releases}.rejected`)
    } else {
      await mkdir(`${releases}.rejected`)
      await rename(unrelated, path.join(`${releases}.rejected`, 'rejected'))
    }
    await expect(run('rollback_service')).rejects.toThrow('could not quarantine')
    expect(await realpath(current)).toBe(healthy)
    expect(await readFile(path.join(rejected, '.promotion-failed'), 'utf8')).toBe('rejected candidate')
    const preserved = kind === 'symlink' ? unrelated : path.join(`${releases}.rejected`, 'rejected')
    expect(await readFile(path.join(preserved, 'keep.txt'), 'utf8')).toBe('unrelated state')
  })

  it('quarantines an active rejection only after setup has started its replacement', async () => {
    const { config, run, build } = await publicationFixture()
    const releases = path.join(config, 'releases')
    const current = path.join(releases, 'current')
    await build('rejected')
    await run('publish_release')
    const rejected = await realpath(current)
    await writeFile(path.join(rejected, '.promotion-failed'), 'rejected candidate')
    await build('replacement')
    await run('setup_service')
    expect(await realpath(current)).not.toBe(rejected)
    expect(await readFile(path.join(current, 'dist', 'index.html'), 'utf8')).toBe('replacement')
    expect(await readFile(path.join(config, 'service-call'), 'utf8')).toBe('--user restart fixture.service\n')
    expect(await readFile(path.join(`${releases}.rejected`, path.basename(rejected), '.promotion-failed'), 'utf8'))
      .toBe('rejected candidate')
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

  it('syncs publication when the configured directory is reached through a link', async () => {
    const { config, run, build } = await publicationFixture()
    const actual = `${config}-actual`
    await mkdir(actual)
    await symlink(actual, config)
    await build('linked-profile')
    await run('publish_release', {}, ['linked'])
    expect(await realpath(path.join(config, 'releases/current'))).toBe(path.join(actual, 'releases/linked'))
    expect(await readFile(path.join(actual, 'releases/linked/dist/index.html'), 'utf8')).toBe('linked-profile')
  })
})
