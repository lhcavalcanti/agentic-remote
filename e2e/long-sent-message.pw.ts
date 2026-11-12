import { expect, test, type Page } from '@playwright/test'
import type { ManagedSession } from '../shared/contracts'
import {
  FIXTURE_NOW,
  SELECTED_SESSION_ID,
  createWorkspaceFixtureState,
  setupWorkspaceFixture,
} from './workspace-fixtures'

const steps = Array.from(
  { length: 24 },
  (_, index) => `Step ${index + 1}: rerun the checks and report anything unexpected.`,
)
const phone = { width: 390, height: 844 }

/** A conversation whose long message you sent is followed by `after` short exchanges. */
async function open(page: Page, baseUrl: string, after: number) {
  const state = createWorkspaceFixtureState()
  const session = state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
  const start = Date.parse(FIXTURE_NOW) - 60 * 60_000
  const at = (minute: number) => new Date(start + minute * 60_000).toISOString()
  session.messages = [
    { id: 'ask', role: 'user', content: 'Can you look at the failing check?', createdAt: at(0) },
    { id: 'answer', role: 'assistant', content: 'Yes. Tell me what to rerun.', createdAt: at(1) },
    { id: 'long-sent', role: 'user', content: steps.join('\n'), createdAt: at(2) },
    { id: 'reply', role: 'assistant', content: 'Rerunning them now.', createdAt: at(3) },
    ...Array.from({ length: after }, (_, index) => ({
      id: `later-${index}`,
      role: index % 2 ? 'assistant' as const : 'user' as const,
      content: index % 2 ? `Round ${index} passed.` : `And round ${index + 1}?`,
      createdAt: at(4 + index),
    })),
  ]
  const fixture = await setupWorkspaceFixture(page, { baseUrl, knowledgeMode: 'hidden', state })
  let revision = session.revision ?? 1
  const live = (patch: Partial<ManagedSession>): ManagedSession => {
    revision += 1
    return { ...structuredClone(session), ...patch, revision, updatedAt: FIXTURE_NOW }
  }
  await page.goto(fixture.url)
  const sent = page.locator('.message--user').filter({ hasText: 'Step 24:' })
  await expect(sent).toBeAttached()
  return { fixture, live, sent, content: sent.locator('.message__content') }
}

test('a long message you send starts collapsed on a phone, and reading it keeps your place', async ({ page }, testInfo) => {
  await page.setViewportSize(phone)
  const { fixture, live, sent, content } = await open(page, testInfo.project.use.baseURL!, 0)
  try {
    const showAll = sent.getByRole('button', { name: 'Show all' })
    await expect(showAll).toBeVisible()
    const collapsed = (await content.boundingBox())!.height
    // Six lines of 14px text at a 1.55 line height.
    expect(collapsed).toBeGreaterThan(110)
    expect(collapsed).toBeLessThan(140)
    await expect(page.getByText('Rerunning them now.')).toBeInViewport()
    if (process.env.LONG_MESSAGE_SCREENSHOT) {
      await page.screenshot({ path: `${process.env.LONG_MESSAGE_SCREENSHOT}-collapsed.png` })
    }

    await showAll.click()
    await expect(sent.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true')
    expect((await content.boundingBox())!.height).toBeGreaterThan(collapsed * 3)
    // The agent keeps working; the reader stays where they were reading.
    const top = (await sent.boundingBox())!.y
    fixture.emit({ type: 'session.upserted', session: live({ status: 'running', activity: 'Rerunning the checks' }) })
    await expect(page.locator('.activity-line')).toContainText('Rerunning the checks')
    expect(Math.abs((await sent.boundingBox())!.y - top)).toBeLessThan(2)
    await expect(page.getByRole('button', { name: 'Scroll to latest' })).toBeVisible()
    if (process.env.LONG_MESSAGE_SCREENSHOT) {
      await page.screenshot({ path: `${process.env.LONG_MESSAGE_SCREENSHOT}-expanded.png` })
    }
  } finally {
    fixture.assertHealthy()
  }
})

test('Show less on a phone brings the collapsed message back into view', async ({ page }, testInfo) => {
  await page.setViewportSize(phone)
  const { fixture, sent, content } = await open(page, testInfo.project.use.baseURL!, 24)
  try {
    await sent.getByRole('button', { name: 'Show all' }).click()
    const showLess = sent.getByRole('button', { name: 'Show less' })
    // Read to the end of the message, so its start is above the view.
    await showLess.evaluate((button) => {
      const timeline = button.closest('.timeline')!
      timeline.scrollTop += button.getBoundingClientRect().top - timeline.getBoundingClientRect().top - 24
    })
    await expect(sent.locator('.message__metadata')).not.toBeInViewport()
    await showLess.click()
    await expect(sent.getByRole('button', { name: 'Show all' })).toBeInViewport()
    expect((await content.boundingBox())!.height).toBeLessThan(140)
  } finally {
    fixture.assertHealthy()
  }
})

test.describe('with a mouse', () => {
  // The project emulates touch, which is the touch-device half of the phone rule.
  test.use({ hasTouch: false })

  test('long messages you send stay whole on the desktop', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const { fixture, sent, content } = await open(page, testInfo.project.use.baseURL!, 0)
    try {
      await expect(sent.getByRole('button', { name: 'Show all' })).toBeHidden()
      expect((await content.boundingBox())!.height).toBeGreaterThan(200)
      expect(await content.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
    } finally {
      fixture.assertHealthy()
    }
  })
})
