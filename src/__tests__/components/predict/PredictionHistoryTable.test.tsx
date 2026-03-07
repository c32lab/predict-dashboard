import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PredictionHistoryTable } from '../../../components/predict/PredictionHistoryTable'
import type { Prediction } from '../../../types/predict'

// Mock the hooks used by DetailPanel (imported transitively)
vi.mock('../../../hooks/usePredictApi', () => ({
  usePredictionDetail: () => ({ data: null, error: null, isLoading: false, mutate: vi.fn(), isValidating: false }),
  useReasoningGraph: () => ({ data: null, isLoading: false, mutate: vi.fn(), isValidating: false }),
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

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

describe('PredictionHistoryTable', () => {
  it('renders all table headers', () => {
    renderWithRouter(<PredictionHistoryTable predictions={[]} />)
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Direction')).toBeInTheDocument()
    expect(screen.getByText('Confidence')).toBeInTheDocument()
    expect(screen.getByText('Trigger Pattern')).toBeInTheDocument()
    expect(screen.getByText('Expected Impact')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders empty table when no predictions', () => {
    const { container } = renderWithRouter(<PredictionHistoryTable predictions={[]} />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(0)
  })

  it('renders prediction row with correct data', () => {
    renderWithRouter(<PredictionHistoryTable predictions={[makePrediction()]} />)
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('whale_accumulation')).toBeInTheDocument()
  })

  it('renders symbol as a link to prediction detail', () => {
    renderWithRouter(<PredictionHistoryTable predictions={[makePrediction({ id: 42 })]} />)
    const link = screen.getByText('BTC/USDT')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/predictions/42')
  })

  it('formats confidence as percentage (decimal x100)', () => {
    renderWithRouter(<PredictionHistoryTable predictions={[makePrediction({ confidence: 0.72 })]} />)
    expect(screen.getByText('72%')).toBeInTheDocument()
  })

  it('displays expected_impact directly without x100 (already_pct)', () => {
    renderWithRouter(<PredictionHistoryTable predictions={[makePrediction({ expected_impact: 4.2 })]} />)
    expect(screen.getByText('4.2%')).toBeInTheDocument()
  })

  it('shows dash when expected_impact is null', () => {
    renderWithRouter(
      <PredictionHistoryTable predictions={[makePrediction({ expected_impact: null as unknown as number })]} />
    )
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('shows dash when price_at_prediction is null', () => {
    renderWithRouter(
      <PredictionHistoryTable predictions={[makePrediction({ price_at_prediction: null as unknown as number })]} />
    )
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders status badge', () => {
    renderWithRouter(<PredictionHistoryTable predictions={[makePrediction({ status: 'active' })]} />)
    expect(screen.getByText(/Active/)).toBeInTheDocument()
  })

  it('renders direction badge for SHORT', () => {
    renderWithRouter(<PredictionHistoryTable predictions={[makePrediction({ direction: 'SHORT' })]} />)
    expect(screen.getByText('SHORT')).toBeInTheDocument()
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

  it('falls back to timestamp when created_at is missing', () => {
    const predictions = [
      makePrediction({ id: 1, created_at: undefined as unknown as string, timestamp: '2026-03-04T00:00:00Z', symbol: 'OLDER' }),
      makePrediction({ id: 2, created_at: undefined as unknown as string, timestamp: '2026-03-06T00:00:00Z', symbol: 'NEWER' }),
    ]
    const { container } = renderWithRouter(<PredictionHistoryTable predictions={predictions} />)
    const cells = container.querySelectorAll('tbody td.font-mono a')
    const symbols = Array.from(cells).map((el) => el.textContent)
    expect(symbols).toEqual(['NEWER', 'OLDER'])
  })

  it('expands detail panel on row click', async () => {
    const user = userEvent.setup()
    renderWithRouter(
      <PredictionHistoryTable predictions={[makePrediction({ reasoning: 'Test reasoning text' })]} />
    )
    // Click the row to expand
    const row = screen.getByText('BTC/USDT').closest('tr')!
    await user.click(row)
    // DetailPanel renders reasoning text
    expect(screen.getByText('Test reasoning text')).toBeInTheDocument()
  })

  it('collapses detail panel on second click', async () => {
    const user = userEvent.setup()
    renderWithRouter(
      <PredictionHistoryTable predictions={[makePrediction({ reasoning: 'Test reasoning text' })]} />
    )
    const row = screen.getByText('BTC/USDT').closest('tr')!
    await user.click(row)
    expect(screen.getByText('Test reasoning text')).toBeInTheDocument()
    await user.click(row)
    expect(screen.queryByText('Test reasoning text')).not.toBeInTheDocument()
  })

  it('renders multiple predictions', () => {
    const predictions = [
      makePrediction({ id: 1, symbol: 'BTC/USDT' }),
      makePrediction({ id: 2, symbol: 'ETH/USDT' }),
      makePrediction({ id: 3, symbol: 'SOL/USDT' }),
    ]
    renderWithRouter(<PredictionHistoryTable predictions={predictions} />)
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument()
    expect(screen.getByText('SOL/USDT')).toBeInTheDocument()
  })

  it('formats price using formatPrice for BTC', () => {
    renderWithRouter(
      <PredictionHistoryTable predictions={[makePrediction({ price_at_prediction: 65432.10 })]} />
    )
    expect(screen.getByText('$65,432.10')).toBeInTheDocument()
  })
})
