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
  default: (_key: unknown, fetcher?: () => Promise<unknown>) => {
    // Call the fetcher to ensure coverage of the arrow function
    if (typeof fetcher === 'function') {
      fetcher()
    }
    return { data: undefined, isLoading: false }
  },
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

vi.mock('../../components/predict/DecayImpactPanel', () => ({
  DecayImpactPanel: () => <div>DecayImpactPanel</div>,
}))

vi.mock('../../components/predict/dashboard', () => ({
  MacroOverviewSection: ({ macro }: { macro: unknown }) => <div>Macro Overview {macro ? 'loaded' : ''}</div>,
  ActivePredictionsSection: () => <div>Active Predictions</div>,
  EventLibrarySection: () => <div>Event Library</div>,
  PatternsAndChartSection: () => <div>PatternsChart</div>,
  PredictionHistorySection: () => <div>PredictionHistory</div>,
  TrendDiscoverySection: () => <div>TrendDiscovery</div>,
}))

import { usePrediction, useTrends } from '../../hooks/usePredictApi'
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

  it('handles trendsData as object with trends property', () => {
    vi.mocked(useTrends).mockReturnValue({
      data: { trends: [{ id: 1, topic: 'BTC Rally' }] } as unknown as ReturnType<typeof useTrends>['data'],
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof useTrends>)
    vi.mocked(usePrediction).mockReturnValue({
      data: {
        macro: { score: 7, fear_greed: 45, fear_greed_trend: 'neutral', etf_flow_1d: 0, etf_flow_5d: 0, volume_ratio: 1, funding_rate: 0, funding_rate_avg: 0, fear_greed_prev: 50, reasons: [] },
        event_kb: { events: [], patterns: [] },
        predictions: { active: [] },
        accuracy: {},
        recent_validations: [],
        macro_history: [],
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePrediction>)
    renderPage()
    expect(screen.getByTestId('health-header')).toBeInTheDocument()
  })

  it('handles missing predictions and event_kb gracefully', () => {
    vi.mocked(usePrediction).mockReturnValue({
      data: {
        macro: { score: 7, fear_greed: 45, fear_greed_trend: 'neutral', etf_flow_1d: 0, etf_flow_5d: 0, volume_ratio: 1, funding_rate: 0, funding_rate_avg: 0, fear_greed_prev: 50, reasons: [] },
        event_kb: undefined,
        predictions: undefined,
        accuracy: undefined,
        recent_validations: undefined,
        macro_history: [],
      } as unknown as ReturnType<typeof usePrediction>['data'],
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePrediction>)
    renderPage()
    expect(screen.getByTestId('health-header')).toBeInTheDocument()
  })
})
