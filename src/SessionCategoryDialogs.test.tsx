// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CategoryNameDialog } from './SessionCategoryDialogs'

afterEach(cleanup)

describe('category name dialog', () => {
  it('takes a name of 60 characters outside the basic plane, which count as one each', async () => {
    const onSubmit = vi.fn(() => undefined)
    render(<CategoryNameDialog mode="create" onClose={vi.fn()} onSubmit={onSubmit} />)
    const name = '🧪'.repeat(60)

    await userEvent.type(screen.getByRole('textbox', { name: 'Category name' }), name)
    await userEvent.click(screen.getByRole('button', { name: 'Create category' }))
    expect(onSubmit).toHaveBeenCalledWith(name)
  })
})
