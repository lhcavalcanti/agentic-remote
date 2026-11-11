import { mkdir, mkdtemp, readdir, readFile, rm, stat, symlink, utimes, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ManagerStore } from './manager-store.js'
import { writePrivateUpload } from './upload-storage.js'

describe('Oracle uploads', () => {
  let directory: string
  let store: ManagerStore
  let now: Date
  beforeEach(async () => {
    await mkdir('node_modules/.cache/oracle-tests', { recursive: true })
    directory = await mkdtemp(path.resolve('node_modules/.cache/oracle-tests/uploads-'))
    now = new Date()
    store = new ManagerStore(path.join(directory, 'manager'), { now: () => now, conversationKeep: 2 })
    await store.initialize()
  })
  afterEach(async () => { await rm(directory, { recursive: true, force: true }) })

  it('stores sanitized private UUID files and returns only opaque references', async () => {
    const file = await store.uploadFile('../../résumé notes.md', Buffer.from('Hello'))
    expect(file).toMatchObject({ name: 'r_sum_ notes.md', size: 5, mimeType: 'text/markdown' })
    expect(file.id).toMatch(/^[a-f0-9-]{36}$/)
    expect(JSON.stringify(file)).not.toContain(directory)
    const files = await readdir(path.join(store.directory, 'uploads'))
    expect(files).toEqual([`${file.id}-${file.name}`])
    expect((await stat(path.join(store.directory, 'uploads'))).mode & 0o777).toBe(0o700)
    expect((await stat(store.directory)).mode & 0o777).toBe(0o700)
    expect((await stat(path.join(store.directory, 'uploads', files[0]))).mode & 0o777).toBe(0o600)
  })

  it('maps text-like uploads to MIME base64 blobs and PDF/images to SDK files', async () => {
    const markdown = await store.uploadFile('note.md', Buffer.from('Shared data'))
    const json = await store.uploadFile('data.json', Buffer.from('{"a":1}'))
    const pdf = await store.uploadFile('report.pdf', Buffer.from('%PDF-1.7'))
    const png = await store.uploadFile('chart.png', Buffer.from([137, 80, 78, 71]))
    expect(await store.resolveAttachments([markdown, json, pdf, png])).toEqual([
      { type: 'blob', data: Buffer.from('Shared data').toString('base64'), mimeType: 'text/markdown', displayName: 'note.md' },
      { type: 'blob', data: Buffer.from('{"a":1}').toString('base64'), mimeType: 'application/json', displayName: 'data.json' },
      { type: 'file', path: path.join(store.directory, 'uploads', `${pdf.id}-report.pdf`), displayName: 'report.pdf' },
      { type: 'file', path: path.join(store.directory, 'uploads', `${png.id}-chart.png`), displayName: 'chart.png' },
    ])
  })

  it('enforces type and size limits before encoding or storing bytes', async () => {
    await expect(store.uploadFile('code.ts', Buffer.alloc(1024 * 1024 + 1, 65))).rejects.toMatchObject({ statusCode: 413 })
    await expect(store.uploadFile('image.png', Buffer.alloc(25 * 1024 * 1024 + 1))).rejects.toMatchObject({ statusCode: 413 })
    await expect(store.uploadFile('archive.zip', Buffer.from('zip'))).rejects.toMatchObject({ statusCode: 415 })
    await expect(store.uploadFile('empty.txt', Buffer.alloc(0))).rejects.toMatchObject({ statusCode: 400 })
    const file = await store.uploadFile('code.ts', Buffer.alloc(1024 * 1024, 65))
    expect(file.size).toBe(1024 * 1024)
    await writeFile(path.join(store.directory, 'uploads', `${file.id}-${file.name}`), Buffer.alloc(1024 * 1024 + 1, 65))
    await expect(store.resolveAttachments([file])).rejects.toMatchObject({ statusCode: 413 })
  })

  it('rejects binary content disguised as text and never overwrites an upload or symlink', async () => {
    await expect(store.uploadFile('disguised.txt', Buffer.from([0, 255, 0]))).rejects.toMatchObject({ statusCode: 415 })
    const file = await store.uploadFile('keep.txt', Buffer.from('keep'))
    const uploaded = path.join(store.directory, 'uploads', `${file.id}-${file.name}`)
    await expect(writePrivateUpload(uploaded, Buffer.from('replace'))).rejects.toMatchObject({ code: 'EEXIST' })
    expect(await readFile(uploaded, 'utf8')).toBe('keep')
    const link = path.join(directory, 'link.txt')
    await symlink(uploaded, link)
    await expect(writePrivateUpload(link, Buffer.from('replace'))).rejects.toMatchObject({ code: 'EEXIST' })
    expect(await readFile(uploaded, 'utf8')).toBe('keep')
  })

  it('refuses symlink directories and symlink file reuse without touching their targets', async () => {
    const file = await store.uploadFile('note.txt', Buffer.from('data'))
    const uploaded = path.join(store.directory, 'uploads', `${file.id}-${file.name}`)
    const target = path.join(directory, 'target.txt')
    await writeFile(target, 'private')
    await rm(uploaded)
    await symlink(target, uploaded)
    await expect(store.resolveAttachments([file])).rejects.toThrow()
    expect(await readFile(target, 'utf8')).toBe('private')
    await rm(path.join(store.directory, 'uploads'), { recursive: true })
    await symlink(directory, path.join(store.directory, 'uploads'))
    await expect(store.uploadFile('note.txt', Buffer.from('overwrite'))).rejects.toThrow()
  })

  it('preserves references on restart and removes only unowned uploads after 24 hours', async () => {
    const owned = await store.uploadFile('owned.txt', Buffer.from('keep'))
    const unsent = await store.uploadFile('unsent.txt', Buffer.from('expire'))
    await store.upsertMessage({ id: 'm', role: 'user', content: 'read', state: 'queued', createdAt: now.toISOString(), attachments: [owned] })
    const later = new ManagerStore(store.directory, { now: () => new Date(now.getTime() + 25 * 60 * 60 * 1000) })
    await later.initialize()
    expect(later.message('m')?.attachments).toEqual([owned])
    expect(await later.attachmentReferences([owned.id])).toEqual([owned])
    await expect(later.attachmentReferences([unsent.id])).rejects.toMatchObject({ statusCode: 404 })
    await expect(later.removeUpload(owned.id)).rejects.toMatchObject({ statusCode: 409 })
  })

  it('cleans cancelled queue files, evicted history, and Start over including unsent files', async () => {
    const one = await store.uploadFile('one.txt', Buffer.from('one'))
    await store.upsertMessage({ id: 'one', role: 'user', content: 'one', state: 'queued', createdAt: now.toISOString(), attachments: [one] })
    await store.upsertMessage({ ...store.message('one')!, state: 'cancelled', attachments: undefined })
    await expect(store.attachmentReferences([one.id])).rejects.toMatchObject({ statusCode: 404 })
    const two = await store.uploadFile('two.txt', Buffer.from('two'))
    await store.upsertMessage({ id: 'two', role: 'user', content: 'two', createdAt: now.toISOString(), attachments: [two] })
    for (const id of ['three', 'four']) await store.upsertMessage({ id, role: 'assistant', content: id, createdAt: now.toISOString() })
    await expect(store.attachmentReferences([two.id])).rejects.toMatchObject({ statusCode: 404 })
    await store.uploadFile('unsent.txt', Buffer.from('unsent'))
    await store.resetConversation()
    expect(await readdir(path.join(store.directory, 'uploads'))).toEqual([])
  })

  it('rejects external paths and duplicate references', async () => {
    await expect(store.attachmentReferences(['/etc/passwd'])).rejects.toMatchObject({ statusCode: 400 })
    const file = await store.uploadFile('note.txt', Buffer.from('text'))
    await expect(store.attachmentReferences([file.id, file.id])).rejects.toMatchObject({ statusCode: 400 })
  })

  it('expires abandoned uploads during explicit maintenance without expiring queued files', async () => {
    const file = await store.uploadFile('abandoned.txt', Buffer.from('data'))
    const old = new Date(now.getTime() - 25 * 60 * 60 * 1000)
    await utimes(path.join(store.directory, 'uploads', `${file.id}-${file.name}`), old, old)
    await store.cleanupUploads()
    await expect(store.attachmentReferences([file.id])).rejects.toMatchObject({ statusCode: 404 })
  })
})
