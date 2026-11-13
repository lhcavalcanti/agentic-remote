import { expect, test, type Locator, type Page } from '@playwright/test'
import type { ManagedSession } from '../shared/contracts'
import {
  FIXTURE_NOW,
  SELECTED_SESSION_ID,
  createWorkspaceFixtureState,
  setupWorkspaceFixture,
} from './workspace-fixtures'

/** A message you might send: `count` numbered steps, one a line. */
function steps(count: number) {
  return Array.from(
    { length: count },
    (_, index) => `Step ${index + 1}: rerun the checks and report anything unexpected.`,
  ).join('\n')
}

/** Past a phone's limit of 12 lines, but within a desktop's 30. */
const long = steps(24)
/** Past both limits. */
const veryLong = steps(40)
const phone = { width: 390, height: 844 }
const desktop = { width: 1440, height: 900 }
/** A line of a message you sent: 14px text at a 1.55 line height. */
const line = 14 * 1.55

// A phone or touch device collapses a long message to six lines. A desktop
// with a mouse has room for more: only a very long one collapses, to twelve.
const devices = [
  { name: 'phone', viewport: phone, hasTouch: true, message: long, lines: 6 },
  { name: 'desktop', viewport: desktop, hasTouch: false, message: veryLong, lines: 12 },
]

/** A conversation where `content`, which you sent, is followed by `after` short exchanges. */
async function open(page: Page, baseUrl: string, content: string, after: number) {
  const state = createWorkspaceFixtureState()
  const session = state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
  const start = Date.parse(FIXTURE_NOW) - 60 * 60_000
  const at = (minute: number) => new Date(start + minute * 60_000).toISOString()
  session.messages = [
    { id: 'ask', role: 'user', content: 'Can you look at the failing check?', createdAt: at(0) },
    { id: 'answer', role: 'assistant', content: 'Yes. Tell me what to rerun.', createdAt: at(1) },
    { id: 'long-sent', role: 'user', content, createdAt: at(2) },
    { id: 'reply', role: 'assistant', content: 'Rerunning them now.', createdAt: at(3) },
    ...Array.from({ length: after }, (_, index) => ({
      id: `later-${index}`,
      role: index % 2 ? 'assistant' as const : 'user' as const,
      content: index % 2 ? `Round ${index} passed.` : `And round ${index + 1}?`,
      createdAt: at(4 + index),
    })),
  ]
  const fixture = await setupWorkspaceFixture(page, { baseUrl, knowledgeMode: 'hidden', state })
  let revision = session.revision ?? 1
  const live = (patch: Partial<ManagedSession>): ManagedSession => {
    revision += 1
    return { ...structuredClone(session), ...patch, revision, updatedAt: FIXTURE_NOW }
  }
  await page.goto(fixture.url)
  const sent = page.locator('.message--user').filter({ hasText: 'Step 1:' })
  await expect(sent).toBeAttached()
  return { fixture, live, sent, content: sent.locator('.message__content') }
}

/** Whether nothing of the element's text is cut off. */
function whole(element: Locator) {
  return element.evaluate((node) => node.scrollHeight - node.clientHeight <= 1)
}

for (const device of devices) {
  test.describe(`on a ${device.name}`, () => {
    // The project emulates touch, which is the touch-device half of the phone rule.
    test.use({ hasTouch: device.hasTouch, viewport: device.viewport })

    test('a long message you send starts collapsed, and reading it keeps your place', async ({ page }, testInfo) => {
      const { fixture, live, sent, content } = await open(page, testInfo.project.use.baseURL!, device.message, 0)
      try {
        const showAll = sent.getByRole('button', { name: 'Show all' })
        await expect(showAll).toBeVisible()
        expect(await whole(content)).toBe(false)
        const collapsed = (await content.boundingBox())!.height
        expect(Math.abs(collapsed - device.lines * line)).toBeLessThan(2)
        await expect(page.getByText('Rerunning them now.')).toBeInViewport()
        if (process.env.LONG_MESSAGE_SCREENSHOT) {
          await page.screenshot({ path: `${process.env.LONG_MESSAGE_SCREENSHOT}-${device.name}-collapsed.png` })
        }

        await showAll.click()
        await expect(sent.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true')
        expect(await whole(content)).toBe(true)
        expect((await content.boundingBox())!.height).toBeGreaterThan(collapsed)
        // The agent keeps working; the reader stays where they were reading.
        const top = (await sent.boundingBox())!.y
        fixture.emit({ type: 'session.upserted', session: live({ status: 'running', activity: 'Rerunning the checks' }) })
        await expect(page.locator('.activity-line')).toContainText('Rerunning the checks')
        expect(Math.abs((await sent.boundingBox())!.y - top)).toBeLessThan(2)
        await expect(page.getByRole('button', { name: 'Scroll to latest' })).toBeVisible()
        if (process.env.LONG_MESSAGE_SCREENSHOT) {
          await page.screenshot({ path: `${process.env.LONG_MESSAGE_SCREENSHOT}-${device.name}-expanded.png` })
        }
      } finally {
        fixture.assertHealthy()
      }
    })

    test('Show all keeps the first line where it was, however it is pressed', async ({ page }, testInfo) => {
      const { fixture, sent, content } = await open(page, testInfo.project.use.baseURL!, device.message, 24)
      /** The first line's offset from the top of the visible timeline. */
      const firstLine = () => content.evaluate((element) =>
        element.getBoundingClientRect().top - element.closest('.timeline')!.getBoundingClientRect().top)
      const scrollFirstLineTo = (offset: number) => content.evaluate((element, wanted) => {
        const timeline = element.closest('.timeline')!
        timeline.scrollTop += element.getBoundingClientRect().top - timeline.getBoundingClientRect().top - wanted
      }, offset)
      try {
        // Mid-conversation, the whole message in view: a tap or a click.
        await scrollFirstLineTo(160)
        const before = await firstLine()
        await sent.getByRole('button', { name: 'Show all' }).click()
        await expect(sent.getByRole('button', { name: 'Show less' })).toBeAttached()
        expect(Math.abs((await firstLine()) - before)).toBeLessThan(1)
        await sent.getByRole('button', { name: 'Show less' }).click()

        // Its start above the view and the toggle focused: the keyboard.
        await scrollFirstLineTo(-60)
        const above = await firstLine()
        const showAll = sent.getByRole('button', { name: 'Show all' })
        await showAll.focus()
        await page.keyboard.press('Enter')
        await expect(sent.getByRole('button', { name: 'Show less' })).toBeFocused()
        expect(Math.abs((await firstLine()) - above)).toBeLessThan(1)
      } finally {
        fixture.assertHealthy()
      }
    })

    test('Show less brings the collapsed message back into view', async ({ page }, testInfo) => {
      const { fixture, sent, content } = await open(page, testInfo.project.use.baseURL!, device.message, 24)
      try {
        await sent.getByRole('button', { name: 'Show all' }).click()
        const showLess = sent.getByRole('button', { name: 'Show less' })
        // Read to the end of the message, so its start is above the view.
        await showLess.evaluate((button) => {
          const timeline = button.closest('.timeline')!
          timeline.scrollTop += button.getBoundingClientRect().top - timeline.getBoundingClientRect().top - 24
        })
        await expect(sent.locator('.message__metadata')).not.toBeInViewport()
        await showLess.click()
        await expect(sent.getByRole('button', { name: 'Show all' })).toBeInViewport()
        expect(Math.abs((await content.boundingBox())!.height - device.lines * line)).toBeLessThan(2)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}

test('a very long message you send shows six lines on a phone too', async ({ page }, testInfo) => {
  await page.setViewportSize(phone)
  const { fixture, sent, content } = await open(page, testInfo.project.use.baseURL!, veryLong, 0)
  try {
    await expect(sent.getByRole('button', { name: 'Show all' })).toBeVisible()
    expect(Math.abs((await content.boundingBox())!.height - 6 * line)).toBeLessThan(2)
  } finally {
    fixture.assertHealthy()
  }
})

test.describe('with a mouse', () => {
  test.use({ hasTouch: false, viewport: desktop })

  test('a message within the desktop limit stays whole on a desktop, but collapses at a phone width', async ({ page }, testInfo) => {
    const { fixture, sent, content } = await open(page, testInfo.project.use.baseURL!, long, 0)
    try {
      await expect(sent.getByRole('button', { name: 'Show all' })).toBeHidden()
      expect(await whole(content)).toBe(true)
      expect((await content.boundingBox())!.height).toBeGreaterThan(12 * line)

      // A window as narrow as a phone follows the phone rule, mouse or not.
      await page.setViewportSize(phone)
      await expect(sent.getByRole('button', { name: 'Show all' })).toBeVisible()
      expect(Math.abs((await content.boundingBox())!.height - 6 * line)).toBeLessThan(2)
    } finally {
      fixture.assertHealthy()
    }
  })

  test('Oracle folds a message you send there by the same limits', async ({ page }, testInfo) => {
    const createdAt = new Date(Date.parse(FIXTURE_NOW) - 5 * 60_000).toISOString()
    const fixture = await setupWorkspaceFixture(page, {
      baseUrl: testInfo.project.use.baseURL!,
      knowledgeMode: 'hidden',
      manager: {
        available: true,
        status: 'idle',
        messages: [
          { id: 'long', role: 'user', content: long, createdAt, state: 'done' },
          { id: 'very-long', role: 'user', content: veryLong, createdAt, state: 'done' },
        ],
        queued: 0,
        managedSessions: [],
      },
    })
    /** Oracle's own line: 14px text at a 1.5 line height, inside 8px of padding above and below. */
    const folded = (lines: number) => lines * 14 * 1.5 + 16
    try {
      await page.goto('/?oracle=open')
      const sent = page.locator('#oracle-panel .manager-message--user')
      const [longSent, veryLongSent] = [sent.nth(0), sent.nth(1)]
      const height = async (message: Locator) =>
        (await message.locator('.manager-message__text').boundingBox())!.height
      await expect(veryLongSent.getByRole('button', { name: 'Show all' })).toBeVisible()
      await expect(longSent.getByRole('button', { name: 'Show all' })).toBeHidden()
      expect(await whole(longSent.locator('.manager-message__text'))).toBe(true)
      expect(Math.abs((await height(veryLongSent)) - folded(12))).toBeLessThan(2)
      if (process.env.LONG_MESSAGE_SCREENSHOT) {
        await page.screenshot({ path: `${process.env.LONG_MESSAGE_SCREENSHOT}-oracle-desktop.png` })
      }
      await veryLongSent.getByRole('button', { name: 'Show all' }).click()
      expect(await whole(veryLongSent.locator('.manager-message__text'))).toBe(true)
      await veryLongSent.getByRole('button', { name: 'Show less' }).click()
      await expect(veryLongSent.getByRole('button', { name: 'Show all' })).toBeVisible()

      // At a phone width both fold, to Oracle's eight lines.
      await page.setViewportSize(phone)
      await expect(longSent.getByRole('button', { name: 'Show all' })).toBeVisible()
      expect(Math.abs((await height(longSent)) - folded(8))).toBeLessThan(2)
      expect(Math.abs((await height(veryLongSent)) - folded(8))).toBeLessThan(2)
      if (process.env.LONG_MESSAGE_SCREENSHOT) {
        await page.screenshot({ path: `${process.env.LONG_MESSAGE_SCREENSHOT}-oracle-phone.png` })
      }
    } finally {
      fixture.assertHealthy()
    }
  })
})
