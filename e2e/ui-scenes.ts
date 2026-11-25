import { expect, type BrowserContextOptions, type Page } from '@playwright/test'
import { closedSessionContext } from '../shared/closed-sessions'
import type { BackgroundTask, BackgroundTaskSnapshot, ChatMessage, ManagedSession } from '../shared/contracts'
import { oracleHostStatusFixture } from './oracle-host-status-fixture'
import { fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns, fixtureSchedules } from './shell-fixtures'
import {
  FIXTURE_NOW,
  SELECTED_SESSION_ID,
  createWorkspaceFixtureState,
  fixtureActivityDetails,
  fixtureActivityMessages,
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
  'conversation-tool-rows',
  'composer-busy-queue',
  'composer-busy-queue-light',
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
  'session-origin-tasks',
  'session-origin-tasks-short',
  'session-origin-run',
  'session-subagents',
  'background-tasks',
  'background-tasks-light',
  'background-tasks-sheet',
  'background-tasks-sheet-light',
  'background-tasks-expanded',
  'session-list',
  'session-categories',
  'session-actions',
  'app-settings',
  'preview-features',
  'settings-navigation',
  'settings-search',
  'settings-health-search',
  'settings-remote-machines',
  'settings-health',
  'settings-skills',
  'settings-skill-confirmation',
  'settings-invalid-skill',
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
  'scheduler-name-conflict',
  'scheduler-stale-link',
  'scheduler-unpaired-target',
  'recently-closed',
  'recently-closed-expanded',
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

const fixtureAgo = (seconds: number) => new Date(Date.parse(FIXTURE_NOW) - seconds * 1_000).toISOString()

/**
 * Eight running tasks, two of them subagents (one synchronous), and two that
 * have finished. Without `stoppable` nothing has a stop handle, as in a tmux
 * session; with it everything but a detached shell does, as in an SDK one.
 */
export function backgroundTasksFixture(stoppable: boolean): BackgroundTaskSnapshot {
  const shell = (id: string, command: string, secondsAgo: number, change: Partial<BackgroundTask> = {}): BackgroundTask => ({
    id, type: 'shell', description: command, command, status: 'running', executionMode: 'background',
    attachmentMode: 'attached', startedAt: fixtureAgo(secondsAgo), canCancel: stoppable, ...change,
  })
  const steps = [
    'Read the recovery checklist', 'Opened the field guide', 'Compared the restore order',
    'Checked the backup notes', 'Found two stale links', 'Drafted the corrections', 'Re-read the handbook index',
  ]
  return {
    supported: true,
    // The runtime counts background work only; the synchronous subagent makes eight.
    runningCount: 7,
    tasks: [
      {
        id: 'agent-recovery-review', type: 'agent', description: 'Review the recovery paths', agentType: 'code-review',
        prompt: 'Review the recovery paths in the field guide and list anything stale.',
        status: 'running', executionMode: 'background', startedAt: fixtureAgo(250), activeTimeMs: 212_000,
        canCancel: stoppable,
        progress: {
          type: 'agent', latestIntent: 'Comparing the restore order with the checklist',
          recentActivity: steps.map((message, index) => ({ message, timestamp: fixtureAgo(230 - index * 30) })),
        },
      },
      {
        id: 'agent-guide-links', type: 'agent', description: 'Check the guide links', agentType: 'explore',
        prompt: 'Check every link in the field guide.', status: 'running', executionMode: 'sync',
        startedAt: fixtureAgo(65), canCancel: stoppable,
      },
      shell('shell-1', 'pnpm dev --host 127.0.0.1', 7_530),
      shell('shell-2', 'pnpm test --watch', 1_210),
      shell('shell-3', 'tail -f logs/sync.log', 905, { attachmentMode: 'detached', canCancel: false }),
      shell('shell-4', 'pnpm docs:preview', 610),
      shell('shell-5', 'rsync --dry-run field-notes backup', 125),
      shell('shell-6', 'pnpm lint --watch', 48),
      shell('shell-7', 'pnpm build', 400, {
        status: 'completed', completedAt: fixtureAgo(310), canCancel: false,
        progress: { type: 'shell', recentOutput: 'Built the field guide in 88s' },
      }),
      shell('shell-8', 'pnpm check', 900, {
        status: 'failed', completedAt: fixtureAgo(700), canCancel: false, error: 'The command exited with status 1',
      }),
    ],
  }
}

/**
 * Three closed sessions, newest first, with a context read from Markdown as
 * agents write it, as the closing computer reads it: the first says more
 * than three lines hold on every viewport, the last fits on any.
 */
export function recentlyClosedFixture(): ManagedSession[] {
  const cwd = '/home/demo/field-notes'
  const closed = (
    id: string, computerId: string, computerName: string, title: string, secondsAgo: number,
    prompts: string[], reply: string,
  ): ManagedSession => {
    const messages: ChatMessage[] = [
      ...prompts.map((content, index): ChatMessage => ({
        id: `${id}-prompt-${index}`, role: 'user', content, createdAt: fixtureAgo(secondsAgo + 60 * (prompts.length - index)),
      })),
      { id: `${id}-reply`, role: 'assistant', content: reply, createdAt: fixtureAgo(secondsAgo) },
    ]
    return {
      id, computerId, computerName, title, cwd, provider: 'copilot', executionMode: 'sdk',
      updatedAt: fixtureAgo(secondsAgo), status: 'idle', isOpen: false, messages: [], closedAt: fixtureAgo(secondsAgo),
      closedContext: closedSessionContext({ title, cwd, messages }),
    }
  }
  return [
    closed('fixture-disk-audit', 'fixture-studio', 'Studio', 'Audit disk usage and propose cleanup', 50 * 60, [
      'How do I give **WSL** 200 GB more?',
      'Is it larger now? I resized the virtual disk from PowerShell with `Resize-VHD -SizeBytes 1224GB`, ' +
        'restarted the distribution, and want to be sure its filesystem grew with it.',
      'Continue',
    ], 'Yes—the resize worked. I verified that `Ubuntu-26.04` went from **1,024 to 1,224 GiB** of virtual disk ' +
      'capacity, exactly **+200 GiB**, and that the Linux filesystem grew too.\n\n' +
      '- WSL now has **1,203.7 GiB** of filesystem capacity, with **521.3 GiB available** (55% used).\n' +
      '- Windows `C:` has **991.5 GiB available**.\n\n' +
      'I didn’t change anything else; the [cleanup plan](https://example.com/plan) lists three folders to ' +
      'review before deleting any of them.'),
    closed('fixture-guide-revisions', 'fixture-build', 'Build node', 'Compare the field guide revisions', 3 * 60 * 60, [
      'Compare the two field guide revisions and list what moved',
      'Keep the [recovery checklist](https://example.com/checklist) as the reference',
    ], '## Summary\n\n- Three sections moved and none were removed.\n- The checklist matches the newer revision.'),
    closed('fixture-nightly-sync', 'fixture-studio', 'Studio', 'Profile the nightly sync', 2 * 24 * 60 * 60, [
      'Find out why the nightly sync takes 40 minutes now',
    ], 'Caching folder listings would bring it to about 12 minutes.'),
  ]
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
      const originTasks = name === 'session-origin-tasks' || name === 'session-origin-tasks-short'
      const origins = name === 'session-origins' || originTasks || name === 'session-origin-run' || name === 'session-subagents'
      // Tool rows are the most numerous rows in a real transcript; this scene
      // keeps their collapsed density locked on every viewport.
      const toolRows = name === 'conversation-tool-rows'
      if (toolRows) {
        state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
          .messages.splice(1, 0, ...structuredClone(fixtureActivityMessages))
      }
      if (origins) {
        state.settings = {
          revision: 1, values: { previewFeatures: { schedulerView: true, desktopRail: true } },
          keyRevisions: { previewFeatures: 1 },
        }
        state.sessions[0].provenance = {
          origin: 'schedule', scheduleId: provenanceSchedules[0].id,
          scheduleName: provenanceSchedules[0].name, scheduleRunId: provenanceRuns[0].id,
        }
        state.sessions[1].provenance = { origin: 'user' }
        state.sessions[2].provenance = { origin: 'manager' }
        state.sessions[3].provenance = { origin: 'discovered' }
        if (originTasks) state.sessions[0].title = name === 'session-origin-tasks-short'
          ? 'Daily review' : 'Review the complete field guide and the scheduled recovery checklist'
      }
      const backgroundTasks = name.startsWith('background-tasks')
      const tasksSheet = backgroundTasks && name !== 'background-tasks' && name !== 'background-tasks-light'
      if (name === 'background-tasks-expanded') {
        state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!.executionMode = 'sdk'
      }
      if (name === 'composer-family-claude' || name === 'composer-family-openai') {
        const claude = name === 'composer-family-claude'
        const model = claude
          ? { ...state.models[0], id: 'claude-opus-5.5', name: 'Claude Opus 5.5' }
          : { ...state.models[0], id: 'gpt-6.2-sol', name: 'GPT-6.2 Sol' }
        state.models.push(model)
        const runtime = state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!.runtime!
        runtime.model = model.id
        runtime.mode = claude ? 'autopilot' : 'interactive'
      }
      if (['composer-status-busy', 'composer-session-setup', 'composer-button-row', 'composer-session-panel', 'composer-sent-messages', 'composer-delivery-menu', 'composer-delivery-unavailable'].includes(name)) {
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
      if (name.startsWith('scheduler')) {
        state.settings.values = { previewFeatures: { desktopRail: true, schedulerView: true }, displayName: 'Alex Morgan' }
        state.settings.revision = 1
      }
      if (name === 'settings-skills' || name === 'settings-skill-confirmation' || name === 'settings-invalid-skill') {
        state.settings.values = {
          previewFeatures: { desktopRail: true, hostMonitorView: true, schedulerView: true },
          displayName: 'Alex Morgan',
        }
        state.hubFlags = { ...state.hubFlags, hostMonitor: true, scheduler: true }
      }
      if (name === 'settings-health') {
        state.settings.values = {
          previewFeatures: { desktopRail: true, hostMonitorView: true, schedulerView: true },
          displayName: 'Alex Morgan',
        }
        state.hubFlags = { ...state.hubFlags, hostMonitor: true, scheduler: true }
      }
      if (name === 'settings-navigation' || name === 'settings-remote-machines' || name === 'settings-search' || name === 'settings-health-search') {
        state.settings.values = {
          previewFeatures: { desktopRail: true, hostMonitorView: true, schedulerView: true },
          displayName: 'Alex Morgan',
        }
        state.hubFlags = { ...state.hubFlags, hostMonitor: true, scheduler: true }
      }
      if (name === 'preview-features') {
        state.hubFlags = { notificationCenter: true, hostMonitor: false, scheduler: false }
      }
      const recentlyClosed = name.startsWith('recently-closed')
      if (recentlyClosed) state.closedSessions.push(...recentlyClosedFixture())
      if (name === 'session-categories') {
        // A closed category summing up two that need you, one unread, and one
        // working, then an open one: both kinds of header, above the computers.
        const key = (computerId: string, id: string) => `${computerId}:${id}`
        state.sessionOrder.unread = [key('fixture-studio', 'fixture-draft-summary')]
        state.sessionCategories = {
          revision: 2,
          categories: [
            {
              id: 'reviews', name: 'Reviews', collapsed: true,
              sessions: [
                key('fixture-studio', 'fixture-review-recovery'), key('fixture-build', 'fixture-check-links'),
                key('fixture-studio', 'fixture-draft-summary'), key('fixture-build', 'fixture-approve-check'),
              ],
            },
            {
              id: 'plans', name: 'Plans', collapsed: false,
              sessions: [key('fixture-studio', SELECTED_SESSION_ID)],
            },
          ],
        }
      }
      const busyQueue = name === 'composer-busy-queue' || name === 'composer-busy-queue-light'
      if (busyQueue) {
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
        appearance: name.endsWith('-light') ? 'light' : 'graphite',
        state,
        notifications: name === 'notification-panel' ? fixtureNotifications : undefined,
        activityDetails: toolRows ? fixtureActivityDetails : undefined,
        hostMonitor: Boolean(hostStatus) || name === 'host-monitor' || name === 'host-processes' || name === 'settings-navigation' || name === 'settings-remote-machines' || name === 'settings-health' || name === 'settings-skills' || name === 'settings-skill-confirmation',
        hostMonitorWsl: name === 'host-monitor' || name === 'host-processes',
        scheduler: name === 'oracle-schedule-approval' ? {
          schedules: [], runs: [], proposals: fixtureScheduleProposals,
        } : name.startsWith('scheduler') || name === 'notification-panel'
          ? {
            schedules: name === 'scheduler-unpaired-target' ? fixtureSchedules.map((schedule) =>
              schedule.id === 'fixture-daily-review' ? { ...schedule, target: { ...schedule.target, computerId: 'fixture-retired' } } : schedule) : fixtureSchedules,
            runs: fixtureScheduleRuns, proposals: name === 'notification-panel' ? [] : fixtureScheduleProposals,
          }
          : origins ? { schedules: structuredClone(provenanceSchedules), runs: structuredClone(provenanceRuns) } : undefined,
        taskSnapshots: backgroundTasks ? {
          [`fixture-studio:${SELECTED_SESSION_ID}`]: backgroundTasksFixture(name === 'background-tasks-expanded'),
        } : name === 'session-subagents' || originTasks ? {
          [`fixture-studio:${SELECTED_SESSION_ID}`]: {
            supported: true, runningCount: 1, tasks: [
              { id: 'fixture-sync-agent', type: 'agent', description: 'Review recovery paths', status: 'running', executionMode: 'sync', startedAt: FIXTURE_NOW, canCancel: false },
              { id: 'fixture-background-agent', type: 'agent', description: 'Check the guide links', status: 'running', executionMode: 'background', startedAt: FIXTURE_NOW, canCancel: true },
            ],
          },
        } : undefined,
        manager: hostStatus?.manager ?? (['oracle-panel', 'oracle-schedule-approval'].includes(name) || name.startsWith('scheduler') ? {
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
      if (busyQueue) {
        await expect(page.getByRole('region', { name: 'Queued prompts' })).toContainText('Check the release notes next.')
      } else if (toolRows) {
        const rows = page.getByRole('button', { name: /^(Completed|Failed): / })
        await expect(rows).toHaveCount(fixtureActivityMessages.length)
        for (const row of await rows.all()) await expect(row).toHaveAttribute('aria-expanded', 'false')
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
      } else if (name === 'session-origins' || originTasks) {
        await openSessions(page)
        const nav = page.getByRole('navigation', { name: 'Sessions', exact: true })
        await expect(nav.getByRole('img', { name: 'Started by schedule Morning field guide review' })).toBeVisible()
        await expect(nav.getByRole('img', { name: 'Started by Oracle' })).toBeVisible()
        await expect(nav.getByRole('img', { name: 'Found on this computer' })).toBeVisible()
        if (originTasks) {
          const row = nav.locator('.session-item__body--task-status:has(> .session-origin-run-link)')
          await expect(row).toBeVisible()
          const clearance = await row.evaluate((element) => {
            const title = element.querySelector<HTMLElement>('.session-item__text > strong')!
            const task = element.querySelector<HTMLElement>('.session-item__tasks')!
            return {
              titleEnd: title.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(title).paddingRight),
              taskStart: task.getBoundingClientRect().left,
            }
          })
          expect(clearance.titleEnd).toBeLessThanOrEqual(clearance.taskStart)
        }
      } else if (name === 'session-origin-run') {
        await page.locator('.conversation-header').getByRole('link', { name: 'View run from schedule Morning field guide review' }).click()
        await expect(page.getByRole('dialog', { name: 'Scheduler', exact: true })
          .getByRole('region', { name: 'Run history for Morning field guide review' })).toContainText('Reviewed the field guide links.')
      } else if (name === 'session-subagents') {
        await expect(page.getByRole('button', { name: '2 background tasks running, 2 subagents', exact: true })).toBeVisible()
      } else if (backgroundTasks) {
        // Found by its tooltip, which the status item had before it was condensed too.
        const status = page.getByTestId('web-statusline').getByTitle('View background tasks', { exact: true })
        await expect(status).toBeVisible()
        await expect(status).not.toHaveText(/^0 /)
        if (tasksSheet) {
          await status.click()
          const sheet = page.getByRole('dialog', { name: /^Background tasks · / })
          await expect(sheet).toContainText('Review the recovery paths')
          if (name === 'background-tasks-expanded') {
            await sheet.getByRole('button', { name: 'Running subagent: Review the recovery paths', exact: true }).click()
            await expect(sheet.getByRole('button', { name: 'Show all (7)', exact: true })).toBeVisible()
          }
        }
      } else if (recentlyClosed) {
        await openSessions(page)
        await page.getByRole('navigation', { name: 'Sessions', exact: true })
          .getByRole('button', { name: 'Recently closed, 3 sessions', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'Recently closed', exact: true })
        await expect(dialog.getByRole('article')).toHaveCount(3)
        const more = dialog.getByRole('article', { name: 'Audit disk usage and propose cleanup' })
          .getByRole('button', { name: /^Show (more|less)$/ })
        await expect(more).toHaveText('Show more')
        if (name === 'recently-closed-expanded') {
          await more.click()
          await expect(more).toHaveAttribute('aria-expanded', 'true')
        }
      } else if (name === 'session-list' || name === 'desktop-rail' || name === 'session-categories') {
        await openSessions(page)
      } else if (name === 'session-actions') {
        await page.getByRole('button', { name: 'Session actions', exact: true }).click()
        const actions = page.getByRole('group', { name: 'Session actions', exact: true })
        await expect(actions.getByRole('button', { name: 'Restart session', exact: true })).toBeVisible()
      } else if (name === 'settings-skills' || name === 'settings-skill-confirmation' || name === 'settings-invalid-skill') {
        await openSessions(page)
        await page.getByRole('button', { name: 'App settings', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
        await dialog.getByRole('button', { name: /^Skills Hub/ }).click()
        await expect(dialog.getByRole('button', { name: 'Disable review-notes', exact: true })).toBeVisible()
        if (name === 'settings-invalid-skill') {
          await dialog.getByRole('searchbox', { name: 'Search skills' }).fill('invalid-checklist')
          await expect(dialog.getByRole('button', { name: 'Enable invalid-checklist', exact: true })).toBeDisabled()
          const actionLines = await dialog.getByRole('button', { name: 'Enable invalid-checklist', exact: true }).evaluate((button) => {
            const text = document.createRange()
            text.selectNodeContents(button)
            return text.getClientRects().length
          })
          expect(actionLines).toBe(1)
          await expect(dialog.getByText('SKILL.md frontmatter description is required and must be at most 1024 characters.')).toBeVisible()
        } else if (name === 'settings-skill-confirmation') {
          await dialog.getByRole('combobox', { name: 'Skills computer' }).selectOption('fixture-build')
          await dialog.getByRole('button', { name: 'Disable review-notes', exact: true }).click()
          await expect(dialog.getByRole('group', { name: 'Confirm skill change' })).toContainText('every session on Build node')
        }
      } else if (name === 'settings-health') {
        await openSessions(page)
        await page.getByRole('button', { name: 'App settings', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
        await dialog.getByRole('button', { name: /^App\s*This device/ }).click()
        const health = dialog.getByRole('region', { name: 'Health', exact: true })
        await expect(health).toContainText('fixture-release-2026-09-04')
        await health.scrollIntoViewIfNeeded()
      } else if (name === 'settings-navigation' || name === 'settings-remote-machines' || name === 'settings-search' || name === 'settings-health-search') {
        await openSessions(page)
        await page.getByRole('button', { name: name === 'settings-remote-machines' ? 'Manage computers' : 'App settings', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
        await expect(dialog.getByRole('textbox', { name: 'Search settings' }).or(dialog.getByRole('searchbox', { name: 'Search settings' }))).toBeVisible()
        if (name === 'settings-search' || name === 'settings-health-search') {
          const label = name === 'settings-search' ? 'Desktop rail' : 'Health'
          await dialog.getByRole('searchbox', { name: 'Search settings' }).fill(label)
          await dialog.getByRole('button', { name: label === 'Health' ? /^App\s*This device/ : /^Interface/ }).click()
          if (label === 'Health') {
            await expect(dialog.getByRole('region', { name: 'Health', exact: true })).toBeVisible()
          } else {
            await expect(dialog.getByRole('checkbox', { name: label, exact: true })).toBeVisible()
          }
        } else if (name === 'settings-remote-machines') {
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
        const dialog = page.getByRole('dialog', { name: 'App settings', exact: true })
        await expect(dialog).toBeVisible()
        if (appSettings) {
          if (page.viewportSize()!.width < 600) await dialog.getByRole('button', { name: /^Models/ }).click()
          await expect(dialog.getByRole('combobox', { name: 'GitHub Copilot default model', exact: true })).toBeEnabled()
          await expect(dialog.getByRole('combobox', { name: 'Claude Agent default model', exact: true })).toBeEnabled()
          await dialog.evaluate((element) => { element.scrollTop = 0 })
          await expect(dialog.getByRole('heading', { name: 'Models', exact: true })).toBeInViewport()
          if (name === 'preview-features') {
            if (page.viewportSize()!.width < 600) await dialog.getByRole('button', { name: 'All settings', exact: true }).click()
            await dialog.getByRole('button', { name: /^Interface/ }).click()
            const previews = dialog.getByRole('region', { name: 'Preview features', exact: true })
            await previews.scrollIntoViewIfNeeded()
            await expect(previews.getByRole('heading', { name: 'Preview features', exact: true })).toBeInViewport()
            await expect(previews.getByRole('checkbox', { name: 'Notification panel', exact: true })).toBeEnabled()
            await expect(previews.getByRole('checkbox', { name: 'Host monitor', exact: true })).toBeDisabled()
            await expect(previews.getByText('Turned off on this hub', { exact: false })).toHaveCount(2)
          }
        }
      } else if (name === 'notification-panel') {
        await openSessions(page)
        await page.getByRole('button', { name: /^Notifications(?:, \d+ unread)?$/ }).click()
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
      } else if (name.startsWith('scheduler')) {
        await openSessions(page)
        await page.getByRole('button', { name: 'Scheduler', exact: true }).click()
        const scheduler = page.getByRole('dialog', { name: 'Scheduler', exact: true })
        await expect(scheduler).toContainText('Daily workspace review')
        await expect(scheduler.getByRole('button', { name: 'Review in Oracle', exact: true })).toBeEnabled()
        if (name === 'scheduler-unpaired-target') {
          await scheduler.getByRole('button', { name: 'Edit Daily workspace review', exact: true }).click()
          await scheduler.getByRole('button', { name: 'Target', exact: true }).click()
          await expect(scheduler.getByRole('combobox', { name: 'Computer', exact: true })).toHaveValue('fixture-retired')
          await expect(scheduler.getByRole('status')).toContainText('This target computer is not paired.')
        } else if (name === 'scheduler-stale-link') {
          const url = new URL(page.url())
          url.searchParams.set('schedule', 'fixture-deleted-review')
          url.searchParams.set('run', 'fictional-missing-run')
          await page.goto(url.href)
          await expect(scheduler).toContainText('This schedule no longer exists.')
          await expect(scheduler.getByRole('heading', { name: 'Daily workspace review', exact: true })).toBeVisible()
        } else if (name === 'scheduler-name-conflict') {
          await scheduler.getByRole('button', { name: 'Duplicate Daily workspace review', exact: true }).click()
          await scheduler.getByRole('textbox', { name: 'Name', exact: true }).fill('Daily workspace review')
          await scheduler.getByRole('button', { name: 'Policies', exact: true }).click()
          await scheduler.getByRole('button', { name: 'Save schedule', exact: true }).click()
          await expect(scheduler.getByRole('alert')).toContainText('A non-archived schedule already has this name')
          await expect(scheduler.getByRole('alert')).not.toContainText('changed on the hub')
          await scheduler.getByRole('button', { name: 'Details', exact: true }).click()
          await expect(scheduler.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('Daily workspace review')
        } else if (name === 'scheduler-form') {
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
      if (name === 'scheduler-name-conflict' || name === 'scheduler-stale-link') {
        await page.getByRole('dialog', { name: 'Scheduler', exact: true }).evaluate((element) => { element.scrollTop = 0 })
      }
      await page.evaluate(() => document.fonts.ready)
      await page.mouse.move(0, 0)
      fixture.assertHealthy()
      return { ...fixture, state }
    },
  }))
}

/**
 * Fails unless the page sees a mouse, as a desktop browser does, so a check of
 * a mouse-only layout cannot pass without ever applying it. Chromium reports
 * `(hover: hover)` and `(pointer: fine)` unless touch is emulated, which the
 * Playwright project does by default: such a test sets `hasTouch: false`.
 */
export async function assertMousePointer(page: Page) {
  expect(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)).toBe(true)
}

export async function assertNoHorizontalOverflow(page: Page) {
  const layout = await page.evaluate(() => {
    const width = document.documentElement.clientWidth
    // Internal scrollers (for example the settings content pane) may scroll;
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
