import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock the hook
vi.mock('../../hooks/usePredictApi', () => ({
  usePredictAccuracy: vi.fn(),
}))

// Mock the child component
vi.mock('../../components/predict/AccuracyAndValidationsSection', () => ({
  AccuracyAndValidationsSection: ({ validations }: { validations: unknown[] }) => (
    <div data-testid="accuracy-section">Validations: {validations.length}</div>
  ),
}))

import { usePredictAccuracy } from '../../hooks/usePredictApi'
import AccuracyPage from '../../pages/AccuracyPage'

describe('AccuracyPage', () => {
  it('shows loading state', () => {
    vi.mocked(usePredictAccuracy).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    } as ReturnType<typeof usePredictAccuracy>)
    render(<AccuracyPage />)
    expect(screen.getByText('Loading accuracy data...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(usePredictAccuracy).mockReturnValue({
      data: undefined,
      error: new Error('Network error'),
      isLoading: false,
    } as ReturnType<typeof usePredictAccuracy>)
    render(<AccuracyPage />)
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    expect(screen.getByText(/Network error/)).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    vi.mocked(usePredictAccuracy).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as ReturnType<typeof usePredictAccuracy>)
    const { container } = render(<AccuracyPage />)
    expect(container.innerHTML).toBe('')
  })

  it('renders accuracy section with data', () => {
    vi.mocked(usePredictAccuracy).mockReturnValue({
      data: {
        accuracy: { '1d': { total: 10, correct: 6, accuracy: 60 } },
        recent_validations: [{ id: 1 }],
      },
      error: undefined,
      isLoading: false,
    } as ReturnType<typeof usePredictAccuracy>)
    render(<AccuracyPage />)
    expect(screen.getByText('Prediction Accuracy')).toBeInTheDocument()
    expect(screen.getByTestId('accuracy-section')).toBeInTheDocument()
  })
})
