import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  machineAccessTestFiles,
  machineAccessTestManifest,
  machineAccessTestProject,
  parallelTestExclude,
  parallelSafeTestProject,
  vitestTestInclude,
  type MachineAccess,
} from '../test-partitions.js'

const testFilePattern = /\.(?:test|spec)\.[cm]?[jt]sx?$/
const ignoredDirectories = new Set(['.git', 'node_modules'])

async function discoverTestFiles(
  directory = process.cwd(),
  prefix = '',
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const relativePath = path.posix.join(prefix, entry.name)
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
      return discoverTestFiles(path.join(directory, entry.name), relativePath)
    }
    return entry.isFile() && testFilePattern.test(entry.name)
      ? [relativePath]
      : []
  }))
  return files.flat().sort()
}

describe('Vitest cohort orchestration', () => {
  it('partitions every discovered test file exactly once', async () => {
    const discovered = await discoverTestFiles()
    const serialFiles = new Set(machineAccessTestFiles)
    const serial = discovered.filter((file) => serialFiles.has(file))
    const parallel = discovered.filter((file) => !serialFiles.has(file))

    expect(new Set(machineAccessTestFiles).size).toBe(machineAccessTestFiles.length)
    expect(serial.sort()).toEqual([...machineAccessTestFiles].sort())
    expect(parallel.filter((file) => serialFiles.has(file))).toEqual([])
    expect([...serial, ...parallel].sort()).toEqual(discovered)
  })

  it('derives the complementary project filters from the serial manifest', () => {
    expect(vitestTestInclude).toEqual(['**/*.{test,spec}.?(c|m)[jt]s?(x)'])
    expect(parallelTestExclude.slice(-machineAccessTestFiles.length))
      .toEqual(machineAccessTestFiles)
    expect(parallelSafeTestProject).toMatchObject({
      include: vitestTestInclude,
      exclude: parallelTestExclude,
      fileParallelism: true,
      maxWorkers: 4,
    })
    expect(machineAccessTestProject).toMatchObject({
      include: machineAccessTestFiles,
      fileParallelism: false,
    })
  })

  it('records why each serial file requires machine access', () => {
    const supportedAccess = new Set<MachineAccess>([
      'real-tmux',
      'copilot-process',
      'process-discovery',
    ])
    const classifiedAccess = new Set<MachineAccess>()

    for (const classification of Object.values(machineAccessTestManifest)) {
      const access = Object.entries(classification.access)
      expect(access.length).toBeGreaterThan(0)
      expect(access.every(([kind]) => supportedAccess.has(kind as MachineAccess)))
        .toBe(true)
      expect(access.every(([, mode]) => mode === 'direct' || mode === 'indirect'))
        .toBe(true)
      access.forEach(([kind]) => classifiedAccess.add(kind as MachineAccess))
      expect(classification.rationale).not.toBe('')
    }
    expect(classifiedAccess).toEqual(supportedAccess)
  })

  it('keeps conversation recovery away from parallel host discovery', () => {
    expect(
      machineAccessTestManifest['server/conversation-recovery.test.ts'],
    ).toMatchObject({
      access: {
        'real-tmux': 'direct',
        'copilot-process': 'indirect',
        'process-discovery': 'direct',
      },
    })
  })
})
