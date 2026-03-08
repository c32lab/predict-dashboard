import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DirectionRadarChart } from '../../../components/accuracy/DirectionRadarChart'
import type { Validation } from '../../../types/predict'

function makeValidation(overrides: Partial<Validation> = {}): Validation {
  return {
    id: 1,
    prediction_id: 1,
    horizon: '1d',
    actual_change: 2.5,
    is_correct: 1,
    price_at_validation: 50000,
    validated_at: '2026-03-01T00:00:00Z',
    symbol: 'BTCUSDT',
    direction: 'LONG',
    trigger_event: 'etf_flow',
    price_at_prediction: 49000,
    confidence: 0.75,
    ...overrides,
  }
}

describe('DirectionRadarChart', () => {
  it('shows fallback when fewer than 3 patterns', () => {
    const validations = [
      makeValidation({ trigger_event: 'a' }),
      makeValidation({ trigger_event: 'b' }),
    ]
    render(<DirectionRadarChart validations={validations} />)
    expect(screen.getByText('Direction Comparison')).toBeInTheDocument()
    expect(screen.getByText(/Need at least 3 patterns/)).toBeInTheDocument()
  })

  it('shows fallback with empty validations', () => {
    render(<DirectionRadarChart validations={[]} />)
    expect(screen.getByText(/Need at least 3 patterns/)).toBeInTheDocument()
  })

  it('renders radar chart with sufficient data', () => {
    const validations = [
      makeValidation({ trigger_event: 'pattern_a', direction: 'LONG', is_correct: 1 }),
      makeValidation({ trigger_event: 'pattern_a', direction: 'SHORT', is_correct: 0 }),
      makeValidation({ trigger_event: 'pattern_b', direction: 'LONG', is_correct: 1 }),
      makeValidation({ trigger_event: 'pattern_b', direction: 'SHORT', is_correct: 1 }),
      makeValidation({ trigger_event: 'pattern_c', direction: 'LONG', is_correct: 0 }),
      makeValidation({ trigger_event: 'pattern_c', direction: 'SHORT', is_correct: 1 }),
    ]
    render(<DirectionRadarChart validations={validations} />)
    expect(screen.getByText('Direction Comparison')).toBeInTheDocument()
    // Chart should render (no fallback message)
    expect(screen.queryByText(/Need at least 3 patterns/)).not.toBeInTheDocument()
  })
})
