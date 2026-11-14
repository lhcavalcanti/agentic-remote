import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { parseSettingValue } from '../shared/settings-profile.js'

const execute = promisify(execFile)

export async function resolveHubDisplayName(
  readGitName = async () => (await execute('git', ['config', '--global', '--get', 'user.name'], {
    timeout: 2000, maxBuffer: 4096,
  })).stdout,
  user = process.env.USER,
): Promise<string> {
  let gitName: string | undefined
  try { gitName = await readGitName() } catch { /* Git or a global name may be absent. */ }
  for (const candidate of [gitName, user, 'User']) {
    const parsed = parseSettingValue('displayName', candidate?.trim())
    if (parsed.ok) return parsed.value
  }
  return 'User'
}
