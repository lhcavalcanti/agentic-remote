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
}

const phone = { width: 390, height: 844 }
const desktop = { width: 1024, height: 768 }
const layouts: Layout[] = [
  { name: 'over a phone session list', ...phone, knowledge: 'hidden', open: async (page) => {
    await page.getByRole('button', { name: 'Open sessions' }).click()
    await expect(page.getByRole('navigation', { name: 'Sessions' })).toBeInViewport()
  } },
  { name: 'over a phone conversation', ...phone, knowledge: 'hidden' },
  { name: 'over docked Knowledge on a phone', ...phone, knowledge: 'docked' },
  { name: 'over Oracle on a phone', ...phone, knowledge: 'hidden', open: openOracle },
  { name: 'over a desktop conversation', ...desktop, knowledge: 'hidden' },
  { name: 'over expanded Knowledge', width: 1280, height: 800, knowledge: 'expanded' },
  { name: 'over Oracle on a desktop', ...desktop, knowledge: 'hidden', open: openOracle },
  { name: 'over a desktop dialog', ...desktop, knowledge: 'hidden', open: async (page) => {
    await page.getByRole('button', { name: 'App settings' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  } },
]

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
    } finally {
      fixture.assertHealthy()
    }
  })
}
