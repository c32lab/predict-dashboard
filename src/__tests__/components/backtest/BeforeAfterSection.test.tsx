import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BeforeAfterSection } from '../../../components/backtest/BeforeAfterSection'
import type { FullResults } from '../../../types/backtest'

const data: FullResults['before_after_comparison'] = {
  before: {
    overall_accuracy_pct: 60, overall_correct: 30, overall_total: 50,
    total_predictions: 55,
    by_horizon: { '24h': { correct: 15, total: 25, accuracy_pct: 60 } },
    by_direction: {}, by_pattern: {},
  },
  after: {
    overall_accuracy_pct: 75, overall_correct: 30, overall_total: 40,
    total_predictions: 45,
    by_horizon: { '24h': { correct: 18, total: 22, accuracy_pct: 81.8 } },
    by_direction: {}, by_pattern: {},
  },
  delta: { accuracy_change_pp: 15, predictions_removed: 10, validations_removed: 5 },
}

describe('BeforeAfterSection', () => {
  it('renders before and after accuracy', () => {
    render(<BeforeAfterSection data={data} />)
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders before and after correct counts', () => {
    render(<BeforeAfterSection data={data} />)
    expect(screen.getByText('30/50 correct')).toBeInTheDocument()
    expect(screen.getByText('30/40 correct')).toBeInTheDocument()
  })

  it('renders delta with positive sign', () => {
    render(<BeforeAfterSection data={data} />)
    expect(screen.getByText('+15pp')).toBeInTheDocument()
  })

  it('renders removal counts', () => {
    render(<BeforeAfterSection data={data} />)
    expect(screen.getByText('10 predictions removed')).toBeInTheDocument()
    expect(screen.getByText('5 validations removed')).toBeInTheDocument()
  })

  it('renders negative delta without plus sign', () => {
    const negData = {
      ...data,
      delta: { accuracy_change_pp: -3, predictions_removed: 2, validations_removed: 1 },
    }
    render(<BeforeAfterSection data={negData} />)
    expect(screen.getByText('-3pp')).toBeInTheDocument()
  })

  it('renders horizon breakdown rows', () => {
    render(<BeforeAfterSection data={data} />)
    expect(screen.getAllByText('24h')).toHaveLength(2)
  })
})
