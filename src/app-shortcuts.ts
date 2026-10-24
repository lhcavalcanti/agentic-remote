export interface AppShortcutBinding {
  code: string
  alt: boolean
  shift: boolean
  ctrl: boolean
  meta: boolean
}

export function oracleShortcutBinding(
  platform = typeof navigator === 'undefined' ? '' : navigator.platform,
): AppShortcutBinding {
  const apple = /Mac|iPhone|iPad|iPod/i.test(platform)
  return {
    code: 'KeyO',
    alt: true,
    shift: false,
    ctrl: !apple,
    meta: apple,
  }
}
