import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'

const exec = promisify(execFile)
const repositoryManifest = new URL(
  '../config/oracle-voice-profiles.json',
  import.meta.url,
)
const repositoryCli = new URL('../bin/agentic-remote', import.meta.url)
const fixtures: string[] = []

afterEach(async () => {
  await Promise.all(
    fixtures.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

type Asset = {
  id: string
  destination: string
  url: string
  bytes: number
  sha256: string
  licenseUrl: string
  language: string
  modelType: string
  modelVersion: string
  archive?: 'tar.bz2' | 'tar.gz'
  executable?: boolean
}

type Profile = {
  id: string
  version: string
  description: string
  language: string
  modelType: string
  modelVersion: string
  platforms: string[]
  configuration: Record<string, string>
  notices: Array<{
    name: string
    license: string
    url: string
  }>
  assets: Asset[]
}

async function readManifest(): Promise<{
  schemaVersion: number
  profiles: Profile[]
}> {
  return JSON.parse(await readFile(repositoryManifest, 'utf8'))
}

function sha256(contents: Buffer | string): string {
  return createHash('sha256').update(contents).digest('hex')
}

async function testRoot(): Promise<string> {
  const parent = path.join(process.cwd(), '.agentic-remote')
  await mkdir(parent, { recursive: true })
  const root = await mkdtemp(path.join(parent, 'oracle-voice-test-'))
  fixtures.push(root)
  return root
}

async function createArchive(
  sourceDirectory: string,
  archivePath: string,
  format: 'tar.bz2' | 'tar.gz',
): Promise<void> {
  const flag = format === 'tar.bz2' ? '-cjf' : '-czf'
  await exec('tar', [flag, archivePath, '-C', sourceDirectory, '.'])
}

async function writeExecutable(file: string, contents: string): Promise<void> {
  await writeFile(file, contents)
  await chmod(file, 0o755)
}

async function installerFixture(options: {
  version?: string
  archiveFormat?: 'tar.bz2' | 'tar.gz'
  archiveSha256?: string
  archiveBytes?: number
  maliciousArchive?: boolean
} = {}) {
  const root = await testRoot()
  const repository = path.join(root, 'repository')
  const bin = path.join(root, 'bin')
  const sources = path.join(root, 'sources')
  const data = path.join(root, 'data')
  await Promise.all([
    mkdir(path.join(repository, 'bin'), { recursive: true }),
    mkdir(path.join(repository, 'config'), { recursive: true }),
    mkdir(bin, { recursive: true }),
    mkdir(sources, { recursive: true }),
    mkdir(data, { recursive: true }),
  ])
  const cli = path.join(repository, 'bin', 'agentic-remote')
  await writeFile(cli, await readFile(repositoryCli))
  await chmod(cli, 0o755)

  const archiveFormat = options.archiveFormat ?? 'tar.gz'
  const archiveName = archiveFormat === 'tar.bz2' ? 'stt.tar.bz2' : 'stt.tar.gz'
  const archivePath = path.join(sources, archiveName)
  const archiveSource = path.join(root, 'archive-source')
  await mkdir(path.join(archiveSource, 'stt-model'), { recursive: true })
  await writeFile(path.join(archiveSource, 'stt-model', 'tokens.txt'), 'tokens\n')
  if (options.maliciousArchive) {
    const safe = path.join(archiveSource, 'safe')
    await writeFile(safe, 'escape\n')
    const flag = archiveFormat === 'tar.bz2' ? '-cjf' : '-czf'
    await exec('tar', [
      flag,
      archivePath,
      '--transform=s|safe|../escape|',
      '-C',
      archiveSource,
      'safe',
    ])
  } else {
    await createArchive(archiveSource, archivePath, archiveFormat)
  }
  const archive = await readFile(archivePath)

  const piper = Buffer.from('#!/usr/bin/env bash\ncat >/dev/null\n')
  const voice = Buffer.from('voice-model\n')
  const config = Buffer.from('{"audio":{"sample_rate":22050}}\n')
  await Promise.all([
    writeFile(path.join(sources, 'piper'), piper),
    writeFile(path.join(sources, 'voice.onnx'), voice),
    writeFile(path.join(sources, 'voice.onnx.json'), config),
  ])

  const asset = (
    id: string,
    destination: string,
    contents: Buffer,
    extra: Partial<Asset> = {},
  ): Asset => ({
    id,
    destination,
    url: `https://fixtures.invalid/${id === 'stt' ? archiveName : path.basename(destination)}`,
    bytes: contents.byteLength,
    sha256: sha256(contents),
    licenseUrl: 'https://fixtures.invalid/license',
    language: 'en',
    modelType: id,
    modelVersion: 'fixture-1',
    ...extra,
  })
  const profile: Profile = {
    id: 'fixture',
    version: options.version ?? 'fixture-1',
    description: 'Fixture profile',
    language: 'en',
    modelType: 'oracle-voice-profile',
    modelVersion: 'fixture-1',
    platforms: ['linux-x64'],
    configuration: {
      AGENTIC_REMOTE_VOICE_STT_PROFILE: 'zipformer',
      AGENTIC_REMOTE_VOICE_LANGUAGE: 'en',
      AGENTIC_REMOTE_VOICE_THREADS: '1',
      AGENTIC_REMOTE_VOICE_ENDPOINT_MS: '800',
      AGENTIC_REMOTE_VOICE_STT_MODEL_DIR: 'stt/stt-model',
      AGENTIC_REMOTE_VOICE_TTS_BIN: 'tts/piper',
      AGENTIC_REMOTE_VOICE_TTS_MODEL: 'tts/voice.onnx',
      AGENTIC_REMOTE_VOICE_TTS_CONFIG: 'tts/voice.onnx.json',
    },
    notices: [{
      name: 'Fixture license',
      license: 'Fixture-1.0',
      url: 'https://fixtures.invalid/license',
    }],
    assets: [
      asset('stt', 'stt', archive, {
        archive: archiveFormat,
        sha256: options.archiveSha256 ?? sha256(archive),
        bytes: options.archiveBytes ?? archive.byteLength,
      }),
      asset('piper', 'tts/piper', piper, { executable: true }),
      asset('voice-model', 'tts/voice.onnx', voice),
      asset('voice-config', 'tts/voice.onnx.json', config),
    ],
  }
  const manifest = path.join(repository, 'config', 'oracle-voice-profiles.json')
  const writeManifest = async (nextProfile: Profile = profile) => {
    await writeFile(
      manifest,
      `${JSON.stringify({ schemaVersion: 1, profiles: [nextProfile] }, null, 2)}\n`,
    )
  }
  await writeManifest()

  const curl = path.join(bin, 'curl')
  await writeExecutable(
    curl,
    [
      '#!/usr/bin/env bash',
      'set -eu',
      'destination=""',
      'url=""',
      'while (($#)); do',
      '  case "$1" in',
      '    --output|-o) destination="$2"; shift 2 ;;',
      '    http*) url="$1"; shift ;;',
      '    *) shift ;;',
      '  esac',
      'done',
      'printf "DOWNLOAD %s\\n" "$url"',
      'printf "%s\\n" "$url" >>"$DOWNLOAD_LOG"',
      'cp "$DOWNLOAD_SOURCES/${url##*/}" "$destination"',
    ].join('\n'),
  )
  const downloadLog = path.join(root, 'downloads.log')
  const env = {
    ...process.env,
    HOME: path.join(root, 'home'),
    PATH: `${bin}:${process.env.PATH}`,
    AGENTIC_REMOTE_DATA_DIR: data,
    DOWNLOAD_LOG: downloadLog,
    DOWNLOAD_SOURCES: sources,
  }
  const run = async (profileId = 'fixture') => {
    try {
      const result = await exec(cli, ['voice-install', profileId], { env })
      return { code: 0, ...result }
    } catch (error) {
      const failure = error as {
        code?: number
        stdout?: string
        stderr?: string
      }
      return {
        code: failure.code ?? 1,
        stdout: failure.stdout ?? '',
        stderr: failure.stderr ?? '',
      }
    }
  }
  return { root, data, profile, writeManifest, run, downloadLog }
}

describe('Oracle voice profile manifest', () => {
  it('has no automatic or default profile', async () => {
    const manifest = await readManifest()

    expect(manifest).not.toHaveProperty('defaultProfile')
    expect(manifest.profiles.map(({ id }) => id)).toEqual([
      'fast-en',
      'multilingual-quality',
    ])
  })

  it('pins every voice asset by HTTPS URL, bytes, sha256, and license', async () => {
    const manifest = await readManifest()

    expect(manifest.schemaVersion).toBe(1)
    for (const profile of manifest.profiles) {
      expect(profile.version).toMatch(/^[a-z0-9][a-z0-9._-]+$/)
      expect(profile.platforms).toContain('linux-x64')
      expect(profile.assets.length).toBeGreaterThan(0)
      for (const asset of profile.assets) {
        expect(asset.url).toMatch(/^https:\/\//)
        expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/)
        expect(asset.bytes).toBeGreaterThan(0)
        expect(asset.licenseUrl).toMatch(/^https:\/\//)
        expect(asset.language).toBeTruthy()
        expect(asset.modelType).toBeTruthy()
        expect(asset.modelVersion).toBeTruthy()
      }
    }
  })

  it('configures profiles accepted by the server voice schema', async () => {
    const manifest = await readManifest()
    const required = [
      'AGENTIC_REMOTE_VOICE_STT_MODEL_DIR',
      'AGENTIC_REMOTE_VOICE_STT_PROFILE',
      'AGENTIC_REMOTE_VOICE_LANGUAGE',
      'AGENTIC_REMOTE_VOICE_THREADS',
      'AGENTIC_REMOTE_VOICE_ENDPOINT_MS',
      'AGENTIC_REMOTE_VOICE_TTS_BIN',
      'AGENTIC_REMOTE_VOICE_TTS_MODEL',
      'AGENTIC_REMOTE_VOICE_TTS_CONFIG',
    ]

    for (const profile of manifest.profiles) {
      expect(['zipformer', 'nemotron']).toContain(
        profile.configuration.AGENTIC_REMOTE_VOICE_STT_PROFILE,
      )
      expect(Number(profile.configuration.AGENTIC_REMOTE_VOICE_THREADS))
        .toBeGreaterThanOrEqual(1)
      expect(Number(profile.configuration.AGENTIC_REMOTE_VOICE_THREADS))
        .toBeLessThanOrEqual(16)
      expect(Number(profile.configuration.AGENTIC_REMOTE_VOICE_ENDPOINT_MS))
        .toBeGreaterThanOrEqual(300)
      expect(Number(profile.configuration.AGENTIC_REMOTE_VOICE_ENDPOINT_MS))
        .toBeLessThanOrEqual(3000)
      expect(Object.keys(profile.configuration).sort()).toEqual(required.sort())
      for (const key of required.filter((name) => name.endsWith('_DIR') || name.includes('_TTS_'))) {
        expect(profile.configuration[key]).not.toMatch(/^[/~]/)
        expect(profile.configuration[key]).not.toContain('..')
      }
    }
  })
})

describe('agentic-remote voice-install', () => {
  it('fails clearly for an unknown profile', async () => {
    const fixture = await installerFixture()

    const result = await fixture.run('missing')

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('unknown voice profile: missing')
  })

  it('prints license information before starting any download', async () => {
    const fixture = await installerFixture()

    const result = await fixture.run()

    expect(result, result.stderr).toMatchObject({ code: 0 })
    expect(result.stdout.indexOf('Fixture-1.0')).toBeGreaterThanOrEqual(0)
    expect(result.stdout.indexOf('Fixture-1.0'))
      .toBeLessThan(result.stdout.indexOf('DOWNLOAD '))
  })

  it('installs atomically, writes notices, and prints exact configuration', async () => {
    const fixture = await installerFixture()

    const result = await fixture.run()

    expect(result, result.stderr).toMatchObject({ code: 0 })
    const active = path.join(
      fixture.data,
      'models',
      'oracle-voice',
      'active',
      'fixture',
    )
    expect((await lstat(active)).isSymbolicLink()).toBe(true)
    const target = await readlink(active)
    expect(target).toBe('../profiles/fixture/fixture-1')
    const installed = path.resolve(path.dirname(active), target)
    expect(await readFile(path.join(installed, 'NOTICES.txt'), 'utf8'))
      .toContain('Fixture-1.0')
    expect((await stat(path.join(installed, 'tts', 'piper'))).mode & 0o111)
      .not.toBe(0)
    expect(result.stdout).toContain(
      'AGENTIC_REMOTE_VOICE_STT_MODEL_DIR=models/oracle-voice/active/fixture/stt/stt-model',
    )
    expect(result.stdout).toContain(
      'AGENTIC_REMOTE_VOICE_TTS_CONFIG=models/oracle-voice/active/fixture/tts/voice.onnx.json',
    )
    expect(result.stdout).toContain(
      'Oracle voice remains disabled until AGENTIC_REMOTE_ORACLE_VOICE=on is set.',
    )
  })

  it('preserves the active profile when a checksum does not match', async () => {
    const fixture = await installerFixture()
    const installed = await fixture.run()
    expect(installed, installed.stderr).toMatchObject({ code: 0 })
    const active = path.join(
      fixture.data,
      'models',
      'oracle-voice',
      'active',
      'fixture',
    )
    const before = await readlink(active)
    await fixture.writeManifest({
      ...fixture.profile,
      version: 'fixture-2',
      assets: fixture.profile.assets.map((asset) =>
        asset.id === 'stt' ? { ...asset, sha256: '0'.repeat(64) } : asset
      ),
    })

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('checksum mismatch')
    expect(await readlink(active)).toBe(before)
  })

  it('cleans partial staging after extraction failure', async () => {
    const fixture = await installerFixture()
    const fakeTar = path.join(fixture.root, 'bin', 'tar')
    await writeExecutable(
      fakeTar,
      [
        '#!/usr/bin/env bash',
        'if [[ "$*" == *" -x"* || "$1" == -x* ]]; then',
        '  while (($#)); do',
        '    if [[ "$1" == "-C" ]]; then mkdir -p "$2"; echo partial >"$2/partial"; break; fi',
        '    shift',
        '  done',
        '  exit 7',
        'fi',
        'exec /usr/bin/tar "$@"',
      ].join('\n'),
    )

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    const root = path.join(fixture.data, 'models', 'oracle-voice')
    const entries = await readdir(root)
    expect(entries.some((entry) => entry.startsWith('.staging-'))).toBe(false)
  })

  it('rejects archive path traversal before extraction', async () => {
    const fixture = await installerFixture({ maliciousArchive: true })
    const escaped = path.join(
      fixture.data,
      'models',
      'oracle-voice',
      'escape',
    )

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('unsafe archive path')
    await expect(stat(escaped)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('reuses an identical installed version without downloading again', async () => {
    const fixture = await installerFixture()
    const installed = await fixture.run()
    expect(installed, installed.stderr).toMatchObject({ code: 0 })
    const firstDownloads = (await readFile(fixture.downloadLog, 'utf8'))
      .trim()
      .split('\n')

    const result = await fixture.run()

    expect(result.code).toBe(0)
    expect((await readFile(fixture.downloadLog, 'utf8')).trim().split('\n'))
      .toEqual(firstDownloads)
    expect(result.stdout).toContain('already installed')
  })
})
