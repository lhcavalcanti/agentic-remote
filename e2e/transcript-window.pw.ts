import { expect, test, type Locator } from '@playwright/test'
import {
  FIXTURE_NOW,
  SELECTED_SESSION_ID,
  createWorkspaceFixtureState,
  setupWorkspaceFixture,
} from './workspace-fixtures'

/** Where a row sits in the timeline's visible area, in pixels from its top. */
function viewTop(row: Locator) {
  return row.evaluate((element) => {
    const timeline = element.closest('.timeline')!
    return Math.round(element.getBoundingClientRect().top - timeline.getBoundingClientRect().top)
  })
}

test('Show earlier reveals what is held, then pages earlier messages in without moving the reader', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const state = createWorkspaceFixtureState()
  const session = state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
  const start = Date.parse(FIXTURE_NOW) - 1_200 * 60_000
  session.messages = Array.from({ length: 1_200 }, (_, index) => ({
    id: `long-${index}`,
    role: index % 2 ? 'assistant' as const : 'user' as const,
    content: index % 2 ? `Answer ${index}` : `Question ${index}`,
    createdAt: new Date(start + index * 60_000).toISOString(),
  }))
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl: testInfo.project.use.baseURL!,
    knowledgeMode: 'hidden',
    state,
  })
  const timeline = page.locator('.timeline')
  const earlier = page.locator('.transcript-earlier')
  const row = (text: string) => timeline.getByText(text, { exact: true })
  await page.goto(fixture.url)
  await expect(timeline).toContainText('Answer 1199')
  // The open asked for the latest window, not the whole transcript.
  expect(fixture.requests).toContainEqual(expect.objectContaining({
    method: 'GET', path: expect.stringMatching(new RegExp(`/sessions/${SELECTED_SESSION_ID}\\?window=500$`)),
  }))
  await expect(earlier).toHaveText('Show 950 earlier messages')

  // Rows already held come first, without asking the hub, and the reader
  // stays on the row they were reading.
  await earlier.scrollIntoViewIfNeeded()
  const reading = row('Question 950')
  const before = await viewTop(reading)
  await earlier.click()
  await expect(row('Question 700')).toBeAttached()
  expect(Math.abs(await viewTop(reading) - before)).toBeLessThanOrEqual(2)
  await expect(earlier).toHaveText('Show 700 earlier messages')
  expect(fixture.requests.some((request) => request.path.includes('/messages?'))).toBe(false)

  // Then a page at a time, each joined where the last one began. The first
  // is held back long enough to see it loading.
  let answer = () => {}
  const answered = new Promise<void>((resolve) => { answer = resolve })
  await page.route('**/messages?before=700*', async (route) => {
    await answered
    await route.fallback()
  })
  await earlier.scrollIntoViewIfNeeded()
  const held = row('Question 700')
  const heldTop = await viewTop(held)
  await earlier.click()
  await expect(earlier).toHaveText('Loading earlier messages…')
  await expect(earlier).toBeDisabled()
  const loading = testInfo.outputPath('loading-earlier.png')
  await page.screenshot({ path: loading })
  await testInfo.attach('loading-earlier', { path: loading, contentType: 'image/png' })
  answer()
  await expect(row('Question 200')).toBeAttached()
  expect(Math.abs(await viewTop(held) - heldTop)).toBeLessThanOrEqual(2)
  expect(fixture.requests).toContainEqual({
    method: 'GET',
    path: `/api/computers/${session.computerId}/sessions/${SELECTED_SESSION_ID}/messages?before=700&beforeId=long-700&limit=500`,
  })
  await expect(earlier).toHaveText('Show 200 earlier messages')
  await earlier.click()
  await expect(row('Question 0')).toBeAttached()
  await expect(earlier).toHaveCount(0)
  // Every row once, in order.
  const texts = await timeline.locator('article.message .message__content').allInnerTexts()
  expect(texts.map((text) => text.trim())).toEqual(
    session.messages.map((message) => message.content),
  )
  fixture.assertHealthy()
})
