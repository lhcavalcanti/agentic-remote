/** Whether Return should insert a newline rather than send, as on a phone. */
export function phoneEnterCreatesNewline(): boolean {
  return (
    window.matchMedia?.('(pointer: coarse)').matches ||
    window.innerWidth <= 960
  )
}
