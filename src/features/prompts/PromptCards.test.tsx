// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PendingUserInput } from '../../../shared/contracts'
import { UserInputCard } from './PromptCards'

afterEach(cleanup)

const question = [
  'Review this **synthetic** recording request before answering.',
  '',
  '| Field | Current | Proposed |',
  '| --- | --- | --- |',
  '| Duration | None | 180 minutes |',
  '| Destination | None | `cache-only` |',
  '',
  '**Environment:** `test`',
  '',
  '```json',
  '{',
  '  "TestName": "example-recording",',
  '  "CacheOnly": true',
  '}',
  '```',
  '',
  'No operation is executed by this example.',
].join('\n')

const request: PendingUserInput = {
  requestId: 'synthetic-question',
  question,
  choices: ['Confirm', 'Decline'],
  allowFreeform: true,
}

describe('agent question Markdown', () => {
  it.each([false, true])('renders rich text with structured form=%s', (structured) => {
    const onReply = vi.fn()
    const { container } = render(<UserInputCard
      request={structured ? {
        ...request,
        form: { fields: [{ name: 'note', title: 'Optional note', type: 'string', required: false }] },
      } : request}
      disabled={false}
      onReply={onReply}
    />)

    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('columnheader')).toHaveLength(3)
    expect(within(table).getByRole('cell', { name: '180 minutes' })).toBeVisible()
    expect(container.querySelector('strong')).toHaveTextContent('synthetic')
    expect(container.querySelector('pre > code.language-json')?.textContent).toBe(
      '{\n  "TestName": "example-recording",\n  "CacheOnly": true\n}\n',
    )
    expect(container.querySelector('h3 table, h3 pre, p table, p pre')).toBeNull()
    expect(onReply).not.toHaveBeenCalled()
  })

  it('keeps ordinary choices and freeform answers unchanged', () => {
    const onReply = vi.fn()
    render(<UserInputCard request={{ ...request, question: 'Which option?' }} disabled={false} onReply={onReply} />)
    expect(screen.getByText('Which option?')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onReply).toHaveBeenLastCalledWith({ answer: 'Confirm', wasFreeform: false })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'A different option' } })
    fireEvent.submit(input.closest('form')!)
    expect(onReply).toHaveBeenLastCalledWith({ answer: 'A different option', wasFreeform: true })
  })

  it('keeps structured values and cancellation separate from Markdown', () => {
    const onReply = vi.fn()
    render(<UserInputCard request={{
      ...request,
      form: { fields: [{ name: 'note', title: 'Optional note', type: 'string', required: false }] },
    }} disabled={false} onReply={onReply} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Optional note' }), {
      target: { value: 'Keep **this** literal' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(onReply).toHaveBeenLastCalledWith({
      answer: '{"note":"Keep **this** literal"}',
      values: { note: 'Keep **this** literal' },
      wasFreeform: false,
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onReply).toHaveBeenLastCalledWith({ action: 'cancel', answer: '', wasFreeform: false })
  })

  it('does not turn raw HTML or unsafe links into executable content', () => {
    const { container } = render(<UserInputCard request={{
      ...request,
      question: '<script>alert("example")</script>\n\n[Unsafe](javascript:alert%281%29)\n\n**Readable**',
    }} disabled={false} onReply={vi.fn()} />)
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('a')?.getAttribute('href')).not.toMatch(/^javascript:/i)
    expect(container.querySelector('strong')).toHaveTextContent('Readable')
  })
})
