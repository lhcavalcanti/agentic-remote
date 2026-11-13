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

// The kind of status table Oracle answers with: one-word cells and full SHAs.
function tableAnswer(): ManagerSnapshot {
  const sha = '4b49f552accc8adba70bb585b4f4bc9758ec6148'
  const createdAt = new Date(Date.parse(FIXTURE_NOW) - 5 * 60_000).toISOString()
  return {
    available: true,
    status: 'idle',
    messages: [
      { id: 'table-question', role: 'user', content: 'Where are the open pull requests?', createdAt },
      {
        id: 'table-answer',
        role: 'assistant',
        content: [
          '| PR | Head | Review | Gate | Version |',
          '|---|---|---|---|---|',
          ...[7, 8, 9].map((pr) => `| #54${pr} | \`${sha}\` | APPROVE | success | 1.46.1${pr - 7} |`),
        ].join('\n'),
        createdAt,
      },
    ],
    queued: 0,
    managedSessions: [],
  }
}

async function openDockedOracle(page: Page) {
  await page
    .locator('main')
    .getByRole('button', { name: /^Oracle/ })
    .first()
    .click()
  await page.getByRole('button', { name: 'Dock Oracle', exact: true }).click()
  await expect(page.locator('#oracle-panel')).toHaveAttribute('data-placement', 'docked')
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
      await openDockedOracle(page)
      await expectDockedInsideWindow(page, viewport)

      // Opening straight into the docked panel is where the page used to scroll.
      await page.goto('/?oracle=open')
      await expectDockedInsideWindow(page, viewport)
    } finally {
      fixture.assertHealthy()
    }
  })
}

// The panel takes its width from the conversation, which can be left as
// narrow as 360px; its header and status line must still fit in that column.
for (const viewport of [
  { name: 'at its narrowest', width: 1100, height: 800 },
  { name: 'beside the default panel', width: 1280, height: 800 },
] as const) {
  test(`fits the conversation beside docked Oracle ${viewport.name}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    const fixture = await setupWorkspaceFixture(page, {
      baseUrl: testInfo.project.use.baseURL!,
      knowledgeMode: 'hidden',
      manager: longConversation(),
      preserveStorageOnReload: true,
    })
    try {
      await page.goto('/')
      await openDockedOracle(page)
      const conversation = page.locator('main.conversation')
      const knowledge = conversation.getByRole('button', {
        name: 'Session knowledge',
        exact: true,
      })
      await expect(knowledge).toBeVisible()
      await expect(knowledge.locator('.header-action-label')).toBeHidden()

      const statusline = page.getByTestId('web-statusline')
      expect(
        await statusline.evaluate((line) => line.scrollWidth <= line.clientWidth),
      ).toBe(true)
      const lineBox = await statusline.boundingBox()
      const tasksBox = await statusline
        .getByRole('button', { name: 'View background tasks' })
        .boundingBox()
      expect(tasksBox!.x + tasksBox!.width).toBeLessThanOrEqual(lineBox!.x + lineBox!.width)
    } finally {
      fixture.assertHealthy()
    }
  })
}

test('scrolls a wide table in a docked Oracle answer without breaking its words', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl: testInfo.project.use.baseURL!,
    knowledgeMode: 'hidden',
    manager: tableAnswer(),
    preserveStorageOnReload: true,
  })
  try {
    await page.goto('/')
    await openDockedOracle(page)
    const panel = page.locator('#oracle-panel')
    const table = panel.locator('.manager-message--assistant table')
    await expect(table).toBeVisible()
    expect(await table.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)
    expect(
      await panel
        .locator('.manager-transcript')
        .evaluate((list) => list.scrollWidth <= list.clientWidth),
    ).toBe(true)

    const brokenWords = await table.evaluate((element) => {
      const broken: string[] = []
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const word = node.textContent?.trim() ?? ''
        if (!word || /\s/.test(word)) continue
        const range = document.createRange()
        range.selectNodeContents(node)
        const lines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)))
        if (lines.size > 1) broken.push(word)
      }
      return broken
    })
    expect(brokenWords).toEqual([])
  } finally {
    fixture.assertHealthy()
  }
})

test.describe('with a mouse', () => {
  // The project emulates touch; Oracle's rule must not depend on it.
  test.use({ hasTouch: false })

  test('folds a long message you send on a desktop to eight lines, as on a phone', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const createdAt = new Date(Date.parse(FIXTURE_NOW) - 5 * 60_000).toISOString()
    const steps = (count: number) =>
      Array.from({ length: count }, (_, index) => `Step ${index + 1}: rerun the checks.`).join('\n')
    const fixture = await setupWorkspaceFixture(page, {
      baseUrl: testInfo.project.use.baseURL!,
      knowledgeMode: 'hidden',
      manager: {
        available: true,
        status: 'idle',
        // Past Oracle's limit of 12 lines; and past the desktop conversation's 30.
        messages: [
          { id: 'long', role: 'user', content: steps(13), createdAt, state: 'done' },
          { id: 'very-long', role: 'user', content: steps(31), createdAt, state: 'done' },
        ],
        queued: 0,
        managedSessions: [],
      },
    })
    // Eight lines of 14px text at a 1.5 line height, inside 8px of padding above and below.
    const folded = 8 * 14 * 1.5 + 16
    try {
      await page.goto('/?oracle=open')
      const sent = page.locator('#oracle-panel .manager-message--user')
      for (const message of [sent.nth(0), sent.nth(1)]) {
        await expect(message.getByRole('button', { name: 'Show all' })).toBeVisible()
        const text = message.locator('.manager-message__text')
        expect(Math.abs((await text.boundingBox())!.height - folded)).toBeLessThan(2)
        await message.getByRole('button', { name: 'Show all' }).click()
        expect(await text.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
        await message.getByRole('button', { name: 'Show less' }).click()
        expect(Math.abs((await text.boundingBox())!.height - folded)).toBeLessThan(2)
      }
    } finally {
      fixture.assertHealthy()
    }
  })
})
