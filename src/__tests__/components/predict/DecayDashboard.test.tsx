import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/usePredictApi', () => ({
  useDecayActive: vi.fn(),
  useDecayModels: vi.fn(),
}))

import { useDecayActive, useDecayModels } from '../../../hooks/usePredictApi'
import { DecayDashboard } from '../../../components/predict/DecayDashboard'

function mockActive(overrides: Partial<ReturnType<typeof useDecayActive>>) {
  vi.mocked(useDecayActive).mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useDecayActive>)
}

function mockModels(overrides: Partial<ReturnType<typeof useDecayModels>>) {
  vi.mocked(useDecayModels).mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useDecayModels>)
}

describe('DecayDashboard', () => {
  it('shows loading state when active is loading', () => {
    mockActive({ isLoading: true })
    mockModels({})
    render(<DecayDashboard />)
    expect(screen.getByText('Loading decay dashboard...')).toBeInTheDocument()
  })

  it('shows loading state when models is loading', () => {
    mockActive({})
    mockModels({ isLoading: true })
    render(<DecayDashboard />)
    expect(screen.getByText('Loading decay dashboard...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockActive({ error: new Error('timeout') })
    mockModels({})
    render(<DecayDashboard />)
    expect(screen.getByText(/Failed to load decay data/)).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    mockActive({})
    mockModels({})
    const { container } = render(<DecayDashboard />)
    expect(container.innerHTML).toBe('')
  })

  it('renders KPI cards, table, and chart with data', () => {
    mockActive({
      data: {
        net_impact_pct: -1.25,
        net_strength: 0.85,
        direction: 'SHORT',
        active_count: 2,
        details: [
          { type: 'etf_flow', model: 'exponential', elapsed_days: 2.5, decay_coefficient: 0.9512, current_impact_pct: -0.8 },
          { type: 'whale_alert', model: 'linear', elapsed_days: 1.0, decay_coefficient: 0.98, current_impact_pct: 0.3 },
        ],
      },
    })
    mockModels({
      data: {
        models: [
          { name: 'exponential', decay_type: 'exp', initial_impact: 1.0, description: 'Standard exponential decay' },
        ],
        event_type_mapping: { etf_flow: 'exponential' },
      },
    })
    render(<DecayDashboard />)
    expect(screen.getByText('Decay Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Net Impact')).toBeInTheDocument()
    expect(screen.getAllByText('-1.25%')).toHaveLength(2) // KPI card + gauge
    expect(screen.getByText('SHORT')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Impact Gauge')).toBeInTheDocument()
    expect(screen.getByTestId('impact-gauge-fill')).toBeInTheDocument()
    expect(screen.getByText('Decay Curves')).toBeInTheDocument()
    expect(screen.getByText('Active Decay Events')).toBeInTheDocument()
    expect(screen.getByText('etf_flow')).toBeInTheDocument()
    expect(screen.getByText('Decay Coefficients')).toBeInTheDocument()
    expect(screen.getByText('Decay Models')).toBeInTheDocument()
    expect(screen.getByText('Standard exponential decay')).toBeInTheDocument()
  })

  it('renders positive impact with + sign', () => {
    mockActive({
      data: {
        net_impact_pct: 2.5,
        net_strength: 1.2,
        direction: 'LONG',
        active_count: 0,
        details: [],
      },
    })
    mockModels({})
    render(<DecayDashboard />)
    expect(screen.getAllByText('+2.50%')).toHaveLength(2) // KPI card + gauge
  })
})
