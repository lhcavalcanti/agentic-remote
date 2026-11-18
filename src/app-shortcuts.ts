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

export function oracleDockShortcutBinding(
  platform = typeof navigator === 'undefined' ? '' : navigator.platform,
): AppShortcutBinding {
  const apple = /Mac|iPhone|iPad|iPod/i.test(platform)
  return {
    code: 'KeyP',
    alt: true,
    shift: false,
    ctrl: !apple,
    meta: apple,
  }
}

/** A key and the modifiers held with it. */
export type ShortcutBinding = {
  /** The physical key, so a macOS Option that rewrites the character still
      resolves to the same place on the keyboard. */
  code: string
  alt: boolean
  shift: boolean
  ctrl: boolean
  meta: boolean
}

export type ShortcutId =
  | 'nextSession'
  | 'previousSession'
  | 'toggleOracle'
  | 'toggleOracleDock'
  | 'toggleKnowledge'
  | 'expandKnowledge'
  | 'backgroundTasks'

export type ShortcutDefinition = {
  id: ShortcutId
  label: string
  binding: ShortcutBinding
}

export function binding(
  code: string,
  modifiers: Partial<Omit<ShortcutBinding, 'code'>> = {},
): ShortcutBinding {
  return {
    code,
    alt: modifiers.alt ?? false,
    shift: modifiers.shift ?? false,
    ctrl: modifiers.ctrl ?? false,
    meta: modifiers.meta ?? false,
  }
}

// What each shortcut is, in one place. The handler reads its keys from here
// and the settings list is drawn from the same rows, so a shortcut cannot be
// listed as one thing and answer to another.
export const shortcutDefaults: ShortcutDefinition[] = [
  { id: 'nextSession', label: 'Next session', binding: binding('ArrowDown', { alt: true }) },
  {
    id: 'previousSession',
    label: 'Previous session',
    binding: binding('ArrowUp', { alt: true }),
  },
  {
    id: 'toggleOracle',
    label: 'Open, close, or focus Oracle',
    binding: oracleShortcutBinding(),
  },
  {
    id: 'toggleOracleDock',
    label: 'Dock or undock Oracle',
    binding: oracleDockShortcutBinding(),
  },
  {
    id: 'toggleKnowledge',
    label: 'Open or close knowledge',
    binding: binding('KeyK', { alt: true }),
  },
  {
    id: 'expandKnowledge',
    label: 'Expand or minimize knowledge',
    binding: binding('KeyK', { alt: true, shift: true }),
  },
  {
    id: 'backgroundTasks',
    label: 'View background tasks',
    binding: binding('KeyT', { alt: true }),
  },
]

export function sameBinding(left: ShortcutBinding, right: ShortcutBinding): boolean {
  return (
    left.code === right.code &&
    left.alt === right.alt &&
    left.shift === right.shift &&
    left.ctrl === right.ctrl &&
    left.meta === right.meta
  )
}

/** What to call the key on its own, as it is printed on the keyboard. */
function keyLabel(code: string): string {
  if (code.startsWith('Key')) {
    return code.slice(3)
  }
  if (code.startsWith('Digit')) {
    return code.slice(5)
  }
  const named: Record<string, string> = {
    ArrowUp: '\u2191',
    ArrowDown: '\u2193',
    ArrowLeft: '\u2190',
    ArrowRight: '\u2192',
    Enter: 'Enter',
    Space: 'Space',
    Backquote: '`',
    Slash: '/',
    Period: '.',
    Comma: ',',
    Semicolon: ';',
    BracketLeft: '[',
    BracketRight: ']',
    Backslash: '\\',
    Minus: '-',
    Equal: '=',
  }
  return named[code] || code
}

export function bindingLabel(value: ShortcutBinding): string {
  const parts: string[] = []
  if (value.meta) {
    parts.push('Cmd')
  }
  if (value.ctrl) {
    parts.push('Ctrl')
  }
  if (value.alt) {
    parts.push('Alt')
  }
  if (value.shift) {
    parts.push('Shift')
  }
  parts.push(keyLabel(value.code))
  return parts.join(' + ')
}

/** The keys that are only ever held down beside another one. */
/** Whether the editor could ever have recorded this key. */
// Escape leaves the editor rather than being captured, and Tab moves on, so
// neither can be reached however they are held. Stored, they were shortcuts
// that showed in the list and could never be pressed.
const capturableCodes = new Set([
  'Space',
  'Enter',
  'Backspace',
  'Delete',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Insert',
  'Backquote',
  'Minus',
  'Equal',
  'BracketLeft',
  'BracketRight',
  'Backslash',
  'Semicolon',
  'Quote',
  'Comma',
  'Period',
  'Slash',
])

export function capturableCode(code: string): boolean {
  if (isModifierCode(code) || code === 'Escape' || code === 'Tab') {
    return false
  }
  // A shape a real `KeyboardEvent.code` actually takes. Any nonempty string
  // was accepted before, so `NotARealKey` came back from storage as a shortcut
  // that showed in the list and no key on the keyboard could ever produce.
  return (
    /^Key[A-Z]$/.test(code) ||
    /^Digit[0-9]$/.test(code) ||
    /^Numpad[0-9]$/.test(code) ||
    /^F([1-9]|1[0-2])$/.test(code) ||
    /^Arrow(Up|Down|Left|Right)$/.test(code) ||
    capturableCodes.has(code)
  )
}

export function isModifierCode(code: string): boolean {
  return (
    code.startsWith('Alt') ||
    code.startsWith('Shift') ||
    code.startsWith('Control') ||
    code.startsWith('Meta')
  )
}

export function shortcutAcceptsBinding(id: ShortcutId, value: ShortcutBinding): boolean {
  return (
    (id !== 'toggleOracle' && id !== 'toggleOracleDock') ||
    value.code !== 'Enter'
  )
}
