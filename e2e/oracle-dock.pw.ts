import { expect, test, type Page } from '@playwright/test'
import type { ManagerMessage, ManagerSnapshot } from '../shared/manager'
import { FIXTURE_NOW, setupWorkspaceFixture } from './workspace-fixtures'

// Several windows tall, so only the transcript's own scroll can hold it.
function longConversation(): ManagerSnapshot {
  const start = Date.parse(FIXTURE_NOW) - 60 * 60_000
  const messages: ManagerMessage[] = Array.from({ length: 24 }, (_, index) => ({
    id: `dock-${index}`,
    role: index % 2 ? 'assistant' : 'user',
    content: index % 2
      ? `Checked the sessions. ${'The plan is on track and its checks pass. '.repeat(8)}`
      : `What changed in round ${index / 2 + 1}?`,
    createdAt: new Date(start + index * 60_000).toISOString(),
  }))
  return {
    available: true,
    status: 'idle',
    messages,
    queued: 0,
    managedSessions: [],
  }
}

async function expectDockedInsideWindow(
  page: Page,
  viewport: { width: number; height: number },
) {
  const panel = page.locator('#oracle-panel')
  await expect(panel).toHaveAttribute('data-placement', 'docked')
  for (const region of [panel, page.locator('.workspace')]) {
    const bounds = await region.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.y).toBe(0)
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height)
  }
  const transcript = panel.locator('.manager-transcript')
  expect(
    await transcript.evaluate((list) => list.scrollHeight > list.clientHeight),
  ).toBe(true)
  await expect(
    panel.getByRole('button', { name: 'Undock Oracle', exact: true }),
  ).toBeInViewport({ ratio: 1 })
  await expect(
    panel.getByRole('textbox', { name: 'Message Oracle', exact: true }),
  ).toBeInViewport({ ratio: 1 })
}

for (const viewport of [
  { name: 'beside the sessions', width: 1280, height: 800, knowledge: 'hidden' },
  { name: 'beside docked Knowledge', width: 1920, height: 1080, knowledge: 'docked' },
] as const) {
  test(`keeps docked Oracle inside the window ${viewport.name}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    const fixture = await setupWorkspaceFixture(page, {
      baseUrl: testInfo.project.use.baseURL!,
      knowledgeMode: viewport.knowledge,
      manager: longConversation(),
      preserveStorageOnReload: true,
    })
    try {
      await page.goto('/')
      await page
        .locator('main')
        .getByRole('button', { name: /^Oracle/ })
        .first()
        .click()
      await page.getByRole('button', { name: 'Dock Oracle', exact: true }).click()
      await expectDockedInsideWindow(page, viewport)

      // Opening straight into the docked panel is where the page used to scroll.
      await page.goto('/?oracle=open')
      await expectDockedInsideWindow(page, viewport)
    } finally {
      fixture.assertHealthy()
    }
  })
}
