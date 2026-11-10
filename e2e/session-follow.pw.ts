import { expect, test, type Page } from '@playwright/test'
import type { ManagedSession } from '../shared/contracts'
import {
  FIXTURE_NOW,
  SELECTED_SESSION_ID,
  createWorkspaceFixtureState,
  setupWorkspaceFixture,
} from './workspace-fixtures'

/** How far the timeline's end lies below what the reader can see. */
function belowView(page: Page) {
  return page.locator('.timeline').evaluate((timeline) =>
    Math.round(timeline.scrollHeight - timeline.scrollTop - timeline.clientHeight))
}

test('a sent message and everything after it stay in view', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const state = createWorkspaceFixtureState()
  const session = state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
  // Several windows tall, so only the timeline's own scroll can hold the end.
  const start = Date.parse(FIXTURE_NOW) - 60 * 60_000
  session.messages = Array.from({ length: 30 }, (_, index) => ({
    id: `long-${index}`,
    role: index % 2 ? 'assistant' as const : 'user' as const,
    content: index % 2
      ? `Checked the plan. ${'Every step is on track and the checks pass. '.repeat(6)}`
      : `What changed in round ${index / 2 + 1}?`,
    createdAt: new Date(start + index * 60_000).toISOString(),
  }))
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl: testInfo.project.use.baseURL!,
    knowledgeMode: 'hidden',
    state,
  })
  let revision = session.revision ?? 1
  const live = (patch: Partial<ManagedSession>): ManagedSession => {
    revision += 1
    return { ...structuredClone(session), ...patch, revision, updatedAt: FIXTURE_NOW }
  }
  // The terminal takes the message and the agent starts on it; the
  // transcript only logs it later.
  await page.route('**/api/computers/*/sessions/*/messages', (route) =>
    route.fulfill({ json: { session: live({ status: 'running', activity: 'Thinking' }) } }))
  const timeline = page.locator('.timeline')
  const jump = page.getByRole('button', { name: 'Scroll to latest' })
  try {
    await page.goto(fixture.url)
    await expect(timeline).toContainText('round 15')
    await expect.poll(() => state.eventSockets.size).toBeGreaterThan(0)
    await expect.poll(() => belowView(page)).toBeLessThanOrEqual(1)

    await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Run the checks again')
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
    await expect(page.locator('.message--pending')).toBeInViewport({ ratio: 1 })
    await expect(page.locator('.activity-line')).toBeInViewport({ ratio: 1 })
    expect(await belowView(page)).toBeLessThanOrEqual(1)

    fixture.emit({
      type: 'session.upserted',
      session: live({ status: 'running', activity: 'Running the checks, a status long enough to take a second line' }),
    })
    await expect(page.locator('.activity-line')).toContainText('second line')
    expect(await belowView(page)).toBeLessThanOrEqual(1)

    // Content that grows on its own, as a diagram does when it renders, and a
    // scroll the reader did not make: they are still following.
    await timeline.evaluate((element) => {
      element.querySelector<HTMLElement>('.message-stack > :last-child')!.style.paddingBottom = '300px'
      element.dispatchEvent(new Event('scroll'))
    })
    await expect.poll(() => belowView(page)).toBeLessThanOrEqual(1)
    await expect(jump).toBeHidden()

    session.messages.push(
      { id: 'logged', role: 'user', content: 'Run the checks again', createdAt: FIXTURE_NOW },
      {
        id: 'reply',
        role: 'assistant',
        content: `Two checks failed. ${'The lint step and a flaky test. '.repeat(5)}`,
        createdAt: FIXTURE_NOW,
      },
    )
    fixture.emit({ type: 'session.upserted', session: live({ status: 'idle', activity: undefined }) })
    await expect(timeline).toContainText('Two checks failed')
    expect(await belowView(page)).toBeLessThanOrEqual(1)
    await expect(jump).toBeHidden()

    // Scrolling up is the reader leaving, and later text leaves them there.
    await timeline.hover()
    await page.mouse.wheel(0, -600)
    await expect(jump).toBeVisible()
    const readingAt = await timeline.evaluate((element) => element.scrollTop)
    session.messages.push({ id: 'later', role: 'assistant', content: 'One more thing.', createdAt: FIXTURE_NOW })
    fixture.emit({ type: 'session.upserted', session: live({}) })
    await expect(timeline).toContainText('One more thing.')
    expect(await timeline.evaluate((element) => element.scrollTop)).toBe(readingAt)
  } finally {
    fixture.assertHealthy()
  }
})
