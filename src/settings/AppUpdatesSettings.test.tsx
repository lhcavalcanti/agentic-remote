// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { navigableSettingsSections, type SettingsSectionProps } from './sections'

vi.mock('../api', () => ({ getHubHealth: vi.fn(() => new Promise(() => undefined)) }))
afterEach(() => {
  cleanup()
  document.head.querySelectorAll('meta[name^="agentic-remote-"]').forEach((meta) => meta.remove())
})

describe('App updates settings', () => {
  it('shows the version recorded by the page that loaded the app', () => {
    for (const [name, content] of [['agentic-remote-version', '7.7.7'], ['agentic-remote-build', 'page-build']]) {
      document.head.append(Object.assign(document.createElement('meta'), { name, content }))
    }
    const app = navigableSettingsSections.find((section) => section.id === 'settings-app')!
    const props = { settingsSync: { status: 'saved', deviceCopy: true, values: {} } }
    render(<>{app.render(props as unknown as SettingsSectionProps)}</>)

    expect(screen.getByText(/^Version 7\.7\.7\. Updates are checked/)).toBeVisible()
  })
})
