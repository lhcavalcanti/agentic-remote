import { chmod, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CliCanary,
  cliCanaryStateFile,
  createCliCanary,
  readCopilotVersion,
  type CliCanaryState,
} from './cli-canary.js'

const directories: string[] = []

afterEach(async () => {
  vi.restoreAllMocks()
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })))
})

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'cli-canary-test-'))
  directories.push(directory)
  return directory
}

function canary(options: {
  version?: string
  state?: CliCanaryState
  probe?: () => Promise<void>
  now?: number
} = {}) {
  let state: CliCanaryState = options.state ?? {}
  const probe = vi.fn(options.probe ?? (async () => undefined))
  const alert = vi.fn()
  const writeState = vi.fn(async (next: CliCanaryState) => {
    state = next
  })
  const subject = new CliCanary({
    readVersion: async () => 'version' in options ? options.version : '1.0.98',
    probe,
    readState: async () => state,
    writeState,
    alert,
    now: () => options.now ?? Date.parse('2026-10-14T12:00:00Z'),
  })
  return { subject, probe, alert, writeState, state: () => state }
}

describe('CliCanary', () => {
  it('does nothing on a computer that cannot start terminal sessions', async () => {
    const probe = vi.fn(async () => undefined)
    const readVersion = vi.fn(async () => '1.0.98')
    const subject = new CliCanary({
      available: async () => false,
      readVersion,
      probe,
      readState: async () => ({}),
      writeState: async () => undefined,
      alert: vi.fn(),
    })
    await expect(subject.check()).resolves.toBe('unknown')
    expect(readVersion).not.toHaveBeenCalled()
    expect(probe).not.toHaveBeenCalled()
  })

  it('does nothing when the version cannot be read', async () => {
    const { subject, probe } = canary({ version: undefined })
    await expect(subject.check()).resolves.toBe('unknown')
    expect(probe).not.toHaveBeenCalled()
  })

  it('does not probe a version that already passed', async () => {
    const { subject, probe } = canary({ state: { verifiedVersion: '1.0.98' } })
    await expect(subject.check()).resolves.toBe('unchanged')
    expect(probe).not.toHaveBeenCalled()
  })

  it('records a new version that starts as the app expects', async () => {
    const { subject, probe, alert, state } = canary({
      state: { verifiedVersion: '1.0.97', failedVersion: '1.0.96', failedAt: '2026-10-14T00:00:00Z', failure: 'old' },
    })
    await expect(subject.check()).resolves.toBe('passed')
    expect(probe).toHaveBeenCalledTimes(1)
    expect(alert).not.toHaveBeenCalled()
    expect(state()).toEqual({ verifiedVersion: '1.0.98' })
  })

  it('gives a slow start a second chance before raising the alarm', async () => {
    let attempts = 0
    const { subject, alert } = canary({
      probe: async () => {
        attempts += 1
        if (attempts === 1) throw new Error('Copilot did not become ready for terminal input')
      },
    })
    await expect(subject.check()).resolves.toBe('passed')
    expect(attempts).toBe(2)
    expect(alert).not.toHaveBeenCalled()
  })

  it('alerts once when a new version keeps failing, and looks again a day later', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const failing = async () => {
      throw new Error('Copilot did not become ready for terminal input\n ◉ Something new')
    }
    const first = canary({ state: { verifiedVersion: '1.0.97' }, probe: failing })
    await expect(first.subject.check()).resolves.toBe('failed')
    expect(first.probe).toHaveBeenCalledTimes(2)
    expect(first.alert).toHaveBeenCalledTimes(1)
    expect(first.alert).toHaveBeenCalledWith(
      'Copilot CLI 1.0.98 did not start in a way Agentic Remote can use, so new terminal sessions may fail: Copilot did not become ready for terminal input',
    )
    expect(first.state()).toEqual({
      verifiedVersion: '1.0.97',
      failedVersion: '1.0.98',
      failedAt: '2026-10-14T12:00:00.000Z',
      failure: 'Copilot did not become ready for terminal input\n ◉ Something new',
    })
    expect(error).toHaveBeenCalled()

    const later = canary({ state: first.state(), probe: failing, now: Date.parse('2026-10-15T11:59:00Z') })
    await expect(later.subject.check()).resolves.toBe('unchanged')
    expect(later.probe).not.toHaveBeenCalled()
    expect(later.alert).not.toHaveBeenCalled()

    const nextDay = canary({ state: first.state(), now: Date.parse('2026-10-15T12:00:01Z') })
    await expect(nextDay.subject.check()).resolves.toBe('passed')
    expect(nextDay.state()).toEqual({ verifiedVersion: '1.0.98' })
  })

  it('runs one probe at a time', async () => {
    let finish!: () => void
    const { subject, probe } = canary({
      probe: () => new Promise<void>((resolve) => { finish = resolve }),
    })
    const first = subject.check()
    const second = subject.check()
    await vi.waitFor(() => expect(probe).toHaveBeenCalledTimes(1))
    finish()
    await expect(Promise.all([first, second])).resolves.toEqual(['passed', 'passed'])
    expect(probe).toHaveBeenCalledTimes(1)
  })

  it('cancels a check under way when stopped, recording and reporting nothing', async () => {
    let end!: (error: Error) => void
    const probe = vi.fn(() => new Promise<void>((_resolve, reject) => { end = reject }))
    const cancel = vi.fn(async () => end(new Error('The probe was ended')))
    const alert = vi.fn()
    const writeState = vi.fn(async () => undefined)
    const subject = new CliCanary({
      readVersion: async () => '1.0.98',
      probe,
      readState: async () => ({}),
      writeState,
      alert,
      cancel,
    })
    const running = subject.check()
    await vi.waitFor(() => expect(probe).toHaveBeenCalledTimes(1))

    await subject.stop()

    await expect(running).resolves.toBe('unknown')
    expect(cancel).toHaveBeenCalledOnce()
    expect(probe).toHaveBeenCalledTimes(1)
    expect(writeState).not.toHaveBeenCalled()
    expect(alert).not.toHaveBeenCalled()
  })

  it('checks after the first delay and then on its interval until stopped', async () => {
    vi.useFakeTimers()
    try {
      const { subject } = canary()
      const check = vi.spyOn(subject, 'check').mockResolvedValue('unchanged')
      subject.start(1_000, 5_000)
      await vi.advanceTimersByTimeAsync(999)
      expect(check).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1)
      expect(check).toHaveBeenCalledTimes(1)
      await vi.advanceTimersByTimeAsync(5_000)
      expect(check).toHaveBeenCalledTimes(2)
      subject.stop()
      await vi.advanceTimersByTimeAsync(20_000)
      expect(check).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('readCopilotVersion', () => {
  it('reads the version Copilot prints', async () => {
    const directory = await temporaryDirectory()
    const bin = path.join(directory, 'copilot')
    await writeFile(bin, "#!/bin/sh\necho 'GitHub Copilot CLI 1.0.97.'\necho \"Run 'copilot update' to check for updates.\"\n")
    await chmod(bin, 0o755)
    await expect(readCopilotVersion(bin)).resolves.toBe('1.0.97')
  })

  it('reads a prerelease version', async () => {
    const directory = await temporaryDirectory()
    const bin = path.join(directory, 'copilot')
    await writeFile(bin, "#!/bin/sh\necho 'GitHub Copilot CLI 1.1.0-beta.2'\n")
    await chmod(bin, 0o755)
    await expect(readCopilotVersion(bin)).resolves.toBe('1.1.0-beta.2')
  })

  it('reads nothing when Copilot cannot be run', async () => {
    const directory = await temporaryDirectory()
    await expect(readCopilotVersion(path.join(directory, 'missing'))).resolves.toBeUndefined()
  })
})

describe('cliCanaryStateFile', () => {
  it('starts empty, then reads back what it wrote', async () => {
    const directory = await temporaryDirectory()
    const file = path.join(directory, 'nested', 'cli-canary.json')
    const store = cliCanaryStateFile(file)
    await expect(store.read()).resolves.toEqual({})
    await store.write({ verifiedVersion: '1.0.97' })
    await expect(store.read()).resolves.toEqual({ verifiedVersion: '1.0.97' })
  })

  it('reads damaged state as none, so the next version is probed', async () => {
    const directory = await temporaryDirectory()
    const file = path.join(directory, 'cli-canary.json')
    await writeFile(file, '{"verifiedVersion":')
    await expect(cliCanaryStateFile(file).read()).resolves.toEqual({})
  })
})

describe('createCliCanary', () => {
  it('gives every attempt a fresh empty folder and removes it afterwards', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const directory = await temporaryDirectory()
    const bin = path.join(directory, 'copilot')
    await writeFile(bin, "#!/bin/sh\necho 'GitHub Copilot CLI 1.0.99.'\n")
    await chmod(bin, 0o755)
    const seen: string[][] = []
    const probe = vi.fn(async (cwd: string) => {
      seen.push(await readdir(cwd))
      await writeFile(path.join(cwd, 'left-by-a-hook.txt'), 'x')
      throw new Error('Copilot did not become ready for terminal input')
    })
    const subject = createCliCanary({ dataDirectory: directory, copilotBin: bin, probe, alert: vi.fn() })
    // Left by a service that stopped in the middle of a probe.
    await mkdir(path.join(directory, 'cli-canary'))
    await writeFile(path.join(directory, 'cli-canary', 'stale.txt'), 'x')

    await expect(subject.check()).resolves.toBe('failed')

    expect(seen).toEqual([[], []])
    await expect(stat(path.join(directory, 'cli-canary'))).rejects.toMatchObject({ code: 'ENOENT' })
    expect(error).toHaveBeenCalled()
  })


  it('probes from an empty folder of its own and keeps its state in the data directory', async () => {
    const directory = await temporaryDirectory()
    const bin = path.join(directory, 'copilot')
    await writeFile(bin, "#!/bin/sh\necho 'GitHub Copilot CLI 1.0.99.'\n")
    await chmod(bin, 0o755)
    const probe = vi.fn(async (_cwd: string) => undefined)
    const alert = vi.fn()
    const subject = createCliCanary({ dataDirectory: directory, copilotBin: bin, probe, alert })

    await expect(subject.check()).resolves.toBe('passed')

    expect(probe).toHaveBeenCalledWith(path.join(directory, 'cli-canary'))
    await expect(stat(path.join(directory, 'cli-canary'))).rejects.toMatchObject({ code: 'ENOENT' })
    expect(JSON.parse(await readFile(path.join(directory, 'cli-canary.json'), 'utf8')))
      .toEqual({ verifiedVersion: '1.0.99' })
    await expect(subject.check()).resolves.toBe('unchanged')
    expect(probe).toHaveBeenCalledTimes(1)
    expect(alert).not.toHaveBeenCalled()
  })
})
