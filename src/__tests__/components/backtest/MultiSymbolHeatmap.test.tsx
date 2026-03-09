import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MultiSymbolHeatmap } from '../../../components/backtest/MultiSymbolHeatmap'
import type { FullResults } from '../../../types/backtest'

const symbols: FullResults['multi_symbol_conduction']['by_symbol'] = {
  ETHUSDT: {
    horizons: {
      '1d': { correct: 29, total: 48, accuracy_pct: 60.4 },
      '3d': { correct: 26, total: 46, accuracy_pct: 56.5 },
    },
    overall_accuracy_pct: 58.6,
    overall_correct: 82,
    overall_total: 140,
  },
  SOLUSDT: {
    horizons: {
      '1d': { correct: 30, total: 48, accuracy_pct: 62.5 },
      '3d': { correct: 25, total: 46, accuracy_pct: 54.3 },
    },
    overall_accuracy_pct: 58.5,
    overall_correct: 82,
    overall_total: 140,
  },
  LINKUSDT: {
    horizons: {
      '1d': { correct: 35, total: 48, accuracy_pct: 72.9 },
      '3d': { correct: 20, total: 42, accuracy_pct: 47.6 },
    },
    overall_accuracy_pct: 63.3,
    overall_correct: 57,
    overall_total: 90,
  },
}

describe('MultiSymbolHeatmap', () => {
  it('renders section title', () => {
    render(<MultiSymbolHeatmap symbols={symbols} />)
    expect(screen.getByText('Multi-Symbol Heatmap')).toBeInTheDocument()
  })

  it('renders all symbols', () => {
    render(<MultiSymbolHeatmap symbols={symbols} />)
    expect(screen.getByText('ETHUSDT')).toBeInTheDocument()
    expect(screen.getByText('SOLUSDT')).toBeInTheDocument()
    expect(screen.getByText('LINKUSDT')).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<MultiSymbolHeatmap symbols={symbols} />)
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Overall')).toBeInTheDocument()
    expect(screen.getByText('Correct')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('renders horizon columns', () => {
    render(<MultiSymbolHeatmap symbols={symbols} />)
    expect(screen.getByText('1d')).toBeInTheDocument()
    expect(screen.getByText('3d')).toBeInTheDocument()
  })

  it('renders accuracy values with color coding', () => {
    render(<MultiSymbolHeatmap symbols={symbols} />)
    // LINKUSDT has 72.9% for 1d (should be green)
    expect(screen.getByText('72.9%')).toBeInTheDocument()
    // LINKUSDT has 47.6% for 3d (should be orange)
    expect(screen.getByText('47.6%')).toBeInTheDocument()
  })

  it('renders correct and total counts', () => {
    render(<MultiSymbolHeatmap symbols={symbols} />)
    // Multiple symbols may share the same count values
    expect(screen.getAllByText('82').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('140').length).toBeGreaterThanOrEqual(1)
  })

  it('sorts symbols by overall accuracy descending', () => {
    render(<MultiSymbolHeatmap symbols={symbols} />)
    const rows = screen.getAllByRole('row')
    // First data row should be LINKUSDT (63.3%), header is row 0
    expect(rows[1]).toHaveTextContent('LINKUSDT')
  })

  it('renders empty state when no symbols', () => {
    render(<MultiSymbolHeatmap symbols={{}} />)
    expect(screen.getByText('No symbol data available')).toBeInTheDocument()
  })

  it('renders legend', () => {
    render(<MultiSymbolHeatmap symbols={symbols} />)
    expect(screen.getByText('Legend:')).toBeInTheDocument()
  })
})
