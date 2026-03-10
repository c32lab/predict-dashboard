import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SectionSkeleton } from '../../../components/ui/SectionSkeleton'

describe('SectionSkeleton', () => {
  it('renders with default height', () => {
    const { container } = render(<SectionSkeleton />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('h-32')
    expect(el.className).toContain('animate-pulse')
    expect(el.className).toContain('bg-gray-900')
    expect(el.className).toContain('border-gray-800')
  })

  it('accepts custom height', () => {
    const { container } = render(<SectionSkeleton height="h-64" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('h-64')
  })

  it('renders three inner bars', () => {
    const { container } = render(<SectionSkeleton />)
    const bars = container.querySelectorAll('.bg-gray-800')
    expect(bars.length).toBe(3)
  })
})
