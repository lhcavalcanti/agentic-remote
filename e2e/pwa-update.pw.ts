import { cp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer, type AddressInfo } from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../server/app'
import { fixtureFrontendDist } from './fixture-frontend'
import { BrowserTestSessionService, FakeManager } from './fixtures/fake-voice'

const root = fileURLToPath(new URL('../', import.meta.url))
const work = path.join(root, 'test-results', 'pwa-update')
const updateReady = 'An Agentic Remote update is ready.'

test.use({ serviceWorkers: 'allow' })

/**
 * The fixture build under another identity, which is all a rebuild of
 * unchanged code changes (server/app-build.test.ts).
 */
async function release(buildId: string): Promise<string> {
  const source = path.join(root, fixtureFrontendDist)
  const target = path.join(work, buildId)
  await cp(source, target, { recursive: true })
  const built = JSON.parse(await readFile(path.join(source, 'build-info.json'), 'utf8')).buildId
  for (const name of ['build-info.json', 'index.html', 'sw.js']) {
    const file = path.join(target, name)
    const content = await readFile(file, 'utf8')
    if (!content.includes(built)) throw new Error(`${name} does not record the build identity`)
    await writeFile(file, content.replaceAll(built, buildId))
    await rm(`${file}.br`, { force: true })
    await rm(`${file}.gz`, { force: true })
  }
  return target
}

async function freePort(): Promise<number> {
  const server = createServer()
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo
  await new Promise((resolve) => server.close(resolve))
  return port
}

/** A hub serving one release on `port`, recording each URL it answers. */
async function serve(release: string, port: number, requests: string[]): Promise<FastifyInstance> {
  const environment = {
    AGENTIC_REMOTE_RELEASE_DIR: release,
    AGENTIC_REMOTE_ALLOWED_ORIGINS: `http://127.0.0.1:${port}`,
  }
  const saved = Object.fromEntries(Object.keys(environment).map((name) => [name, process.env[name]]))
  Object.assign(process.env, environment)
  try {
    const { app } = await buildApp({
      dataDirectory: path.join(work, 'hub'),
      logger: false,
      managerAgent: new FakeManager() as never,
      role: 'hub',
      serveStatic: true,
      service: new BrowserTestSessionService() as never,
      transcriptionService: { async initialize() {}, async stop() {} } as never,
    })
    app.addHook('onRequest', async (request) => { requests.push(request.url) })
    await app.listen({ host: '127.0.0.1', port })
    return app
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
  }
}

function workerBuild(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const script = navigator.serviceWorker.controller?.scriptURL
    return script ? new URL(script).searchParams.get('v') : null
  })
}

/** Returns to the app, as a foreground check does, and waits for it to finish. */
async function checkForUpdate(page: Page, requests: string[], deployed: string) {
  const checked = requests.filter((url) => url === `/sw.js?v=${deployed}`).length
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await expect.poll(() => requests.filter((url) => url === `/sw.js?v=${deployed}`).length)
    .toBeGreaterThan(checked)
  // Past the wait for a worker the check may have started installing.
  await page.waitForTimeout(1_500)
}

test('a release of unchanged code is offered once and downloads no asset again', async ({ page }) => {
  test.setTimeout(90_000)
  await rm(work, { recursive: true, force: true })
  const [first, next] = [await release('build-a'), await release('build-b')]
  const port = await freePort()
  const requests: string[] = []
  let hub = await serve(first, port, requests)
  try {
    await page.goto(`http://127.0.0.1:${port}/`)
    await expect.poll(() => workerBuild(page), { timeout: 15_000 }).toBe('build-a')
    // From here every request passes through the installed worker.
    await page.reload()
    await checkForUpdate(page, requests, 'build-a')
    await expect(page.getByText(updateReady)).toBeHidden()

    await hub.close()
    requests.length = 0
    hub = await serve(next, port, requests)
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await expect(page.getByText(updateReady)).toBeVisible({ timeout: 15_000 })
    const reloaded = page.waitForEvent('load')
    await page.getByRole('button', { name: 'Update now' }).click()
    await reloaded

    await expect.poll(() => workerBuild(page)).toBe('build-b')
    expect(await page.evaluate(() =>
      document.querySelector<HTMLMetaElement>('meta[name="agentic-remote-build"]')?.content)).toBe('build-b')
    await expect.poll(() => page.evaluate(() => caches.keys())).toEqual(['agentic-remote-shell-build-b'])
    await checkForUpdate(page, requests, 'build-b')
    await expect(page.getByText(updateReady)).toBeHidden()
    const used = await page.evaluate(() => performance.getEntriesByType('resource')
      .map((entry) => new URL(entry.name).pathname)
      .filter((pathname) => pathname.startsWith('/assets/')))
    expect(used.length).toBeGreaterThan(0)
    expect(requests.filter((url) => url.startsWith('/assets/'))).toEqual([])
  } finally {
    await hub.close()
  }
})
