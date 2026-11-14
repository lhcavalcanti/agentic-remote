import { expect, type BrowserContextOptions, type Page } from '@playwright/test'
import { oracleHostStatusFixture } from './oracle-host-status-fixture'
import { fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns, fixtureSchedules } from './shell-fixtures'
import {
  FIXTURE_NOW,
  SELECTED_SESSION_ID,
  createWorkspaceFixtureState,
  fixtureBaseUrl,
  fixtureSchedules as provenanceSchedules,
  fixtureScheduleRuns as provenanceRuns,
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
  'composer-family-claude',
  'composer-family-openai',
  'composer-status-busy',
  'composer-session-setup',
  'composer-button-row',
  'composer-session-panel',
  'composer-sent-messages',
  'composer-delivery-menu',
  'composer-delivery-unavailable',
  'session-origins',
  'session-origin-run',
  'session-subagents',
  'session-list',
  'app-settings',
  'preview-features',
  'settings-navigation',
  'settings-remote-machines',
  'settings-health',
  'settings-skills',
  'settings-skill-confirmation',
  'runtime-dialog',
  'new-session-dialog',
  'computers-dialog',
  'oracle-panel',
  'oracle-schedule-approval',
  'desktop-rail',
  'notification-panel',
  'host-monitor',
  'host-processes',
  'scheduler',
  'scheduler-form',
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
export function createUIScenes(
  baseUrl = 'http://127.0.0.1:4395',
  options: { oracleHostStatus?: boolean } = {},
): UIScene[] {
  const origin = fixtureBaseUrl(baseUrl).origin
  return uiSceneNames.map((name) => ({
    name,
    async setup(page) {
      const state = createWorkspaceFixtureState()
      const hostStatus = name === 'oracle-panel' && options.oracleHostStatus
        ? await oracleHostStatusFixture() : undefined
      const origins = name === 'session-origins' || name === 'session-origin-run' || name === 'session-subagents'
      if (origins) {
        state.settings = {
          revision: 1, values: { previewFeatures: { composerRefresh: true, schedulerView: true, desktopRail: true } },
          keyRevisions: { previewFeatures: 1 },
        }
        state.sessions[0].provenance = {
          origin: 'schedule', scheduleId: provenanceSchedules[0].id,
          scheduleName: provenanceSchedules[0].name, scheduleRunId: provenanceRuns[0].id,
        }
        state.sessions[1].provenance = { origin: 'user' }
        state.sessions[2].provenance = { origin: 'manager' }
        state.sessions[3].provenance = { origin: 'discovered' }
      }
      if (name === 'composer-family-claude' || name === 'composer-family-openai') {
        const family = name === 'composer-family-claude' ? 'claude' : 'gpt'
        const model = { ...state.models[0], id: `fixture-${family}-99`, name: `${family} fictional model` }
        state.models.push(model)
        state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!.runtime!.model = model.id
        state.settings = {
          revision: 1,
          values: { previewFeatures: { composerRefresh: true } },
          keyRevisions: { previewFeatures: 1 },
        }
      }
      if (['composer-status-busy', 'composer-session-setup', 'composer-button-row', 'composer-session-panel', 'composer-sent-messages', 'composer-delivery-menu', 'composer-delivery-unavailable'].includes(name)) {
        state.settings = {
          revision: 1, values: { previewFeatures: { composerRefresh: true } },
          keyRevisions: { previewFeatures: 1 },
        }
        const session = state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
        if (name === 'composer-status-busy' || name === 'composer-session-setup') {
          session.runtime!.model = 'fictional-model-with-a-long-name-for-small-screens'
        }
        if (name === 'composer-status-busy') session.status = 'running'
        if (name === 'composer-delivery-menu' || name === 'composer-delivery-unavailable') {
          session.status = 'running'
          session.activity = 'Reviewing the recovery checklist'
          if (name === 'composer-delivery-unavailable') {
            session.provider = 'claude'
            session.executionMode = 'sdk'
          }
        }
        if (name === 'composer-sent-messages') {
          session.messages.push({
            id: 'fixture-sent-review', role: 'user',
            content: 'Review the recovery checklist and document the remaining checks.',
            createdAt: FIXTURE_NOW,
          })
          session.queuedPrompts = [{
            id: 'fixture-history-queued', content: 'This queued note is not a sent message.', createdAt: FIXTURE_NOW,
          }]
          session.queuedCount = 1
        }
      }
      if (name === 'oracle-schedule-approval') {
        state.hubFlags = { ...state.hubFlags, scheduler: true }
        state.settings = {
          revision: 1, values: { previewFeatures: { schedulerView: true } }, keyRevisions: { previewFeatures: 1 },
        }
      }
      if (name === 'desktop-rail') {
        state.settings.values = { previewFeatures: { desktopRail: true }, displayName: 'Alex Morgan' }
        state.settings.revision = 1
      }
      if (name === 'notification-panel') {
        state.settings.values = { previewFeatures: { desktopRail: true, notificationPanel: true }, displayName: 'Alex Morgan' }
        state.settings.revision = 1
      }
      if (name === 'host-monitor' || name === 'host-processes') {
        state.settings.values = { previewFeatures: { desktopRail: true, hostMonitorView: true }, displayName: 'Alex Morgan' }
        state.settings.revision = 1
      }
      if (name === 'scheduler' || name === 'scheduler-form') {
        state.settings.values = { previewFeatures: { desktopRail: true, schedulerView: true }, displayName: 'Alex Morgan' }
        state.settings.revision = 1
      }
      if (name === 'settings-skills' || name === 'settings-skill-confirmation') {
        state.settings.values = {
          previewFeatures: { settingsNavigation: true, skillToggles: true, desktopRail: true, hostMonitorView: true, schedulerView: true },
          displayName: 'Alex Morgan',
        }
        state.hubFlags = { ...state.hubFlags, hostMonitor: true, scheduler: true }
      }
      if (name === 'settings-health') {
        state.settings.values = {
          previewFeatures: { settingsNavigation: true, healthCard: true, desktopRail: true, hostMonitorView: true, schedulerView: true },
          displayName: 'Alex Morgan',
        }
        state.hubFlags = { ...state.hubFlags, hostMonitor: true, scheduler: true }
      }
      if (name === 'settings-navigation' || name === 'settings-remote-machines') {
        state.settings.values = {
          previewFeatures: { settingsNavigation: true, desktopRail: true, hostMonitorView: true, schedulerView: true },
          displayName: 'Alex Morgan',
        }
        state.hubFlags = { ...state.hubFlags, hostMonitor: true, scheduler: true }
      }
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
        notifications: name === 'notification-panel' ? fixtureNotifications : undefined,
        hostMonitor: Boolean(hostStatus) || name === 'host-monitor' || name === 'host-processes' || name === 'settings-navigation' || name === 'settings-remote-machines' || name === 'settings-health' || name === 'settings-skills' || name === 'settings-skill-confirmation',
        hostMonitorWsl: name === 'host-monitor' || name === 'host-processes',
        scheduler: name === 'oracle-schedule-approval' ? {
          schedules: [], runs: [], proposals: fixtureScheduleProposals,
        } : name === 'scheduler' || name === 'scheduler-form' || name === 'notification-panel'
          ? { schedules: fixtureSchedules, runs: fixtureScheduleRuns, proposals: name === 'notification-panel' ? [] : fixtureScheduleProposals }
          : origins ? { schedules: structuredClone(provenanceSchedules), runs: structuredClone(provenanceRuns) } : undefined,
        taskSnapshots: name === 'session-subagents' ? {
          [`fixture-studio:${SELECTED_SESSION_ID}`]: {
            supported: true, runningCount: 1, tasks: [
              { id: 'fixture-sync-agent', type: 'agent', description: 'Review recovery paths', status: 'running', executionMode: 'sync', startedAt: FIXTURE_NOW, canCancel: false },
              { id: 'fixture-background-agent', type: 'agent', description: 'Check the guide links', status: 'running', executionMode: 'background', startedAt: FIXTURE_NOW, canCancel: true },
            ],
          },
        } : undefined,
        manager: hostStatus?.manager ?? (['oracle-panel', 'oracle-schedule-approval', 'scheduler', 'scheduler-form'].includes(name) ? {
          available: true,
          status: 'idle',
          queued: 0,
          managedSessions: [],
          messages: [
            { id: 'fixture-oracle-question', role: 'user', content: 'What should I review next?', createdAt: FIXTURE_NOW },
            { id: 'fixture-oracle-answer', role: 'assistant', content: 'Review the recovery checklist on Studio, then the document check on Build node.', createdAt: FIXTURE_NOW },
          ],
        } : undefined),
      })
      await page.goto(fixture.url)
      await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible()
      await expect(page.getByText('I suggest three small changes:', { exact: true })).toBeVisible()
      await expect.poll(() => state.eventSockets.size).toBeGreaterThan(0)
      await expect.poll(() => state.settings.revision).toBeGreaterThan(0)
      if (name === 'composer-busy-queue') {
        await expect(page.getByRole('region', { name: 'Queued prompts' })).toContainText('Check the release notes next.')
      } else if (name === 'composer-family-claude' || name === 'composer-family-openai') {
        const family = name === 'composer-family-claude' ? 'anthropic' : 'openai'
        await expect(page.getByTestId('composer-runtime').locator('[data-model-family]'))
          .toHaveAttribute('data-model-family', family)
      } else if (name === 'composer-session-panel') {
        await page.getByRole('button', { name: 'Session panel', exact: true }).click()
        await expect(page.getByRole('group', { name: 'Session panel' })).toBeVisible()
      } else if (name === 'composer-sent-messages') {
        await page.getByRole('textbox', { name: 'Message', exact: true }).fill('My unsent review notes')
        const history = page.getByRole('button', { name: 'Sent messages', exact: true })
        if (!await history.isVisible()) await page.getByRole('button', { name: 'Session panel', exact: true }).click()
        await history.click()
        await expect(page.getByRole('dialog', { name: 'Sent messages', exact: true })).toBeVisible()
      } else if (name === 'composer-delivery-menu' || name === 'composer-delivery-unavailable') {
        await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Focus this review on the recovery checklist.')
        await page.getByRole('button', { name: 'Send message', exact: true }).click()
        await expect(page.getByRole('menu', { name: 'Message delivery' })).toBeVisible()
      } else if (name === 'session-origins') {
        await openSessions(page)
        const nav = page.getByRole('navigation', { name: 'Sessions', exact: true })
        await expect(nav.getByRole('img', { name: 'Started by schedule Morning field guide review' })).toBeVisible()
        await expect(nav.getByRole('img', { name: 'Started by Oracle' })).toBeVisible()
        await expect(nav.getByRole('img', { name: 'Found on this computer' })).toBeVisible()
      } else if (name === 'session-origin-run') {
        await page.locator('.conversation-header').getByRole('link', { name: 'View run from schedule Morning field guide review' }).click()
        await expect(page.getByRole('dialog', { name: 'Scheduler', exact: true })
          .getByRole('region', { name: 'Run history for Morning field guide review' })).toContainText('Reviewed the field guide links.')
      } else if (name === 'session-subagents') {
        await expect(page.getByRole('button', { name: '2 subagents running', exact: true })).toBeVisible()
      } else if (name === 'session-list' || name === 'desktop-rail') {
        await openSessions(page)
      } else if (name === 'settings-skills' || name === 'settings-skill-confirmation') {
        await openSessions(page)
        await page.getByRole('button', { name: 'App settings', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
        await dialog.getByRole('button', { name: /^Skills Hub/ }).click()
        await expect(dialog.getByRole('button', { name: 'Disable review-notes', exact: true })).toBeVisible()
        if (name === 'settings-skill-confirmation') {
          await dialog.getByRole('combobox', { name: 'Skills computer' }).selectOption('fixture-build')
          await dialog.getByRole('button', { name: 'Disable review-notes', exact: true }).click()
          await expect(dialog.getByRole('group', { name: 'Confirm skill change' })).toContainText('every session on Build node')
        }
      } else if (name === 'settings-health') {
        await openSessions(page)
        await page.getByRole('button', { name: 'App settings', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
        await dialog.getByRole('button', { name: /^App This device/ }).click()
        const health = dialog.getByRole('region', { name: 'Health', exact: true })
        await expect(health).toContainText('fixture-release-2026-09-04')
        await health.scrollIntoViewIfNeeded()
      } else if (name === 'settings-navigation' || name === 'settings-remote-machines') {
        await openSessions(page)
        await page.getByRole('button', { name: name === 'settings-navigation' ? 'App settings' : 'Manage computers', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
        await expect(dialog.getByRole('textbox', { name: 'Search settings' }).or(dialog.getByRole('searchbox', { name: 'Search settings' }))).toBeVisible()
        if (name === 'settings-remote-machines') {
          await expect(dialog.getByRole('button', { name: 'Check connection', exact: true })).toBeVisible()
        } else {
          const models = dialog.getByRole('combobox', { name: 'GitHub Copilot default model', exact: true })
          if (page.viewportSize()!.width < 600) await dialog.getByRole('button', { name: /^Models/ }).click()
          await expect(models).toBeEnabled()
        }
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
      } else if (name === 'notification-panel') {
        await openSessions(page)
        await page.getByRole('button', { name: 'Notifications', exact: true }).click()
        await expect(page.getByRole('dialog', { name: 'Notifications', exact: true })).toContainText('Workspace review complete')
      } else if (name === 'host-monitor' || name === 'host-processes') {
        await openSessions(page)
        await page.getByRole('button', { name: 'Host monitor', exact: true }).click()
        const monitor = page.getByRole('dialog', { name: 'Host monitor', exact: true })
        await expect(monitor).toContainText('fixture-studio-fictional')
        await expect(monitor).toContainText('WSL VM, not the Windows host')
        if (name === 'host-processes') {
          await monitor.getByRole('tab', { name: 'Processes', exact: true }).click()
          await expect(monitor.getByRole('button', { name: 'Open session', exact: true }).first()).toBeVisible()
        }
      } else if (name === 'scheduler' || name === 'scheduler-form') {
        await openSessions(page)
        await page.getByRole('button', { name: 'Scheduler', exact: true }).click()
        const scheduler = page.getByRole('dialog', { name: 'Scheduler', exact: true })
        await expect(scheduler).toContainText('Daily workspace review')
        await expect(scheduler.getByRole('button', { name: 'Review in Oracle', exact: true })).toBeEnabled()
        if (name === 'scheduler-form') {
          await scheduler.getByRole('button', { name: 'Create schedule', exact: true }).click()
          await scheduler.getByRole('textbox', { name: 'Name', exact: true }).fill('Morning field guide check')
          await scheduler.getByRole('textbox', { name: 'Prompt', exact: true }).fill('Review the fictional field guide and list the next three checks. Ask before changing anything.')
          await expect(scheduler.getByRole('region', { name: 'Next five occurrences' })).toContainText('Sep 5, 2026')
        } else {
          await scheduler.getByRole('button', { name: 'History for Daily workspace review', exact: true }).click()
          await expect(scheduler.getByRole('region', { name: 'Run history for Daily workspace review', exact: true })).toContainText('interrupted')
        }
      } else if (name === 'runtime-dialog' || name === 'composer-session-setup') {
        await page.getByRole('button', { name: 'Configure model, effort, and context', exact: true }).click()
        await expect(page.getByRole('dialog', { name: 'Model and context' }).getByRole('combobox', { name: 'Model', exact: true })).toBeVisible()
      } else if (name === 'new-session-dialog') {
        await page.getByRole('main').getByRole('button', { name: 'New session', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'Choose a folder' })
        await expect(dialog.getByRole('button', { name: 'Create session', exact: true })).toBeEnabled()
        await expect(dialog.getByText('Loading', { exact: false })).toHaveCount(0)
      } else if (name === 'oracle-panel' || name === 'oracle-schedule-approval') {
        await page.locator('main').getByRole('button', { name: /^Oracle/ }).first().click()
        await expect(page.locator('#oracle-panel').getByRole('textbox', { name: 'Message Oracle', exact: true })).toBeVisible()
        await expect(page.locator('#oracle-panel')).toContainText(hostStatus
          ? 'Studio is under resource pressure.' : 'Review the recovery checklist on Studio')
        if (name === 'oracle-schedule-approval') {
          await expect(page.getByRole('region', { name: 'Schedule approvals' })).toContainText('Morning workspace review')
          await expect(page.getByRole('region', { name: 'Schedule approvals' })).toContainText('Weekdays at 9:00 AM PT · next Mon, Sep 7, 9:00 AM PDT')
          await expect(page.getByRole('region', { name: 'Schedule approvals' })).toContainText('Permissions: Ask · Folder trust: Ask · Workspace: checkout')
          await expect(page.getByRole('button', { name: 'Approve', exact: true })).toBeVisible()
        }
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
