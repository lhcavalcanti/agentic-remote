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
})
