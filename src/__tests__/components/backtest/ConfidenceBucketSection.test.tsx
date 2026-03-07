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
    LabelList: () => <div data-testid="label-list" />,
  }
})

import { ConfidenceBucketSection } from '../../../components/backtest/ConfidenceBucketSection'
import type { AccuracyBucket } from '../../../types/backtest'

const mockBuckets: Record<string, AccuracyBucket> = {
  '0.5-0.6': { correct: 10, total: 20, accuracy_pct: 50 },
  '0.6-0.7': { correct: 15, total: 20, accuracy_pct: 75 },
  '0.7-0.8': { correct: 18, total: 20, accuracy_pct: 90 },
}

describe('ConfidenceBucketSection', () => {
  it('renders the section title', () => {
    render(<ConfidenceBucketSection buckets={mockBuckets} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Confidence Bucket Analysis')
  })

  it('renders a bar chart with accuracy bars', () => {
    render(<ConfidenceBucketSection buckets={mockBuckets} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-count', '3')
    expect(screen.getByTestId('bar-accuracy')).toBeInTheDocument()
  })

  it('renders with empty buckets', () => {
    render(<ConfidenceBucketSection buckets={{}} />)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-count', '0')
  })

  it('renders with single bucket', () => {
    const single = { '0.9-1.0': { correct: 9, total: 10, accuracy_pct: 90 } }
    render(<ConfidenceBucketSection buckets={single} />)
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-count', '1')
  })
})
