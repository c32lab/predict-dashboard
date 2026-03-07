import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({ dataKey }: { dataKey: string }) => <div data-testid={`bar-${dataKey}`} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
  }
})

import { ABSection } from '../../../components/backtest/ABSection'
import type { ABResults } from '../../../types/backtest'

const mockAB: ABResults = {
  generated_at: '2025-01-01',
  total_events: 100,
  skipped_no_model: 5,
  skipped_no_price: 3,
  strategy_descriptions: {
    baseline: 'Default prediction strategy',
    enhanced: 'Enhanced with chain analysis',
  },
  summary: {
    baseline: {
      horizons: {
        '1d': { correct: 30, total: 50, accuracy_pct: 60, neutral_skipped: 2 },
        '3d': { correct: 25, total: 50, accuracy_pct: 50 },
        '7d': { correct: 20, total: 50, accuracy_pct: 40 },
      },
    },
    enhanced: {
      horizons: {
        '1d': { correct: 35, total: 50, accuracy_pct: 70 },
        '3d': { correct: 30, total: 50, accuracy_pct: 60 },
        '7d': { correct: 25, total: 50, accuracy_pct: 50 },
      },
    },
  },
}

describe('ABSection', () => {
  it('renders the section title', () => {
    render(<ABSection ab={mockAB} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('A/B Strategy Comparison')
  })

  it('renders a bar chart with horizon bars', () => {
    render(<ABSection ab={mockAB} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-1d')).toBeInTheDocument()
    expect(screen.getByTestId('bar-3d')).toBeInTheDocument()
    expect(screen.getByTestId('bar-7d')).toBeInTheDocument()
  })

  it('renders strategy rows in the table', () => {
    render(<ABSection ab={mockAB} />)
    expect(screen.getByText('baseline')).toBeInTheDocument()
    expect(screen.getByText('enhanced')).toBeInTheDocument()
  })

  it('marks the best strategy', () => {
    render(<ABSection ab={mockAB} />)
    expect(screen.getByText('best')).toBeInTheDocument()
  })

  it('shows accuracy percentages in table', () => {
    render(<ABSection ab={mockAB} />)
    expect(screen.getByText('70%')).toBeInTheDocument()
    // 60% appears multiple times (baseline 1d and enhanced 3d), verify at least one exists
    expect(screen.getAllByText('60%').length).toBeGreaterThanOrEqual(1)
  })

  it('shows neutral skipped count', () => {
    render(<ABSection ab={mockAB} />)
    expect(screen.getByText('(+2 skip)')).toBeInTheDocument()
  })

  it('toggles strategy descriptions on button click', () => {
    render(<ABSection ab={mockAB} />)
    expect(screen.queryByText('Default prediction strategy')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Show strategy descriptions'))
    expect(screen.getByText('Default prediction strategy')).toBeInTheDocument()
    expect(screen.getByText('Enhanced with chain analysis')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Hide strategy descriptions'))
    expect(screen.queryByText('Default prediction strategy')).not.toBeInTheDocument()
  })

  it('handles single strategy (no comparison)', () => {
    const single: ABResults = {
      ...mockAB,
      summary: {
        only_one: {
          horizons: {
            '1d': { correct: 10, total: 20, accuracy_pct: 50 },
            '3d': { correct: 8, total: 20, accuracy_pct: 40 },
            '7d': { correct: 6, total: 20, accuracy_pct: 30 },
          },
        },
      },
    }
    render(<ABSection ab={single} />)
    expect(screen.getByText('only_one')).toBeInTheDocument()
    expect(screen.getByText('best')).toBeInTheDocument()
  })

  it('shows dash for missing horizon data', () => {
    const partial: ABResults = {
      ...mockAB,
      summary: {
        test: {
          horizons: {
            '1d': { correct: 0, total: 0, accuracy_pct: 0 },
            '3d': { correct: 0, total: 0, accuracy_pct: 0 },
            '7d': { correct: 0, total: 0, accuracy_pct: 0 },
          },
        },
      },
    }
    render(<ABSection ab={partial} />)
    // total=0 means the cell shows '—'
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })
})
