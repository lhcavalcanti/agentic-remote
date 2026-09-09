import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// These assertions describe the dated defects, not desirable regression tests.
// A fixed implementation should make this reproduction fail; revalidate the report.
const root = fileURLToPath(new URL('../../../', import.meta.url))
const source = (name) => import(pathToFileURL(path.join(root, name)).href)
const { KnowledgeStore } = await source('server/knowledge-store.ts')
const { ComputerRegistry } = await source('server/computer-registry.ts')
const { PushNotificationService } = await source('server/push-notification-service.ts')
const fixture = await mkdtemp(path.join(os.tmpdir(), 'agentic-remote-gap-review-'))

async function refused(operation) {
  try {
    await operation()
  } catch (error) {
    assert.equal(error.code, 'EISDIR')
    return error.code
  }
  throw new Error('Expected the controlled filesystem refusal; revalidate the finding')
}

try {
  const knowledgeDirectory = path.join(fixture, 'knowledge')
  const knowledge = new KnowledgeStore(knowledgeDirectory)
  await knowledge.initialize()
  const knowledgeFile = path.join(knowledgeDirectory, 'knowledge.json')
  await mkdir(`${knowledgeFile}.tmp`)
  const candidate = {
    computerId: 'synthetic-computer',
    computerName: 'Synthetic computer',
    path: '/synthetic/read-only-folder',
    name: 'Synthetic folder',
  }
  const knowledgeError = await refused(() => knowledge.addRoot(candidate))
  const ghost = knowledge.listRoots()[0]
  assert.equal(ghost.name, candidate.name)
  const retried = await knowledge.addRoot(candidate)
  assert.equal(retried.id, ghost.id)
  const persistedKnowledge = JSON.parse(await readFile(knowledgeFile, 'utf8'))
  assert.equal(persistedKnowledge.roots.length, 0)
  const reloadedKnowledge = new KnowledgeStore(knowledgeDirectory)
  await reloadedKnowledge.initialize()
  assert.equal(reloadedKnowledge.listRoots().length, 0)

  const registryDirectory = path.join(fixture, 'registry')
  const registry = new ComputerRegistry(registryDirectory)
  await registry.initialize()
  const registryFile = path.join(registryDirectory, 'computers.json')
  await mkdir(`${registryFile}.tmp`)
  const registryError = await refused(() => registry.upsert({
    id: 'synthetic-node',
    name: 'Synthetic node',
    baseUrl: 'http://127.0.0.1:1',
    token: 'synthetic-not-a-credential',
  }))
  assert.equal(registry.list().length, 1)
  assert.equal(JSON.parse(await readFile(registryFile, 'utf8')).computers.length, 0)
  await rm(`${registryFile}.tmp`, { recursive: true })
  await registry.upsert({
    id: 'another-synthetic-node',
    name: 'Another synthetic node',
    baseUrl: 'http://127.0.0.1:2',
    token: 'synthetic-not-a-credential',
  })
  const savedIds = JSON.parse(await readFile(registryFile, 'utf8')).computers.map((entry) => entry.id)
  assert.deepEqual(savedIds.sort(), ['another-synthetic-node', 'synthetic-node'])

  const pushDirectory = path.join(fixture, 'push')
  const push = new PushNotificationService(pushDirectory, async () => {
    throw new Error('This fixture must never send a push notification')
  })
  await push.initialize()
  const pushFile = path.join(pushDirectory, 'push-notifications.json')
  await mkdir(`${pushFile}.tmp`)
  const pushError = await refused(() => push.setSessionMuted('synthetic-computer', 'synthetic-session', true))
  assert.deepEqual(push.settings().mutedSessions, ['synthetic-computer:synthetic-session'])
  assert.deepEqual(JSON.parse(await readFile(pushFile, 'utf8')).mutedSessions, [])
  push.stop()

  console.log(JSON.stringify({
    knowledge: {
      error: knowledgeError,
      visibleRootsAfterRefusal: knowledge.listRoots().length,
      retryReturnedSuccessWhileStorageStillBlocked: true,
      rootsOnDiskAndAfterReload: 0,
    },
    registry: {
      error: registryError,
      rejectedComputerVisibleInMemory: true,
      laterUnrelatedWriteCommittedRejectedComputer: true,
    },
    push: {
      error: pushError,
      rejectedMuteVisibleInMemory: true,
      mutedSessionsOnDisk: 0,
    },
    privacy: 'New synthetic directories only; no provider, network request, live state, or printed secrets.',
  }, null, 2))
} finally {
  await rm(fixture, { recursive: true, force: true })
}
