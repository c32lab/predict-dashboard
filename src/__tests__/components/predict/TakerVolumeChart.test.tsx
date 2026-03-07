import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { TakerVolumePoint } from '../../../types/predict'

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

import { TakerVolumeChart } from '../../../components/predict/TakerVolumeChart'

function makePoint(overrides: Partial<TakerVolumePoint> = {}): TakerVolumePoint {
  return {
    timestamp: 1709712000000,
    buy_vol: 5000000,
    sell_vol: 4000000,
    buy_sell_ratio: 1.25,
    ...overrides,
  }
}

describe('TakerVolumeChart', () => {
  it('shows loading state', () => {
    render(<TakerVolumeChart data={undefined} isLoading={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows no data message when data is undefined', () => {
    render(<TakerVolumeChart data={undefined} isLoading={false} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('shows no data message when data is empty array', () => {
    render(<TakerVolumeChart data={[]} isLoading={false} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders title "Taker Buy/Sell Volume"', () => {
    render(<TakerVolumeChart data={[makePoint()]} isLoading={false} />)
    expect(screen.getByText('Taker Buy/Sell Volume')).toBeInTheDocument()
  })

  it('displays latest buy_sell_ratio formatted to 3 decimals', () => {
    const data = [
      makePoint({ timestamp: 1709712000000, buy_sell_ratio: 1.123 }),
      makePoint({ timestamp: 1709715600000, buy_sell_ratio: 0.987 }),
    ]
    render(<TakerVolumeChart data={data} isLoading={false} />)
    // Latest by timestamp is 0.987
    expect(screen.getByText('0.987')).toBeInTheDocument()
  })

  it('renders BarChart with correct number of data points', () => {
    const data = [
      makePoint({ timestamp: 1709712000000 }),
      makePoint({ timestamp: 1709715600000 }),
      makePoint({ timestamp: 1709719200000 }),
    ]
    render(<TakerVolumeChart data={data} isLoading={false} />)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-point-count', '3')
  })

  it('renders Buy and Sell bars', () => {
    render(<TakerVolumeChart data={[makePoint()]} isLoading={false} />)
    expect(screen.getByTestId('bar-buy')).toBeInTheDocument()
    expect(screen.getByTestId('bar-sell')).toBeInTheDocument()
    expect(screen.getByText('Buy Vol')).toBeInTheDocument()
    expect(screen.getByText('Sell Vol')).toBeInTheDocument()
  })

  it('sorts data by timestamp ascending', () => {
    const data = [
      makePoint({ timestamp: 1709719200000, buy_sell_ratio: 1.500 }),
      makePoint({ timestamp: 1709712000000, buy_sell_ratio: 1.100 }),
    ]
    render(<TakerVolumeChart data={data} isLoading={false} />)
    // Latest (highest timestamp) ratio displayed
    expect(screen.getByText('1.500')).toBeInTheDocument()
  })

  it('renders ResponsiveContainer', () => {
    render(<TakerVolumeChart data={[makePoint()]} isLoading={false} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('does not render chart when loading', () => {
    render(<TakerVolumeChart data={[makePoint()]} isLoading={true} />)
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles single data point', () => {
    render(<TakerVolumeChart data={[makePoint({ buy_sell_ratio: 2.000 })]} isLoading={false} />)
    expect(screen.getByText('2.000')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-point-count', '1')
  })
})
