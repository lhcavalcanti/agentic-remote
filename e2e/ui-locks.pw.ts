import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  assertMousePointer,
  assertNoHorizontalOverflow,
  createUIScenes,
  uiContextOptions,
  uiSceneNames,
  uiViewports,
  type UISceneHandle,
  type UISceneName,
} from './ui-scenes'
import {
  BACKGROUND_SESSION_ID,
  FIXTURE_NOW,
  IDLE_SESSION_ID,
  KNOWLEDGE_DOCUMENT_TITLE,
  KNOWLEDGE_ROOT_ID,
  SELECTED_SESSION_ID,
  createWorkspaceFixtureState,
  fixtureActivityDetails,
  fixtureActivityMessages,
  fixtureBackgroundTasks,
  setupWorkspaceFixture,
} from './workspace-fixtures'
import { scheduleSchema, scheduleRunSchema } from '../shared/schedules'

test.use(uiContextOptions)

const lockedScreenshot = {
  // Rounded-corner compositing can vary by one RGB level in Chromium.
  animations: 'disabled', caret: 'hide', maxDiffPixels: 0, threshold: 0.01,
} as const

for (const viewport of uiViewports.filter((entry) => entry.name === 'desktop' || entry.name === 'phone')) {
  test.describe(`schedule abandonment ${viewport.name}`, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
    test('confirms uncertain schedule abandonment without claiming provider termination', async ({ page, baseURL }) => {
      const state = createWorkspaceFixtureState()
      state.settings.values = { previewFeatures: { schedulerView: true, desktopRail: true } }
      state.settings.revision = 1
      const schedule = scheduleSchema.parse({
        id: 'uncertain-review', name: 'Fictional recovery review', prompt: 'Review fictional notes.',
        target: { computerId: 'fixture-studio', folder: '/home/demo/field-notes', provider: 'copilot' },
        recurrence: { type: 'daily', time: '09:00' }, timezone: 'UTC', workspace: 'checkout',
        overlap: 'skip', catchUp: 'skip', maxRuntimeMin: 60, notify: 'attention', enabled: false,
        archived: false, revision: 1, createdBy: 'user', createdAt: FIXTURE_NOW, updatedAt: FIXTURE_NOW,
      })
      const run = scheduleRunSchema.parse({
        id: 'uncertain-review-run', scheduleId: schedule.id, launchId: 'uncertain-review-launch',
        computerId: 'fixture-studio', occurrenceAt: FIXTURE_NOW, trigger: 'manual',
        status: 'launching', outcomeUnknown: true, error: 'The owning computer cannot confirm this launch.',
      })
      const fixture = await setupWorkspaceFixture(page, {
        baseUrl: baseURL!, state, knowledgeMode: 'hidden', scheduler: { schedules: [schedule], runs: [run] },
      })
      try {
        const url = new URL(fixture.url)
        url.searchParams.set('schedule', schedule.id)
        url.searchParams.set('run', run.id)
        await page.goto(url.href)
        const scheduler = page.getByRole('dialog', { name: 'Scheduler', exact: true })
        await scheduler.getByRole('button', { name: 'Abandon run', exact: true }).click()
        await expect(scheduler.getByRole('button', { name: 'Confirm abandon run', exact: true })).toBeDisabled()
        await expect(scheduler.getByRole('alert')).toContainText('does not stop provider work')
        expect(fixture.requests.filter((request) => request.path.endsWith('/abandon'))).toEqual([])
        if (viewport.name === 'phone') {
          await page.setViewportSize({ width: 320, height: 844 })
          await expect(async () => { await assertNoHorizontalOverflow(page) }).toPass({ timeout: 5000 })
          await page.setViewportSize(viewport.viewport)
        }
        await scheduler.getByRole('group', { name: 'Abandon this run?' }).scrollIntoViewIfNeeded()
        await expect(scheduler.getByRole('button', { name: 'Confirm abandon run', exact: true })).toBeInViewport()
        await expect(scheduler).toHaveScreenshot(`scheduler-abandon-${viewport.name}.png`)
        await scheduler.getByRole('button', { name: 'Keep run', exact: true }).click()
        expect(fixture.requests.filter((request) => request.path.endsWith('/abandon'))).toEqual([])
        await scheduler.getByRole('button', { name: 'Abandon run', exact: true }).click()
        await scheduler.getByRole('checkbox', { name: 'I understand work may still be running.', exact: true }).check()
        const submitted = page.waitForRequest((request) => new URL(request.url()).pathname.endsWith('/abandon') && request.method() === 'POST')
        await scheduler.getByRole('button', { name: 'Confirm abandon run', exact: true }).click()
        expect((await submitted).postDataJSON()).toEqual({ confirm: true })
        await expect(scheduler.getByRole('region', { name: `Run history for ${schedule.name}` })).toContainText('abandoned')
        await expect(scheduler.getByRole('button', { name: 'Abandon run', exact: true })).toHaveCount(0)
        await assertNoHorizontalOverflow(page)
      } finally { fixture.assertHealthy() }
    })
  })
}

test('native shell receives one canonical scheduled outcome without enabling scheduler preview', async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    const notifications: unknown[] = []
    Object.assign(window, {
      fixtureScheduleNotifications: notifications,
      __AGENTIC_SHELL__: { version: 1, notify: (notification: unknown) => notifications.push(notification) },
    })
  })
  const state = createWorkspaceFixtureState()
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl: baseURL!, state, knowledgeMode: 'hidden', scheduler: { schedules: [], runs: [] }, notifications: [],
  })
  try {
    await page.goto(fixture.url)
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible()
    await expect.poll(() => state.eventSockets.size).toBeGreaterThan(0)
    const event = {
      type: 'schedule.run.notification' as const,
      notification: { id: 'a'.repeat(64), kind: 'schedule.run.failed' as const, severity: 'error' as const,
        computerId: 'fixture-studio', title: 'Morning review · failed', body: 'Open the scheduled run for details.',
        url: '/?schedule=fictional-review&run=fictional-run', createdAt: FIXTURE_NOW, coalesceKey: 'fictional-review', muted: false },
    }
    fixture.emit(event)
    fixture.emit(event)
    await expect.poll(() => page.evaluate(() =>
      (window as unknown as { fixtureScheduleNotifications: unknown[] }).fixtureScheduleNotifications.length)).toBe(1)
  } finally { fixture.assertHealthy() }
})

test('schedule approval expires while the card remains open', async ({ page, baseURL }) => {
  await page.clock.install({ time: new Date(FIXTURE_NOW) })
  const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'oracle-schedule-approval')!.setup(page)
  try {
    await expect(page.getByRole('button', { name: 'Approve', exact: true })).toBeEnabled()
    await page.clock.setSystemTime(new Date(Date.parse(FIXTURE_NOW) + 86_400_000))
    await page.evaluate(() => window.dispatchEvent(new Event('focus')))
    await expect(page.getByRole('button', { name: 'Approve', exact: true })).toBeDisabled()
    await expect(page.getByRole('region', { name: 'Schedule approvals' }).getByRole('status')).toContainText('proposal expired')
    expect(fixture.requests.filter((request) => request.path.endsWith('/approve'))).toEqual([])
  } finally { fixture.assertHealthy() }
})

for (const action of ['Approve', 'Reject'] as const) {
  test(`schedule proposal ${action.toLowerCase()} sends the exact id`, async ({ page, baseURL }) => {
    const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'oracle-schedule-approval')!.setup(page)
    try {
      await page.getByRole('button', { name: action, exact: true }).click()
      await expect(page.getByRole('region', { name: 'Schedule approvals' })).toHaveCount(0)
      expect(fixture.requests).toContainEqual({
        method: 'POST', path: `/api/schedules/proposals/fictional-morning-review/${action === 'Approve' ? 'approve' : 'reject'}`,
      })
    } finally { fixture.assertHealthy() }
  })
}

for (const viewport of uiViewports) {
  test.describe(`origin presentation ${viewport.name}`, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
    test('separates scheduled run and task hit areas for short and long titles', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'session-origin-tasks-short')!.setup(page)
      try {
        const nav = page.getByRole('navigation', { name: 'Sessions', exact: true })
        const row = nav.locator('.session-item__body--task-status:has(> .session-origin-run-link)')
        const measure = () => row.evaluate((element) => {
          const task = element.querySelector<HTMLElement>('.session-item__tasks')!.getBoundingClientRect()
          const run = element.querySelector<HTMLElement>('.session-origin-run-link')!.getBoundingClientRect()
          return {
            taskBottom: task.bottom, runTop: run.top,
            taskWidth: task.width, taskHeight: task.height, runWidth: run.width, runHeight: run.height,
            rowHeight: element.closest('.session-item')!.getBoundingClientRect().height,
          }
        })
        const short = await measure()
        expect(short.taskBottom).toBeLessThanOrEqual(short.runTop)
        const value = fixture.state.sessions[0]
        value.title = 'Review the complete field guide and the scheduled recovery checklist'
        value.revision = (value.revision ?? 0) + 1
        fixture.emit({ type: 'session.upserted', session: value })
        await expect(row.locator('.session-item__text > strong')).toHaveText(value.title)
        const long = await measure()
        expect(long.taskBottom).toBeLessThanOrEqual(long.runTop)
        expect(long.rowHeight).toBeCloseTo(short.rowHeight, 0)
        for (const bounds of [short, long]) {
          expect(bounds.taskWidth).toBeGreaterThanOrEqual(40)
          expect(bounds.taskHeight).toBeGreaterThanOrEqual(40)
          expect(bounds.runWidth).toBeGreaterThanOrEqual(40)
          expect(bounds.runHeight).toBeGreaterThanOrEqual(40)
        }
        await test.info().attach(`scheduled-row-hit-areas-${viewport.name}`, {
          body: JSON.stringify({ viewport: viewport.name, short, long }), contentType: 'application/json',
        })
        await row.locator('.session-item__tasks').click()
        const tasks = page.getByRole('dialog', { name: /^Background tasks/ })
        await expect(tasks).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(tasks).toBeHidden()
        const openSessions = page.getByRole('button', { name: 'Open sessions', exact: true })
        if (await openSessions.isVisible()) await openSessions.click()
        await expect(nav).toBeVisible()
        await row.getByRole('link', { name: 'View run from schedule Morning field guide review' }).click()
        await expect(page.getByRole('dialog', { name: 'Scheduler', exact: true })).toBeVisible()
        expect(fixture.requests.filter((request) => request.method !== 'GET' && request.path.startsWith('/api/schedules'))).toEqual([])
        await assertNoHorizontalOverflow(page)
      } finally { fixture.assertHealthy() }
    })
    test('distinguishes all origins and reads the recorded run without launching work', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'session-origins')!.setup(page)
      try {
        const nav = page.getByRole('navigation', { name: 'Sessions', exact: true })
        for (const origin of ['user', 'manager', 'schedule', 'discovered']) {
          await expect(nav.locator(`[data-session-origin="${origin}"]`)).toHaveCount(1)
        }
        await nav.getByRole('link', { name: 'View run from schedule Morning field guide review' }).click()
        const dialog = page.getByRole('dialog', { name: 'Scheduler', exact: true })
        const history = dialog.getByRole('region', { name: 'Run history for Morning field guide review' })
        await expect(history).toContainText('succeeded')
        await expect(history).toContainText('Reviewed the field guide links.')
        await expect(history.locator('[data-linked="true"]')).toHaveCount(1)
        expect(fixture.requests.filter((request) => request.method !== 'GET' && request.path.startsWith('/api/schedules'))).toEqual([])
        await history.getByRole('button', { name: 'Open session', exact: true }).click()
        await expect(dialog).toBeHidden()
        await expect(page.locator('.conversation-header')
          .getByRole('img', { name: 'Started by schedule Morning field guide review' })).toBeVisible()
        await assertNoHorizontalOverflow(page)
      } finally { fixture.assertHealthy() }
    })
    test('counts reported subagents among the tasks and opens the task sheet', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'session-subagents')!.setup(page)
      try {
        const chip = page.getByRole('button', { name: '2 background tasks running, 2 subagents', exact: true })
        await expect(chip).toHaveText('2 tasks · 2 subagents')
        await chip.click()
        await expect(page.getByRole('dialog', { name: /^Background tasks ·/ })).toContainText('Review recovery paths')
        expect(fixture.requests.some((request) => request.method === 'POST' && request.path.endsWith('/messages'))).toBe(false)
        await assertNoHorizontalOverflow(page)
      } finally { fixture.assertHealthy() }
    })
  })
  test.describe(viewport.name, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
    for (const name of uiSceneNames) {
      test(`${name} stays visually locked`, async ({ page, baseURL }) => {
        const scene = createUIScenes(baseURL).find((scene) => scene.name === name)!
        const fixture = await scene.setup(page)
        try {
          await assertNoHorizontalOverflow(page)
          if (name === 'desktop-rail') {
            expect(await page.locator('.sidebar').evaluate((sidebar) =>
              (window.innerWidth >= 1024 ? sidebar.firstElementChild : sidebar.lastElementChild)?.matches('.shell-rail'))).toBe(true)
          }
          await expect(page).toHaveScreenshot(`${viewport.name}-${name}.png`, lockedScreenshot)
        } finally {
          fixture.assertHealthy()
        }
      })
    }
  })
}

for (const viewport of uiViewports) {
  test.describe(`recently closed ${viewport.name}`, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
    const wide = viewport.viewport.width > 960
    const title = 'Audit disk usage and propose cleanup'

    test(wide
      ? 'spreads each card across a wider dialog, with its buttons beside the title and its context in two columns'
      : 'keeps the full-width sheet, with the buttons in a row below the context', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'recently-closed')!.setup(page)
      try {
        await assertNoHorizontalOverflow(page)
        const dialog = page.getByRole('dialog', { name: 'Recently closed', exact: true })
        const card = dialog.getByRole('article', { name: title })
        const more = card.getByRole('button', { name: /^Show (more|less)$/ })
        const measure = () => dialog.evaluate((element, title) => {
          const box = (target: Element | null | undefined) => {
            if (!target) throw new Error('Expected a laid-out element')
            const { left, right, top, bottom, width, height } = target.getBoundingClientRect()
            return { left, right, top, bottom, width, height }
          }
          const article = [...element.querySelectorAll('article')]
            .find((candidate) => candidate.querySelector('h3')?.textContent === title)!
          const button = (name: string) => [...article.querySelectorAll('button')]
            .find((candidate) => (candidate.getAttribute('aria-label') ?? candidate.textContent) === name)
          const [asked, replied] = article.querySelectorAll('.recently-closed-card__part')
          // What you asked and the last reply, each in lines of its text.
          const clamped = [asked!.querySelector('ul')!, replied!.querySelector('p')!].map((part) => ({
            lines: Math.round(part.clientHeight / Number.parseFloat(getComputedStyle(part.firstElementChild ?? part).lineHeight)),
            cut: part.scrollHeight > part.clientHeight + 1,
          }))
          return {
            dialog: box(element),
            intro: box(element.querySelector('.recently-closed-dialog__intro')),
            list: box(element.querySelector('.recently-closed-list')),
            header: box(article.querySelector('header')),
            summary: box(article.querySelector('.recently-closed-card__summary')),
            asked: box(asked),
            replied: box(replied),
            reopen: box(button(`Reopen ${title}`)),
            remove: box(button(`Delete ${title} permanently`)),
            toggle: box(button('Show more') ?? button('Show less')),
            clamped,
          }
        }, title)
        const layout = await measure()

        // The note on how long sessions are kept stands apart from the first card.
        expect(layout.list.top - layout.intro.bottom).toBeGreaterThanOrEqual(12)
        // Three lines of each until Show more, which a finger hits easily.
        for (const part of layout.clamped) expect(part.lines).toBeLessThanOrEqual(3)
        expect(layout.clamped.some((part) => part.cut)).toBe(true)
        expect(layout.toggle.height).toBeGreaterThanOrEqual(40)
        expect(layout.toggle.width).toBeGreaterThanOrEqual(40)
        for (const action of [layout.reopen, layout.remove]) expect(action.height).toBeGreaterThanOrEqual(40)
        expect(layout.reopen.right).toBeLessThanOrEqual(layout.remove.left)
        if (wide) {
          expect(layout.dialog.width).toBe(900)
          // Reopen and Delete permanently sit in the header, right of the title, where and when.
          for (const action of [layout.reopen, layout.remove]) {
            expect(action.top).toBeGreaterThanOrEqual(layout.header.top - 0.5)
            expect(action.bottom).toBeLessThanOrEqual(layout.header.bottom + 0.5)
            expect(action.left).toBeGreaterThanOrEqual(layout.summary.right)
            expect(action.bottom).toBeLessThanOrEqual(layout.asked.top)
          }
          // You asked beside Last reply.
          expect(layout.replied.top).toBeCloseTo(layout.asked.top, 0)
          expect(layout.replied.left).toBeGreaterThanOrEqual(layout.asked.right + 16)
        } else {
          expect(layout.dialog.width).toBe(viewport.viewport.width)
          expect(layout.replied.top).toBeGreaterThanOrEqual(layout.asked.bottom)
          // The button row shares the card's width, below Show more.
          expect(layout.reopen.top).toBeCloseTo(layout.remove.top, 0)
          expect(layout.reopen.top).toBeGreaterThanOrEqual(layout.toggle.bottom)
          expect(layout.remove.right - layout.reopen.left).toBeGreaterThanOrEqual(layout.header.width - 1)
        }

        await more.click()
        await expect(more).toHaveAttribute('aria-expanded', 'true')
        await expect(more).toHaveText('Show less')
        const open = await measure()
        expect(open.clamped.map((part) => part.cut)).toEqual([false, false])
        expect(Math.max(...open.clamped.map((part) => part.lines))).toBeGreaterThan(3)
        await more.click()
        await expect(more).toHaveAttribute('aria-expanded', 'false')
        expect((await measure()).clamped).toEqual(layout.clamped)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}

const sessionPath = `/api/computers/fixture-studio/sessions/${SELECTED_SESSION_ID}`
const message = (page: Page) => page.getByRole('textbox', { name: 'Message', exact: true })

for (const viewport of uiViewports.filter((entry) => entry.name === 'desktop' || entry.name === 'phone')) {
  test.describe(`background tasks ${viewport.name}`, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
    const sceneSetup = (baseURL: string | undefined, name: UISceneName) =>
      createUIScenes(baseURL).find((scene) => scene.name === name)!.setup
    const statusName = '8 background tasks running, 2 subagents'

    test('condenses background work into one status item that keeps the line its height', async ({ page, baseURL }) => {
      const fixture = await sceneSetup(baseURL, 'background-tasks')(page)
      try {
        const line = page.getByTestId('web-statusline')
        const status = line.getByRole('button', { name: statusName, exact: true })
        await expect(status).toHaveText('8 tasks · 2 subagents')
        await expect(status).toHaveAttribute('title', 'View background tasks')
        await expect(line.getByRole('button')).toHaveCount(1)
        const fit = await line.evaluate((element) => {
          const pill = element.querySelector<HTMLElement>('.web-statusline__tasks')!
          const plain = element.querySelector<HTMLElement>('.web-statusline__provider')!
          const box = pill.getBoundingClientRect()
          const style = getComputedStyle(pill)
          const lineBox = element.getBoundingClientRect()
          const above = document.elementFromPoint(box.left + box.width / 2, box.top - 1)
          return {
            rowHeight: box.height + Number.parseFloat(style.marginTop) + Number.parseFloat(style.marginBottom),
            plainHeight: plain.getBoundingClientRect().height,
            inside: box.top >= lineBox.top && box.bottom <= lineBox.bottom,
            scrolls: element.scrollHeight > element.clientHeight,
            reachesAbove: above === pill,
          }
        })
        // The pill takes no more of its row than plain text does, stays inside
        // the line without making it scroll, and still answers a touch just
        // above its outline.
        expect(fit.rowHeight).toBeLessThanOrEqual(fit.plainHeight + 0.5)
        expect(fit.inside).toBe(true)
        expect(fit.scrolls).toBe(false)
        expect(fit.reachesAbove).toBe(true)
        await assertNoHorizontalOverflow(page)
      } finally { fixture.assertHealthy() }
    })

    test('lists compact rows, subagents first, under the same words, with one note when nothing can be stopped', async ({ page, baseURL }) => {
      const fixture = await sceneSetup(baseURL, 'background-tasks-sheet')(page)
      try {
        const sheet = page.getByRole('dialog', { name: /^Background tasks · / })
        await expect(sheet.getByRole('status')).toHaveText(statusName)
        const rows = sheet.getByRole('button', { expanded: false })
        await expect(rows).toHaveCount(10)
        await expect(rows.nth(0)).toHaveAccessibleName('Running subagent: Review the recovery paths')
        await expect(rows.nth(1)).toHaveAccessibleName('Running subagent: Check the guide links')
        await expect(rows.nth(8)).toHaveAccessibleName('Completed shell: pnpm build')
        await expect(sheet.getByRole('note')).toHaveCount(1)
        await expect(sheet.getByRole('button', { name: /^Ask to stop: / })).toHaveCount(8)
        await expect(sheet.getByRole('button', { name: /^Stop task: / })).toHaveCount(0)
        // Asking stays text and icon until pointed at, so eight of them do not
        // read as a wall of buttons.
        const ask = sheet.getByRole('button', { name: 'Ask to stop: pnpm dev --host 127.0.0.1', exact: true })
        await expect(ask).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)')
        if (viewport.name === 'desktop') {
          await ask.hover()
          await expect(ask).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)')
        }
        if (viewport.name === 'phone') {
          const targets = [...await rows.all(), ...await sheet.getByRole('button', { name: /^Ask to stop: / }).all()]
          for (const target of targets) {
            expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(40)
          }
        }
        await assertNoHorizontalOverflow(page)
      } finally { fixture.assertHealthy() }
    })

    test('opens a row in place by keyboard and returns to the status item on Escape', async ({ page, baseURL }) => {
      const fixture = await sceneSetup(baseURL, 'background-tasks-expanded')(page)
      try {
        const sheet = page.getByRole('dialog', { name: /^Background tasks · / })
        const row = sheet.getByRole('button', { name: 'Running subagent: Review the recovery paths', exact: true })
        await expect(row).toHaveAttribute('aria-expanded', 'true')
        const stop = sheet.getByRole('button', { name: 'Stop task: Review the recovery paths', exact: true })
        await expect(stop).toBeVisible()
        await expect(stop).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)')
        await expect(sheet.getByRole('button', { name: 'Ask to stop: tail -f logs/sync.log', exact: true })).toBeVisible()
        const activity = sheet.getByRole('list', { name: 'Recent activity' })
        await expect(activity.getByRole('listitem')).toHaveCount(5)
        await sheet.getByRole('button', { name: 'Show all (7)', exact: true }).click()
        await expect(activity.getByRole('listitem')).toHaveCount(7)
        await row.focus()
        await page.keyboard.press('Enter')
        await expect(row).toHaveAttribute('aria-expanded', 'false')
        await expect(activity).toHaveCount(0)
        await page.keyboard.press('Space')
        await expect(row).toHaveAttribute('aria-expanded', 'true')
        await page.keyboard.press('Escape')
        await expect(sheet).toBeHidden()
        await expect(page.getByRole('button', { name: statusName, exact: true })).toBeFocused()
      } finally { fixture.assertHealthy() }
    })

    test('asks the agent to stop a task through the draft without sending it', async ({ page, baseURL }) => {
      const fixture = await sceneSetup(baseURL, 'background-tasks')(page)
      try {
        await message(page).fill('Check the backups first.')
        await page.getByRole('button', { name: statusName, exact: true }).click()
        const sheet = page.getByRole('dialog', { name: /^Background tasks · / })
        await sheet.getByRole('button', { name: 'Ask to stop: pnpm dev --host 127.0.0.1', exact: true }).click()
        await expect(sheet).toBeHidden()
        await expect(message(page)).toHaveValue(
          'Check the backups first.\n\nStop the background task `shell-1` (pnpm dev --host 127.0.0.1) and tell me when it has stopped.',
        )
        await expect(message(page)).toBeFocused()
        expect(fixture.requests.filter((request) => request.method === 'POST' &&
          (request.path.endsWith('/messages') || request.path.endsWith('/cancel')))).toEqual([])
      } finally { fixture.assertHealthy() }
    })
  })
}

/** The selected session with a synthetic bash call and MCP call its computer logged. */
async function openToolCallFixture(page: Page, baseURL: string) {
  const state = createWorkspaceFixtureState()
  const session = state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
  session.messages.splice(1, 0, ...structuredClone(fixtureActivityMessages))
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl: baseURL, state, knowledgeMode: 'hidden', activityDetails: fixtureActivityDetails,
  })
  await page.goto(fixture.url)
  await expect(message(page)).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  return fixture
}

const bashRow = (page: Page) => page.getByRole('button', { name: /^Completed: Bash · Check the field guide links/ })
const searchRow = (page: Page) => page.getByRole('button', { name: /^Completed: MCP · GitHub · Search Code/ })
const panelOf = async (page: Page, row: ReturnType<Page['getByRole']>) =>
  page.locator(`[id="${await row.getAttribute('aria-controls')}"]`)

for (const viewport of uiViewports) {
  test.describe(`tool call details ${viewport.name}`, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
    test('opens a bash row and an MCP row onto their complete calls', async ({ page, baseURL }) => {
      const fixture = await openToolCallFixture(page, baseURL!)
      try {
        const bash = bashRow(page)
        const search = searchRow(page)
        // Compact on touch too: the whole full-width row is the target.
        const rowHeights = await page.locator('.activity-message--toggle')
          .evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height))
        expect(rowHeights).toHaveLength(fixtureActivityMessages.length)
        for (const height of rowHeights) {
          expect(height).toBeGreaterThanOrEqual(viewport.hasTouch ? 28 : 20)
          expect(height).toBeLessThanOrEqual(viewport.hasTouch ? 29 : 24)
        }
        for (const row of [bash, search]) await expect(row).toHaveAttribute('aria-expanded', 'false')
        const open = (row: typeof bash) => viewport.hasTouch ? row.tap() : row.click()

        await open(bash)
        await expect(bash).toHaveAttribute('aria-expanded', 'true')
        const bashPanel = await panelOf(page, bash)
        await expect(bashPanel).toContainText('pnpm run check-links docs/field-guide.md --format table')
        await expect(bashPanel).toContainText('Checked 18 links: 17 ok, 1 redirected')
        await expect(bashPanel).toContainText('reading-patterns-for-long-documents')
        const copyOutput = bashPanel.getByRole('button', { name: 'Copy output' })
        await expect(copyOutput).toBeVisible()
        if (viewport.hasTouch) {
          const copyBox = (await copyOutput.boundingBox())!
          expect(Math.min(copyBox.width, copyBox.height)).toBeGreaterThanOrEqual(44)
        }

        await open(search)
        const searchPanel = await panelOf(page, search)
        await expect(searchPanel).toContainText('github-mcp-server › search_code')
        await expect(searchPanel).toContainText('"perPage": 5')
        await expect(searchPanel).toContainText('3 results for "recovery checklist"')
        expect(fixture.requests.filter((request) => request.path.includes('/activities/'))).toEqual([
          { method: 'GET', path: `${sessionPath}/activities/fixture-call-links` },
          { method: 'GET', path: `${sessionPath}/activities/fixture-call-search` },
        ])
        await assertNoHorizontalOverflow(page)

        await open(bash)
        await expect(bash).toHaveAttribute('aria-expanded', 'false')
        await expect(bashPanel).toHaveCount(0)
        await page.mouse.move(0, 0)
        // Scroll to latest and Oracle float over the timeline's corner; the lock is the row.
        await page.addStyleTag({ content: '.timeline-dock { visibility: hidden; }' })
        await expect(search.locator('xpath=ancestor::article[1]'))
          .toHaveScreenshot(`tool-call-details-${viewport.name}.png`, lockedScreenshot)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}

test.describe('tool call details from the keyboard', () => {
  test.use({ viewport: uiViewports[0].viewport, isMobile: false, hasTouch: false })
  test('opens and closes a tool row with Enter and Space behind a visible focus ring', async ({ page, baseURL }) => {
    const fixture = await openToolCallFixture(page, baseURL!)
    try {
      const bash = bashRow(page)
      await bash.focus()
      await page.keyboard.press('Enter')
      await expect(bash).toHaveAttribute('aria-expanded', 'true')
      await expect(bash).toHaveCSS('outline-style', 'solid')
      await expect(await panelOf(page, bash)).toContainText('Checked 18 links: 17 ok, 1 redirected')
      await page.keyboard.press('Space')
      await expect(bash).toHaveAttribute('aria-expanded', 'false')
      await page.keyboard.press('Space')
      await expect(bash).toHaveAttribute('aria-expanded', 'true')
      await page.keyboard.press('Tab')
      await expect(page.getByRole('button', { name: 'Copy command' })).toBeFocused()
      expect(fixture.requests.filter((request) => request.path.includes('/activities/'))).toHaveLength(1)
    } finally {
      fixture.assertHealthy()
    }
  })
})

/** A fake microphone whose recording the fixture transcribes as "Transcribed fixture note". */
async function mockMicrophone(page: Page) {
  await page.addInitScript(() => {
    const microphone = { calls: [] as MediaStreamConstraints[], stopped: 0 }
    Object.assign(window, { fixtureMicrophone: microphone })
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async (constraints: MediaStreamConstraints) => {
        microphone.calls.push(constraints)
        return { getTracks: () => [{ stop: () => { microphone.stopped++ } }] }
      } },
    })
    class Recorder extends EventTarget {
      static isTypeSupported() { return true }
      state = 'inactive'
      mimeType = 'audio/webm'
      start() { this.state = 'recording' }
      stop() {
        this.state = 'inactive'
        this.dispatchEvent(new BlobEvent('dataavailable', { data: new Blob(['fixture audio'], { type: this.mimeType }) }))
        this.dispatchEvent(new Event('stop'))
      }
    }
    Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: Recorder })
  })
}

test('settings categories preserve display name, scheduler defaults and the Host monitor destination', async ({ page, baseURL }) => {
  const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'settings-navigation')!.setup(page)
  try {
    const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
    await dialog.getByRole('button', { name: /^Scheduler Hub/ }).click()
    await dialog.getByRole('checkbox', { name: 'Allow Oracle to propose allow-all schedules' }).check()
    await expect.poll(() => fixture.state.settings.values.schedulerAllowAllForOracle).toBe(true)
    await dialog.getByRole('button', { name: /^App This device/ }).click()
    await dialog.getByRole('textbox', { name: 'Display name', exact: true }).fill('Jamie Rivera')
    await dialog.getByRole('button', { name: 'Save display name', exact: true }).click()
    await expect.poll(() => fixture.state.settings.values.displayName).toBe('Jamie Rivera')
    await dialog.getByRole('button', { name: /^Remote machines/ }).click()
    await dialog.getByRole('button', { name: 'Open Host monitor', exact: true }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('dialog', { name: 'Host monitor', exact: true })).toBeVisible()
  } finally { fixture.assertHealthy() }
})

test('skill changes require confirmation and target the selected computer only', async ({ page, baseURL }) => {
  const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'settings-skill-confirmation')!.setup(page)
  try {
    const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
    await expect(dialog.getByRole('button', { name: 'Confirm change', exact: true })).toBeFocused()
    expect(fixture.requests.filter((entry) => entry.method === 'PATCH' && entry.path.endsWith('/skills'))).toEqual([])
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(dialog.getByRole('button', { name: 'Disable review-notes', exact: true })).toBeFocused()
    await dialog.getByRole('button', { name: 'Disable review-notes', exact: true }).click()
    const write = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname === '/api/computers/fixture-build/skills')
    await dialog.getByRole('button', { name: 'Confirm change', exact: true }).click()
    expect((await write).postDataJSON()).toEqual({ name: 'review-notes', enabled: false, confirmed: true, revision: 'a'.repeat(64) })
    await expect(dialog.getByRole('button', { name: 'Enable review-notes', exact: true })).toBeFocused()
    await dialog.getByRole('combobox', { name: 'Skills computer' }).selectOption('fixture-studio')
    await expect(dialog.getByRole('button', { name: 'Disable review-notes', exact: true })).toBeVisible()
    await dialog.getByRole('combobox', { name: 'Skills computer' }).selectOption('fixture-travel')
    await expect(dialog.getByRole('status')).toContainText('offline')
  } finally { fixture.assertHealthy() }
})

test('phone All settings restores category focus and supports keyboard re-entry', async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'settings-navigation')!.setup(page)
  try {
    const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
    await dialog.getByRole('button', { name: 'All settings', exact: true }).click()
    const models = dialog.getByRole('button', { name: /^Models/ })
    await expect(models).toBeFocused()
    await models.press('Enter')
    await expect(dialog.getByRole('heading', { name: 'Models', exact: true })).toBeFocused()
    await assertNoHorizontalOverflow(page)
  } finally { fixture.assertHealthy() }
})

test('settings searches fields, navigates by keyboard, deep-links computers and closes with Escape', async ({ page, baseURL }) => {
  const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'settings-navigation')!.setup(page)
  try {
    const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
    await dialog.getByRole('searchbox', { name: 'Search settings' }).fill('Accent')
    await dialog.getByRole('button', { name: /^Interface/ }).click()
    await expect(dialog.getByRole('radiogroup', { name: 'Accent color' })).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Keyboard shortcuts', exact: true })).toBeHidden()
    await dialog.getByRole('searchbox', { name: 'Search settings' }).fill('Desktop rail')
    await dialog.getByRole('button', { name: /^Interface/ }).click()
    await expect(dialog.getByRole('checkbox', { name: 'Desktop rail', exact: true })).toBeVisible()
    await expect(dialog.getByRole('radiogroup', { name: 'Accent color' })).toBeHidden()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await page.getByRole('button', { name: 'Manage computers', exact: true }).click()
    await expect(dialog.getByRole('button', { name: 'Check connection', exact: true })).toBeVisible()
    const remote = dialog.getByRole('button', { name: /^Remote machines/ })
    await remote.focus()
    await remote.press('ArrowDown')
    await expect(dialog.getByRole('button', { name: /^Oracle/ })).toBeFocused()
  } finally { fixture.assertHealthy() }
})

test('Health search leads directly to the App card', async ({ page, baseURL }) => {
  const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'settings-health-search')!.setup(page)
  try {
    const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
    await expect(dialog.getByRole('region', { name: 'Health', exact: true })).toBeVisible()
  } finally { fixture.assertHealthy() }
})

test('invalid skills explain why they cannot change CLI configuration', async ({ page, baseURL }) => {
  const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'settings-invalid-skill')!.setup(page)
  try {
    await expect(page.getByRole('button', { name: 'Enable invalid-checklist', exact: true })).toBeDisabled()
    expect(fixture.requests.filter((request) => request.method === 'PATCH' && request.path.endsWith('/skills'))).toEqual([])
  } finally { fixture.assertHealthy() }
})

for (const width of [320, 360, 390]) {
  test.describe(`sent history keyboard ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true })
    test('keeps the sheet and its actions within the shell visual viewport', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-sent-messages')!.setup(page)
      try {
        const dialog = page.getByRole('dialog', { name: 'Sent messages', exact: true })
        await dialog.getByRole('combobox', { name: 'Search sent messages' }).focus()
        await page.evaluate(() => {
          const viewport = new EventTarget()
          Object.defineProperties(viewport, { height: { value: 400 }, offsetTop: { value: 36 } })
          Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
          window.dispatchEvent(new Event('resize'))
        })
        await expect(page.locator('.app-shell')).toHaveCSS('--visual-viewport-height', '400px')
        await expect(dialog).toHaveCSS('--visual-viewport-height', '400px')
        const rect = (await dialog.boundingBox())!
        expect(rect.y).toBeGreaterThanOrEqual(36)
        expect(rect.y + rect.height).toBeLessThanOrEqual(436)
        expect(await dialog.evaluate((element) => Boolean(element.closest('.composer-area')))).toBe(false)
        for (const name of ['Close', 'Cancel', 'Use message']) {
          const action = (await dialog.getByRole('button', { name, exact: true }).boundingBox())!
          expect(action.y).toBeGreaterThanOrEqual(36)
          expect(action.y + action.height).toBeLessThanOrEqual(436)
        }
        await assertNoHorizontalOverflow(page)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}

for (const width of [320, 360, 600, 601, 820, 960, 961, 1440]) {
  test.describe(`sent history layout ${width}px`, () => {
    test.use({ viewport: { width, height: 900 }, isMobile: width <= 600, hasTouch: width <= 960 })
    test('uses a coherent sheet or popover without opening the touch keyboard', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-sent-messages')!.setup(page)
      try {
        const dialog = page.getByRole('dialog', { name: 'Sent messages', exact: true })
        const rect = (await dialog.boundingBox())!
        const search = dialog.getByRole('combobox', { name: 'Search sent messages' })
        if (width <= 960) {
          expect(rect.x).toBe(0)
          expect(rect.width).toBe(width)
          expect(rect.y + rect.height).toBeCloseTo(900, 0)
          await expect(search).not.toBeFocused()
          await expect(dialog).toBeFocused()
        } else {
          expect(rect.width).toBeLessThanOrEqual(560)
          expect(rect.y + rect.height).toBeLessThan(800)
          await expect(search).toBeFocused()
        }
        await assertNoHorizontalOverflow(page)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}

for (const viewport of uiViewports) {
  test.describe(`runtime in the buttons row ${viewport.name}`, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
    test('sits between the microphone and Queue/Send instead of a line below the composer', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-status-busy')!.setup(page)
      try {
        const summary = page.getByTestId('composer-runtime')
        await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeInViewport({ ratio: 1 })
        const busy = await runtimeInRow(page)
        expectRuntimeInRow(busy)
        expect(busy.name.full, 'a long model name truncates').toBeGreaterThan(busy.name.visible)
        // The idle-only hint shows where it fits; the title and description always carry it.
        await expect(summary).toHaveAccessibleDescription(/applies when idle/)
        await expect(summary).toHaveAttribute('title', /applies when idle/)
        if (viewport.name === 'desktop') expect(busy.shown).toEqual({ effort: true, context: true, mode: true, hint: true })
        await assertNoHorizontalOverflow(page)

        const session = fixture.state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
        session.status = 'idle'
        session.revision = (session.revision ?? 0) + 1
        fixture.emit({ type: 'session.upserted', session })
        await expect(page.getByRole('button', { name: 'Stop response', exact: true })).toBeHidden()
        const idle = await runtimeInRow(page)
        expectRuntimeInRow(idle)
        expect(idle.runtime.width, 'takes the room Queue and Stop leave').toBeGreaterThan(busy.runtime.width)
        expect(idle.shown.mode, 'mode beside the name while idle').toBe(true)
        await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeInViewport({ ratio: 1 })
        await assertNoHorizontalOverflow(page)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}

for (const viewport of uiViewports) {
  test.describe(`runtime names ${viewport.name}`, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
    for (const [name, full, short, mode] of [
      ['composer-family-claude', 'claude-opus-5.5', 'Opus 5.5', 'autopilot'],
      ['composer-family-openai', 'gpt-6.2-sol', '6.2 Sol', 'interactive'],
    ] as const) {
      test(`keeps ${short} and ${mode} legible and exposes the full state`, async ({ page, baseURL }) => {
        const fixture = await createUIScenes(baseURL).find((scene) => scene.name === name)!.setup(page)
        try {
          const summary = page.getByRole('button', { name: 'Configure model, effort, and context' })
          const narrow = viewport.name === 'phone'
          await expect(summary.getByText(short, { exact: true })).toBeVisible({ visible: narrow })
          await expect(summary.getByText(full, { exact: true })).toBeVisible({ visible: !narrow })
          await expect(summary.locator('.composer-runtime__mode-icon')).toBeVisible({ visible: narrow })
          await expect(summary.getByText(mode, { exact: true })).toBeVisible({ visible: !narrow })
          await expect(summary).toHaveAccessibleDescription(
            `Open session setup. Model: ${full}. Effort: medium. Context: 128k. Mode: ${mode}.`,
          )
          const layout = await runtimeInRow(page)
          expectRuntimeInRow(layout)
          expect(layout.shown.mode, 'mode beside the model').toBe(true)
          if (narrow) expect(layout.name.full, 'short model name fits').toBeLessThanOrEqual(layout.name.visible)
          await assertNoHorizontalOverflow(page)
        } finally {
          fixture.assertHealthy()
        }
      })
    }
  })
}

// From 361 to 530 px a running turn keeps Queue as its own button and Send
// opens Steer or Queue itself; at 360 px and below Queue folds into that menu,
// and from 531 px the arrow returns beside Send.
for (const { width, queue, arrow } of [
  { width: 376, queue: 'menu', arrow: true }, { width: 377, queue: 'button', arrow: false },
  { width: 390, queue: 'button', arrow: false }, { width: 546, queue: 'button', arrow: false },
  { width: 547, queue: 'button', arrow: true },
] as const) {
  test.describe(`busy composer ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true })
    test(`queues from ${queue === 'button' ? 'its own button in one tap' : 'the Send menu'} and opens Steer or Queue from Send`, async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-status-busy')!.setup(page)
      try {
        const send = page.getByRole('button', { name: 'Send message', exact: true })
        const queueButton = page.getByRole('button', { name: 'Queue message', exact: true })
        const options = page.getByRole('button', { name: 'Send options', exact: true })
        const menu = page.getByRole('menu', { name: 'Message delivery' })
        await message(page).fill('Check the release notes next.')
        expectRuntimeInRow(await runtimeInRow(page))
        if (arrow) await expect(options).toBeVisible()
        else await expect(options).toBeHidden()
        const queued = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/messages`)
        if (queue === 'button') {
          await queueButton.click()
        } else {
          await expect(queueButton).toBeHidden()
          await options.click()
          await menu.getByRole('menuitem', { name: /Queue —/ }).click()
        }
        expect((await queued).postDataJSON()).toMatchObject({ content: 'Check the release notes next.', enqueue: true })
        await expect(page.getByRole('region', { name: 'Queued prompts' })).toContainText('Check the release notes next.')

        await message(page).fill('Steer toward the recovery checklist.')
        await expect(send).toHaveAttribute('aria-haspopup', 'menu')
        await expect(send).toHaveAttribute('aria-expanded', 'false')
        await send.focus()
        await page.keyboard.press('Enter')
        await expect(menu.getByRole('menuitem', { name: /Steer —/ })).toBeFocused()
        await expect(menu.getByRole('menuitem', { name: /Queue —/ })).toBeVisible()
        await expect(send).toHaveAttribute('aria-expanded', 'true')
        const rect = (await menu.boundingBox())!
        expect(rect.x).toBeGreaterThanOrEqual(0)
        expect(rect.x + rect.width).toBeLessThanOrEqual(width)
        await page.keyboard.press('Escape')
        await expect(menu).toBeHidden()
        await expect(send).toBeFocused()
        expect(fixture.requests.filter((request) => request.method === 'POST' && request.path === `${sessionPath}/messages`))
          .toHaveLength(1)
        await assertNoHorizontalOverflow(page)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}

for (const width of [320, 360]) {
  test.describe(`narrow composer ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true })
    test('keeps the model glyph and a truncated name in the row, with the idle-only hint in its description', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-status-busy')!.setup(page)
      try {
        const summary = page.getByTestId('composer-runtime')
        await expect(summary.locator('[data-model-family]')).toBeVisible()
        await expect(summary.getByText('applies when idle', { exact: true })).toBeHidden()
        await expect(summary).toHaveAccessibleDescription(/applies when idle/)
        await expect(summary).toHaveAttribute('title', /applies when idle/)
        const layout = await runtimeInRow(page)
        expectRuntimeInRow(layout)
        await assertNoHorizontalOverflow(page)
      } finally {
        fixture.assertHealthy()
      }
    })
    test('keeps every busy action at least 40px wide and inside the composer', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-status-busy')!.setup(page)
      try {
        await message(page).fill('Check the narrow phone layout.')
        const row = page.locator('.composer-actions--refresh')
        const bounds = await row.evaluate((element) => {
          const row = element.getBoundingClientRect()
          return [...element.querySelectorAll('button')].filter((button) => button.getClientRects().length > 0)
            .map((button) => {
              const rect = button.getBoundingClientRect()
              return { label: button.getAttribute('aria-label'), width: rect.width, height: rect.height,
                inside: rect.left >= row.left && rect.right <= row.right }
            })
        })
        for (const button of bounds) {
          expect(button.width, button.label ?? '').toBeGreaterThanOrEqual(40)
          expect(button.height, button.label ?? '').toBeGreaterThanOrEqual(40)
          expect(button.inside, button.label ?? '').toBe(true)
        }
        await expect(page.getByRole('button', { name: 'Stop response', exact: true })).toBeInViewport({ ratio: 1 })
        const queue = page.getByRole('button', { name: 'Queue message', exact: true })
        if (await queue.isVisible()) {
          await queue.click()
        } else {
          await page.getByRole('button', { name: 'Send options', exact: true }).click()
          const menu = page.getByRole('menu', { name: 'Message delivery' })
          const rect = (await menu.boundingBox())!
          expect(rect.x).toBeGreaterThanOrEqual(0)
          expect(rect.x + rect.width).toBeLessThanOrEqual(width)
          await menu.getByRole('menuitem', { name: /Queue —/ }).click()
        }
        await expect(page.getByRole('region', { name: 'Queued prompts' })).toContainText('Check the narrow phone layout.')
        await page.getByRole('button', { name: 'Stop response', exact: true }).click()
        await expect(page.getByRole('button', { name: 'Stop response', exact: true })).toBeHidden()
        await assertNoHorizontalOverflow(page)
      } finally {
        fixture.assertHealthy()
      }
    })
    test('distinguishes unavailable context from zero without hovering', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-button-row')!.setup(page)
      try {
        const session = fixture.state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
        session.runtime = { ...session.runtime, contextTokens: undefined }
        session.revision = (session.revision ?? 0) + 1
        fixture.emit({ type: 'session.upserted', session })
        await page.getByRole('button', { name: 'Session panel', exact: true }).click()
        const unavailable = page.getByRole('button', { name: 'Context: usage unavailable', exact: true })
        await expect(unavailable.getByText('?')).toBeVisible()
        session.runtime = { ...session.runtime, contextTokens: 0, contextTokenLimit: 100 }
        session.revision = (session.revision ?? 0) + 1
        fixture.emit({ type: 'session.upserted', session })
        const zero = page.getByRole('button', { name: 'Context: 0% used', exact: true })
        await expect(zero).toBeVisible()
        await expect(zero.getByText('?')).toHaveCount(0)
      } finally {
        fixture.assertHealthy()
      }
    })
    test('sends an expanded pasted slash command without offering to queue it', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-status-busy')!.setup(page)
      try {
        const content = ['/help', ...Array.from({ length: 21 }, () => 'Synthetic review detail')].join('\n')
        await message(page).evaluate((element, content) => {
          const clipboardData = new DataTransfer()
          clipboardData.setData('text/plain', content)
          element.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }))
        }, content)
        await expect(message(page)).toHaveValue('[Paste #1 - 22 lines]')
        await expect(page.getByRole('button', { name: 'Send options', exact: true })).toHaveCount(0)
        const sent = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/commands`)
        await page.getByRole('button', { name: 'Send message', exact: true }).click()
        const payload = (await sent).postDataJSON()
        expect(payload.command).toBe(content)
        expect(payload.enqueue).not.toBe(true)
        expect(fixture.state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!.queuedPrompts ?? []).toHaveLength(0)
        await expect(page.getByRole('menu', { name: 'Message delivery' })).toHaveCount(0)
        await assertNoHorizontalOverflow(page)
      } finally {
        fixture.assertHealthy()
      }
    })
    test('keeps the session panel and its last action inside a keyboard-sized visual viewport', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-status-busy')!.setup(page)
      try {
        await message(page).fill(Array.from({ length: 10 }, (_, index) => `Unsent line ${index}`).join('\n'))
        await message(page).focus()
        await page.evaluate(() => {
          const viewport = new EventTarget()
          Object.defineProperties(viewport, { height: { value: 400 }, offsetTop: { value: 0 } })
          Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
          window.dispatchEvent(new Event('resize'))
        })
        await expect(page.locator('.app-shell')).toHaveClass(/app-shell--keyboard-open/)
        await expect(page.locator('.app-shell')).toHaveCSS('--visual-viewport-height', '400px')
        await page.getByRole('button', { name: 'Session panel', exact: true }).click()
        const panel = page.getByRole('group', { name: 'Session panel', exact: true })
        const layout = await panel.evaluate((element) => {
          const rect = element.getBoundingClientRect()
          return {
            top: rect.top, bottom: rect.bottom, maxHeight: getComputedStyle(element).maxHeight,
            anchor: (element as HTMLElement).offsetParent?.className,
            keyboardOpen: Boolean(element.closest('.app-shell--keyboard-open')),
            inset: getComputedStyle(element).bottom,
          }
        })
        expect(layout.top, JSON.stringify(layout)).toBeGreaterThanOrEqual(0)
        expect(layout.bottom, JSON.stringify(layout)).toBeLessThanOrEqual(400)
        const lastAction = panel.getByRole('button').last()
        await lastAction.scrollIntoViewIfNeeded()
        await expect(lastAction).toBeInViewport({ ratio: 1 })
        await expect(lastAction).toBeEnabled()
        await assertNoHorizontalOverflow(page)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}

type ComposerPart = { left: number, right: number, top: number, bottom: number, width: number }

/** Where the refreshed runtime summary sits in the buttons row, and which of its parts show. */
async function runtimeInRow(page: Page) {
  return page.locator('.composer-actions--refresh').evaluate((row) => {
    const box = (element: Element | null) => {
      if (!element || element.getClientRects().length === 0) return undefined
      const { left, right, top, bottom, width, height } = element.getBoundingClientRect()
      return { left, right, top, bottom, width, height }
    }
    const runtime = row.querySelector(':scope > [data-testid="composer-runtime"]')!
    const runtimeBox = box(runtime)!
    const name = [...runtime.querySelectorAll<HTMLElement>('.composer-runtime__model')]
      .find((element) => element.getClientRects().length > 0)!
    const composer = row.closest('.composer')!
    const area = composer.closest('.composer-area')!
    const shown = (selector: string) => Boolean(box(runtime.querySelector(selector)))
    return {
      row: box(row)!,
      runtime: runtimeBox,
      glyph: box(runtime.querySelector('[data-model-family]')),
      mic: box(row.querySelector(':scope > [aria-label="Start microphone recording"]'))!,
      panel: box(row.querySelector(':scope > .composer-session-panel'))!,
      queue: box(row.querySelector(':scope > [aria-label="Queue message"]')),
      send: box(row.querySelector(':scope > [aria-label="Send message"]'))!,
      controlHeight: Math.max(...[...row.querySelectorAll(':scope > button, :scope > .composer-session-panel > button')]
        .filter((control) => control !== runtime).map((control) => box(control)?.height ?? 0)),
      shown: {
        effort: shown('.composer-runtime__detail--effort'), context: shown('.composer-runtime__detail--context'),
        mode: shown('.composer-runtime__detail--mode'), hint: shown('.composer-runtime__hint'),
      },
      clipped: [...runtime.querySelectorAll('.composer-runtime-model, .composer-runtime__detail, .composer-runtime__hint')]
        .map(box).some((part) => part && (part.left < runtimeBox.left || part.right > runtimeBox.right)),
      name: { visible: name.clientWidth, full: name.scrollWidth, textOverflow: getComputedStyle(name).textOverflow },
      belowComposer: area.getBoundingClientRect().bottom - composer.getBoundingClientRect().bottom -
        parseFloat(getComputedStyle(area).paddingBottom),
    }
  })
}

function expectRuntimeInRow(layout: Awaited<ReturnType<typeof runtimeInRow>>) {
  const { row, runtime, mic, panel, queue, send, shown, name } = layout
  expect(runtime.left, 'after the microphone and session panel').toBeGreaterThanOrEqual(Math.max(mic.right, panel.right))
  expect(runtime.right, 'before Queue and Send').toBeLessThanOrEqual((queue ?? send).left)
  expect(send.right, 'Send inside the row').toBeLessThanOrEqual(row.right)
  expect(runtime.top, 'runtime top inside the row').toBeGreaterThanOrEqual(row.top)
  expect(runtime.bottom, 'runtime bottom inside the row').toBeLessThanOrEqual(row.bottom)
  expect(runtime.height, 'as tall as the other controls').toBeGreaterThanOrEqual(layout.controlHeight)
  expect(runtime.width, 'runtime target width').toBeGreaterThanOrEqual(40)
  expect(layout.belowComposer, 'no line below the composer').toBeLessThanOrEqual(1)
  expect(layout.glyph, 'model glyph').toBeDefined()
  expect(name.visible, 'model name').toBeGreaterThan(0)
  expect(name.textOverflow, 'model name truncation').toBe('ellipsis')
  expect(layout.clipped, 'a detail cut short').toBe(false)
  // Whole details drop out: the hint first, then context, effort and mode.
  const steps = [shown.mode, shown.effort, shown.context, shown.hint]
  expect(steps, JSON.stringify(shown)).toEqual([...steps].sort((a, b) => Number(b) - Number(a)))
}

/** Pastes a screenshot from the clipboard into the message box. */
async function pasteImage(page: Page) {
  await message(page).focus()
  await message(page).evaluate((element) => {
    const image = new Uint8Array(232_448)
    image.set([137, 80, 78, 71, 13, 10, 26, 10])
    const clipboardData = new DataTransfer()
    clipboardData.items.add(new File([image], 'image.png', { type: 'image/png' }))
    element.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }))
  })
  await expect(page.getByRole('listitem', { name: 'image.png attachment' })).toContainText('Attached · 227 KiB')
}

async function composerParts(page: Page) {
  return page.locator('.composer').evaluate((composer) => {
    const part = (element: Element | null): ComposerPart | undefined => {
      if (!element) return undefined
      const { left, right, top, bottom, width } = element.getBoundingClientRect()
      return { left, right, top, bottom, width }
    }
    return {
      viewportWidth: document.documentElement.clientWidth,
      overflow: composer.scrollWidth - composer.clientWidth,
      composer: part(composer)!,
      attachments: part(composer.querySelector(':scope > .composer-attachments')),
      text: part(composer.querySelector(':scope > .composer-text-panel'))!,
      actions: part(composer.querySelector(':scope > .composer-actions')),
      recording: part(composer.querySelector(':scope > .recording-panel')),
    }
  })
}

/** Each part lies inside the composer's box, below the one before it. */
function expectColumn(layout: Awaited<ReturnType<typeof composerParts>>, parts: [string, ComposerPart | undefined][]) {
  const { composer } = layout
  expect(layout.overflow, 'composer overflow').toBeLessThanOrEqual(0)
  expect(composer.left, 'composer left').toBeGreaterThanOrEqual(0)
  expect(composer.right, 'composer right').toBeLessThanOrEqual(layout.viewportWidth)
  let above = composer.top
  for (const [name, part] of parts) {
    expect(part, name).toBeDefined()
    expect(part!.left, `${name} left`).toBeGreaterThanOrEqual(composer.left)
    expect(part!.right, `${name} right`).toBeLessThanOrEqual(composer.right)
    expect(part!.top, `${name} top`).toBeGreaterThanOrEqual(above - 1)
    expect(part!.bottom, `${name} bottom`).toBeLessThanOrEqual(composer.bottom)
    above = part!.bottom
  }
}

// A mouse and a composer at least 620px wide get the `(hover: hover)` layout,
// which the desktop scene locks cover only without an attachment or recording.
for (const viewport of [uiViewports[0].viewport, { width: 1000, height: 640 }]) {
  test.describe(`composer with a mouse ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport, isMobile: false, hasTouch: false })

    async function open(page: Page, baseURL: string | undefined, name: UISceneName) {
      await mockMicrophone(page)
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === name)!.setup(page)
      await assertMousePointer(page)
      expect((await page.locator('.composer').boundingBox())!.width).toBeGreaterThanOrEqual(620)
      return fixture
    }

    async function startRecording(page: Page) {
      await page.getByRole('button', { name: 'Start microphone recording', exact: true }).click()
      await expect(page.locator('.recording-panel')).toContainText(/Recording \d+:\d\d/)
    }

    test('refreshed composer stacks an attachment, the message box and its buttons or recording', async ({ page, baseURL }) => {
      const fixture = await open(page, baseURL, 'composer-button-row')
      try {
        await pasteImage(page)
        const attached = await composerParts(page)
        expectColumn(attached, [['attachment', attached.attachments], ['message box', attached.text], ['buttons', attached.actions]])
        await assertNoHorizontalOverflow(page)
        if (viewport.width === uiViewports[0].viewport.width) {
          await expect(page.locator('.composer-area')).toHaveScreenshot('desktop-composer-refresh-attachment.png', lockedScreenshot)
        }
        await startRecording(page)
        const recording = await composerParts(page)
        expectColumn(recording, [['attachment', recording.attachments], ['message box', recording.text], ['recording', recording.recording]])
        // The recording takes the buttons' row, as it does on a touch screen; nothing above it moves.
        expect(recording.text.top - recording.composer.top, 'message box offset')
          .toBeCloseTo(attached.text.top - attached.composer.top, 0)
        expect(recording.text.bottom - recording.text.top, 'message box height')
          .toBeCloseTo(attached.text.bottom - attached.text.top, 0)
        // The recording panel carries the timer; no line below the composer repeats it.
        await expect(page.locator('.composer-area > .composer-hint')).toHaveCount(0)
        await expect(page.locator('.composer-area')).toBeInViewport({ ratio: 1 })
        await assertNoHorizontalOverflow(page)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}

const phone = uiViewports.find((entry) => entry.name === 'phone')!
const openScene = (page: Page, baseURL: string | undefined, name: UISceneName) =>
  createUIScenes(baseURL).find((scene) => scene.name === name)!.setup(page)

/**
 * How far a touch through a control's centre still lands on it, and where
 * that reach ends above and below. Padding or a pseudo-element can make it
 * more than the box the control draws, and anything laid over it less.
 */
function touchExtent(element: Element) {
  const box = element.getBoundingClientRect()
  const x = box.left + box.width / 2
  const y = box.top + box.height / 2
  const lands = (left: number, top: number) => {
    const target = document.elementFromPoint(left, top)
    return target !== null && (target === element || element.contains(target))
  }
  const reach = (dx: number, dy: number) => {
    let steps = 0
    while (steps < 40 && lands(x + dx * (steps + 1), y + dy * (steps + 1))) steps += 1
    return steps
  }
  const name = element.getAttribute('aria-label') ?? element.textContent?.trim() ?? ''
  if (!lands(x, y)) return { name, width: 0, height: 0, top: y, bottom: y }
  const up = reach(0, -1)
  const down = reach(0, 1)
  return { name, width: reach(-1, 0) + 1 + reach(1, 0), height: up + 1 + down, top: y - up, bottom: y + down }
}

async function expectTouchTargets(controls: Locator[], minimum = { width: 40, height: 40 }) {
  for (const control of controls) {
    await control.scrollIntoViewIfNeeded()
    const extent = await control.evaluate(touchExtent)
    expect(extent.width, `${extent.name} width`).toBeGreaterThanOrEqual(minimum.width)
    expect(extent.height, `${extent.name} height`).toBeGreaterThanOrEqual(minimum.height)
  }
}

/** WCAG contrast of an element's colour over the backgrounds painted behind it. */
function paintedContrast(element: Element) {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d', { willReadFrequently: true })!
  // The canvas resolves any computed colour, color-mix() included, to sRGB.
  const rgba = (color: string) => {
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = color
    context.fillRect(0, 0, 1, 1)
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data
    return [red, green, blue, alpha / 255]
  }
  const over = (top: number[], below: number[]) =>
    [0, 1, 2].map((channel) => top[channel] * top[3] + below[channel] * (1 - top[3])).concat(1)
  const layers: number[][] = []
  for (let node: Element | null = element; node; node = node.parentElement) {
    const layer = rgba(getComputedStyle(node).backgroundColor)
    if (layer[3] > 0) layers.unshift(layer)
    if (layer[3] === 1) break
  }
  const background = layers.reduce((below, layer) => over(layer, below), [255, 255, 255, 1])
  const foreground = over(rgba(getComputedStyle(element).color), background)
  const luminance = (color: number[]) => {
    const [red, green, blue] = color.slice(0, 3).map((value) => {
      const channel = value / 255
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
  }
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

// §11 asks for 40px targets on a phone. The queue grip stays narrow beside the
// message it drags but is as tall as the row's buttons, and the header folder
// keeps its size as text while the line around it answers a touch.
test.describe('phone touch targets', () => {
  test.use({ viewport: phone.viewport, isMobile: phone.isMobile, hasTouch: phone.hasTouch })

  test('queued prompt controls and grips', async ({ page, baseURL }) => {
    const fixture = await openScene(page, baseURL, 'composer-busy-queue')
    try {
      const queue = page.getByRole('region', { name: 'Queued prompts' })
      for (const index of [1, 2]) {
        await expectTouchTargets([
          queue.getByRole('button', { name: `Edit queued prompt ${index}`, exact: true }),
          queue.getByRole('button', { name: `Remove queued prompt ${index}`, exact: true }),
        ])
        await expectTouchTargets([queue.getByRole('button', { name: `Reorder queued prompt ${index}`, exact: true })],
          { width: 16, height: 40 })
      }
      await assertNoHorizontalOverflow(page)
    } finally { fixture.assertHealthy() }
  })

  test('recording strip', async ({ page, baseURL }) => {
    await mockMicrophone(page)
    const fixture = await openScene(page, baseURL, 'conversation')
    try {
      await page.getByRole('button', { name: 'Start microphone recording', exact: true }).click()
      const strip = page.locator('.composer > .recording-panel')
      await expect(strip).toContainText(/Recording \d+:\d\d/)
      await expectTouchTargets([
        strip.getByRole('button', { name: 'Cancel', exact: true }),
        strip.getByRole('button', { name: 'Stop & transcribe', exact: true }),
      ])
    } finally { fixture.assertHealthy() }
  })

  test("Oracle's mode and model", async ({ page, baseURL }) => {
    const fixture = await openScene(page, baseURL, 'oracle-panel')
    try {
      const oracle = page.locator('#oracle-panel')
      const mode = oracle.getByRole('group', { name: 'Oracle mode', exact: true })
      await expectTouchTargets([
        mode.getByRole('button', { name: 'Ask', exact: true }),
        mode.getByRole('button', { name: 'Delegate', exact: true }),
        oracle.getByRole('button', { name: /^Oracle model:/ }),
      ])
    } finally { fixture.assertHealthy() }
  })

  test("the tasks sheet's Close beside its wrapping title", async ({ page, baseURL }) => {
    const fixture = await openScene(page, baseURL, 'background-tasks-sheet')
    try {
      await expectTouchTargets([
        page.getByRole('dialog', { name: /^Background tasks · / }).getByRole('button', { name: 'Close', exact: true }),
      ])
    } finally { fixture.assertHealthy() }
  })

  test('Knowledge breadcrumbs in the reader and the folder tree', async ({ page, baseURL }) => {
    // A one-letter folder makes the narrowest crumb.
    const state = createWorkspaceFixtureState()
    state.roots.find((root) => root.id === KNOWLEDGE_ROOT_ID)!.name = 'a'
    const fixture = await setupWorkspaceFixture(page, { baseUrl: baseURL!, knowledgeMode: 'hidden', state })
    try {
      await page.goto(fixture.url)
      await page.getByRole('button', { name: 'Session knowledge', exact: true }).click()
      const knowledge = page.getByRole('complementary', { name: 'Session knowledge', exact: true })
      await expect(knowledge.getByRole('heading', { name: KNOWLEDGE_DOCUMENT_TITLE, exact: true })).toBeVisible()
      const reader = knowledge.getByRole('navigation', { name: 'Knowledge breadcrumb', exact: true })
      await expect(reader.getByRole('button', { name: 'a', exact: true })).toBeVisible()
      await expectTouchTargets(await reader.getByRole('button').filter({ visible: true }).all())
      await knowledge.getByRole('button', { name: /^(Show files|Back to files)$/ }).click()
      // The folder tree is the sidebar's Knowledge view, a drawer on a phone.
      const folder = page.getByRole('group', { name: 'Knowledge folder', exact: true })
      await expect(folder.getByRole('button', { name: 'handbook', exact: true })).toBeVisible()
      await expect(folder.getByRole('button', { name: 'a', exact: true })).toBeVisible()
      await expectTouchTargets(await folder.getByRole('button').all())
    } finally { fixture.assertHealthy() }
  })

  test("the header folder, down to a home folder's ~/", async ({ page, baseURL }) => {
    const fixture = await openScene(page, baseURL, 'conversation')
    try {
      const folder = page.getByRole('button', { name: 'Browse current session folder', exact: true })
      await expectTouchTargets([folder])
      const session = fixture.state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
      session.cwd = '/home/demo'
      session.revision = (session.revision ?? 0) + 1
      fixture.emit({ type: 'session.upserted', session })
      await expect(folder).toHaveText('~/')
      await expectTouchTargets([folder])
    } finally { fixture.assertHealthy() }
  })

  test('Scroll to latest', async ({ page, baseURL }) => {
    const fixture = await openScene(page, baseURL, 'conversation-tool-rows')
    try {
      await page.getByRole('button', { name: /^Completed: Bash/ }).first().tap()
      await expect(page.getByRole('button', { name: 'Copy output' }).first()).toBeVisible()
      await page.locator('.timeline').evaluate((timeline) => { timeline.scrollTop = 0 })
      await expectTouchTargets([page.getByRole('button', { name: 'Scroll to latest', exact: true })])
    } finally { fixture.assertHealthy() }
  })

  test('the All filter', async ({ page, baseURL }) => {
    const fixture = await openScene(page, baseURL, 'session-list')
    try {
      await expectTouchTargets([page.getByRole('group', { name: 'Filter sessions', exact: true })
        .getByRole('button', { name: 'All', exact: true })])
    } finally { fixture.assertHealthy() }
  })

  test('the new-session tabs', async ({ page, baseURL }) => {
    const fixture = await openScene(page, baseURL, 'new-session-dialog')
    try {
      await expectTouchTargets(await page.getByRole('tablist', { name: 'Session type', exact: true }).getByRole('tab').all())
    } finally { fixture.assertHealthy() }
  })
})

const LONG_ROW_TITLE = 'Collect the review notes and the handbook drafts nobody has opened yet'
const LONG_TASKS_TITLE = 'Audit the release links across every handbook chapter and the archive'
/** Titles too long for one line in any row. */
const longTitles = new Set([
  LONG_ROW_TITLE, LONG_TASKS_TITLE, 'Review the complete field guide and the scheduled recovery checklist',
])

/**
 * Rows with short titles and titles too long for one line, each with and
 * without the Tasks label, besides an unread row and a listed hidden one,
 * whose controls read Mark as read and Show.
 */
function sessionRowsState() {
  const state = createWorkspaceFixtureState()
  const idle = state.sessions.find((session) => session.id === IDLE_SESSION_ID)!
  const tasks = state.sessions.find((session) => session.id === BACKGROUND_SESSION_ID)!
  const notes = { ...structuredClone(idle), id: 'fixture-collect-notes', title: LONG_ROW_TITLE }
  const audit = { ...structuredClone(tasks), id: 'fixture-audit-links', title: LONG_TASKS_TITLE }
  state.sessions.push(notes, audit)
  state.sessionOrder.order['fixture-studio'].push(`fixture-studio:${notes.id}`)
  state.sessionOrder.order['fixture-build'].push(`fixture-build:${audit.id}`)
  state.sessionOrder.unread = [`fixture-studio:${IDLE_SESSION_ID}`]
  state.sessionOrder.hidden = [`fixture-studio:${notes.id}`]
  state.sessionOrder.showHidden = true
  return state
}

/** A session row's controls, and the box, content and other parts of the row around them. */
function sessionRowLayout(row: Element) {
  const rect = (element: Element) => {
    const { left, right, top, bottom, width, height } = element.getBoundingClientRect()
    return { left, right, top, bottom, width, height }
  }
  const control = (name: RegExp) => {
    const button = [...row.querySelectorAll('button')].find((each) => name.test(each.getAttribute('aria-label') ?? ''))
    if (!button) throw new Error(`No ${name} control in the row`)
    return rect(button)
  }
  const style = getComputedStyle(row)
  const px = (property: string) => Number.parseFloat(style.getPropertyValue(property))
  const box = rect(row)
  const title = row.querySelector('.session-item__text > strong')!
  return {
    title: title.textContent ?? '',
    lines: Math.round(title.getBoundingClientRect().height / Number.parseFloat(getComputedStyle(title).lineHeight)),
    // Cut short with an ellipsis rather than wrapped.
    clipped: title.scrollWidth > title.clientWidth && getComputedStyle(title).textOverflow === 'ellipsis',
    borders: px('border-top-width') + px('border-bottom-width'),
    row: box,
    content: {
      top: box.top + px('border-top-width') + px('padding-top'),
      bottom: box.bottom - px('border-bottom-width') - px('padding-bottom'),
    },
    // The tallest of what the row lays out besides its controls.
    rest: Math.max(...[...row.querySelectorAll(':scope > .drag-handle, :scope > .session-item__body')]
      .map((part) => part.getBoundingClientRect().height)),
    parts: [...row.querySelectorAll('.drag-handle, .session-item__text, .session-item__tasks, .session-origin-run-link')]
      .map(rect),
    close: control(/^Close /),
    hide: control(/^(Hide|Show) /),
    read: control(/^Mark .+ as (read|unread)$/),
  }
}

/**
 * Where a row's badges, title text and folder line start, the middle of the
 * title's line, its unread dot, and the inner edge of the row's leading bar,
 * where the gutter for that dot begins.
 */
function sessionRowText(row: Element) {
  const title = row.querySelector('.session-item__text > strong')!
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node && !node.textContent?.trim()) node = walker.nextNode()
  const range = document.createRange()
  range.selectNodeContents(node!)
  const line = range.getClientRects()[0]
  const left = (selector: string) => row.querySelector(selector)!.getBoundingClientRect().left
  const dot = row.querySelector('.session-item__unread-dot')?.getBoundingClientRect()
  return {
    name: title.textContent ?? '',
    badges: left('.session-item__badges > :first-child'),
    title: line.left,
    titleMiddle: (line.top + line.bottom) / 2,
    folder: left('.session-item__where > :first-child'),
    gutter: row.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(row).borderLeftWidth),
    dot: dot ? { left: dot.left, right: dot.right, top: dot.top, bottom: dot.bottom } : undefined,
  }
}

/** The rows of `sessionRowsState`, in the list a phone opens first. */
async function openSessionRows(page: Page, baseURL: string, touch: boolean) {
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl: baseURL,
    knowledgeMode: 'hidden',
    state: sessionRowsState(),
    taskSnapshots: { 'fixture-build:fixture-audit-links': fixtureBackgroundTasks[BACKGROUND_SESSION_ID] },
  })
  await page.goto(fixture.url)
  if (touch) await page.getByRole('button', { name: 'Open sessions', exact: true }).click()
  return fixture
}

/** How far the list's first session sits below its top, and how tall each control above it is. */
function sessionListChrome(nav: Element) {
  const heights = (selector: string) => [...nav.querySelectorAll(selector)].map((element) => element.getBoundingClientRect().height)
  return {
    chrome: nav.querySelector('.session-item')!.getBoundingClientRect().top - nav.getBoundingClientRect().top,
    controls: {
      'header buttons': heights('.session-list__actions > button'),
      order: heights('.session-sort select'),
      search: heights('.session-search'),
      filters: heights('.session-filter'),
      'New category': heights('.session-categories__new'),
      'category toggles': heights('.session-category__toggle'),
      'category menus': heights('.session-category__menu-button'),
      'more sessions': heights('.session-category__more'),
    },
  }
}

/** Each control's height above the sessions, which tightening the chrome leaves alone. */
const chromeTargets = {
  desktop: {
    'header buttons': 30, order: 36, search: 36, filters: 32,
    'New category': 28, 'category toggles': 30, 'category menus': 28, 'more sessions': 28,
  },
  phone: {
    'header buttons': 44, order: 40, search: 44, filters: 40,
    'New category': 40, 'category toggles': 40, 'category menus': 40, 'more sessions': 40,
  },
}

/** The most room above the first session (#700): 199/154px on a desktop and 249/188px on a phone before. */
const chromeBudget = {
  desktop: { 'session-list': 180, 'session-categories': 147 },
  phone: { 'session-list': 230, 'session-categories': 181 },
}

for (const viewport of [uiViewports[0], phone]) {
  test.describe(`queued prompts ${viewport.name}`, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })

    test('centre each grip in its handle', async ({ page, baseURL }) => {
      const fixture = await openScene(page, baseURL, 'composer-busy-queue')
      try {
        const offsets = await page.locator('.queued-prompt > .drag-handle').evaluateAll((handles) => handles.map((handle) => {
          const box = handle.getBoundingClientRect()
          const grip = handle.querySelector('svg')!.getBoundingClientRect()
          return {
            x: grip.left + grip.width / 2 - (box.left + box.width / 2),
            y: grip.top + grip.height / 2 - (box.top + box.height / 2),
          }
        }))
        expect(offsets).toHaveLength(2)
        for (const offset of offsets) {
          expect(Math.abs(offset.x), 'horizontal offset').toBeLessThanOrEqual(1)
          expect(Math.abs(offset.y), 'vertical offset').toBeLessThanOrEqual(1)
        }
      } finally { fixture.assertHealthy() }
    })

    for (const name of ['composer-busy-queue', 'composer-busy-queue-light'] as const) {
      test(`keep queued text at 4.5:1 and the Stop icon at 3:1 in ${name.endsWith('-light') ? 'light' : 'graphite'}`, async ({ page, baseURL }) => {
        const fixture = await openScene(page, baseURL, name)
        try {
          const queue = page.getByRole('region', { name: 'Queued prompts' })
          const text = [...await queue.locator('header > *').all(), ...await queue.locator('.queued-prompt > span:nth-child(2)').all()]
          expect(text).toHaveLength(4)
          for (const line of text) {
            expect(await line.evaluate(paintedContrast), await line.textContent() ?? '').toBeGreaterThanOrEqual(4.5)
          }
          const stop = page.getByRole('button', { name: 'Stop response', exact: true }).locator('svg')
          expect(await stop.evaluate(paintedContrast), 'Stop icon').toBeGreaterThanOrEqual(3)
          // A message waiting to steer the running turn is labelled in the task colour.
          const session = fixture.state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
          session.queuedPrompts![0].steer = true
          session.revision = (session.revision ?? 0) + 1
          fixture.emit({ type: 'session.upserted', session })
          const steer = page.locator('.queued-prompt__steer')
          await expect(steer).toBeVisible()
          expect(await steer.evaluate(paintedContrast), 'Steer label').toBeGreaterThanOrEqual(4.5)
        } finally { fixture.assertHealthy() }
      })

      test(`keep Save to queue at 4.5:1 while a queued prompt is rewritten in ${name.endsWith('-light') ? 'light' : 'graphite'}`, async ({ page, baseURL }) => {
        const fixture = await openScene(page, baseURL, name)
        try {
          await page.getByRole('button', { name: 'Edit queued prompt 1', exact: true }).click()
          const save = page.getByRole('button', { name: 'Save to queue', exact: true })
          await expect(save).toBeEnabled()
          expect(await save.evaluate(paintedContrast)).toBeGreaterThanOrEqual(4.5)
        } finally { fixture.assertHealthy() }
      })
    }
  })

  test.describe(`recording strip ${viewport.name}`, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })

    test('sits inside the composer, inset like the buttons it replaces', async ({ page, baseURL }) => {
      await mockMicrophone(page)
      const fixture = await openScene(page, baseURL, 'conversation')
      try {
        // A fixed clock holds the strip's timer at 0:00 for the lock.
        await page.clock.setFixedTime(await page.evaluate(() => Date.now()))
        await page.getByRole('button', { name: 'Start microphone recording', exact: true }).click()
        await expect(page.locator('.composer > .recording-panel')).toContainText('Recording 0:00')
        const layout = await page.locator('.composer').evaluate((composer) => {
          const outer = composer.getBoundingClientRect()
          const frame = getComputedStyle(composer)
          const strip = composer.querySelector(':scope > .recording-panel')!
          const box = strip.getBoundingClientRect()
          const own = getComputedStyle(strip)
          return {
            border: [own.borderTopWidth, own.borderRightWidth, own.borderBottomWidth, own.borderLeftWidth],
            left: box.left - outer.left - parseFloat(frame.borderLeftWidth),
            right: outer.right - parseFloat(frame.borderRightWidth) - box.right,
            bottom: outer.bottom - parseFloat(frame.borderBottomWidth) - box.bottom,
          }
        })
        // No border of its own along the composer's, so no doubled edge.
        expect(layout.border).toEqual(['0px', '0px', '0px', '0px'])
        for (const side of ['left', 'right', 'bottom'] as const) {
          expect(layout[side], `${side} inset`).toBeGreaterThanOrEqual(5.5)
        }
        await assertNoHorizontalOverflow(page)
        await expect(page.locator('.composer-area')).toHaveScreenshot(`${viewport.name}-composer-recording.png`, lockedScreenshot)
      } finally { fixture.assertHealthy() }
    })
  })

  test.describe(`session rows ${viewport.name}`, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })

    // A schedule-origin row gives its Tasks label a cell of its own beside the
    // text, so it is checked as well as a plain row.
    for (const [scene, title] of [
      ['session-list', 'Check handbook links'],
      ['session-origin-tasks', 'Review the complete field guide and the scheduled recovery checklist'],
    ] as const) {
      test(`keep the Tasks label on the badges line and its target inside a ${scene === 'session-list' ? 'plain' : 'schedule-origin'} row`, async ({ page, baseURL }) => {
        const fixture = await openScene(page, baseURL, scene)
        try {
          const tasks = page.getByRole('navigation', { name: 'Sessions', exact: true })
            .getByRole('button', { name: `View background tasks for ${title}`, exact: true })
          await tasks.scrollIntoViewIfNeeded()
          const offset = await tasks.evaluate((button) => {
            const label = document.createRange()
            label.selectNodeContents(button.lastChild!)
            const text = label.getBoundingClientRect()
            const badge = button.parentElement!.querySelector('.provider-badge')!.getBoundingClientRect()
            return (text.top + text.bottom) / 2 - (badge.top + badge.bottom) / 2
          })
          expect(Math.abs(offset), 'Tasks label below its badges line').toBeLessThanOrEqual(1)
          // Its target takes no touch meant for the row above or below.
          const extent = await tasks.evaluate(touchExtent)
          const row = await tasks.evaluate((button) => {
            const box = button.closest('.session-item')!.getBoundingClientRect()
            return { top: box.top, bottom: box.bottom }
          })
          expect(extent.top, 'Tasks target above its row').toBeGreaterThanOrEqual(row.top)
          expect(extent.bottom, 'Tasks target below its row').toBeLessThanOrEqual(row.bottom)
          if (viewport.hasTouch) expect(extent.height, 'Tasks target height').toBeGreaterThanOrEqual(40)
        } finally { fixture.assertHealthy() }
      })
    }

    // #700: every row keeps a gutter for the unread dot, so a title, its
    // badges and its folder start at one x whether it is read or not, in a
    // computer's group, an open category and a closed one's summary.
    for (const setup of ['computer groups', 'categories'] as const) {
      test(`start every row's text at one x past the unread gutter in ${setup}`, async ({ page, baseURL }) => {
        const fixture = setup === 'categories'
          ? await openScene(page, baseURL, 'session-categories')
          : await openSessionRows(page, baseURL!, viewport.hasTouch)
        try {
          const items = page.getByRole('navigation', { name: 'Sessions', exact: true }).locator('.session-item')
          await expect(items.first()).toBeVisible()
          const rows: ReturnType<typeof sessionRowText>[] = []
          for (const item of await items.all()) rows.push(await item.evaluate(sessionRowText))
          expect(rows.length, 'rows').toBeGreaterThan(3)
          const x = rows[0].badges
          for (const row of rows) {
            for (const part of ['badges', 'title', 'folder'] as const) {
              expect(Math.abs(row[part] - x), `${row.name}: ${part} in line`).toBeLessThanOrEqual(0.5)
            }
          }
          const unread = rows.filter((row) => row.dot)
          expect(unread.map((row) => row.name)).toEqual(['Draft the weekly summary'])
          for (const { name, dot, gutter, titleMiddle } of unread) {
            // Clear of the bar and the text, centred between them, on the title's line.
            expect(dot!.left - gutter, `${name}: dot clear of the bar`).toBeGreaterThanOrEqual(2)
            expect(x - dot!.right, `${name}: dot clear of the text`).toBeGreaterThanOrEqual(2)
            expect(Math.abs((dot!.left + dot!.right) / 2 - (gutter + x) / 2), `${name}: dot centred in the gutter`)
              .toBeLessThanOrEqual(0.5)
            expect(Math.abs((dot!.top + dot!.bottom) / 2 - titleMiddle), `${name}: dot on the title's line`)
              .toBeLessThanOrEqual(1)
          }
        } finally { fixture.assertHealthy() }
      })
    }

    // The header, search, filters, New category and the group or category
    // header above the first session take less room (#700), and every control
    // among them keeps its size.
    for (const scene of ['session-list', 'session-categories'] as const) {
      test(`keep the chrome above the first session within its budget in ${scene}`, async ({ page, baseURL }) => {
        const fixture = await openScene(page, baseURL, scene)
        try {
          const { chrome, controls } = await page.getByRole('navigation', { name: 'Sessions', exact: true })
            .evaluate(sessionListChrome)
          const device = viewport.hasTouch ? 'phone' : 'desktop'
          expect(chrome, 'chrome above the first session').toBeLessThanOrEqual(chromeBudget[device][scene])
          for (const [name, heights] of Object.entries(controls)) {
            for (const height of heights) {
              expect(height, `${name} height`).toBeGreaterThanOrEqual(chromeTargets[device][name as keyof typeof controls] - 0.5)
            }
          }
          expect(controls['category toggles'].length, 'category headers').toBe(scene === 'session-categories' ? 2 : 0)
        } finally { fixture.assertHealthy() }
      })
    }

    // Close, Hide, then Mark as read or unread, as the keyboard reaches them.
    // A mouse gets one column of 22px controls that leaves the title more room;
    // touch keeps Close beside Hide over Read, since a column of 40px targets
    // would make every row taller.
    for (const setup of ['plain', 'schedule-origin'] as const) {
      test(`${viewport.hasTouch ? 'keep Close beside Hide over Read' : 'stack Close, Hide and Read in one column'} in ${setup} rows without making them taller`, async ({ page, baseURL }) => {
        let fixture: Awaited<ReturnType<typeof setupWorkspaceFixture>>
        if (setup === 'plain') {
          fixture = await openSessionRows(page, baseURL!, viewport.hasTouch)
        } else {
          fixture = await openScene(page, baseURL, 'session-origin-tasks')
        }
        try {
          if (!viewport.hasTouch) await assertMousePointer(page)
          const list = page.getByRole('navigation', { name: 'Sessions', exact: true })
          const rows = list.locator('.session-item')
          if (setup === 'plain') {
            await expect(list.getByRole('button', { name: `View background tasks for ${LONG_TASKS_TITLE}`, exact: true }))
              .toBeVisible()
            await expect(rows).toHaveCount(8)
          } else {
            await expect(list.locator('.session-item__body--task-status:has(> .session-origin-run-link)')).toHaveCount(1)
          }
          const lines = new Set<number>()
          for (const row of await rows.all()) {
            await row.scrollIntoViewIfNeeded()
            if (!viewport.hasTouch) {
              // Still revealed by pointing at the row.
              const reveal = row.getByRole('button', { name: /^(Hide|Show) / })
              await page.mouse.move(0, 0)
              await expect(reveal).toHaveCSS('opacity', '0')
              await row.hover()
              await expect(reveal).toHaveCSS('opacity', '1')
            }
            const { title, row: box, content, rest, parts, close, hide, read, ...layout } = await row.evaluate(sessionRowLayout)
            lines.add(layout.lines)
            for (const control of [close, hide, read]) {
              // The desktop column is as tall as the row, so it reaches the
              // row's edges and no further.
              expect(control.top, `${title}: control top`).toBeGreaterThanOrEqual(box.top - 0.5)
              expect(control.bottom, `${title}: control bottom`).toBeLessThanOrEqual(box.bottom + 0.5)
              expect(control.right, `${title}: control right`).toBeLessThanOrEqual(box.right)
              for (const part of parts) {
                expect(part.right, `${title}: handle, text and Tasks clear of the controls`).toBeLessThanOrEqual(control.left)
              }
            }
            let controlsHeight = 0
            if (viewport.hasTouch) {
              expect(close.right, `${title}: Close beside Hide`).toBeLessThanOrEqual(hide.left)
              expect(Math.abs(read.left - hide.left), `${title}: Read under Hide`).toBeLessThan(0.5)
              expect(hide.bottom, `${title}: Hide over Read`).toBeLessThanOrEqual(read.top)
              expect(Math.abs((close.top + close.bottom) / 2 - (hide.top + read.bottom) / 2), `${title}: Close centred beside them`)
                .toBeLessThanOrEqual(1)
              for (const control of [close, hide, read]) {
                expect(control.width, `${title}: target width`).toBeGreaterThanOrEqual(40)
                expect(control.height, `${title}: target height`).toBeGreaterThanOrEqual(40)
              }
              // Two targets tall, as before.
              controlsHeight = read.bottom - hide.top
              expect(controlsHeight, `${title}: controls height`).toBeLessThanOrEqual(2 * 40 + 2)
            } else {
              for (const control of [hide, read]) {
                expect(Math.abs(control.left - close.left), `${title}: one column`).toBeLessThan(0.5)
              }
              expect(close.bottom, `${title}: Close over Hide`).toBeLessThanOrEqual(hide.top)
              expect(hide.bottom, `${title}: Hide over Read`).toBeLessThanOrEqual(read.top)
              for (const control of [close, hide, read]) {
                expect(control.width, `${title}: control width`).toBeCloseTo(22, 0)
                expect(control.height, `${title}: control height`).toBeCloseTo(22, 0)
              }
              expect(Math.abs((close.top + read.bottom) / 2 - (content.top + content.bottom) / 2), `${title}: centred on the row`)
                .toBeLessThanOrEqual(1)
            }
            // As tall as its controls and no taller (#700): with a mouse their
            // column reaches the row's edges, and on touch the two targets sit
            // inside its borders. Only a schedule's run link and Tasks label,
            // 40px targets of their own, make a row taller.
            const controls = viewport.hasTouch ? read.bottom - hide.top + layout.borders : read.bottom - close.top
            expect(box.height, `${title}: row height`).toBeCloseTo(Math.max(controls, rest + layout.borders), 0)
            if (setup === 'plain' && !viewport.hasTouch) {
              expect(box.height, `${title}: desktop row height`).toBeLessThanOrEqual(70.5)
            }
            // A long title is cut short on its one line rather than wrapped.
            if (longTitles.has(title)) expect(layout.clipped, `${title}: clipped with an ellipsis`).toBe(true)
          }
          if (viewport.hasTouch) {
            await expectTouchTargets(await rows.getByRole('button', { name: /^(Close |Hide |Show |Mark )/ }).all())
          }
          expect([...lines], 'title lines').toEqual([1])
          await assertNoHorizontalOverflow(page)
        } finally { fixture.assertHealthy() }
      })
    }
  })
}

test.describe('phone sheets and reading', () => {
  test.use({ viewport: phone.viewport, isMobile: phone.isMobile, hasTouch: phone.hasTouch })

  // §11: an installed iPhone reports its home indicator as a 34px inset.
  for (const bottom of [0, 34]) {
    test(`end a sheet's last action ${bottom ? 'above the home indicator' : 'clear of the screen edge'}`, async ({ page, baseURL, context }) => {
      if (bottom) {
        const session = await context.newCDPSession(page)
        await session.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 59, bottom, left: 0, right: 0 } })
      }
      const fixture = await openScene(page, baseURL, 'runtime-dialog')
      try {
        const apply = page.getByRole('dialog', { name: 'Model and context' })
          .getByRole('button', { name: 'Apply runtime settings', exact: true })
        await apply.scrollIntoViewIfNeeded()
        const below = await apply.evaluate((button) => window.innerHeight - button.getBoundingClientRect().bottom)
        expect(below).toBeGreaterThanOrEqual(Math.max(12, bottom) - 0.5)
      } finally { fixture.assertHealthy() }
    })
  }

  test('line settings up with their search field', async ({ page, baseURL }) => {
    const fixture = await openScene(page, baseURL, 'app-settings')
    try {
      const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
      const search = (await dialog.getByRole('searchbox', { name: 'Search settings' })
        .or(dialog.getByRole('textbox', { name: 'Search settings' })).boundingBox())!
      const field = (await dialog.getByRole('combobox', { name: 'GitHub Copilot default model', exact: true }).boundingBox())!
      expect(Math.abs(field.x - search.x), 'left edges').toBeLessThanOrEqual(0.5)
      expect(Math.abs(field.x + field.width - search.x - search.width), 'right edges').toBeLessThanOrEqual(0.5)
    } finally { fixture.assertHealthy() }
  })

  test('read the sheet eyebrow and the status line computer at 4.5:1 in light', async ({ page, baseURL }) => {
    const fixture = await openScene(page, baseURL, 'background-tasks-sheet-light')
    try {
      const eyebrow = page.getByRole('dialog', { name: /^Background tasks · / }).locator('.eyebrow')
      const computer = page.getByTestId('web-statusline').locator('.web-statusline__computer')
      for (const text of [eyebrow, computer]) {
        expect(await text.evaluate(paintedContrast), await text.textContent() ?? '').toBeGreaterThanOrEqual(4.5)
      }
    } finally { fixture.assertHealthy() }
  })

  test('hang a Knowledge task checkbox where the bullet was', async ({ page, baseURL }) => {
    const fixture = await setupWorkspaceFixture(page, { baseUrl: baseURL!, knowledgeMode: 'hidden' })
    try {
      await page.goto(fixture.url)
      await page.getByRole('button', { name: 'Session knowledge', exact: true }).click()
      const knowledge = page.getByRole('complementary', { name: 'Session knowledge', exact: true })
      await expect(knowledge.getByRole('heading', { name: KNOWLEDGE_DOCUMENT_TITLE, exact: true })).toBeVisible()
      const items = knowledge.locator('.task-list-item')
      await expect(items).toHaveCount(3)
      const tasks = await items.evaluateAll((elements) => elements.map((item) => {
        const text = [...item.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim())!
        const range = document.createRange()
        range.selectNodeContents(text)
        return { marker: getComputedStyle(item).listStyleType, lines: [...range.getClientRects()].map((line) => line.left) }
      }))
      expect(tasks.some((task) => task.lines.length > 1), 'a task that wraps').toBe(true)
      for (const task of tasks) {
        expect(task.marker).toBe('none')
        // A wrapped line starts where the first one's text does, after the box.
        expect(Math.max(...task.lines) - Math.min(...task.lines)).toBeLessThanOrEqual(1)
      }
    } finally { fixture.assertHealthy() }
  })
})

// App.test.tsx covers reconciliation, receipt failures, serialized queue races,
// clipboard variants and history ownership. These locks add real-browser event
// and HTTP wiring rather than duplicating that component-level matrix.
test.describe('browser interaction contracts', () => {
  test.use({ viewport: uiViewports[0].viewport, isMobile: false, hasTouch: false })
  let fixture: UISceneHandle | undefined

  async function open(page: Page, baseURL: string | undefined, name: UISceneName) {
    fixture = await createUIScenes(baseURL).find((scene) => scene.name === name)!.setup(page)
    return fixture
  }

  test.afterEach(async ({ page }) => {
    fixture?.assertHealthy()
    await assertNoHorizontalOverflow(page)
    fixture = undefined
  })

  for (const viewport of [uiViewports[0], uiViewports[2]]) {
    test.describe(`feature-only navigation ${viewport.name}`, () => {
      test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
      for (const [preview, scene, label] of [
        ['notificationPanel', 'notification-panel', 'Notifications'],
        ['hostMonitorView', 'host-monitor', 'Host monitor'],
        ['schedulerView', 'scheduler', 'Scheduler'],
      ] as const) {
        test(`keeps only ${label} and Settings reachable without desktop rail`, async ({ page, baseURL }) => {
          await open(page, baseURL, scene)
          await page.evaluate(async (preview) => {
            const { settings } = await fetch('/api/settings').then((response) => response.json())
            const response = await fetch('/api/settings', {
              method: 'PATCH', headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ changes: { previewFeatures: {
                value: { [preview]: true }, baseRevision: settings.revision,
              } } }),
            })
            if (!response.ok) throw new Error('Synthetic preview update failed')
          }, preview)
          await expect(page.locator('.app-shell')).not.toHaveClass(/app-shell--rail/)
          const dialog = page.getByRole('dialog', { name: label, exact: true })
          await dialog.getByRole('button', { name: 'Close', exact: true }).click()
          const navigation = page.getByRole('navigation', { name: 'App navigation', exact: true })
          const entry = navigation.getByRole('button', { name: new RegExp(`^${label}(?:,|$)`) })
          await expect(entry).toBeVisible()
          // An icon beside App settings, named by its tooltip.
          await expect(page.locator('.sidebar-settings').getByRole('navigation', { name: 'App navigation', exact: true })).toBeVisible()
          await expect(entry).toHaveAttribute('title', label)
          await expect(entry).not.toContainText(label)
          await expect(page.getByRole('button', { name: 'App settings', exact: true })).toHaveCount(1)
          await entry.click()
          await expect(dialog).toBeVisible()
          await dialog.getByRole('button', { name: 'Close', exact: true }).click()
          await page.getByRole('button', { name: 'App settings', exact: true }).click()
          await expect(page.getByRole('dialog', { name: 'App settings', exact: true })).toBeVisible()
        })
      }
    })
  }

  test('keeps every settings-row button whole at the narrowest sidebar', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'conversation')
    await page.route('**/api/features', (route) => route.fulfill({
      json: { hubFlags: { notificationCenter: true, hostMonitor: true, scheduler: true } },
    }))
    await page.evaluate(async (revision) => {
      await fetch('/api/settings', { method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ changes: { previewFeatures: {
          value: { notificationPanel: true, hostMonitorView: true, schedulerView: true }, baseRevision: revision,
        } } }) })
    }, handle.state.settings.revision)
    await page.reload()
    const row = page.locator('.sidebar-settings')
    await expect(row.getByRole('button', { name: 'Scheduler', exact: true })).toBeVisible()
    // Shrink the sidebar to its minimum from the keyboard; it clamps at 220px.
    const resizer = page.locator('.sidebar-resizer')
    await resizer.focus()
    for (let step = 0; step < 4; step += 1) await page.keyboard.press('Shift+ArrowLeft')
    await expect.poll(async () => (await page.locator('.sidebar').boundingBox())!.width).toBeLessThanOrEqual(221)
    for (const name of ['App settings', 'Host monitor', 'Notifications', 'Scheduler', 'Manage computers']) {
      const box = (await row.getByRole('button', { name, exact: true }).boundingBox())!
      expect(box.width, `${name} width`).toBeGreaterThanOrEqual(40)
    }
    expect(await row.evaluate((element) => element.scrollWidth - element.clientWidth), 'row overflow').toBeLessThanOrEqual(0)
  })

  test('rail omits Oracle when the manager is unavailable', async ({ page, baseURL }) => {
    await open(page, baseURL, 'desktop-rail')
    await expect(page.getByRole('navigation', { name: 'App navigation' }).getByRole('button', { name: 'Open Oracle' })).toHaveCount(0)
    await expect(page.locator('#oracle-panel')).toHaveCount(0)
  })

  test('keeps every Session actions icon at its size beside entries with a description', async ({ page, baseURL }) => {
    await open(page, baseURL, 'session-actions')
    await page.setViewportSize({ width: 960, height: 900 })
    const actions = page.getByRole('group', { name: 'Session actions', exact: true })
    await expect(actions.getByRole('button', { name: 'Close session', exact: true })).toBeVisible()
    // A long description must not shrink its icon and pull the label out of line.
    const squeezed = await actions.locator('.session-action > svg').evaluateAll((icons) => icons
      .map((icon) => ({
        entry: icon.parentElement?.getAttribute('aria-label'),
        width: icon.getBoundingClientRect().width,
        size: Number(icon.getAttribute('width')),
      }))
      .filter(({ width, size }) => Math.abs(width - size) > 0.5))
    expect(squeezed).toEqual([])
  })

  test('rail opens Oracle and offers only implemented views', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'oracle-panel')
    await page.getByRole('button', { name: 'Close Oracle', exact: true }).click()
    await page.evaluate(async (revision) => {
      await fetch('/api/settings', { method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ changes: { previewFeatures: { value: { desktopRail: true }, baseRevision: revision } } }) })
    }, handle.state.settings.revision)
    const navigation = page.getByRole('navigation', { name: 'App navigation' })
    await expect(navigation.getByRole('button', { name: 'Notifications' })).toHaveCount(0)
    await expect(navigation.getByRole('button', { name: 'Host monitor' })).toHaveCount(0)
    await expect(navigation.getByRole('button', { name: 'Scheduler' })).toHaveCount(0)
    await navigation.getByRole('button', { name: 'Open Oracle', exact: true }).click()
    await expect(page.locator('#oracle-panel')).toBeVisible()
  })

  test('keeps rail navigation and docked Oracle within layout budgets', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'oracle-panel')
    await page.evaluate(async (revision) => {
      await fetch('/api/settings', { method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ changes: { previewFeatures: { value: { desktopRail: true }, baseRevision: revision } } }) })
    }, handle.state.settings.revision)
    await page.getByRole('button', { name: 'Dock Oracle', exact: true }).click()
    for (const width of [1083, 1050, 1024, 1023, 990, 961]) {
      await page.setViewportSize({ width, height: 900 })
      await expect(page.locator('#oracle-panel')).not.toHaveClass(/manager-panel--docked/)
      await expect.poll(() => page.getByRole('main').evaluate((main) => main.getBoundingClientRect().width)).toBeGreaterThanOrEqual(360)
      expect(await page.locator('.shell-rail').evaluate((rail) => rail.getBoundingClientRect().width)).toBe(64)
      await assertNoHorizontalOverflow(page)
    }
    expect(await page.evaluate(() => localStorage.getItem('agentic-remote:oracle-placement'))).toBe('docked')
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(page.locator('#oracle-panel')).toHaveClass(/manager-panel--docked/)
    await expect.poll(() => page.locator('#oracle-panel').evaluate((panel) =>
      panel.getBoundingClientRect().right - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
  })

  test('lets native Tab leave delivery choices and restores Escape to each opener', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'composer-delivery-menu')
    const menu = page.getByRole('menu', { name: 'Message delivery' })
    const options = page.getByRole('button', { name: 'Send options', exact: true })
    await page.keyboard.press('Tab')
    await expect(menu).toBeHidden()
    await expect(page.getByRole('button', { name: 'Stop response', exact: true })).toBeFocused()
    await options.click()
    await page.keyboard.press('Shift+Tab')
    await expect(menu).toBeHidden()
    await expect(options).toBeFocused()
    await options.press('Enter')
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(options).toBeFocused()
    const send = page.getByRole('button', { name: 'Send message', exact: true })
    await send.press('Alt+ArrowDown')
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(send).toBeFocused()
    expect(handle.requests.some((request) => request.path === `${sessionPath}/messages`)).toBe(false)
  })

  test('sends, queues while busy, edits in place, reorders with the keyboard, and stops', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'conversation')
    const session = handle.state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
    await message(page).fill('Review the fixture plan.')
    const sent = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/messages`)
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
    expect((await sent).postDataJSON()).toMatchObject({ content: 'Review the fixture plan.', replaceTerminalDraft: true })
    await expect(message(page)).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Stop response', exact: true })).toBeVisible()
    expect(session.messages.at(-1)?.content).toBe('Review the fixture plan.')

    for (const content of ['Check the notes.', 'Then check the links.']) {
      await message(page).fill(content)
      const queued = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/messages`)
      await page.getByRole('button', { name: 'Queue message', exact: true }).click()
      expect((await queued).postDataJSON()).toEqual({ content, enqueue: true })
      await expect(message(page)).toHaveValue('')
    }
    const ids = session.queuedPrompts!.map((prompt) => prompt.id)
    await page.getByRole('button', { name: 'Edit queued prompt 1', exact: true }).click()
    await expect(message(page)).toHaveValue('Check the notes.')
    await message(page).fill('Check the revised notes.')
    const edited = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname === `${sessionPath}/queue/${ids[0]}`)
    await page.getByRole('button', { name: 'Save to queue', exact: true }).click()
    expect((await edited).postDataJSON()).toEqual({ content: 'Check the revised notes.' })
    await expect(message(page)).toHaveValue('')
    expect(session.queuedPrompts!.map((prompt) => prompt.id)).toEqual(ids)

    const reorder = page.waitForRequest((request) => request.method() === 'PUT' && new URL(request.url()).pathname === `${sessionPath}/queue`)
    const handleButton = page.getByRole('button', { name: 'Reorder queued prompt 1', exact: true })
    await handleButton.focus()
    await page.keyboard.press('Space')
    await expect(handleButton).toHaveAttribute('aria-pressed', 'true')
    // The drop targets are measured a frame or two after the pickup; an arrow
    // pressed sooner on a loaded host finds none and moves the item over itself.
    await page.evaluate(() => new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    ))
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('region', { name: 'Queued prompts' }).getByRole('status'))
      .toContainText(`over droppable area queued:${ids[1]}`)
    await page.keyboard.press('Space')
    expect((await reorder).postDataJSON()).toEqual({ order: [...ids].reverse() })
    await expect(page.locator('.queued-prompt > span:nth-child(2)')).toHaveText(['Then check the links.', 'Check the revised notes.'])
    expect(session.queuedPrompts!.map((prompt) => prompt.id)).toEqual([...ids].reverse())

    const stopped = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/cancel`)
    await page.getByRole('button', { name: 'Stop response', exact: true }).click()
    expect((await stopped).postDataJSON()).toEqual({})
    await expect(page.getByRole('button', { name: 'Stop response', exact: true })).toBeHidden()
    expect(session.status).toBe('idle')
    expect(session.queuedPrompts).toHaveLength(2)
  })

  test('keeps identified prompt receipts idempotent and reconcilable in the shared fixture', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'conversation')
    const session = handle.state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
    session.launchId = 'fixture-launch'
    const result = await page.evaluate(async ({ path, launchPath }) => {
      const deliver = async () => {
        const response = await fetch(`${path}/messages`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ content: 'One identified fixture prompt.', enqueue: true, deliveryId: 'fixture-root' }),
        })
        return { status: response.status, body: await response.json() }
      }
      const first = await deliver()
      const retry = await deliver()
      const reconciled = await fetch(launchPath).then((response) => response.json())
      return { first, retry, reconciled }
    }, { path: sessionPath, launchPath: '/api/computers/fixture-studio/launches/fixture-launch' })
    expect(result.first.status).toBe(200)
    expect(result.retry.body.receipt).toEqual(result.first.body.receipt)
    expect(result.retry.body.session.revision).toBe(result.first.body.session.revision)
    expect(result.reconciled.launch).toMatchObject({
      launchId: 'fixture-launch', sessionId: SELECTED_SESSION_ID,
      receipts: [{ deliveryId: 'fixture-root', state: 'queued' }],
    })
    expect(session.queuedPrompts?.filter((prompt) => prompt.content === 'One identified fixture prompt.')).toHaveLength(1)
  })

  test('attaches a chosen file and a pasted image and sends their uploaded references', async ({ page, baseURL }) => {
    await open(page, baseURL, 'conversation')
    const chooser = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Attach file or audio recording', exact: true }).click()
    await (await chooser).setFiles({
      name: 'release-notes.md', mimeType: 'text/markdown', buffer: Buffer.from('# Fictional release notes\n'),
    })
    const attachments = page.getByRole('list', { name: 'Attachments', exact: true })
    await expect(attachments.getByRole('listitem', { name: 'release-notes.md attachment' })).toContainText('Attached')
    await message(page).evaluate((element) => {
      const clipboardData = new DataTransfer()
      clipboardData.items.add(new File([new Uint8Array([137, 80, 78, 71])], 'clipboard.png', { type: 'image/png' }))
      clipboardData.setData('text/plain', 'This clipboard text must not be inserted.')
      element.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }))
    })
    await expect(attachments.getByRole('listitem', { name: 'clipboard.png attachment' })).toContainText('Attached')
    await expect(message(page)).not.toHaveValue(/This clipboard text/)
    const sent = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/messages`)
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
    const input = (await sent).postDataJSON() as { content: string }
    expect(input.content).toContain('/home/demo/field-notes/.agentic-remote/uploads/release-notes.md')
    expect(input.content).toContain('/home/demo/field-notes/.agentic-remote/uploads/clipboard.png')
    await expect(attachments).toBeHidden()
  })

  test('records with a mocked microphone and transcribes into the live draft without sending', async ({ page, baseURL }) => {
    await mockMicrophone(page)
    const handle = await open(page, baseURL, 'conversation')
    await message(page).fill('Keep this draft.')
    await page.getByRole('button', { name: 'Start microphone recording', exact: true }).click()
    await expect(page.locator('.recording-panel')).toContainText('Recording 0:00')
    await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeHidden()
    const transcript = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/transcriptions')
    await page.getByRole('button', { name: 'Stop & transcribe', exact: true }).click()
    expect((await transcript).postDataBuffer()!.toString()).toContain('filename="recording.webm"')
    await expect(message(page)).toHaveValue('Keep this draft.\n\nTranscribed fixture note')
    await expect(page.getByRole('button', { name: 'Start microphone recording', exact: true })).toBeEnabled()
    expect(await page.evaluate(() => (window as unknown as { fixtureMicrophone: unknown }).fixtureMicrophone))
      .toEqual({ calls: [{ audio: true }], stopped: 1 })
    expect(handle.requests.some((request) => request.path === `${sessionPath}/messages`)).toBe(false)
  })

  for (const viewport of [uiViewports[0], uiViewports[2]]) {
    test.describe(`line below the composer ${viewport.name}`, () => {
      test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
      test('takes no space while idle or recording and appears only while transcribing', async ({ page, baseURL }) => {
        await mockMicrophone(page)
        let release = () => {}
        const held = new Promise<void>((resolve) => { release = resolve })
        await page.route('**/api/transcriptions', async (route) => {
          await held
          await route.fallback()
        })
        await open(page, baseURL, 'conversation')
        const area = page.locator('.composer-area')
        const line = area.locator('.composer-hint')
        const height = () => area.evaluate((element) => element.getBoundingClientRect().height)
        await expect(line).toHaveCount(0)
        await expect(area).toBeInViewport({ ratio: 1 })
        const idle = await height()

        await page.getByRole('button', { name: 'Start microphone recording', exact: true }).click()
        // The recording panel is the status and carries the timer alone.
        const recording = area.locator('.recording-panel')
        await expect(recording).toHaveRole('status')
        await expect(recording).toContainText(/Recording \d+:\d\d/)
        await expect(line).toHaveCount(0)
        await expect(area).toBeInViewport({ ratio: 1 })
        await page.getByRole('button', { name: 'Stop & transcribe', exact: true }).click()
        await expect(line).toHaveText('Transcribing audio…')
        // Nothing else changes while transcribing, so the idle composer is
        // shorter by exactly the line and its margin.
        const lineBox = await line.evaluate((element) =>
          element.getBoundingClientRect().height + parseFloat(getComputedStyle(element).marginTop))
        expect(lineBox).toBeGreaterThan(0)
        expect(await height()).toBeCloseTo(idle + lineBox, 0)
        await expect(area).toBeInViewport({ ratio: 1 })

        release()
        await expect(message(page)).toHaveValue('Transcribed fixture note')
        await expect(line).toHaveCount(0)
      })
    })
  }

  test('ArrowUp recalls sent history but preserves an unsent draft and its durable storage', async ({ page, baseURL }) => {
    await open(page, baseURL, 'conversation')
    await message(page).focus()
    await page.keyboard.press('ArrowUp')
    await expect(message(page)).toHaveValue('Help me make this workspace easier to scan. Keep the conversation close while I read our field guide.')
    await page.keyboard.press('ArrowDown')
    await expect(message(page)).toHaveValue('')
    await message(page).fill('My unsent review notes')
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowUp')
    await expect(message(page)).toHaveValue('My unsent review notes')
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('agentic-remote:composer-drafts')!)))
      .toMatchObject({ [`fixture-studio:${SELECTED_SESSION_ID}`]: 'My unsent review notes' })
  })

  test('submits the runtime selection and saves app settings through the hub profile', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'runtime-dialog')
    const dialog = page.getByRole('dialog', { name: 'Model and context', exact: true })
    await dialog.getByRole('combobox', { name: 'Reasoning effort', exact: true }).selectOption('high')
    await dialog.getByRole('combobox', { name: 'Agent mode', exact: true }).selectOption('interactive')
    const changed = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname === `${sessionPath}/runtime`)
    await dialog.getByRole('button', { name: 'Apply runtime settings', exact: true }).click()
    expect((await changed).postDataJSON()).toEqual({
      model: 'fixture-model', reasoningEffort: 'high', contextTier: 'default', mode: 'interactive',
    })
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('button', { name: 'Configure model, effort, and context', exact: true })).toContainText('effort high')
    await page.getByRole('button', { name: 'App settings', exact: true }).click()
    const settings = page.getByRole('dialog', { name: 'App settings', exact: true })
    const saved = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname === '/api/settings')
    await settings.getByRole('combobox', { name: 'How new sessions start', exact: true }).selectOption('sdk')
    expect((await saved).postDataJSON()).toMatchObject({
      changes: { newSessionBackend: { value: 'sdk', baseRevision: expect.any(Number) } },
    })
    await expect.poll(() => handle.state.settings.values.newSessionBackend).toBe('sdk')
    await settings.getByRole('button', { name: 'Close', exact: true }).click()
    await page.getByRole('button', { name: 'App settings', exact: true }).click()
    await expect(page.getByRole('combobox', { name: 'How new sessions start', exact: true })).toHaveValue('sdk')
  })

  test('shows model-family glyphs by default and follows runtime model changes', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'conversation')
    const summary = page.getByTestId('composer-runtime')
    await expect(summary.locator('[data-model-family]')).toHaveAttribute('data-model-family', 'generic')

    for (const [model, family] of [['fixture-claude-99', 'anthropic'], ['fixture-gpt-99', 'openai']]) {
      const session = handle.state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
      session.runtime = { ...session.runtime, model }
      session.revision = (session.revision ?? 0) + 1
      handle.emit({ type: 'session.upserted', session })
      await expect(summary).toContainText(model)
      await expect(summary.locator('[data-model-family]')).toHaveAttribute('data-model-family', family)
      await expect(summary.locator('[data-model-family]')).toHaveAttribute('aria-hidden', 'true')
    }
  })

  test('runtime status is one setup button and explains idle-only changes while busy', async ({ page, baseURL }) => {
    await open(page, baseURL, 'composer-status-busy')
    const summary = page.getByTestId('composer-runtime')
    await expect(summary).toHaveAccessibleDescription(/applies when idle/)
    await expect(summary).toContainText('plan')
    await expect(summary.locator('button')).toHaveCount(0)
    await summary.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Model and context' })).toBeVisible()
  })

  test('composer row attaches using the existing pipeline and opens read-only session resources', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'composer-button-row')
    const chooser = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Attach file or audio recording', exact: true }).click()
    await (await chooser).setFiles({
      name: 'fixture-notes.md', mimeType: 'text/markdown', buffer: Buffer.from('Fictional notes'),
    })
    await expect(page.getByRole('listitem', { name: 'fixture-notes.md attachment' })).toContainText('Attached')
    await page.getByRole('button', { name: 'Session panel', exact: true }).click()
    await page.getByRole('group', { name: 'Session panel' }).getByRole('button', { name: 'Skills', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Skills and MCP servers', exact: true })).toBeVisible()
    expect(handle.requests.some((request) => request.path === `${sessionPath}/messages`)).toBe(false)
  })

  for (const viewport of uiViewports) {
    test.describe(`composer row access ${viewport.name}`, () => {
      test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
      test('keeps touch targets and exposes secondary controls through the session panel', async ({ page, baseURL }) => {
        const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-button-row')!.setup(page)
        try {
          const sizes = await page.locator('.composer-actions button:visible').evaluateAll((buttons) =>
            buttons.map((button) => ({ label: button.getAttribute('aria-label'), width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })))
          for (const size of sizes) {
            expect(size.width, size.label ?? '').toBeGreaterThanOrEqual(40)
            expect(size.height, size.label ?? '').toBeGreaterThanOrEqual(40)
          }
          const setup = page.getByRole('button', { name: 'Session setup', exact: true })
          if (viewport.name === 'phone') {
            await expect(setup).toBeHidden()
            await page.getByRole('button', { name: 'Session panel', exact: true }).click()
          }
          await expect(setup).toBeVisible()
          await setup.focus()
          await page.keyboard.press('Enter')
          await expect(page.getByRole('dialog', { name: 'Model and context' })).toBeVisible()
          await assertNoHorizontalOverflow(page)
        } finally {
          fixture.assertHealthy()
        }
      })
      test('searches and previews sent messages while preserving the unsent draft on cancel', async ({ page, baseURL }) => {
        const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-sent-messages')!.setup(page)
        try {
          const dialog = page.getByRole('dialog', { name: 'Sent messages', exact: true })
          const bounds = await dialog.boundingBox()
          expect(bounds!.height).toBeGreaterThan(200)
          if (viewport.name === 'phone') expect(bounds!.y + bounds!.height).toBeCloseTo(viewport.viewport.height, 0)
          await expect(dialog.getByRole('option')).toHaveCount(2)
          await expect(dialog).not.toContainText('This queued note')
          const search = dialog.getByRole('combobox', { name: 'Search sent messages', exact: true })
          await search.fill('RECOVERY')
          await expect(dialog.getByRole('option')).toHaveCount(1)
          await search.press('ArrowDown')
          await search.press('Enter')
          await expect(message(page)).toHaveValue('Review the recovery checklist and document the remaining checks.')
          expect(await page.evaluate(() => JSON.parse(localStorage.getItem('agentic-remote:composer-drafts')!)))
            .toMatchObject({ [`fixture-studio:${SELECTED_SESSION_ID}`]: 'My unsent review notes' })
          await search.press('Escape')
          await expect(dialog).toBeHidden()
          await expect(message(page)).toHaveValue('My unsent review notes')
          expect(fixture.requests.some((request) => request.path === `${sessionPath}/messages`)).toBe(false)
          await assertNoHorizontalOverflow(page)
        } finally {
          fixture.assertHealthy()
        }
      })
      test('explicit busy send choices reuse immediate and queued delivery', async ({ page, baseURL }) => {
        const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-delivery-menu')!.setup(page)
        try {
          expect(fixture.requests.some((request) => request.path === `${sessionPath}/messages`)).toBe(false)
          const sent = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/messages`)
          await page.getByRole('menuitem', { name: 'Steer — guide the active turn', exact: true }).click()
          expect((await sent).postDataJSON()).toMatchObject({
            content: 'Focus this review on the recovery checklist.', enqueue: false,
          })
          await expect(message(page)).toHaveValue('')
          await message(page).fill('Run these checks afterward.')
          // From 361 to 480 px Send opens the menu itself and its arrow is left out.
          const opener = page.getByRole('button', {
            name: viewport.name === 'phone' ? 'Send message' : 'Send options', exact: true,
          })
          await opener.focus()
          await page.keyboard.press('Enter')
          await expect(page.getByRole('menu', { name: 'Message delivery' })).toBeVisible()
          await page.keyboard.press('ArrowDown')
          const queued = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/messages`)
          await page.keyboard.press('Enter')
          expect((await queued).postDataJSON()).toMatchObject({ content: 'Run these checks afterward.', enqueue: true })
          await expect(message(page)).toHaveValue('')
          await expect(page.getByRole('region', { name: 'Queued prompts' })).toContainText('Run these checks afterward.')
          await expect(page.getByRole('button', { name: 'Stop response', exact: true })).toBeEnabled()
          await assertNoHorizontalOverflow(page)
        } finally {
          fixture.assertHealthy()
        }
      })
      test('unsupported steering has a reason and context-menu/long-press access does not send', async ({ page, baseURL }) => {
        const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-delivery-unavailable')!.setup(page)
        try {
          const steer = page.getByRole('menuitem', { name: /Steer —/ })
          await expect(steer).toHaveAttribute('aria-disabled', 'true')
          await expect(steer).toHaveAccessibleDescription(/does not support steering/)
          await page.keyboard.press('Escape')
          const send = page.getByRole('button', { name: 'Send message', exact: true })
          await send.dispatchEvent('contextmenu')
          await expect(steer).toBeVisible()
          await page.keyboard.press('Escape')
          const bounds = (await send.boundingBox())!
          await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
          await page.mouse.down()
          await expect(steer).toBeVisible()
          await page.mouse.up()
          expect(fixture.requests.some((request) => request.path === `${sessionPath}/messages`)).toBe(false)
          const queued = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/messages`)
          await page.getByRole('menuitem', { name: /Queue —/ }).click()
          expect((await queued).postDataJSON()).toMatchObject({ enqueue: true })
          await assertNoHorizontalOverflow(page)
        } finally {
          fixture.assertHealthy()
        }
      })
    })
  }

  test('persists available previews and respects changed hub availability', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'preview-features')
    const settings = page.getByRole('dialog', { name: 'App settings', exact: true })
    const previews = settings.getByRole('region', { name: 'Preview features', exact: true })
    const notifications = previews.getByRole('checkbox', { name: 'Notification panel', exact: true })
    await expect(notifications).not.toBeChecked()
    await expect(previews.getByRole('checkbox', { name: 'Host monitor', exact: true }))
      .toHaveAccessibleDescription(/Turned off on this hub/)
    const saved = page.waitForRequest((request) =>
      request.method() === 'PATCH' && new URL(request.url()).pathname === '/api/settings')
    await notifications.check()
    expect((await saved).postDataJSON()).toMatchObject({
      changes: { previewFeatures: { value: { notificationPanel: true }, baseRevision: expect.any(Number) } },
    })
    await expect.poll(() => handle.state.settings.values.previewFeatures?.notificationPanel).toBe(true)
    await settings.getByRole('button', { name: 'Close', exact: true }).click()
    await page.getByRole('button', { name: 'App settings', exact: true }).click()
    await settings.getByRole('button', { name: /^Interface/ }).click()
    await expect(notifications).toBeChecked()

    handle.state.hubFlags = { notificationCenter: false, hostMonitor: false, scheduler: false }
    await page.evaluate(() => window.dispatchEvent(new Event('focus')))
    await expect(notifications).toBeDisabled()
    await expect(notifications).toHaveAccessibleDescription(/Turned off on this hub/)
    await expect(notifications).toBeChecked()
    expect(handle.state.settings.values.previewFeatures?.notificationPanel).toBe(true)
  })

  test('filters notification groups and keeps read actions scoped', async ({ page, baseURL }) => {
    await open(page, baseURL, 'notification-panel')
    const panel = page.getByRole('dialog', { name: 'Notifications', exact: true })
    await expect(panel.getByText('2 notifications', { exact: false })).toBeVisible()
    await panel.getByRole('tab', { name: 'Failed', exact: true }).click()
    await expect(panel.getByRole('button', { name: 'Document check failed', exact: true })).toBeVisible()
    await expect(panel.getByRole('button', { name: 'Workspace review complete', exact: true })).toBeHidden()
    const read = page.waitForRequest((request) => new URL(request.url()).pathname === '/api/notifications/read-all')
    await panel.getByRole('button', { name: 'Mark all read in Failed', exact: true }).click()
    expect(new URL((await read).url()).searchParams.get('failed')).toBe('true')
    await panel.getByRole('tab', { name: 'Unread', exact: true }).click()
    await expect(panel.getByRole('button', { name: 'Document check failed', exact: true })).toBeHidden()
    await panel.getByRole('searchbox').fill('Oracle')
    await expect(panel.getByRole('button', { name: 'Oracle has an update', exact: true })).toBeVisible()
    await expect(panel.getByRole('button', { name: 'Workspace review complete', exact: true })).toBeHidden()
  })

  test('shows host history, conservative process links and offline computers', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'host-monitor')
    const monitor = page.getByRole('dialog', { name: 'Host monitor', exact: true })
    for (const minutes of [1, 5, 15]) {
      await expect(monitor.getByText(`Load · ${minutes} min`, { exact: true })).toBeVisible()
      await expect(monitor.getByRole('img', { name: `Load · ${minutes} min trend`, exact: true })).toBeVisible()
    }
    for (const tab of await monitor.getByRole('tab').all()) {
      expect(await tab.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(40)
    }
    await monitor.getByRole('button', { name: '24 h · minute averages', exact: true }).click()
    await expect(monitor).toContainText('1440 minute aggregates')
    await monitor.getByRole('tab', { name: 'Processes', exact: true }).click()
    await expect(monitor).toContainText('Shared Copilot runtime')
    await expect(monitor.getByRole('button', { name: 'Open session', exact: true })).toHaveCount(1)
    await monitor.getByRole('button', { name: 'Agent sessions', exact: true }).click()
    await expect(monitor.getByText('editor', { exact: true })).toBeHidden()
    expect(handle.requests.filter((request) => request.path.endsWith('/host/processes'))).toHaveLength(1)
    await monitor.getByRole('combobox', { name: 'Computer', exact: true }).selectOption('fixture-travel')
    await expect(monitor).toContainText('This computer is offline')
  })

  test('creates a schedule with explicit permissions and accepts a manual run intent', async ({ page, baseURL }) => {
    await open(page, baseURL, 'scheduler-form')
    const scheduler = page.getByRole('dialog', { name: 'Scheduler', exact: true })
    await scheduler.getByRole('button', { name: 'Target', exact: true }).click()
    await scheduler.getByRole('textbox', { name: 'Folder', exact: true }).fill('/home/demo/field-notes')
    await scheduler.getByRole('button', { name: 'Policies', exact: true }).click()
    await expect(scheduler.getByRole('combobox', { name: 'Permission policy', exact: true })).toHaveValue('ask')
    await scheduler.getByRole('combobox', { name: 'Permission policy', exact: true }).selectOption('allow-all')
    await expect(scheduler.getByRole('button', { name: 'Save schedule', exact: true })).toBeDisabled()
    await scheduler.getByRole('checkbox', { name: /I explicitly allow all tool permissions/ }).check()
    const saved = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/schedules')
    await scheduler.getByRole('button', { name: 'Save schedule', exact: true }).click()
    expect((await saved).postDataJSON()).toMatchObject({
      target: { permissionPolicy: 'allow-all', folderTrust: 'ask', mode: 'autopilot' }, workspace: 'checkout',
    })
    await expect(scheduler.getByRole('heading', { name: 'Morning field guide check', exact: true })).toBeVisible()
    const run = page.waitForRequest((request) => request.method() === 'POST' &&
      new URL(request.url()).pathname.startsWith('/api/schedules/') && new URL(request.url()).pathname.endsWith('/run'))
    await scheduler.getByRole('button', { name: 'Run Morning field guide check now', exact: true }).click()
    expect((await run).postDataJSON()).toEqual({})
  })

  test('preserves a schedule draft across another device revision and reloads only on request', async ({ page, baseURL }) => {
    await open(page, baseURL, 'scheduler')
    const scheduler = page.getByRole('dialog', { name: 'Scheduler', exact: true })
    await scheduler.getByRole('button', { name: 'Edit Daily workspace review', exact: true }).click()
    await scheduler.getByRole('textbox', { name: 'Name', exact: true }).fill('Local edited draft')
    await page.evaluate(async () => {
      const response = await fetch('/api/schedules/fixture-daily-review', {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ revision: 1, name: 'Changed on another device' }),
      })
      if (!response.ok) throw new Error('Synthetic concurrent update failed')
    })
    await scheduler.getByRole('button', { name: 'Policies', exact: true }).click()
    await scheduler.getByRole('button', { name: 'Save schedule', exact: true }).click()
    await expect(scheduler.getByRole('alert').first()).toContainText('Conflict')
    await scheduler.getByRole('button', { name: 'Details', exact: true }).click()
    await expect(scheduler.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('Local edited draft')
    await scheduler.getByRole('button', { name: 'Reload latest (replace draft)', exact: true }).click()
    await expect(scheduler.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('Changed on another device')
  })

  test('opens a scheduled notification in its scheduler run history when available', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'notification-panel')
    await page.evaluate(async () => {
      const { settings } = await fetch('/api/settings').then((response) => response.json())
      const response = await fetch('/api/settings', {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ changes: { previewFeatures: {
          value: { ...settings.values.previewFeatures, schedulerView: true }, baseRevision: settings.revision,
        } } }),
      })
      if (!response.ok) throw new Error('Synthetic scheduler preview update failed')
    })
    await page.getByRole('dialog', { name: 'Notifications', exact: true })
      .getByRole('button', { name: 'Daily workspace review · missed', exact: true }).click()
    const scheduler = page.getByRole('dialog', { name: 'Scheduler', exact: true })
    await expect(scheduler).toBeVisible()
    await expect(scheduler.locator('li[data-linked="true"]')).toContainText('missed')
    await expect(scheduler.locator('li[data-linked="true"]')).toBeInViewport()
    expect(handle.requests).toContainEqual({ method: 'GET', path: '/api/schedules/fixture-daily-review/runs?limit=200' })
    await scheduler.getByRole('button', { name: 'History for Weekly release digest', exact: true }).click()
    const otherHistory = scheduler.getByRole('region', { name: 'Run history for Weekly release digest', exact: true })
    await expect(otherHistory).toContainText('No runs yet.')
    await expect(scheduler.getByText('The linked run is no longer in retained history.')).toHaveCount(0)
    await expect(otherHistory.locator('li[data-linked="true"]')).toHaveCount(0)
    await scheduler.getByRole('button', { name: 'History for Daily workspace review', exact: true }).click()
    await expect(scheduler.getByRole('region', { name: 'Run history for Daily workspace review', exact: true })).toContainText('interrupted')
    await expect(scheduler.locator('li[data-linked="true"]')).toHaveCount(0)
  })

  test('requires choosing a paired computer before saving an unavailable schedule target', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'scheduler-unpaired-target')
    const scheduler = page.getByRole('dialog', { name: 'Scheduler', exact: true })
    const computer = scheduler.getByRole('combobox', { name: 'Computer', exact: true })
    await expect(computer).toHaveValue('fixture-retired')
    await expect(computer.locator('option:checked')).toHaveText('fixture-retired (not paired)')
    await scheduler.getByRole('button', { name: 'Policies', exact: true }).click()
    await expect(scheduler.getByRole('button', { name: 'Save schedule', exact: true })).toBeDisabled()
    expect(handle.requests.some((request) => request.method === 'PATCH' && request.path === '/api/schedules/fixture-daily-review')).toBe(false)
    await scheduler.getByRole('button', { name: 'Target', exact: true }).click()
    await computer.selectOption('fixture-studio')
    await scheduler.getByRole('button', { name: 'Policies', exact: true }).click()
    const saved = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname === '/api/schedules/fixture-daily-review')
    await scheduler.getByRole('button', { name: 'Save schedule', exact: true }).click()
    expect((await saved).postDataJSON()).toMatchObject({ target: { computerId: 'fixture-studio' } })
    await expect(scheduler.getByRole('heading', { name: 'Daily workspace review', exact: true })).toBeVisible()
  })

  test('hands a pending schedule proposal to Oracle without approving it', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'scheduler')
    const scheduler = page.getByRole('dialog', { name: 'Scheduler', exact: true })
    await scheduler.getByRole('region', { name: 'Pending Oracle proposals' })
      .getByRole('button', { name: 'Review in Oracle', exact: true }).click()
    await expect(scheduler).toBeHidden()
    await expect(page.getByRole('region', { name: 'Schedule approvals' })).toContainText('Morning workspace review')
    await expect(page.getByRole('button', { name: 'Approve', exact: true })).toBeVisible()
    expect(handle.requests.some((request) => request.method === 'POST' && request.path.includes('/proposals/'))).toBe(false)
  })

  test('opens canonical schedule links directly without relying on a session selection', async ({ page, baseURL }) => {
    await open(page, baseURL, 'scheduler')
    const url = new URL(page.url())
    url.searchParams.delete('session')
    url.searchParams.set('schedule', 'fixture-daily-review')
    url.searchParams.set('run', 'fictional-run-1')
    await page.goto(url.href)
    const scheduler = page.getByRole('dialog', { name: 'Scheduler', exact: true })
    await expect(scheduler).toBeVisible()
    await expect(scheduler.locator('li[data-linked="true"]')).toContainText('missed')
  })

  test('keeps schedule management available for a stale history link', async ({ page, baseURL }) => {
    await open(page, baseURL, 'scheduler-stale-link')
    const scheduler = page.getByRole('dialog', { name: 'Scheduler', exact: true })
    await expect(scheduler.getByRole('status')).toContainText('This schedule no longer exists.')
    await scheduler.getByRole('button', { name: 'Show all schedules', exact: true }).click()
    await expect(scheduler.getByText('This schedule no longer exists.')).toHaveCount(0)
    await expect(scheduler.getByRole('button', { name: 'Edit Daily workspace review', exact: true })).toBeVisible()
  })

  test('preserves duplicate-name reasons and the editable draft', async ({ page, baseURL }) => {
    await open(page, baseURL, 'scheduler-name-conflict')
    const scheduler = page.getByRole('dialog', { name: 'Scheduler', exact: true })
    await expect(scheduler.getByRole('alert')).toContainText('A non-archived schedule already has this name')
    await expect(scheduler.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('Daily workspace review')
  })

  for (const viewport of uiViewports.filter((entry) => entry.name === 'desktop' || entry.name === 'phone')) {
    test(`retries incompatible host telemetry only on request at ${viewport.name}`, async ({ page, baseURL }, testInfo) => {
      await page.setViewportSize(viewport.viewport)
      await open(page, baseURL, 'host-monitor')
      const monitor = page.getByRole('dialog', { name: 'Host monitor', exact: true })
      await monitor.getByRole('button', { name: 'Close', exact: true }).click()
      let incompatible = true
      let invalidReads = 0
      await page.route('**/api/computers/fixture-studio/host', async (route) => {
        if (!incompatible) { await route.fallback(); return }
        invalidReads++
        await route.fulfill({ status: 502, json: {
          error: 'This computer returned invalid host telemetry', code: 'HOST_TELEMETRY_INVALID',
        } })
      })
      // Closing a view can return a phone reader to the open drawer; open it only when it is closed.
      const sessions = page.getByRole('button', { name: 'Open sessions', exact: true })
      if (!await page.locator('.sidebar-scrim').isVisible() && await sessions.isVisible()) await sessions.click()
      await page.getByRole('button', { name: 'Host monitor', exact: true }).click()
      await expect(monitor.getByRole('alert')).toContainText('Update this computer')
      const retry = monitor.getByRole('button', { name: 'Retry', exact: true })
      await expect(retry).toBeVisible()
      expect(await retry.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(40)
      await assertNoHorizontalOverflow(page)
      await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-host-incompatible.png`), animations: 'disabled' })
      expect(invalidReads).toBe(1)
      incompatible = false
      await retry.click()
      await expect(monitor).toContainText('fixture-studio-fictional')
      await expect(monitor.getByRole('alert')).toHaveCount(0)
      await expect(retry).toHaveCount(0)
    })
  }

  test('announces unread counts, opens notifications and dismisses a single grouped item in one batch', async ({ page, baseURL }) => {
    await open(page, baseURL, 'notification-panel')
    const panel = page.getByRole('dialog', { name: 'Notifications', exact: true })
    await panel.getByRole('button', { name: 'Close', exact: true }).click()
    const bell = page.getByRole('button', { name: 'Notifications, 5 unread', exact: true })
    await expect(bell.locator('.shell-badge')).toHaveText('5')
    await bell.click()
    const batch = page.waitForRequest((request) => new URL(request.url()).pathname === '/api/notifications/bulk')
    await panel.getByRole('button', { name: 'Dismiss Workspace review complete', exact: true }).click()
    expect((await batch).postDataJSON()).toEqual({ ids: ['2'.padStart(64, '0')], action: 'dismiss' })
    await expect(panel.getByRole('button', { name: 'Workspace review needs you', exact: true })).toBeVisible()
    await panel.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Notifications, 4 unread', exact: true })).toBeVisible()
  })

  test('keeps scheduled notifications without a session available when Scheduler is unavailable', async ({ page, baseURL }) => {
    await open(page, baseURL, 'notification-panel')
    const panel = page.getByRole('dialog', { name: 'Notifications', exact: true })
    await panel.getByRole('button', { name: 'Daily workspace review · missed', exact: true }).click()
    await expect(panel).toBeVisible()
    await expect(page.getByText('This view is being prepared for the next preview.')).toHaveCount(0)
  })
})
