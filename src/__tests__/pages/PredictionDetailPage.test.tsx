import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

// Mock hooks
vi.mock('../../hooks/usePredictApi', () => ({
  usePredictionDetail: vi.fn(),
  useReasoningGraph: vi.fn(() => ({ data: null, isLoading: false })),
  usePredictionExplain: vi.fn(() => ({ data: undefined, error: undefined, isLoading: false })),
  usePredictionReview: vi.fn(() => ({ data: undefined, error: undefined, isLoading: false })),
}))

// Mock ReasoningFlowGraph
vi.mock('../../components/predict/ReasoningFlowGraph', () => ({
  default: () => <div data-testid="reasoning-graph">Graph</div>,
}))

import { usePredictionDetail, usePredictionExplain, usePredictionReview } from '../../hooks/usePredictApi'
import PredictionDetailPage from '../../pages/PredictionDetailPage'

const renderWithRoute = (id: string) =>
  render(
    <MemoryRouter initialEntries={[`/predictions/${id}`]}>
      <Routes>
        <Route path="/predictions/:id" element={<PredictionDetailPage />} />
      </Routes>
    </MemoryRouter>
  )

describe('PredictionDetailPage', () => {
  it('shows skeleton loading state', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    const { container } = renderWithRoute('1')
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('shows error state with back link', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: undefined,
      error: new Error('Not found'),
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    renderWithRoute('1')
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    expect(screen.getByText(/Not found/)).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    const { container } = renderWithRoute('1')
    // Should be empty except router wrapper
    expect(container.textContent).toBe('')
  })

  it('renders prediction detail with data', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: {
        id: 1,
        symbol: 'BTC/USDT',
        direction: 'LONG',
        status: 'active',
        confidence: 0.85,
        price_at_prediction: 65000,
        macro_score: 7,
        fear_greed: 45,
        expected_impact: 3.5,
        expected_horizon: '1d',
        created_at: '2026-03-06T09:00:00Z',
        timestamp: '2026-03-06T09:00:00Z',
        trigger_event: 'test',
        trigger_event_text: 'Whale spotted',
        trigger_pattern: 'whale',
        reasoning: 'Based on accumulation',
        matched_events: [],
        reasoning_chain: [],
        confidence_factors: {},
      },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    renderWithRoute('1')
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('Whale spotted')).toBeInTheDocument()
    expect(screen.getByText('Based on accumulation')).toBeInTheDocument()
  })

  it('renders matched events table', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: {
        id: 1,
        symbol: 'BTC/USDT',
        direction: 'LONG',
        status: 'active',
        confidence: 0.7,
        price_at_prediction: 65000,
        macro_score: 7,
        fear_greed: 45,
        expected_impact: null as unknown as number,
        expected_horizon: null as unknown as string,
        created_at: '2026-03-06T09:00:00Z',
        timestamp: '2026-03-06T09:00:00Z',
        trigger_event: '',
        trigger_event_text: '',
        trigger_pattern: '',
        reasoning: '',
        matched_events: [
          { event_id: 1, date: '2026-03-01', event: 'Test event', symbol: 'BTC/USDT', price_change: 2.5, similarity: 0.85 },
        ],
        reasoning_chain: [
          { step: 'trigger', content: 'Whale detected' },
        ],
        confidence_factors: { pattern_match: 0.8 },
      },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    renderWithRoute('1')
    expect(screen.getByText('Matched Events')).toBeInTheDocument()
    expect(screen.getByText('Reasoning Chain')).toBeInTheDocument()
    expect(screen.getByText('Confidence Factors')).toBeInTheDocument()
    expect(screen.getByText('Test event')).toBeInTheDocument()
    expect(screen.getByText('85.0%')).toBeInTheDocument() // similarity × 100
    expect(screen.getByText('+2.50%')).toBeInTheDocument()
  })

  it('shows error without .message property', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: undefined,
      error: 'plain string error',
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as unknown as ReturnType<typeof usePredictionDetail>)
    renderWithRoute('1')
    expect(screen.getByText(/plain string error/)).toBeInTheDocument()
  })

  it('renders explain panel when explain data is available', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: {
        id: 1, symbol: 'BTC/USDT', direction: 'LONG', status: 'active', confidence: 0.85,
        price_at_prediction: 65000, macro_score: 7, fear_greed: 45, expected_impact: 3.5,
        expected_horizon: '1d', created_at: '2026-03-06T09:00:00Z', timestamp: '2026-03-06T09:00:00Z',
        trigger_event: 'test', trigger_event_text: 'Whale spotted', trigger_pattern: 'whale',
        reasoning: 'Based on accumulation', matched_events: [], reasoning_chain: [], confidence_factors: {},
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    vi.mocked(usePredictionExplain).mockReturnValue({
      data: {
        prediction_id: 1,
        summary: 'LONG BTC/USDT based on tariff_relief with 0.51 confidence',
        reasoning_chain: {
          trigger: { event: 'Tariff relief announced', source: 'auto_extracted', timestamp: '2026-03-07T10:00:00Z' },
          classification: { pattern: 'tariff_relief', category: 'tariff_relief', confidence_score: 0.507 },
          historical_matches: [],
          decay_analysis: {},
          direction_decision: { direction: 'LONG', confidence: 0.51 },
          symbol_decision: { symbol: 'BTC/USDT' },
        },
        factors: [{ name: 'Pattern Match', weight: 0.5, contribution: 'Strong pattern' }],
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionExplain>)
    renderWithRoute('1')
    expect(screen.getByText('AI Explanation')).toBeInTheDocument()
    expect(screen.getByText(/LONG BTC\/USDT/)).toBeInTheDocument()
    expect(screen.getByText('Tariff relief announced')).toBeInTheDocument()
  })

  it('shows "Explanation not available" when explain returns 404', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: {
        id: 1, symbol: 'BTC/USDT', direction: 'LONG', status: 'active', confidence: 0.85,
        price_at_prediction: 65000, macro_score: 7, fear_greed: 45, expected_impact: 3.5,
        expected_horizon: '1d', created_at: '2026-03-06T09:00:00Z', timestamp: '2026-03-06T09:00:00Z',
        trigger_event: 'test', trigger_event_text: '', trigger_pattern: '', reasoning: '',
        matched_events: [], reasoning_chain: [], confidence_factors: {},
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    vi.mocked(usePredictionExplain).mockReturnValue({
      data: undefined,
      error: new Error('API error: 404 Not Found'),
      isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionExplain>)
    renderWithRoute('1')
    expect(screen.getByText('Explanation not available')).toBeInTheDocument()
  })

  it('renders review panel when review data is available', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: {
        id: 1, symbol: 'BTC/USDT', direction: 'LONG', status: 'active', confidence: 0.85,
        price_at_prediction: 65000, macro_score: 7, fear_greed: 45, expected_impact: 3.5,
        expected_horizon: '1d', created_at: '2026-03-06T09:00:00Z', timestamp: '2026-03-06T09:00:00Z',
        trigger_event: 'test', trigger_event_text: '', trigger_pattern: '', reasoning: '',
        matched_events: [], reasoning_chain: [], confidence_factors: {},
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    vi.mocked(usePredictionReview).mockReturnValue({
      data: {
        prediction_id: 1, status: 'validated',
        prediction: { direction: 'LONG', confidence: 0.507, symbol: 'BTC/USDT', timestamp: '2026-03-07T10:00:00Z' },
        validation: { horizon: '1d', is_correct: false, actual_price_change_pct: -1.07, validated_at: '2026-03-08T10:00:00Z' },
        review: {
          outcome_summary: 'Prediction was INCORRECT',
          accuracy_context: 'This pattern has 46% accuracy',
          review_text: JSON.stringify({ outcome: 'Incorrect', lessons: ['Lesson one'] }),
        },
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionReview>)
    renderWithRoute('1')
    expect(screen.getByText('Postmortem Review')).toBeInTheDocument()
    expect(screen.getByText(/Prediction was INCORRECT/)).toBeInTheDocument()
  })

  it('hides review section when review returns 404 (not yet validated)', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: {
        id: 1, symbol: 'BTC/USDT', direction: 'LONG', status: 'active', confidence: 0.85,
        price_at_prediction: 65000, macro_score: 7, fear_greed: 45, expected_impact: 3.5,
        expected_horizon: '1d', created_at: '2026-03-06T09:00:00Z', timestamp: '2026-03-06T09:00:00Z',
        trigger_event: 'test', trigger_event_text: '', trigger_pattern: '', reasoning: '',
        matched_events: [], reasoning_chain: [], confidence_factors: {},
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    vi.mocked(usePredictionReview).mockReturnValue({
      data: undefined,
      error: new Error('Not found'),
      isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionReview>)
    renderWithRoute('1')
    expect(screen.queryByText('Postmortem Review')).not.toBeInTheDocument()
  })
})
