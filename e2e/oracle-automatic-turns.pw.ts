import { expect, test } from '@playwright/test'
import type { ManagerMessage, ManagerSnapshot } from '../shared/manager'
import { formatProactivePrompt } from '../shared/manager-automatic'
import { FIXTURE_NOW, setupWorkspaceFixture } from './workspace-fixtures'

const event = (seed: string, kind: 'failed' | 'blocked' | 'finished') => ({
  id: seed.repeat(64),
  kind,
  computerId: 'development',
  sessionId: `session-${seed}`,
  taskGeneration: 3,
  revision: 41,
})

/** A conversation where Oracle reacts to its sessions and a durable task. */
function automaticTurns(): ManagerSnapshot {
  const at = (minutes: number) => new Date(Date.parse(FIXTURE_NOW) - minutes * 60_000).toISOString()
  const finished = event('a', 'finished')
  const failed = event('b', 'failed')
  const blocked = event('c', 'blocked')
  const refs = (...events: ReturnType<typeof event>[]) =>
    events.map(({ computerId, sessionId }) => ({ computerId, sessionId }))
  const messages: ManagerMessage[] = [
    {
      id: 'ask', role: 'user', state: 'done', createdAt: at(30),
      content: 'Start a session to tidy the release notes and tell me when it is done.',
    },
    {
      id: 'started', role: 'activity', createdAt: at(29), tool: 'create_session', content: 'Started "Release notes"',
      sessionRefs: [{ computerId: 'development', sessionId: finished.sessionId, title: 'Release notes' }],
    },
    {
      id: 'update', role: 'user', state: 'done', createdAt: at(12), source: 'proactive', answerOnly: true,
      content: formatProactivePrompt([finished]),
      automatic: { kind: 'proactive', eventIds: [finished.id], sessionRefs: refs(finished) },
    },
    {
      id: 'report', role: 'assistant', createdAt: at(11), replyTo: 'update',
      content: '**Release notes** finished: the notes are grouped by area and every changelog link resolves.',
    },
    {
      id: 'updates', role: 'user', state: 'failed', createdAt: at(6), source: 'proactive', answerOnly: true,
      error: 'Oracle could not answer: the model timed out.',
      content: formatProactivePrompt([failed, blocked]),
      automatic: { kind: 'proactive', eventIds: [failed.id, blocked.id], sessionRefs: refs(failed, blocked) },
    },
    {
      id: 'task', role: 'user', state: 'done', createdAt: at(2), source: 'task',
      content: [
        'Re-run the flaky gate and compare the two failures.',
        '',
        'Durable task: Stabilise the merge gate',
        'Next action: Compare the failing runs',
      ].join('\n'),
      automatic: { kind: 'task', taskId: 'merge-gate', sessionRefs: [] },
    },
  ]
  return { available: true, status: 'idle', messages, queued: 0, managedSessions: [] }
}

for (const viewport of [
  { name: 'on a phone', width: 390, height: 844 },
  { name: 'on a desktop', width: 1280, height: 800 },
] as const) {
  test(`shows Oracle's automatic turns as thin rows ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    const fixture = await setupWorkspaceFixture(page, {
      baseUrl: testInfo.project.use.baseURL!,
      manager: automaticTurns(),
    })
    try {
      await page.goto('/?oracle=open')
      const transcript = page.getByRole('list', { name: 'Oracle conversation' })
      const fitsWidth = () => transcript.evaluate((list) => list.scrollWidth <= list.clientWidth)
      const update = transcript.getByRole('listitem').filter({ hasText: 'Session update · finished' })
      const toggle = update.getByRole('button', { name: 'Prompt Oracle received' })
      await expect(update).toBeVisible()
      await expect(transcript.getByRole('listitem').filter({ hasText: 'Task follow-up · Stabilise the merge gate' })).toBeVisible()

      // One line no taller than its own controls, and nothing wider than the panel.
      const [row, control] = await Promise.all([update.boundingBox(), toggle.boundingBox()])
      expect(row!.height).toBeLessThanOrEqual(control!.height + 1)
      expect(await fitsWidth()).toBe(true)

      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')
      await expect(update.getByText(/^Review these durable manager-owned lifecycle events/)).toBeVisible()
      expect(await fitsWidth()).toBe(true)
    } finally {
      fixture.assertHealthy()
    }
  })
}
