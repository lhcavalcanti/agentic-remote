import { configDefaults } from 'vitest/config'

export type MachineAccess =
  | 'real-tmux'
  | 'copilot-process'
  | 'process-discovery'

type MachineAccessClassification = {
  access: Partial<Record<MachineAccess, 'direct' | 'indirect'>>
  rationale: string
}

export const machineAccessTestManifest = {
  'server/active-sessions.test.ts': {
    access: {
      'real-tmux': 'direct',
      'copilot-process': 'direct',
      'process-discovery': 'direct',
    },
    rationale: 'Starts Copilot-shaped processes in tmux and discovers them through the host process table.',
  },
  'server/terminal-form-viewport.test.ts': {
    access: {
      'real-tmux': 'direct',
      'copilot-process': 'direct',
      'process-discovery': 'indirect',
    },
    rationale: 'Drives Copilot-shaped terminal fixtures through real tmux and controller process discovery.',
  },
  'server/terminal-queue-delivery.test.ts': {
    access: {
      'real-tmux': 'direct',
      'copilot-process': 'direct',
      'process-discovery': 'indirect',
    },
    rationale: 'Drives a Copilot-shaped queued-command fixture through real tmux and controller discovery.',
  },
  'server/terminal-session.test.ts': {
    access: {
      'real-tmux': 'direct',
      'copilot-process': 'direct',
      'process-discovery': 'indirect',
    },
    rationale: 'Exercises the production terminal controller against real tmux and Copilot-shaped processes.',
  },
  'server/terminal-startup-queue.test.ts': {
    access: {
      'real-tmux': 'direct',
      'copilot-process': 'direct',
      'process-discovery': 'direct',
    },
    rationale: 'Recovers a Copilot-shaped tmux process through production process discovery.',
  },
  'server/tmux-errors.integration.test.ts': {
    access: {
      'real-tmux': 'direct',
      'copilot-process': 'direct',
      'process-discovery': 'direct',
    },
    rationale: 'Validates failure handling against a real tmux server and the host process table.',
  },
  'server/tmux-test-helpers.integration.test.ts': {
    access: {
      'real-tmux': 'direct',
      'process-discovery': 'direct',
    },
    rationale: 'Starts isolated tmux servers and verifies their process identity and retirement.',
  },
} as const satisfies Record<string, MachineAccessClassification>

export const machineAccessTestFiles = Object.keys(machineAccessTestManifest)

export const vitestTestInclude = configDefaults.include
export const parallelTestExclude = [
  ...configDefaults.exclude,
  ...machineAccessTestFiles,
]

export const parallelSafeTestProject = {
  name: 'parallel-safe',
  include: vitestTestInclude,
  exclude: parallelTestExclude,
  fileParallelism: true,
  maxWorkers: 4,
}

export const machineAccessTestProject = {
  name: 'machine-access',
  include: machineAccessTestFiles,
  fileParallelism: false,
}
