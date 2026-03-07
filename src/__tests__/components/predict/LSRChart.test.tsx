import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { LongShortRatioPoint } from '../../../types/predict'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => <div data-testid="bar-chart" data-point-count={data.length}>{children}</div>,
    Bar: ({ dataKey, name }: { dataKey: string; name: string }) => <div data-testid={`bar-${dataKey}`}>{name}</div>,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
  }
})

import { LSRChart } from '../../../components/predict/LSRChart'

function makePoint(overrides: Partial<LongShortRatioPoint> = {}): LongShortRatioPoint {
  return {
    timestamp: 1709712000000,
    long_account: 0.55,
    short_account: 0.45,
    long_short_ratio: 1.22,
    ...overrides,
  }
}

describe('LSRChart', () => {
  it('shows loading state', () => {
    render(<LSRChart data={undefined} isLoading={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows no data message when data is undefined', () => {
    render(<LSRChart data={undefined} isLoading={false} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('shows no data message when data is empty array', () => {
    render(<LSRChart data={[]} isLoading={false} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders title "Long/Short Ratio"', () => {
    render(<LSRChart data={[makePoint()]} isLoading={false} />)
    expect(screen.getByText('Long/Short Ratio')).toBeInTheDocument()
  })

  it('displays latest long_short_ratio value formatted to 2 decimals', () => {
    const data = [
      makePoint({ timestamp: 1709712000000, long_short_ratio: 1.22 }),
      makePoint({ timestamp: 1709715600000, long_short_ratio: 1.35 }),
    ]
    render(<LSRChart data={data} isLoading={false} />)
    // Latest by timestamp is 1.35
    expect(screen.getByText('1.35')).toBeInTheDocument()
  })

  it('renders BarChart with correct number of data points', () => {
    const data = [
      makePoint({ timestamp: 1709712000000 }),
      makePoint({ timestamp: 1709715600000 }),
      makePoint({ timestamp: 1709719200000 }),
    ]
    render(<LSRChart data={data} isLoading={false} />)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-point-count', '3')
  })

  it('renders Long and Short bars', () => {
    render(<LSRChart data={[makePoint()]} isLoading={false} />)
    expect(screen.getByTestId('bar-long')).toBeInTheDocument()
    expect(screen.getByTestId('bar-short')).toBeInTheDocument()
    expect(screen.getByText('Long %')).toBeInTheDocument()
    expect(screen.getByText('Short %')).toBeInTheDocument()
  })

  it('sorts data by timestamp ascending', () => {
    const data = [
      makePoint({ timestamp: 1709719200000, long_short_ratio: 1.50 }),
      makePoint({ timestamp: 1709712000000, long_short_ratio: 1.10 }),
    ]
    render(<LSRChart data={data} isLoading={false} />)
    // Latest (highest timestamp) ratio displayed
    expect(screen.getByText('1.50')).toBeInTheDocument()
  })

  it('renders ResponsiveContainer', () => {
    render(<LSRChart data={[makePoint()]} isLoading={false} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('does not render chart when loading', () => {
    render(<LSRChart data={[makePoint()]} isLoading={true} />)
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
