// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ModelFamilyIcon } from './ModelFamilyIcon'
import type { ModelFamily } from '../shared/model-family'

afterEach(cleanup)

describe('ModelFamilyIcon', () => {
  it.each<ModelFamily>(['anthropic', 'openai', 'google', 'xai', 'meta', 'mistral', 'generic'])(
    'renders a decorative %s glyph without an accessible name',
    (family) => {
      const { container } = render(<ModelFamilyIcon family={family} />)
      const icon = container.querySelector('svg')!
      expect(icon).toHaveAttribute('data-model-family', family)
      expect(icon).toHaveAttribute('aria-hidden', 'true')
      expect(icon).toHaveAttribute('stroke', 'currentColor')
      expect(icon).toHaveAttribute('width', '16')
      expect(icon).toHaveAttribute('height', '16')
      expect(icon.querySelector('path')).not.toBeNull()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
      expect(icon.querySelector('title')).toBeNull()
    },
  )

  it('labels standalone icons with independent title references at either size', () => {
    render(<>
      <ModelFamilyIcon family="anthropic" size={20} title="Anthropic family" />
      <ModelFamilyIcon family="openai" title="OpenAI family" />
    </>)
    const anthropic = screen.getByRole('img', { name: 'Anthropic family' })
    const openai = screen.getByRole('img', { name: 'OpenAI family' })
    expect(anthropic).not.toHaveAttribute('aria-hidden')
    expect(anthropic).toHaveAttribute('width', '20')
    expect(anthropic).toHaveAttribute('height', '20')
    expect(anthropic.getAttribute('aria-labelledby')).not.toBe(openai.getAttribute('aria-labelledby'))
    expect(document.getElementById(anthropic.getAttribute('aria-labelledby')!)).toHaveTextContent('Anthropic family')
  })
})
