// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CollapsedCategoriesSetting } from './CollapsedCategoriesSetting'
import { SettingsNavigation } from './SettingsNavigation'
import { navigableSettingsSections, type SettingsSectionProps } from './sections'

afterEach(cleanup)

describe('Collapsed categories show', () => {
  it('offers the three choices with the hub\'s checked, and sends the one picked', () => {
    const onChange = vi.fn()
    render(<CollapsedCategoriesSetting onChange={onChange} value="attention-unread" />)

    // Named by the heading it shows under, which says what is chosen.
    expect(screen.getByRole('heading', { name: 'Collapsed categories show' })).toBeVisible()
    const choices = screen.getByRole('group', { name: 'Collapsed categories show' })
    const radios = within(choices).getAllByRole('radio')
    expect(radios.map((radio) => radio.getAttribute('aria-label'))).toEqual([
      'Sessions that need you or are unread', 'Only sessions that need you', 'Counts only',
    ])
    expect(within(choices).getByRole('radio', { name: 'Sessions that need you or are unread' })).toBeChecked()
    expect(within(choices).getByRole('radio', { name: 'Counts only' }))
      .toHaveAccessibleDescription(/not even the open session/)
    for (const radio of radios) expect(radio).toBeEnabled()

    fireEvent.click(within(choices).getByRole('radio', { name: 'Counts only' }))
    expect(onChange).toHaveBeenCalledWith('none')
    fireEvent.click(within(choices).getByRole('radio', { name: 'Only sessions that need you' }))
    expect(onChange).toHaveBeenLastCalledWith('attention')
  })

  it('shows the choice disabled, saying why, while the hub cannot keep categories', () => {
    render(<CollapsedCategoriesSetting
      onChange={vi.fn()}
      unavailable="Session categories were saved by a newer release"
      value="none"
    />)

    const choices = screen.getByRole('group', { name: 'Collapsed categories show' })
    expect(choices).toBeDisabled()
    expect(choices).toHaveAccessibleDescription('Session categories were saved by a newer release')
    expect(screen.getByText('Session categories were saved by a newer release')).toBeVisible()
    expect(within(choices).getByRole('radio', { name: 'Counts only' })).toBeChecked()
    for (const radio of within(choices).getAllByRole('radio')) expect(radio).toBeDisabled()
  })

  it('is found in Interface by searching for it', () => {
    const sections = navigableSettingsSections.filter((section) => ['settings-models', 'settings-interface'].includes(section.id))
      .map((section) => section.id === 'settings-interface'
        ? { ...section, render: () => <CollapsedCategoriesSetting onChange={vi.fn()} value="attention" /> }
        : { ...section, render: () => <p>Models</p> })
    render(<SettingsNavigation sections={sections} sectionProps={{ shortcuts: [] } as unknown as SettingsSectionProps} />)

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search settings' }), { target: { value: 'counts only' } })
    expect(screen.queryByRole('button', { name: /^Models/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /^Interface/ }))
    expect(screen.getByRole('radio', { name: 'Only sessions that need you' })).toBeChecked()
  })
})
