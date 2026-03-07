import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    ScatterChart: ({ children }: { children: React.ReactNode }) => <div data-testid="scatter-chart">{children}</div>,
    Scatter: ({ children }: { children: React.ReactNode }) => <div data-testid="scatter">{children}</div>,
    Cell: () => <div data-testid="cell" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    ZAxis: () => <div data-testid="z-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
  }
})

import { SweepSection } from '../../../components/backtest/SweepSection'
import type { BaselineResults } from '../../../types/backtest'

const mockSweep: BaselineResults['parameter_sweep'] = {
  sweep_grid: '3x6',
  confidence_thresholds: [0.5, 0.6, 0.7],
  direction_thresholds_pct: [1, 2, 3, 4, 5, 6],
  results: [
    {
      confidence_threshold: 0.5,
      direction_threshold_pct: 1,
      horizons: {},
      avg_accuracy_pct: 45,
      avg_coverage_pct: 60,
      composite_score: 52,
    },
    {
      confidence_threshold: 0.6,
      direction_threshold_pct: 2,
      horizons: {},
      avg_accuracy_pct: 55,
      avg_coverage_pct: 50,
      composite_score: 53,
    },
    {
      confidence_threshold: 0.7,
      direction_threshold_pct: 3,
      horizons: {},
      avg_accuracy_pct: 65,
      avg_coverage_pct: 30,
      composite_score: 48,
    },
  ],
  best_params: {
    confidence_threshold: 0.6,
    direction_threshold_pct: 2,
    horizons: {},
    avg_accuracy_pct: 55,
    avg_coverage_pct: 50,
    composite_score: 53,
  },
}

describe('SweepSection', () => {
  it('renders the section title', () => {
    render(<SweepSection sweep={mockSweep} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Parameter Sweep (18 combos)')
  })

  it('renders best params summary', () => {
    render(<SweepSection sweep={mockSweep} />)
    expect(screen.getByText(/accuracy=55%/)).toBeInTheDocument()
    expect(screen.getByText(/coverage=50%/)).toBeInTheDocument()
    expect(screen.getByText(/composite=53/)).toBeInTheDocument()
  })

  it('renders a scatter chart', () => {
    render(<SweepSection sweep={mockSweep} />)
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument()
    expect(screen.getByTestId('scatter')).toBeInTheDocument()
  })

  it('renders table with all sweep results', () => {
    render(<SweepSection sweep={mockSweep} />)
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
    expect(screen.getByText('65%')).toBeInTheDocument()
  })

  it('highlights best params row', () => {
    const { container } = render(<SweepSection sweep={mockSweep} />)
    const bestRow = container.querySelector('tr.bg-amber-950\\/30')
    expect(bestRow).toBeInTheDocument()
  })

  it('renders cells for scatter points', () => {
    render(<SweepSection sweep={mockSweep} />)
    const cells = screen.getAllByTestId('cell')
    expect(cells).toHaveLength(3)
  })
})
