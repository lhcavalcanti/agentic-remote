/**
 * Whether a failed tmux command means there was no server to ask.
 *
 * Only tmux's own "there is nothing here" diagnostics count. Treating every
 * non-zero exit as absence also swallows a socket that could not be reached or
 * read, and a caller that reads that as "nothing is running" reports success
 * without having looked: discovery drops every terminal-backed session, and
 * stopping one reports success without having killed anything, while the
 * process it was meant to end carries on.
 *
 * tmux uses "error connecting to" both for a socket that is not there and for
 * one it is not allowed to open, and only the first means absence.
 */
export function noTmuxServer(error: unknown): boolean {
  const failure = error as { stderr?: unknown }
  return (
    typeof failure.stderr === 'string' &&
    (/no server running/i.test(failure.stderr) ||
      /error connecting to .*\(no such file or directory\)/i.test(
        failure.stderr,
      ))
  )
}

/**
 * Whether tmux itself is missing, which is absence rather than failure: a
 * computer without tmux has no panes and no sessions to report.
 */
export function tmuxNotInstalled(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT'
}
