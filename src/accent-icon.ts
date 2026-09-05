import iconSvg from '../public/icon.svg?raw'

export function accentIconUrl(color: string): string {
  const svg = iconSvg.replace(/color="[^"]*"/, `color="${color}"`)
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function applyAccentIcon(color: string): () => void {
  const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  const icon = existing ?? document.createElement('link')
  const previousHref = icon.getAttribute('href')
  const previousType = icon.getAttribute('type')
  icon.rel = 'icon'
  icon.type = 'image/svg+xml'
  // A document-local URL lets tabs keep distinct colors without rewriting
  // the shared PWA manifest or installed launcher icons.
  icon.href = accentIconUrl(color)
  if (!existing) {
    document.head.append(icon)
  }
  return () => {
    if (!existing) {
      icon.remove()
      return
    }
    if (previousHref === null) {
      icon.removeAttribute('href')
    } else {
      icon.setAttribute('href', previousHref)
    }
    if (previousType === null) {
      icon.removeAttribute('type')
    } else {
      icon.setAttribute('type', previousType)
    }
  }
}
