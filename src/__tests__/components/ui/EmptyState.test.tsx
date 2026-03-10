import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../../../components/ui/EmptyState'

describe('EmptyState', () => {
  it('renders default message and icon', () => {
    render(<EmptyState />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
    expect(screen.getByText('📭')).toBeInTheDocument()
  })

  it('renders custom message and icon', () => {
    render(<EmptyState icon="🔍" message="Nothing found" />)
    expect(screen.getByText('Nothing found')).toBeInTheDocument()
    expect(screen.getByText('🔍')).toBeInTheDocument()
  })

  it('has dark-themed container', () => {
    const { container } = render(<EmptyState />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('bg-gray-900')
    expect(el.className).toContain('border-gray-800')
    expect(el.className).toContain('h-48')
  })
})
