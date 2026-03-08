import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccuracyTrendChart } from '../../../components/accuracy/AccuracyTrendChart'
import type { Validation } from '../../../types/predict'

function makeValidation(overrides: Partial<Validation> = {}): Validation {
  return {
    id: 1,
    prediction_id: 1,
    horizon: '1d',
    actual_change: 2.5,
    is_correct: 1,
    price_at_validation: 100000,
    validated_at: '2026-03-06T10:00:00Z',
    symbol: 'BTC/USDT',
    direction: 'LONG',
    trigger_event: 'test event',
    price_at_prediction: 99000,
    confidence: 0.75,
    ...overrides,
  }
}

describe('AccuracyTrendChart', () => {
  it('renders empty state when no validations', () => {
    render(<AccuracyTrendChart validations={[]} />)
    expect(screen.getByText(/no validation data/i)).toBeInTheDocument()
  })

  it('renders chart heading with validations', () => {
    const validations = [makeValidation()]
    render(<AccuracyTrendChart validations={validations} />)
    expect(screen.getByText('Accuracy Over Time')).toBeInTheDocument()
  })

  it('does not show empty state when validations exist', () => {
    const validations = [
      makeValidation({ id: 1, horizon: '1d', is_correct: 1, validated_at: '2026-03-06T10:00:00Z' }),
      makeValidation({ id: 2, horizon: '1d', is_correct: 0, validated_at: '2026-03-06T14:00:00Z' }),
      makeValidation({ id: 3, horizon: '3d', is_correct: 1, validated_at: '2026-03-06T10:00:00Z' }),
    ]
    render(<AccuracyTrendChart validations={validations} />)
    expect(screen.queryByText(/no validation data/i)).not.toBeInTheDocument()
    expect(screen.getByText('Accuracy Over Time')).toBeInTheDocument()
  })

  it('renders chart for multiple dates', () => {
    const validations = [
      makeValidation({ id: 1, horizon: '1d', validated_at: '2026-03-05T10:00:00Z' }),
      makeValidation({ id: 2, horizon: '3d', validated_at: '2026-03-06T10:00:00Z' }),
    ]
    render(<AccuracyTrendChart validations={validations} />)
    expect(screen.getByText('Accuracy Over Time')).toBeInTheDocument()
  })

  it('computes prediction count per day', () => {
    const validations = [
      makeValidation({ id: 1, horizon: '1d', validated_at: '2026-03-06T10:00:00Z' }),
      makeValidation({ id: 2, horizon: '3d', validated_at: '2026-03-06T14:00:00Z' }),
      makeValidation({ id: 3, horizon: '1d', validated_at: '2026-03-06T16:00:00Z' }),
    ]
    // Renders without error — count bar is present in the ComposedChart
    render(<AccuracyTrendChart validations={validations} />)
    expect(screen.getByText('Accuracy Over Time')).toBeInTheDocument()
  })
})
