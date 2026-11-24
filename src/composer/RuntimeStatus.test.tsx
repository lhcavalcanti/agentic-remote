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
    expect(button).toHaveTextContent('effort high·200k context·plan')
    expect(button.querySelector('[data-model-family]')).toHaveAttribute('data-model-family', 'openai')
    expect(button).toHaveAccessibleDescription('Open session setup. Model: gpt-fictional. Effort: high. Context: 200k. Mode: plan.')
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

  it('carries the short model name and mode icon a narrow row shows instead', () => {
    const { container } = render(<RuntimeStatus
      session={{ ...session, runtime: { model: 'claude-opus-5.5', mode: 'autopilot' } }}
      compactTokens={String}
      onOpen={vi.fn()}
    />)
    expect(container.querySelector('.composer-runtime__model--full')).toHaveTextContent('claude-opus-5.5')
    expect(container.querySelector('.composer-runtime__model--short')).toHaveTextContent(/^Opus 5\.5$/)
    const icon = container.querySelector('.composer-runtime__mode-icon')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('button')).toHaveAccessibleDescription(/Model: claude-opus-5\.5\..*Mode: autopilot\./)
  })

  it('keeps one name and the mode word when neither has a shorter form', () => {
    const { container } = render(<RuntimeStatus
      session={{ ...session, runtime: { model: 'fixture-model', mode: 'custom' } }}
      compactTokens={String}
      onOpen={vi.fn()}
    />)
    expect(container.querySelectorAll('.composer-runtime__model')).toHaveLength(1)
    expect(container.querySelector('.composer-runtime__model--short')).toBeNull()
    expect(container.querySelector('.composer-runtime__mode-icon')).toBeNull()
    expect(screen.getByRole('button')).toHaveTextContent('fixture-model·effort default·auto context·custom')
  })

  it('keeps defaults useful when the runtime has not reported its settings', () => {
    render(<RuntimeStatus session={{ ...session, runtime: undefined }} compactTokens={String} onOpen={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('Default model·effort default·auto context·interactive')
  })
})
