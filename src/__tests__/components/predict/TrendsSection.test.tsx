import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrendsSection } from '../../../components/predict/TrendsSection'
import type { Trend } from '../../../types/predict'

function makeTrend(overrides: Partial<Trend> = {}): Trend {
  return {
    pattern_name: 'Whale Dump',
    event_count: 5,
    avg_impact: 3.2,
    symbols: ['BTC/USDT', 'ETH/USDT'],
    latest_date: '2026-03-06',
    window_hours: 72,
    ...overrides,
  }
}

describe('TrendsSection', () => {
  it('renders empty state when no trends', () => {
    render(<TrendsSection trends={[]} />)
    expect(screen.getByText('No trends discovered yet')).toBeInTheDocument()
  })

  it('renders trend cards', () => {
    render(<TrendsSection trends={[makeTrend()]} />)
    expect(screen.getByText('Whale Dump')).toBeInTheDocument()
  })

  it('shows event count', () => {
    render(<TrendsSection trends={[makeTrend({ event_count: 10 })]} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows avg impact directly (already_pct)', () => {
    render(<TrendsSection trends={[makeTrend({ avg_impact: 4.5 })]} />)
    expect(screen.getByText('4.5%')).toBeInTheDocument()
  })

  it('shows dash when avg_impact is null', () => {
    render(<TrendsSection trends={[makeTrend({ avg_impact: null as unknown as number })]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders symbol badges', () => {
    render(<TrendsSection trends={[makeTrend({ symbols: ['BTC/USDT', 'SOL/USDT'] })]} />)
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('SOL/USDT')).toBeInTheDocument()
  })

  it('shows latest date', () => {
    render(<TrendsSection trends={[makeTrend({ latest_date: '2026-03-01' })]} />)
    expect(screen.getByText(/2026-03-01/)).toBeInTheDocument()
  })

  it('renders multiple trends', () => {
    const trends = [
      makeTrend({ pattern_name: 'Pattern A' }),
      makeTrend({ pattern_name: 'Pattern B' }),
    ]
    render(<TrendsSection trends={trends} />)
    expect(screen.getByText('Pattern A')).toBeInTheDocument()
    expect(screen.getByText('Pattern B')).toBeInTheDocument()
  })
})
