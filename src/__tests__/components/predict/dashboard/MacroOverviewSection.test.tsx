import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../../components/SectionErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../../../../components/predict', () => ({
  MacroCard: ({ label, value }: { label: string; value: string }) => <div>{label}: {value}</div>,
}))

import { MacroOverviewSection } from '../../../../components/predict/dashboard/MacroOverviewSection'

describe('MacroOverviewSection', () => {
  const macro = {
    score: 7,
    fear_greed: 45,
    fear_greed_trend: 'neutral',
    etf_flow_1d: 100000000,
    etf_flow_5d: 500000000,
    volume_ratio: 1.2,
    funding_rate: 0.001,
    funding_rate_avg: 0.0008,
  }

  it('renders section heading', () => {
    render(<MacroOverviewSection macro={macro} />)
    expect(screen.getByText('Macro Overview')).toBeInTheDocument()
  })

  it('renders macro cards', () => {
    render(<MacroOverviewSection macro={macro} />)
    expect(screen.getByText(/Macro Score/)).toBeInTheDocument()
    expect(screen.getByText(/Fear & Greed/)).toBeInTheDocument()
    expect(screen.getByText(/ETF Flow 1D/)).toBeInTheDocument()
    expect(screen.getByText(/Volume Ratio/)).toBeInTheDocument()
    expect(screen.getByText(/Funding Rate/)).toBeInTheDocument()
  })
})
