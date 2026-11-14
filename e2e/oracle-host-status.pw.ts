import { expect, test } from '@playwright/test'
import { assertNoHorizontalOverflow, createUIScenes, uiContextOptions, uiViewports } from './ui-scenes'
import { SELECTED_SESSION_ID } from './workspace-fixtures'

test.use(uiContextOptions)

for (const viewport of uiViewports.filter(({ name }) => name !== 'foldable')) {
  test.describe(viewport.name, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
    test('renders the fixture-backed read-only Oracle host answer', async ({ page, baseURL }) => {
      const scene = createUIScenes(baseURL, { oracleHostStatus: true }).find(({ name }) => name === 'oracle-panel')!
      const fixture = await scene.setup(page)
      try {
        const panel = page.locator('#oracle-panel')
        await expect(panel).toContainText('Why is the hub slow?')
        await expect(panel).toContainText('96% CPU and 94% memory usage')
        await expect(panel).toContainText('WSL VM, not the Windows host')
        await expect(panel).toContainText('shared Copilot runtime')
        await expect(panel).toContainText('I have not changed anything.')
        await expect(panel.getByRole('link', { name: SELECTED_SESSION_ID }))
          .toHaveAttribute('href', `/?computer=fixture-studio&session=${SELECTED_SESSION_ID}`)
        await assertNoHorizontalOverflow(page)
      } finally {
        fixture.assertHealthy()
      }
    })
  })
}
