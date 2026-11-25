import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  createWorkspaceFixtureState,
  IDLE_SESSION_ID,
  PENDING_SESSION_ID,
  SELECTED_SESSION_ID,
  setupWorkspaceFixture,
  type WorkspaceFixture,
  type WorkspaceFixtureState,
} from './workspace-fixtures'

type Point = { x: number; y: number }

const PLAN = 'Plan the knowledge workspace'
const REVIEW = 'Review session recovery'
const DRAFT = 'Draft the weekly summary'

const desktop = { viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false }
const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }

function studioLane(...ids: string[]) {
  return ids.map((id) => `fixture-studio:${id}`)
}

async function open(page: Page, baseUrl: string, onPhone: boolean, state = createWorkspaceFixtureState()) {
  const fixture = await setupWorkspaceFixture(page, { baseUrl, knowledgeMode: 'hidden', state })
  await page.goto(fixture.url)
  if (onPhone) await page.getByRole('button', { name: 'Open sessions', exact: true }).click()
  const list = page.getByRole('navigation', { name: 'Sessions', exact: true })
  await expect(list.locator('.session-item').first()).toBeVisible()
  return { fixture, list }
}

/** Enough sessions on Studio that the phone list has to scroll. */
function longListState(): WorkspaceFixtureState {
  const state = createWorkspaceFixtureState()
  const draft = state.sessions.find((session) => session.id === IDLE_SESSION_ID)
  if (!draft) throw new Error('Expected the idle fixture session')
  const added = ['Sort the archive notes', 'Tag the meeting summaries', 'Retire the old checklists',
    'Index the field photos', 'Merge the glossary drafts', 'Check the reading list']
    .map((title, index) => ({ ...structuredClone(draft), id: `fixture-extra-${index}`, title }))
  state.sessions.push(...added)
  state.sessionOrder.order['fixture-studio'].push(...studioLane(...added.map((session) => session.id)))
  return state
}

function row(list: Locator, title: string) {
  return list.locator('.session-item').filter({ has: list.page().getByText(title, { exact: true }) })
}

function titles(list: Locator, computer: string) {
  return list.getByRole('region', { name: computer, exact: true })
    .locator('.session-item__open strong').allTextContents()
}

function computerOrder(list: Locator) {
  return list.locator('.computer-session-group')
    .evaluateAll((groups) => groups.map((group) => group.getAttribute('aria-label')))
}

/** Every committed session-order lane, which is what a finished drag sends. */
function laneSaves(fixture: WorkspaceFixture) {
  return fixture.requests.filter((request) =>
    request.method === 'PUT' && /^\/api\/session-order\/[^/]+$/.test(request.path))
}

async function center(locator: Locator): Promise<Point> {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Expected a laid-out element')
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

/** Where to let go of a press on `grab` so that `item` lands where `target` is. */
async function dropOnto(grab: Locator, item: Locator, target: Locator): Promise<[Point, Point]> {
  const from = await center(grab)
  const shift = (await center(target)).y - (await center(item)).y
  return [from, { x: from.x, y: from.y + shift }]
}

async function mouseDrag(page: Page, from: Point, to: Point) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  // Past the few pixels that tell a drag from a click, then on to the target.
  await page.mouse.move(from.x, from.y + Math.sign(to.y - from.y) * 10, { steps: 5 })
  await page.mouse.move(to.x, to.y, { steps: 15 })
  await page.mouse.up()
}

/** A finger, sent through Chromium's own touch input so it can scroll and tap. */
async function touchscreen(page: Page) {
  const cdp = await page.context().newCDPSession(page)
  let at: Point = { x: 0, y: 0 }
  const send = (type: 'touchStart' | 'touchMove' | 'touchEnd', points: Point[]) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points })
  return {
    async down(point: Point) {
      at = point
      await send('touchStart', [point])
    },
    async move(to: Point, steps: number) {
      const from = at
      for (let step = 1; step <= steps; step += 1) {
        at = { x: from.x + (to.x - from.x) * step / steps, y: from.y + (to.y - from.y) * step / steps }
        await send('touchMove', [at])
      }
    },
    async up() {
      await send('touchEnd', [])
    },
  }
}

async function nextFrames(page: Page) {
  await page.evaluate(() => new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
}

async function screenshot(page: Page, name: string, area?: Locator) {
  if (process.env.SESSION_REORDER_SCREENSHOT) {
    await page.screenshot({
      animations: 'disabled',
      clip: area ? (await area.boundingBox()) ?? undefined : undefined,
      path: `${process.env.SESSION_REORDER_SCREENSHOT}-${name}.png`,
    })
  }
}

test.describe('reordering with a mouse', () => {
  test.use(desktop)

  test('drags a session from its title, while a click on it opens it', async ({ page, baseURL }) => {
    const state = createWorkspaceFixtureState()
    const { fixture, list } = await open(page, baseURL!, false, state)
    try {
      const draft = row(list, DRAFT)
      const [from, to] = await dropOnto(draft.getByText(DRAFT, { exact: true }), draft, row(list, PLAN))
      await page.mouse.move(from.x, from.y)
      await page.mouse.down()
      await page.mouse.move(from.x, from.y - 30, { steps: 5 })
      await expect(draft).toHaveClass(/sortable-dragging/)
      await screenshot(page, 'desktop-dragging', list)
      await page.mouse.move(to.x, to.y, { steps: 15 })
      await page.mouse.up()

      await expect.poll(() => titles(list, 'Studio')).toEqual([DRAFT, PLAN, REVIEW])
      await expect.poll(() => state.sessionOrder.order['fixture-studio'])
        .toEqual(studioLane(IDLE_SESSION_ID, SELECTED_SESSION_ID, PENDING_SESSION_ID))
      expect(laneSaves(fixture)).toEqual([{ method: 'PUT', path: '/api/session-order/fixture-studio' }])
      // Letting go of a drag opens nothing.
      await expect(page).toHaveURL(/session=fixture-plan-workspace/)

      await row(list, REVIEW).getByText(REVIEW, { exact: true }).click()
      await expect(page).toHaveURL(/session=fixture-review-recovery/)
      await expect(list.getByRole('button', { name: /^Review session recovery,/ }))
        .toHaveAttribute('aria-current', 'page')
      expect(laneSaves(fixture)).toHaveLength(1)
    } finally {
      fixture.assertHealthy()
    }
  })

  test('leaves a press on Close, Read, or Hide to that button', async ({ page, baseURL }) => {
    const { fixture, list } = await open(page, baseURL!, false)
    try {
      const draft = row(list, DRAFT)
      await draft.hover()
      for (const name of [`Close ${DRAFT}`, `Mark ${DRAFT} as unread`, `Hide ${DRAFT} from the list`]) {
        const at = await center(draft.getByRole('button', { name, exact: true }))
        await page.mouse.move(at.x, at.y)
        await page.mouse.down()
        await page.mouse.move(at.x, at.y - 150, { steps: 10 })
        await expect(list.locator('.sortable-dragging')).toHaveCount(0)
        await page.mouse.up()
      }
      expect(await titles(list, 'Studio')).toEqual([PLAN, REVIEW, DRAFT])
      expect(laneSaves(fixture)).toEqual([])
    } finally {
      fixture.assertHealthy()
    }
  })

  test('gives the grip’s room to the title and keeps a keyboard handle that reorders', async ({ page, baseURL }) => {
    const state = createWorkspaceFixtureState()
    const { fixture, list } = await open(page, baseURL!, false, state)
    try {
      const plan = row(list, PLAN)
      const inset = await plan.evaluate((element) => {
        const text = element.querySelector('.session-item__text')
        if (!text) throw new Error('Expected the row text')
        return text.getBoundingClientRect().left - element.getBoundingClientRect().left
      })
      // Only the row's edge bar and padding come before its text.
      expect(inset).toBeLessThanOrEqual(10)
      const studio = list.getByRole('region', { name: 'Studio', exact: true })
      const header = studio.locator('.computer-session-group__header')
      const status = studio.locator('.computer-session-group__status')
      expect((await status.boundingBox())!.x - (await header.boundingBox())!.x).toBeLessThanOrEqual(8)

      const studioHandle = list.getByRole('button', { name: 'Reorder Studio', exact: true })
      const planHandle = list.getByRole('button', { name: `Reorder ${PLAN}`, exact: true })
      for (const handle of [studioHandle, planHandle]) {
        expect((await handle.boundingBox())?.width ?? 0).toBeLessThanOrEqual(1)
      }
      // The keyboard reaches each handle, which only then shows.
      await list.getByRole('button', { name: 'Unread', exact: true }).focus()
      await page.keyboard.press('Tab')
      await expect(studioHandle).toBeFocused()
      expect((await studioHandle.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(16)
      await page.keyboard.press('Tab')
      await expect(planHandle).toBeFocused()
      expect((await planHandle.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(16)
      expect((await studioHandle.boundingBox())?.width ?? 0).toBeLessThanOrEqual(1)
      await screenshot(page, 'desktop-keyboard-handle', list)

      await page.keyboard.press('Space')
      await expect(plan).toHaveClass(/sortable-dragging/)
      await nextFrames(page)
      await page.keyboard.press('ArrowDown')
      await expect(page.getByRole('status').filter({ hasText: 'was moved over' }))
        .toContainText(`session:fixture-studio:${PENDING_SESSION_ID}`)
      await page.keyboard.press('Space')
      await expect.poll(() => titles(list, 'Studio')).toEqual([REVIEW, PLAN, DRAFT])
      await expect.poll(() => state.sessionOrder.order['fixture-studio'])
        .toEqual(studioLane(PENDING_SESSION_ID, SELECTED_SESSION_ID, IDLE_SESSION_ID))
      await expect(planHandle).toBeFocused()

      // Enter and Space on a row open it rather than pick it up.
      await page.keyboard.press('Tab')
      await expect(list.getByRole('button', { name: /^Plan the knowledge workspace,/ })).toBeFocused()
      await list.getByRole('button', { name: /^Review session recovery,/ }).focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/session=fixture-review-recovery/)
      await list.getByRole('button', { name: /^Draft the weekly summary,/ }).focus()
      await page.keyboard.press('Space')
      await expect(page).toHaveURL(/session=fixture-draft-summary/)
      await expect(list.locator('.sortable-dragging')).toHaveCount(0)
      expect(laneSaves(fixture)).toHaveLength(1)
    } finally {
      fixture.assertHealthy()
    }
  })

  test('drags a computer from anywhere on its header', async ({ page, baseURL }) => {
    const state = createWorkspaceFixtureState()
    const { fixture, list } = await open(page, baseURL!, false, state)
    try {
      const build = list.getByRole('region', { name: 'Build node', exact: true })
      const studio = list.getByRole('region', { name: 'Studio', exact: true })
      const [from, to] = await dropOnto(build.locator('.computer-session-group__header strong'), build, studio)
      await mouseDrag(page, from, to)
      await expect.poll(() => computerOrder(list)).toEqual(['Build node', 'Studio', 'Travel laptop'])
      await expect.poll(() => state.settings.values.computerOrder)
        .toEqual(['fixture-build', 'fixture-studio', 'fixture-travel'])
      await expect(page).toHaveURL(/session=fixture-plan-workspace/)
    } finally {
      fixture.assertHealthy()
    }
  })
})

test.describe('reordering on a phone', () => {
  test.use(phone)

  test('picks a session up after a long press and drops it in place', async ({ page, baseURL }) => {
    const state = createWorkspaceFixtureState()
    const { fixture, list } = await open(page, baseURL!, true, state)
    try {
      const touch = await touchscreen(page)
      const draft = row(list, DRAFT)
      const [from, to] = await dropOnto(draft.getByText(DRAFT, { exact: true }), draft, row(list, PLAN))
      await touch.down(from)
      await page.waitForTimeout(400)
      await expect(draft).toHaveClass(/sortable-dragging/)
      await touch.move({ x: from.x, y: from.y - 30 }, 3)
      await screenshot(page, 'phone-dragging', list)
      await touch.move(to, 12)
      await touch.up()

      await expect.poll(() => titles(list, 'Studio')).toEqual([DRAFT, PLAN, REVIEW])
      await expect.poll(() => state.sessionOrder.order['fixture-studio'])
        .toEqual(studioLane(IDLE_SESSION_ID, SELECTED_SESSION_ID, PENDING_SESSION_ID))
      // The list stays open on the session that was already open.
      await expect(list).toBeInViewport()
      await expect(page).toHaveURL(/session=fixture-plan-workspace/)
    } finally {
      fixture.assertHealthy()
    }
  })

  test('opens a session on a tap', async ({ page, baseURL }) => {
    const { fixture, list } = await open(page, baseURL!, true)
    try {
      await row(list, REVIEW).getByText(REVIEW, { exact: true }).tap()
      await expect(page).toHaveURL(/session=fixture-review-recovery/)
      expect(laneSaves(fixture)).toEqual([])
    } finally {
      fixture.assertHealthy()
    }
  })

  test('scrolls the list on a swipe across the rows', async ({ page, baseURL }) => {
    const { fixture, list } = await open(page, baseURL!, true, longListState())
    try {
      const scroller = list.locator('.session-list__scroll')
      expect(await scroller.evaluate((element) => element.scrollHeight - element.clientHeight))
        .toBeGreaterThan(300)
      const touch = await touchscreen(page)
      const from = await center(row(list, REVIEW).getByText(REVIEW, { exact: true }))
      await touch.down(from)
      await touch.move({ x: from.x, y: from.y - 260 }, 10)
      await touch.up()

      await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(100)
      await expect(list.locator('.sortable-dragging')).toHaveCount(0)
      expect(laneSaves(fixture)).toEqual([])
      await expect(page).toHaveURL(/session=fixture-plan-workspace/)
    } finally {
      fixture.assertHealthy()
    }
  })

  test('picks a computer up after a long press on its header', async ({ page, baseURL }) => {
    const state = createWorkspaceFixtureState()
    const { fixture, list } = await open(page, baseURL!, true, state)
    try {
      const touch = await touchscreen(page)
      const build = list.getByRole('region', { name: 'Build node', exact: true })
      const studio = list.getByRole('region', { name: 'Studio', exact: true })
      const [from, to] = await dropOnto(build.locator('.computer-session-group__header strong'), build, studio)
      await touch.down(from)
      await page.waitForTimeout(400)
      await expect(build).toHaveClass(/sortable-dragging/)
      await touch.move(to, 15)
      await touch.up()
      await expect.poll(() => computerOrder(list)).toEqual(['Build node', 'Studio', 'Travel laptop'])
    } finally {
      fixture.assertHealthy()
    }
  })
})
