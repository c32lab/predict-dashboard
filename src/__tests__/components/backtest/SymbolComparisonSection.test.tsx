import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => <div data-testid="bar-chart" data-count={data.length}>{children}</div>,
    Bar: ({ dataKey }: { dataKey: string }) => <div data-testid={`bar-${dataKey}`} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
  }
})

import { SymbolComparisonSection } from '../../../components/backtest/SymbolComparisonSection'
import type { FullResults } from '../../../types/backtest'

type BySymbol = FullResults['multi_symbol_conduction']['by_symbol']

const mockSymbols: BySymbol = {
  BTC: {
    horizons: {
      '1d': { correct: 30, total: 50, accuracy_pct: 60 },
      '3d': { correct: 25, total: 50, accuracy_pct: 50 },
    },
    overall_accuracy_pct: 55,
    overall_correct: 55,
    overall_total: 100,
  },
  ETH: {
    horizons: {
      '1d': { correct: 35, total: 50, accuracy_pct: 70 },
      '3d': { correct: 30, total: 50, accuracy_pct: 60 },
    },
    overall_accuracy_pct: 65,
    overall_correct: 65,
    overall_total: 100,
  },
}

describe('SymbolComparisonSection', () => {
  it('renders the section title', () => {
    render(<SymbolComparisonSection symbols={mockSymbols} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Multi-Symbol Comparison')
  })

  it('renders a horizontal bar chart', () => {
    render(<SymbolComparisonSection symbols={mockSymbols} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('sorts symbols by overall accuracy descending', () => {
    render(<SymbolComparisonSection symbols={mockSymbols} />)
    // ETH (65%) should come before BTC (55%)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-count', '2')
  })

  it('renders bars for each horizon key', () => {
    render(<SymbolComparisonSection symbols={mockSymbols} />)
    expect(screen.getByTestId('bar-1d')).toBeInTheDocument()
    expect(screen.getByTestId('bar-3d')).toBeInTheDocument()
  })

  it('handles empty symbols', () => {
    render(<SymbolComparisonSection symbols={{}} />)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-count', '0')
  })

  it('handles single symbol', () => {
    const single: BySymbol = {
      SOL: {
        horizons: { '1d': { correct: 5, total: 10, accuracy_pct: 50 } },
        overall_accuracy_pct: 50,
        overall_correct: 5,
        overall_total: 10,
      },
    }
    render(<SymbolComparisonSection symbols={single} />)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-count', '1')
    expect(screen.getByTestId('bar-1d')).toBeInTheDocument()
  })
})
