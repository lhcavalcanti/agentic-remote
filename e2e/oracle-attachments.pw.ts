import { expect, test, type Route } from '@playwright/test'
import type { SendManagerMessageInput } from '../shared/manager'
import { FIXTURE_NOW, setupWorkspaceFixture } from './workspace-fixtures'

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
]) {
  test(`attaches files explicitly in Oracle on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    const fixture = await setupWorkspaceFixture(page, {
      baseUrl: testInfo.project.use.baseURL!,
      knowledgeMode: 'hidden',
      manager: { available: true, status: 'idle', messages: [], queued: 0, managedSessions: [] },
    })
    let pending: Route | undefined
    let retry = false
    let sent: SendManagerMessageInput | undefined
    const files = [
      { id: '00000000-0000-4000-8000-000000000001', name: 'release-notes.md', size: 23, mimeType: 'text/markdown' },
      { id: '00000000-0000-4000-8000-000000000002', name: 'architecture.png', size: 16, mimeType: 'image/png' },
      { id: '00000000-0000-4000-8000-000000000003', name: 'measurements.csv', size: 12, mimeType: 'text/csv' },
    ]
    await page.route('**/api/manager/files', async (route) => {
      const body = route.request().postDataBuffer()!.toString()
      if (body.includes('architecture.png')) {
        pending = route
      } else if (body.includes('measurements.csv') && !retry) {
        retry = true
        await route.fulfill({ status: 503, json: { error: 'Connection lost. Retry the upload.' } })
      } else {
        await route.fulfill({ status: 201, json: { file: files[body.includes('release-notes.md') ? 0 : 2] } })
      }
    })
    await page.route('**/api/manager/messages', async (route) => {
      sent = route.request().postDataJSON() as SendManagerMessageInput
      await route.fulfill({ status: 202, json: { message: {
        id: 'synthetic-turn', role: 'user', content: sent.content,
        createdAt: FIXTURE_NOW, state: 'queued', attachments: files,
      } } })
    })
    try {
      await page.goto('/?oracle=open')
      const panel = page.locator('#oracle-panel')
      await panel.getByRole('textbox', { name: 'Message Oracle' }).fill('Compare the shared notes, diagram, and measurements.')
      await panel.getByLabel('Oracle attachments', { exact: true }).setInputFiles([
        { name: 'release-notes.md', mimeType: 'text/markdown', buffer: Buffer.from('# Synthetic release notes') },
        { name: 'architecture.png', mimeType: 'image/png', buffer: Buffer.from('synthetic image') },
        { name: 'measurements.csv', mimeType: 'text/csv', buffer: Buffer.from('name,value\nA,1') },
      ])
      const chips = panel.getByRole('list', { name: 'Oracle attachments to send' })
      await expect(chips.getByText('Uploaded', { exact: false })).toBeVisible()
      await expect(chips.getByText('Uploading…', { exact: false })).toBeVisible()
      await expect(chips.getByText(/Connection lost/)).toBeVisible()
      expect(sent).toBeUndefined()
      await expect(panel.getByRole('button', { name: 'Send message', exact: true })).toBeDisabled()
      expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
      await expect(panel.getByRole('textbox', { name: 'Message Oracle' })).toBeInViewport()
      if (process.env.ORACLE_ATTACHMENT_SCREENSHOT) {
        await page.screenshot({ path: `${process.env.ORACLE_ATTACHMENT_SCREENSHOT}-${viewport.name}.png` })
      }
      await pending!.fulfill({ status: 201, json: { file: files[1] } })
      pending = undefined
      await panel.getByRole('button', { name: 'Retry measurements.csv' }).click()
      await expect(chips.getByText(/Uploaded/)).toHaveCount(3)
      await panel.getByRole('button', { name: 'Send message', exact: true }).click()
      await expect(chips).toHaveCount(0)
      expect(sent).toMatchObject({
        content: 'Compare the shared notes, diagram, and measurements.',
        attachmentIds: files.map((file) => file.id),
      })
      expect(JSON.stringify(sent)).not.toContain('path')
    } finally {
      if (pending) await pending.abort().catch(() => undefined)
      fixture.assertHealthy()
    }
  })
}
