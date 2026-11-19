import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  BACKGROUND_SESSION_ID,
  createWorkspaceFixtureState,
  IDLE_SESSION_ID,
  PENDING_SESSION_ID,
  SELECTED_SESSION_ID,
  setupWorkspaceFixture,
  SUSPENDED_SESSION_ID,
  type WorkspaceFixtureOptions,
  type WorkspaceFixtureState,
} from './workspace-fixtures'

// A phone or touch screen gets the 40px targets; a desktop with a mouse keeps
// the small controls it reveals on hover.
const devices = [
  { name: 'phone', viewport: { width: 390, height: 844 }, hasTouch: true, target: 40 },
  { name: 'desktop', viewport: { width: 1440, height: 900 }, hasTouch: false, target: 22 },
]

const LONG_TITLE = 'Collect the unread review notes and the handbook drafts nobody has opened yet'

/**
 * Unread sessions of every kind: an ordinary idle one, one waiting on you, one
 * running background work, a suspended one, and a hidden one with a long title
 * and the For review badge. The open session starts unread too.
 */
function unreadState(): WorkspaceFixtureState {
  const state = createWorkspaceFixtureState()
  const draft = state.sessions.find((session) => session.id === IDLE_SESSION_ID)
  if (!draft) throw new Error('Expected the idle fixture session')
  const added = [
    { id: 'fixture-tidy-reading', title: 'Tidy the reading list' },
    {
      id: 'fixture-collect-notes',
      title: LONG_TITLE,
      provider: 'claude' as const,
      retention: { pinned: true },
    },
  ].map((change) => ({ ...structuredClone(draft), ...change }))
  state.sessions.push(...added)
  state.sessionOrder.order['fixture-studio'].push(
    ...added.map((session) => `fixture-studio:${session.id}`),
  )
  state.sessionOrder.hidden = ['fixture-studio:fixture-collect-notes']
  state.sessionOrder.unread = [
    `fixture-studio:${SELECTED_SESSION_ID}`,
    `fixture-studio:${IDLE_SESSION_ID}`,
    `fixture-studio:${PENDING_SESSION_ID}`,
    'fixture-studio:fixture-collect-notes',
    `fixture-build:${BACKGROUND_SESSION_ID}`,
    `fixture-travel:${SUSPENDED_SESSION_ID}`,
  ]
  return state
}

async function open(
  page: Page,
  baseUrl: string,
  phone: boolean,
  options: Pick<WorkspaceFixtureOptions, 'appearance'> & { state: WorkspaceFixtureState },
) {
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl,
    knowledgeMode: 'hidden',
    ...options,
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

/** A colour as the current theme resolves it, for a token or a row's own property. */
async function resolved(scope: Locator, value: string) {
  return scope.evaluate((element, colour) => {
    const probe = document.createElement('i')
    probe.style.color = colour
    element.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }, value)
}

async function bounds(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Expected a laid-out element')
  return box
}

async function overflow(locator: Locator) {
  return locator.evaluate((element) => element.scrollWidth - element.clientWidth)
}

async function screenshot(page: Page, name: string) {
  if (process.env.UNREAD_SESSIONS_SCREENSHOT) {
    await page.screenshot({
      animations: 'disabled',
      path: `${process.env.UNREAD_SESSIONS_SCREENSHOT}-${name}.png`,
    })
  }
}

for (const device of devices) {
  test.describe(`on a ${device.name}`, () => {
    test.use({ hasTouch: device.hasTouch, viewport: device.viewport })

    for (const appearance of ['graphite', 'light'] as const) {
      test(`sets unread rows apart in the ${appearance} theme without widening any row`, async ({ page }, testInfo) => {
        const state = unreadState()
        const { fixture, list } = await open(page, testInfo.project.use.baseURL!, device.name === 'phone', {
          appearance,
          state,
        })
        try {
          // Opening the app on a session reads it.
          const selected = row(list, 'Plan the knowledge workspace')
          await expect(selected).not.toHaveClass(/session-item--unread/)
          expect(state.sessionOrder.unread).not.toContain(`fixture-studio:${SELECTED_SESSION_ID}`)

          const unread = row(list, 'Draft the weekly summary')
          await expect(unread).toHaveClass(/session-item--unread/)
          await expect(unread.getByRole('button', { name: /^Draft the weekly summary,/ }))
            .toHaveAccessibleName(/^Draft the weekly summary, unread, /)
          await screenshot(page, `${device.name}-${appearance}-rows`)

          // A heavier title and an accent dot, in no warning, error, task or
          // computer colour; a read row has neither.
          const title = (item: Locator) => item.locator('.session-item__text > strong')
          expect(await title(unread).evaluate((element) => Number(getComputedStyle(element).fontWeight)))
            .toBeGreaterThan(await title(selected).evaluate((element) => Number(getComputedStyle(element).fontWeight)))
          const dot = unread.locator('.session-item__unread-dot')
          await expect(dot).toBeVisible()
          const dotColor = await dot.evaluate((element) => getComputedStyle(element).backgroundColor)
          expect(dotColor).toBe(await resolved(unread, 'var(--accent-foreground)'))
          for (const other of ['--warning', '--danger', '--task', '--computer-accent']) {
            expect(dotColor).not.toBe(await resolved(unread, `var(${other})`))
          }
          await expect(selected.locator('.session-item__unread-dot')).toHaveCount(0)

          // It combines with the attention, background-task and suspended cues.
          const waiting = row(list, 'Review session recovery')
          await expect(waiting).toHaveClass(/session-item--unread/)
          await expect(waiting.getByText('Question', { exact: true })).toBeVisible()
          const tasks = row(list, 'Check handbook links')
          await expect(tasks).toHaveClass(/session-item--background-running/)
          await expect(tasks.locator('.session-item__unread-dot')).toBeVisible()
          const paused = row(list, 'Sketch the next handoff')
          await expect(paused).toHaveClass(/session-item--suspended/)
          await expect(paused.locator('.session-item__unread-dot')).toBeVisible()

          // Close over Pause, then Read over Hide beside them: the row keeps
          // its height and nothing spills sideways.
          await unread.hover()
          const close = await bounds(unread.getByRole('button', { name: 'Close Draft the weekly summary' }))
          const pause = await bounds(unread.getByRole('button', { name: 'Suspend Draft the weekly summary' }))
          const markRead = unread.getByRole('button', { name: 'Mark Draft the weekly summary as read' })
          await expect(markRead).toHaveCSS('opacity', '1')
          const read = await bounds(markRead)
          const hide = await bounds(unread.getByRole('button', { name: 'Hide Draft the weekly summary from the list' }))
          const item = await bounds(unread)
          expect(Math.abs(read.y - close.y)).toBeLessThan(1)
          expect(Math.abs(hide.y - pause.y)).toBeLessThan(1)
          expect(Math.abs(read.x - hide.x)).toBeLessThan(1)
          expect(read.x).toBeGreaterThanOrEqual(close.x + close.width)
          expect(read.y + read.height).toBeLessThanOrEqual(hide.y)
          for (const control of [close, pause, read, hide]) {
            expect(control.width).toBeGreaterThanOrEqual(device.target)
            expect(control.height).toBeGreaterThanOrEqual(device.target)
            expect(control.x + control.width).toBeLessThanOrEqual(item.x + item.width)
          }
          for (const each of await list.locator('.session-item').all()) {
            expect(await overflow(each)).toBeLessThanOrEqual(0)
            expect(await overflow(each.locator('.session-item__badges'))).toBeLessThanOrEqual(0)
          }
          expect(await overflow(list.locator('.session-list__scroll'))).toBeLessThanOrEqual(0)
        } finally {
          fixture.assertHealthy()
        }
      })
    }

    test('marks sessions read and unread from the row, and keeps the open one unread when asked', async ({ page }, testInfo) => {
      const state = unreadState()
      const { fixture, list } = await open(page, testInfo.project.use.baseURL!, device.name === 'phone', {
        state,
      })
      try {
        const unread = row(list, 'Draft the weekly summary')
        await unread.hover()
        await unread.getByRole('button', { name: 'Mark Draft the weekly summary as read' }).click()
        await expect(unread).not.toHaveClass(/session-item--unread/)
        await expect(unread.locator('.session-item__unread-dot')).toHaveCount(0)
        await expect(unread.getByRole('button', { name: 'Mark Draft the weekly summary as unread' }))
          .toBeEnabled()
        expect(state.sessionOrder.unread).not.toContain(`fixture-studio:${IDLE_SESSION_ID}`)

        // The open session marked unread stays so while you keep looking.
        const selected = row(list, 'Plan the knowledge workspace')
        await selected.hover()
        await selected.getByRole('button', { name: 'Mark Plan the knowledge workspace as unread' }).click()
        await expect(selected).toHaveClass(/session-item--unread/)
        await expect(selected).toHaveClass(/session-item--active/)
        await screenshot(page, `${device.name}-marked-open`)
        await page.waitForTimeout(300)
        await expect(selected).toHaveClass(/session-item--unread/)
        expect(state.sessionOrder.unread).toContain(`fixture-studio:${SELECTED_SESSION_ID}`)

        // Opening it again reads it.
        await selected.getByRole('button', { name: /^Plan the knowledge workspace,/ }).click()
        if (device.name === 'phone') await page.getByRole('button', { name: 'Open sessions' }).click()
        await expect(selected).not.toHaveClass(/session-item--unread/)
        expect(state.sessionOrder.unread).not.toContain(`fixture-studio:${SELECTED_SESSION_ID}`)
      } finally {
        fixture.assertHealthy()
      }
    })

    test('filters unread sessions with their count, hidden ones only when included', async ({ page }, testInfo) => {
      const { fixture, list } = await open(page, testInfo.project.use.baseURL!, device.name === 'phone', {
        state: unreadState(),
      })
      try {
        const filters = list.getByRole('group', { name: 'Filter sessions' })
        const filter = filters.getByRole('button', { name: 'Unread' })
        // The open session was read on arrival and the hidden one is left out.
        await expect(filter).toHaveText(/Unread\s*4/)
        await filter.click()
        await expect(filter).toHaveAttribute('aria-pressed', 'true')
        await expect(row(list, 'Draft the weekly summary')).toBeVisible()
        await expect(row(list, 'Plan the knowledge workspace')).toHaveCount(0)
        await expect(row(list, 'Tidy the reading list')).toHaveCount(0)
        await expect(row(list, LONG_TITLE)).toHaveCount(0)
        for (const computer of ['Studio', 'Build node', 'Travel laptop']) {
          await expect(list.getByRole('region', { name: computer })).toBeVisible()
        }

        // The filter bar wraps rather than spilling over, with touch-sized chips on a phone.
        expect(await overflow(filters)).toBeLessThanOrEqual(0)
        expect(await overflow(list.locator('.session-list__controls'))).toBeLessThanOrEqual(0)
        if (device.name === 'phone') {
          for (const chip of await filters.getByRole('button').all()) {
            expect((await bounds(chip)).height).toBeGreaterThanOrEqual(device.target)
          }
        }
        await screenshot(page, `${device.name}-filter`)

        const hidden = list.getByRole('button', { name: 'Include hidden sessions' })
        await hidden.click()
        await expect(hidden).toHaveAttribute('aria-pressed', 'true')
        await expect(filter).toHaveText(/Unread\s*5/)
        await expect(row(list, LONG_TITLE)).toBeVisible()
        await expect(row(list, LONG_TITLE)).toHaveClass(/session-item--hidden/)
        await expect(row(list, LONG_TITLE)).toHaveClass(/session-item--unread/)
        for (const each of await list.locator('.session-item').all()) {
          expect(await overflow(each)).toBeLessThanOrEqual(0)
        }
        await screenshot(page, `${device.name}-filter-hidden`)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}
