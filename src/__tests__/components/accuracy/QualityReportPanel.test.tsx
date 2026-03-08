import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/usePredictApi', () => ({
  useQualityReport: vi.fn(),
}))

import { useQualityReport } from '../../../hooks/usePredictApi'
import { QualityReportPanel } from '../../../components/accuracy/QualityReportPanel'

function mockReturn(overrides: Partial<ReturnType<typeof useQualityReport>>) {
  vi.mocked(useQualityReport).mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useQualityReport>)
}

describe('QualityReportPanel', () => {
  it('shows loading state', () => {
    mockReturn({ isLoading: true })
    render(<QualityReportPanel />)
    expect(screen.getByText('Loading quality report...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockReturn({ error: new Error('API down') })
    render(<QualityReportPanel />)
    expect(screen.getByText(/Failed to load quality report/)).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    mockReturn({})
    const { container } = render(<QualityReportPanel />)
    expect(container.innerHTML).toBe('')
  })

  it('renders with data', () => {
    mockReturn({
      data: {
        total_predictions: 42,
        confidence_distribution: {
          '0.6-0.7': { count: 10, accuracy: 65 },
          '0.7-0.8': { count: 8, accuracy: 45 },
        },
        category_distribution: { macro: 20, event: 22 },
        overall_accuracy: { '1d': 62.5, '3d': 55.0 },
      },
    })
    render(<QualityReportPanel />)
    expect(screen.getByText('Quality Report')).toBeInTheDocument()
    expect(screen.getByText('42 predictions')).toBeInTheDocument()
    expect(screen.getByText('Confidence vs Accuracy')).toBeInTheDocument()
    expect(screen.getByText('Category Distribution')).toBeInTheDocument()
    expect(screen.getByText('Confidence Calibration')).toBeInTheDocument()
    expect(screen.getByText('Predictions by Category')).toBeInTheDocument()
    expect(screen.getByText('Overall Accuracy by Horizon')).toBeInTheDocument()
    expect(screen.getByText('1d')).toBeInTheDocument()
    expect(screen.getByText('62.5%')).toBeInTheDocument()
  })

  it('renders empty distributions gracefully', () => {
    mockReturn({
      data: {
        total_predictions: 0,
        confidence_distribution: {},
        category_distribution: {},
        overall_accuracy: {},
      },
    })
    render(<QualityReportPanel />)
    expect(screen.getByText('Quality Report')).toBeInTheDocument()
    expect(screen.getAllByText('No data')).toHaveLength(4)
  })
})
