import { expect, test } from '@playwright/test'
import path from 'node:path'
import {
  createWorkspaceFixtureState,
  setupWorkspaceFixture,
} from './workspace-fixtures'

for (const viewport of [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'phone', width: 390, height: 667 },
]) {
  test(`chooses a nested Knowledge folder on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    const state = createWorkspaceFixtureState()
    await setupWorkspaceFixture(page, {
      baseUrl: testInfo.project.use.baseURL!,
      state,
      selectedSessionId: state.sessions[0].id,
      knowledgeMode: viewport.name === 'desktop' ? 'docked' : 'hidden',
    })
    await page.goto('/')
    if (viewport.name === 'phone') {
      await page.getByRole('button', { name: 'Session knowledge', exact: true }).click()
      await page.getByRole('button', { name: 'Back to files' }).click()
    }
    await page.getByRole('button', { name: 'Choose Knowledge root' }).click()
    const chooser = page.getByRole('dialog', { name: 'Choose a session root' })
    await expect(chooser).toBeVisible()
    await chooser.getByRole('button', { name: 'Browse Field notes' }).click()
    await chooser.getByRole('treeitem', { name: 'handbook' }).click()
    const use = chooser.getByRole('button', { name: 'Use for this session' })
    const save = chooser.getByRole('button', { name: 'Save this root folder' })
    await expect(use).toBeInViewport({ ratio: 1 })
    await expect(save).toBeInViewport({ ratio: 1 })
    await use.click({ trial: true })
    await save.click({ trial: true })

    if (viewport.name === 'phone' && process.env.AGENTIC_REMOTE_CAPTURE_ISSUE_263) {
      await page.screenshot({
        path: path.resolve('issue-263-nested-knowledge.png'),
        animations: 'disabled',
        caret: 'hide',
      })
    }
  })
}
