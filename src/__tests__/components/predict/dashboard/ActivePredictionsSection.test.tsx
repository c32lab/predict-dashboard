import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../../../components/SectionErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../../../../components/predict', () => ({
  PredictionTable: () => <div>PredictionTable</div>,
}))

import { ActivePredictionsSection } from '../../../../components/predict/dashboard/ActivePredictionsSection'

describe('ActivePredictionsSection', () => {
  it('renders section heading with count', () => {
    render(
      <MemoryRouter>
        <ActivePredictionsSection predictions={[]} />
      </MemoryRouter>
    )
    expect(screen.getByText(/Active Predictions/)).toBeInTheDocument()
    expect(screen.getByText('(0)')).toBeInTheDocument()
  })

  it('shows empty message when no predictions', () => {
    render(
      <MemoryRouter>
        <ActivePredictionsSection predictions={[]} />
      </MemoryRouter>
    )
    expect(screen.getByText('No active predictions')).toBeInTheDocument()
  })
})
