import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium, expect } from '@playwright/test'

const cache = new URL('./.cache/', import.meta.url)
await mkdir(cache, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] })
try {
  const context = await browser.newContext({
    offline: true,
    serviceWorkers: 'block',
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  const errors = []
  const remote = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    if (/^https?:/.test(request.url())) remote.push(request.url())
  })
  await page.goto(new URL('./graph.html', import.meta.url).href)
  await expect(page.locator('#legend .legend-item').first()).toBeVisible({ timeout: 60_000 })
  await page.getByPlaceholder('Search nodes...').fill('KnowledgeStore')
  await page.locator('.search-item').filter({ hasText: 'KnowledgeStore' }).first().click()
  await expect(page.locator('#info-content')).toContainText('server/knowledge-store.ts')
  await page.getByLabel('Select All', { exact: true }).uncheck()
  await expect(page.locator('.legend-item:not(.dimmed)')).toHaveCount(0)
  await page.getByLabel('Select All', { exact: true }).check()
  await page.screenshot({
    path: fileURLToPath(new URL('./.cache/viewer.png', import.meta.url)),
  })
  if (errors.length || remote.length) throw new Error(JSON.stringify({ errors, remote }))
  console.log(JSON.stringify({
    offline: true,
    communityControls: await page.locator('#legend .legend-item').count(),
    search: 'KnowledgeStore',
    remoteRequests: remote.length,
    pageErrors: errors.length,
  }))
} finally {
  await browser.close()
}
