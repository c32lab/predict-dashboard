import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/usePredictApi', () => ({
  useAccuracyHistory: vi.fn(),
}))

import { useAccuracyHistory } from '../../../hooks/usePredictApi'
import { AccuracyHistoryChart } from '../../../components/accuracy/AccuracyHistoryChart'

function mockReturn(overrides: Partial<ReturnType<typeof useAccuracyHistory>>) {
  vi.mocked(useAccuracyHistory).mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useAccuracyHistory>)
}

describe('AccuracyHistoryChart', () => {
  it('shows loading state', () => {
    mockReturn({ isLoading: true })
    render(<AccuracyHistoryChart />)
    expect(screen.getByText('Loading accuracy history...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockReturn({ error: new Error('timeout') })
    render(<AccuracyHistoryChart />)
    expect(screen.getByText(/Failed to load accuracy history/)).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    mockReturn({})
    const { container } = render(<AccuracyHistoryChart />)
    expect(container.innerHTML).toBe('')
  })

  it('renders with data', () => {
    mockReturn({
      data: {
        accuracy_history: [
          { date: '2026-03-06', total: 10, correct: 6, accuracy: 60 },
          { date: '2026-03-07', total: 8, correct: 5, accuracy: 62.5 },
        ],
        by_direction: {
          LONG: { total: 12, correct: 7, accuracy: 58.3 },
          SHORT: { total: 6, correct: 4, accuracy: 66.7 },
        },
        by_pattern: {
          whale_alert: { total: 5, correct: 3, accuracy: 60 },
          etf_flow: { total: 3, correct: 2, accuracy: 66.7 },
        },
        overall: { total: 18, correct: 11, accuracy: 61.1 },
        window: 100,
      },
    })
    render(<AccuracyHistoryChart />)
    expect(screen.getByText('Accuracy History')).toBeInTheDocument()
    expect(screen.getByText(/Overall/)).toBeInTheDocument()
    expect(screen.getByText('Daily Accuracy Trend')).toBeInTheDocument()
    expect(screen.getByText('Accuracy by Direction')).toBeInTheDocument()
    expect(screen.getByText('Accuracy by Pattern')).toBeInTheDocument()
    expect(screen.getByText('whale_alert')).toBeInTheDocument()
  })

  it('renders empty history gracefully', () => {
    mockReturn({
      data: {
        accuracy_history: [],
        by_direction: {},
        by_pattern: {},
        overall: { total: 0, correct: 0, accuracy: 0 },
        window: 100,
      },
    })
    render(<AccuracyHistoryChart />)
    expect(screen.getByText('No history data')).toBeInTheDocument()
    expect(screen.getByText('No direction data')).toBeInTheDocument()
  })
})
