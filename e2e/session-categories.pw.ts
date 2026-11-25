import { expect, test, type Browser, type Locator, type Page } from '@playwright/test'
import {
  BACKGROUND_SESSION_ID,
  IDLE_SESSION_ID,
  OFFLINE_SESSION_ID,
  PENDING_SESSION_ID,
  PERMISSION_SESSION_ID,
  SELECTED_SESSION_ID,
  createWorkspaceFixtureState,
  setupWorkspaceFixture,
  type WorkspaceFixtureState,
} from './workspace-fixtures'

// A phone or touch screen gets 40px targets; a desktop with a mouse keeps
// the smaller controls.
const devices = [
  { name: 'phone', viewport: { width: 390, height: 844 }, hasTouch: true, target: 40 },
  { name: 'desktop', viewport: { width: 1440, height: 900 }, hasTouch: false, target: 28 },
]

const studio = (id: string) => `fixture-studio:${id}`
const build = (id: string) => `fixture-build:${id}`

/**
 * Reviews is closed and holds two sessions that need you, one that is
 * unread, and one running background work; Plans is open and holds one.
 */
function categorizedState(): WorkspaceFixtureState {
  const state = createWorkspaceFixtureState()
  state.sessionOrder.unread = [studio(IDLE_SESSION_ID)]
  state.sessionCategories = {
    revision: 3,
    categories: [
      {
        id: 'reviews',
        name: 'Reviews',
        collapsed: true,
        sessions: [studio(PENDING_SESSION_ID), build(BACKGROUND_SESSION_ID), studio(IDLE_SESSION_ID), build(PERMISSION_SESSION_ID)],
      },
      { id: 'plans', name: 'Plans', collapsed: false, sessions: [studio(SELECTED_SESSION_ID)] },
    ],
  }
  return state
}

async function open(page: Page, baseUrl: string, state: WorkspaceFixtureState) {
  const fixture = await setupWorkspaceFixture(page, { baseUrl, knowledgeMode: 'hidden', state })
  await page.goto(fixture.url)
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible()
  return fixture
}

/** The session list, opened on a phone, where it is a drawer. */
async function sessionList(page: Page) {
  const toggle = page.getByRole('button', { name: 'Open sessions', exact: true })
  if (await toggle.isVisible()) await toggle.click()
  const list = page.getByRole('navigation', { name: 'Sessions' })
  await expect(list.locator('.session-item').first()).toBeVisible()
  return list
}

async function bounds(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Expected a laid-out element')
  return box
}

async function screenshot(page: Page, name: string) {
  if (process.env.CATEGORIES_SCREENSHOT) {
    await page.screenshot({ animations: 'disabled', path: `${process.env.CATEGORIES_SCREENSHOT}-${name}.png` })
  }
}

type Point = { x: number; y: number }

function middle(box: { x: number; y: number; width: number; height: number }): Point {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

/**
 * Carries a session row onto a target and holds it there, picked up by its
 * title as anywhere on it would be: with a long press on a touch screen and a
 * press and a short move with a mouse. Resolves to what lets it go.
 */
async function drag(page: Page, device: typeof devices[number], row: Locator, target: Locator) {
  const from = middle(await bounds(row.locator('.session-item__open strong')))
  const to = middle(await bounds(target))
  if (device.hasTouch) {
    // Through Chromium's own touch input, so the long press is a real one.
    const cdp = await page.context().newCDPSession(page)
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', points: Point[]) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points })
    await touch('touchStart', [from])
    await page.waitForTimeout(400)
    await expect(row).toHaveClass(/sortable-dragging/)
    for (let step = 1; step <= 16; step += 1) {
      await touch('touchMove', [{ x: from.x + (to.x - from.x) * step / 16, y: from.y + (to.y - from.y) * step / 16 }])
    }
    return () => touch('touchEnd', [])
  }
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(from.x + 4, from.y + 12, { steps: 4 })
  await page.mouse.move(to.x, to.y, { steps: 16 })
  return () => page.mouse.up()
}

async function secondPage(browser: Browser, device: typeof devices[number], baseUrl: string, state: WorkspaceFixtureState) {
  const context = await browser.newContext({
    viewport: device.viewport,
    hasTouch: device.hasTouch,
    serviceWorkers: 'block',
  })
  const page = await context.newPage()
  const fixture = await open(page, baseUrl, state)
  return { context, page, fixture }
}

for (const device of devices) {
  test.describe(`on a ${device.name}`, () => {
    test.use({ hasTouch: device.hasTouch, viewport: device.viewport })

    test('creates a category with the open session in it, and moves it with the menu', async ({ page }, testInfo) => {
      const state = createWorkspaceFixtureState()
      const fixture = await open(page, testInfo.project.use.baseURL!, state)
      try {
        const moveTo = async () => {
          await page.getByRole('button', { name: 'Session actions', exact: true }).click()
          await page.getByRole('group', { name: 'Session actions' })
            .getByRole('button', { name: 'Move to category…' }).click()
          return page.getByRole('dialog', { name: 'Move to category' })
        }
        let dialog = await moveTo()
        await expect(dialog.getByRole('button', { name: 'No category' })).toHaveAttribute('aria-current', 'true')
        await dialog.getByRole('button', { name: 'New category…' }).click()
        await dialog.getByRole('textbox', { name: 'Category name' }).fill('Field work')
        await screenshot(page, `${device.name}-move-dialog`)
        await dialog.getByRole('button', { name: 'Create and move' }).click()
        await expect(dialog).toHaveCount(0)
        await expect.poll(() => state.sessionCategories.categories.map(({ name, sessions }) => [name, sessions]))
          .toEqual([['Field work', [studio(SELECTED_SESSION_ID)]]])

        let list = await sessionList(page)
        const category = list.getByRole('region', { name: 'Category Field work' })
        await expect(category.getByRole('button', { name: /^Plan the knowledge workspace,/ })).toBeVisible()
        await expect(list.getByRole('region', { name: 'Studio', exact: true })
          .getByRole('button', { name: /^Plan the knowledge workspace,/ })).toHaveCount(0)

        // The Sessions header keeps to one row; every category control is a
        // full target on a touch screen.
        expect((await bounds(list.locator('.session-list__heading'))).height).toBeLessThanOrEqual(44)
        for (const control of [
          category.getByRole('button', { name: 'Field work, 1 session' }),
          category.getByRole('button', { name: 'Category actions for Field work' }),
          list.getByRole('button', { name: 'New category' }),
        ]) {
          expect((await bounds(control)).height).toBeGreaterThanOrEqual(device.target)
        }
        expect(await list.locator('.session-list__scroll').evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        )).toBeLessThanOrEqual(0)
        await screenshot(page, `${device.name}-created`)

        // Back out with the same menu, and it is under its computer again.
        if (device.name === 'phone') await page.getByRole('button', { name: 'Close sessions', exact: true }).first().click()
        dialog = await moveTo()
        await expect(dialog.getByRole('button', { name: 'Field work' })).toHaveAttribute('aria-current', 'true')
        await dialog.getByRole('button', { name: 'No category' }).click()
        await expect.poll(() => state.sessionCategories.categories[0]?.sessions).toEqual([])
        list = await sessionList(page)
        await expect(list.getByRole('region', { name: 'Studio', exact: true })
          .getByRole('button', { name: /^Plan the knowledge workspace,/ })).toBeVisible()
      } finally {
        fixture.assertHealthy()
      }
    })

    test('moves a session dragged onto a closed category, which sums up what is in it', async ({ page }, testInfo) => {
      const state = categorizedState()
      const fixture = await open(page, testInfo.project.use.baseURL!, state)
      try {
        const list = await sessionList(page)
        const reviews = list.getByRole('region', { name: 'Category Reviews' })
        const header = reviews.getByRole('button', { name: 'Reviews, 2 need you, 1 unread, working, 4 sessions' })
        await expect(header).toHaveAttribute('aria-expanded', 'false')
        await expect(reviews.locator('.session-category__signal--attention')).toHaveText('◆2')
        await expect(reviews.locator('.session-category__signal--unread')).toHaveText('●1')
        await expect(reviews.locator('.session-category__ring')).toBeVisible()
        // What needs you and what is unread stays in sight; the rest is counted.
        for (const title of ['Review session recovery', 'Draft the weekly summary', 'Approve the document check']) {
          await expect(reviews.getByRole('button', { name: new RegExp(`^${title},`) })).toBeVisible()
        }
        await expect(reviews.getByRole('button', { name: /^Check handbook links,/ })).toHaveCount(0)
        await expect(reviews.getByRole('button', { name: 'Show 1 more session in Reviews' })).toBeVisible()
        if (device.name === 'phone') {
          expect((await bounds(reviews.getByRole('button', { name: 'Show 1 more session in Reviews' }))).height)
            .toBeGreaterThanOrEqual(device.target)
        }
        await screenshot(page, `${device.name}-collapsed`)

        // Its own menu takes the focus, and Escape gives it back.
        const actions = reviews.getByRole('button', { name: 'Category actions for Reviews' })
        await actions.click()
        const menu = page.getByRole('menu', { name: 'Category actions for Reviews' })
        await expect(menu.getByRole('menuitem', { name: 'New session in Reviews' })).toBeFocused()
        await expect(menu.getByRole('menuitem', { name: 'Move up' })).toBeDisabled()
        await page.keyboard.press('ArrowDown')
        await expect(menu.getByRole('menuitem', { name: 'Mark all as read' })).toBeFocused()
        if (device.name === 'phone') {
          for (const item of await menu.getByRole('menuitem').all()) {
            expect((await bounds(item)).height).toBeGreaterThanOrEqual(device.target)
          }
        }
        await screenshot(page, `${device.name}-menu`)
        await page.keyboard.press('Escape')
        await expect(menu).toHaveCount(0)
        await expect(actions).toBeFocused()
        // The phone's drawer stays open: Escape was the menu's.
        await expect(list).toBeVisible()

        const plans = list.getByRole('region', { name: 'Category Plans' })
        const release = await drag(page, device, plans.locator('.session-item').filter({ hasText: 'Plan the knowledge workspace' }), header)
        await expect(reviews).toHaveClass(/session-category--drop-target/)
        await release()

        await expect.poll(() => state.sessionCategories.categories.map(({ id, sessions }) => [id, sessions])).toEqual([
          ['reviews', [studio(PENDING_SESSION_ID), build(BACKGROUND_SESSION_ID), studio(IDLE_SESSION_ID),
            build(PERMISSION_SESSION_ID), studio(SELECTED_SESSION_ID)]],
          ['plans', []],
        ])
        // Still closed, and the open session stays in sight in it.
        await expect(reviews.getByRole('button', { name: /^Reviews, .*5 sessions$/ })).toHaveAttribute('aria-expanded', 'false')
        await expect(reviews.getByRole('button', { name: /^Plan the knowledge workspace,/ })).toBeVisible()
        await expect(plans.getByText("Drag sessions here, or use Move to category in a session's actions")).toBeVisible()

        await reviews.getByRole('button', { name: 'Show 1 more session in Reviews' }).click()
        await expect(reviews.getByRole('button', { name: 'Reviews, 5 sessions' })).toHaveAttribute('aria-expanded', 'true')
        await expect(reviews.getByRole('button', { name: /^Check handbook links,/ })).toBeVisible()
        await expect.poll(() => state.sessionCategories.categories[0].collapsed).toBe(false)
      } finally {
        fixture.assertHealthy()
      }
    })

    test('starts a session in a category beside its latest one, and says why one cannot start', async ({ page }, testInfo) => {
      const state = categorizedState()
      state.sessionCategories = {
        revision: 4,
        categories: [
          ...state.sessionCategories.categories,
          { id: 'away', name: 'Away', collapsed: false, sessions: [`fixture-travel:${OFFLINE_SESSION_ID}`] },
        ],
      }
      const fixture = await open(page, testInfo.project.use.baseURL!, state)
      try {
        let list = await sessionList(page)
        await list.getByRole('region', { name: 'Category Plans' })
          .getByRole('button', { name: 'Category actions for Plans' }).click()
        const menu = page.getByRole('menu', { name: 'Category actions for Plans' })
        const start = menu.getByRole('menuitem', { name: 'New session in Plans' })
        await expect(start).toBeFocused()
        await expect(start).toHaveAccessibleDescription('~/field-notes on Studio')
        expect((await bounds(start)).height).toBeGreaterThanOrEqual(device.target)
        // The wider menu stays on screen.
        const panel = await bounds(menu)
        expect(panel.x).toBeGreaterThanOrEqual(0)
        expect(panel.x + panel.width).toBeLessThanOrEqual(device.viewport.width)
        await screenshot(page, `${device.name}-new-session-menu`)
        await start.click()

        // Where Plans' latest session works, with New session's defaults, and in Plans.
        await expect.poll(() => state.sessions.find(({ id }) => id === 'fixture-started-1'))
          .toMatchObject({ computerId: 'fixture-studio', cwd: '/home/demo/field-notes', provider: 'copilot', executionMode: 'tmux' })
        await expect.poll(() => state.sessionCategories.categories.find(({ id }) => id === 'plans')?.sessions)
          .toEqual([studio(SELECTED_SESSION_ID), studio('fixture-started-1')])
        await expect(page.getByRole('status').filter({ hasText: 'Started field-notes in Plans' })).toHaveCount(1)
        list = await sessionList(page)
        await expect(list.getByRole('region', { name: 'Category Plans' }).getByRole('button', { name: /^field-notes,/ }))
          .toHaveAttribute('aria-current', 'page')
        await screenshot(page, `${device.name}-new-session-started`)

        // Away's latest session is on a computer that is offline.
        await list.getByRole('region', { name: 'Category Away' })
          .getByRole('button', { name: 'Category actions for Away' }).click()
        const offline = page.getByRole('menu', { name: 'Category actions for Away' })
          .getByRole('menuitem', { name: 'New session in Away' })
        await expect(offline).toBeDisabled()
        await expect(offline).toHaveAccessibleDescription('Travel laptop is offline')
        await screenshot(page, `${device.name}-new-session-offline`)
      } finally {
        fixture.assertHealthy()
      }
    })

    test('shows matches inside their categories, open, and leaves the rest out while filtering', async ({ page }, testInfo) => {
      const state = categorizedState()
      const fixture = await open(page, testInfo.project.use.baseURL!, state)
      try {
        const list = await sessionList(page)
        await list.getByRole('searchbox', { name: 'Search sessions' }).fill('handbook')
        const reviews = list.getByRole('region', { name: 'Category Reviews' })
        const header = reviews.getByRole('button', { name: 'Reviews, 1 of 4 sessions' })
        await expect(header).toHaveAttribute('aria-expanded', 'true')
        await expect(header).toBeDisabled()
        await expect(reviews.getByRole('button', { name: /^Check handbook links,/ })).toBeVisible()
        await expect(reviews.locator('.session-item')).toHaveCount(1)
        await expect(list.getByRole('region', { name: 'Category Plans' })).toHaveCount(0)
        await expect(list.getByRole('button', { name: 'New category' })).toHaveCount(0)
        // Nothing can be dragged while the list is filtered.
        await expect(reviews.locator('.drag-handle')).toHaveAttribute('aria-disabled', 'true')
        await screenshot(page, `${device.name}-filtered`)

        await list.getByRole('button', { name: 'Clear session search' }).click()
        await list.getByRole('button', { name: 'Needs you', exact: true }).click()
        await expect(reviews.locator('.session-item')).toHaveCount(2)
        await expect(list.getByRole('region', { name: 'Category Plans' })).toHaveCount(0)
        await list.getByRole('button', { name: 'Clear filters' }).click()
        await expect(reviews.getByRole('button', { name: /^Reviews,/ })).toHaveAttribute('aria-expanded', 'false')
        await expect(list.getByRole('region', { name: 'Category Plans' })).toBeVisible()
      } finally {
        fixture.assertHealthy()
      }
    })

    test('keeps two pages on the same categories', async ({ page, browser }, testInfo) => {
      const state = categorizedState()
      const baseUrl = testInfo.project.use.baseURL!
      const fixture = await open(page, baseUrl, state)
      const other = await secondPage(browser, device, baseUrl, state)
      try {
        const list = await sessionList(page)
        const otherList = await sessionList(other.page)
        await expect.poll(() => state.eventSockets.size).toBe(2)

        await list.getByRole('button', { name: /^Reviews,/ }).click()
        await expect(otherList.getByRole('button', { name: 'Reviews, 4 sessions' })).toHaveAttribute('aria-expanded', 'true')

        await otherList.getByRole('button', { name: 'Category actions for Plans' }).click()
        await other.page.getByRole('menuitem', { name: 'Move up' }).click()
        await expect(list.getByRole('region', { name: /^Category / }).first()).toHaveAttribute('aria-label', 'Category Plans')

        await otherList.getByRole('button', { name: 'Category actions for Reviews' }).click()
        await other.page.getByRole('menuitem', { name: 'Delete category…' }).click()
        const confirm = other.page.getByRole('dialog', { name: 'Delete category' })
        await expect(confirm).toContainText('Delete Reviews? Its 4 sessions stay, under their computers.')
        await confirm.getByRole('button', { name: 'Delete category' }).click()
        await expect(list.getByRole('region', { name: 'Category Reviews' })).toHaveCount(0)
        await expect(list.getByRole('region', { name: 'Studio', exact: true })
          .getByRole('button', { name: /^Review session recovery,/ })).toBeVisible()
        expect(state.sessionCategories.categories.map(({ id }) => id)).toEqual(['plans'])
      } finally {
        fixture.assertHealthy()
        other.fixture.assertHealthy()
        await other.context.close()
      }
    })
  })
}

test.describe('on a phone showing Knowledge', () => {
  test.use({ hasTouch: true, viewport: devices[0].viewport })

  test('still says a move made from the session actions while the list is out of sight', async ({ page }, testInfo) => {
    const state = categorizedState()
    const fixture = await setupWorkspaceFixture(page, { baseUrl: testInfo.project.use.baseURL!, knowledgeMode: 'docked', state })
    try {
      await page.goto(fixture.url)
      // A phone opens on the docked reader. Its files are the drawer's
      // Knowledge view, which stays the drawer's view back in the conversation.
      await page.getByRole('complementary', { name: 'Session knowledge' })
        .getByRole('button', { name: 'Back to files', exact: true }).click()
      await page.getByRole('button', { name: 'Close files', exact: true }).click()
      await page.getByRole('button', { name: 'Return to conversation', exact: true }).click()
      await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible()
      await expect(page.locator('.app-shell')).toHaveAttribute('data-sidebar-view', 'knowledge')

      await page.getByRole('button', { name: 'Session actions', exact: true }).click()
      await page.getByRole('group', { name: 'Session actions' }).getByRole('button', { name: 'Move to category…' }).click()
      await page.getByRole('dialog', { name: 'Move to category' }).getByRole('button', { name: 'Reviews', exact: true }).click()
      await expect.poll(() => state.sessionCategories.categories[0].sessions).toContain(studio(SELECTED_SESSION_ID))
      await expect(page.getByRole('status').filter({ hasText: 'Moved Plan the knowledge workspace to Reviews' }))
        .toHaveCount(1)
    } finally {
      fixture.assertHealthy()
    }
  })
})
