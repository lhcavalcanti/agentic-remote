export const appIconColors = [
  { id: 'agentic', name: 'Agentic', color: '#b8f36b' },
  { id: 'ocean', name: 'Ocean', color: '#6eb7ff' },
  { id: 'violet', name: 'Violet', color: '#ad92ff' },
  { id: 'ember', name: 'Ember', color: '#ff9c64' },
  { id: 'rose', name: 'Rose', color: '#ff83b6' },
  { id: 'teal', name: 'Teal', color: '#63d6c0' },
] as const

export type AppIconColor = (typeof appIconColors)[number]['id']

export const appIconStyles = [
  {
    id: 'relay',
    name: 'Relay',
    description: 'A command window with an uplink.',
  },
  {
    id: 'bridge',
    name: 'Bridge',
    description: 'Sessions and Knowledge connected.',
  },
  {
    id: 'orbit',
    name: 'Orbit',
    description: 'One supervised agent across computers.',
  },
  {
    id: 'beacon',
    name: 'Beacon',
    description: 'A live remote-work signal.',
  },
  {
    id: 'atlas',
    name: 'Atlas',
    description: 'Code and reference material together.',
  },
] as const

export type AppIconStyle = (typeof appIconStyles)[number]['id']

export type AppIconPreference = {
  style: AppIconStyle
  color: AppIconColor
}

export const defaultAppIcon: AppIconPreference = {
  style: 'relay',
  color: 'agentic',
}

function iconArt(style: AppIconStyle): string {
  switch (style) {
    case 'bridge':
      return `
        <rect x="70" y="116" width="158" height="280" rx="52" fill="currentColor"/>
        <rect x="284" y="116" width="158" height="280" rx="52" fill="currentColor"/>
        <rect x="106" y="158" width="86" height="196" rx="28" fill="#171815"/>
        <rect x="320" y="158" width="86" height="196" rx="28" fill="#171815"/>
        <path d="M228 256h56" stroke="currentColor" stroke-width="24" stroke-linecap="round"/>
        <circle cx="256" cy="256" r="18" fill="currentColor"/>
        <path d="M128 220h42M128 256h28" stroke="currentColor" stroke-width="16" stroke-linecap="round"/>
        <path d="M342 216h42M342 252h42M342 288h30" stroke="currentColor" stroke-width="14" stroke-linecap="round"/>
      `
    case 'orbit':
      return `
        <ellipse cx="256" cy="256" rx="184" ry="112" fill="none" stroke="currentColor" stroke-width="20" transform="rotate(-24 256 256)"/>
        <circle cx="256" cy="256" r="116" fill="currentColor"/>
        <circle cx="256" cy="256" r="76" fill="#171815"/>
        <path d="M220 220l40 36-40 36M276 292h38" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="104" cy="338" r="28" fill="currentColor"/>
        <circle cx="408" cy="174" r="28" fill="currentColor"/>
      `
    case 'beacon':
      return `
        <path d="M126 206c24-54 72-88 130-88s106 34 130 88M84 168C120 84 180 54 256 54s136 30 172 114" fill="none" stroke="currentColor" stroke-width="20" stroke-linecap="round"/>
        <rect x="140" y="178" width="232" height="232" rx="70" fill="currentColor"/>
        <rect x="182" y="220" width="148" height="148" rx="40" fill="#171815"/>
        <path d="M214 264l38 30-38 30M270 324h34" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="256" cy="134" r="20" fill="currentColor"/>
      `
    case 'atlas':
      return `
        <path d="M62 146c58-22 116-12 174 30v246c-58-42-116-52-174-30z" fill="currentColor"/>
        <path d="M450 146c-58-22-116-12-174 30v246c58-42 116-52 174-30z" fill="currentColor"/>
        <path d="M104 184c38-8 72 0 102 22v154c-30-18-64-24-102-16zM408 184c-38-8-72 0-102 22v154c30-18 64-24 102-16z" fill="#171815"/>
        <path d="M136 248h38M136 286h52" stroke="currentColor" stroke-width="14" stroke-linecap="round"/>
        <path d="M330 244l34 28-34 28M352 320h30" fill="none" stroke="currentColor" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M256 170v246" stroke="currentColor" stroke-width="18" stroke-linecap="round"/>
      `
    case 'relay':
      return `
        <rect x="84" y="104" width="344" height="316" rx="92" fill="currentColor"/>
        <rect x="128" y="150" width="256" height="224" rx="54" fill="#171815"/>
        <path d="M178 220l52 38-52 38M254 304h82" fill="none" stroke="currentColor" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="256" cy="82" r="22" fill="currentColor"/>
        <path d="M256 104v46" stroke="currentColor" stroke-width="20" stroke-linecap="round"/>
      `
  }
}

export function appIconPreferenceFrom(value: unknown): AppIconPreference {
  if (!value || typeof value !== 'object') return defaultAppIcon
  const candidate = value as Partial<AppIconPreference>
  const style = appIconStyles.find((entry) => entry.id === candidate.style)?.id
  const color = appIconColors.find((entry) => entry.id === candidate.color)?.id
  return {
    style: style ?? defaultAppIcon.style,
    color: color ?? defaultAppIcon.color,
  }
}

export function appIconSvg(preference: AppIconPreference): string {
  const normalized = appIconPreferenceFrom(preference)
  const color = appIconColors.find((entry) => entry.id === normalized.color)!
    .color
  const art = iconArt(normalized.style).trim()
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" color="${color}">
    <rect width="512" height="512" rx="112" fill="#111210"/>
    <rect x="22" y="22" width="468" height="468" rx="94" fill="#171815"/>
    ${art}
  </svg>`
}

export function appIconUrl(preference: AppIconPreference): string {
  return `data:image/svg+xml,${encodeURIComponent(appIconSvg(preference))}`
}

export function appleTouchIconPath(
  preference: AppIconPreference,
): string {
  const normalized = appIconPreferenceFrom(preference)
  return `/icons/app/app-${normalized.style}-${normalized.color}-180.png`
}
