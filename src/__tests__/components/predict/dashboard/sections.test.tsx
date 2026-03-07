import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Prediction, Event, Pattern, MacroSnapshot, Trend } from '../../../../types/predict'

// Mock recharts to avoid canvas/SVG rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: () => <div data-testid="line-chart">LineChart</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  AreaChart: () => <div>AreaChart</div>,
  Area: () => null,
  BarChart: () => <div>BarChart</div>,
  Bar: () => null,
  ComposedChart: () => <div>ComposedChart</div>,
}))

// Mock SectionErrorBoundary to just render children
vi.mock('../../../../components/SectionErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock sub-components used by the sections
vi.mock('../../../../components/predict/PredictionTable', () => ({
  PredictionTable: ({ predictions }: { predictions: Prediction[] }) => (
    <div data-testid="prediction-table">PredictionTable ({predictions.length} rows)</div>
  ),
}))

vi.mock('../../../../components/predict/EventTable', () => ({
  EventTable: ({ events }: { events: Event[] }) => (
    <div data-testid="event-table">EventTable ({events.length} rows)</div>
  ),
}))

vi.mock('../../../../components/predict/MacroCard', () => ({
  MacroCard: ({ label, value }: { label: string; value: string }) => (
    <div data-testid="macro-card">{label}: {value}</div>
  ),
}))

vi.mock('../../../../components/predict/PatternCard', () => ({
  PatternCard: ({ pattern }: { pattern: Pattern }) => (
    <div data-testid="pattern-card">{pattern.name}</div>
  ),
}))

vi.mock('../../../../components/predict/MacroHistoryChart', () => ({
  MacroHistoryChart: () => <div data-testid="macro-history-chart">MacroHistoryChart</div>,
}))

vi.mock('../../../../components/predict/PredictionHistoryTable', () => ({
  PredictionHistoryTable: ({ predictions }: { predictions: Prediction[] }) => (
    <div data-testid="prediction-history-table">PredictionHistoryTable ({predictions.length} rows)</div>
  ),
}))

vi.mock('../../../../components/predict/TrendsSection', () => ({
  TrendsSection: ({ trends }: { trends: Trend[] }) => (
    <div data-testid="trends-section">TrendsSection ({trends.length} trends)</div>
  ),
}))

import { ActivePredictionsSection } from '../../../../components/predict/dashboard/ActivePredictionsSection'
import { EventLibrarySection } from '../../../../components/predict/dashboard/EventLibrarySection'
import { MacroOverviewSection } from '../../../../components/predict/dashboard/MacroOverviewSection'
import { PatternsAndChartSection } from '../../../../components/predict/dashboard/PatternsAndChartSection'
import { PredictionHistorySection } from '../../../../components/predict/dashboard/PredictionHistorySection'
import { TrendDiscoverySection } from '../../../../components/predict/dashboard/TrendDiscoverySection'

// --- Test data factories ---

function makePrediction(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: 1,
    timestamp: '2026-03-06T09:00:00Z',
    symbol: 'BTC/USDT',
    direction: 'LONG',
    confidence: 0.85,
    trigger_event: 'Whale alert',
    trigger_pattern: 'whale_accumulation',
    expected_impact: 3.5,
    expected_horizon: '1d',
    price_at_prediction: 65000,
    macro_score: 7,
    fear_greed: 45,
    reasoning: 'Strong accumulation pattern',
    status: 'active',
    created_at: '2026-03-06T09:00:00Z',
    ...overrides,
  }
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 1,
    date: '2026-03-06',
    symbol: 'BTC/USDT',
    price_change: 2.5,
    close_price: 65000,
    category: 'whale',
    event: 'Large transfer detected',
    tags: ['whale', 'accumulation'],
    lesson: 'Whale accumulation signals bullish',
    pattern_name: 'whale_accumulation',
    source: 'on-chain',
    created_at: '2026-03-06T09:00:00Z',
    sources_json: [],
    url: '',
    affected_symbols_json: [],
    structured_sources_json: [],
    ...overrides,
  }
}

function makePattern(overrides: Partial<Pattern> = {}): Pattern {
  return {
    id: 1,
    name: 'whale_accumulation',
    direction: 'LONG',
    avg_impact: 3.2,
    base_level: 5,
    keywords: ['whale', 'accumulation'],
    boost_keywords: ['large'],
    example_dates: ['2026-03-01'],
    notes: 'Whale buying pattern',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-06T00:00:00Z',
    ...overrides,
  }
}

function makeMacroSnapshot(overrides: Partial<MacroSnapshot> = {}): MacroSnapshot {
  return {
    id: 1,
    timestamp: '2026-03-06T00:00:00Z',
    fear_greed: 45,
    fear_greed_trend: 'neutral',
    etf_flow_1d: 100000000,
    etf_flow_5d: 500000000,
    macro_score: 7,
    reasons: [],
    btc_price: 65000,
    ...overrides,
  }
}

function makeTrend(overrides: Partial<Trend> = {}): Trend {
  return {
    pattern_name: 'whale_accumulation',
    event_count: 5,
    avg_impact: 3.2,
    symbols: ['BTC/USDT', 'ETH/USDT'],
    latest_date: '2026-03-06',
    window_hours: 72,
    ...overrides,
  }
}

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

// --- ActivePredictionsSection ---

describe('ActivePredictionsSection', () => {
  it('renders header with prediction count', () => {
    const predictions = [makePrediction(), makePrediction({ id: 2, symbol: 'ETH/USDT' })]
    renderWithRouter(<ActivePredictionsSection predictions={predictions} />)
    expect(screen.getByText('Active Predictions')).toBeInTheDocument()
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('shows empty state when no predictions', () => {
    renderWithRouter(<ActivePredictionsSection predictions={[]} />)
    expect(screen.getByText('No active predictions')).toBeInTheDocument()
  })

  it('renders PredictionTable when predictions exist', () => {
    renderWithRouter(<ActivePredictionsSection predictions={[makePrediction()]} />)
    expect(screen.getByTestId('prediction-table')).toBeInTheDocument()
    expect(screen.getByText('PredictionTable (1 rows)')).toBeInTheDocument()
  })
})

// --- EventLibrarySection ---

describe('EventLibrarySection', () => {
  it('renders header with latest 20 label', () => {
    renderWithRouter(<EventLibrarySection events={[makeEvent()]} />)
    expect(screen.getByText('Event Library')).toBeInTheDocument()
    expect(screen.getByText('(latest 20)')).toBeInTheDocument()
  })

  it('shows empty state when no events', () => {
    renderWithRouter(<EventLibrarySection events={[]} />)
    expect(screen.getByText('No events')).toBeInTheDocument()
  })

  it('renders EventTable when events exist', () => {
    renderWithRouter(<EventLibrarySection events={[makeEvent()]} />)
    expect(screen.getByTestId('event-table')).toBeInTheDocument()
    expect(screen.getByText('EventTable (1 rows)')).toBeInTheDocument()
  })
})

// --- MacroOverviewSection ---

describe('MacroOverviewSection', () => {
  const macro = {
    score: 7.2,
    fear_greed: 45,
    fear_greed_trend: 'neutral',
    etf_flow_1d: 150000000,
    etf_flow_5d: 500000000,
    volume_ratio: 1.25,
    funding_rate: 0.001,
    funding_rate_avg: 0.0008,
  }

  it('renders Macro Overview heading', () => {
    render(<MacroOverviewSection macro={macro} />)
    expect(screen.getByText('Macro Overview')).toBeInTheDocument()
  })

  it('renders all five macro cards', () => {
    render(<MacroOverviewSection macro={macro} />)
    const cards = screen.getAllByTestId('macro-card')
    expect(cards).toHaveLength(5)
  })

  it('formats macro score to one decimal', () => {
    render(<MacroOverviewSection macro={macro} />)
    expect(screen.getByText(/Macro Score: 7.2/)).toBeInTheDocument()
  })

  it('formats ETF flow in millions', () => {
    render(<MacroOverviewSection macro={macro} />)
    expect(screen.getByText(/ETF Flow 1D: \$150M/)).toBeInTheDocument()
  })

  it('formats funding rate as percentage', () => {
    render(<MacroOverviewSection macro={macro} />)
    expect(screen.getByText(/Funding Rate: 0.100%/)).toBeInTheDocument()
  })

  it('shows dashes for null values', () => {
    const nullMacro = {
      score: null,
      fear_greed: null,
      etf_flow_1d: null,
      etf_flow_5d: null,
      volume_ratio: null,
      funding_rate: null,
      funding_rate_avg: null,
    }
    render(<MacroOverviewSection macro={nullMacro} />)
    // All values should be dash
    const cards = screen.getAllByTestId('macro-card')
    cards.forEach((card) => {
      expect(card.textContent).toContain('\u2014')
    })
  })
})

// --- PatternsAndChartSection ---

describe('PatternsAndChartSection', () => {
  it('renders both section headings', () => {
    render(<PatternsAndChartSection patterns={[]} macroHistory={[]} />)
    expect(screen.getByText('Event Patterns')).toBeInTheDocument()
    expect(screen.getByText('Macro History')).toBeInTheDocument()
  })

  it('shows empty patterns message when no patterns', () => {
    render(<PatternsAndChartSection patterns={[]} macroHistory={[]} />)
    expect(screen.getByText('No patterns')).toBeInTheDocument()
  })

  it('renders PatternCards when patterns exist', () => {
    const patterns = [makePattern(), makePattern({ id: 2, name: 'etf_inflow' })]
    render(<PatternsAndChartSection patterns={patterns} macroHistory={[]} />)
    const cards = screen.getAllByTestId('pattern-card')
    expect(cards).toHaveLength(2)
    expect(screen.getByText('whale_accumulation')).toBeInTheDocument()
    expect(screen.getByText('etf_inflow')).toBeInTheDocument()
  })

  it('shows no history message when macroHistory is empty', () => {
    render(<PatternsAndChartSection patterns={[]} macroHistory={[]} />)
    expect(screen.getByText('No history data')).toBeInTheDocument()
  })

  it('renders MacroHistoryChart when history data exists', () => {
    render(
      <PatternsAndChartSection patterns={[]} macroHistory={[makeMacroSnapshot()]} />
    )
    expect(screen.getByTestId('macro-history-chart')).toBeInTheDocument()
  })
})

// --- PredictionHistorySection ---

describe('PredictionHistorySection', () => {
  const defaultProps = {
    predictions: undefined as Prediction[] | undefined,
    total: 0,
    isLoading: false,
    page: 0,
    totalPages: 1,
    onPageChange: vi.fn(),
  }

  it('renders header', () => {
    render(<PredictionHistorySection {...defaultProps} />)
    expect(screen.getByText('Prediction History')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<PredictionHistorySection {...defaultProps} isLoading={true} />)
    expect(screen.getByText('loading\u2026')).toBeInTheDocument()
    expect(screen.getByText('Loading\u2026')).toBeInTheDocument()
  })

  it('shows empty state when no predictions', () => {
    render(<PredictionHistorySection {...defaultProps} predictions={[]} />)
    expect(screen.getByText('No prediction history')).toBeInTheDocument()
  })

  it('renders PredictionHistoryTable when data exists', () => {
    const predictions = [makePrediction()]
    render(
      <PredictionHistorySection {...defaultProps} predictions={predictions} total={1} />
    )
    expect(screen.getByTestId('prediction-history-table')).toBeInTheDocument()
  })

  it('shows count in header when not loading', () => {
    render(
      <PredictionHistorySection {...defaultProps} predictions={[makePrediction()]} total={42} />
    )
    expect(screen.getByText('(42)')).toBeInTheDocument()
  })

  it('shows pagination when total > PAGE_SIZE', () => {
    const onPageChange = vi.fn()
    render(
      <PredictionHistorySection
        {...defaultProps}
        predictions={[makePrediction()]}
        total={25}
        page={0}
        totalPages={2}
        onPageChange={onPageChange}
      />
    )
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('does not show pagination when total <= PAGE_SIZE', () => {
    render(
      <PredictionHistorySection {...defaultProps} predictions={[makePrediction()]} total={10} />
    )
    expect(screen.queryByText('Prev')).not.toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('calls onPageChange when clicking Next', () => {
    const onPageChange = vi.fn()
    render(
      <PredictionHistorySection
        {...defaultProps}
        predictions={[makePrediction()]}
        total={25}
        page={0}
        totalPages={2}
        onPageChange={onPageChange}
      />
    )
    fireEvent.click(screen.getByText('Next'))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange when clicking Prev', () => {
    const onPageChange = vi.fn()
    render(
      <PredictionHistorySection
        {...defaultProps}
        predictions={[makePrediction()]}
        total={25}
        page={1}
        totalPages={2}
        onPageChange={onPageChange}
      />
    )
    fireEvent.click(screen.getByText('Prev'))
    expect(onPageChange).toHaveBeenCalledWith(0)
  })

  it('disables Prev button on first page', () => {
    render(
      <PredictionHistorySection
        {...defaultProps}
        predictions={[makePrediction()]}
        total={25}
        page={0}
        totalPages={2}
        onPageChange={vi.fn()}
      />
    )
    expect(screen.getByText('Prev')).toBeDisabled()
  })

  it('disables Next button on last page', () => {
    render(
      <PredictionHistorySection
        {...defaultProps}
        predictions={[makePrediction()]}
        total={25}
        page={1}
        totalPages={2}
        onPageChange={vi.fn()}
      />
    )
    expect(screen.getByText('Next')).toBeDisabled()
  })
})

// --- TrendDiscoverySection ---

describe('TrendDiscoverySection', () => {
  it('renders header', () => {
    render(<TrendDiscoverySection trends={[]} isLoading={false} />)
    expect(screen.getByText('Trend Discovery')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<TrendDiscoverySection trends={[]} isLoading={true} />)
    expect(screen.getByText('Loading\u2026')).toBeInTheDocument()
  })

  it('renders TrendsSection when not loading', () => {
    const trends = [makeTrend()]
    render(<TrendDiscoverySection trends={trends} isLoading={false} />)
    expect(screen.getByTestId('trends-section')).toBeInTheDocument()
    expect(screen.getByText('TrendsSection (1 trends)')).toBeInTheDocument()
  })

  it('shows trend count in header when trends exist and not loading', () => {
    const trends = [makeTrend(), makeTrend({ pattern_name: 'etf_inflow' })]
    render(<TrendDiscoverySection trends={trends} isLoading={false} />)
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('does not show trend count when loading', () => {
    render(<TrendDiscoverySection trends={[makeTrend()]} isLoading={true} />)
    expect(screen.queryByText('(1)')).not.toBeInTheDocument()
  })

  it('does not show trend count when trends are empty', () => {
    render(<TrendDiscoverySection trends={[]} isLoading={false} />)
    expect(screen.queryByText('(0)')).not.toBeInTheDocument()
  })
})
