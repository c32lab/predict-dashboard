import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock the hook
vi.mock('../../hooks/usePredictApi', () => ({
  useAccuracyDetail: vi.fn(),
}))

// Mock the child component
vi.mock('../../components/predict/AccuracyAndValidationsSection', () => ({
  AccuracyAndValidationsSection: ({ validations }: { validations: unknown[] }) => (
    <div data-testid="accuracy-section">Validations: {validations.length}</div>
  ),
}))

vi.mock('../../components/accuracy/QualityReportPanel', () => ({
  QualityReportPanel: () => <div data-testid="quality-report">QualityReport</div>,
}))

vi.mock('../../components/accuracy/AccuracyHistoryChart', () => ({
  AccuracyHistoryChart: () => <div data-testid="accuracy-history">AccuracyHistory</div>,
}))

vi.mock('../../components/accuracy/DirectionRadarChart', () => ({
  DirectionRadarChart: () => <div data-testid="direction-radar">DirectionRadar</div>,
}))

vi.mock('../../components/accuracy/RollingAccuracyChart', () => ({
  RollingAccuracyChart: () => <div data-testid="rolling-accuracy">RollingAccuracy</div>,
}))

import { useAccuracyDetail } from '../../hooks/usePredictApi'
import AccuracyPage from '../../pages/AccuracyPage'

type AccuracyDetailReturn = ReturnType<typeof useAccuracyDetail>

function mockReturn(overrides: Partial<AccuracyDetailReturn>) {
  vi.mocked(useAccuracyDetail).mockReturnValue({
    accuracy: undefined,
    predictions: undefined,
    error: undefined,
    isLoading: false,
    ...overrides,
  } as AccuracyDetailReturn)
}

describe('AccuracyPage', () => {
  it('shows loading state', () => {
    mockReturn({ isLoading: true })
    render(<AccuracyPage />)
    expect(screen.getByText('Loading accuracy data...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockReturn({ error: new Error('Network error') })
    render(<AccuracyPage />)
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    expect(screen.getByText(/Network error/)).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    mockReturn({})
    const { container } = render(<AccuracyPage />)
    expect(container.innerHTML).toBe('')
  })

  it('renders accuracy section with data', () => {
    mockReturn({
      accuracy: {
        accuracy: { '1d': { total: 10, correct: 6, accuracy: 60 } },
        recent_validations: [{ id: 1 }],
      } as unknown as AccuracyDetailReturn['accuracy'],
    })
    render(<AccuracyPage />)
    expect(screen.getByText('Prediction Accuracy')).toBeInTheDocument()
    expect(screen.getByTestId('accuracy-section')).toBeInTheDocument()
  })

  it('renders with null accuracy and validations (fallback to defaults)', () => {
    mockReturn({
      accuracy: {
        accuracy: null,
        recent_validations: null,
      } as unknown as AccuracyDetailReturn['accuracy'],
    })
    render(<AccuracyPage />)
    expect(screen.getByTestId('accuracy-section')).toBeInTheDocument()
  })

  it('shows error without .message property', () => {
    mockReturn({ error: 'raw string error' as unknown as Error })
    render(<AccuracyPage />)
    expect(screen.getByText(/raw string error/)).toBeInTheDocument()
  })
})
