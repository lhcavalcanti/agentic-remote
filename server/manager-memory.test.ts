import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ManagerMemory, ManagerMemoryError } from './manager-memory.js'

describe('ManagerMemory', () => {
  let root: string
  let memory: ManagerMemory

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'manager-memory-'))
    memory = new ManagerMemory(path.join(root, 'memory'), {
      maxFileBytes: 64,
      maxTotalBytes: 128,
    })
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('writes, reads, appends, lists, and deletes Markdown notes', async () => {
    await memory.write('MEMORY.md', '# Index\n')
    await memory.write('sessions/abc.md', 'notes')
    await memory.append('MEMORY.md', '- prefers PRs')

    expect(await memory.read('MEMORY.md')).toBe('# Index\n- prefers PRs')
    expect((await memory.list()).map((entry) => entry.path)).toEqual([
      'MEMORY.md',
      'sessions/abc.md',
    ])

    await memory.delete('sessions/abc.md')
    expect((await memory.list()).map((entry) => entry.path)).toEqual(['MEMORY.md'])
  })

  it('separates appended text from a note that does not end in a newline', async () => {
    await memory.write('notes.md', 'one')
    await memory.append('notes.md', 'two')
    await memory.append('fresh.md', 'first')
    expect(await memory.read('notes.md')).toBe('one\ntwo')
    expect(await memory.read('fresh.md')).toBe('first')
  })

  it.each([
    ['/etc/passwd.md'],
    ['../escape.md'],
    ['sessions/../../escape.md'],
    ['.hidden/notes.md'],
    ['notes.txt'],
    [''],
    ['a\0b.md'],
  ])('refuses the path %j', async (candidate) => {
    await expect(memory.write(candidate, 'x')).rejects.toBeInstanceOf(ManagerMemoryError)
    await expect(memory.read(candidate)).rejects.toBeInstanceOf(ManagerMemoryError)
  })

  it('refuses a note reached through a symbolic link', async () => {
    const outside = path.join(root, 'outside')
    await mkdir(outside)
    await writeFile(path.join(outside, 'secret.md'), 'secret')
    await mkdir(path.join(root, 'memory'), { recursive: true })
    await symlink(outside, path.join(root, 'memory', 'linked'))

    await expect(memory.read('linked/secret.md')).rejects.toThrow(/link/i)
    await expect(memory.write('linked/new.md', 'x')).rejects.toThrow(/link/i)
  })

  it('enforces the per-file and total limits', async () => {
    await expect(memory.write('big.md', 'x'.repeat(65))).rejects.toThrow(/64 bytes/)
    await memory.write('a.md', 'x'.repeat(60))
    await memory.write('b.md', 'x'.repeat(60))
    await expect(memory.write('c.md', 'x'.repeat(20))).rejects.toThrow(/128 bytes/)
    // Replacing a note counts its new size, not both.
    await memory.write('a.md', 'x'.repeat(64))
    await expect(memory.append('a.md', 'y')).rejects.toThrow(/64 bytes/)
  })

  it('reports a missing note as not found and gives no index before one exists', async () => {
    await expect(memory.read('missing.md')).rejects.toMatchObject({ statusCode: 404 })
    expect(await memory.index()).toBeUndefined()
    await memory.write('MEMORY.md', 'index')
    expect(await memory.index()).toBe('index')
  })

  it('truncates a long index for the prompt', async () => {
    const wide = new ManagerMemory(path.join(root, 'wide'), { indexLimit: 10 })
    await wide.write('MEMORY.md', '0123456789abcdef')
    expect(await wide.index()).toBe('0123456789\n… (truncated; read MEMORY.md for the rest)')
  })
})
