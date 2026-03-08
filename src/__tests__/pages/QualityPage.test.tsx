import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../components/accuracy/QualityReportPanel', () => ({
  QualityReportPanel: () => <div data-testid="quality-report">QualityReport</div>,
}))

import QualityPage from '../../pages/QualityPage'

describe('QualityPage', () => {
  it('renders heading and description', () => {
    render(<QualityPage />)
    expect(screen.getByText('Quality Report')).toBeInTheDocument()
    expect(screen.getByText(/Confidence distribution/)).toBeInTheDocument()
  })

  it('renders quality report panel', () => {
    render(<QualityPage />)
    expect(screen.getByTestId('quality-report')).toBeInTheDocument()
  })
})
