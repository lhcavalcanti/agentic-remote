import { expect, test, type Page } from '@playwright/test'
import {
  assertNoHorizontalOverflow,
  createUIScenes,
  uiContextOptions,
  uiSceneNames,
  uiViewports,
  type UISceneHandle,
  type UISceneName,
} from './ui-scenes'
import { FIXTURE_NOW, SELECTED_SESSION_ID, createWorkspaceFixtureState, setupWorkspaceFixture } from './workspace-fixtures'

test.use(uiContextOptions)

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
          await expect(page).toHaveScreenshot(`${viewport.name}-${name}.png`, {
            // Rounded-corner compositing can vary by one RGB level in Chromium.
            animations: 'disabled', caret: 'hide', maxDiffPixels: 0, threshold: 0.01,
          })
        } finally {
          fixture.assertHealthy()
        }
      })
    }
  })
}

const sessionPath = `/api/computers/fixture-studio/sessions/${SELECTED_SESSION_ID}`
const message = (page: Page) => page.getByRole('textbox', { name: 'Message', exact: true })

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
    expect(fixture.requests.filter((entry) => entry.method === 'PATCH' && entry.path.endsWith('/skills'))).toEqual([])
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    await dialog.getByRole('button', { name: 'Disable review-notes', exact: true }).click()
    const write = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname === '/api/computers/fixture-build/skills')
    await dialog.getByRole('button', { name: 'Confirm change', exact: true }).click()
    expect((await write).postDataJSON()).toEqual({ name: 'review-notes', enabled: false, confirmed: true, revision: 'a'.repeat(64) })
    await expect(dialog.getByRole('button', { name: 'Enable review-notes', exact: true })).toBeVisible()
    await dialog.getByRole('combobox', { name: 'Skills computer' }).selectOption('fixture-studio')
    await expect(dialog.getByRole('button', { name: 'Disable review-notes', exact: true })).toBeVisible()
    await dialog.getByRole('combobox', { name: 'Skills computer' }).selectOption('fixture-travel')
    await expect(dialog.getByRole('status')).toContainText('offline')
  } finally { fixture.assertHealthy() }
})

test('settings preview searches fields, navigates by keyboard, deep-links computers and closes with Escape', async ({ page, baseURL }) => {
  const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'settings-navigation')!.setup(page)
  try {
    const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
    await dialog.getByRole('searchbox', { name: 'Search settings' }).fill('Accent')
    await dialog.getByRole('button', { name: /^Interface/ }).click()
    await expect(dialog.getByRole('radiogroup', { name: 'Accent color' })).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Keyboard shortcuts', exact: true })).toBeHidden()
    await dialog.getByRole('searchbox', { name: 'Search settings' }).fill('Settings navigation')
    await dialog.getByRole('button', { name: /^Interface/ }).click()
    await expect(dialog.getByRole('checkbox', { name: 'Settings navigation', exact: true })).toBeVisible()
    await expect(dialog.getByRole('radiogroup', { name: 'Accent color' })).toBeHidden()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await page.getByRole('button', { name: 'Manage computers', exact: true }).click()
    await expect(dialog.getByRole('button', { name: 'Check connection', exact: true })).toBeVisible()
    const remote = dialog.getByRole('button', { name: /^Remote machines/ })
    await remote.focus()
    await remote.press('ArrowDown')
    await expect(dialog.getByRole('button', { name: /^Notifications/ })).toBeFocused()
  } finally { fixture.assertHealthy() }
})

test('Health search leads to its preview toggle while off and its card after enabling', async ({ page, baseURL }) => {
  const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'settings-health-search')!.setup(page)
  try {
    const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
    await expect(dialog.getByRole('button', { name: /^App This device/ })).toHaveCount(0)
    await dialog.getByRole('checkbox', { name: 'Health card', exact: true }).check()
    await dialog.getByRole('button', { name: /^App This device/ }).click()
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

for (const width of [320, 360]) {
  test.describe(`narrow composer ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true })
    test('shows the idle-only hint without hover while retaining the model glyph and mode', async ({ page, baseURL }) => {
      const fixture = await createUIScenes(baseURL).find((scene) => scene.name === 'composer-status-busy')!.setup(page)
      try {
        const summary = page.getByTestId('composer-runtime')
        await expect(summary.getByText('applies when idle', { exact: true })).toBeVisible()
        await expect(summary.locator('[data-model-family]')).toBeVisible()
        await expect(summary.locator('.composer-runtime__mode')).toHaveText('plan')
        const layout = await summary.evaluate((element) => {
          const button = element.getBoundingClientRect()
          return {
            height: button.height,
            childrenFit: [...element.children].filter((child) => child.getBoundingClientRect().width > 0)
              .every((child) => {
                const rect = child.getBoundingClientRect()
                return rect.left >= button.left && rect.right <= button.right
              }),
          }
        })
        expect(layout.height).toBeGreaterThanOrEqual(40)
        expect(layout.childrenFit).toBe(true)
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

  test('shows model-family glyphs only after opting in and follows runtime model changes', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'conversation')
    const summary = page.getByTestId('composer-runtime')
    await expect(summary.locator('[data-model-family]')).toHaveCount(0)
    await page.getByRole('button', { name: 'App settings', exact: true }).click()
    const settings = page.getByRole('dialog', { name: 'App settings', exact: true })
    await settings.getByRole('checkbox', { name: 'Composer refresh', exact: true }).check()
    await expect.poll(() => handle.state.settings.values.previewFeatures?.composerRefresh).toBe(true)
    await settings.getByRole('button', { name: 'Close', exact: true }).click()
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

    await page.getByRole('button', { name: 'App settings', exact: true }).click()
    await settings.getByRole('checkbox', { name: 'Composer refresh', exact: true }).uncheck()
    await expect.poll(() => handle.state.settings.values.previewFeatures?.composerRefresh).toBe(false)
    await settings.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(summary.locator('[data-model-family]')).toHaveCount(0)
  })

  test('preview status is one setup button and explains idle-only changes while busy', async ({ page, baseURL }) => {
    await open(page, baseURL, 'composer-status-busy')
    const summary = page.getByTestId('composer-runtime')
    await expect(summary).toHaveAccessibleDescription(/applies when idle/)
    await expect(summary).toContainText('plan')
    await expect(summary.locator('button')).toHaveCount(0)
    await summary.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Model and context' })).toBeVisible()
  })

  test('preview row attaches using the existing pipeline and opens read-only session resources', async ({ page, baseURL }) => {
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
    test.describe(`preview row access ${viewport.name}`, () => {
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
          const options = page.getByRole('button', { name: 'Send options', exact: true })
          await options.focus()
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
