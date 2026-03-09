import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BullBearCycleView } from '../../../components/backtest/BullBearCycleView'
import type { FullResults } from '../../../types/backtest'

const data: FullResults['before_after_comparison'] = {
  before: {
    overall_accuracy_pct: 60.5, overall_correct: 95, overall_total: 157,
    total_predictions: 106,
    by_horizon: {
      '1d': { correct: 67, total: 97, accuracy_pct: 69.1 },
      '3d': { correct: 28, total: 60, accuracy_pct: 46.7 },
    },
    by_direction: {
      LONG: { correct: 81, total: 103, accuracy_pct: 78.6 },
      SHORT: { correct: 14, total: 54, accuracy_pct: 25.9 },
    },
    by_pattern: {},
  },
  after: {
    overall_accuracy_pct: 52.6, overall_correct: 30, overall_total: 57,
    total_predictions: 51,
    by_horizon: {
      '1d': { correct: 26, total: 42, accuracy_pct: 61.9 },
      '3d': { correct: 4, total: 15, accuracy_pct: 26.7 },
    },
    by_direction: {
      LONG: { correct: 17, total: 25, accuracy_pct: 68.0 },
      SHORT: { correct: 13, total: 32, accuracy_pct: 40.6 },
    },
    by_pattern: {},
  },
  delta: { accuracy_change_pp: -7.9, predictions_removed: 55, validations_removed: 100 },
}

describe('BullBearCycleView', () => {
  it('renders section title', () => {
    render(<BullBearCycleView data={data} />)
    expect(screen.getByText('Bull / Bear Cycle Comparison')).toBeInTheDocument()
  })

  it('renders before and after cards', () => {
    render(<BullBearCycleView data={data} />)
    expect(screen.getByText('Before Cleanup')).toBeInTheDocument()
    expect(screen.getByText('After Cleanup')).toBeInTheDocument()
  })

  it('renders overall accuracy for both sides', () => {
    render(<BullBearCycleView data={data} />)
    // Values appear in both the cards and the delta summary
    expect(screen.getAllByText('60.5%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('52.6%').length).toBeGreaterThanOrEqual(1)
  })

  it('renders prediction counts', () => {
    render(<BullBearCycleView data={data} />)
    expect(screen.getByText('106 predictions')).toBeInTheDocument()
    expect(screen.getByText('51 predictions')).toBeInTheDocument()
  })

  it('renders horizon breakdown', () => {
    render(<BullBearCycleView data={data} />)
    const items1d = screen.getAllByText('1d')
    expect(items1d.length).toBeGreaterThanOrEqual(2)
  })

  it('renders direction breakdown', () => {
    render(<BullBearCycleView data={data} />)
    const longItems = screen.getAllByText('LONG')
    expect(longItems.length).toBeGreaterThanOrEqual(2)
  })

  it('renders change summary with delta badges', () => {
    render(<BullBearCycleView data={data} />)
    expect(screen.getByText('Change Summary')).toBeInTheDocument()
    expect(screen.getByText('Overall Accuracy')).toBeInTheDocument()
  })

  it('renders removal stats', () => {
    render(<BullBearCycleView data={data} />)
    expect(screen.getByText(/55/)).toBeInTheDocument()
    expect(screen.getByText(/100/)).toBeInTheDocument()
  })

  it('renders negative delta with red styling', () => {
    render(<BullBearCycleView data={data} />)
    // The overall delta is -7.9pp, should show as red
    const badge = screen.getByText('-7.9pp')
    expect(badge.className).toContain('text-red-400')
  })

  it('renders positive delta with green styling', () => {
    const positiveData = {
      ...data,
      before: { ...data.before, overall_accuracy_pct: 50 },
      after: { ...data.after, overall_accuracy_pct: 60 },
    }
    render(<BullBearCycleView data={positiveData} />)
    const badge = screen.getByText('+10.0pp')
    expect(badge.className).toContain('text-green-400')
  })
})
