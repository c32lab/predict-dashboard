import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../components/predict/DecayDashboard', () => ({
  DecayDashboard: () => <div data-testid="decay-dashboard">DecayDashboard</div>,
}))

import DecayPage from '../../pages/DecayPage'

describe('DecayPage', () => {
  it('renders heading and description', () => {
    render(<DecayPage />)
    expect(screen.getByText('Decay Analysis')).toBeInTheDocument()
    expect(screen.getByText(/Active decay impact/)).toBeInTheDocument()
  })

  it('renders decay dashboard', () => {
    render(<DecayPage />)
    expect(screen.getByTestId('decay-dashboard')).toBeInTheDocument()
  })
})
