import { useId } from 'react'
import type { CollapsedCategoryShows } from '../../shared/session-categories'
import { SettingScope } from './controls'
import { collapsedCategoryOptions } from './options'

/** What a collapsed category keeps in sight, which the hub keeps with its categories for every browser. */
export function CollapsedCategoriesSetting({ value, unavailable, onChange }: {
  value: CollapsedCategoryShows
  /** Why the hub cannot keep it now: the choices stay in view, disabled, with this. */
  unavailable?: string
  onChange: (value: CollapsedCategoryShows) => void
}) {
  const id = useId()
  return (
    <section className="app-settings-section">
      <div className="app-settings-section__title">
        <h4 id={`${id}-heading`}>Collapsed categories show</h4>
        <SettingScope synced />
      </div>
      <fieldset
        aria-describedby={unavailable ? `${id}-unavailable` : undefined}
        aria-labelledby={`${id}-heading`}
        className="notification-scope-options"
        disabled={Boolean(unavailable)}
      >
        {collapsedCategoryOptions.map((option) => (
          <label className="notification-scope-option" key={option.id}>
            <input
              aria-describedby={`${id}-${option.id}`}
              aria-label={option.name}
              checked={value === option.id}
              name={`${id}-collapsed-categories`}
              onChange={() => onChange(option.id)}
              type="radio"
            />
            <span>
              <strong>{option.name}</strong>
              <small id={`${id}-${option.id}`}>{option.description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      {unavailable ? <p className="dialog-message" id={`${id}-unavailable`}>{unavailable}</p> : null}
    </section>
  )
}
