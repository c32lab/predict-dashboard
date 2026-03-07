import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DetailHeaderCard } from '../../../../components/predict/detail/DetailHeaderCard'
import type { PredictionDetail } from '../../../../types/predict'

function makeDetail(overrides: Partial<PredictionDetail> = {}): PredictionDetail {
  return {
    id: 1,
    timestamp: '2026-03-06T10:00:00Z',
    symbol: 'BTC/USDT',
    direction: 'LONG',
    confidence: 0.82,
    trigger_event: 'whale_accumulation',
    trigger_pattern: 'accumulation',
    expected_impact: 3.5,
    expected_horizon: '1d',
    price_at_prediction: 65000,
    macro_score: 72,
    fear_greed: 60,
    reasoning: 'Strong buy signal detected',
    status: 'active',
    created_at: '2026-03-06T10:00:00Z',
    trigger_event_text: 'Whale accumulation detected on-chain',
    matched_events: [],
    reasoning_chain: [],
    confidence_factors: {},
    ...overrides,
  }
}

describe('DetailHeaderCard', () => {
  it('renders symbol and direction', () => {
    render(<DetailHeaderCard data={makeDetail()} />)
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('LONG')).toBeInTheDocument()
  })

  it('renders confidence multiplied by 100', () => {
    render(<DetailHeaderCard data={makeDetail({ confidence: 0.82 })} />)
    expect(screen.getByText('82%')).toBeInTheDocument()
  })

  it('renders trigger event text', () => {
    render(<DetailHeaderCard data={makeDetail()} />)
    expect(screen.getByText('Whale accumulation detected on-chain')).toBeInTheDocument()
  })

  it('renders reasoning when present', () => {
    render(<DetailHeaderCard data={makeDetail({ reasoning: 'Strong buy signal detected' })} />)
    expect(screen.getByText('Strong buy signal detected')).toBeInTheDocument()
  })

  it('hides trigger event section when empty', () => {
    render(<DetailHeaderCard data={makeDetail({ trigger_event_text: '' })} />)
    expect(screen.queryByText('Trigger Event')).not.toBeInTheDocument()
  })

  it('hides reasoning section when empty', () => {
    render(<DetailHeaderCard data={makeDetail({ reasoning: '' })} />)
    expect(screen.queryByText('Reasoning')).not.toBeInTheDocument()
  })
})
