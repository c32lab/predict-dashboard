import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../../../../components/SectionErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../../../../components/predict/PredictionHistoryTable', () => ({
  PredictionHistoryTable: () => <div>HistoryTable</div>,
}))

import { PredictionHistorySection } from '../../../../components/predict/dashboard/PredictionHistorySection'

describe('PredictionHistorySection', () => {
  const defaultProps = {
    predictions: undefined as undefined,
    total: 0,
    isLoading: false,
    page: 0,
    totalPages: 1,
    onPageChange: vi.fn(),
  }

  it('renders section heading', () => {
    render(<PredictionHistorySection {...defaultProps} />)
    expect(screen.getByText(/Prediction History/)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<PredictionHistorySection {...defaultProps} isLoading={true} />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows empty message when no predictions', () => {
    render(<PredictionHistorySection {...defaultProps} />)
    expect(screen.getByText('No prediction history')).toBeInTheDocument()
  })

  it('renders pagination when total > PAGE_SIZE', async () => {
    const onPageChange = vi.fn()
    render(
      <PredictionHistorySection
        {...defaultProps}
        total={25}
        totalPages={2}
        onPageChange={onPageChange}
      />
    )
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('calls onPageChange when clicking Next', async () => {
    const onPageChange = vi.fn()
    render(
      <PredictionHistorySection
        {...defaultProps}
        total={25}
        totalPages={2}
        onPageChange={onPageChange}
      />
    )
    await userEvent.click(screen.getByText('Next'))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })
})
