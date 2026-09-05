import { readdir, readFile, readlink, realpath } from 'node:fs/promises'
import path from 'node:path'

interface UnixSocket {
  inode: string
  name?: string
  listening: boolean
}

/**
 * A missing socket is not proof of a stopped server: unlink leaves tmux and
 * its panes alive. Only accept absence when Linux's socket/process evidence
 * agrees. This runs on connection failures, never on successful polling.
 */
export async function noTmuxServer(error: unknown): Promise<boolean> {
  const stderr = (error as { stderr?: unknown } | null)?.stderr
  if (typeof stderr !== 'string' || process.platform !== 'linux') {
    return false
  }
  const diagnostic = stderr.replace(/\r?\n$/, '')
  const socket = (
    /^no server running on ([^\r\n]+)$/i.exec(diagnostic) ||
    /^error connecting to ([^\r\n]+) \(no such file or directory\)$/i.exec(
      diagnostic,
    )
  )?.[1]
  if (!socket || !path.isAbsolute(socket) || socket.includes('\0')) {
    return false
  }

  try {
    // The kernel retains the bound pathname even after the file is unlinked.
    if ((await unixSockets('/proc/net/unix')).some(({ name }) => name === socket)) {
      return false
    }
    if (!(await procVisible())) {
      return false
    }
    let mountNamespace: string | undefined
    for (const pid of await readdir('/proc')) {
      if (!/^\d+$/.test(pid)) {
        continue
      }
      let status: string
      try {
        status = await readFile(`/proc/${pid}/status`, 'utf8')
      } catch (failure) {
        if (processGone(failure)) {
          continue
        }
        throw failure
      }
      const name = /^Name:[ \t]+([^\n]+)$/m.exec(status)?.[1]
      const state = /^State:[ \t]+([A-Z])\b/m.exec(status)?.[1]
      if (!name || !state) {
        return false
      }
      if (
        state === 'Z' ||
        state === 'X' ||
        !/^tmux(?:$|[-.:])/.test(name) ||
        name === 'tmux: client'
      ) {
        continue
      }
      // /proc/net is namespace-local. Inspect each live tmux process's own
      // namespace and descriptors before declaring its socket unrelated.
      mountNamespace ??= await readlink('/proc/self/ns/mnt')
      if (
        !/^mnt:\[\d+\]$/.test(mountNamespace) ||
        (await readlink(`/proc/${pid}/ns/mnt`)) !== mountNamespace
      ) {
        return false
      }
      const sockets = await unixSockets(`/proc/${pid}/net/unix`)
      const descriptors = await readdir(`/proc/${pid}/fd`)
      const inodes = new Set(
        await Promise.all(
          descriptors.map(async (fd) =>
            /^socket:\[(\d+)\]$/.exec(
              await readlink(`/proc/${pid}/fd/${fd}`),
            )?.[1],
          ),
        ),
      )
      const listeners = sockets.filter(
        (entry) => entry.listening && inodes.has(entry.inode),
      )
      if (!listeners.length) {
        return false
      }
      const target = await socketIdentity(socket)
      for (const listener of listeners) {
        if (
          !listener.name ||
          !path.isAbsolute(listener.name) ||
          (await socketIdentity(listener.name)) === target
        ) {
          return false
        }
      }
    }
    // Do not accept a server which appeared while processes were inspected.
    return !(await unixSockets('/proc/net/unix')).some(({ name }) => name === socket)
  } catch {
    // An unavailable probe is indeterminate, not absence. Let callers retry
    // and surface the original tmux error rather than a /proc implementation
    // detail (and never mistake an ENOENT probe failure for a missing binary).
    return false
  }
}

async function unixSockets(file: string): Promise<UnixSocket[]> {
  const contents = await readFile(file, 'utf8')
  if (!contents.endsWith('\n')) {
    throw new Error('Incomplete Linux socket table')
  }
  const [header, ...lines] = contents.slice(0, -1).split('\n')
  if (!/^Num\s+RefCount\s+Protocol\s+Flags\s+Type\s+St\s+Inode\s+Path$/.test(header)) {
    throw new Error('Unrecognized Linux socket table')
  }
  return lines.map((line) => {
    const fields = /^[\da-f]+:\s+[\da-f]+\s+[\da-f]+\s+([\da-f]+)\s+([\da-f]+)\s+([\da-f]+)\s+(\d+)(?:\s+(.+))?$/i.exec(
      line,
    )
    if (!fields) {
      throw new Error('Incomplete Linux socket table')
    }
    return {
      inode: fields[4],
      name: fields[5],
      listening:
        (Number.parseInt(fields[1], 16) & 0x10000) !== 0 &&
        Number.parseInt(fields[2], 16) === 1,
    }
  })
}

async function procVisible(): Promise<boolean> {
  const mounts = (await readFile('/proc/self/mountinfo', 'utf8'))
    .split('\n')
    .filter((line) => line.split(' ')[4] === '/proc')
  if (mounts.length !== 1) {
    return false
  }
  const [mount, filesystem] = mounts[0].split(' - ')
  const fields = mount.split(' ')
  const [type, , options] = filesystem?.split(' ') ?? []
  if (fields[3] !== '/' || type !== 'proc' || !options) {
    return false
  }
  // hidepid may hide a live server entirely, not merely deny individual reads.
  return [...fields[5].split(','), ...options.split(',')].every(
    (option) =>
      !option.startsWith('hidepid=') ||
      option === 'hidepid=0' ||
      option === 'hidepid=off',
  )
}

async function socketIdentity(socket: string): Promise<string> {
  try {
    return await realpath(socket)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
  try {
    await readlink(socket)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
    // Resolve directory aliases even when the socket file itself was lost.
    return path.join(await realpath(path.dirname(socket)), path.basename(socket))
  }
  // A dangling socket symlink cannot be compared by its filename.
  throw new Error('Indeterminate tmux socket alias')
}

function processGone(error: unknown): boolean {
  return (
    (error as NodeJS.ErrnoException).code === 'ENOENT' ||
    (error as NodeJS.ErrnoException).code === 'ESRCH'
  )
}

/** Executable availability is separate from evidence that a server stopped. */
export function tmuxNotInstalled(error: unknown): boolean {
  return (error as NodeJS.ErrnoException | null)?.code === 'ENOENT'
}
