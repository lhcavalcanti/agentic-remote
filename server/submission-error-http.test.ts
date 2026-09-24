import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildApp } from './app.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('submission error HTTP contract', () => {
  it.each([false, true])('serializes explicit delivery uncertainty=%s', async (uncertainDelivery) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'submission-http-'))
    directories.push(directory)
    const runtime = await buildApp({
      dataDirectory: directory,
      logger: false,
      role: 'node',
    })
    runtime.app.get('/synthetic-submission-error', async () => {
      throw Object.assign(new Error('Synthetic refusal'), {
        statusCode: 409,
        uncertainDelivery,
      })
    })

    try {
      const response = await runtime.app.inject('/synthetic-submission-error')
      expect(response.statusCode).toBe(409)
      expect(response.json()).toEqual({
        error: 'Synthetic refusal',
        uncertainDelivery,
      })
    } finally {
      await runtime.app.close()
    }
  })

  it.each([409, 500])('does not add submission metadata to an ordinary HTTP %i error', async (statusCode) => {
    const directory = await mkdtemp(path.join(tmpdir(), 'submission-http-'))
    directories.push(directory)
    const runtime = await buildApp({
      dataDirectory: directory,
      logger: false,
      role: 'node',
    })
    runtime.app.get('/synthetic-submission-error', async () => {
      throw Object.assign(new Error('Synthetic refusal'), { statusCode })
    })

    try {
      const response = await runtime.app.inject('/synthetic-submission-error')
      expect(response.statusCode).toBe(statusCode)
      expect(response.json()).toEqual({
        error: 'Synthetic refusal',
      })
    } finally {
      await runtime.app.close()
    }
  })

  it('serializes a typed terminal draft conflict', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'submission-http-'))
    directories.push(directory)
    const runtime = await buildApp({
      dataDirectory: directory,
      logger: false,
      role: 'node',
    })
    runtime.app.get('/synthetic-terminal-draft-conflict', async () => {
      throw Object.assign(new Error('Terminal text is blocking this message'), {
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery: false,
      })
    })

    try {
      const response = await runtime.app.inject(
        '/synthetic-terminal-draft-conflict',
      )
      expect(response.statusCode).toBe(409)
      expect(response.json()).toEqual({
        error: 'Terminal text is blocking this message',
        terminalDraftConflict: true,
        uncertainDelivery: false,
      })
    } finally {
      await runtime.app.close()
    }
  })

  it('serializes a bounded terminal draft recovery identifier', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'submission-http-'))
    directories.push(directory)
    const runtime = await buildApp({
      dataDirectory: directory,
      logger: false,
      role: 'node',
    })
    runtime.app.get('/synthetic-terminal-draft-recovery', async () => {
      throw Object.assign(new Error('The original terminal text remains'), {
        statusCode: 409,
        terminalDraftConflict: true,
        terminalDraftRecovery: {
          id: 'bb7bd745-0318-48a8-bfb3-4c622b08f2b3',
        },
        uncertainDelivery: false,
      })
    })

    try {
      const response = await runtime.app.inject(
        '/synthetic-terminal-draft-recovery',
      )
      expect(response.statusCode).toBe(409)
      expect(response.json()).toEqual({
        error: 'The original terminal text remains',
        terminalDraftConflict: true,
        terminalDraftRecovery: {
          id: 'bb7bd745-0318-48a8-bfb3-4c622b08f2b3',
        },
        uncertainDelivery: false,
      })
    } finally {
      await runtime.app.close()
    }
  })
})
