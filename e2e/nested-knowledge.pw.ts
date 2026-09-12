import { expect, test } from '@playwright/test'
import {
  createWorkspaceFixtureState,
  setupWorkspaceFixture,
} from './workspace-fixtures'

for (const viewport of [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'phone', width: 390, height: 667 },
]) {
  test(`chooses a nested Knowledge folder on ${viewport.name}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    })
    const state = createWorkspaceFixtureState()
    await setupWorkspaceFixture(page, {
      baseUrl: testInfo.project.use.baseURL!,
      state,
      selectedSessionId: state.sessions[0].id,
      knowledgeMode: viewport.name === 'desktop' ? 'docked' : 'hidden',
      directoryListings: {
        '/home/demo/field-notes': ['/home/demo/field-notes/handbook'],
        '/home/demo/field-notes/handbook': [],
      },
    })
    await page.goto('/')

    if (viewport.name === 'phone') {
      await page
        .getByRole('button', { name: 'Session knowledge', exact: true })
        .click()
      await page
        .getByRole('button', { name: 'Back to files', exact: true })
        .click()
    }

    await page
      .getByRole('button', { name: 'Choose Knowledge root', exact: true })
      .click()
    const chooser = page.getByRole('dialog', {
      name: 'Choose a session root',
      exact: true,
    })
    await expect(chooser).toBeVisible()
    await chooser
      .getByRole('button', { name: 'handbook', exact: true })
      .click()

    const use = chooser.getByRole('button', {
      name: 'Use for this session',
      exact: true,
    })
    const save = chooser.getByRole('button', {
      name: 'Save this root folder',
      exact: true,
    })
    await expect(use).toBeInViewport({ ratio: 1 })
    await expect(save).toBeInViewport({ ratio: 1 })
    await use.click({ trial: true })
    await save.click({ trial: true })
  })
}
