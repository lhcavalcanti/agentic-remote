import { useLayoutEffect, useRef, useState } from 'react'
import type { SettingsSection, SettingsSectionProps } from './sections'
import { settingsSectionLabels } from './sections'

export function SettingsNavigation({
  sections, sectionProps, initialSection,
}: {
  sections: readonly SettingsSection[]
  sectionProps: SettingsSectionProps
  initialSection?: string
}) {
  const initial = sections.find((section) => initialSection?.startsWith(section.id))?.id
  const [selected, setSelected] = useState(initial ?? sections[0].id)
  const [page, setPage] = useState(Boolean(initial))
  const [query, setQuery] = useState('')
  const search = query.trim().toLocaleLowerCase()
  const matches = sections.filter((section) =>
    settingsSectionLabels(section, sectionProps).some((label) => label.toLocaleLowerCase().includes(search)))
  const current = matches.find((section) => section.id === selected) ?? matches[0]
  const content = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = content.current
    if (!root || !current) return
    const categoryMatch = current.title.toLocaleLowerCase().includes(search)
    for (const card of root.querySelectorAll<HTMLElement>('.app-settings-section, .settings-computer-folders')) {
      const labels = [card, ...card.querySelectorAll('h4, label, legend, button, [aria-label]')]
        .map((label) => `${label.textContent ?? ''} ${label.getAttribute('aria-label') ?? ''}`).join(' ').toLocaleLowerCase()
      card.hidden = Boolean(search && !categoryMatch && !labels.includes(search))
    }
  })

  function choose(id: string) {
    setSelected(id)
    setPage(true)
    requestAnimationFrame(() => content.current?.querySelector<HTMLElement>('h3')?.focus())
  }

  return (
    <div className={`settings-navigation${page ? ' settings-navigation--page' : ''}`}>
      <label className="settings-navigation__search field">
        <span>Search settings</span>
        <input aria-label="Search settings" className="dialog-input" onChange={(event) => {
          setQuery(event.target.value)
          setPage(false)
        }} type="search" value={query} />
      </label>
      <nav aria-label="Settings categories" className="settings-navigation__categories" onKeyDown={(event) => {
        const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
        if (!keys.includes(event.key)) return
        const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button')]
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
          : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
        event.preventDefault()
        buttons[next]?.focus()
        if (matches[next]) setSelected(matches[next].id)
      }}>
        {matches.map((section) => {
          const Icon = section.icon
          return (
            <button aria-current={current?.id === section.id ? 'page' : undefined}
              key={section.id} onClick={() => choose(section.id)} type="button">
              <Icon aria-hidden="true" size={18} />
              <span>{section.title}<small>{section.scope === 'hub' ? 'Hub · every device' : 'This device'}</small></span>
            </button>
          )
        })}
        {!matches.length ? <p role="status">No settings match.</p> : null}
      </nav>
      <div className="settings-navigation__content" ref={content}>
        <button className="secondary-button settings-navigation__back" onClick={() => setPage(false)} type="button">All settings</button>
        {current ? (
          <section aria-labelledby={`${current.id}-heading`} className="app-settings-group" id={current.id} key={current.id}>
            <h3 id={`${current.id}-heading`} tabIndex={-1}>{current.title}</h3>
            <p className="settings-navigation__scope">{current.scope === 'hub' ? 'Hub · every device' : 'This device'}</p>
            {current.render(sectionProps)}
          </section>
        ) : <p role="status">Try a category or field label.</p>}
      </div>
    </div>
  )
}
