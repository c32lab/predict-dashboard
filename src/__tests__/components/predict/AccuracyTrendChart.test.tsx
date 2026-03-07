import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccuracyTrendChart } from '../../../components/predict/AccuracyTrendChart'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  }
})

describe('AccuracyTrendChart', () => {
  it('returns null when trendData is empty', () => {
    const { container } = render(<AccuracyTrendChart trendData={[]} chartSymbols={['BTC/USDT']} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders chart heading when data exists', () => {
    const trendData = [{ date: '2026-03-01', 'BTC/USDT': 70 }]
    render(<AccuracyTrendChart trendData={trendData} chartSymbols={['BTC/USDT']} />)
    expect(screen.getByText('Accuracy Trend')).toBeInTheDocument()
  })
})
