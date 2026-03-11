import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../../hooks/usePredictApi', () => ({
  useValidationReport: vi.fn(),
  useQualityReport: vi.fn(),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Line: () => null,
  ComposedChart: () => <div data-testid="composed-chart" />,
}))

import { useValidationReport, useQualityReport } from '../../hooks/usePredictApi'
import PatternPerformancePage from '../../pages/PatternPerformancePage'
import type { SWRResponse } from 'swr'
import type { ValidationReport, QualityReport } from '../../types/predict'

const mockValidation: ValidationReport = {
  summary_by_model: {
    institutional_inflow: {
      count: 45,
      '1d_accuracy': 68.9,
      '1d_mae': 2.1,
      '3d_accuracy': 38.5,
      '7d_accuracy': 67.1,
    },
    tariff_shock: {
      count: 12,
      '1d_accuracy': 55.0,
      '1d_mae': 3.2,
      '3d_accuracy': 42.0,
      '7d_accuracy': 50.0,
    },
    whale_transfer: {
      count: 2,
      '1d_accuracy': 90.0,
      '1d_mae': 1.0,
      '3d_accuracy': 80.0,
      '7d_accuracy': 70.0,
    },
  },
}

const mockQuality: QualityReport = {
  total_predictions: 59,
  category_distribution: { institutional_inflow: 45, tariff_shock: 12, whale_transfer: 2 },
  confidence_distribution: {
    '0.5-0.6': { count: 29, accuracy: 0.7 },
    '0.6-0.7': { count: 20, accuracy: 0.65 },
  },
  overall_accuracy: { '1d': 0.69, '3d': 0.385, '7d': 0.671 },
}

function mockHooks(overrides?: {
  validation?: Partial<SWRResponse<ValidationReport>>
  quality?: Partial<SWRResponse<QualityReport>>
}) {
  vi.mocked(useValidationReport).mockReturnValue({
    data: mockValidation,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides?.validation,
  } as SWRResponse<ValidationReport>)

  vi.mocked(useQualityReport).mockReturnValue({
    data: mockQuality,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides?.quality,
  } as SWRResponse<QualityReport>)
}

describe('PatternPerformancePage', () => {
  it('shows loading state', () => {
    mockHooks({ validation: { isLoading: true, data: undefined } })
    const { container } = render(<PatternPerformancePage />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('shows error state', () => {
    mockHooks({ validation: { error: new Error('Network error'), data: undefined } })
    render(<PatternPerformancePage />)
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    expect(screen.getByText(/Network error/)).toBeInTheDocument()
  })

  it('renders header', () => {
    mockHooks()
    render(<PatternPerformancePage />)
    expect(screen.getByText('Pattern Performance')).toBeInTheDocument()
  })

  it('renders summary cards with correct values', () => {
    mockHooks()
    render(<PatternPerformancePage />)
    expect(screen.getByTestId('total-patterns')).toHaveTextContent('3')
    // Best pattern: institutional_inflow (68.9% with count >= 3)
    expect(screen.getByTestId('best-pattern')).toHaveTextContent('Institutional Inflow')
    // Worst pattern: tariff_shock (55.0% with count >= 3) — whale_transfer excluded (count=2)
    expect(screen.getByTestId('worst-pattern')).toHaveTextContent('Tariff Shock')
  })

  it('renders pattern table with all rows', () => {
    mockHooks()
    render(<PatternPerformancePage />)
    const table = screen.getByTestId('pattern-table')
    expect(within(table).getByText('Institutional Inflow')).toBeInTheDocument()
    expect(within(table).getByText('Tariff Shock')).toBeInTheDocument()
    expect(within(table).getByText('Whale Transfer')).toBeInTheDocument()
  })

  it('sorts table by clicking column headers', async () => {
    mockHooks()
    render(<PatternPerformancePage />)
    const user = userEvent.setup()

    // Default sort is by count desc — first row should be institutional_inflow (45)
    const table = screen.getByTestId('pattern-table')
    const rows = within(table).getAllByRole('row')
    // row[0] is header, row[1] is first data row
    expect(within(rows[1]).getByText('Institutional Inflow')).toBeInTheDocument()

    // Click "1d Accuracy" to sort by it
    await user.click(screen.getByText(/1d Accuracy/))
    const rowsAfter = within(table).getAllByRole('row')
    // Desc sort by 1d accuracy: whale_transfer (90) > institutional_inflow (68.9) > tariff_shock (55)
    expect(within(rowsAfter[1]).getByText('Whale Transfer')).toBeInTheDocument()

    // Click again to toggle to ascending
    await user.click(screen.getByText(/1d Accuracy/))
    const rowsAsc = within(table).getAllByRole('row')
    expect(within(rowsAsc[1]).getByText('Tariff Shock')).toBeInTheDocument()
  })

  it('renders chart sections when quality data is available', () => {
    mockHooks()
    render(<PatternPerformancePage />)
    // Charts are wrapped in SectionErrorBoundary with titles
    // The chart components render inside responsive containers
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(2)
  })
})
