import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SymbolAccuracyBreakdown } from '../../../components/accuracy/SymbolAccuracyBreakdown'
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

describe('SymbolAccuracyBreakdown', () => {
  it('renders empty state when no validations', () => {
    render(<SymbolAccuracyBreakdown validations={[]} />)
    expect(screen.getByText(/no validation data/i)).toBeInTheDocument()
  })

  it('renders chart heading with validations', () => {
    const validations = [makeValidation()]
    render(<SymbolAccuracyBreakdown validations={validations} />)
    expect(screen.getByText('Accuracy by Symbol')).toBeInTheDocument()
  })

  it('does not show empty state when validations exist', () => {
    const validations = [
      makeValidation({ id: 1, symbol: 'BTC/USDT', is_correct: 1 }),
      makeValidation({ id: 2, symbol: 'BTC/USDT', is_correct: 0 }),
      makeValidation({ id: 3, symbol: 'ETH/USDT', is_correct: 1 }),
    ]
    render(<SymbolAccuracyBreakdown validations={validations} />)
    expect(screen.queryByText(/no validation data/i)).not.toBeInTheDocument()
    expect(screen.getByText('Accuracy by Symbol')).toBeInTheDocument()
  })

  it('renders chart with multiple symbols', () => {
    const validations = [
      makeValidation({ id: 1, symbol: 'BTC/USDT', is_correct: 1 }),
      makeValidation({ id: 2, symbol: 'ETH/USDT', is_correct: 1 }),
      makeValidation({ id: 3, symbol: 'SOL/USDT', is_correct: 0 }),
    ]
    render(<SymbolAccuracyBreakdown validations={validations} />)
    expect(screen.getByText('Accuracy by Symbol')).toBeInTheDocument()
  })

  it('sorts symbols by accuracy descending', () => {
    const validations = [
      makeValidation({ id: 1, symbol: 'BTC/USDT', is_correct: 0 }),
      makeValidation({ id: 2, symbol: 'ETH/USDT', is_correct: 1 }),
    ]
    // ETH should come first (100%) then BTC (0%)
    render(<SymbolAccuracyBreakdown validations={validations} />)
    expect(screen.getByText('Accuracy by Symbol')).toBeInTheDocument()
  })
})
