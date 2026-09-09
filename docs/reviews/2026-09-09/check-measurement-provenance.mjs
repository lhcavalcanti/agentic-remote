import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, unlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { measurementBundle, measurementSource } from './measurement-provenance.mjs'

async function repository(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'measurement-provenance-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' })
  git('init', '--quiet')
  git('config', 'user.name', 'Fixture')
  git('config', 'user.email', 'fixture@example.invalid')
  await mkdir(path.join(root, 'server'))
  await writeFile(path.join(root, 'server', 'example.ts'), 'export const value = 1\n')
  git('add', '.')
  git('-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'Synthetic fixture')
  return { root, git }
}

test('identifies clean sources and stops attributing edited sources to HEAD', async (t) => {
  const { root, git } = await repository(t)
  const clean = await measurementSource(root)
  assert.equal(clean.workingTreeDirty, false)
  assert.equal(clean.sourceCommit, clean.headCommit)
  await writeFile(path.join(root, 'server', 'example.ts'), 'export const value = 2\n')
  const dirty = await measurementSource(root)
  assert.equal(dirty.sourceCommit, null)
  assert.equal(dirty.workingTreeDirty, true)
  assert.notEqual(dirty.snapshotSha256, clean.snapshotSha256)
  git('add', '.')
  const staged = await measurementSource(root)
  assert.equal(staged.sourceCommit, null)
  assert.equal(staged.snapshotSha256, dirty.snapshotSha256)
})

test('includes untracked source files and records tracked deletions', async (t) => {
  const { root } = await repository(t)
  const clean = await measurementSource(root)
  await writeFile(path.join(root, 'server', 'untracked.ts'), 'export const other = 1\n')
  const added = await measurementSource(root)
  assert.equal(added.sourceCommit, null)
  assert(added.files.some((file) => file.path === 'server/untracked.ts' && file.sha256))
  assert.notEqual(added.snapshotSha256, clean.snapshotSha256)
  await unlink(path.join(root, 'server', 'example.ts'))
  const deleted = await measurementSource(root)
  assert.deepEqual(deleted.files.find((file) => file.path === 'server/example.ts'),
    { path: 'server/example.ts', sha256: null, missing: true })
})

test('identifies an independent old bundle without assigning the current source commit', async (t) => {
  const { root } = await repository(t)
  assert.equal((await measurementBundle(root)).available, false)
  const assets = path.join(root, 'dist', 'assets')
  await mkdir(assets, { recursive: true })
  await writeFile(path.join(root, 'dist', 'index.html'), '<script src="/assets/example.js"></script>')
  await writeFile(path.join(root, 'dist', 'build-info.json'), JSON.stringify({ version: '0.1.0', buildId: 'old-artifact' }))
  await writeFile(path.join(assets, 'example.js'), 'console.log("old build")')
  const first = await measurementBundle(root)
  assert.equal(first.sourceCommit, null)
  assert.equal(first.buildInfo.buildId, 'old-artifact')
  assert.equal(first.assets.length, 1)
  assert.equal(first.assets[0].sha256.length, 64)
  await writeFile(path.join(assets, 'example.js'), 'console.log("changed build")')
  const changed = await measurementBundle(root)
  assert.notEqual(first.assets[0].sha256, changed.assets[0].sha256)
  await writeFile(path.join(root, 'dist', 'build-info.json'), '{}')
  await assert.rejects(measurementBundle(root), /version and buildId/)
})
