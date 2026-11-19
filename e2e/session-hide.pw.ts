import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  BACKGROUND_SESSION_ID,
  createWorkspaceFixtureState,
  IDLE_SESSION_ID,
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

const LONG_TITLE = 'Park the archive cleanup and the retired handbook drafts until the next review'

async function open(
  page: Page,
  baseUrl: string,
  phone: boolean,
  options: Pick<WorkspaceFixtureOptions, 'appearance' | 'state'> = {},
) {
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl,
    knowledgeMode: 'hidden',
    state: createWorkspaceFixtureState(),
    ...options,
  })
  await page.goto(fixture.url)
  if (phone) await page.getByRole('button', { name: 'Open sessions' }).click()
  const list = page.getByRole('navigation', { name: 'Sessions' })
  await expect(list.locator('.session-item').first()).toBeVisible()
  return { fixture, list }
}

/**
 * Hidden sessions shown beside ordinary and suspended ones on Studio: one
 * hidden, one suspended, and one both, whose long title comes with the For
 * review badge as well. Check handbook links, which runs background work, is
 * hidden too.
 */
function markedState(): WorkspaceFixtureState {
  const state = createWorkspaceFixtureState()
  const draft = state.sessions.find((session) => session.id === IDLE_SESSION_ID)
  if (!draft) throw new Error('Expected the idle fixture session')
  const added = [
    { id: 'fixture-tidy-reading', title: 'Tidy the reading list' },
    { id: 'fixture-pause-export', title: 'Pause the export audit', suspended: true },
    {
      id: 'fixture-park-archive',
      title: LONG_TITLE,
      provider: 'claude' as const,
      suspended: true,
      retention: { pinned: true },
    },
  ].map((change) => ({ ...structuredClone(draft), ...change }))
  state.sessions.push(...added)
  state.sessionOrder.order['fixture-studio'].push(
    ...added.map((session) => `fixture-studio:${session.id}`),
  )
  state.sessionOrder.hidden = [
    'fixture-studio:fixture-tidy-reading',
    'fixture-studio:fixture-park-archive',
    `fixture-build:${BACKGROUND_SESSION_ID}`,
  ]
  state.sessionOrder.showHidden = true
  return state
}

function row(list: Locator, title: string) {
  return list.locator('.session-item').filter({ has: list.page().getByText(title, { exact: true }) })
}

/** Each side's computed border width, style and colour, top first, and the row's opacity. */
async function edges(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element)
    const sides = ['top', 'right', 'bottom', 'left']
    return {
      widths: sides.map((side) => style.getPropertyValue(`border-${side}-width`)),
      styles: sides.map((side) => style.getPropertyValue(`border-${side}-style`)),
      colors: sides.map((side) => style.getPropertyValue(`border-${side}-color`)),
      opacity: Number(style.opacity),
    }
  })
}

/** How far a row's text and activity time sit from its own edges. */
async function inset(locator: Locator) {
  return locator.evaluate((element) => {
    const row = element.getBoundingClientRect()
    const text = element.querySelector('.session-item__text')?.getBoundingClientRect()
    const time = element.querySelector('.session-item__time')?.getBoundingClientRect()
    if (!text || !time) throw new Error('Expected a session row')
    return { text: text.left - row.left, time: row.right - time.right }
  })
}

/** A colour token as the current theme resolves it. */
async function token(page: Page, name: string) {
  return page.evaluate((property) => {
    const probe = document.createElement('i')
    probe.style.color = `var(${property})`
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }, name)
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
        await expect(waiting).toHaveCSS('border-top-style', 'dashed')
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
        await expect(shown).not.toHaveCSS('border-top-style', 'dashed')
        await expect(toggle).toHaveText(/Hidden\s*1/)
      } finally {
        fixture.assertHealthy()
      }
    })

    for (const appearance of ['graphite', 'light'] as const) {
      test(`outlines hidden rows unlike ordinary and suspended ones in the ${appearance} theme`, async ({ page }, testInfo) => {
        const { fixture, list } = await open(page, testInfo.project.use.baseURL!, device.name === 'phone', {
          appearance,
          state: markedState(),
        })
        try {
          const outline = await token(page, '--border-strong')
          const ordinary = row(list, 'Draft the weekly summary')
          const hidden = row(list, 'Tidy the reading list')
          const suspended = row(list, 'Pause the export audit')
          const both = row(list, LONG_TITLE)
          const tasks = row(list, 'Check handbook links')
          await expect(tasks.getByRole('button', { name: 'View background tasks for Check handbook links' }))
            .toBeVisible()
          await screenshot(page, `${device.name}-${appearance}-marked`)

          // Dashed all round in the neutral border colour, at full strength,
          // and tagged with an icon as well as the word.
          const dashed = {
            widths: ['1px', '1px', '1px', '1px'],
            styles: ['dashed', 'dashed', 'dashed', 'dashed'],
            colors: [outline, outline, outline, outline],
          }
          expect(await edges(hidden)).toEqual({ ...dashed, opacity: 1 })
          await expect(hidden.locator('.session-hidden-badge svg')).toBeVisible()
          await expect(hidden.getByText('Hidden', { exact: true })).toBeVisible()

          // Ordinary rows have no outline; suspended ones are faded instead.
          const plain = await edges(ordinary)
          expect(plain.styles).not.toContain('dashed')
          expect(plain.opacity).toBe(1)
          const paused = await edges(suspended)
          expect(paused.styles).not.toContain('dashed')
          expect(paused.opacity).toBeLessThan(1)

          // Hidden and suspended carries both cues and both labels.
          const marked = await edges(both)
          expect(marked.styles).toEqual(['dashed', 'dashed', 'dashed', 'dashed'])
          expect(marked.opacity).toBeLessThan(1)
          await expect(both.getByText('Hidden', { exact: true })).toBeVisible()
          await expect(both.getByText('Suspended', { exact: true })).toBeVisible()

          // Background work adds no edge of its own.
          expect(await edges(tasks)).toEqual({ ...dashed, opacity: 1 })

          // The open session keeps its bars once it is hidden too: they take
          // the place of the side dashes, and the top and bottom stay dashed.
          const selected = row(list, 'Plan the knowledge workspace')
          await selected.hover()
          await selected.getByRole('button', { name: 'Hide Plan the knowledge workspace from the list' })
            .click()
          await expect(selected).toHaveCSS('border-top-style', 'dashed')
          const text = await token(page, '--text')
          expect(await edges(selected)).toEqual({
            widths: ['1px', '3px', '1px', '3px'],
            styles: ['dashed', 'solid', 'dashed', 'solid'],
            colors: [outline, text, outline, text],
            opacity: 1,
          })

          // The outline keeps the text where it is on an ordinary row.
          const place = await inset(ordinary)
          for (const item of [hidden, suspended, both, tasks, selected]) {
            expect(await inset(item)).toEqual(place)
          }

          // Nothing spills sideways, the long title with all its badges included.
          for (const item of await list.locator('.session-item').all()) {
            expect(await item.evaluate((element) => element.scrollWidth - element.clientWidth))
              .toBeLessThanOrEqual(0)
            expect(await item.locator('.session-item__badges').evaluate(
              (element) => element.scrollWidth - element.clientWidth,
            )).toBeLessThanOrEqual(0)
          }
          expect(await list.locator('.session-list__scroll').evaluate(
            (element) => element.scrollWidth - element.clientWidth,
          )).toBeLessThanOrEqual(0)
        } finally {
          fixture.assertHealthy()
        }
      })
    }
  })
}
