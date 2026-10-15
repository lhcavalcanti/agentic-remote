import { describe, expect, it } from 'vitest'
import { oracleCommand } from './oracle-command'

describe('oracleCommand', () => {
  it('reads the prompt after /oracle', () => {
    expect(oracleCommand('/oracle What is running?')).toEqual({ prompt: 'What is running?' })
    expect(oracleCommand('  /ORACLE  two\nlines ')).toEqual({ prompt: 'two\nlines' })
    expect(oracleCommand('/oracle')).toEqual({ prompt: '' })
  })

  it('ignores anything else', () => {
    expect(oracleCommand('/oracles x')).toBeUndefined()
    expect(oracleCommand('oracle x')).toBeUndefined()
    expect(oracleCommand('/ask /oracle x')).toBeUndefined()
  })
})
