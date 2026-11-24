import { expect, test } from '@playwright/test'
import {
  BACKGROUND_SESSION_ID,
  IDLE_SESSION_ID,
  OFFLINE_SESSION_ID,
  PENDING_SESSION_ID,
  PERMISSION_SESSION_ID,
  setupWorkspaceFixture,
} from './workspace-fixtures'

test('a session read ahead opens from memory while its own read is still out', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl: testInfo.project.use.baseURL!,
    knowledgeMode: 'hidden',
    summaryListing: true,
  })
  const readAhead = (id: string) => fixture.requests.some((request) =>
    request.method === 'GET' && request.path.endsWith(`/sessions/${id}?passive=1&window=500`))
  // Opening the idle session is held back, so only what was read ahead can draw it.
  await page.route((url) => url.pathname.endsWith(`/sessions/${IDLE_SESSION_ID}`) &&
    url.searchParams.get('passive') !== '1', () => undefined)
  await page.goto(fixture.url)
  await expect(page.locator('.timeline article.message').first()).toBeVisible()

  // One at a time down the sidebar: the idle session's answer is in once the
  // read after it has gone out.
  await expect.poll(() => readAhead(PERMISSION_SESSION_ID), { timeout: 15_000 }).toBe(true)
  expect(readAhead(PENDING_SESSION_ID)).toBe(true)
  expect(readAhead(IDLE_SESSION_ID)).toBe(true)
  await expect.poll(() => readAhead(BACKGROUND_SESSION_ID), { timeout: 15_000 }).toBe(true)
  // Its computer is offline.
  expect(readAhead(OFFLINE_SESSION_ID)).toBe(false)

  await page.locator('.session-list').getByText('Draft the weekly summary', { exact: true }).click()
  await expect(page.locator('.timeline')).toContainText('The short summary is ready for your next review.')
  await expect(page.getByLabel('Loading conversation')).toHaveCount(0)
  fixture.assertHealthy()
})
