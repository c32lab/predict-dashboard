import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/usePredictApi', () => ({
  useDecayActive: vi.fn(),
}))

import { useDecayActive } from '../../../hooks/usePredictApi'
import { DecayImpactPanel } from '../../../components/predict/DecayImpactPanel'

function mockReturn(overrides: Partial<ReturnType<typeof useDecayActive>>) {
  vi.mocked(useDecayActive).mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useDecayActive>)
}

describe('DecayImpactPanel', () => {
  it('shows loading state', () => {
    mockReturn({ isLoading: true })
    render(<DecayImpactPanel />)
    expect(screen.getByText('Loading decay impact...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockReturn({ error: new Error('server error') })
    render(<DecayImpactPanel />)
    expect(screen.getByText(/Failed to load decay impact/)).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    mockReturn({})
    const { container } = render(<DecayImpactPanel />)
    expect(container.innerHTML).toBe('')
  })

  it('renders summary cards and table with data', () => {
    mockReturn({
      data: {
        net_impact_pct: -1.25,
        net_strength: 0.85,
        direction: 'SHORT',
        active_count: 3,
        details: [
          { type: 'etf_flow', model: 'exponential', elapsed_days: 2.5, decay_coefficient: 0.9512, current_impact_pct: -0.8 },
          { type: 'whale_alert', model: 'linear', elapsed_days: 1.0, decay_coefficient: 0.98, current_impact_pct: 0.3 },
          { type: 'macro', model: 'exponential', elapsed_days: 5.0, decay_coefficient: 0.82, current_impact_pct: -0.75 },
        ],
      },
    })
    render(<DecayImpactPanel />)
    expect(screen.getByText('Decay Impact')).toBeInTheDocument()
    expect(screen.getByText('Net Impact')).toBeInTheDocument()
    expect(screen.getByText('-1.25%')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    // Table sorted by |impact| desc: etf_flow (-0.8), macro (-0.75), whale_alert (0.3)
    expect(screen.getByText('etf_flow')).toBeInTheDocument()
    expect(screen.getByText('macro')).toBeInTheDocument()
    expect(screen.getByText('whale_alert')).toBeInTheDocument()
  })

  it('renders positive impact with + sign', () => {
    mockReturn({
      data: {
        net_impact_pct: 2.5,
        net_strength: 1.2,
        direction: 'LONG',
        active_count: 1,
        details: [],
      },
    })
    render(<DecayImpactPanel />)
    expect(screen.getByText('+2.50%')).toBeInTheDocument()
  })
})
