// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ManagedSession } from '../../shared/contracts'
import { RuntimeStatus } from './RuntimeStatus'

afterEach(cleanup)
const session = {
  id: 'one', computerId: 'studio', computerName: 'Studio', status: 'idle',
  runtime: { model: 'gpt-fictional', reasoningEffort: 'high', contextTokenLimit: 200_000, mode: 'plan' },
} as ManagedSession

describe('RuntimeStatus', () => {
  it('presents the model family, effort, context and mode as one keyboard button', () => {
    const onOpen = vi.fn()
    render(<RuntimeStatus session={session} compactTokens={() => '200k'} onOpen={onOpen} />)
    const button = screen.getByRole('button')
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(button).toHaveTextContent('gpt-fictional·effort high·200k context·plan')
    expect(button.querySelector('[data-model-family]')).toHaveAttribute('data-model-family', 'openai')
    expect(button).toHaveAccessibleDescription('Open session setup')
    expect(screen.queryByText('applies when idle')).not.toBeInTheDocument()
    fireEvent.click(button)
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it.each(['running', 'waiting'] as const)('explains idle-only apply while %s without disabling setup', (status) => {
    render(<RuntimeStatus session={{ ...session, status }} compactTokens={String} onOpen={vi.fn()} />)
    expect(screen.getByRole('button')).toBeEnabled()
    expect(screen.getByText('applies when idle')).toBeVisible()
    expect(screen.getByRole('button')).toHaveAccessibleDescription(/applies when idle/)
    expect(screen.getByRole('button')).toHaveAttribute('title', expect.stringContaining('applies when idle'))
  })

  it('keeps defaults useful when the runtime has not reported its settings', () => {
    render(<RuntimeStatus session={{ ...session, runtime: undefined }} compactTokens={String} onOpen={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('Default model·effort default·auto context·interactive')
  })
})
