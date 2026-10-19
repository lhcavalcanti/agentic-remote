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
  expandedBytes?: number
  entryCount?: number
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
  expandedBytes: number
  entryCount: number
  researchOnly?: boolean
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
  await exec('tar', [flag, archivePath, '-C', sourceDirectory, 'stt-model'])
}

async function createBoundaryArchive(
  archivePath: string,
  format: 'tar.bz2' | 'tar.gz',
  kind:
    | 'excessive-headers'
    | 'dense-over-expansion'
    | 'duplicate-path'
    | 'type-conflict',
): Promise<void> {
  await exec('python3', [
    '-c',
    [
      'import bz2, gzip, pathlib, sys, tarfile',
      'path, format_name, kind = sys.argv[1:]',
      'if kind == "excessive-headers":',
      ' first = tarfile.TarInfo("stt-model")',
      ' first.type = tarfile.DIRTYPE',
      ' second = tarfile.TarInfo("stt-model-extra")',
      ' second.type = tarfile.DIRTYPE',
      ' payload = first.tobuf() + second.tobuf() + (b"x" * 512)',
      'elif kind == "dense-over-expansion":',
      ' dense = tarfile.TarInfo("stt-model/dense.bin")',
      ' dense.size = 8 * 1024 * 1024',
      ' payload = dense.tobuf()',
      'elif kind == "duplicate-path":',
      ' first = tarfile.TarInfo("stt-model")',
      ' first.type = tarfile.DIRTYPE',
      ' second = tarfile.TarInfo("stt-model")',
      ' second.type = tarfile.DIRTYPE',
      ' payload = first.tobuf() + second.tobuf() + (b"\\0" * 1024)',
      'else:',
      ' parent = tarfile.TarInfo("stt-model")',
      ' child = tarfile.TarInfo("stt-model/file")',
      ' payload = parent.tobuf() + child.tobuf() + (b"\\0" * 1024)',
      'compressed = gzip.compress(payload) if format_name == "tar.gz" else bz2.compress(payload)',
      'pathlib.Path(path).write_bytes(compressed)',
    ].join('\n'),
    archivePath,
    format,
    kind,
  ])
}

async function archiveMetadata(archivePath: string): Promise<{
  expandedBytes: number
  entryCount: number
}> {
  const { stdout } = await exec('python3', [
    '-c',
    [
      'import json, sys, tarfile',
      'with tarfile.open(sys.argv[1], "r:*") as archive:',
      ' members = archive.getmembers()',
      ' print(json.dumps({"expandedBytes": sum(member.size for member in members), "entryCount": len(members)}))',
    ].join('\n'),
    archivePath,
  ])
  return JSON.parse(stdout)
}

async function writeExecutable(file: string, contents: string): Promise<void> {
  await writeFile(file, contents)
  await chmod(file, 0o755)
}

async function installerFixture(options: {
  version?: string
  archiveFormat?: 'tar.bz2' | 'tar.gz'
  actualArchiveFormat?: 'tar.bz2' | 'tar.gz'
  archiveSha256?: string
  archiveBytes?: number
  archiveExpandedBytes?: number
  archiveEntryCount?: number
  archiveKind?:
    | 'safe'
    | 'traversal'
    | 'fifo'
    | 'sparse'
    | 'excessive-headers'
    | 'dense-over-expansion'
    | 'duplicate-path'
    | 'type-conflict'
  researchOnly?: boolean
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
  const actualArchiveFormat = options.actualArchiveFormat ?? archiveFormat
  const archiveName = archiveFormat === 'tar.bz2' ? 'stt.tar.bz2' : 'stt.tar.gz'
  const archivePath = path.join(sources, archiveName)
  const archiveSource = path.join(root, 'archive-source')
  await mkdir(path.join(archiveSource, 'stt-model'), { recursive: true })
  await writeFile(path.join(archiveSource, 'stt-model', 'tokens.txt'), 'tokens\n')
  if (options.archiveKind === 'traversal') {
    const safe = path.join(archiveSource, 'safe')
    await writeFile(safe, 'escape\n')
    const flag = actualArchiveFormat === 'tar.bz2' ? '-cjf' : '-czf'
    await exec('tar', [
      flag,
      archivePath,
      '--transform=s|safe|../escape|',
      '-C',
      archiveSource,
      'safe',
    ])
  } else if (options.archiveKind === 'fifo') {
    const fifo = path.join(archiveSource, 'stt-model', 'audio.pipe')
    await exec('mkfifo', [fifo])
    await createArchive(archiveSource, archivePath, actualArchiveFormat)
  } else if (options.archiveKind === 'sparse') {
    const sparse = path.join(archiveSource, 'stt-model', 'huge.bin')
    await exec('truncate', ['-s', '8G', sparse])
    const flag = actualArchiveFormat === 'tar.bz2' ? '-cjf' : '-czf'
    await exec('tar', [
      '--sparse',
      flag,
      archivePath,
      '-C',
      archiveSource,
      'stt-model',
    ])
  } else if (
    options.archiveKind === 'excessive-headers'
    || options.archiveKind === 'dense-over-expansion'
    || options.archiveKind === 'duplicate-path'
    || options.archiveKind === 'type-conflict'
  ) {
    await createBoundaryArchive(archivePath, actualArchiveFormat, options.archiveKind)
  } else {
    await createArchive(archiveSource, archivePath, actualArchiveFormat)
  }
  const archive = await readFile(archivePath)
  const measuredArchive = (
    options.archiveKind === 'excessive-headers'
    || options.archiveKind === 'dense-over-expansion'
  )
    ? { expandedBytes: 1, entryCount: 1 }
    : (
        options.archiveKind === 'duplicate-path'
        || options.archiveKind === 'type-conflict'
      )
      ? { expandedBytes: 1, entryCount: 2 }
      : await archiveMetadata(archivePath)

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
    expandedBytes: (
      (options.archiveExpandedBytes ?? measuredArchive.expandedBytes)
      + piper.byteLength
      + voice.byteLength
      + config.byteLength
    ),
    entryCount: (
      (options.archiveEntryCount ?? measuredArchive.entryCount)
      + 3
    ),
    ...(options.researchOnly ? { researchOnly: true } : {}),
    configuration: {
      AGENTIC_REMOTE_VOICE_STT_PROFILE: 'zipformer',
      AGENTIC_REMOTE_VOICE_LANGUAGE: 'en',
      AGENTIC_REMOTE_VOICE_THREADS: '1',
      AGENTIC_REMOTE_VOICE_ENDPOINT_MS: '800',
      AGENTIC_REMOTE_VOICE_STT_MODEL_DIR: 'stt-model',
      AGENTIC_REMOTE_VOICE_TTS_BIN: 'stt-model/piper',
      AGENTIC_REMOTE_VOICE_TTS_MODEL: 'stt-model/voice.onnx',
      AGENTIC_REMOTE_VOICE_TTS_CONFIG: 'stt-model/voice.onnx.json',
    },
    notices: [{
      name: 'Fixture license',
      license: 'Fixture-1.0',
      url: 'https://fixtures.invalid/license',
    }],
    assets: [
      asset('stt', '.', archive, {
        archive: archiveFormat,
        sha256: options.archiveSha256 ?? sha256(archive),
        bytes: options.archiveBytes ?? archive.byteLength,
        expandedBytes: options.archiveExpandedBytes ?? measuredArchive.expandedBytes,
        entryCount: options.archiveEntryCount ?? measuredArchive.entryCount,
      }),
      asset('piper', 'stt-model/piper', piper, { executable: true }),
      asset('voice-model', 'stt-model/voice.onnx', voice),
      asset('voice-config', 'stt-model/voice.onnx.json', config),
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
      'arguments="$*"',
      'destination=""',
      'url=""',
      'while (($#)); do',
      '  case "$1" in',
      '    --output|-o) destination="$2"; shift 2 ;;',
      '    http*) url="$1"; shift ;;',
      '    *) shift ;;',
      '  esac',
      'done',
      'printf "%s\\n" "$url" >>"$DOWNLOAD_LOG"',
      'printf "%s\\n" "$arguments" >>"$CURL_ARGUMENTS_LOG"',
      'if [[ -n "${DOWNLOAD_STARTED_FILE:-}" ]]; then',
      '  : >"$DOWNLOAD_STARTED_FILE"',
      'fi',
      'if [[ -n "${DOWNLOAD_RELEASE_FILE:-}" ]]; then',
      '  while [[ ! -e "$DOWNLOAD_RELEASE_FILE" ]]; do sleep 0.01; done',
      'fi',
      'if [[ "${REDIRECT_TO_HTTP:-}" == 1 ]]; then',
      '  [[ "$arguments" == *"--proto-redir =https"* ]] || {',
      '    if [[ -n "$destination" ]]; then printf insecure >"$destination"; else printf insecure; fi',
      '    exit 0',
      '  }',
      '  printf "curl: redirect rejected by --proto-redir\\n" >&2',
      '  exit 47',
      'fi',
      'if [[ -n "$destination" ]]; then',
      '  cp "$DOWNLOAD_SOURCES/${url##*/}" "$destination"',
      'else',
      '  cat "$DOWNLOAD_SOURCES/${url##*/}"',
      'fi',
    ].join('\n'),
  )
  const downloadLog = path.join(root, 'downloads.log')
  const curlArgumentsLog = path.join(root, 'curl-arguments.log')
  const env = {
    ...process.env,
    HOME: path.join(root, 'home'),
    PATH: `${bin}:${process.env.PATH}`,
    AGENTIC_REMOTE_DATA_DIR: data,
    DOWNLOAD_LOG: downloadLog,
    CURL_ARGUMENTS_LOG: curlArgumentsLog,
    DOWNLOAD_SOURCES: sources,
  }
  const execute = async (
    executable: string,
    args: string[],
    environment: NodeJS.ProcessEnv = env,
  ) => {
    try {
      const result = await exec(executable, args, { env: environment })
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
  const run = async (
    profileId = 'fixture',
    args: string[] = [],
    environment: NodeJS.ProcessEnv = env,
  ) => execute(cli, ['voice-install', profileId, ...args], environment)
  const runWithProfile = async (
    nextProfile: Profile,
    label: string,
    args: string[] = [],
  ) => {
    const alternateRepository = path.join(root, `repository-${label}`)
    await mkdir(path.join(alternateRepository, 'bin'), { recursive: true })
    await mkdir(path.join(alternateRepository, 'config'), { recursive: true })
    const alternateCli = path.join(alternateRepository, 'bin', 'agentic-remote')
    await writeFile(alternateCli, await readFile(repositoryCli))
    await chmod(alternateCli, 0o755)
    await writeFile(
      path.join(alternateRepository, 'config', 'oracle-voice-profiles.json'),
      `${JSON.stringify({ schemaVersion: 1, profiles: [nextProfile] }, null, 2)}\n`,
    )
    return execute(alternateCli, ['voice-install', ...args, nextProfile.id])
  }
  return {
    root,
    data,
    env,
    profile,
    writeManifest,
    run,
    runWithProfile,
    downloadLog,
    curlArgumentsLog,
  }
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
      expect(profile.expandedBytes).toBeGreaterThan(0)
      expect(profile.entryCount).toBeGreaterThan(0)
      let expandedBytes = 0
      for (const asset of profile.assets) {
        expect(asset.url).toMatch(/^https:\/\//)
        expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/)
        expect(asset.bytes).toBeGreaterThan(0)
        expect(asset.licenseUrl).toMatch(/^https:\/\//)
        expect(asset.language).toBeTruthy()
        expect(asset.modelType).toBeTruthy()
        expect(asset.modelVersion).toBeTruthy()
        if (asset.archive) {
          expect(asset.expandedBytes).toBeGreaterThan(0)
          expect(asset.entryCount).toBeGreaterThan(0)
          expandedBytes += asset.expandedBytes!
        } else {
          expandedBytes += asset.bytes
        }
      }
      expect(profile.expandedBytes).toBe(expandedBytes)
      expect(profile.entryCount).toBeGreaterThan(0)
    }
  })

  it('pins the verified LJSpeech model card and marks Faber research-only ancestry', async () => {
    const manifest = await readManifest()
    const fast = manifest.profiles.find(({ id }) => id === 'fast-en')
    const multilingual = manifest.profiles.find(({ id }) => id === 'multilingual-quality')

    expect(fast).not.toHaveProperty('researchOnly')
    expect(fast).toMatchObject({
      description: expect.stringContaining('LJSpeech'),
      expandedBytes: 217_928_692,
      entryCount: 415,
      configuration: {
        AGENTIC_REMOTE_VOICE_TTS_ENGINE: 'sherpa-vits',
      },
    })
    expect(fast?.assets).toContainEqual(expect.objectContaining({
      id: 'ljspeech-model-card',
      bytes: 517,
      destination: 'provenance/ljspeech/MODEL_CARD',
      sha256: 'fbee1529c89d36b3fe76d7e9f3f832dce17f44900a52d76a9bda735654766b4d',
      url: expect.stringContaining(
        'c10ece1aade47bb51c153c893d14e5bf8e5b7117/en/en_US/ljspeech/medium/MODEL_CARD',
      ),
    }))
    expect(multilingual).toMatchObject({
      researchOnly: true,
      description: expect.stringContaining('research-only'),
      expandedBytes: 765_774_415,
      entryCount: 416,
      configuration: {
        AGENTIC_REMOTE_VOICE_TTS_ENGINE: 'sherpa-vits',
      },
    })
    expect(multilingual?.notices.map(({ license }) => license).join('\n'))
      .toContain('Lessac')
    expect(multilingual?.assets).toContainEqual(expect.objectContaining({
      id: 'faber-model-card',
      bytes: 279,
      destination: 'provenance/faber/MODEL_CARD',
      sha256: '01f1a5bcfd0538782726059ae407eae9c2dd1b5b35f7298fd53a68de91afe563',
    }))
  })

  it('configures profiles accepted by the server voice schema', async () => {
    const manifest = await readManifest()
    const required = [
      'AGENTIC_REMOTE_VOICE_STT_MODEL_DIR',
      'AGENTIC_REMOTE_VOICE_STT_PROFILE',
      'AGENTIC_REMOTE_VOICE_LANGUAGE',
      'AGENTIC_REMOTE_VOICE_THREADS',
      'AGENTIC_REMOTE_VOICE_ENDPOINT_MS',
      'AGENTIC_REMOTE_VOICE_TTS_MODEL',
      'AGENTIC_REMOTE_VOICE_TTS_CONFIG',
      'AGENTIC_REMOTE_VOICE_TTS_ENGINE',
      'AGENTIC_REMOTE_VOICE_TTS_TOKENS',
      'AGENTIC_REMOTE_VOICE_TTS_DATA_DIR',
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
      for (const key of required.filter((name) =>
        name.endsWith('_DIR')
        || (name.includes('_TTS_') && name !== 'AGENTIC_REMOTE_VOICE_TTS_ENGINE'))) {
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
      .toBeLessThan(result.stdout.indexOf('Downloading stt'))
  })

  it('requires research-only acknowledgement after notices and before network access', async () => {
    const fixture = await installerFixture({ researchOnly: true })

    const refused = await fixture.run()

    expect(refused.code).not.toBe(0)
    expect(refused.stdout).toContain('Fixture-1.0')
    expect(refused.stderr).toContain('--accept-research-only')
    await expect(readFile(fixture.downloadLog, 'utf8')).rejects.toMatchObject({
      code: 'ENOENT',
    })

    const accepted = await fixture.run('fixture', ['--accept-research-only'])
    expect(accepted, accepted.stderr).toMatchObject({ code: 0 })
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
    expect((await stat(path.join(installed, 'stt-model', 'piper'))).mode & 0o111)
      .not.toBe(0)
    expect(result.stdout).toContain(
      'AGENTIC_REMOTE_VOICE_STT_MODEL_DIR=models/oracle-voice/active/fixture/stt-model',
    )
    expect(result.stdout).toContain(
      'AGENTIC_REMOTE_VOICE_TTS_CONFIG=models/oracle-voice/active/fixture/stt-model/voice.onnx.json',
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
    const fakePython = path.join(fixture.root, 'bin', 'python3')
    await writeExecutable(
      fakePython,
      [
        '#!/usr/bin/env bash',
        'if [[ "$1" == "-" && "$#" == 6 ]]; then',
        '  mkdir -p "$4"',
        '  echo partial >"$4/partial"',
        '  exit 7',
        'fi',
        'exec /usr/bin/python3 "$@"',
      ].join('\n'),
    )

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    const root = path.join(fixture.data, 'models', 'oracle-voice')
    const entries = await readdir(root)
    expect(entries.some((entry) => entry.startsWith('.staging-'))).toBe(false)
  })

  it('rejects archive path traversal before extraction', async () => {
    const fixture = await installerFixture({ archiveKind: 'traversal' })
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

  it('rejects FIFO archive entries and cleans staging', async () => {
    const fixture = await installerFixture({ archiveKind: 'fifo' })

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('regular files and directories')
    const root = path.join(fixture.data, 'models', 'oracle-voice')
    expect((await readdir(root)).some((entry) => entry.startsWith('.staging-')))
      .toBe(false)
  })

  it('rejects sparse huge archive entries before extraction', async () => {
    const fixture = await installerFixture({ archiveKind: 'sparse' })

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    expect(result.stderr).toMatch(/sparse|expanded byte/i)
    const root = path.join(fixture.data, 'models', 'oracle-voice')
    expect((await readdir(root)).some((entry) => entry.startsWith('.staging-')))
      .toBe(false)
  })

  it('rejects an archive whose compression does not match its manifest type', async () => {
    const fixture = await installerFixture({
      archiveFormat: 'tar.gz',
      actualArchiveFormat: 'tar.bz2',
    })

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    expect(result.stderr).toMatch(/compression|gzip|bzip2/i)
    const root = path.join(fixture.data, 'models', 'oracle-voice')
    expect((await readdir(root)).some((entry) => entry.startsWith('.staging-')))
      .toBe(false)
  })

  it('aborts on the first header above the pinned entry count', async () => {
    const fixture = await installerFixture({
      archiveKind: 'excessive-headers',
      archiveEntryCount: 1,
      archiveExpandedBytes: 1,
    })

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('archive entry count exceeds pinned 1')
    const root = path.join(fixture.data, 'models', 'oracle-voice')
    expect((await readdir(root)).some((entry) => entry.startsWith('.staging-')))
      .toBe(false)
  })

  it('rejects dense over-expansion from its header before reading corrupt payload', async () => {
    const fixture = await installerFixture({
      archiveKind: 'dense-over-expansion',
      archiveEntryCount: 1,
      archiveExpandedBytes: 1,
    })

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('archive expanded bytes exceed pinned 1')
    const root = path.join(fixture.data, 'models', 'oracle-voice')
    expect((await readdir(root)).some((entry) => entry.startsWith('.staging-')))
      .toBe(false)
  })

  it.each([
    ['duplicate archive path', 'duplicate-path'],
    ['archive path type conflict', 'type-conflict'],
  ] as const)('rejects a %s', async (message, archiveKind) => {
    const fixture = await installerFixture({
      archiveKind,
      archiveEntryCount: 2,
      archiveExpandedBytes: 1,
    })

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain(message)
    const root = path.join(fixture.data, 'models', 'oracle-voice')
    expect((await readdir(root)).some((entry) => entry.startsWith('.staging-')))
      .toBe(false)
  })

  it.each([
    ['expanded byte', { archiveExpandedBytes: 1 }],
    ['entry count', { archiveEntryCount: 1 }],
  ])('rejects an archive whose pinned %s does not match', async (_label, overrides) => {
    const fixture = await installerFixture(overrides)

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    expect(result.stderr).toMatch(/expanded byte|entry count/i)
  })

  it('stops a streaming oversized response at the exact byte limit', async () => {
    const fixture = await installerFixture({ archiveBytes: 10 })

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('exceeded the pinned 10-byte limit')
    const root = path.join(fixture.data, 'models', 'oracle-voice')
    expect((await readdir(root)).some((entry) => entry.startsWith('.staging-')))
      .toBe(false)
  })

  it('allows only HTTPS for the initial request and redirects with bounded retries', async () => {
    const fixture = await installerFixture()

    const result = await fixture.run('fixture', [], {
      ...process.env,
      HOME: path.join(fixture.root, 'home'),
      PATH: `${path.join(fixture.root, 'bin')}:${process.env.PATH}`,
      AGENTIC_REMOTE_DATA_DIR: fixture.data,
      DOWNLOAD_LOG: fixture.downloadLog,
      DOWNLOAD_SOURCES: path.join(fixture.root, 'sources'),
      CURL_ARGUMENTS_LOG: fixture.curlArgumentsLog,
      REDIRECT_TO_HTTP: '1',
    })

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('download failed after 3 attempts')
    const argumentsUsed = await readFile(fixture.curlArgumentsLog, 'utf8')
    expect(argumentsUsed).toContain('--proto =https')
    expect(argumentsUsed).toContain('--proto-redir =https')
    expect(argumentsUsed).toContain('--connect-timeout')
    expect(argumentsUsed).toContain('--max-time')
    expect((await readFile(fixture.downloadLog, 'utf8')).trim().split('\n'))
      .toHaveLength(3)
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

  it('refuses to reactivate an installed profile whose contents changed', async () => {
    const fixture = await installerFixture()
    const installed = await fixture.run()
    expect(installed, installed.stderr).toMatchObject({ code: 0 })
    const model = path.join(
      fixture.data,
      'models',
      'oracle-voice',
      'profiles',
      'fixture',
      'fixture-1',
      'stt-model',
      'voice.onnx',
    )
    await writeFile(model, 'bad-model!!\n')

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('integrity check failed')
  })

  it('serializes concurrent same-digest publication without nesting or staging leaks', async () => {
    const fixture = await installerFixture()

    const [first, second] = await Promise.all([
      fixture.runWithProfile(fixture.profile, 'same-a'),
      fixture.runWithProfile(fixture.profile, 'same-b'),
    ])

    expect(first, first.stderr).toMatchObject({ code: 0 })
    expect(second, second.stderr).toMatchObject({ code: 0 })
    const root = path.join(fixture.data, 'models', 'oracle-voice')
    const final = path.join(root, 'profiles', 'fixture', 'fixture-1')
    expect(await readFile(path.join(final, '.profile-sha256'), 'utf8'))
      .toMatch(/^[a-f0-9]{64}\n$/)
    expect((await readdir(final)).some((entry) => entry.startsWith('.staging-')))
      .toBe(false)
    expect((await readdir(root)).some((entry) => entry.startsWith('.staging-')))
      .toBe(false)
  })

  it('refuses to activate a concurrent same-digest publication whose tree changed', async () => {
    const fixture = await installerFixture()
    const started = path.join(fixture.root, 'slow-download-started')
    const release = path.join(fixture.root, 'slow-download-release')
    const slowInstall = fixture.run('fixture', [], {
      ...fixture.env,
      DOWNLOAD_STARTED_FILE: started,
      DOWNLOAD_RELEASE_FILE: release,
    })
    await expect.poll(async () =>
      stat(started).then(() => true, () => false),
    ).toBe(true)
    const published = await fixture.runWithProfile(fixture.profile, 'publisher')
    expect(published, published.stderr).toMatchObject({ code: 0 })
    const model = path.join(
      fixture.data,
      'models',
      'oracle-voice',
      'profiles',
      'fixture',
      'fixture-1',
      'stt-model',
      'voice.onnx',
    )
    await writeFile(model, 'corrupt-data')
    await writeFile(release, '')

    const result = await slowInstall

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('integrity check failed')
  })

  it('fails one concurrent conflicting digest without changing the winner or leaking staging', async () => {
    const fixture = await installerFixture()
    const conflicting: Profile = {
      ...fixture.profile,
      description: 'Conflicting fixture profile',
    }

    const results = await Promise.all([
      fixture.runWithProfile(fixture.profile, 'conflict-a'),
      fixture.runWithProfile(conflicting, 'conflict-b'),
    ])

    expect(results.filter(({ code }) => code === 0)).toHaveLength(1)
    expect(results.filter(({ code }) => code !== 0)).toHaveLength(1)
    expect(results.find(({ code }) => code !== 0)?.stderr)
      .toContain('already exists with different contents')
    const root = path.join(fixture.data, 'models', 'oracle-voice')
    const active = path.join(root, 'active', 'fixture')
    const final = path.resolve(path.dirname(active), await readlink(active))
    const marker = (await readFile(path.join(final, '.profile-sha256'), 'utf8')).trim()
    const winningProfile = results[0].code === 0 ? fixture.profile : conflicting
    expect(marker).toBe(sha256(JSON.stringify(winningProfile)))
    expect((await readdir(root)).some((entry) => entry.startsWith('.staging-')))
      .toBe(false)
  })

  it.each([
    ['exit', 'before-final-rename', 'fixture-1', false],
    ['term', 'before-final-rename', 'fixture-1', false],
    ['exit', 'after-final-rename', 'fixture-1', false],
    ['term', 'after-final-rename', 'fixture-1', false],
    ['exit', 'before-active-replace', 'fixture-1', true],
    ['term', 'before-active-replace', 'fixture-1', true],
    ['exit', 'after-active-replace', 'fixture-2', true],
    ['term', 'after-active-replace', 'fixture-2', true],
  ] as const)(
    'keeps a complete active profile on %s at %s',
    async (action, stage, activeVersion, retainsPublishedVersion) => {
      const fixture = await installerFixture()
      const installed = await fixture.run()
      expect(installed, installed.stderr).toMatchObject({ code: 0 })
      const nextProfile = {
        ...fixture.profile,
        version: 'fixture-2',
      }
      await fixture.writeManifest(nextProfile)

      const result = await fixture.run('fixture', [], {
        ...fixture.env,
        AGENTIC_REMOTE_VOICE_INSTALL_FAULT: `${action}:${stage}`,
      })

      expect(result.code).not.toBe(0)
      const root = path.join(fixture.data, 'models', 'oracle-voice')
      const active = path.join(root, 'active', 'fixture')
      const activeTarget = path.resolve(path.dirname(active), await readlink(active))
      expect(activeTarget).toBe(path.join(
        root,
        'profiles',
        'fixture',
        activeVersion,
      ))
      expect((await stat(activeTarget)).isDirectory()).toBe(true)
      expect(await readFile(path.join(activeTarget, 'PROFILE.json'), 'utf8'))
        .toContain(`"version": "${activeVersion}"`)
      expect(await readFile(path.join(activeTarget, '.profile-sha256'), 'utf8'))
        .toMatch(/^[a-f0-9]{64}\n$/)
      const published = path.join(root, 'profiles', 'fixture', 'fixture-2')
      if (retainsPublishedVersion) {
        expect((await stat(published)).isDirectory()).toBe(true)
      } else {
        await expect(stat(published)).rejects.toMatchObject({ code: 'ENOENT' })
      }
      expect((await readdir(root)).some((entry) => entry.startsWith('.staging-')))
        .toBe(false)
      expect((await readdir(path.join(root, 'active'))).filter(
        (entry) => entry.startsWith('.fixture.current.'),
      )).toEqual([])
    },
  )

  it('retains a validated published profile when activation cannot start', async () => {
    const fixture = await installerFixture()
    const activeRoot = path.join(
      fixture.data,
      'models',
      'oracle-voice',
      'active',
    )
    await mkdir(activeRoot, { recursive: true })
    await writeFile(path.join(activeRoot, 'fixture'), 'not a symlink')

    const result = await fixture.run()

    expect(result.code).not.toBe(0)
    const published = path.join(
      fixture.data,
      'models',
      'oracle-voice',
      'profiles',
      'fixture',
      'fixture-1',
    )
    expect((await stat(published)).isDirectory()).toBe(true)
    expect(await readFile(path.join(published, '.profile-sha256'), 'utf8'))
      .toMatch(/^[a-f0-9]{64}\n$/)
  })
})
