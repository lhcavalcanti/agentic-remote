import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Browser } from '@playwright/test'
import { setupWorkspaceFixture } from '../../../e2e/workspace-fixtures.ts'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const gitDirectory = path.resolve(root, execFileSync(
  'git', ['rev-parse', '--git-common-dir'], { cwd: root, encoding: 'utf8' },
).trim())
// Chromium's singleton socket needs a short, private path, not the long session path.
const runtime = await mkdtemp(path.join(gitDirectory, 'b240-'))
await mkdir(path.join(runtime, 'config'), { mode: 0o700 })
process.env.TMPDIR = runtime
process.env.TMP = runtime
process.env.TEMP = runtime
const require = createRequire(path.join(root, 'package.json'))
const { chromium } = require('@playwright/test')
const { createServer } = await import(require.resolve('vite'))
const { default: react } = await import(require.resolve('@vitejs/plugin-react'))
const baseUrl = 'http://127.0.0.1:45239'
const server = await createServer({
  configFile: false, root, cacheDir: path.join(runtime, 'vite-cache'),
  plugins: [react()],
  define: { __APP_VERSION__: '"1.1.0"', __APP_BUILD_ID__: '"1.1.0"' },
  server: { host: '127.0.0.1', port: 45239, strictPort: true, hmr: false },
})
let browser: Browser | undefined
try {
  await server.listen()
  assert.equal((await fetch(baseUrl)).status, 200)
  browser = await chromium.launch({
    headless: true, executablePath: chromium.executablePath(), timeout: 20_000,
    env: {
      ...process.env, HOME: runtime, XDG_CACHE_HOME: runtime,
      XDG_CONFIG_HOME: path.join(runtime, 'config'),
    },
  })
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser!.newContext({
      viewport, hasTouch: viewport.width < 960, isMobile: viewport.width < 960,
      serviceWorkers: 'block', reducedMotion: 'reduce',
    })
    try {
      const page = await context.newPage()
      page.setDefaultTimeout(10_000)
      const fixture = await setupWorkspaceFixture(page, { baseUrl, knowledgeMode: 'hidden' })
      await page.goto(fixture.url, { timeout: 15_000 })
      await page.getByRole('textbox', { name: 'Message', exact: true }).waitFor()
      fixture.assertHealthy()
      const geometry = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      }))
      assert.ok(geometry.documentWidth <= geometry.viewportWidth + 1)
      console.log(JSON.stringify({
        browser: browser!.version(), viewport, mounted: true,
        horizontalOverflow: false, syntheticOnly: true, geometry,
      }))
    } finally {
      await context.close()
    }
  }
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  const closed = await Promise.allSettled([browser?.close(), server.close()])
  const frontendClosed = await fetch(baseUrl).then(() => false, () => true)
  await rm(runtime, { recursive: true, force: true })
  console.log(JSON.stringify({ frontendClosed, privateRuntimeRemoved: true }))
  const failures = closed.flatMap((result) => result.status === 'rejected' ? [result.reason] : [])
  if (!frontendClosed) failures.push(new Error('Owned frontend listener did not close'))
  if (failures.length) {
    console.error(new AggregateError(failures, 'Browser fixture cleanup failed'))
    process.exitCode = 1
  }
}
