import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PredictionTable, PredictionHistoryTable } from '../../../components/predict/PredictionTable'
import type { Prediction } from '../../../types/predict'

// Mock the hooks used by DetailPanel
vi.mock('../../../hooks/usePredictApi', () => ({
  usePredictionDetail: () => ({ data: null, error: null, isLoading: false }),
  useReasoningGraph: () => ({ data: null, isLoading: false }),
}))

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

describe('PredictionTable', () => {
  const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>)

  it('renders table headers', () => {
    renderWithRouter(<PredictionTable predictions={[]} />)
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Direction')).toBeInTheDocument()
    expect(screen.getByText('Confidence')).toBeInTheDocument()
    expect(screen.getByText('Pattern')).toBeInTheDocument()
    expect(screen.getByText('Impact')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
  })

  it('renders prediction data', () => {
    renderWithRouter(<PredictionTable predictions={[makePrediction()]} />)
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('LONG')).toBeInTheDocument()
  })

  it('formats confidence as percentage (×100)', () => {
    renderWithRouter(<PredictionTable predictions={[makePrediction({ confidence: 0.85 })]} />)
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('formats expected_impact directly (already_pct)', () => {
    renderWithRouter(<PredictionTable predictions={[makePrediction({ expected_impact: 3.5 })]} />)
    expect(screen.getByText('3.5%')).toBeInTheDocument()
  })

  it('shows dash when expected_impact is null', () => {
    renderWithRouter(<PredictionTable predictions={[makePrediction({ expected_impact: null as unknown as number })]} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders symbol as a link', () => {
    renderWithRouter(<PredictionTable predictions={[makePrediction()]} />)
    const link = screen.getByText('BTC/USDT')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/predictions/1')
  })

  it('renders multiple predictions', () => {
    const predictions = [
      makePrediction({ id: 1, symbol: 'BTC/USDT' }),
      makePrediction({ id: 2, symbol: 'ETH/USDT' }),
    ]
    renderWithRouter(<PredictionTable predictions={predictions} />)
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument()
  })
})

describe('PredictionHistoryTable', () => {
  const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>)

  it('renders table headers', () => {
    renderWithRouter(<PredictionHistoryTable predictions={[]} />)
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Trigger Pattern')).toBeInTheDocument()
  })

  it('renders prediction rows with status badge', () => {
    renderWithRouter(<PredictionHistoryTable predictions={[makePrediction({ status: 'active' })]} />)
    expect(screen.getByText(/监控中/)).toBeInTheDocument()
  })

  it('sorts predictions by created_at descending', () => {
    const predictions = [
      makePrediction({ id: 1, created_at: '2026-03-04T00:00:00Z', symbol: 'OLDEST' }),
      makePrediction({ id: 2, created_at: '2026-03-06T00:00:00Z', symbol: 'NEWEST' }),
      makePrediction({ id: 3, created_at: '2026-03-05T00:00:00Z', symbol: 'MIDDLE' }),
    ]
    const { container } = renderWithRouter(<PredictionHistoryTable predictions={predictions} />)
    const cells = container.querySelectorAll('tbody td.font-mono a')
    const symbols = Array.from(cells).map((el) => el.textContent)
    expect(symbols).toEqual(['NEWEST', 'MIDDLE', 'OLDEST'])
  })
})
