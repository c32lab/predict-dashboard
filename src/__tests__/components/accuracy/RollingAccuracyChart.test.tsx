import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RollingAccuracyChart } from '../../../components/accuracy/RollingAccuracyChart'
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

describe('RollingAccuracyChart', () => {
  it('shows fallback with empty validations', () => {
    render(<RollingAccuracyChart validations={[]} />)
    expect(screen.getByText(/Rolling 7-Day Accuracy/)).toBeInTheDocument()
    expect(screen.getByText(/Not enough data/)).toBeInTheDocument()
  })

  it('shows fallback with only one date', () => {
    const validations = [makeValidation({ validated_at: '2026-03-01T00:00:00Z' })]
    render(<RollingAccuracyChart validations={validations} />)
    expect(screen.getByText(/Not enough data/)).toBeInTheDocument()
  })

  it('renders chart with sufficient data', () => {
    const validations = [
      makeValidation({ validated_at: '2026-03-01T00:00:00Z', is_correct: 1 }),
      makeValidation({ validated_at: '2026-03-02T00:00:00Z', is_correct: 0 }),
      makeValidation({ validated_at: '2026-03-03T00:00:00Z', is_correct: 1 }),
    ]
    render(<RollingAccuracyChart validations={validations} />)
    expect(screen.getByText(/Rolling 7-Day Accuracy/)).toBeInTheDocument()
    expect(screen.queryByText(/Not enough data/)).not.toBeInTheDocument()
  })

  it('uses custom window', () => {
    const validations = [
      makeValidation({ validated_at: '2026-03-01T00:00:00Z', is_correct: 1 }),
      makeValidation({ validated_at: '2026-03-02T00:00:00Z', is_correct: 0 }),
    ]
    render(<RollingAccuracyChart validations={validations} windowDays={3} />)
    expect(screen.getByText(/Rolling 3-Day Accuracy/)).toBeInTheDocument()
  })
})
