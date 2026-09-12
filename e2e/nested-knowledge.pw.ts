import { expect, test } from '@playwright/test'
import path from 'node:path'
import {
  createWorkspaceFixtureState,
  setupWorkspaceFixture,
} from './workspace-fixtures'

test('chooses a nested Knowledge folder on desktop and phone', async ({ page }, testInfo) => {
  const state = createWorkspaceFixtureState()
  await setupWorkspaceFixture(page, {
    baseUrl: testInfo.project.use.baseURL!,
    state,
    selectedSessionId: state.sessions[0].id,
    knowledgeMode: 'docked',
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Choose Knowledge root' }).click()
  const chooser = page.getByRole('dialog', { name: 'Choose a session root' })
  await expect(chooser).toBeVisible()
  await chooser.getByRole('button', { name: 'Browse Field notes' }).click()
  await chooser.getByRole('treeitem', { name: 'handbook' }).click()
  await expect(chooser.getByRole('button', { name: 'Use for this session' })).toBeVisible()
  await expect(chooser.getByRole('button', { name: 'Save this root folder' })).toBeVisible()

  if (process.env.AGENTIC_REMOTE_CAPTURE_ISSUE_263) {
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(chooser).toBeVisible()
    await page.screenshot({
      path: path.resolve('issue-263-nested-knowledge.png'),
      animations: 'disabled',
      caret: 'hide',
    })
  }
})
