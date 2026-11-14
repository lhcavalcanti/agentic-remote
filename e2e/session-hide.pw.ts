import { expect, test, type Locator, type Page } from '@playwright/test'
import { createWorkspaceFixtureState, setupWorkspaceFixture } from './workspace-fixtures'

// A phone or touch screen gets the 40px targets; a desktop with a mouse keeps
// the small controls it reveals on hover.
const devices = [
  { name: 'phone', viewport: { width: 390, height: 844 }, hasTouch: true, target: 40 },
  { name: 'desktop', viewport: { width: 1440, height: 900 }, hasTouch: false, target: 22 },
]

async function open(page: Page, baseUrl: string, phone: boolean) {
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl,
    knowledgeMode: 'hidden',
    state: createWorkspaceFixtureState(),
  })
  await page.goto(fixture.url)
  if (phone) await page.getByRole('button', { name: 'Open sessions' }).click()
  const list = page.getByRole('navigation', { name: 'Sessions' })
  await expect(list.locator('.session-item').first()).toBeVisible()
  return { fixture, list }
}

function row(list: Locator, title: string) {
  return list.locator('.session-item').filter({ has: list.page().getByText(title, { exact: true }) })
}

async function bounds(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Expected a laid-out element')
  return box
}

async function screenshot(page: Page, name: string) {
  if (process.env.HIDE_SESSIONS_SCREENSHOT) {
    await page.screenshot({
      animations: 'disabled',
      path: `${process.env.HIDE_SESSIONS_SCREENSHOT}-${name}.png`,
    })
  }
}

for (const device of devices) {
  test.describe(`on a ${device.name}`, () => {
    test.use({ hasTouch: device.hasTouch, viewport: device.viewport })

    test('Hide follows Close and Pause without making the row taller', async ({ page }, testInfo) => {
      const { fixture, list } = await open(page, testInfo.project.use.baseURL!, device.name === 'phone')
      try {
        const draft = row(list, 'Draft the weekly summary')
        await draft.hover()
        const close = await bounds(draft.getByRole('button', { name: 'Close Draft the weekly summary' }))
        const pause = await bounds(draft.getByRole('button', { name: 'Suspend Draft the weekly summary' }))
        const hide = draft.getByRole('button', { name: 'Hide Draft the weekly summary from the list' })
        await expect(hide).toHaveCSS('opacity', '1')
        const hidden = await bounds(hide)
        const item = await bounds(draft)

        // Close stays directly above Pause, and Hide comes after both, beside
        // them rather than under them: the row keeps its height.
        expect(Math.abs(close.x - pause.x)).toBeLessThan(1)
        expect(close.y + close.height).toBeLessThanOrEqual(pause.y)
        expect(hidden.x).toBeGreaterThanOrEqual(close.x + close.width)
        expect(hidden.y).toBeGreaterThanOrEqual(close.y)
        expect(hidden.y + hidden.height).toBeLessThanOrEqual(pause.y + pause.height)
        for (const control of [close, pause, hidden]) {
          expect(control.width).toBeGreaterThanOrEqual(device.target)
          expect(control.height).toBeGreaterThanOrEqual(device.target)
          expect(control.x + control.width).toBeLessThanOrEqual(item.x + item.width)
        }
        expect(await list.locator('.session-list__scroll').evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        )).toBeLessThanOrEqual(0)
      } finally {
        fixture.assertHealthy()
      }
    })

    test('a hidden session leaves the list until Hidden shows it, unless it needs you', async ({ page }, testInfo) => {
      const { fixture, list } = await open(page, testInfo.project.use.baseURL!, device.name === 'phone')
      try {
        const toggle = list.getByRole('button', { name: 'Include hidden sessions' })
        await expect(toggle).toHaveCount(0)
        await screenshot(page, `${device.name}-list`)

        const draft = row(list, 'Draft the weekly summary')
        await draft.hover()
        await draft.getByRole('button', { name: 'Hide Draft the weekly summary from the list' }).click()
        await expect(draft).toHaveCount(0)
        await expect(toggle).toHaveText(/Hidden\s*1/)
        await expect(toggle).toHaveAttribute('aria-pressed', 'false')

        // A question waiting on you is never out of sight.
        const waiting = row(list, 'Review session recovery')
        await waiting.hover()
        await waiting.getByRole('button', { name: 'Hide Review session recovery from the list' }).click()
        await expect(toggle).toHaveText(/Hidden\s*2/)
        await expect(waiting.getByText('Hidden', { exact: true })).toBeVisible()
        await expect(waiting.getByRole('button', { name: 'Show Review session recovery in the list' }))
          .toBeVisible()
        await expect(list.getByRole('button', { name: 'Needs you' })).toHaveText(/Needs you\s*2/)

        // The visibility toggles fit beside or under the filters; nothing spills over.
        const filters = list.getByRole('group', { name: 'Filter sessions' })
        expect(await filters.evaluate((element) => element.scrollWidth - element.clientWidth))
          .toBeLessThanOrEqual(0)
        if (device.name === 'phone') {
          for (const filter of await filters.getByRole('button').all()) {
            expect((await bounds(filter)).height).toBeGreaterThanOrEqual(device.target)
          }
        }
        await screenshot(page, `${device.name}-hidden`)

        await toggle.click()
        await expect(toggle).toHaveAttribute('aria-pressed', 'true')
        const shown = row(list, 'Draft the weekly summary')
        await expect(shown.getByText('Hidden', { exact: true })).toBeVisible()
        await expect(shown.getByRole('button', { name: /^Draft the weekly summary,/ }))
          .toHaveAccessibleName(/hidden from the list/)
        await screenshot(page, `${device.name}-shown`)

        await shown.hover()
        await shown.getByRole('button', { name: 'Show Draft the weekly summary in the list' }).click()
        await expect(shown.getByText('Hidden', { exact: true })).toHaveCount(0)
        await expect(toggle).toHaveText(/Hidden\s*1/)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}
