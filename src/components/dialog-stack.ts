/**
 * The open modal frames, innermost last. A modal keeps focus inside itself,
 * so whatever must stay reachable while one is open belongs in the innermost.
 */
const frames: symbol[] = []
const listeners = new Set<() => void>()

function changed(): void {
  for (const listener of [...listeners]) listener()
}

/** Records a frame as open; the returned function records it closed. */
export function openDialogFrame(frame: symbol): () => void {
  frames.push(frame)
  changed()
  return () => {
    const index = frames.lastIndexOf(frame)
    if (index >= 0) frames.splice(index, 1)
    changed()
  }
}

export function innermostDialogFrame(): symbol | undefined {
  return frames.at(-1)
}

export function subscribeDialogFrames(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
