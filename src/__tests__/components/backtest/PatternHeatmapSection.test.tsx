import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PatternHeatmapSection } from '../../../components/backtest/PatternHeatmapSection'
import type { AccuracyBucket } from '../../../types/backtest'

const patterns: Record<string, AccuracyBucket> = {
  'momentum_breakout': { correct: 8, total: 10, accuracy_pct: 80 },
  'mean_reversion': { correct: 3, total: 6, accuracy_pct: 50 },
  'weak_signal': { correct: 1, total: 5, accuracy_pct: 20 },
}

describe('PatternHeatmapSection', () => {
  it('renders all pattern names', () => {
    render(<PatternHeatmapSection patterns={patterns} />)
    expect(screen.getByText('momentum_breakout')).toBeInTheDocument()
    expect(screen.getByText('mean_reversion')).toBeInTheDocument()
    expect(screen.getByText('weak_signal')).toBeInTheDocument()
  })

  it('renders correct/total and accuracy_pct', () => {
    render(<PatternHeatmapSection patterns={patterns} />)
    expect(screen.getByText('8/10')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('3/6')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('sorts patterns by accuracy descending', () => {
    const { container } = render(<PatternHeatmapSection patterns={patterns} />)
    const names = Array.from(container.querySelectorAll('.font-mono')).map(el => el.textContent)
    expect(names).toEqual(['momentum_breakout', 'mean_reversion', 'weak_signal'])
  })

  it('renders section title', () => {
    render(<PatternHeatmapSection patterns={patterns} />)
    expect(screen.getByText('Pattern Accuracy Heatmap')).toBeInTheDocument()
  })
})
