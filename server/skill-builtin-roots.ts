import { lstat, readdir, realpath } from 'node:fs/promises'
import path from 'node:path'
import { isWithin } from './session-directory.js'

const versionPattern = /^(\d{1,9})\.(\d{1,9})\.(\d{1,9})(?:-([A-Za-z0-9][A-Za-z0-9.-]{0,40}))?$/

function newestStableFirst(left: string, right: string): number {
  const a = versionPattern.exec(left)!
  const b = versionPattern.exec(right)!
  if (Boolean(a[4]) !== Boolean(b[4])) return a[4] ? 1 : -1
  for (let index = 1; index <= 3; index++) {
    const difference = Number(b[index]) - Number(a[index])
    if (difference) return difference
  }
  return (b[4] ?? '').localeCompare(a[4] ?? '', 'en', { numeric: true })
}

/** Reads installation metadata only; never launches or updates the CLI. */
export async function builtinSkillDirectories(home: string, env: NodeJS.ProcessEnv): Promise<string[]> {
  let executable: string | undefined
  for (const directory of (env.PATH?.split(path.delimiter) ?? []).filter(Boolean).slice(0, 100)) {
    executable = await realpath(path.join(directory, process.platform === 'win32' ? 'copilot.exe' : 'copilot')).catch(() => undefined)
    if (executable) break
  }
  const report = process.platform === 'linux' ? process.report.getReport() as { header?: { glibcVersionRuntime?: string } } : undefined
  const platform = process.platform === 'linux' && !report?.header?.glibcVersionRuntime ? 'linuxmusl' : process.platform
  const override = env.COPILOT_CACHE_HOME?.trim()
  const cache = override
    ? override === '~' ? home : override.startsWith('~/') ? path.join(home, override.slice(2)) : path.resolve(override)
    : process.platform === 'darwin' ? path.join(home, 'Library', 'Caches', 'copilot')
      : process.platform === 'win32' ? env.LOCALAPPDATA ? path.join(env.LOCALAPPDATA, 'copilot') : undefined
        : path.join(env.XDG_CACHE_HOME || path.join(home, '.cache'), 'copilot')
  if (cache) {
    const packages = await realpath(path.join(cache, 'pkg', `${platform}-${process.arch}`)).catch(() => undefined)
    if (packages) {
      const entries = await readdir(packages, { withFileTypes: true }).catch(() => [])
      const versions = entries.filter((entry) => entry.isDirectory() && versionPattern.test(entry.name))
        .map((entry) => entry.name).sort(newestStableFirst).slice(0, 1000)
      const running = executable && isWithin(packages, executable) ? path.relative(packages, executable).split(path.sep)[0] : undefined
      if (running && versions.includes(running)) versions.splice(0, 0, ...versions.splice(versions.indexOf(running), 1))
      for (const version of versions) {
        const directory = path.join(packages, version)
        const builtin = await realpath(path.join(directory, 'builtin')).catch(() => undefined)
        if (builtin && isWithin(directory, builtin) && (await lstat(builtin).catch(() => undefined))?.isDirectory()) return [builtin]
      }
    }
  }
  if (executable) {
    const installation = path.dirname(executable)
    for (const location of [
      path.join(installation, 'builtin-skills'),
      path.join(installation, 'node_modules', '@github', `copilot-${platform}-${process.arch}`, 'builtin-skills'),
    ]) {
      if ((await lstat(location).catch(() => undefined))?.isDirectory()) return [location]
    }
  }
  return []
}
