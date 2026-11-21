/**
 * Puts text on the clipboard. The Clipboard API exists only in a secure
 * context, which a hub reached over plain HTTP on a LAN is not, so this falls
 * back to the browser's copy command on a selection of the text.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Refused, for instance without permission; the copy command may still work.
  }
  return copyWithSelection(text)
}

// A selected range rather than a field: it raises no keyboard, works on iOS,
// and leaves focus where the reader is. Their own selection is put back.
function copyWithSelection(text: string): boolean {
  const selection = document.getSelection()
  if (!selection || typeof document.execCommand !== 'function') return false
  const previous = Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index))
  const holder = document.createElement('span')
  holder.textContent = text
  holder.setAttribute('aria-hidden', 'true')
  Object.assign(holder.style, {
    position: 'fixed', top: '0', left: '0', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'pre', userSelect: 'text',
  })
  document.body.append(holder)
  try {
    const range = document.createRange()
    range.selectNodeContents(holder)
    selection.removeAllRanges()
    selection.addRange(range)
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    selection.removeAllRanges()
    for (const range of previous) selection.addRange(range)
    holder.remove()
  }
}
