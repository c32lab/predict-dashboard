import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AnomalyBadge from '../../../components/ui/AnomalyBadge'

describe('AnomalyBadge', () => {
  it('renders warning level with yellow styling', () => {
    render(<AnomalyBadge level="warning" message="Low confidence" />)
    const el = screen.getByText('Low confidence')
    expect(el.closest('span')).toBeInTheDocument()
    const badge = el.closest('span.inline-flex') as HTMLElement
    expect(badge.className).toContain('border-yellow-500/60')
    expect(badge.className).toContain('bg-yellow-500/10')
    expect(badge.className).toContain('text-yellow-400')
  })

  it('renders critical level with red styling', () => {
    render(<AnomalyBadge level="critical" message="System failure" />)
    const el = screen.getByText('System failure')
    const badge = el.closest('span.inline-flex') as HTMLElement
    expect(badge.className).toContain('border-red-500/60')
    expect(badge.className).toContain('bg-red-500/10')
    expect(badge.className).toContain('text-red-400')
  })

  it('renders warning icon for warning level', () => {
    render(<AnomalyBadge level="warning" message="test" />)
    expect(screen.getByText('⚠️')).toBeInTheDocument()
  })

  it('renders critical icon for critical level', () => {
    render(<AnomalyBadge level="critical" message="test" />)
    expect(screen.getByText('🔴')).toBeInTheDocument()
  })

  it('renders the message text', () => {
    render(<AnomalyBadge level="warning" message="Accuracy below 50%" />)
    expect(screen.getByText('Accuracy below 50%')).toBeInTheDocument()
  })
})
