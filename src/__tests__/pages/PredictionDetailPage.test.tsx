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
})
