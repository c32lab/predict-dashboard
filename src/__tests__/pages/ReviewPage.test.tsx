import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../../hooks/usePredictApi', () => ({
  usePredictionExplain: vi.fn(),
  usePredictionReview: vi.fn(() => ({ data: undefined, error: undefined, isLoading: false })),
}))

import { usePredictionExplain, usePredictionReview } from '../../hooks/usePredictApi'
import ReviewPage from '../../pages/ReviewPage'

const renderWithRoute = (id: string) =>
  render(
    <MemoryRouter initialEntries={[`/review/${id}`]}>
      <Routes>
        <Route path="/review/:id" element={<ReviewPage />} />
      </Routes>
    </MemoryRouter>
  )

const mockExplain = {
  prediction_id: 1,
  summary: 'SHORT BTC/USDT based on tariff_shock pattern with 0.60 confidence',
  reasoning_chain: {
    trigger: { event: 'Tariff shock detected', source: 'news', timestamp: '2026-03-06T09:00:00Z' },
    classification: { pattern: 'tariff_shock', category: 'macro', confidence_score: 0.6 },
    historical_matches: [
      {
        event: 'Previous tariff event',
        date: '2025-06-15',
        similarity: 0.95,
        outcome: { direction: 'SHORT', price_change_pct: -1.345 },
      },
    ],
    decay_analysis: {},
    direction_decision: { direction: 'SHORT', confidence: 0.6 },
    symbol_decision: { symbol: 'BTC/USDT' },
  },
  factors: [
    { name: 'Pattern Match', weight: 0.5, contribution: 'Strong historical pattern' },
    { name: 'Macro Score', weight: 0.3, contribution: 'Negative macro environment' },
  ],
}

const mockReview = {
  prediction_id: 1,
  status: 'validated',
  prediction: { direction: 'SHORT', confidence: 0.6, symbol: 'BTC/USDT', timestamp: '2026-03-06T09:00:00Z' },
  validation: { horizon: '1d', is_correct: false, actual_price_change_pct: 5.97, validated_at: '2026-03-07T09:00:00Z' },
  review: {
    outcome_summary: 'Prediction was INCORRECT',
    accuracy_context: 'This pattern has 36% 1d accuracy',
    review_text: JSON.stringify({
      outcome: 'Market moved opposite',
      lessons: ['Macro environment overrode pattern', 'Consider momentum'],
      pattern_context: 'tariff_shock underperforms in bull regime',
    }),
  },
}

describe('ReviewPage', () => {
  it('shows skeleton loading state', () => {
    vi.mocked(usePredictionExplain).mockReturnValue({
      data: undefined, error: undefined, isLoading: true, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionExplain>)
    const { container } = renderWithRoute('1')
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('shows error state with back link', () => {
    vi.mocked(usePredictionExplain).mockReturnValue({
      data: undefined, error: new Error('Not found'), isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionExplain>)
    renderWithRoute('1')
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    expect(screen.getByText(/Not found/)).toBeInTheDocument()
    expect(screen.getByText(/Back to Detail/)).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    vi.mocked(usePredictionExplain).mockReturnValue({
      data: undefined, error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionExplain>)
    const { container } = renderWithRoute('1')
    expect(container.textContent).toBe('')
  })

  it('renders explain data with summary and reasoning chain', () => {
    vi.mocked(usePredictionExplain).mockReturnValue({
      data: mockExplain, error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionExplain>)
    renderWithRoute('1')
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText(/SHORT BTC\/USDT/)).toBeInTheDocument()
    expect(screen.getByText('Reasoning Chain')).toBeInTheDocument()
    expect(screen.getByText('Trigger Event')).toBeInTheDocument()
    expect(screen.getByText('Tariff shock detected')).toBeInTheDocument()
    expect(screen.getAllByText('Historical Matches').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Previous tariff event')).toBeInTheDocument()
    expect(screen.getByText('95.0%')).toBeInTheDocument()
    expect(screen.getByText((-1.345).toFixed(2) + '%')).toBeInTheDocument()
    expect(screen.getByText('Decision Factors')).toBeInTheDocument()
    expect(screen.getByText('Pattern Match')).toBeInTheDocument()
  })

  it('renders review/postmortem section when review data available', () => {
    vi.mocked(usePredictionExplain).mockReturnValue({
      data: mockExplain, error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionExplain>)
    vi.mocked(usePredictionReview).mockReturnValue({
      data: mockReview, error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionReview>)
    renderWithRoute('1')
    expect(screen.getByText('Postmortem Review')).toBeInTheDocument()
    expect(screen.getAllByText('Incorrect').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Prediction was INCORRECT')).toBeInTheDocument()
    expect(screen.getByText(/36% 1d accuracy/)).toBeInTheDocument()
    expect(screen.getByText('Lessons Learned')).toBeInTheDocument()
    expect(screen.getByText(/Macro environment overrode pattern/)).toBeInTheDocument()
    expect(screen.getByText('Pattern Context')).toBeInTheDocument()
    expect(screen.getByText(/tariff_shock underperforms/)).toBeInTheDocument()
  })

  it('shows outcome as Correct when is_correct is true', () => {
    vi.mocked(usePredictionExplain).mockReturnValue({
      data: mockExplain, error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionExplain>)
    vi.mocked(usePredictionReview).mockReturnValue({
      data: {
        ...mockReview,
        validation: { ...mockReview.validation, is_correct: true, actual_price_change_pct: -2.5 },
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionReview>)
    renderWithRoute('1')
    expect(screen.getAllByText('Correct').length).toBeGreaterThanOrEqual(1)
  })

  it('shows raw review_text when JSON parsing fails', () => {
    vi.mocked(usePredictionExplain).mockReturnValue({
      data: mockExplain, error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionExplain>)
    vi.mocked(usePredictionReview).mockReturnValue({
      data: {
        ...mockReview,
        review: { ...mockReview.review, review_text: 'plain text review' },
      },
      error: undefined, isLoading: false, mutate: vi.fn(), isValidating: false,
    } as ReturnType<typeof usePredictionReview>)
    renderWithRoute('1')
    expect(screen.getByText('plain text review')).toBeInTheDocument()
  })
})
