import type { SlashCommand } from '../shared/contracts'

export type SessionResourceTab = 'skills' | 'mcp'

export const sessionResourceCommands: SlashCommand[] = [
  {
    name: 'skills',
    aliases: ['skill'],
    description: 'View skills available to this session',
    inputHint: '[filter]',
    allowDuringAgentExecution: true,
  },
  {
    name: 'mcp',
    description: 'View MCP servers without changing configuration',
    inputHint: '[filter]',
    allowDuringAgentExecution: true,
  },
]

export function sessionResourceCommand(content: string): {
  tab: SessionResourceTab
  filter: string
} | undefined {
  const match = content.trim().match(/^\/(skills?|mcp)(?:\s+([\s\S]*))?$/i)
  if (!match) return undefined
  return {
    tab: match[1].toLowerCase() === 'mcp' ? 'mcp' : 'skills',
    filter: (match[2] || '').trim().replace(/\s+/g, ' '),
  }
}

export function isSessionResourceCommandName(name: string): boolean {
  return ['skill', 'skills', 'mcp'].includes(name.toLowerCase())
}
