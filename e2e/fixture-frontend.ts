import { spawnSync } from 'node:child_process'
import { access, realpath } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const fixtureFrontendDist = 'test-results/oracle-conversation-dist-e2e'
export const fixtureFrontendBuildCommand =
  `pnpm exec tsc -b && AGENTIC_REMOTE_E2E_BUILD=1 pnpm exec vite build --outDir ${fixtureFrontendDist} --emptyOutDir`

/** Resolve existing ancestors before creating anything, including through symlinks. */
export async function captureOutputDirectory(directory: string): Promise<string> {
  let ancestor = resolve(directory)
  const missing: string[] = []
  for (;;) {
    try {
      ancestor = await realpath(ancestor)
      break
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      missing.unshift(basename(ancestor))
      ancestor = dirname(ancestor)
    }
  }
  const output = join(ancestor, ...missing)
  if (/^\/(?:var\/)?tmp(?:\/|$)/.test(output)) {
    throw new Error('Capture files must stay outside system temporary directories.')
  }
  return output
}

/** A worktree-local build and owned, ephemeral loopback server; no backend. */
export async function startFixtureFrontend(noBuild: boolean) {
  const root = fileURLToPath(new URL('../', import.meta.url))
  if (!noBuild) {
    const result = spawnSync(fixtureFrontendBuildCommand, {
      cwd: root,
      shell: true,
      stdio: 'inherit',
    })
    if (result.error) throw result.error
    if (result.status !== 0) throw new Error(`Fixture frontend build failed (${result.status ?? result.signal}).`)
  }
  try {
    await access(resolve(root, fixtureFrontendDist, 'index.html'))
  } catch {
    throw new Error('No fixture frontend build found. Run pnpm screens without --no-build first.')
  }
  const { preview } = await import('vite')
  const server = await preview({
    root,
    configFile: false,
    logLevel: 'error',
    build: { outDir: fixtureFrontendDist },
    preview: { host: '127.0.0.1', port: 0, strictPort: true },
  })
  try {
    const address = server.httpServer.address()
    if (!address || typeof address === 'string') throw new Error('Fixture frontend did not bind a TCP port.')
    const url = `http://127.0.0.1:${address.port}`
    if (!(await fetch(url)).ok) throw new Error('Fixture frontend is not ready.')
    return { url, close: () => server.close() }
  } catch (error) {
    await server.close()
    throw error
  }
}
