import { expect, test, type Page } from '@playwright/test'
import {
  createWorkspaceFixtureState,
  FIXTURE_NOW,
  setupWorkspaceFixture,
} from './workspace-fixtures'

const devices = [
  { name: 'phone', viewport: { width: 390, height: 844 }, hasTouch: true },
  { name: 'desktop', viewport: { width: 1440, height: 900 }, hasTouch: false },
]

async function screenshot(page: Page, name: string) {
  if (process.env.SESSION_START_SCREENSHOT) {
    await page.screenshot({ animations: 'disabled', path: `${process.env.SESSION_START_SCREENSHOT}-${name}.png` })
  }
}

/** Holds every session creation until the test lets it through to the fixture. */
async function slowCreation(page: Page) {
  let release!: () => void
  const released = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route((url) => /^\/api\/computers\/[^/]+\/sessions$/.test(url.pathname), async (route) => {
    if (route.request().method() === 'POST') await released
    await route.fallback()
  })
  return release
}

for (const device of devices) {
  test.describe(`on a ${device.name}`, () => {
    test.use({ hasTouch: device.hasTouch, viewport: device.viewport })

    test('opens a session it starts at once, holds what is sent there, and sends it once it exists', async ({ page }, testInfo) => {
      const state = createWorkspaceFixtureState()
      const fixture = await setupWorkspaceFixture(page, {
        baseUrl: testInfo.project.use.baseURL!,
        knowledgeMode: 'hidden',
        state,
      })
      try {
        await page.goto(fixture.url)
        const message = page.getByRole('textbox', { name: 'Message', exact: true })
        await expect(message).toBeVisible()
        const release = await slowCreation(page)
        const main = page.getByRole('main')

        await main.getByRole('button', { name: 'New session', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'Choose a folder' })
        const create = dialog.getByRole('button', { name: 'Create session' })
        await expect(create).toBeEnabled()
        await create.click()

        const starting = main.getByRole('status', { name: 'Starting session' })
        await expect(starting).toBeVisible()
        await expect(starting).toContainText('GitHub Copilot in tmux is starting on Studio in ~')
        await expect(page.locator('aside.sidebar--open')).toHaveCount(0)
        await expect(message).toBeFocused()
        await expect(message).toHaveValue('')

        await message.fill('Summarize the open questions in the field notes')
        await main.getByRole('button', { name: 'Send message' }).click()
        const held = main.getByRole('region', { name: 'Held messages' })
        await expect(held).toContainText('Will send when the session starts')
        await expect(held.getByRole('listitem')).toHaveText(['Summarize the open questions in the field notes'])
        await message.fill('Then list what is still missing')
        // A few seconds in, as a slow start looks.
        await page.clock.setFixedTime(new Date(Date.parse(FIXTURE_NOW) + 7_000))
        await expect(main.locator('.session-start__elapsed time')).toHaveText('0:07')
        await screenshot(page, `${device.name}-held`)
        const sent = () => fixture.requests.filter((request) =>
          request.method === 'POST' && /\/sessions\/[^/]+\/messages$/.test(request.path))
        expect(sent()).toEqual([])

        release()

        await expect(starting).toHaveCount(0)
        await expect(main.getByText('Summarize the open questions in the field notes').first()).toBeVisible()
        await expect(held).toHaveCount(0)
        await expect(message).toHaveValue('Then list what is still missing')
        await expect.poll(() => state.sessions.find(({ id }) => id === 'fixture-started-1')?.messages
          .filter(({ role }) => role === 'user').map(({ content }) => content))
          .toEqual(['Summarize the open questions in the field notes'])
        expect(sent()).toEqual([{
          method: 'POST',
          path: '/api/computers/fixture-studio/sessions/fixture-started-1/messages',
        }])
        await screenshot(page, `${device.name}-delivered`)
      } finally {
        fixture.assertHealthy()
      }
    })

    test('keeps what was written for a session that could not start, and starts it again as asked', async ({ page }, testInfo) => {
      const state = createWorkspaceFixtureState()
      const fixture = await setupWorkspaceFixture(page, {
        baseUrl: testInfo.project.use.baseURL!,
        knowledgeMode: 'hidden',
        state,
      })
      try {
        await page.goto(fixture.url)
        const message = page.getByRole('textbox', { name: 'Message', exact: true })
        await expect(message).toBeVisible()
        let refuse!: () => void
        const refused = new Promise<void>((resolve) => {
          refuse = resolve
        })
        let attempts = 0
        await page.route((url) => /^\/api\/computers\/[^/]+\/sessions$/.test(url.pathname), async (route) => {
          if (route.request().method() === 'POST' && ++attempts === 1) {
            await refused
            await route.fulfill({
              status: 409,
              contentType: 'application/json',
              body: JSON.stringify({ error: 'Studio could not start Copilot in that folder.' }),
            })
            return
          }
          await route.fallback()
        })
        const main = page.getByRole('main')
        await main.getByRole('button', { name: 'New session', exact: true }).click()
        const create = page.getByRole('dialog', { name: 'Choose a folder' })
          .getByRole('button', { name: 'Create session' })
        await expect(create).toBeEnabled()
        await create.click()
        await expect(main.getByRole('status', { name: 'Starting session' })).toBeVisible()
        await message.fill('Compare the two handbook drafts')
        await main.getByRole('button', { name: 'Send message' }).click()
        await message.fill('Keep the shorter one')

        refuse()

        const failure = main.getByRole('alert')
        await expect(failure).toContainText('Couldn’t start the session')
        await expect(failure).toContainText('Studio could not start Copilot in that folder.')
        const held = main.getByRole('region', { name: 'Held messages' })
        await expect(held.getByRole('listitem')).toHaveText(['Compare the two handbook drafts'])
        await expect(message).toHaveValue('Keep the shorter one')
        await expect(page.locator('.session-item--creation-failed')).toHaveCount(1)
        await screenshot(page, `${device.name}-failed`)

        await main.getByRole('button', { name: 'Try again' }).click()

        await expect.poll(() => state.sessions.find(({ id }) => id === 'fixture-started-1')?.messages
          .filter(({ role }) => role === 'user').map(({ content }) => content))
          .toEqual(['Compare the two handbook drafts'])
        await expect(held).toHaveCount(0)
        await expect(message).toHaveValue('Keep the shorter one')
        expect(attempts).toBe(2)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}
