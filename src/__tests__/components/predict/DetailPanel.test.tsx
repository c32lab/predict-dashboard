import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/usePredictApi', () => ({
  usePredictionDetail: vi.fn(() => ({ data: null, error: null, isLoading: false })),
  useReasoningGraph: vi.fn(() => ({ data: null, isLoading: false })),
}))

vi.mock('../../../components/predict/ReasoningFlowGraph', () => ({
  default: () => <div>Graph</div>,
}))

import { usePredictionDetail, useReasoningGraph } from '../../../hooks/usePredictApi'
import { DetailPanel } from '../../../components/predict/DetailPanel'

describe('DetailPanel', () => {
  it('shows loading state', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    render(<DetailPanel id={1} reasoning="" />)
    expect(screen.getByText(/Loading details/)).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: undefined,
      error: new Error('Not found'),
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    render(<DetailPanel id={1} reasoning="" />)
    expect(screen.getByText(/Failed to load details/)).toBeInTheDocument()
  })

  it('renders reasoning text when provided', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    render(<DetailPanel id={1} reasoning="Strong accumulation" />)
    expect(screen.getByText('Strong accumulation')).toBeInTheDocument()
  })

  it('renders trigger event text when data has trigger_event_text', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: {
        id: 1, symbol: 'BTC/USDT', direction: 'LONG', confidence: 0.8,
        trigger_event: 'whale', trigger_pattern: 'whale', trigger_event_text: 'Whale spotted on-chain',
        expected_impact: 3, expected_horizon: '1d', price_at_prediction: 65000,
        macro_score: 7, fear_greed: 45, reasoning: '', status: 'active',
        created_at: '2026-03-06T10:00:00Z', timestamp: '2026-03-06T10:00:00Z',
        matched_events: [], reasoning_chain: [], confidence_factors: {},
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    render(<DetailPanel id={1} reasoning="" />)
    expect(screen.getByText('Trigger Event')).toBeInTheDocument()
    expect(screen.getByText('Whale spotted on-chain')).toBeInTheDocument()
  })

  it('renders matched events table with positive and negative price changes', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: {
        id: 1, symbol: 'BTC/USDT', direction: 'LONG', confidence: 0.8,
        trigger_event: '', trigger_pattern: '', trigger_event_text: '',
        expected_impact: 3, expected_horizon: '1d', price_at_prediction: 65000,
        macro_score: 7, fear_greed: 45, reasoning: '', status: 'active',
        created_at: '2026-03-06T10:00:00Z', timestamp: '2026-03-06T10:00:00Z',
        matched_events: [
          { event_id: 1, date: '2026-03-01', event: 'Flash crash', symbol: 'BTC/USDT', price_change: -5.2, similarity: 0.92 },
          { event_id: 2, date: '2026-03-02', event: 'Rally event', symbol: 'ETH/USDT', price_change: 3.1, similarity: 0.75 },
        ],
        reasoning_chain: [], confidence_factors: {},
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    render(<DetailPanel id={1} reasoning="" />)
    expect(screen.getByText('Matched Historical Events')).toBeInTheDocument()
    expect(screen.getByText('Flash crash')).toBeInTheDocument()
    expect(screen.getByText('-5.20%')).toBeInTheDocument()
    expect(screen.getByText('+3.10%')).toBeInTheDocument()
    expect(screen.getByText('92.0%')).toBeInTheDocument()
  })

  it('renders confidence factors when they exist', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: {
        id: 1, symbol: 'BTC/USDT', direction: 'LONG', confidence: 0.8,
        trigger_event: '', trigger_pattern: '', trigger_event_text: '',
        expected_impact: 3, expected_horizon: '1d', price_at_prediction: 65000,
        macro_score: 7, fear_greed: 45, reasoning: '', status: 'active',
        created_at: '2026-03-06T10:00:00Z', timestamp: '2026-03-06T10:00:00Z',
        matched_events: [], reasoning_chain: [],
        confidence_factors: { pattern_match: 0.8, volume_signal: 0.65 },
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    render(<DetailPanel id={1} reasoning="" />)
    expect(screen.getByText('Confidence Factors')).toBeInTheDocument()
    expect(screen.getByText('pattern_match')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('65%')).toBeInTheDocument()
  })

  it('renders reasoning graph when graphData has nodes', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: {
        id: 1, symbol: 'BTC/USDT', direction: 'LONG', confidence: 0.8,
        trigger_event: '', trigger_pattern: '', trigger_event_text: '',
        expected_impact: 3, expected_horizon: '1d', price_at_prediction: 65000,
        macro_score: 7, fear_greed: 45, reasoning: '', status: 'active',
        created_at: '2026-03-06T10:00:00Z', timestamp: '2026-03-06T10:00:00Z',
        matched_events: [], reasoning_chain: [], confidence_factors: {},
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    vi.mocked(useReasoningGraph).mockReturnValue({
      data: { prediction_id: 1, nodes: [{ id: '1', label: 'trigger', type: 'trigger' }], edges: [] },
      isLoading: false, error: undefined, mutate: vi.fn(), isValidating: false,
    } as unknown as ReturnType<typeof useReasoningGraph>)
    render(<DetailPanel id={1} reasoning="" />)
    expect(screen.getByText('Graph')).toBeInTheDocument()
  })

  it('shows error without .message property (string error)', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: undefined,
      error: 'raw error string',
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as unknown as ReturnType<typeof usePredictionDetail>)
    render(<DetailPanel id={1} reasoning="" />)
    expect(screen.getByText(/raw error string/)).toBeInTheDocument()
  })

  it('shows "No reasoning chain data" when graphData has empty nodes', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: {
        id: 1, symbol: 'BTC/USDT', direction: 'LONG', confidence: 0.8,
        trigger_event: '', trigger_pattern: '', trigger_event_text: '',
        expected_impact: 3, expected_horizon: '1d', price_at_prediction: 65000,
        macro_score: 7, fear_greed: 45, reasoning: '', status: 'active',
        created_at: '2026-03-06T10:00:00Z', timestamp: '2026-03-06T10:00:00Z',
        matched_events: [], reasoning_chain: [], confidence_factors: {},
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    vi.mocked(useReasoningGraph).mockReturnValue({
      data: { prediction_id: 1, nodes: [], edges: [] },
      isLoading: false, error: undefined, mutate: vi.fn(), isValidating: false,
    } as unknown as ReturnType<typeof useReasoningGraph>)
    render(<DetailPanel id={1} reasoning="" />)
    expect(screen.getByText('No reasoning chain data')).toBeInTheDocument()
  })
})
