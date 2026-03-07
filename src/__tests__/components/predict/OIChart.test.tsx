import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { OpenInterestPoint } from '../../../types/predict'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => <div data-testid="area-chart" data-point-count={data.length}>{children}</div>,
    Area: ({ dataKey }: { dataKey: string }) => <div data-testid={`area-${dataKey}`} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: ({ tickFormatter }: { tickFormatter?: (v: number) => string }) => <div data-testid="y-axis" data-fmt={tickFormatter?.(25000000000)} />,
    Tooltip: ({ formatter }: { formatter?: (v: number | undefined) => unknown }) => {
      formatter?.(25000000000)
      formatter?.(undefined)
      return <div data-testid="tooltip" />
    },
  }
})

import { OIChart } from '../../../components/predict/OIChart'

function makePoint(overrides: Partial<OpenInterestPoint> = {}): OpenInterestPoint {
  return {
    timestamp: 1709712000000,
    sum_open_interest_value: 25000000000,
    ...overrides,
  }
}

describe('OIChart', () => {
  it('shows loading state', () => {
    render(<OIChart data={undefined} isLoading={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows no data message when data is undefined', () => {
    render(<OIChart data={undefined} isLoading={false} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('shows no data message when data is empty array', () => {
    render(<OIChart data={[]} isLoading={false} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders title "Open Interest"', () => {
    render(<OIChart data={[makePoint()]} isLoading={false} />)
    expect(screen.getByText('Open Interest')).toBeInTheDocument()
  })

  it('formats latest OI value in billions', () => {
    const data = [
      makePoint({ timestamp: 1709712000000, sum_open_interest_value: 25000000000 }),
      makePoint({ timestamp: 1709715600000, sum_open_interest_value: 26500000000 }),
    ]
    render(<OIChart data={data} isLoading={false} />)
    // Latest: 26.5B
    expect(screen.getByText('$26.5B')).toBeInTheDocument()
  })

  it('formats latest OI value in millions', () => {
    const data = [
      makePoint({ timestamp: 1709712000000, sum_open_interest_value: 450000000 }),
    ]
    render(<OIChart data={data} isLoading={false} />)
    expect(screen.getByText('$450M')).toBeInTheDocument()
  })

  it('formats latest OI value below million with dollar sign', () => {
    const data = [
      makePoint({ timestamp: 1709712000000, sum_open_interest_value: 999999 }),
    ]
    render(<OIChart data={data} isLoading={false} />)
    expect(screen.getByText('$999,999')).toBeInTheDocument()
  })

  it('renders AreaChart with correct number of data points', () => {
    const data = [
      makePoint({ timestamp: 1709712000000 }),
      makePoint({ timestamp: 1709715600000 }),
    ]
    render(<OIChart data={data} isLoading={false} />)
    expect(screen.getByTestId('area-chart')).toHaveAttribute('data-point-count', '2')
  })

  it('renders Area with dataKey "value"', () => {
    render(<OIChart data={[makePoint()]} isLoading={false} />)
    expect(screen.getByTestId('area-value')).toBeInTheDocument()
  })

  it('sorts data by timestamp ascending', () => {
    const data = [
      makePoint({ timestamp: 1709719200000, sum_open_interest_value: 30000000000 }),
      makePoint({ timestamp: 1709712000000, sum_open_interest_value: 25000000000 }),
    ]
    render(<OIChart data={data} isLoading={false} />)
    // Latest (highest timestamp) value displayed
    expect(screen.getByText('$30.0B')).toBeInTheDocument()
  })

  it('renders ResponsiveContainer', () => {
    render(<OIChart data={[makePoint()]} isLoading={false} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('does not render chart when loading', () => {
    render(<OIChart data={[makePoint()]} isLoading={true} />)
    expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
