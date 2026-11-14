import { Bell } from 'lucide-react'
import { expect, it, vi } from 'vitest'
import { railEntries } from './registry'

it('keeps only declared entries in stable order without mutating registration order', () => {
  const features = [
    { id: 'later', label: 'Later', icon: Bell, railEntry: { order: 20 }, open: vi.fn() },
    { id: 'hidden', label: 'Hidden', icon: Bell, open: vi.fn() },
    { id: 'first', label: 'First', icon: Bell, railEntry: { order: 10 }, open: vi.fn() },
  ]
  expect(railEntries(features).map((feature) => feature.id)).toEqual(['first', 'later'])
  expect(features[0].id).toBe('later')
})
