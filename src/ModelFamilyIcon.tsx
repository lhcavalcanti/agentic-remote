import { useId, type ReactNode } from 'react'
import type { ModelFamily } from '../shared/model-family'

// Original neutral family glyphs, not official brand marks.
const glyphs = {
  anthropic: <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M8.5 5.9l7 12.2M8.5 18.1l7-12.2" />,
  openai: <>
    <path d="m12 3 7.8 4.5v9L12 21l-7.8-4.5v-9Z" />
    <path d="m12 6 3.5 6-3.5 6-3.5-6ZM6.8 9l6.9.1 3.5 5.9-6.9-.1ZM6.8 15l3.5-5.9 6.9-.1-3.5 5.9Z" />
  </>,
  google: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />,
  xai: <path d="m5 4 14 16M5 20 19 4M16 3h4v4" />,
  meta: <path d="m8 5-5 7 5 7M16 5l5 7-5 7M7 12h10M10 8l4 8" />,
  mistral: <path d="m3 17 5-7 4 5 4-9 5 11M3 5h6M3 8h3" />,
  generic: <>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3" />
    <path d="M10 10h4v4h-4Z" />
  </>,
} satisfies Record<ModelFamily, ReactNode>

export function ModelFamilyIcon({
  family,
  size = 16,
  title,
}: {
  family: ModelFamily
  size?: 16 | 20
  title?: string
}) {
  const titleId = useId()
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? titleId : undefined}
      className="model-family-icon"
      data-model-family={family}
      fill="none"
      focusable="false"
      height={size}
      role={title ? 'img' : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width={size}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {glyphs[family]}
    </svg>
  )
}
