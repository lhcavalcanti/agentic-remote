// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ManagedQueuedBatch } from '../shared/contracts'
import { QueueBatchDialog } from './QueueBatchDialog'

afterEach(() => cleanup())

type Queue = (input: { batchId: string; prompts: string[] }) => Promise<ManagedQueuedBatch>

function setup(initialPrompt = '', onQueue = vi.fn<Queue>(async () => ({}) as ManagedQueuedBatch)) {
  const onClose = vi.fn()
  render(
    <QueueBatchDialog
      computerName="development"
      initialPrompt={initialPrompt}
      onClose={onClose}
      onQueue={onQueue}
      sessionTitle="Release notes"
    />,
  )
  const dialog = screen.getByRole('dialog', { name: 'Queue several prompts' })
  const fields = () => within(dialog).getAllByRole('textbox')
  const submit = () => within(dialog).getByRole('button', { name: /^(Queue \d+ prompts?|Retry)$/ })
  return { dialog, fields, submit, onQueue, onClose }
}

describe('QueueBatchDialog', () => {
  it('starts with what was in the message box and a second empty prompt', () => {
    const { dialog, fields, submit } = setup('Draft the changelog')
    expect(fields().map((field) => (field as HTMLTextAreaElement).value)).toEqual(['Draft the changelog', ''])
    expect(within(dialog).getByText(
      'Each prompt runs as its own turn, in this order, after anything already queued. Nothing is combined.',
    )).toBeVisible()
    // A blank prompt cannot be queued; it is said why rather than sent and refused.
    expect(submit()).toBeDisabled()
    expect(within(dialog).getByText('Prompt 2 is blank.')).toBeVisible()
  })

  it('adds, moves, and removes prompts, and queues them in the order shown', async () => {
    const { dialog, fields, submit, onQueue } = setup('first')
    fireEvent.change(fields()[1], { target: { value: 'second' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add prompt' }))
    fireEvent.change(fields()[2], { target: { value: 'third' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Move prompt 3 up' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add prompt' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remove prompt 4' }))
    expect(within(dialog).getByRole('button', { name: 'Move prompt 1 up' })).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'Move prompt 3 down' })).toBeDisabled()
    expect(within(dialog).getByText('3 prompts · 16 characters')).toBeVisible()
    expect(submit()).toHaveTextContent('Queue 3 prompts')

    await act(async () => fireEvent.click(submit()))
    expect(onQueue).toHaveBeenCalledWith({
      batchId: expect.stringMatching(/^[a-f0-9]{32}$/),
      prompts: ['first', 'third', 'second'],
    })
  })

  it('keeps the prompts and says nothing was queued when the hub refuses', async () => {
    const onQueue = vi.fn(async () => {
      throw Object.assign(new Error('Resume the session before queueing to it. Nothing was queued.'), {
        statusCode: 409, uncertainDelivery: false,
      })
    })
    const { dialog, fields, submit } = setup('first', onQueue)
    fireEvent.change(fields()[1], { target: { value: 'second' } })
    await act(async () => fireEvent.click(submit()))
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Nothing was queued: Resume the session before queueing to it.',
    )
    expect(fields().map((field) => (field as HTMLTextAreaElement).value)).toEqual(['first', 'second'])
    expect(fields()[0]).not.toHaveAttribute('readonly')
    expect(submit()).toBeEnabled()
  })

  it('locks the prompts after an unconfirmed send and retries the very same batch', async () => {
    let attempt = 0
    const onQueue = vi.fn<Queue>(async () => {
      attempt += 1
      if (attempt === 1) {
        throw Object.assign(new Error('The hub did not answer.'), { uncertainDelivery: true })
      }
      return {} as ManagedQueuedBatch
    })
    const { dialog, fields, submit } = setup('first', onQueue)
    fireEvent.change(fields()[1], { target: { value: 'second' } })
    await act(async () => fireEvent.click(submit()))
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Couldn’t confirm the batch reached development. Retry sends the same batch, so it can’t be queued twice.',
    )
    for (const field of fields()) expect(field).toHaveAttribute('readonly')
    expect(within(dialog).queryByRole('button', { name: 'Add prompt' })).toBeDisabled()
    expect(submit()).toHaveTextContent('Retry')
    await act(async () => fireEvent.click(submit()))
    expect(onQueue).toHaveBeenCalledTimes(2)
    const [first, second] = onQueue.mock.calls.map(([input]) => input)
    expect(second.batchId).toBe(first.batchId)
  })

  it('unlocks the prompts when a retry is refused outright, as nothing was queued', async () => {
    const onQueue = vi.fn<Queue>()
      .mockRejectedValueOnce(Object.assign(new Error('The hub did not answer.'), { uncertainDelivery: true }))
      .mockRejectedValueOnce(Object.assign(
        new Error('Resume the session before queueing to it. Nothing was queued.'),
        { statusCode: 409, uncertainDelivery: false },
      ))
    const { dialog, fields, submit } = setup('first', onQueue)
    fireEvent.change(fields()[1], { target: { value: 'second' } })
    await act(async () => fireEvent.click(submit()))
    await act(async () => fireEvent.click(submit()))
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Nothing was queued: Resume the session before queueing to it.')
    expect(fields()[0]).not.toHaveAttribute('readonly')
  })

  it('stops at fifty prompts', () => {
    const { dialog } = setup()
    const add = within(dialog).getByRole('button', { name: 'Add prompt' })
    for (let index = 0; index < 60; index += 1) fireEvent.click(add)
    expect(within(dialog).getAllByRole('textbox')).toHaveLength(50)
    expect(add).toBeDisabled()
    expect(within(dialog).getByText('50 prompts is the most one batch can hold.')).toBeVisible()
  })
})
