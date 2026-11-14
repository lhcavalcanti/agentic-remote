import { expect, test, type Locator, type Page } from '@playwright/test'
import type { ManagedSession } from '../shared/contracts'
import {
  createWorkspaceFixtureState,
  FIXTURE_NOW,
  setupWorkspaceFixture,
} from './workspace-fixtures'

const devices = [
  { name: 'phone', viewport: { width: 390, height: 844 }, hasTouch: true },
  { name: 'desktop', viewport: { width: 1440, height: 900 }, hasTouch: false },
]
const TARGET = 40

// Closed two days before the fixture's clock, on the node.
const closedEarlier: ManagedSession = {
  id: 'fixture-profile-sync',
  computerId: 'fixture-build',
  computerName: 'Build node',
  title: 'Profile the nightly sync',
  cwd: '/home/demo/workspace-checks',
  provider: 'claude',
  executionMode: 'sdk',
  updatedAt: '2026-09-02T16:05:00.000Z',
  status: 'idle',
  isOpen: false,
  messages: [],
  closedAt: new Date(Date.parse(FIXTURE_NOW) - 2 * 24 * 60 * 60 * 1000).toISOString(),
  closedContext: {
    title: 'Profile the nightly sync',
    cwd: '/home/demo/workspace-checks',
    prompts: [
      'Find out why the nightly sync takes 40 minutes now',
      'Compare it with last week’s run',
    ],
    reply:
      'Most of the time goes to re-reading folders that did not change. Caching their listings ' +
      'would bring the run to about 12 minutes; I stopped before changing anything.',
  },
}

async function open(page: Page, baseUrl: string, phone: boolean) {
  const state = createWorkspaceFixtureState()
  state.closedSessions.push(structuredClone(closedEarlier))
  const fixture = await setupWorkspaceFixture(page, { baseUrl, knowledgeMode: 'hidden', state })
  await page.goto(fixture.url)
  const list = await sessions(page, phone)
  return { fixture, list }
}

/** The Sessions list, opening the drawer a phone keeps it in. */
async function sessions(page: Page, phone: boolean) {
  if (phone && (await page.locator('aside.sidebar--open').count()) === 0) {
    await page.getByRole('button', { name: 'Open sessions' }).click()
  }
  const list = page.getByRole('navigation', { name: 'Sessions' })
  await expect(list.locator('.session-item').first()).toBeVisible()
  return list
}

function row(list: Locator, title: string) {
  return list.locator('.session-item').filter({ has: list.page().getByText(title, { exact: true }) })
}

async function closeFromRow(list: Locator, title: string) {
  const item = row(list, title)
  await item.hover()
  await item.getByRole('button', { name: `Close ${title}` }).click()
  return list.page().getByRole('dialog', { name: 'Close session' })
}

async function bounds(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Expected a laid-out element')
  return box
}

/** Inside the viewport, nothing spilling sideways, and every button easy to hit. */
async function expectUsable(page: Page, dialog: Locator) {
  const viewport = page.viewportSize()!
  const box = await bounds(dialog)
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
  expect(await dialog.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0)
  for (const button of await dialog.getByRole('button').all()) {
    if (!(await button.isVisible())) continue
    const target = await bounds(button)
    expect(target.width).toBeGreaterThanOrEqual(TARGET)
    expect(target.height).toBeGreaterThanOrEqual(TARGET)
  }
}

async function screenshot(page: Page, name: string) {
  if (process.env.RECENTLY_CLOSED_SCREENSHOT) {
    // Away from every control, so no button is caught mid-hover.
    await page.mouse.move(0, 0)
    await page.screenshot({
      animations: 'disabled',
      path: `${process.env.RECENTLY_CLOSED_SCREENSHOT}-${name}.png`,
    })
  }
}

for (const device of devices) {
  test.describe(`on a ${device.name}`, () => {
    test.use({ hasTouch: device.hasTouch, viewport: device.viewport })
    const phone = device.name === 'phone'

    test('a closed session waits under Recently closed with its context, and reopens', async ({ page }, testInfo) => {
      const { fixture, list } = await open(page, testInfo.project.use.baseURL!, phone)
      try {
        const entry = list.getByRole('button', { name: 'Recently closed, 1 session' })
        await expect(entry).toBeVisible()
        expect((await bounds(entry)).height).toBeGreaterThanOrEqual(TARGET)

        const confirmation = await closeFromRow(list, 'Plan the knowledge workspace')
        await expect(confirmation).toContainText(
          'Close “Plan the knowledge workspace” on Studio? You can reopen it from Recently closed for 14 days.',
        )
        await expectUsable(page, confirmation)
        await screenshot(page, `${device.name}-close`)
        await confirmation.getByRole('button', { name: 'Close session', exact: true }).click()

        const current = await sessions(page, phone)
        await expect(row(current, 'Plan the knowledge workspace')).toHaveCount(0)
        const recentEntry = current.getByRole('button', { name: 'Recently closed, 2 sessions' })
        await recentEntry.scrollIntoViewIfNeeded()
        await screenshot(page, `${device.name}-list`)
        await recentEntry.click()
        const recent = page.getByRole('dialog', { name: 'Recently closed' })
        const cards = recent.getByRole('article')
        await expect(cards).toHaveText([/Plan the knowledge workspace/, /Profile the nightly sync/])
        const closed = recent.getByRole('article', { name: 'Plan the knowledge workspace' })
        await expect(closed).toContainText('Closed just now')
        await expect(closed).toContainText('Deleted in 14 days')
        await expect(closed).toContainText('Help me make this workspace easier to scan.')
        await expect(closed).toContainText('I suggest three small changes')
        await expect(recent.getByRole('article', { name: 'Profile the nightly sync' }))
          .toContainText('Closed 2 days ago')
        await expectUsable(page, recent)
        await screenshot(page, `${device.name}-recently-closed`)

        await closed.getByRole('button', { name: 'Reopen Plan the knowledge workspace' }).click()
        await expect(recent).toHaveCount(0)
        const reopened = await sessions(page, phone)
        await expect(reopened.getByRole('button', { name: /^Plan the knowledge workspace,/ }))
          .toHaveAttribute('aria-current', 'page')
        await expect(reopened.getByRole('button', { name: 'Recently closed, 1 session' })).toBeVisible()
        expect(fixture.requests).toContainEqual({
          method: 'POST',
          path: '/api/computers/fixture-studio/sessions/fixture-plan-workspace/open',
        })
        expect(fixture.requests.filter((request) => request.path.endsWith('/messages'))).toEqual([])
      } finally {
        fixture.assertHealthy()
      }
    })

    test('Delete permanently removes a session at once, from either place', async ({ page }, testInfo) => {
      const { fixture, list } = await open(page, testInfo.project.use.baseURL!, phone)
      try {
        // Escape leaves the session as it was.
        let confirmation = await closeFromRow(list, 'Draft the weekly summary')
        await page.keyboard.press('Escape')
        await expect(confirmation).toHaveCount(0)
        await expect(row(list, 'Draft the weekly summary')).toHaveCount(1)

        confirmation = await closeFromRow(list, 'Draft the weekly summary')
        await confirmation.getByRole('button', { name: 'Delete permanently' }).click()
        const current = await sessions(page, phone)
        await expect(row(current, 'Draft the weekly summary')).toHaveCount(0)
        await expect(current.getByRole('button', { name: 'Recently closed, 1 session' })).toBeVisible()

        await current.getByRole('button', { name: 'Recently closed, 1 session' }).click()
        const recent = page.getByRole('dialog', { name: 'Recently closed' })
        page.once('dialog', (prompt) => void prompt.accept())
        await recent.getByRole('button', { name: 'Delete Profile the nightly sync permanently' }).click()
        await expect(recent).toContainText('Nothing closed in the last 14 days.')
        expect(fixture.requests.filter((request) => request.method === 'DELETE')).toEqual([
          { method: 'DELETE', path: '/api/computers/fixture-studio/sessions/fixture-draft-summary' },
          { method: 'DELETE', path: '/api/computers/fixture-build/sessions/fixture-profile-sync' },
        ])
        expect(fixture.requests.some((request) => request.path.endsWith('/close'))).toBe(false)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}
