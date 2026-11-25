import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  BACKGROUND_SESSION_ID,
  createWorkspaceFixtureState,
  fixtureBackgroundTasks,
  IDLE_SESSION_ID,
  PENDING_SESSION_ID,
  SELECTED_SESSION_ID,
  OFFLINE_SESSION_ID,
  setupWorkspaceFixture,
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
 * running background work, one on an offline computer, and a hidden one with a
 * long title and the For review badge. The open session starts unread too.
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
    `fixture-travel:${OFFLINE_SESSION_ID}`,
  ]
  return state
}

const AUDIT_TITLE = 'Audit the release links'

/**
 * The unread fixture with Hidden showing the hidden unread session, and two
 * read sessions running background work on Build node: Check handbook links
 * idle in the foreground, and Audit the release links working.
 */
function edgeState(): WorkspaceFixtureState {
  const state = unreadState()
  const tasks = state.sessions.find((session) => session.id === BACKGROUND_SESSION_ID)
  if (!tasks) throw new Error('Expected the background fixture session')
  const audit = { ...structuredClone(tasks), id: 'fixture-audit-links', title: AUDIT_TITLE, status: 'running' as const }
  state.sessions.push(audit)
  state.sessionOrder.order['fixture-build'].push(`fixture-build:${audit.id}`)
  state.sessionOrder.unread = (state.sessionOrder.unread ?? []).filter(
    (key) => key !== `fixture-build:${BACKGROUND_SESSION_ID}`,
  )
  state.sessionOrder.showHidden = true
  return state
}

async function open(
  page: Page,
  baseUrl: string,
  phone: boolean,
  options: Pick<WorkspaceFixtureOptions, 'appearance' | 'taskSnapshots'> & { state: WorkspaceFixtureState },
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

/** Each side's computed border, and the row's own background. */
async function edges(item: Locator) {
  return item.evaluate((element) => {
    const style = getComputedStyle(element)
    const side = (name: string) => ({
      width: style.getPropertyValue(`border-${name}-width`),
      style: style.getPropertyValue(`border-${name}-style`),
      color: style.getPropertyValue(`border-${name}-color`),
    })
    return {
      top: side('top'),
      right: side('right'),
      bottom: side('bottom'),
      left: side('left'),
      background: style.backgroundColor,
    }
  })
}

const NONE = 'rgba(0, 0, 0, 0)'

function bar(color: string) {
  return { width: '3px', style: 'solid', color }
}

/** Where a row's content sits inside it, so a cue that pushes text aside shows. */
async function inset(item: Locator) {
  return item.evaluate((element) => {
    const row = element.getBoundingClientRect()
    const box = (selector: string) => {
      const found = element.querySelector(selector)
      if (!found) throw new Error(`No ${selector} in the row`)
      return found.getBoundingClientRect()
    }
    return {
      handle: box('.drag-handle').left - row.left,
      text: box('.session-item__text').left - row.left,
      folder: box('.session-item__cwd').left - row.left,
      time: row.right - box('.session-item__time').right,
      controls: row.right - box('.session-item__controls').right,
    }
  })
}

/**
 * WCAG contrast of a colour against everything painted behind it at this
 * element: its own background over every ancestor's.
 */
async function contrast(scope: Locator, colour: string) {
  return scope.evaluate((element, foreground) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('No canvas context')
    const luminance = () => {
      const [r, g, b] = Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3)).map((value) => {
        const channel = value / 255
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const layers: Element[] = []
    for (let node: Element | null = element; node; node = node.parentElement) layers.unshift(node)
    for (const layer of layers) {
      context.fillStyle = getComputedStyle(layer).backgroundColor
      context.fillRect(0, 0, 1, 1)
    }
    const behind = luminance()
    context.fillStyle = foreground
    context.fillRect(0, 0, 1, 1)
    const front = luminance()
    return (Math.max(behind, front) + 0.05) / (Math.min(behind, front) + 0.05)
  }, colour)
}

async function screenshot(page: Page, name: string, area?: Locator) {
  if (process.env.UNREAD_SESSIONS_SCREENSHOT) {
    await page.screenshot({
      animations: 'disabled',
      clip: area ? await bounds(area) : undefined,
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

          // It combines with the attention, background-task and offline cues.
          const waiting = row(list, 'Review session recovery')
          await expect(waiting).toHaveClass(/session-item--unread/)
          await expect(waiting.getByText('Question', { exact: true })).toBeVisible()
          const tasks = row(list, 'Check handbook links')
          await expect(tasks).toHaveClass(/session-item--background-running/)
          await expect(tasks.locator('.session-item__unread-dot')).toBeVisible()
          const offline = row(list, 'Sketch the next handoff')
          await expect(offline.getByText('Offline', { exact: true })).toBeVisible()
          await expect(offline.locator('.session-item__unread-dot')).toBeVisible()

          // Close, Hide, then Read, in one column with a mouse and with Close
          // beside Hide over Read on a touch screen: the row keeps its height
          // and nothing spills sideways.
          await unread.hover()
          const close = await bounds(unread.getByRole('button', { name: 'Close Draft the weekly summary' }))
          const markRead = unread.getByRole('button', { name: 'Mark Draft the weekly summary as read' })
          await expect(markRead).toHaveCSS('opacity', '1')
          const read = await bounds(markRead)
          const hide = await bounds(unread.getByRole('button', { name: 'Hide Draft the weekly summary from the list' }))
          const item = await bounds(unread)
          if (device.hasTouch) {
            expect(hide.x).toBeGreaterThanOrEqual(close.x + close.width)
            expect(Math.abs(read.x - hide.x)).toBeLessThan(1)
            expect(close.y).toBeGreaterThanOrEqual(hide.y)
            expect(close.y + close.height).toBeLessThanOrEqual(read.y + read.height)
          } else {
            expect(Math.abs(hide.x - close.x)).toBeLessThan(1)
            expect(Math.abs(read.x - close.x)).toBeLessThan(1)
            expect(close.y + close.height).toBeLessThanOrEqual(hide.y)
          }
          expect(hide.y + hide.height).toBeLessThanOrEqual(read.y)
          for (const control of [close, read, hide]) {
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

    for (const appearance of ['graphite', 'light'] as const) {
      test(`bars unread and open rows on both sides without moving their text in the ${appearance} theme`, async ({ page }, testInfo) => {
        const { fixture, list } = await open(page, testInfo.project.use.baseURL!, device.name === 'phone', {
          appearance,
          state: edgeState(),
        })
        try {
          const ordinary = row(list, 'Tidy the reading list')
          const unread = row(list, 'Draft the weekly summary')
          const selected = row(list, 'Plan the knowledge workspace')
          const hidden = row(list, LONG_TITLE)
          await expect(selected).toHaveClass(/session-item--active/)
          await expect(hidden).toHaveClass(/session-item--hidden/)
          await expect(hidden).toHaveClass(/session-item--unread/)
          await screenshot(page, `${device.name}-${appearance}-edges`, device.name === 'desktop' ? list : undefined)

          const dot = await unread.locator('.session-item__unread-dot').evaluate(
            (element) => getComputedStyle(element).backgroundColor,
          )
          expect(dot).toBe(await resolved(unread, 'var(--accent-foreground)'))
          const text = await resolved(selected, 'var(--text)')
          const outline = await resolved(list, 'var(--border-strong)')
          const plain = await edges(ordinary)
          for (const side of [plain.top, plain.right, plain.bottom, plain.left]) expect(side.color).toBe(NONE)

          // Unread: a bar on each side in the dot's own colour, and no tint.
          const marked = await edges(unread)
          expect(marked.left).toEqual(bar(dot))
          expect(marked.right).toEqual(bar(dot))
          expect([marked.top.color, marked.bottom.color]).toEqual([NONE, NONE])
          expect(marked.background).toBe(plain.background)

          // Open: the same bars in the text colour whatever the computer, on its tint.
          const current = await edges(selected)
          expect(current.left).toEqual(bar(text))
          expect(current.right).toEqual(bar(text))
          expect(current.left.color).not.toBe(await resolved(selected, 'var(--computer-accent)'))
          expect(current.background).not.toBe(plain.background)

          // Hidden and unread: the bars take the place of the side dashes.
          const listed = await edges(hidden)
          expect(listed.left).toEqual(bar(dot))
          expect(listed.right).toEqual(bar(dot))
          expect(listed.top).toEqual({ width: '1px', style: 'dashed', color: outline })
          expect(listed.bottom).toEqual({ width: '1px', style: 'dashed', color: outline })

          // Readable against the row and against the list around it.
          for (const [item, colour] of [[unread, dot], [selected, text], [hidden, dot]] as const) {
            expect(await contrast(item, colour)).toBeGreaterThanOrEqual(3)
            expect(await contrast(item.locator('..'), colour)).toBeGreaterThanOrEqual(3)
          }

          // Every row keeps room for the bars, so nothing moves between states.
          const place = await inset(ordinary)
          for (const item of [unread, selected, hidden]) expect(await inset(item)).toEqual(place)

          // Marked unread while open, it keeps the open bars; the dot and the
          // bold title still say unread.
          await selected.hover()
          await selected.getByRole('button', { name: 'Mark Plan the knowledge workspace as unread' }).click()
          await expect(selected).toHaveClass(/session-item--unread/)
          await expect(selected).toHaveClass(/session-item--active/)
          await expect(selected.locator('.session-item__unread-dot')).toHaveCSS('background-color', dot)
          await expect(selected.locator('.session-item__text > strong')).toHaveCSS('font-weight', '700')
          const both = await edges(selected)
          expect(both.left).toEqual(bar(text))
          expect(both.right).toEqual(bar(text))
          expect(await inset(selected)).toEqual(place)
          await page.mouse.move(0, 0)
          await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
          await screenshot(page, `${device.name}-${appearance}-edges-open-unread`, device.name === 'desktop' ? list : undefined)

          for (const each of await list.locator('.session-item').all()) {
            expect(await overflow(each)).toBeLessThanOrEqual(0)
            expect(await overflow(each.locator('.session-item__badges'))).toBeLessThanOrEqual(0)
          }
          expect(await overflow(list.locator('.session-list__scroll'))).toBeLessThanOrEqual(0)
        } finally {
          fixture.assertHealthy()
        }
      })

      test(`leaves rows running background work to their quiet Tasks label in the ${appearance} theme`, async ({ page }, testInfo) => {
        const { fixture, list } = await open(page, testInfo.project.use.baseURL!, device.name === 'phone', {
          appearance,
          state: edgeState(),
          taskSnapshots: { 'fixture-build:fixture-audit-links': fixtureBackgroundTasks[BACKGROUND_SESSION_ID] },
        })
        try {
          const ordinary = row(list, 'Tidy the reading list')
          const idle = row(list, 'Check handbook links')
          const working = row(list, AUDIT_TITLE)
          await expect(working.locator('.session-state--running')).toHaveText('Working')
          for (const item of [idle, working]) {
            await expect(item).toHaveClass(/session-item--background-running/)
            await expect(item).not.toHaveClass(/session-item--unread/)
          }
          await working.scrollIntoViewIfNeeded()
          await screenshot(page, `${device.name}-${appearance}-tasks`, device.name === 'desktop' ? list : undefined)

          const task = await resolved(list, 'var(--task)')
          const plain = await edges(ordinary)
          const place = await inset(ordinary)
          for (const [item, title] of [[idle, 'Check handbook links'], [working, AUDIT_TITLE]] as const) {
            // No edge and no tint: at rest it is framed like any read row.
            expect(await edges(item)).toEqual(plain)
            expect(await inset(item)).toEqual(place)

            // The Tasks label is the one task cue: blue text and dot, no fill.
            const action = item.getByRole('button', { name: `View background tasks for ${title}` })
            await expect(action).toHaveText('Tasks')
            await expect(action).toHaveCSS('background-color', NONE)
            await expect(action).toHaveCSS('color', task)
            await expect(action.locator('.status-dot')).toHaveCSS('background-color', task)
            expect(await contrast(action, task)).toBeGreaterThanOrEqual(4.5)
            const target = await bounds(action)
            expect(target.width).toBeGreaterThanOrEqual(device.target)
            expect(target.height).toBeGreaterThanOrEqual(device.target)
          }

          // Working in the foreground, the status dot keeps the Working colour.
          const status = working.locator('.session-state--running')
          const statusDot = await status.locator('.status-dot').evaluate(
            (element) => getComputedStyle(element).backgroundColor,
          )
          expect(statusDot).toBe(await status.evaluate((element) => getComputedStyle(element).color))
          expect(statusDot).not.toBe(task)

          // Pointing at the label or reaching it from the keyboard fills it.
          const action = working.getByRole('button', { name: `View background tasks for ${AUDIT_TITLE}` })
          await action.hover()
          await expect(action).not.toHaveCSS('background-color', NONE)
          await page.mouse.move(0, 0)
          await expect(action).toHaveCSS('background-color', NONE)
          await working.getByRole('button', { name: new RegExp(`^${AUDIT_TITLE},`) }).focus()
          await page.keyboard.press('Tab')
          await expect(action).toBeFocused()
          await expect(action).not.toHaveCSS('background-color', NONE)
          await expect(action).toHaveCSS('outline-style', 'solid')

          for (const each of await list.locator('.session-item').all()) {
            expect(await overflow(each)).toBeLessThanOrEqual(0)
          }
          expect(await overflow(list.locator('.session-list__scroll'))).toBeLessThanOrEqual(0)

          await page.keyboard.press('Enter')
          await expect(page.getByRole('dialog', { name: /^Background tasks/ })).toBeVisible()
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
