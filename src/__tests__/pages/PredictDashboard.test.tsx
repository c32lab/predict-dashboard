import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock all hooks used by PredictDashboard
vi.mock('../../hooks/usePredictApi', () => ({
  usePrediction: vi.fn(),
  usePredictHealth: vi.fn(() => ({ data: { status: 'ok' } })),
  useTrends: vi.fn(() => ({ data: [], isLoading: false })),
  usePredictAccuracy: vi.fn(() => ({ data: undefined })),
}))

vi.mock('swr', () => ({
  default: () => ({ data: undefined, isLoading: false }),
  SWRConfig: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../../api/predict', () => ({
  predictApi: { predictions: vi.fn() },
}))

// Mock child components to avoid deep rendering
vi.mock('../../components/predict', () => ({
  MacroCard: ({ label, value }: { label: string; value: string }) => <div>{label}: {value}</div>,
  PredictionTable: () => <div data-testid="prediction-table">PredictionTable</div>,
  PredictionHistoryTable: () => <div>HistoryTable</div>,
  EventTable: () => <div>EventTable</div>,
  PatternCard: () => <div>PatternCard</div>,
  MacroHistoryChart: () => <div>MacroChart</div>,
  TrendsSection: () => <div>TrendsSection</div>,
  AccuracyAndValidationsSection: () => <div>AccuracySection</div>,
  DerivativesOverviewSection: () => <div>DerivativesSection</div>,
  PredictHealthHeader: () => <div data-testid="health-header">HealthHeader</div>,
}))

vi.mock('../../components/SectionErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import { usePrediction } from '../../hooks/usePredictApi'
import PredictDashboard from '../../pages/PredictDashboard'

describe('PredictDashboard', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <PredictDashboard />
      </MemoryRouter>
    )

  it('shows loading state', () => {
    vi.mocked(usePrediction).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePrediction>)
    renderPage()
    expect(screen.getByText(/Loading predictions/)).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(usePrediction).mockReturnValue({
      data: undefined,
      error: new Error('API down'),
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePrediction>)
    renderPage()
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    expect(screen.getByText(/API down/)).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    vi.mocked(usePrediction).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePrediction>)
    const { container } = renderPage()
    expect(container.querySelector('[data-testid="health-header"]')).toBeNull()
  })

  it('renders dashboard sections with data', () => {
    vi.mocked(usePrediction).mockReturnValue({
      data: {
        macro: { score: 7, fear_greed: 45, fear_greed_trend: 'neutral', etf_flow_1d: 100000000, etf_flow_5d: 500000000, volume_ratio: 1.2, funding_rate: 0.001, funding_rate_avg: 0.0008, fear_greed_prev: 50, reasons: [] },
        event_kb: { events: [], patterns: [] },
        predictions: { active: [] },
        accuracy: {},
        recent_validations: [],
        macro_history: [],
      },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePrediction>)
    renderPage()
    expect(screen.getByTestId('health-header')).toBeInTheDocument()
    expect(screen.getByText(/Macro Overview/)).toBeInTheDocument()
    expect(screen.getByText(/Active Predictions/)).toBeInTheDocument()
    expect(screen.getByText(/Event Library/)).toBeInTheDocument()
  })
})
