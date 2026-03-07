import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DerivativesOverviewSection } from '../../../components/predict/DerivativesOverviewSection'

// Mock the hooks
vi.mock('../../../hooks/usePredictApi', () => ({
  useOpenInterest: () => ({
    data: [
      { timestamp: 1709712000000, sum_open_interest_value: 25000000000 },
      { timestamp: 1709715600000, sum_open_interest_value: 26000000000 },
    ],
    isLoading: false,
  }),
  useLongShortRatio: () => ({
    data: [
      { timestamp: 1709712000000, long_account: 0.55, short_account: 0.45, long_short_ratio: 1.22 },
    ],
    isLoading: false,
  }),
  useTakerVolume: () => ({
    data: [
      { timestamp: 1709712000000, buy_vol: 5000000, sell_vol: 4000000, buy_sell_ratio: 1.25 },
    ],
    isLoading: false,
  }),
}))

vi.mock('../../../hooks/useSymbols', () => ({
  useSymbols: () => ['BTC/USDT', 'ETH/USDT'],
}))

describe('DerivativesOverviewSection', () => {
  it('renders section title', () => {
    render(<DerivativesOverviewSection />)
    expect(screen.getByText('Derivatives Overview')).toBeInTheDocument()
  })

  it('renders chart titles', () => {
    render(<DerivativesOverviewSection />)
    expect(screen.getByText('Open Interest')).toBeInTheDocument()
    expect(screen.getByText('Long/Short Ratio')).toBeInTheDocument()
    expect(screen.getByText('Taker Buy/Sell Volume')).toBeInTheDocument()
  })

  it('renders symbol selector buttons', () => {
    render(<DerivativesOverviewSection />)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
  })
})
