import { expect, test, type Page } from '@playwright/test'
import { setupWorkspaceFixture } from './workspace-fixtures'

// Cloudflare Access's answer to an app request once its session has lapsed.
async function expireSignIn(page: Page) {
  await page.route('**/api/**', (route) => route.fulfill({
    status: 401,
    headers: {
      'www-authenticate': 'Cloudflare-Access resource_metadata="https://hub.example/.well-known/cloudflare-access-protected-resource/api"',
    },
  }))
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
}

// Controls a tap on their middle would reach, were the notice not on top of it.
function controlsUnderNotice(page: Page) {
  return page.evaluate(() => {
    const notice = document.querySelector<HTMLElement>('.sign-in-notice')
    if (!notice) return ['(no notice)']
    const box = notice.getBoundingClientRect()
    const centers = [...document.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea')]
      .filter((control) => !notice.contains(control))
      .map((control) => {
        const rect = control.getBoundingClientRect()
        return { control, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, sized: rect.width > 0 && rect.height > 0 }
      })
      .filter(({ x, y, sized }) => sized && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom)
    notice.style.visibility = 'hidden'
    try {
      return centers
        .filter(({ control, x, y }) => {
          const hit = document.elementFromPoint(x, y)
          return hit !== null && (hit === control || control.contains(hit))
        })
        .map(({ control }) => control.getAttribute('aria-label') || control.textContent?.trim() || control.tagName)
    } finally {
      notice.style.visibility = ''
    }
  })
}

type Layout = {
  name: string
  width: number
  height: number
  knowledge: 'hidden' | 'docked' | 'expanded'
  open?: (page: Page) => Promise<void>
  // What else must hold once signed out.
  check?: (page: Page) => Promise<void>
}

const phone = { width: 390, height: 844 }
const desktop = { width: 1024, height: 768 }
const layouts: Layout[] = [
  { name: 'over a phone session list', ...phone, knowledge: 'hidden', open: async (page) => {
    await page.getByRole('button', { name: 'Open sessions' }).click()
    await expect(page.getByRole('navigation', { name: 'Sessions' })).toBeInViewport()
  } },
  { name: 'over a phone conversation', ...phone, knowledge: 'hidden' },
  { name: 'over a phone conversation while typing', ...phone, knowledge: 'hidden', open: async (page) => {
    await page.getByLabel('Message', { exact: true }).focus()
    // The on-screen keyboard shrinks the visual viewport.
    await page.evaluate(() => {
      const viewport = window.visualViewport!
      Object.defineProperty(viewport, 'height', { configurable: true, get: () => window.innerHeight - 340 })
      viewport.dispatchEvent(new Event('resize'))
    })
    await expect(page.locator('.app-shell')).toHaveClass(/app-shell--keyboard-open/)
  } },
  { name: 'over docked Knowledge on a phone', ...phone, knowledge: 'docked' },
  { name: 'over Oracle on a phone', ...phone, knowledge: 'hidden', open: openOracle, check: oracleInsideWindow },
  { name: 'over Oracle with attachments on a phone', ...phone, knowledge: 'hidden', open: async (page) => {
    await openOracle(page)
    await attachThreeFiles(page)
  }, check: async (page) => {
    await oracleInsideWindow(page)
    await expect(page.locator('#oracle-panel').getByRole('button', { name: 'Send message', exact: true }))
      .toBeInViewport({ ratio: 1 })
  } },
  { name: 'over a desktop conversation', ...desktop, knowledge: 'hidden' },
  { name: 'over expanded Knowledge', width: 1280, height: 800, knowledge: 'expanded' },
  { name: 'over Oracle on a desktop', ...desktop, knowledge: 'hidden', open: openOracle, check: oracleInsideWindow },
  { name: 'over a desktop dialog', ...desktop, knowledge: 'hidden', open: async (page) => {
    await page.getByRole('button', { name: 'App settings' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  }, check: async (page) => {
    // A modal keeps focus inside itself, so it carries the notice.
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Sign in again' })).toBeVisible()
  } },
]

// Starting below the notice must not push Oracle's composer out of the window.
async function oracleInsideWindow(page: Page) {
  const panel = await page.locator('#oracle-panel').boundingBox()
  expect(panel).not.toBeNull()
  expect(panel!.y + panel!.height).toBeLessThanOrEqual(page.viewportSize()!.height)
  await expect(page.locator('#oracle-panel .manager-composer')).toBeInViewport({ ratio: 1 })
}

// Three chips make the composer tall enough that the band must come out of
// what scrolls, not out of the composer.
async function attachThreeFiles(page: Page) {
  let next = 0
  await page.route('**/api/manager/files', (route) => {
    next += 1
    return route.fulfill({ status: 201, json: { file: {
      id: `00000000-0000-4000-8000-00000000000${next}`, name: `notes-${next}.md`, size: 12, mimeType: 'text/markdown',
    } } })
  })
  await page.locator('#oracle-panel').getByLabel('Oracle attachments', { exact: true }).setInputFiles(
    [1, 2, 3].map((index) => ({ name: `notes-${index}.md`, mimeType: 'text/markdown', buffer: Buffer.from(`# Notes ${index}`) })),
  )
  await expect(page.locator('#oracle-panel').getByRole('list', { name: 'Oracle attachments to send' })
    .getByText(/Uploaded/)).toHaveCount(3)
}

async function openOracle(page: Page) {
  await page.locator('main').getByRole('button', { name: /^Oracle/ }).first().click()
  await expect(page.locator('#oracle-panel')).toBeVisible()
}

for (const layout of layouts) {
  test(`shows one reachable sign-in notice ${layout.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: layout.width, height: layout.height })
    const fixture = await setupWorkspaceFixture(page, {
      baseUrl: testInfo.project.use.baseURL!,
      knowledgeMode: layout.knowledge,
      manager: { available: true, status: 'idle', messages: [], queued: 0, managedSessions: [] },
    })
    try {
      await page.goto('/')
      await layout.open?.(page)
      await expireSignIn(page)

      const signIn = page.getByRole('link', { name: 'Sign in again' })
      await expect(signIn).toHaveCount(1)
      await expect(signIn).toBeInViewport({ ratio: 1 })
      await expect.poll(() => controlsUnderNotice(page)).toEqual([])
      await layout.check?.(page)
    } finally {
      fixture.assertHealthy()
    }
  })
}
