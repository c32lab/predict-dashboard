import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PatternCard } from '../../../components/predict/PatternCard'
import type { Pattern } from '../../../types/predict'

function makePattern(overrides: Partial<Pattern> = {}): Pattern {
  return {
    id: 1,
    name: 'Whale Accumulation',
    direction: 'UP',
    avg_impact: 3.5,
    base_level: 2,
    keywords: ['whale', 'accumulation'],
    boost_keywords: ['large'],
    example_dates: ['2026-01-01', '2026-01-15', '2026-02-01', '2026-02-15'],
    notes: '',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  }
}

describe('PatternCard', () => {
  it('renders pattern name', () => {
    render(<PatternCard pattern={makePattern()} />)
    expect(screen.getByText('Whale Accumulation')).toBeInTheDocument()
  })

  it('renders direction badge with UP/LONG as green', () => {
    render(<PatternCard pattern={makePattern({ direction: 'UP' })} />)
    const badge = screen.getByText('UP')
    expect(badge.className).toContain('bg-green-900')
  })

  it('renders direction badge with DOWN as red', () => {
    render(<PatternCard pattern={makePattern({ direction: 'DOWN' })} />)
    const badge = screen.getByText('DOWN')
    expect(badge.className).toContain('bg-red-900')
  })

  it('renders avg_impact directly (already_pct)', () => {
    render(<PatternCard pattern={makePattern({ avg_impact: 3.5 })} />)
    expect(screen.getByText('3.5%')).toBeInTheDocument()
  })

  it('renders dash when avg_impact is null', () => {
    render(<PatternCard pattern={makePattern({ avg_impact: null as unknown as number })} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders base level', () => {
    render(<PatternCard pattern={makePattern({ base_level: 5 })} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows max 3 example dates', () => {
    render(<PatternCard pattern={makePattern()} />)
    expect(screen.getByText(/2026-01-01, 2026-01-15, 2026-02-01/)).toBeInTheDocument()
    expect(screen.queryByText(/2026-02-15/)).toBeNull()
  })

  it('hides examples section when empty', () => {
    render(<PatternCard pattern={makePattern({ example_dates: [] })} />)
    expect(screen.queryByText('Examples:')).toBeNull()
  })
})
