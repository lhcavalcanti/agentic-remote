import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import Fastify from 'fastify'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from './app.js'
import { SkillSettingsService } from './skill-settings.js'
import { RemoteNodeClient } from './remote-node-client.js'

const directories: string[] = []
const applications: Array<{ close(): Promise<unknown> }> = []
afterEach(async () => {
  for (const app of applications.splice(0).reverse()) await app.close()
  for (const directory of directories.splice(0)) await rm(directory, { recursive: true, force: true })
  vi.unstubAllEnvs()
})
async function fixture(label: string) {
  const directory = path.resolve(`.agentic-skill-routes-${label}-${randomUUID()}`)
  directories.push(directory)
  const home = path.join(directory, 'home')
  const copilotHome = path.join(home, '.copilot')
  const skill = path.join(copilotHome, 'skills', 'sample')
  await mkdir(skill, { recursive: true })
  await writeFile(path.join(skill, 'SKILL.md'), '---\nname: sample\ndescription: A fictional review skill.\n---\nDo not execute.')
  await writeFile(path.join(copilotHome, 'settings.json'), '{"retained":true}')
  const settings = new SkillSettingsService({ home, copilotHome, env: {}, folders: () => [] })
  return { directory, home, copilotHome, settings }
}

describe('computer skill settings routes', () => {
  it.each(['hub', 'node'] as const)('reports unreadable UTF-8 for %s skill reads and refuses writes without changing bytes', async (role) => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://skills.example.test')
    const files = await fixture(role)
    const before = await files.settings.snapshot()
    const file = path.join(files.copilotHome, 'settings.json')
    const bytes = Buffer.concat([Buffer.from('{"retained":"'), Buffer.from([0xff]), Buffer.from('"}')])
    await writeFile(file, bytes)
    const runtime = await buildApp({
      role, dataDirectory: path.join(files.directory, 'data'), skillSettings: files.settings, managerAgent: false, logger: false,
    })
    applications.push(runtime.app)
    const url = role === 'hub' ? `/api/computers/${runtime.identity.info.id}/skills` : '/node-api/skills'
    const headers = role === 'hub'
      ? { host: 'skills.example.test', origin: 'https://skills.example.test' }
      : { authorization: `Bearer ${runtime.identity.token}` }
    for (const method of ['GET', 'PATCH'] as const) {
      const response = await runtime.app.inject({
        url, headers, method,
        ...(method === 'PATCH' ? { payload: { name: 'sample', enabled: false, confirmed: true, revision: before.revision } } : {}),
      })
      expect(response.statusCode, response.body).toBe(409)
      expect(response.json().error).toMatch(/read safely.*invalid UTF-8/)
      expect(await readFile(file)).toEqual(bytes)
    }
  })

  it('routes a confirmed change only to the authenticated selected computer and rejects browser node origins', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://skills.example.test')
    const nodeFiles = await fixture('node')
    const hubFiles = await fixture('hub')
    const node = await buildApp({ role: 'node', dataDirectory: path.join(nodeFiles.directory, 'data'), skillSettings: nodeFiles.settings, logger: false })
    applications.push(node.app)
    const nodeUrl = await node.app.listen({ host: '127.0.0.1', port: 0 })
    const hub = await buildApp({ role: 'hub', dataDirectory: path.join(hubFiles.directory, 'data'), skillSettings: hubFiles.settings, managerAgent: false, logger: false })
    applications.push(hub.app)
    const headers = { host: 'skills.example.test', origin: 'https://skills.example.test' }
    const computer = await hub.manager!.registerComputer({ baseUrl: nodeUrl, token: node.identity.token, name: 'Build node' })
    const url = `/api/computers/${computer.id}/skills`
    const listed = await hub.app.inject({ url, headers })
    expect(listed.statusCode).toBe(200)
    expect(listed.headers['cache-control']).toBe('no-store')
    expect(listed.json().skills).toMatchObject([{ name: 'sample', enabled: true }])
    const payload = { name: 'sample', enabled: false, confirmed: true, revision: listed.json().revision }
    expect((await hub.app.inject({ url, headers, method: 'PATCH', payload })).statusCode).toBe(200)
    expect(JSON.parse(await readFile(path.join(nodeFiles.copilotHome, 'settings.json'), 'utf8'))).toEqual({ retained: true, disabledSkills: ['sample'] })
    expect(await readFile(path.join(hubFiles.copilotHome, 'settings.json'), 'utf8')).toBe('{"retained":true}')
    expect((await node.app.inject({ url: '/node-api/skills' })).statusCode).toBe(401)
    expect((await node.app.inject({ url: '/%6eode-api/skills', method: 'PATCH', payload,
      headers: { authorization: `Bearer ${node.identity.token}`, origin: 'https://attacker.example.test' },
    })).statusCode).toBe(403)
    expect((await node.app.inject({ url: '/node-api/skills', method: 'PATCH', payload: { ...payload, confirmed: false },
      headers: { authorization: `Bearer ${node.identity.token}` },
    })).statusCode).toBe(400)
    for (const method of ['GET', 'PATCH'] as const) {
      expect((await node.app.inject({ url: '/node-api/skills', method,
        ...(method === 'PATCH' ? { payload: '{' } : {}),
        headers: { authorization: `Bearer ${node.identity.token}`, origin: 'https://attacker.example.test', 'content-type': 'application/json' },
      })).statusCode).toBe(403)
    }
    expect((await hub.app.inject({ url, method: 'PATCH', headers, payload })).statusCode).toBe(409)
  })

  it.each([undefined, 1])('explicitly asks to update a node with capability %s without sending a skill read or write', async (version) => {
    const app = Fastify()
    applications.push(app)
    const requests: string[] = []
    app.addHook('onRequest', async (request) => { requests.push(request.url); expect(request.headers.authorization).toBe('Bearer fictional-token') })
    app.get('/node-api/info', async () => ({ id: 'old', name: 'Older node', version: '1.0.0', ...(version ? { skillSettings: { version } } : {}) }))
    const url = await app.listen({ host: '127.0.0.1', port: 0 })
    const client = new RemoteNodeClient({ id: 'old', name: 'Older node', baseUrl: url, token: 'fictional-token' })
    try {
      await expect(client.skillSettingsTarget()).rejects.toMatchObject({ statusCode: 409, message: 'Update this computer (Older node) to manage skills.' })
      expect(requests).toEqual(['/node-api/info'])
    } finally { client.stop() }
  })
})
