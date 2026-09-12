import {
  appIconStorageKey,
  appIconPreferenceFrom,
  appIconUrl,
  appleTouchIconPath,
  defaultAppIcon,
  type AppIconPreference,
} from './app-icon-design.js'

export {
  appIconColors,
  appIconStorageKey,
  appIconPreferenceFrom,
  appIconStyles,
  appIconSvg,
  appIconUrl,
  appleTouchIconPath,
  defaultAppIcon,
  type AppIconColor,
  type AppIconPreference,
  type AppIconStyle,
} from './app-icon-design.js'

export function readAppIconPreference(): AppIconPreference {
  try {
    const stored = localStorage.getItem(appIconStorageKey)
    return stored
      ? appIconPreferenceFrom(JSON.parse(stored))
      : defaultAppIcon
  } catch {
    return defaultAppIcon
  }
}

export function saveAppIconPreference(preference: AppIconPreference): void {
  localStorage.setItem(
    appIconStorageKey,
    JSON.stringify(appIconPreferenceFrom(preference)),
  )
}

export function applyAppIcon(preference: AppIconPreference): () => void {
  const faviconExisting =
    document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  const touchExisting =
    document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
  const favicon = faviconExisting ?? document.createElement('link')
  const touch = touchExisting ?? document.createElement('link')
  const previous = {
    faviconHref: favicon.getAttribute('href'),
    faviconType: favicon.getAttribute('type'),
    touchHref: touch.getAttribute('href'),
    touchSizes: touch.getAttribute('sizes'),
    style: document.documentElement.dataset.appIconStyle,
    color: document.documentElement.dataset.appIconColor,
  }
  const normalized = appIconPreferenceFrom(preference)
  favicon.rel = 'icon'
  favicon.type = 'image/svg+xml'
  favicon.href = appIconUrl(normalized)
  touch.rel = 'apple-touch-icon'
  touch.setAttribute('sizes', '180x180')
  touch.href = appleTouchIconPath(normalized)
  document.documentElement.dataset.appIconStyle = normalized.style
  document.documentElement.dataset.appIconColor = normalized.color
  if (!faviconExisting) document.head.append(favicon)
  if (!touchExisting) document.head.append(touch)

  return () => {
    if (!faviconExisting) favicon.remove()
    else {
      if (previous.faviconHref === null) favicon.removeAttribute('href')
      else favicon.setAttribute('href', previous.faviconHref)
      if (previous.faviconType === null) favicon.removeAttribute('type')
      else favicon.setAttribute('type', previous.faviconType)
    }
    if (!touchExisting) touch.remove()
    else {
      if (previous.touchHref === null) touch.removeAttribute('href')
      else touch.setAttribute('href', previous.touchHref)
      if (previous.touchSizes === null) touch.removeAttribute('sizes')
      else touch.setAttribute('sizes', previous.touchSizes)
    }
    if (previous.style === undefined) {
      delete document.documentElement.dataset.appIconStyle
    } else {
      document.documentElement.dataset.appIconStyle = previous.style
    }
    if (previous.color === undefined) {
      delete document.documentElement.dataset.appIconColor
    } else {
      document.documentElement.dataset.appIconColor = previous.color
    }
  }
}
