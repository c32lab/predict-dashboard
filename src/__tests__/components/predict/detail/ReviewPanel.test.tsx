import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewPanel } from '../../../../components/predict/detail/ReviewPanel'
import type { PredictionReviewResponse } from '../../../../types/predict'

function makeReview(overrides: Partial<PredictionReviewResponse> = {}): PredictionReviewResponse {
  return {
    prediction_id: 1,
    status: 'completed',
    prediction: {
      direction: 'LONG',
      confidence: 0.85,
      symbol: 'BTC/USDT',
      timestamp: '2026-03-06T09:00:00Z',
    },
    validation: {
      horizon: '1d',
      is_correct: true,
      actual_price_change_pct: 3.25,
      validated_at: '2026-03-07T09:00:00Z',
    },
    review: {
      outcome_summary: 'Price moved in predicted direction',
      accuracy_context: 'Pattern has 70% historical accuracy',
      review_text: JSON.stringify({
        outcome: 'Correct prediction',
        prediction_recap: 'Predicted LONG based on whale accumulation',
        actual_result: 'Price rose 3.25%',
        lessons: ['Whale signals remain reliable', 'Macro alignment amplified the move'],
        pattern_context: 'Similar events produced 4% avg moves',
      }),
    },
    ...overrides,
  }
}

describe('ReviewPanel', () => {
  it('renders postmortem heading', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText('Postmortem Review')).toBeInTheDocument()
  })

  it('renders correct badge for correct prediction', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText('Correct')).toBeInTheDocument()
  })

  it('renders incorrect badge for incorrect prediction', () => {
    render(<ReviewPanel data={makeReview({
      validation: { horizon: '1d', is_correct: false, actual_price_change_pct: -2.5, validated_at: '2026-03-07T09:00:00Z' },
    })} />)
    expect(screen.getByText('Incorrect')).toBeInTheDocument()
  })

  it('renders actual price change with correct sign', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText('+3.25%')).toBeInTheDocument()
  })

  it('renders negative price change', () => {
    render(<ReviewPanel data={makeReview({
      validation: { horizon: '1d', is_correct: false, actual_price_change_pct: -2.5, validated_at: '2026-03-07T09:00:00Z' },
    })} />)
    expect(screen.getByText('-2.50%')).toBeInTheDocument()
  })

  it('renders outcome summary', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText('Price moved in predicted direction')).toBeInTheDocument()
  })

  it('renders accuracy context', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText('Pattern has 70% historical accuracy')).toBeInTheDocument()
  })

  it('renders lessons from parsed review_text', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText('Lessons Learned')).toBeInTheDocument()
    expect(screen.getByText('Whale signals remain reliable')).toBeInTheDocument()
    expect(screen.getByText('Macro alignment amplified the move')).toBeInTheDocument()
  })

  it('renders predicted direction and confidence', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('(85%)')).toBeInTheDocument()
  })

  it('renders horizon in validation summary', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText(/1d/)).toBeInTheDocument()
  })

  it('handles unparseable review_text gracefully', () => {
    render(<ReviewPanel data={makeReview({
      review: {
        outcome_summary: 'Summary here',
        accuracy_context: 'Context here',
        review_text: 'not valid json',
      },
    })} />)
    // Should show raw text fallback
    expect(screen.getByText('not valid json')).toBeInTheDocument()
  })

  it('renders pattern context from parsed review', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText('Pattern Context')).toBeInTheDocument()
    expect(screen.getByText('Similar events produced 4% avg moves')).toBeInTheDocument()
  })

  it('renders prediction recap from parsed review', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText('Prediction Recap')).toBeInTheDocument()
    expect(screen.getByText(/Predicted LONG based on whale/)).toBeInTheDocument()
  })

  it('renders actual result from parsed review', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText('Actual Result')).toBeInTheDocument()
    expect(screen.getByText(/Price rose 3.25%/)).toBeInTheDocument()
  })

  it('renders status field', () => {
    render(<ReviewPanel data={makeReview()} />)
    expect(screen.getByText('completed')).toBeInTheDocument()
  })
})
