import type { LucideIcon } from 'lucide-react'

export interface ClientFeature {
  id: string
  label: string
  icon: LucideIcon
  railEntry?: { order: number; badge?: number }
  open(): void
}

export function railEntries(features: readonly ClientFeature[]): ClientFeature[] {
  return features.filter((feature) => feature.railEntry)
    .sort((a, b) => a.railEntry!.order - b.railEntry!.order)
}
