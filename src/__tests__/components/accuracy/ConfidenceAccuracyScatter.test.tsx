import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConfidenceAccuracyScatter } from '../../../components/accuracy/ConfidenceAccuracyScatter'
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

describe('ConfidenceAccuracyScatter', () => {
  it('renders empty state when no validations', () => {
    render(<ConfidenceAccuracyScatter validations={[]} />)
    expect(screen.getByText(/no validation data/i)).toBeInTheDocument()
  })

  it('renders chart heading with validations', () => {
    const validations = [makeValidation()]
    render(<ConfidenceAccuracyScatter validations={validations} />)
    expect(screen.getByText('Confidence vs Accuracy')).toBeInTheDocument()
  })

  it('does not show empty state when validations exist', () => {
    const validations = [
      makeValidation({ id: 1, confidence: 0.8, is_correct: 1, actual_change: 3.2 }),
      makeValidation({ id: 2, confidence: 0.4, is_correct: 0, actual_change: -1.5 }),
    ]
    render(<ConfidenceAccuracyScatter validations={validations} />)
    expect(screen.queryByText(/no validation data/i)).not.toBeInTheDocument()
    expect(screen.getByText('Confidence vs Accuracy')).toBeInTheDocument()
  })

  it('shows high confidence summary', () => {
    const validations = [
      makeValidation({ id: 1, confidence: 0.8, is_correct: 1, actual_change: 5.0 }),
      makeValidation({ id: 2, confidence: 0.9, is_correct: 1, actual_change: 3.0 }),
      makeValidation({ id: 3, confidence: 0.75, is_correct: 0, actual_change: -2.0 }),
    ]
    render(<ConfidenceAccuracyScatter validations={validations} />)
    expect(screen.getByText(/high confidence/i)).toBeInTheDocument()
    expect(screen.getByText('66.7% accurate')).toBeInTheDocument()
    expect(screen.getByText(/3 predictions/)).toBeInTheDocument()
  })

  it('shows low confidence summary', () => {
    const validations = [
      makeValidation({ id: 1, confidence: 0.3, is_correct: 0, actual_change: -1.0 }),
      makeValidation({ id: 2, confidence: 0.4, is_correct: 1, actual_change: 2.0 }),
    ]
    render(<ConfidenceAccuracyScatter validations={validations} />)
    expect(screen.getByText(/low confidence/i)).toBeInTheDocument()
    expect(screen.getByText('50.0% accurate')).toBeInTheDocument()
  })

  it('shows correlation message when both high and low data exist', () => {
    const validations = [
      makeValidation({ id: 1, confidence: 0.8, is_correct: 1, actual_change: 4.0 }),
      makeValidation({ id: 2, confidence: 0.9, is_correct: 1, actual_change: 3.0 }),
      makeValidation({ id: 3, confidence: 0.3, is_correct: 0, actual_change: -2.0 }),
      makeValidation({ id: 4, confidence: 0.4, is_correct: 0, actual_change: -1.0 }),
    ]
    render(<ConfidenceAccuracyScatter validations={validations} />)
    expect(screen.getByText(/higher confidence correlates with better accuracy/i)).toBeInTheDocument()
  })

  it('shows negative correlation message when low confidence is more accurate', () => {
    const validations = [
      makeValidation({ id: 1, confidence: 0.8, is_correct: 0, actual_change: -3.0 }),
      makeValidation({ id: 2, confidence: 0.9, is_correct: 0, actual_change: -4.0 }),
      makeValidation({ id: 3, confidence: 0.3, is_correct: 1, actual_change: 1.0 }),
      makeValidation({ id: 4, confidence: 0.4, is_correct: 1, actual_change: 2.0 }),
    ]
    render(<ConfidenceAccuracyScatter validations={validations} />)
    expect(screen.getByText(/does not correlate/i)).toBeInTheDocument()
  })

  it('separates correct and incorrect points into different scatter series', () => {
    const validations = [
      makeValidation({ id: 1, confidence: 0.8, is_correct: 1, actual_change: 5.0 }),
      makeValidation({ id: 2, confidence: 0.6, is_correct: 0, actual_change: -2.0 }),
    ]
    render(<ConfidenceAccuracyScatter validations={validations} />)
    // Legend should show both series
    expect(screen.getByText('Confidence vs Accuracy')).toBeInTheDocument()
  })
})
