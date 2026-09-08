type ScreenshotPair = { previous: string; current: string }

// Playwright serializes this function; avoid named closures introduced by TSX.
export async function screenshotsAreClose({ previous, current }: ScreenshotPair): Promise<boolean> {
  const before = await createImageBitmap(new Blob([
    Uint8Array.from(atob(previous), (character) => character.charCodeAt(0)),
  ], { type: 'image/png' }))
  let after: ImageBitmap | undefined
  try {
    after = await createImageBitmap(new Blob([
      Uint8Array.from(atob(current), (character) => character.charCodeAt(0)),
    ], { type: 'image/png' }))
    if (before.width !== after.width || before.height !== after.height) {
      return false
    }
    const canvas = new OffscreenCanvas(before.width, before.height)
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Cannot compare screenshot pixels')
    context.drawImage(before, 0, 0)
    const first = context.getImageData(0, 0, before.width, before.height).data
    context.clearRect(0, 0, before.width, before.height)
    context.drawImage(after, 0, 0)
    const second = context.getImageData(0, 0, after.width, after.height).data
    let changed = 0
    for (let index = 0; index < first.length; index += 4) {
      if (
        first[index] !== second[index] ||
        first[index + 1] !== second[index + 1] ||
        first[index + 2] !== second[index + 2] ||
        first[index + 3] !== second[index + 3]
      ) {
        changed += 1
        // A few rasterization pixels may vary; moving text or controls may not.
        if (changed > 12) return false
      }
    }
    return true
  } finally {
    before.close()
    after?.close()
  }
}
