// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { addComputer, removeComputer } from '../api'
import { ComputersBody } from './ComputersDialog'

vi.mock('../api', () => ({ addComputer: vi.fn(), removeComputer: vi.fn() }))
afterEach(() => { cleanup(); vi.restoreAllMocks() })
const computer = { id: 'node', name: 'Build node', isLocal: false, online: true, version: '1.54.0' }

describe('computer management body', () => {
  it('embeds status, checks connection, pairs and confirms removal', async () => {
    vi.mocked(addComputer).mockResolvedValue(computer)
    vi.mocked(removeComputer).mockResolvedValue()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const onAdded = vi.fn()
    const onRemoved = vi.fn()
    const onCheckConnection = vi.fn().mockResolvedValue([computer])
    render(<ComputersBody computers={[computer]} onAdded={onAdded} onRemoved={onRemoved} onCheckConnection={onCheckConnection} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Online · Node · Version 1.54.0')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Check connection' }))
    await screen.findByText('Build node: Online')
    expect(onCheckConnection).toHaveBeenCalledOnce()
    expect(onAdded).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Node URL'), { target: { value: 'https://node.example.test' } })
    fireEvent.change(screen.getByLabelText('Pairing token'), { target: { value: 'fictional-token' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add computer' }))
    await waitFor(() => expect(addComputer).toHaveBeenCalledWith({ baseUrl: 'https://node.example.test', token: 'fictional-token', name: undefined }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove Build node' }))
    await waitFor(() => expect(onRemoved).toHaveBeenCalledWith('node'))
  })

})
