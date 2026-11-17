import { describe, expect, it } from 'vitest'
import { SessionAdmissions } from './session-admissions.js'

describe('fenced session teardown admissions', () => {
  it('admits explicit teardown without reopening work or normal exclusive admission', async () => {
    const admissions = new SessionAdmissions(() => false)
    admissions.blockLaunch('session')
    await expect(admissions.exclusive('session', async () => undefined)).rejects.toMatchObject({ statusCode: 409 })
    await admissions.exclusive('session', async (owner) => {
      expect(owner.isCurrent()).toBe(true)
      expect(admissions.canEnter('session')).toBe(false)
      await expect(admissions.run('session', async () => undefined)).rejects.toMatchObject({ statusCode: 409 })
    }, { intent: 'teardown' })
    await expect(admissions.run('session', async () => undefined)).rejects.toMatchObject({ statusCode: 409 })
    await expect(admissions.exclusive('session', async () => undefined)).rejects.toMatchObject({ statusCode: 409 })
  })

  it('joins earlier work and permits teardown when the fence closes during the wait', async () => {
    const admissions = new SessionAdmissions(() => false)
    let release = () => {}
    const gate = new Promise<void>((resolve) => { release = resolve })
    const pending = admissions.run('session', async () => gate)
    let tornDown = false
    const teardown = admissions.exclusive('session', async (owner) => {
      expect(owner.isCurrent()).toBe(true)
      tornDown = true
    }, { intent: 'teardown' })
    admissions.blockLaunch('session')
    expect(tornDown).toBe(false)
    release()
    await Promise.all([pending, teardown])
    expect(tornDown).toBe(true)
  })

  it('does not bypass shutdown or an existing exclusive owner for teardown', async () => {
    const stopped = new SessionAdmissions(() => true)
    await expect(stopped.exclusive('session', async () => undefined, { intent: 'teardown' }))
      .rejects.toMatchObject({ statusCode: 503 })
    const admissions = new SessionAdmissions(() => false)
    admissions.blockLaunch('session')
    let release = () => {}
    const gate = new Promise<void>((resolve) => { release = resolve })
    const first = admissions.exclusive('session', async () => gate, { intent: 'teardown' })
    await expect(admissions.exclusive('session', async () => undefined, { intent: 'teardown' }))
      .rejects.toMatchObject({ statusCode: 409 })
    release()
    await first
  })
})
