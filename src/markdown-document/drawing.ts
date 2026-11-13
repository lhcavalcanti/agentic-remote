/**
 * Marks a component that draws whatever children it is given, so the element
 * it draws may be filled a part at a time; any other component's element is
 * drawn whole. While a reader is still adding to it, the component is passed
 * `drawing: true`, as it may not hold all of its content yet.
 */
export function drawnInParts<T extends object>(component: T): T {
  return Object.assign(component, { drawnInParts: true })
}

export function isDrawnInParts(component: unknown): boolean {
  return typeof component === 'function' && (component as { drawnInParts?: unknown }).drawnInParts === true
}
