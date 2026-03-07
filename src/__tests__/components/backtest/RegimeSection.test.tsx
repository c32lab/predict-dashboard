import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({ dataKey }: { dataKey: string }) => <div data-testid={`bar-${dataKey}`} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: ({ tickFormatter }: { tickFormatter?: (v: number) => string }) => <div data-testid="y-axis" data-fmt={tickFormatter?.(50)} />,
    Tooltip: ({ formatter }: { formatter?: (v: unknown) => unknown }) => <div data-testid="tooltip" data-fmt={String(formatter?.(75))} />,
    Legend: () => <div data-testid="legend" />,
  }
})

import { RegimeSection } from '../../../components/backtest/RegimeSection'

const mockRegimes = {
  bull: {
    count: 40,
    horizons: {
      '1d': { correct: 30, total: 40, accuracy_pct: 75 },
      '3d': { correct: 28, total: 40, accuracy_pct: 70 },
      '7d': { correct: 24, total: 40, accuracy_pct: 60 },
    },
  },
  bear: {
    count: 30,
    horizons: {
      '1d': { correct: 15, total: 30, accuracy_pct: 50 },
      '3d': { correct: 12, total: 30, accuracy_pct: 40 },
      '7d': { correct: 9, total: 30, accuracy_pct: 30 },
    },
  },
  sideways: {
    count: 20,
    horizons: {
      '1d': { correct: 10, total: 20, accuracy_pct: 50 },
      '3d': { correct: 0, total: 0, accuracy_pct: 0 },
      '7d': { correct: 0, total: 0, accuracy_pct: 0 },
    },
  },
}

describe('RegimeSection', () => {
  it('renders the section title', () => {
    render(<RegimeSection regimes={mockRegimes} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Regime Analysis (Decay Model)')
  })

  it('renders a bar chart with horizon bars', () => {
    render(<RegimeSection regimes={mockRegimes} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-1d')).toBeInTheDocument()
    expect(screen.getByTestId('bar-3d')).toBeInTheDocument()
    expect(screen.getByTestId('bar-7d')).toBeInTheDocument()
  })

  it('renders regime cards with names and counts', () => {
    render(<RegimeSection regimes={mockRegimes} />)
    expect(screen.getByText('bull')).toBeInTheDocument()
    expect(screen.getByText('(40 events)')).toBeInTheDocument()
    expect(screen.getByText('bear')).toBeInTheDocument()
    expect(screen.getByText('(30 events)')).toBeInTheDocument()
    expect(screen.getByText('sideways')).toBeInTheDocument()
    expect(screen.getByText('(20 events)')).toBeInTheDocument()
  })

  it('displays accuracy stats in regime cards', () => {
    render(<RegimeSection regimes={mockRegimes} />)
    expect(screen.getByText('75% (30/40)')).toBeInTheDocument()
    expect(screen.getByText('50% (15/30)')).toBeInTheDocument()
  })

  it('shows dash for zero-total horizons', () => {
    render(<RegimeSection regimes={mockRegimes} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(2)
  })

  it('renders with single regime', () => {
    const single = {
      bull: mockRegimes.bull,
    }
    render(<RegimeSection regimes={single} />)
    expect(screen.getByText('bull')).toBeInTheDocument()
    expect(screen.queryByText('bear')).not.toBeInTheDocument()
  })
})
