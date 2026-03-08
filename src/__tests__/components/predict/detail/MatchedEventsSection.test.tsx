import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MatchedEventsSection } from '../../../../components/predict/detail/MatchedEventsSection'
import type { MatchedEvent } from '../../../../types/predict'

function makeEvent(overrides: Partial<MatchedEvent> = {}): MatchedEvent {
  return {
    event_id: 1,
    date: '2026-03-01T12:00:00Z',
    event: 'Major exchange inflow spike',
    symbol: 'BTC/USDT',
    price_change: -2.35,
    similarity: 0.876,
    ...overrides,
  }
}

describe('MatchedEventsSection', () => {
  it('shows empty state for empty events', () => {
    render(<MatchedEventsSection events={[]} />)
    expect(screen.getByText('No matched events found')).toBeInTheDocument()
  })

  it('shows empty state for undefined events', () => {
    render(<MatchedEventsSection events={undefined as unknown as MatchedEvent[]} />)
    expect(screen.getByText('No matched events found')).toBeInTheDocument()
  })

  it('renders heading with event count', () => {
    render(<MatchedEventsSection events={[makeEvent()]} />)
    expect(screen.getByText('Matched Events')).toBeInTheDocument()
    expect(screen.getByText('(1)')).toBeInTheDocument()
  })

  it('renders event details in table', () => {
    render(<MatchedEventsSection events={[makeEvent()]} />)
    expect(screen.getByText('Major exchange inflow spike')).toBeInTheDocument()
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
  })

  it('displays price_change without x100', () => {
    render(<MatchedEventsSection events={[makeEvent({ price_change: -2.35 })]} />)
    expect(screen.getByText('-2.35%')).toBeInTheDocument()
  })

  it('displays similarity multiplied by 100', () => {
    render(<MatchedEventsSection events={[makeEvent({ similarity: 0.876 })]} />)
    expect(screen.getByText('87.6%')).toBeInTheDocument()
  })
})
