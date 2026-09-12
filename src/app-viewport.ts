export function appViewportGeometry({
  innerHeight,
  visualHeight,
  visualOffsetTop,
  standalone,
  keyboardOpen,
}: {
  innerHeight: number
  visualHeight?: number
  visualOffsetTop?: number
  standalone: boolean
  keyboardOpen: boolean
}): { height: number; offsetTop: number } {
  if (standalone && !keyboardOpen) {
    return { height: innerHeight, offsetTop: 0 }
  }
  return {
    height: visualHeight || innerHeight,
    offsetTop: visualOffsetTop || 0,
  }
}

export function appKeyboardOpen({
  editorFocused,
  baselineHeight,
  viewportHeight,
  viewportOffsetTop,
}: {
  editorFocused: boolean
  baselineHeight: number
  viewportHeight: number
  viewportOffsetTop: number
}): boolean {
  return (
    editorFocused &&
    (
      baselineHeight - viewportHeight > 80 ||
      viewportOffsetTop > 20
    )
  )
}
