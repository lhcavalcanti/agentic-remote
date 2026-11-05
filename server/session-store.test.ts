import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SessionStore } from './session-store.js'

const temporaryDirectories: string[] = []

async function createStore(): Promise<{
  directory: string
  store: SessionStore
}> {
  const directory = await mkdtemp(path.join(tmpdir(), 'agentic-remote-test-'))
  temporaryDirectories.push(directory)
  const store = new SessionStore(directory)
  await store.initialize()
  return { directory, store }
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('SessionStore', () => {
  describe('SDK restart recovery', () => {
    async function interruptedSdkStore() {
      const { directory, store } = await createStore()
      await store.create({
        id: 'sdk-recovery',
        cwd: '/tmp/project',
        title: 'SDK recovery',
        updatedAt: '2026-10-24T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [{
          id: 'history',
          role: 'user',
          content: 'Keep this turn',
          createdAt: '2026-10-24T00:00:00.000Z',
        }],
        queuedPrompts: [{
          id: 'queued',
          content: 'Send after recovery',
          createdAt: '2026-10-24T00:00:01.000Z',
        }],
        pendingUserInput: {
          requestId: 'question',
          question: 'Which option?',
          choices: ['first', 'second'],
          allowFreeform: false,
        },
      }, { backend: 'sdk', managedOpen: true })
      await store.update('sdk-recovery', (session) => {
        session.status = 'waiting'
        session.activity = 'Which option?'
      })
      await store.close()
      const reopened = new SessionStore(
        directory,
        () => Date.parse('2026-10-24T00:01:00.000Z'),
      )
      await reopened.initialize()
      return { directory, reopened }
    }

    it('persists a restart boundary and monotonically reclaims abandoned recovery', async () => {
      const { directory, reopened } = await interruptedSdkStore()

      expect(reopened.get('sdk-recovery')).toMatchObject({
        status: 'error',
        interruption: {
          detectedAt: '2026-10-24T00:01:00.000Z',
          previousStatus: 'waiting',
        },
        restartRecovery: {
          state: 'interrupted',
          detectedAt: '2026-10-24T00:01:00.000Z',
        },
        pendingUserInput: { requestId: 'question', stale: true },
        queuedPrompts: [{ id: 'queued', content: 'Send after recovery' }],
      })

      const first = await reopened.claimSdkRecovery('sdk-recovery')
      expect(first).toMatchObject({ generation: 1, state: 'recovering' })
      expect(reopened.get('sdk-recovery')?.restartRecovery?.state).toBe('recovering')
      await reopened.close()

      const reclaimed = new SessionStore(
        directory,
        () => Date.parse('2026-10-24T00:02:00.000Z'),
      )
      await reclaimed.initialize()
      const second = await reclaimed.claimSdkRecovery('sdk-recovery')
      expect(second).toMatchObject({ generation: 2, state: 'recovering' })
    })

    it('rejects stale generation settlement without changing the current owner', async () => {
      const { reopened } = await interruptedSdkStore()
      const first = await reopened.claimSdkRecovery('sdk-recovery')
      await reopened.settleSdkRecovery('sdk-recovery', first.generation, {
        state: 'interrupted',
        message: 'The model stream could not be restored.',
      })
      const second = await reopened.claimSdkRecovery('sdk-recovery')

      const stale = await reopened.settleSdkRecovery(
        'sdk-recovery',
        first.generation,
        { state: 'ready' },
      )

      expect(stale).toBeUndefined()
      expect(reopened.sdkRecovery('sdk-recovery')).toMatchObject({
        generation: second.generation,
        state: 'recovering',
      })
      expect(reopened.get('sdk-recovery')?.interruption).toBeDefined()
    })

    it('retains an accepted SDK answer until its exact generation settles', async () => {
      const { directory, reopened } = await interruptedSdkStore()
      const recovery = await reopened.claimSdkRecovery('sdk-recovery')
      await reopened.acceptSdkReply('sdk-recovery', recovery.generation, {
        requestId: 'question',
        kind: 'user-input',
        input: {
          answer: 'second',
          answers: ['second'],
          wasFreeform: false,
        },
      })
      await reopened.close()

      const reloaded = new SessionStore(directory)
      await reloaded.initialize()
      expect(reloaded.sdkAcceptedReply('sdk-recovery')).toMatchObject({
        generation: recovery.generation,
        requestId: 'question',
        kind: 'user-input',
        input: { answer: 'second', answers: ['second'], wasFreeform: false },
      })
      expect(reloaded.get('sdk-recovery')).not.toHaveProperty('sdkAcceptedReply')
      const reclaimed = await reloaded.claimSdkRecovery('sdk-recovery')
      expect(reloaded.sdkAcceptedReply('sdk-recovery')?.generation)
        .toBe(reclaimed.generation)
      expect(await reloaded.clearSdkReply(
        'sdk-recovery',
        recovery.generation,
        'question',
      )).toBeUndefined()
      expect(await reloaded.clearSdkReply(
        'sdk-recovery',
        reclaimed.generation,
        'question',
      )).toBeDefined()
      expect(reloaded.sdkAcceptedReply('sdk-recovery')).toBeUndefined()
    })

    it('keeps provider identities in rollback-safe root maps across an older writer', async () => {
      const { directory, reopened } = await interruptedSdkStore()
      const recovery = await reopened.claimSdkRecovery('sdk-recovery')
      await reopened.bindRecoveredPermission(
        'sdk-recovery', recovery.generation, 'public-permission', 'private-provider-id',
        {
          requestId: 'public-permission',
          title: 'Allow tool',
          options: [{ optionId: 'allow-once', name: 'Allow once', kind: 'allow_once' }],
        },
      )
      await reopened.acceptSdkReply('sdk-recovery', recovery.generation, {
        requestId: 'public-permission',
        kind: 'permission',
        optionId: 'allow-once',
        providerRequestId: 'private-provider-id',
      })
      await reopened.close()

      const filename = path.join(directory, 'state.json')
      const saved = JSON.parse(await readFile(filename, 'utf8'))
      expect(saved.sdkRestartRecoveries['sdk-recovery']).toMatchObject({
        generation: recovery.generation, providerRequestId: 'private-provider-id',
      })
      expect(saved.sdkAcceptedReplies['sdk-recovery']).toMatchObject({
        requestId: 'public-permission', providerRequestId: 'private-provider-id',
      })
      expect(saved.sessions['sdk-recovery']).not.toHaveProperty('sdkRestartRecovery')
      expect(saved.sessions['sdk-recovery']).not.toHaveProperty('sdkAcceptedReply')
      expect(JSON.stringify(saved.sessions)).not.toContain('private-provider-id')

      // An older release saves unknown top-level keys unchanged but projects
      // every unknown session field to clients. Its round trip must be safe.
      saved.sessions['sdk-recovery'].title = 'Renamed during rollback'
      await writeFile(filename, JSON.stringify(saved))
      const rolledForward = new SessionStore(directory)
      await rolledForward.initialize()
      expect(rolledForward.get('sdk-recovery')?.title).toBe('Renamed during rollback')
      expect(rolledForward.sdkRecovery('sdk-recovery')?.providerRequestId).toBe('private-provider-id')
      expect(rolledForward.sdkAcceptedReply('sdk-recovery')?.providerRequestId).toBe('private-provider-id')
      expect(JSON.stringify(rolledForward.get('sdk-recovery'))).not.toContain('private-provider-id')
    })

    it('keeps an accepted SDK reply explicitly interrupted when the turn became idle before restart', async () => {
      const { directory, store } = await createStore()
      await store.create({
        id: 'finished-before-reply-settlement',
        cwd: directory,
        title: 'Finished turn',
        updatedAt: '2026-10-24T00:00:00.000Z',
        status: 'waiting',
        isOpen: true,
        messages: [],
        pendingUserInput: {
          requestId: 'public-question', question: 'Choose?',
          choices: ['Left'], allowFreeform: false,
        },
      }, { backend: 'sdk', managedOpen: true })
      await store.acceptLiveSdkReply('finished-before-reply-settlement', {
        requestId: 'public-question',
        kind: 'user-input',
        input: { answer: 'Left', wasFreeform: false },
      }, 'pendingUserInput', () => false)
      await store.updateStatus('finished-before-reply-settlement', 'idle')
      await store.close()

      const restarted = new SessionStore(directory)
      await restarted.initialize()
      expect(restarted.get('finished-before-reply-settlement')).toMatchObject({
        status: 'error',
        interruption: { previousStatus: 'idle' },
        restartRecovery: { state: 'interrupted' },
        pendingUserInput: { requestId: 'public-question', stale: true },
      })
      expect(restarted.sdkAcceptedReply('finished-before-reply-settlement')).toMatchObject({
        requestId: 'public-question', input: { answer: 'Left' },
      })
    })

    it('migrates validated nested branch metadata to root maps on startup', async () => {
      const { directory, reopened } = await interruptedSdkStore()
      const recovery = await reopened.claimSdkRecovery('sdk-recovery')
      await reopened.bindRecoveredPermission(
        'sdk-recovery', recovery.generation, 'public-permission', 'private-provider-id',
        {
          requestId: 'public-permission',
          title: 'Allow tool',
          options: [{ optionId: 'reject', name: 'Reject', kind: 'reject_once' }],
        },
      )
      await reopened.acceptSdkReply('sdk-recovery', recovery.generation, {
        requestId: 'public-permission',
        kind: 'permission',
        optionId: 'reject',
        providerRequestId: 'private-provider-id',
      })
      await reopened.close()

      const filename = path.join(directory, 'state.json')
      const legacy = JSON.parse(await readFile(filename, 'utf8'))
      legacy.sessions['sdk-recovery'].sdkRestartRecovery =
        legacy.sdkRestartRecoveries['sdk-recovery']
      legacy.sessions['sdk-recovery'].sdkAcceptedReply =
        legacy.sdkAcceptedReplies['sdk-recovery']
      delete legacy.sdkRestartRecoveries
      delete legacy.sdkAcceptedReplies
      await writeFile(filename, JSON.stringify(legacy))

      const migrated = new SessionStore(directory)
      await migrated.initialize()
      expect(migrated.sdkRecovery('sdk-recovery')?.providerRequestId).toBe('private-provider-id')
      expect(migrated.sdkAcceptedReply('sdk-recovery')?.optionId).toBe('reject')
      const saved = JSON.parse(await readFile(filename, 'utf8'))
      expect(saved.sdkRestartRecoveries['sdk-recovery'].providerRequestId).toBe('private-provider-id')
      expect(saved.sdkAcceptedReplies['sdk-recovery'].optionId).toBe('reject')
      expect(saved.sessions['sdk-recovery']).not.toHaveProperty('sdkRestartRecovery')
      expect(saved.sessions['sdk-recovery']).not.toHaveProperty('sdkAcceptedReply')
    })

    it('prefers canonical root maps to conflicting but valid nested branch values', async () => {
      const { directory, reopened } = await interruptedSdkStore()
      const recovery = await reopened.claimSdkRecovery('sdk-recovery')
      await reopened.bindRecoveredPermission(
        'sdk-recovery', recovery.generation, 'public-permission', 'canonical-provider-id',
        {
          requestId: 'public-permission',
          title: 'Allow tool',
          options: [{ optionId: 'reject', name: 'Reject', kind: 'reject_once' }],
        },
      )
      await reopened.acceptSdkReply('sdk-recovery', recovery.generation, {
        requestId: 'public-permission',
        kind: 'permission',
        optionId: 'reject',
        providerRequestId: 'canonical-provider-id',
      })
      await reopened.close()
      const filename = path.join(directory, 'state.json')
      const saved = JSON.parse(await readFile(filename, 'utf8'))
      saved.sessions['sdk-recovery'].sdkRestartRecovery = {
        ...saved.sdkRestartRecoveries['sdk-recovery'],
        generation: recovery.generation + 2,
        providerRequestId: 'obsolete-provider-id',
      }
      saved.sessions['sdk-recovery'].sdkAcceptedReply = {
        ...saved.sdkAcceptedReplies['sdk-recovery'],
        optionId: 'allow-once',
      }
      await writeFile(filename, JSON.stringify(saved))
      const reloaded = new SessionStore(directory)
      await reloaded.initialize()
      expect(reloaded.sdkRecovery('sdk-recovery')?.providerRequestId).toBe('canonical-provider-id')
      expect(reloaded.sdkAcceptedReply('sdk-recovery')?.optionId).toBe('reject')
      const canonical = JSON.parse(await readFile(filename, 'utf8'))
      expect(JSON.stringify(canonical.sessions)).not.toContain('obsolete-provider-id')
      expect(canonical.sessions['sdk-recovery']).not.toHaveProperty('sdkAcceptedReply')
    })

    it.each([
      ['root', 'recovery'],
      ['nested', 'recovery'],
      ['root', 'reply'],
      ['nested', 'reply'],
    ] as const)(
      'rejects invalid %s SDK %s metadata without rewriting state',
      async (location, kind) => {
        const { directory, reopened } = await interruptedSdkStore()
        await reopened.close()
        const filename = path.join(directory, 'state.json')
        const saved = JSON.parse(await readFile(filename, 'utf8'))
        const invalid = kind === 'recovery'
          ? {
              generation: -1,
              state: 'waiting-permission',
              detectedAt: '2026-10-24T00:01:00.000Z',
              previousStatus: 'waiting',
              providerRequestId: 'private-provider-id',
            }
          : {
              generation: -1,
              requestId: 'public-permission',
              kind: 'permission',
              optionId: 'allow-once',
              acceptedAt: '2026-10-24T00:01:00.000Z',
            }
        const field = kind === 'recovery' ? 'sdkRestartRecovery' : 'sdkAcceptedReply'
        const map = kind === 'recovery' ? 'sdkRestartRecoveries' : 'sdkAcceptedReplies'
        if (location === 'root') {
          saved[map] = { 'sdk-recovery': invalid }
        } else {
          saved.sessions['sdk-recovery'][field] = invalid
        }
        const original = JSON.stringify(saved)
        await writeFile(filename, original)
        const reloaded = new SessionStore(directory)
        await expect(reloaded.initialize()).rejects.toThrow(
          kind === 'recovery'
            ? 'Invalid SDK restart recovery metadata'
            : 'Invalid SDK accepted reply metadata',
        )
        expect(await readFile(filename, 'utf8')).toBe(original)
        expect(reloaded.list()).toEqual([])
      },
    )

    it('cancels only the currently claimed SDK recovery generation', async () => {
      const { reopened } = await interruptedSdkStore()
      const first = await reopened.claimSdkRecovery('sdk-recovery')
      const second = await reopened.claimSdkRecovery('sdk-recovery')

      expect(await reopened.cancelSdkRecovery(
        'sdk-recovery',
        first.generation,
      )).toBeUndefined()

      const cancelled = await reopened.cancelSdkRecovery(
        'sdk-recovery',
        second.generation,
      )
      expect(cancelled).toMatchObject({
        status: 'error',
        pendingUserInput: undefined,
        restartRecovery: {
          state: 'interrupted',
          message: expect.stringMatching(/cancelled/i),
        },
      })
    })
  })

  it('keeps archived recovery history across transcript replacement and reload', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'before-recovery',
      cwd: '/project',
      title: 'Recovery project',
      updatedAt: '2026-09-09T00:00:00.000Z',
      status: 'error',
      messages: [
        {
          id: 'goal',
          role: 'user',
          content: 'Keep the original goal',
          createdAt: '2026-09-09T00:00:00.000Z',
        },
        {
          id: 'tool',
          role: 'activity',
          content: 'Old tool state',
          createdAt: '2026-09-09T00:00:01.000Z',
          activityStatus: 'running',
        },
      ],
      queuedPrompts: [{
        id: 'queued',
        content: 'Run after recovery',
        createdAt: '2026-09-09T00:00:02.000Z',
      }],
      runtime: {
        model: 'gpt-test',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'autopilot',
        allowAllPermissions: false,
        contextTokens: 123,
      },
    }, { backend: 'sdk', managedOpen: true })
    const upload = await store.saveUpload(
      'before-recovery',
      'recovery-notes.txt',
      Buffer.from('retained recovery attachment'),
    )

    const recovered = await store.replaceWithRecoveredSession(
      'before-recovery',
      'after-recovery',
      'provider-error',
      1,
      true,
      'Persisted recovery seed',
    )
    await store.replaceTranscript(
      recovered.id,
      [{
        id: 'fresh',
        role: 'assistant',
        content: 'Fresh provider response',
        createdAt: '2026-09-09T00:01:00.000Z',
      }],
      'idle',
    )

    const projected = store.get('after-recovery')!
    expect(projected.messages.map((entry) => entry.content)).toEqual([
      'Keep the original goal',
      'Old tool state',
      expect.stringContaining('Provider conversation was replaced'),
      'Fresh provider response',
    ])
    expect(projected.queuedPrompts?.map((entry) => entry.content)).toEqual([
      'Run after recovery',
    ])
    expect(projected.runtime).toMatchObject({
      model: 'gpt-test',
      reasoningEffort: 'high',
      contextTier: 'long_context',
      mode: 'autopilot',
      allowAllPermissions: false,
    })
    expect(projected.runtime?.contextTokens).toBeUndefined()
    expect(projected.messages[1]).toMatchObject({
      role: 'activity',
      streaming: false,
      activityStatus: 'failed',
      activityResult: 'Stopped when the provider conversation was recovered.',
    })
    await expect(readFile(upload.path, 'utf8')).resolves
      .toBe('retained recovery attachment')
    expect(projected.recovery).toMatchObject({
      archivedMessageCount: 2,
      contextMessageCount: 1,
      contextTruncated: true,
      reason: 'provider-error',
    })
    expect(projected).not.toHaveProperty('recoverySeed')
    expect(projected.recoverySeedState).toBe('pending')
    expect(projected.activity).toBe(
      'Waiting to rebuild provider context. Preserved queued work is blocked.',
    )
    expect(store.recoverySeed('after-recovery')).toEqual({
      prompt: 'Persisted recovery seed',
      state: 'pending',
    })

    await store.close()
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    expect(reloaded.get('after-recovery')).toMatchObject({
      title: 'Recovery project',
      executionMode: 'sdk',
      queuedCount: 1,
      recovery: {
        archivedMessageCount: 2,
        contextMessageCount: 1,
        contextTruncated: true,
        reason: 'provider-error',
      },
    })
    expect(reloaded.get('after-recovery')?.messages.at(-1)?.content)
      .toBe('Fresh provider response')
    expect(reloaded.get('after-recovery')).not.toHaveProperty('recoverySeed')
    expect(reloaded.recoverySeed('after-recovery')).toEqual({
      prompt: 'Persisted recovery seed',
      state: 'pending',
    })
    await reloaded.close()
  })

  it('turns an interrupted recovery seed dispatch into a durable blocking failure', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'before', cwd: '/project', title: 'Recovery project',
      updatedAt: '2026-09-09T00:00:00.000Z', status: 'error', messages: [],
      queuedPrompts: [{
        id: 'preserved', content: 'Run only after seed',
        createdAt: '2026-09-09T00:00:01.000Z',
      }],
      failedPrompt: {
        content: 'Uncertain predecessor work',
        failedAt: '2026-09-09T00:00:02.000Z',
        uncertain: true,
      },
    }, { backend: 'sdk', managedOpen: true })
    await store.claimFailedPrompt(
      'before',
      store.get('before')!.failedPrompt!,
      'Edited uncertain predecessor work',
      '2026-09-09T00:00:03.000Z',
    )
    await store.replaceWithRecoveredSession(
      'before', 'after', 'provider-error', 0, false, 'Seed first',
    )
    expect(store.get('after')?.failedPrompt).toBeUndefined()
    expect(store.recoveryResend('after')).toBeUndefined()
    await store.claimRecoverySeed('after', 'Seed first')
    await store.close()

    const restarted = new SessionStore(directory)
    await restarted.initialize()

    expect(restarted.recoverySeed('after')).toMatchObject({
      prompt: 'Seed first',
      state: 'failed',
      error: expect.stringContaining('delivery is uncertain'),
    })
    expect(restarted.get('after')).toMatchObject({
      status: 'error',
      activity: expect.stringContaining('was not retried'),
      queuedPrompts: [{ content: 'Run only after seed' }],
    })
    expect(restarted.get('after')).not.toHaveProperty('recoverySeed')
    await expect(
      restarted.reserveQueuedPrompt('after', () => true),
    ).rejects.toMatchObject({ statusCode: 409 })
    await restarted.close()
  })

  it('drops a stale queue error when conversation recovery preserves its FIFO', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'before', cwd: '/project', title: 'Recovery project',
      updatedAt: '2026-09-09T00:00:00.000Z', status: 'idle', messages: [],
      queuedPrompts: [{
        id: 'preserved', content: 'Run after recovery',
        createdAt: '2026-09-09T00:00:01.000Z',
      }],
      queueState: {
        state: 'error',
        promptId: 'preserved',
        message: 'The old runtime refused this prompt.',
        updatedAt: '2026-09-09T00:00:02.000Z',
      },
    }, { backend: 'sdk', managedOpen: true })

    const recovered = await store.replaceWithRecoveredSession(
      'before', 'after', 'provider-error', 0, false, 'Seed first',
    )

    expect(recovered.queuedPrompts).toMatchObject([{ id: 'preserved' }])
    expect(recovered.queueState).toBeUndefined()
    await store.close()
  })

  it('drops a queue error when clearing a conversation in place', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'before', cwd: '/project', title: 'Clear project',
      updatedAt: '2026-09-09T00:00:00.000Z', status: 'idle', messages: [],
      queuedPrompts: [{
        id: 'blocked', content: 'Discard with conversation',
        createdAt: '2026-09-09T00:00:01.000Z',
      }],
      queueState: {
        state: 'error',
        promptId: 'blocked',
        message: 'The prompt was not sent.',
        updatedAt: '2026-09-09T00:00:02.000Z',
      },
    }, { backend: 'terminal', managedOpen: true })

    const cleared = await store.clearConversation('before')

    expect(cleared.queuedPrompts).toEqual([])
    expect(cleared.queueState).toBeUndefined()
    await store.close()
  })

  it.each([
    'pending',
    'dispatching',
    'failed',
    'deferred',
    'restarted',
  ] as const)(
    'removes the seed-owned legacy barrier when clearing a %s recovery',
    async (state) => {
      const { directory, store } = await createStore()
      await store.create({
        id: 'before-clear',
        cwd: '/project',
        title: 'Recovery project',
        updatedAt: '2026-09-09T00:00:00.000Z',
        status: 'error',
        messages: [],
        queuedPrompts: [{
          id: 'preserved',
          content: 'Run only after the brief',
          createdAt: '2026-09-09T00:00:01.000Z',
        }],
      }, { backend: 'sdk', managedOpen: true })
      await store.replaceWithRecoveredSession(
        'before-clear',
        'recovering',
        'provider-error',
        0,
        false,
        'Seed-owned context brief',
      )
      if (state === 'dispatching' || state === 'restarted') {
        await store.claimRecoverySeed('recovering', 'Seed-owned context brief')
      } else if (state === 'failed') {
        await store.failRecoverySeed(
          'recovering',
          'Seed-owned context brief',
          'Synthetic definite failure',
        )
      }

      let active = store
      if (state === 'deferred' || state === 'restarted') {
        await store.close()
        active = new SessionStore(directory)
        await active.initialize()
      }
      await active.update('recovering', (session) => {
        session.queueState = {
          state: 'error',
          promptId: 'preserved',
          message: 'The old runtime refused this prompt.',
          updatedAt: '2026-09-09T00:00:02.000Z',
        }
      })

      const cleared = await active.replaceWithClearedSession(
        'recovering',
        'cleared',
      )
      expect(cleared.failedPrompt).toBeUndefined()
      expect(cleared.queueState).toBeUndefined()
      expect(active.failedPrompt('cleared')).toBeUndefined()
      expect(active.recoverySeed('cleared')).toBeUndefined()
      const persisted = JSON.parse(
        await readFile(path.join(directory, 'state.json'), 'utf8'),
      )
      expect(persisted.sessions.cleared.failedPrompt).toBeUndefined()
      expect(persisted.sessions.cleared.queueState).toBeUndefined()

      await active.enqueuePrompt('cleared', {
        id: 'next',
        content: 'Next normal queue item',
        createdAt: '2026-09-09T00:01:00.000Z',
      })
      await expect(active.reserveQueuedPrompt('cleared', () => true)).resolves
        .toMatchObject({
          reservation: {
            prompt: { content: 'Next normal queue item' },
          },
        })
      if (active !== store) await active.close()
    },
  )

  it('removes a seed-owned barrier when clearing in place', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'before-in-place',
      cwd: '/project',
      title: 'Recovery project',
      updatedAt: '2026-09-09T00:00:00.000Z',
      status: 'error',
      messages: [],
    }, { backend: 'sdk', managedOpen: true })
    await store.replaceWithRecoveredSession(
      'before-in-place',
      'recovering',
      'provider-error',
      0,
      false,
      'Seed-owned context brief',
    )

    const cleared = await store.clearConversation('recovering')

    expect(cleared.failedPrompt).toBeUndefined()
    expect(store.failedPrompt('recovering')).toBeUndefined()
    expect(store.recoverySeed('recovering')).toBeUndefined()
  })

  it.each(['in-place', 'replacement'] as const)(
    'preserves a same-content unrelated failed prompt during %s recovery clearing',
    async (operation) => {
      const { store } = await createStore()
      await store.create({
        id: 'before-unrelated',
        cwd: '/project',
        title: 'Recovery project',
        updatedAt: '2026-09-09T00:00:00.000Z',
        status: 'error',
        messages: [],
      }, { backend: 'sdk', managedOpen: true })
      await store.replaceWithRecoveredSession(
        'before-unrelated',
        'recovering',
        'provider-error',
        0,
        false,
        'Identical text',
      )
      await store.update('recovering', (session) => {
        session.failedPrompt = {
          content: 'Identical text',
          failedAt: '2026-09-09T00:05:00.000Z',
        }
      })

      const cleared = operation === 'in-place'
        ? await store.clearConversation('recovering')
        : await store.replaceWithClearedSession('recovering', 'cleared')

      expect(cleared.failedPrompt).toEqual({
        content: 'Identical text',
        failedAt: '2026-09-09T00:05:00.000Z',
      })
      expect(store.failedPrompt(cleared.id)).toEqual(cleared.failedPrompt)
      expect(store.recoverySeed(cleared.id)).toBeUndefined()
    },
  )

  it('retains recovery ownership when a clear replacement write fails', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'before-refused-clear',
      cwd: '/project',
      title: 'Recovery project',
      updatedAt: '2026-09-09T00:00:00.000Z',
      status: 'error',
      messages: [],
    }, { backend: 'sdk', managedOpen: true })
    await store.replaceWithRecoveredSession(
      'before-refused-clear',
      'recovering',
      'provider-error',
      0,
      false,
      'Seed-owned context brief',
    )
    const blockedWrite = path.join(directory, 'state.json.tmp')
    await mkdir(blockedWrite)

    await expect(
      store.replaceWithClearedSession('recovering', 'cleared'),
    ).rejects.toThrow(/EISDIR/)

    await rm(blockedWrite, { recursive: true })
    expect(store.get('cleared')).toBeUndefined()
    expect(store.recoverySeed('recovering')).toEqual({
      prompt: 'Seed-owned context brief',
      state: 'pending',
    })
    expect(store.failedPrompt('recovering')).toBeUndefined()

    const restarted = new SessionStore(directory)
    await restarted.initialize()
    expect(restarted.recoverySeed('recovering')).toEqual({
      prompt: 'Seed-owned context brief',
      state: 'pending',
    })
    expect(restarted.failedPrompt('recovering')).toBeUndefined()
    await restarted.close()
  })

  it('retains recovery ownership when a clear replacement loses its race', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'before-race',
      cwd: '/project',
      title: 'Recovery project',
      updatedAt: '2026-09-09T00:00:00.000Z',
      status: 'error',
      messages: [],
    }, { backend: 'sdk', managedOpen: true })
    await store.replaceWithRecoveredSession(
      'before-race',
      'recovering',
      'provider-error',
      0,
      false,
      'Seed-owned context brief',
    )
    const observation = store.observeTranscript('recovering')
    await store.updateStatus('recovering', 'running', 'New work')

    await expect(
      store.replaceWithClearedSession('recovering', 'cleared', observation),
    ).rejects.toMatchObject({ statusCode: 409 })

    expect(store.get('cleared')).toBeUndefined()
    expect(store.recoverySeed('recovering')).toEqual({
      prompt: 'Seed-owned context brief',
      state: 'pending',
    })
    expect(store.failedPrompt('recovering')).toBeUndefined()
  })

  it('atomically marks persisted SDK interactions stale without changing terminal prompts', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'sdk-waiting',
      cwd: '/project',
      title: 'SDK waiting',
      updatedAt: '2026-09-09T00:00:00.000Z',
      status: 'waiting',
      messages: [],
      pendingPermission: {
        requestId: 'sdk-request',
        title: 'Allow tool',
        options: [{ optionId: 'allow-once', name: 'Allow once', kind: 'allow_once' }],
      },
    }, { backend: 'sdk', managedOpen: true })
    await store.create({
      id: 'terminal-waiting',
      cwd: '/project',
      title: 'Terminal waiting',
      updatedAt: '2026-09-09T00:00:00.000Z',
      status: 'waiting',
      messages: [],
      pendingPermission: {
        requestId: 'terminal-permission:1',
        title: 'Trust folder',
        options: [{ optionId: 'allow-once', name: 'Allow once', kind: 'allow_once' }],
      },
    }, { backend: 'terminal', managedOpen: true })
    await store.create({
      id: 'claude-waiting',
      provider: 'claude',
      cwd: '/project',
      title: 'Claude waiting',
      updatedAt: '2026-09-09T00:00:00.000Z',
      status: 'waiting',
      messages: [],
      pendingPermission: {
        requestId: 'claude-request',
        title: 'Allow Claude tool',
        options: [{ optionId: 'allow-once', name: 'Allow once', kind: 'allow_once' }],
      },
      pendingUserInput: {
        requestId: 'claude-input',
        question: 'Choose an option',
        choices: ['A'],
        allowFreeform: false,
      },
    }, { backend: 'sdk', managedOpen: true })
    await store.close()

    const restarted = new SessionStore(directory)
    await restarted.initialize()

    expect(restarted.get('sdk-waiting')).toMatchObject({
      status: 'error',
      pendingPermission: { requestId: 'sdk-request', stale: true },
    })
    expect(restarted.get('terminal-waiting')).toMatchObject({
      status: 'error',
      pendingPermission: { requestId: 'terminal-permission:1' },
      interruption: { previousStatus: 'waiting' },
    })
    expect(restarted.get('claude-waiting')).toMatchObject({
      status: 'error',
      pendingPermission: { requestId: 'claude-request', stale: true },
      pendingUserInput: { requestId: 'claude-input', stale: true },
    })
    const persisted = JSON.parse(
      await readFile(path.join(directory, 'state.json'), 'utf8'),
    )
    expect(persisted.sessions['sdk-waiting']).toMatchObject({
      status: 'error',
      pendingPermission: { stale: true },
    })
    await restarted.close()
  })

  it('keeps the usable store when later legacy-lineage validation rejects a document', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'kept', title: 'Keep this session', cwd: '/project',
      updatedAt: '2026-09-05T00:00:00.000Z', status: 'idle', messages: [],
    })
    const before = store.list()
    const invalid = JSON.stringify({
      version: 1,
      retiredSessionIds: ['kept'],
      sessions: {
        first: { id: 'first', messages: [], replacedSessionIds: ['older'] },
        malformed: { id: 'malformed', messages: [], replacedSessionIds: [null] },
      },
    })
    const filename = path.join(directory, 'state.json')
    await writeFile(filename, invalid)
    await expect(store.initialize()).rejects.toThrow('Invalid session retirement metadata')
    expect(store.list()).toEqual(before)
    expect(store.isRetiredSession('kept')).toBe(false)
    expect(store.isRetiredSession('older')).toBe(false)
    expect(await readFile(filename, 'utf8')).toBe(invalid)
    await store.renameSession('kept', 'Still usable')
    expect(JSON.parse(await readFile(filename, 'utf8')).sessions.kept.title).toBe('Still usable')
  })

  it.each([
    { name: 'null document', value: null },
    { name: 'array document', value: [] },
    { name: 'null sessions', value: { version: 1, sessions: null } },
    { name: 'array sessions', value: { version: 1, sessions: [] } },
    { name: 'populated array sessions', value: { version: 1, sessions: [{}] } },
  ])('rejects a $name without installing or rewriting it', async ({ value }) => {
    const { directory, store } = await createStore()
    const filename = path.join(directory, 'state.json')
    const contents = JSON.stringify(value)
    await writeFile(filename, contents)
    await expect(store.initialize()).rejects.toThrow('Unsupported Agentic Remote state format')
    expect(store.list()).toEqual([])
    expect(await readFile(filename, 'utf8')).toBe(contents)
  })

  it('keeps a suspended session in the list when nothing is running for it', async () => {
    const { store } = await createStore()
    await store.create(
      {
        id: 'resting-session',
        cwd: '/tmp/resting-project',
        title: 'Resting project',
        updatedAt: '2026-07-22T00:00:01.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )
    await store.setSuspended('resting-session', true)

    // Discovery finds no process for it, which is the point. Reading that as
    // closed would hide the session, and the only way to resume it is the
    // button on the session itself.
    await store.syncOpen([])

    expect(store.get('resting-session')).toMatchObject({
      isOpen: true,
      suspended: true,
    })
  })

  it('leaves a suspended session alone when recovering terminals', async () => {
    const { directory, store } = await createStore()
    await store.create(
      {
        id: 'terminal-session',
        cwd: '/tmp/terminal-project',
        title: 'Terminal project',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )
    await store.create(
      {
        id: 'resting-session',
        cwd: '/tmp/resting-project',
        title: 'Resting project',
        updatedAt: '2026-07-22T00:00:01.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )
    await store.setSuspended('resting-session', true)

    const restored = new SessionStore(directory)
    await restored.initialize()

    // Starting a suspended session back up at boot is the opposite of what
    // suspending it asked for.
    expect(restored.terminalRecoverySessions()).toEqual([
      expect.objectContaining({ id: 'terminal-session' }),
    ])
    expect(restored.get('resting-session')).toMatchObject({ suspended: true })
  })

  it('persists sessions and protects the state file', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    const statePath = path.join(directory, 'state.json')
    const metadata = await stat(statePath)
    const contents = JSON.parse(await readFile(statePath, 'utf8')) as {
      sessions: Record<string, unknown>
    }

    expect(metadata.mode & 0o777).toBe(0o600)
    expect(contents.sessions['session-1']).toBeDefined()
  })

  it('persists terminal ownership for boot recovery', async () => {
    const { directory, store } = await createStore()
    await store.create(
      {
        id: 'terminal-session',
        cwd: '/tmp/terminal-project',
        title: 'Terminal project',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )
    await store.create(
      {
        id: 'sdk-session',
        cwd: '/tmp/sdk-project',
        title: 'SDK project',
        updatedAt: '2026-07-22T00:00:01.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'sdk' },
    )

    const restored = new SessionStore(directory)
    await restored.initialize()

    expect(restored.terminalRecoverySessions()).toEqual([
      expect.objectContaining({
        id: 'terminal-session',
        executionMode: 'tmux',
        isOpen: true,
      }),
    ])
    expect(restored.get('sdk-session')).toMatchObject({
      executionMode: 'sdk',
    })
  })

  it('shows discovered terminal sessions without granting boot recovery', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'history-session',
      cwd: '/tmp/history-project',
      title: 'History session',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      isOpen: false,
      messages: [],
    })
    await store.syncDiscovered([{
      id: 'external-run',
      cwd: '/tmp/external-project',
      title: 'External run',
      updatedAt: '2026-07-22T00:00:01.000Z',
    }])

    await store.syncBackends(['history-session', 'external-run'], [])

    for (const id of ['history-session', 'external-run']) {
      expect(store.get(id)).toMatchObject({ isOpen: true, executionMode: 'tmux' })
      expect(store.isManagedOpen(id)).toBe(false)
      expect(store.shouldRecoverTerminalSession(id)).toBe(false)
    }
    expect(store.terminalRecoverySessions()).toEqual([])

    await store.syncOpen([])
    const restored = new SessionStore(directory)
    await restored.initialize()

    expect(restored.terminalRecoverySessions()).toEqual([])
    for (const id of ['history-session', 'external-run']) {
      expect(restored.get(id)).toMatchObject({ isOpen: false, executionMode: 'tmux' })
    }
  })

  it('keeps boot recovery for app-managed terminals rediscovered after a restart', async () => {
    const { directory, store } = await createStore()
    await store.create(
      {
        id: 'managed-terminal',
        cwd: '/tmp/managed-project',
        title: 'Managed terminal',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )

    const restarted = new SessionStore(directory)
    await restarted.initialize()
    await restarted.syncBackends(['managed-terminal'], [])
    expect(restarted.isManagedOpen('managed-terminal')).toBe(true)
    const revision = restarted.get('managed-terminal')!.revision
    await restarted.claimTerminalRecovery('managed-terminal')
    expect(restarted.get('managed-terminal')!.revision).toBe(revision)
    await restarted.syncOpen([])

    const rebooted = new SessionStore(directory)
    await rebooted.initialize()
    expect(rebooted.terminalRecoverySessions()).toEqual([
      expect.objectContaining({ id: 'managed-terminal', isOpen: true }),
    ])
  })

  it('keeps an unmanaged queued terminal interrupted while its owner is discovered', async () => {
    const { directory, store } = await createStore()
    await store.create(
      {
        id: 'closed-queued-terminal',
        cwd: '/tmp/closed-queued-project',
        title: 'Closed queued terminal',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )
    await store.enqueuePrompt('closed-queued-terminal', {
      id: 'queued-prompt',
      content: 'Wait for explicit Reopen',
      createdAt: '2026-07-22T00:00:01.000Z',
    })
    await store.setOpen('closed-queued-terminal', false, true)

    await store.syncBackends(['closed-queued-terminal'], [])

    expect(store.get('closed-queued-terminal')).toMatchObject({
      isOpen: true,
      interruption: expect.any(Object),
    })
    expect(store.isManagedOpen('closed-queued-terminal')).toBe(false)
    const revision = store.get('closed-queued-terminal')!.revision
    await store.syncOpen(['closed-queued-terminal'])
    await store.syncBackends(['closed-queued-terminal'], [])
    expect(store.get('closed-queued-terminal')!.revision).toBe(revision)

    const restarted = new SessionStore(directory)
    await restarted.initialize()
    await restarted.syncOpen(['closed-queued-terminal'])
    await restarted.syncBackends(['closed-queued-terminal'], [])

    expect(restarted.get('closed-queued-terminal')).toMatchObject({
      isOpen: true,
      interruption: expect.any(Object),
      queuedPrompts: [expect.objectContaining({ id: 'queued-prompt' })],
    })
    expect(restarted.isManagedOpen('closed-queued-terminal')).toBe(false)
  })

  it('grants boot recovery once the app sends or queues work for a discovered terminal', async () => {
    const { directory, store } = await createStore()
    const ids = ['sent', 'queued', 'answered', 'claimed', 'observed']
    await store.syncDiscovered(ids.map((id) => ({
      id,
      cwd: `/tmp/${id}`,
      title: id,
      updatedAt: '2026-07-22T00:00:00.000Z',
    })))
    await store.syncBackends(ids, [])
    const queued = {
      content: 'Queued from the app',
      createdAt: '2026-07-22T00:00:01.000Z',
    }

    await store.markTerminalPromptDispatched('sent', '2026-07-22T00:00:01.000Z', 'Sent to terminal')
    await store.enqueuePrompt('queued', { ...queued, id: 'queued-prompt' })
    await store.enqueueAnsweringPrompt('answered', { ...queued, id: 'answer-prompt' }, undefined)
    await store.claimTerminalRecovery('claimed')
    await store.update('observed', (session) => {
      session.activity = 'Observed in the terminal'
    })

    for (const id of ['sent', 'queued', 'answered', 'claimed']) {
      expect(store.isManagedOpen(id)).toBe(true)
    }
    expect(store.isManagedOpen('observed')).toBe(false)

    await store.syncOpen([])
    const restored = new SessionStore(directory)
    await restored.initialize()
    expect(restored.terminalRecoverySessions().map(({ id }) => id).sort()).toEqual(
      ['answered', 'claimed', 'queued', 'sent'],
    )
  })

  it('grants boot recovery with the receipt of a recovery resend to a discovered terminal', async () => {
    const { store } = await createStore()
    await store.syncDiscovered([{
      id: 'resent',
      cwd: '/tmp/resent',
      title: 'Resent',
      updatedAt: '2026-07-22T00:00:00.000Z',
    }])
    await store.syncBackends(['resent'], [])
    const failed = (await store.setFailedPrompt('resent', 'missing', 'Deploy it')).failedPrompt!
    await store.claimFailedPrompt('resent', failed, 'Deploy it', 'resend:receipt')
    expect(store.isManagedOpen('resent')).toBe(false)

    await store.acceptRecoveryResend('resent', 'resend:receipt')

    expect(store.recoveryResend('resent')?.accepted).toBe(true)
    expect(store.shouldRecoverTerminalSession('resent')).toBe(true)
  })

  it('grants boot recovery when the app suspends and resumes a discovered terminal', async () => {
    const { directory, store } = await createStore()
    await store.syncDiscovered([{
      id: 'resting',
      cwd: '/tmp/resting',
      title: 'Resting',
      updatedAt: '2026-07-22T00:00:00.000Z',
    }])
    await store.syncBackends(['resting'], [])

    await store.setSuspended('resting', true)
    expect(store.isManagedOpen('resting')).toBe(true)
    expect(store.shouldRecoverTerminalSession('resting')).toBe(false)
    await store.setSuspended('resting', false)
    await store.syncOpen([])

    const restored = new SessionStore(directory)
    await restored.initialize()
    expect(restored.terminalRecoverySessions()).toEqual([
      expect.objectContaining({ id: 'resting', isOpen: true }),
    ])
  })

  it('does not grant boot recovery for work queued on a closed or SDK session', async () => {
    const { store } = await createStore()
    await store.syncDiscovered(['closed-terminal', 'history-sdk'].map((id) => ({
      id,
      cwd: `/tmp/${id}`,
      title: id,
      updatedAt: '2026-07-22T00:00:00.000Z',
    })))
    await store.syncBackends(['closed-terminal'], ['history-sdk'])
    await store.syncOpen([])

    for (const id of ['closed-terminal', 'history-sdk']) {
      await store.enqueuePrompt(id, {
        id: `${id}-prompt`,
        content: 'Queued while closed',
        createdAt: '2026-07-22T00:00:01.000Z',
      })
      await store.claimTerminalRecovery(id)
      expect(store.isManagedOpen(id)).toBe(false)
    }
  })

  it('streams and finishes an assistant message', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    await store.addMessage('session-1', {
      id: 'message-1',
      role: 'assistant',
      content: '',
      createdAt: '2026-07-22T00:00:01.000Z',
      streaming: true,
    })

    store.streamMessage('session-1', 'message-1', 'Hello')
    store.streamMessage('session-1', 'message-1', ' world')
    await store.finishMessage('session-1', 'message-1')

    expect(store.get('session-1')?.messages[0]).toMatchObject({
      content: 'Hello world',
      streaming: false,
    })
  })

  it('keeps completed tool activities in conversation history', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'running',
      messages: [],
    })
    await store.startToolActivity(
      'session-1',
      'first',
      'Bash\n$ pnpm test',
      '2026-07-22T00:00:01.000Z',
    )
    await store.startToolActivity(
      'session-1',
      'second',
      'View\n/tmp/source.ts',
      '2026-07-22T00:00:02.000Z',
    )
    await store.finishToolActivity(
      'session-1',
      'second',
      false,
      '2026-07-22T00:00:03.000Z',
      'Permission denied',
    )
    await store.addMessage('session-1', {
      id: 'assistant',
      role: 'assistant',
      content: '',
      createdAt: '2026-07-22T00:00:03.000Z',
      streaming: true,
    })
    store.setMessageContent('session-1', 'assistant', 'Done')

    expect(store.get('session-1')?.messages).toEqual([
      expect.objectContaining({
        id: 'tool:first',
        activityStatus: 'completed',
      }),
      expect.objectContaining({
        id: 'tool:second',
        activityStatus: 'failed',
        activityResult: 'Permission denied',
        activityDurationMs: 1_000,
      }),
      expect.objectContaining({ id: 'assistant', content: 'Done' }),
    ])
  })

  it('moves a live task completion after its tool activity', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'running',
      messages: [],
    })
    await store.addMessage('session-1', {
      id: 'assistant',
      role: 'assistant',
      content: '',
      createdAt: '2026-07-22T00:00:01.000Z',
      streaming: true,
    })
    await store.startToolActivity(
      'session-1',
      'task',
      'Task Complete',
      '2026-07-22T00:00:02.000Z',
    )
    await store.finishTaskCompletion(
      'session-1',
      'task',
      '**Done.**',
      '2026-07-22T00:00:03.000Z',
      'assistant',
    )

    expect(store.get('session-1')?.messages).toEqual([
      {
        id: 'assistant',
        role: 'assistant',
        content: '**Done.**',
        createdAt: '2026-07-22T00:00:03.000Z',
        streaming: false,
        taskCompletion: {
          source: 'root-task-complete',
          toolCallId: 'task',
          completedAt: '2026-07-22T00:00:03.000Z',
        },
      },
    ])
  })

  it('keeps pending terminal requests waiting during transcript sync', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'running',
      messages: [],
    })

    await store.update('session-1', (session) => {
      session.pendingPermission = {
        requestId: 'terminal-permission:request',
        title: 'Run command',
        options: [],
      }
    })

    await store.replaceTranscript('session-1', [], 'running', 'Bash')

    expect(store.get('session-1')).toMatchObject({
      status: 'waiting',
      activity: 'Run command',
      pendingPermission: { requestId: 'terminal-permission:request' },
    })
  })

  it('preserves a terminal dispatch that starts during transcript replacement', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })
    const before = store.get('session-1')
    await store.markTerminalPromptDispatched(
      'session-1',
      '2026-07-22T00:00:02.000Z',
      'Sent to terminal',
    )

    const updated = await store.replaceTranscript(
      'session-1',
      [],
      'idle',
      undefined,
      undefined,
      undefined,
      false,
      undefined,
      undefined,
    )

    expect(updated).toMatchObject({
      status: 'running',
      activity: 'Sent to terminal',
    })
    expect(updated!.revision).toBeGreaterThan(before?.revision || 0)
  })

  it('does not clear a newer terminal dispatch with an older completion', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })
    const older = '2026-07-22T00:00:01.000Z'
    const newer = '2026-07-22T00:00:02.000Z'
    await store.markTerminalPromptDispatched('session-1', older)
    await store.markTerminalPromptDispatched('session-1', newer)

    const updated = await store.clearQueueDispatch('session-1', older)

    expect(store.queueDispatchAt('session-1')).toBe(newer)
    expect(updated.status).toBe('running')
  })

  it('stores private session uploads and removes them on clear', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    const upload = await store.saveUpload(
      'session-1',
      '../../statement.pdf',
      Buffer.from('financial data'),
    )

    expect(upload.name).toBe('statement.pdf')
    expect(await readFile(upload.path, 'utf8')).toBe('financial data')
    expect((await stat(upload.path)).mode & 0o777).toBe(0o600)

    await store.replaceWithClearedSession('session-1', 'session-2')
    await expect(stat(upload.path)).rejects.toMatchObject({ code: 'ENOENT' })

    await expect(
      store.saveUpload('__proto__', 'orphan.pdf', Buffer.from('data')),
    ).rejects.toThrow('Session __proto__ does not exist')

    const second = await store.saveUpload(
      'session-2',
      'second.pdf',
      Buffer.from('data'),
    )
    await store.remove('session-2')
    await expect(stat(second.path)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it.each(['clear', 'delete'] as const)(
    'removes inherited and current uploads after repeated recovery then %s',
    async (operation) => {
      const { store } = await createStore()
      await store.create({
        id: 'session-1', cwd: '/project', title: 'Project',
        updatedAt: '2026-09-09T00:00:00.000Z', status: 'error', messages: [],
      })
      const first = await store.saveUpload('session-1', 'first.txt', Buffer.from('first'))
      await store.replaceWithRecoveredSession(
        'session-1', 'session-2', 'provider-error', 0, false, 'Seed one',
      )
      const second = await store.saveUpload('session-2', 'second.txt', Buffer.from('second'))
      await store.replaceWithRecoveredSession(
        'session-2', 'session-3', 'provider-error', 0, false, 'Seed two',
      )
      const third = await store.saveUpload('session-3', 'third.txt', Buffer.from('third'))
      expect(store.get('session-3')).not.toHaveProperty('uploadOwnerIds')

      if (operation === 'clear') {
        await store.replaceWithClearedSession('session-3', 'session-4')
      } else {
        await store.remove('session-3')
      }

      await Promise.all([first, second, third].map((upload) =>
        expect(stat(upload.path)).rejects.toMatchObject({ code: 'ENOENT' })))
    },
  )

  it('keeps the whole ancestry of a session cleared many times', async () => {
    // A browser that was away long enough to miss dozens of clears is exactly
    // the one still holding the oldest id, and what it is holding has no
    // expiry of its own. Forgetting the far end of the lineage is what leaves
    // that draft with no way back to the session it belongs to.
    const { store } = await createStore()
    await store.create({
      id: 'session-0',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    for (let index = 0; index < 40; index += 1) {
      await store.replaceWithClearedSession(
        `session-${index}`,
        `session-${index + 1}`,
      )
    }

    const latest = store.get('session-40')
    expect(latest?.replacedSessionIds).toHaveLength(40)
    // The very first id is still reachable from the newest session.
    expect(latest?.replacedSessionIds?.[0]).toBe('session-0')
  })

  it('resets interrupted transient state when reloaded', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-1',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'running',
      activity: 'Thinking',
      messages: [
        {
          id: 'message-1',
          role: 'assistant',
          content: 'Partial',
          createdAt: '2026-07-22T00:00:01.000Z',
          streaming: true,
        },
      ],
    })
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()

    expect(reloaded.get('session-1')).toMatchObject({
      status: 'idle',
      activity: undefined,
      messages: [{ streaming: false }],
    })
  })

  it('keeps managed SDK and missing terminal records open independently of their process', async () => {
    const { directory, store } = await createStore()
    await store.create(
      {
        id: 'managed-sdk-session',
        cwd: '/tmp/project',
        title: 'Managed SDK project',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'sdk' },
    )
    await store.create(
      {
        id: 'managed-terminal-session',
        cwd: '/tmp/project',
        title: 'Managed terminal project',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      },
      { managedOpen: true, backend: 'terminal' },
    )

    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    await reloaded.syncOpen([])

    expect(reloaded.get('managed-sdk-session')).toMatchObject({
      isOpen: true,
    })
    expect(reloaded.get('managed-terminal-session')).toMatchObject({
      isOpen: true,
      interruption: expect.any(Object),
    })
    expect(reloaded.get('managed-sdk-session')).not.toHaveProperty('managedOpen')
  })

  it('discovers sessions without replacing locally stored history', async () => {
    const { store } = await createStore()
    await store.create({
      id: 'existing',
      cwd: '/tmp/old-project',
      title: 'Old title',
      updatedAt: '2026-07-21T00:00:00.000Z',
      status: 'idle',
      messages: [
        {
          id: 'message-1',
          role: 'user',
          content: 'Keep me',
          createdAt: '2026-07-21T00:00:00.000Z',
        },
      ],
    })
    await store.create({
      id: 'stale',
      cwd: '/tmp/deleted-project',
      title: 'Deleted elsewhere',
      updatedAt: '2026-07-21T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    await store.syncDiscovered([
      {
        id: 'existing',
        cwd: '/tmp/project',
        title: 'Updated title',
        updatedAt: '2026-07-22T00:00:00.000Z',
      },
      {
        id: 'discovered',
        cwd: '/tmp/another-project',
        title: 'Discovered session',
        updatedAt: '2026-07-22T01:00:00.000Z',
      },
    ])

    expect(store.get('existing')).toMatchObject({
      cwd: '/tmp/project',
      title: 'Updated title',
      messages: [{ content: 'Keep me' }],
    })
    expect(store.get('discovered')).toMatchObject({
      title: 'Discovered session',
      messages: [],
    })
    expect(store.get('stale')).toMatchObject({
      title: 'Deleted elsewhere',
      messages: [],
    })
  })

  it('does not revise or persist unchanged discovery metadata at scale', async () => {
    const { directory, store } = await createStore()
    const discovered = Array.from({ length: 128 }, (_unused, index) => ({
      id: `session-${index}`,
      cwd: `/tmp/project-${index}`,
      title: `Project ${index}`,
      updatedAt: '2026-07-22T00:00:00.000Z',
    }))
    await Promise.all(discovered.map((session) =>
      store.create({
        ...session,
        status: 'idle',
        isOpen: false,
        messages: [],
      }, { backend: 'sdk' }),
    ))
    const statePath = path.join(directory, 'state.json')
    const before = await readFile(statePath, 'utf8')
    const revisions = new Map(
      store.list().map((session) => [session.id, session.revision]),
    )

    await store.syncDiscovered(discovered)
    await store.syncBackends([], discovered.map((session) => session.id))
    await store.syncOpen([])

    expect(await readFile(statePath, 'utf8')).toBe(before)
    expect(
      store.list().map((session) => [session.id, session.revision]),
    ).toEqual([...revisions])
  })

  it('revises only sessions whose discovered ownership metadata changes', async () => {
    const { store } = await createStore()
    for (const id of ['unchanged', 'changed']) {
      await store.create({
        id,
        cwd: '/tmp/project',
        title: 'Project',
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: false,
        messages: [],
      }, { backend: 'sdk' })
    }
    const unchangedRevision = store.get('unchanged')!.revision!
    const changedRevision = store.get('changed')!.revision!

    await store.syncDiscovered([
      {
        id: 'unchanged',
        cwd: '/tmp/project',
        title: 'Project',
        updatedAt: '2026-07-22T00:00:00.000Z',
      },
      {
        id: 'changed',
        cwd: '/tmp/next-project',
        title: 'Next project',
        updatedAt: '2026-07-23T00:00:00.000Z',
      },
    ])

    expect(store.get('unchanged')?.revision).toBe(unchangedRevision)
    expect(store.get('changed')).toMatchObject({
      cwd: '/tmp/next-project',
      title: 'Next project',
      updatedAt: '2026-07-23T00:00:00.000Z',
      revision: changedRevision + 1,
    })

    await store.syncBackends(['changed'], [])
    const terminalRevision = store.get('changed')!.revision!
    expect(store.get('changed')).toMatchObject({
      isOpen: true,
    })
    expect(store.backend('changed')).toBe('terminal')
    expect(store.isManagedOpen('changed')).toBe(false)
    expect(store.get('unchanged')?.revision).toBe(unchangedRevision)

    await store.syncOpen(['changed'])
    expect(store.get('changed')?.revision).toBe(terminalRevision)
    await store.syncOpen([])
    expect(store.get('changed')).toMatchObject({
      isOpen: false,
      revision: terminalRevision + 1,
    })
  })

  it('preserves a custom title across discovery and reloads', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'custom-title',
      cwd: '/tmp/project',
      title: 'Generated title',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })
    await store.renameSession('custom-title', 'My project')
    await store.syncDiscovered([
      {
        id: 'custom-title',
        cwd: '/tmp/project',
        title: 'New generated title',
        updatedAt: '2026-07-23T00:00:00.000Z',
      },
    ])
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()

    expect(reloaded.get('custom-title')).toMatchObject({
      title: 'My project',
    })
    expect(reloaded.get('custom-title')).not.toHaveProperty('customTitle')
  })

  it.each(['interrupted', 'archived'] as const)('refuses queue rewrites and context-brief claims on an %s record', async (state) => {
    const { store } = await createStore()
    await store.create({
      id: 'retained', cwd: '/tmp/project', title: 'Retained', updatedAt: '2026-07-25T01:00:00.000Z',
      status: 'idle', messages: [],
    })
    for (const id of ['first', 'second']) {
      await store.enqueuePrompt('retained', { id, content: id, createdAt: '2026-07-25T01:00:01.000Z' })
    }
    await store.update('retained', (session) => {
      Object.assign(session, { recoverySeed: { prompt: 'Brief', state: 'pending' } })
      if (state === 'archived') Object.assign(session, { isOpen: false, archivedAt: '2026-07-26T00:00:00.000Z' })
    })
    if (state === 'interrupted') await store.markInterrupted('retained')
    const refused = { statusCode: 409, message: expect.stringMatching(/Reopen/) }
    await expect(store.removeQueuedPrompt('retained', 'first')).rejects.toMatchObject(refused)
    await expect(store.updateQueuedPrompt('retained', 'first', 'Rewritten')).rejects.toMatchObject(refused)
    await expect(store.reorderQueuedPrompts('retained', ['second', 'first'])).rejects.toMatchObject(refused)
    await expect(store.claimRecoverySeed('retained', 'Brief')).rejects.toMatchObject(refused)
    expect(store.get('retained')?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['first', 'second'])
    expect(store.recoverySeed('retained')).toMatchObject({ state: 'pending' })
  })

  it.each(['interrupted', 'archived'] as const)('refuses every queue-head claim on an %s record and keeps the FIFO', async (state) => {
    const { store } = await createStore()
    await store.create({
      id: 'retained', cwd: '/tmp/project', title: 'Retained', updatedAt: '2026-07-25T01:00:00.000Z',
      status: 'idle', messages: [],
    })
    const queued = ['first', 'second'].map((id) => ({ id, content: id, createdAt: '2026-07-25T01:00:01.000Z' }))
    for (const prompt of queued) await store.enqueuePrompt('retained', prompt)
    if (state === 'interrupted') await store.markInterrupted('retained')
    else await store.update('retained', (session) => { session.archivedAt = '2026-07-26T00:00:00.000Z' })
    const refused = { statusCode: 409, message: expect.stringMatching(/Reopen/) }
    await expect(store.claimTerminalQueuedPrompt('retained', queued[0], () => true)).rejects.toMatchObject(refused)
    await expect(store.reserveQueuedPrompt('retained', () => true)).rejects.toMatchObject(refused)
    await expect(store.shiftQueuedPrompt('retained')).rejects.toMatchObject(refused)
    expect(store.get('retained')?.queuedPrompts).toEqual(queued)
    expect(store.terminalQueueDispatch('retained')).toBeUndefined()
    expect(store['state'].sessions.retained?.queuedPromptReservation).toBeUndefined()
  })

  it('persists queued prompts and removes a selected entry', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'queued-session',
      cwd: '/tmp/project',
      title: 'Queued project',
      updatedAt: '2026-07-25T01:00:00.000Z',
      status: 'running',
      messages: [],
    })
    await store.enqueuePrompt('queued-session', {
      id: 'first',
      content: 'First prompt',
      createdAt: '2026-07-25T01:00:01.000Z',
    })
    await store.enqueuePrompt('queued-session', {
      id: 'second',
      content: 'Second prompt',
      createdAt: '2026-07-25T01:00:02.000Z',
    })

    const removed = await store.removeQueuedPrompt('queued-session', 'first')
    await store.markTerminalPromptDispatched(
      'queued-session',
      '2026-07-25T01:00:03.000Z',
    )
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()

    expect(removed.prompt?.content).toBe('First prompt')
    expect(reloaded.get('queued-session')).toMatchObject({
      status: 'running',
      queuedCount: 1,
      queuedPrompts: [{ id: 'second', content: 'Second prompt' }],
    })
    expect(reloaded.queueDispatchAt('queued-session')).toBe(
      '2026-07-25T01:00:03.000Z',
    )

    await reloaded.clearUntrackedTerminalDispatch(
      'queued-session',
      'older-dispatch',
    )
    expect(reloaded.get('queued-session')?.status).toBe('running')
    await reloaded.clearUntrackedTerminalDispatch(
      'queued-session',
      '2026-07-25T01:00:03.000Z',
    )
    expect(reloaded.get('queued-session')?.status).toBe('idle')
    expect(reloaded.queueDispatchAt('queued-session')).toBeUndefined()
  })

  it('keeps only currently active sessions open', async () => {
    const { store } = await createStore()
    for (const id of ['running', 'stopped']) {
      await store.create({
        id,
        cwd: `/tmp/${id}`,
        title: id,
        updatedAt: '2026-07-22T00:00:00.000Z',
        status: 'idle',
        isOpen: true,
        messages: [],
      })
    }

    await store.syncOpen(['running'])

    expect(store.get('running')?.isOpen).toBe(true)
    expect(store.get('stopped')?.isOpen).toBe(false)
  })

  it('leaves the queue alone when recording a failed prompt cannot be written', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-failed',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })
    await store.enqueuePrompt('session-failed', {
      id: 'prompt-1',
      content: 'Deploy it',
      createdAt: '2026-07-22T00:00:01.000Z',
    })
    const queued = store.get('session-failed')?.queuedPrompts?.[0]
    expect(queued).toBeDefined()

    const blockedWrite = path.join(directory, 'state.json.tmp')
    await mkdir(blockedWrite)

    // The caller reports the send as unrecovered when this rejects. Leaving
    // the queue entry removed and the prompt recorded as needing recovery
    // handed the reader a draft while the queued copy was still on disk, and
    // a restart delivered it beside the draft.
    await expect(
      store.setFailedPrompt('session-failed', queued!.id, 'Deploy it'),
    ).rejects.toThrow(/EISDIR/)

    await rm(blockedWrite, { recursive: true })
    const after = store.get('session-failed')
    expect(after?.failedPrompt).toBeUndefined()
    expect(after?.queuedPrompts?.map((prompt) => prompt.id)).toEqual([
      queued!.id,
    ])
    expect(after?.queuedCount).toBe(1)
  })

  it('keeps the failed prompt when clearing it cannot be written', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-clear',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })
    await store.setFailedPrompt('session-clear', 'missing', 'Deploy it')

    const blockedWrite = path.join(directory, 'state.json.tmp')
    await mkdir(blockedWrite)

    // A submission that had already succeeded was reported as failed and
    // handed back as a draft, while the marker stayed on disk to be found
    // again after a restart and delivered a second time.
    await expect(store.clearFailedPrompt('session-clear')).rejects.toThrow(
      /EISDIR/,
    )

    await rm(blockedWrite, { recursive: true })
    expect(store.get('session-clear')?.failedPrompt?.content).toBe('Deploy it')
  })

  it('persists every mutation in a burst that shares one write', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-burst',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    await Promise.all(
      Array.from({ length: 25 }, (_unused, index) =>
        store.addMessage('session-burst', {
          id: `message-${index}`,
          role: 'assistant',
          content: `chunk ${index}`,
          createdAt: '2026-07-22T00:00:01.000Z',
        }),
      ),
    )

    const persisted = JSON.parse(
      await readFile(path.join(directory, 'state.json'), 'utf8'),
    ) as {
      sessions: Record<string, { messages: { id: string }[] }>
    }
    expect(persisted.sessions['session-burst'].messages).toHaveLength(25)
  })

  it('refuses a write that arrives after it has been closed', async () => {
    const { directory, store } = await createStore()
    await store.create({
      id: 'session-late',
      cwd: '/tmp/project',
      title: 'Project',
      updatedAt: '2026-07-22T00:00:00.000Z',
      status: 'idle',
      messages: [],
    })

    await store.close()
    // What a caller does once stopping has resolved: the directory is its own
    // again. A prompt still finishing writes from its own completion path, and
    // that write is not held by whoever stopped the service.
    await rm(directory, { recursive: true, force: true })

    await expect(
      store.renameSession('session-late', 'Renamed after closing'),
    ).rejects.toThrow('Session store is closed')
    await store.flush()
    expect(store.get('session-late')?.title).toBe('Project')
    expect(existsSync(directory)).toBe(false)
  })
})
