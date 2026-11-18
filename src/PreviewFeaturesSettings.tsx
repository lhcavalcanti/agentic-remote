import { useId } from 'react'
import { isPreviewAvailable, previewFeatureCatalogue, previewFeatureNames } from '../shared/feature-flags'
import { usePreviewFeatures } from './preview-features'

export function PreviewFeaturesSettings() {
  const id = useId()
  const { hubFlags, preferences, set } = usePreviewFeatures()
  return (
    <section className="app-settings-section" aria-labelledby={`${id}-heading`}>
      <div className="app-settings-section__title">
        <h4 id={`${id}-heading`}>Preview features</h4>
        <span className="settings-scope settings-scope--synced">Synced</span>
      </div>
      <p className="dialog-message">Try upcoming interface changes. All previews start turned off.</p>
      <div className="notification-scope-options">
        {previewFeatureNames.map((name) => {
          const feature = previewFeatureCatalogue[name]
          const available = isPreviewAvailable(name, hubFlags)
          return (
            <label className="notification-scope-option" key={name}>
              <input
                type="checkbox"
                aria-label={feature.label}
                aria-describedby={`${id}-${name}`}
                checked={preferences?.[name] === true}
                disabled={!available}
                onChange={(event) => set(name, event.target.checked)}
              />
              <span>
                <strong>{feature.label}</strong>
                <small id={`${id}-${name}`}>
                  {feature.description}
                  {!available ? <><br />Turned off on this hub</> : null}
                </small>
              </span>
            </label>
          )
        })}
      </div>
    </section>
  )
}
