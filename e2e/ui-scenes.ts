import { expect, type BrowserContextOptions, type Page } from '@playwright/test'
import {
  FIXTURE_NOW,
  SELECTED_SESSION_ID,
  createWorkspaceFixtureState,
  fixtureBaseUrl,
  setupWorkspaceFixture,
  type WorkspaceFixture,
  type WorkspaceFixtureState,
} from './workspace-fixtures'

export const uiViewports = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { name: 'foldable', viewport: { width: 820, height: 1180 }, isMobile: false, hasTouch: true },
  { name: 'phone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
] as const

export const uiContextOptions = {
  deviceScaleFactor: 1,
  locale: 'en-US',
  timezoneId: 'UTC',
  colorScheme: 'dark',
  reducedMotion: 'reduce',
  serviceWorkers: 'block',
} satisfies BrowserContextOptions

export const uiSceneNames = [
  'conversation',
  'composer-busy-queue',
  'session-list',
  'app-settings',
  'preview-features',
  'runtime-dialog',
  'new-session-dialog',
  'computers-dialog',
  'oracle-panel',
] as const

export type UISceneName = typeof uiSceneNames[number]
export type UISceneHandle = WorkspaceFixture & { state: WorkspaceFixtureState }
export interface UIScene {
  name: UISceneName
  setup: (page: Page) => Promise<UISceneHandle>
}

async function openSessions(page: Page) {
  const toggle = page.getByRole('button', { name: 'Open sessions', exact: true })
  if (await toggle.isVisible()) await toggle.click()
  await expect(page.getByRole('navigation', { name: 'Sessions', exact: true })).toBeVisible()
}

/** The same fixed-clock, fail-closed scenes drive both locks and PR captures. */
export function createUIScenes(baseUrl = 'http://127.0.0.1:4395'): UIScene[] {
  const origin = fixtureBaseUrl(baseUrl).origin
  return uiSceneNames.map((name) => ({
    name,
    async setup(page) {
      const state = createWorkspaceFixtureState()
      if (name === 'preview-features') {
        state.hubFlags = { notificationCenter: true, hostMonitor: false, scheduler: false }
      }
      if (name === 'composer-busy-queue') {
        const session = state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
        session.status = 'running'
        session.activity = 'Checking the workspace plan'
        session.queuedPrompts = [
          { id: 'fixture-queue-first', content: 'Check the release notes next.', createdAt: FIXTURE_NOW },
          { id: 'fixture-queue-second', content: 'Then summarize the remaining checks.', createdAt: FIXTURE_NOW },
        ]
        session.queuedCount = session.queuedPrompts.length
      }
      const fixture = await setupWorkspaceFixture(page, {
        baseUrl: origin,
        knowledgeMode: 'hidden',
        appearance: 'graphite',
        state,
        manager: name === 'oracle-panel' ? {
          available: true,
          status: 'idle',
          queued: 0,
          managedSessions: [],
          messages: [
            { id: 'fixture-oracle-question', role: 'user', content: 'What should I review next?', createdAt: FIXTURE_NOW },
            { id: 'fixture-oracle-answer', role: 'assistant', content: 'Review the recovery checklist on Studio, then the document check on Build node.', createdAt: FIXTURE_NOW },
          ],
        } : undefined,
      })
      await page.goto(fixture.url)
      await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible()
      await expect(page.getByText('I suggest three small changes:', { exact: true })).toBeVisible()
      await expect.poll(() => state.eventSockets.size).toBeGreaterThan(0)
      await expect.poll(() => state.settings.revision).toBeGreaterThan(0)
      if (name === 'composer-busy-queue') {
        await expect(page.getByRole('region', { name: 'Queued prompts' })).toContainText('Check the release notes next.')
      } else if (name === 'session-list') {
        await openSessions(page)
      } else if (name === 'app-settings' || name === 'preview-features' || name === 'computers-dialog') {
        const appSettings = name !== 'computers-dialog'
        await openSessions(page)
        await page.getByRole('button', {
          name: appSettings ? 'App settings' : 'Manage computers', exact: true,
        }).click()
        const dialog = page.getByRole('dialog', { name: appSettings ? 'App settings' : 'Computers', exact: true })
        await expect(dialog).toBeVisible()
        if (appSettings) {
          await expect(dialog.getByRole('combobox', { name: 'GitHub Copilot default model', exact: true })).toBeEnabled()
          await expect(dialog.getByRole('combobox', { name: 'Claude Agent default model', exact: true })).toBeEnabled()
          await dialog.evaluate((element) => { element.scrollTop = 0 })
          await expect(dialog.getByRole('heading', { name: 'Models', exact: true })).toBeInViewport()
          if (name === 'preview-features') {
            await dialog.getByRole('button', { name: 'Interface', exact: true }).click()
            const previews = dialog.getByRole('region', { name: 'Preview features', exact: true })
            await previews.evaluate((target) => {
              const container = target.closest<HTMLElement>('.app-settings-dialog')!
              const nav = container.querySelector<HTMLElement>('.app-settings-nav')!
              container.scrollTop += target.getBoundingClientRect().top
                - container.getBoundingClientRect().top - nav.offsetHeight - 8
            })
            await expect(previews.getByRole('heading', { name: 'Preview features', exact: true })).toBeInViewport()
            await expect(previews.getByRole('checkbox', { name: 'Notification panel', exact: true })).toBeEnabled()
            await expect(previews.getByRole('checkbox', { name: 'Host monitor', exact: true })).toBeDisabled()
            await expect(previews.getByText('Turned off on this hub', { exact: false })).toHaveCount(2)
          }
        }
      } else if (name === 'runtime-dialog') {
        await page.getByRole('button', { name: 'Configure model, effort, and context', exact: true }).click()
        await expect(page.getByRole('dialog', { name: 'Model and context' }).getByRole('combobox', { name: 'Model', exact: true })).toHaveValue('fixture-model')
      } else if (name === 'new-session-dialog') {
        await page.getByRole('main').getByRole('button', { name: 'New session', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'Choose a folder' })
        await expect(dialog.getByRole('button', { name: 'Create session', exact: true })).toBeEnabled()
        await expect(dialog.getByText('Loading', { exact: false })).toHaveCount(0)
      } else if (name === 'oracle-panel') {
        await page.locator('main').getByRole('button', { name: /^Oracle/ }).first().click()
        await expect(page.locator('#oracle-panel').getByRole('textbox', { name: 'Message Oracle', exact: true })).toBeVisible()
        await expect(page.locator('#oracle-panel')).toContainText('Review the recovery checklist on Studio')
      }
      await page.evaluate(() => document.fonts.ready)
      await page.mouse.move(0, 0)
      fixture.assertHealthy()
      return { ...fixture, state }
    },
  }))
}

export async function assertNoHorizontalOverflow(page: Page) {
  const layout = await page.evaluate(() => {
    const width = document.documentElement.clientWidth
    // Internal scrollers (for example the settings jump bar) may scroll;
    // the document and visible surfaces must still fit the viewport.
    const outside = [...document.querySelectorAll('.dialog, #oracle-panel')]
      .filter((element) => element.clientWidth > 0 && element.getClientRects().length > 0)
      .map((element) => ({ surface: element.className || element.id, rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.left < -1 || rect.right > width + 1)
      .map(({ surface, rect }) => ({ surface, left: rect.left, right: rect.right }))
    return {
      documentOverflow: document.documentElement.scrollWidth - width,
      bodyOverflow: document.body.scrollWidth - width,
      outside,
    }
  })
  expect(layout.documentOverflow).toBeLessThanOrEqual(1)
  expect(layout.bodyOverflow).toBeLessThanOrEqual(1)
  expect(layout.outside).toEqual([])
}
