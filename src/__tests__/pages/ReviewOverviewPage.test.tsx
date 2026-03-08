import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReviewOverviewPage from '../../pages/ReviewOverviewPage'

// Mock SWR-based hooks
const mockPredictions = {
  predictions: [
    { id: 101, symbol: 'BTC', direction: 'LONG', confidence: 0.82, status: 'validated', timestamp: '2026-03-08T10:00:00Z', trigger_event: '', trigger_pattern: '', expected_impact: 0, expected_horizon: '1d', price_at_prediction: 60000, macro_score: 0, fear_greed: 0, reasoning: '', created_at: '2026-03-08T10:00:00Z' },
    { id: 102, symbol: 'ETH', direction: 'SHORT', confidence: 0.65, status: 'validated', timestamp: '2026-03-08T11:00:00Z', trigger_event: '', trigger_pattern: '', expected_impact: 0, expected_horizon: '1d', price_at_prediction: 3000, macro_score: 0, fear_greed: 0, reasoning: '', created_at: '2026-03-08T11:00:00Z' },
  ],
  total: 2,
}

const mockExplainData = {
  prediction_id: 101,
  summary: 'BTC long based on CPI data',
  reasoning_chain: {
    trigger: { event: 'CPI data release', source: 'macro', timestamp: '2026-03-08T10:00:00Z' },
    classification: { pattern: 'cpi_miss', category: 'macro', confidence_score: 0.78 },
    historical_matches: [
      { event: 'CPI miss 2025-06', date: '2025-06-10', similarity: 0.85, outcome: { direction: 'LONG', price_change_pct: 3.2 } },
    ],
    decay_analysis: {},
    direction_decision: { direction: 'LONG', confidence: 0.82 },
    symbol_decision: { symbol: 'BTC' },
  },
  factors: [],
}

vi.mock('../../hooks/usePredictApi', () => ({
  usePredictions: vi.fn(),
  usePredictionExplain: vi.fn(),
}))

import { usePredictions, usePredictionExplain } from '../../hooks/usePredictApi'

const mockUsePredictions = vi.mocked(usePredictions)
const mockUsePredictionExplain = vi.mocked(usePredictionExplain)

beforeEach(() => {
  mockUsePredictions.mockReturnValue({
    data: mockPredictions,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
  } as ReturnType<typeof usePredictions>)

  mockUsePredictionExplain.mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
  } as ReturnType<typeof usePredictionExplain>)
})

describe('ReviewOverviewPage', () => {
  it('renders page title and description', () => {
    render(<ReviewOverviewPage />)
    expect(screen.getByText('Prediction Review / Postmortem')).toBeInTheDocument()
    expect(screen.getByText(/Review past predictions/)).toBeInTheDocument()
  })

  it('renders prediction review table with API data', () => {
    render(<ReviewOverviewPage />)
    expect(screen.getByText('Recent Predictions')).toBeInTheDocument()
    expect(screen.getByText('#101')).toBeInTheDocument()
    expect(screen.getAllByText('BTC').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('82%')).toBeInTheDocument()
  })

  it('shows loading state when predictions are loading', () => {
    mockUsePredictions.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof usePredictions>)
    render(<ReviewOverviewPage />)
    expect(screen.getByText('Loading predictions...')).toBeInTheDocument()
  })

  it('shows reasoning chain placeholder before selection', () => {
    render(<ReviewOverviewPage />)
    expect(screen.getByText(/Click a prediction above/)).toBeInTheDocument()
  })

  it('shows reasoning chain after clicking a prediction', async () => {
    mockUsePredictionExplain.mockReturnValue({
      data: mockExplainData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof usePredictionExplain>)

    render(<ReviewOverviewPage />)
    fireEvent.click(screen.getByText('#101'))

    await waitFor(() => {
      expect(screen.getByText(/Reasoning chain for prediction #101/)).toBeInTheDocument()
    })
    expect(screen.getByText('Trigger Event')).toBeInTheDocument()
    expect(screen.getByText(/CPI data release/)).toBeInTheDocument()
  })

  it('renders performance attribution section', () => {
    render(<ReviewOverviewPage />)
    expect(screen.getByText('Performance Attribution')).toBeInTheDocument()
    expect(screen.getByText(/reasoning factors contributed/)).toBeInTheDocument()
  })

  it('renders lessons learned cards', () => {
    render(<ReviewOverviewPage />)
    expect(screen.getByText('Patterns that work')).toBeInTheDocument()
    expect(screen.getByText('Patterns that fail')).toBeInTheDocument()
    expect(screen.getByText('Confidence calibration insights')).toBeInTheDocument()
    expect(screen.getByText(/Macro CPI\/PPI releases/)).toBeInTheDocument()
    expect(screen.getByText(/Gas fee spikes alone/)).toBeInTheDocument()
    expect(screen.getByText(/Confidence 80-100%/)).toBeInTheDocument()
  })

  it('highlights selected prediction row', () => {
    render(<ReviewOverviewPage />)
    const row = screen.getByText('#101').closest('tr')!
    expect(row.className).not.toContain('bg-blue-900/30')
    fireEvent.click(row)
    expect(row.className).toContain('bg-blue-900/30')
  })

  it('renders direction badges with correct colors', () => {
    render(<ReviewOverviewPage />)
    const longs = screen.getAllByText('LONG')
    const shorts = screen.getAllByText('SHORT')
    expect(longs[0].className).toContain('text-green-400')
    expect(shorts[0].className).toContain('text-red-400')
  })

  it('renders status badges', () => {
    render(<ReviewOverviewPage />)
    const validated = screen.getAllByText('validated')
    expect(validated[0].className).toContain('text-green-400')
  })
})
