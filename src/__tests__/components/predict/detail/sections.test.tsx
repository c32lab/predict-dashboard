import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DetailHeaderCard } from '../../../../components/predict/detail/DetailHeaderCard'
import { MatchedEventsSection } from '../../../../components/predict/detail/MatchedEventsSection'
import { ReasoningChainSection } from '../../../../components/predict/detail/ReasoningChainSection'
import { ConfidenceFactorsSection } from '../../../../components/predict/detail/ConfidenceFactorsSection'
import { ReasoningGraphSection } from '../../../../components/predict/detail/ReasoningGraphSection'
import type { PredictionDetail, MatchedEvent, ReasoningStep, ReasoningGraph } from '../../../../types/predict'

// Mock @xyflow/react used by ReasoningFlowGraph
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children }: { children?: React.ReactNode }) => <div data-testid="react-flow">{children}</div>,
  Background: () => <div />,
  Controls: () => <div />,
  MiniMap: () => <div />,
  useNodesState: (nodes: unknown[]) => [nodes, vi.fn()],
  useEdgesState: (edges: unknown[]) => [edges, vi.fn()],
  Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
  MarkerType: { ArrowClosed: 'arrowclosed' },
  BackgroundVariant: { Dots: 'dots', Lines: 'lines', Cross: 'cross' },
}))

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  CartesianGrid: () => <div />,
}))

function makeDetail(overrides: Partial<PredictionDetail> = {}): PredictionDetail {
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
    trigger_event_text: 'Large BTC transfer detected',
    matched_events: [],
    reasoning_chain: [],
    confidence_factors: {},
    ...overrides,
  }
}

function makeEvent(overrides: Partial<MatchedEvent> = {}): MatchedEvent {
  return {
    event_id: 1,
    date: '2026-03-05T12:00:00Z',
    event: 'Whale transferred 5000 BTC',
    symbol: 'BTC/USDT',
    price_change: 2.5,
    similarity: 0.92,
    ...overrides,
  }
}

function makeStep(overrides: Partial<ReasoningStep> = {}): ReasoningStep {
  return {
    step: 'trigger',
    content: 'Whale accumulation detected on-chain',
    ...overrides,
  }
}

function makeGraph(overrides: Partial<ReasoningGraph> = {}): ReasoningGraph {
  return {
    prediction_id: 1,
    nodes: [
      { id: 'n1', type: 'source', data: { label: 'Event' }, position: { x: 0, y: 0 } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', label: 'triggers' },
    ],
    ...overrides,
  }
}

// ---------- DetailHeaderCard ----------

describe('DetailHeaderCard', () => {
  it('renders symbol and direction', () => {
    render(
      <MemoryRouter>
        <DetailHeaderCard data={makeDetail()} />
      </MemoryRouter>,
    )
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('LONG')).toBeInTheDocument()
  })

  it('formats confidence as percentage (x100)', () => {
    render(
      <MemoryRouter>
        <DetailHeaderCard data={makeDetail({ confidence: 0.72 })} />
      </MemoryRouter>,
    )
    expect(screen.getByText('72%')).toBeInTheDocument()
  })

  it('renders expected_impact directly (already_pct)', () => {
    render(
      <MemoryRouter>
        <DetailHeaderCard data={makeDetail({ expected_impact: 3.5 })} />
      </MemoryRouter>,
    )
    expect(screen.getByText('3.5%')).toBeInTheDocument()
  })

  it('renders trigger event text when present', () => {
    render(
      <MemoryRouter>
        <DetailHeaderCard data={makeDetail({ trigger_event_text: 'Large BTC transfer detected' })} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Large BTC transfer detected')).toBeInTheDocument()
  })

  it('renders reasoning when present', () => {
    render(
      <MemoryRouter>
        <DetailHeaderCard data={makeDetail({ reasoning: 'Strong accumulation pattern' })} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Strong accumulation pattern')).toBeInTheDocument()
  })

  it('shows dash when expected_impact is null', () => {
    render(
      <MemoryRouter>
        <DetailHeaderCard data={makeDetail({ expected_impact: null as unknown as number })} />
      </MemoryRouter>,
    )
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })
})

// ---------- MatchedEventsSection ----------

describe('MatchedEventsSection', () => {
  it('shows empty state for empty events', () => {
    render(<MatchedEventsSection events={[]} />)
    expect(screen.getByText('No matched events found')).toBeInTheDocument()
  })

  it('shows empty state for undefined events', () => {
    render(<MatchedEventsSection events={undefined as unknown as MatchedEvent[]} />)
    expect(screen.getByText('No matched events found')).toBeInTheDocument()
  })

  it('renders header with event count', () => {
    render(<MatchedEventsSection events={[makeEvent(), makeEvent({ event_id: 2 })]} />)
    expect(screen.getByText('Matched Events')).toBeInTheDocument()
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<MatchedEventsSection events={[makeEvent()]} />)
    expect(screen.getByText('Event')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Price Change')).toBeInTheDocument()
    expect(screen.getByText('Similarity')).toBeInTheDocument()
  })

  it('renders event data with correct formatting', () => {
    render(<MatchedEventsSection events={[makeEvent()]} />)
    expect(screen.getByText('Whale transferred 5000 BTC')).toBeInTheDocument()
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    // price_change: already_pct, displayed directly
    expect(screen.getByText('+2.50%')).toBeInTheDocument()
    // similarity: decimal_0_1 -> x100
    expect(screen.getByText('92.0%')).toBeInTheDocument()
  })

  it('renders negative price change with minus sign', () => {
    render(<MatchedEventsSection events={[makeEvent({ price_change: -1.25 })]} />)
    expect(screen.getByText('-1.25%')).toBeInTheDocument()
  })
})

// ---------- ReasoningChainSection ----------

describe('ReasoningChainSection', () => {
  it('shows empty state for empty chain', () => {
    render(<ReasoningChainSection chain={[]} />)
    expect(screen.getByText('No reasoning chain available')).toBeInTheDocument()
  })

  it('shows empty state for undefined chain', () => {
    render(<ReasoningChainSection chain={undefined as unknown as ReasoningStep[]} />)
    expect(screen.getByText('No reasoning chain available')).toBeInTheDocument()
  })

  it('renders header', () => {
    render(<ReasoningChainSection chain={[makeStep()]} />)
    expect(screen.getByText('Reasoning Chain')).toBeInTheDocument()
  })

  it('renders step label and content', () => {
    render(
      <ReasoningChainSection
        chain={[
          makeStep({ step: 'trigger', content: 'Whale accumulation detected on-chain' }),
          makeStep({ step: 'pattern', content: 'Matches historical whale moves' }),
        ]}
      />,
    )
    expect(screen.getByText('trigger')).toBeInTheDocument()
    expect(screen.getByText('Whale accumulation detected on-chain')).toBeInTheDocument()
    expect(screen.getByText('pattern')).toBeInTheDocument()
    expect(screen.getByText('Matches historical whale moves')).toBeInTheDocument()
  })
})

// ---------- ConfidenceFactorsSection ----------

describe('ConfidenceFactorsSection', () => {
  it('shows empty state for empty factors', () => {
    render(<ConfidenceFactorsSection factors={{}} />)
    expect(screen.getByText('No confidence factors available')).toBeInTheDocument()
  })

  it('shows empty state for undefined factors', () => {
    render(<ConfidenceFactorsSection factors={undefined as unknown as Record<string, number>} />)
    expect(screen.getByText('No confidence factors available')).toBeInTheDocument()
  })

  it('renders header', () => {
    render(<ConfidenceFactorsSection factors={{ momentum: 0.8 }} />)
    expect(screen.getByText('Confidence Factors')).toBeInTheDocument()
  })

  it('renders factor name and weight as percentage (x100)', () => {
    render(<ConfidenceFactorsSection factors={{ momentum: 0.8, volume: 0.65 }} />)
    expect(screen.getByText('momentum')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('volume')).toBeInTheDocument()
    expect(screen.getByText('65%')).toBeInTheDocument()
  })
})

// ---------- ReasoningGraphSection ----------

describe('ReasoningGraphSection', () => {
  it('shows loading state', () => {
    render(<ReasoningGraphSection graphData={undefined} isLoading={true} />)
    expect(screen.getByText('Loading reasoning graph...')).toBeInTheDocument()
  })

  it('shows empty state when no graph data', () => {
    render(<ReasoningGraphSection graphData={undefined} isLoading={false} />)
    expect(screen.getByText('No reasoning graph data')).toBeInTheDocument()
  })

  it('shows empty state when nodes are empty', () => {
    render(
      <ReasoningGraphSection
        graphData={{ prediction_id: 1, nodes: [], edges: [] }}
        isLoading={false}
      />,
    )
    expect(screen.getByText('No reasoning graph data')).toBeInTheDocument()
  })

  it('renders header', () => {
    render(<ReasoningGraphSection graphData={undefined} isLoading={false} />)
    expect(screen.getByText('Reasoning Graph')).toBeInTheDocument()
  })

  it('renders flow graph when data is available', () => {
    render(<ReasoningGraphSection graphData={makeGraph()} isLoading={false} />)
    expect(screen.getByTestId('react-flow')).toBeInTheDocument()
  })
})
