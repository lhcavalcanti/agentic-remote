// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Settings } from 'lucide-react'
import { SettingsNavigation } from './SettingsNavigation'
import type { SettingsSection, SettingsSectionProps } from './sections'

afterEach(cleanup)
const sections: SettingsSection[] = [
  { id: 'models', title: 'Models', scope: 'hub', icon: Settings, searchLabels: ['Default model'], render: () => <label>Default model<input /></label> },
  { id: 'interface', title: 'Interface', scope: 'device', icon: Settings, searchLabels: ['Accent color', 'Keyboard shortcuts'], render: () => <>
    <section className="app-settings-section"><h4>Accent color</h4><label>Blue<input /></label></section>
    <section className="app-settings-section"><h4>Keyboard shortcuts</h4><label>Keys<input /></label></section>
  </> },
]
function open(initialSection?: string) {
  return render(<SettingsNavigation sections={sections} sectionProps={{} as SettingsSectionProps} initialSection={initialSection} />)
}

describe('settings categories', () => {
  it('filters categories and fields by label without changing values', () => {
    open()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'accent' } })
    expect(screen.queryByRole('button', { name: /^Models/ })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Blue')).toBeVisible()
    expect(screen.getByLabelText('Keys')).not.toBeVisible()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'not found' } })
    expect(screen.getByText('No settings match.')).toBeVisible()
  })

  it('supports arrow navigation and an initial nested section', () => {
    open('interface-shortcuts')
    expect(screen.getByRole('heading', { name: 'Interface' })).toBeInTheDocument()
    const category = screen.getByRole('button', { name: /^Interface/ })
    category.focus()
    fireEvent.keyDown(category, { key: 'ArrowUp' })
    expect(screen.getByRole('button', { name: /^Models/ })).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'Models' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'All settings' }))
    expect(document.querySelector('.settings-navigation--page')).toBeNull()
  })
})
