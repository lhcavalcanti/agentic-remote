import { createInterface } from 'node:readline'
import { retireAbandonedTmuxRoot } from './tmux-test-helpers.js'

/**
 * Started by `createIsolatedTmuxRoot` with its stdin piped from the creating
 * process, which reports there the server it started. The pipe closes only
 * once teardown has released the root, or when that process has ended.
 */
const [root] = process.argv.slice(2)
let reported: string | undefined
try {
  for await (const line of createInterface({ input: process.stdin })) {
    if (line.trim()) reported = line
  }
} catch {
  // A broken pipe ends the creating process's watch the same way.
}
// The root keeps the reason for a retirement that failed.
await retireAbandonedTmuxRoot(root, reported).catch(() => {
  process.exitCode = 1
})
