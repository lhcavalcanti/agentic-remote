import { lstat, readdir, readFile, readlink, realpath, stat } from 'node:fs/promises'
import path from 'node:path'

interface UnixSocket {
  inode: string
  name?: string
  listening: boolean
}

/** Where a socket lives: its directory, identified alike in every mount namespace, and its name there. */
interface SocketPlace {
  device: bigint
  inode: bigint
  name: string
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
    let ours: SocketPlace | undefined
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
      if (!/^mnt:\[\d+\]$/.test(mountNamespace)) {
        return false
      }
      // A pathname names something else in another mount namespace, such as a
      // container's or a sandbox's, so that server's socket is placed as it sees it.
      const foreign = (await readlink(`/proc/${pid}/ns/mnt`)) !== mountNamespace
      const sockets = await unixSockets(`/proc/${pid}/net/unix`)
      const descriptors = await readdir(`/proc/${pid}/fd`)
      const inodes = new Set(
        await Promise.all(
          descriptors.map(async (fd) => {
            let file: string
            try {
              file = await readlink(`/proc/${pid}/fd/${fd}`)
            } catch (failure) {
              // A server closes each client's connection as that client
              // leaves: a descriptor closed since it was listed holds nothing.
              // Were it the listener, none would remain, and absence is refused.
              if (processGone(failure)) {
                return undefined
              }
              throw failure
            }
            return /^socket:\[(\d+)\]$/.exec(file)?.[1]
          }),
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
        if (!listener.name || !path.isAbsolute(listener.name)) {
          return false
        }
        if (foreign) {
          ours ??= await socketPlace(target)
          if (samePlace(await foreignSocketPlace(pid, listener.name), ours)) {
            return false
          }
        } else if ((await socketIdentity(listener.name)) === target) {
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

/** Where `identity`, a socket path as `socketIdentity` resolves it here, lives. */
async function socketPlace(identity: string): Promise<SocketPlace> {
  const directory = await stat(path.dirname(identity), { bigint: true })
  return { device: directory.dev, inode: directory.ino, name: path.basename(identity) }
}

/**
 * Where a socket that process `pid`, in another mount namespace, bound at the
 * absolute `name` lives, walked through that process's own root. A symbolic
 * link on the way could resolve outside that view, so none is followed: each
 * directory on the way is looked at before the walk goes through it.
 */
async function foreignSocketPlace(pid: string, name: string): Promise<SocketPlace> {
  const segments = name.split('/').slice(1)
  const root = `/proc/${pid}/root`
  let directory = await stat(root, { bigint: true })
  for (let depth = 1; depth < segments.length; depth += 1) {
    directory = await lstat(`${root}/${segments.slice(0, depth).join('/')}`, { bigint: true })
    if (!directory.isDirectory()) {
      throw new Error('Indeterminate tmux socket directory')
    }
  }
  return { device: directory.dev, inode: directory.ino, name: segments.at(-1)! }
}

function samePlace(left: SocketPlace, right: SocketPlace): boolean {
  return left.device === right.device && left.inode === right.inode && left.name === right.name
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
