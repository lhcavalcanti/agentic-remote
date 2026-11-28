/** A worker child inherits only these, never tokens or credentials. */
export function minimalWorkerEnvironment(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const allowed = [
    'HOME',
    'LANG',
    'LC_ALL',
    'NODE_ENV',
    'PATH',
    'SystemRoot',
    'TZ',
    'WINDIR',
  ] as const
  return Object.fromEntries(
    allowed.flatMap((name) => env[name] === undefined ? [] : [[name, env[name]]]),
  )
}
