import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReviewOverviewPage from '../../pages/ReviewOverviewPage'

describe('ReviewOverviewPage', () => {
  it('renders page title and description', () => {
    render(<ReviewOverviewPage />)
    expect(screen.getByText('Prediction Review / Postmortem')).toBeInTheDocument()
    expect(screen.getByText(/Review past predictions/)).toBeInTheDocument()
  })

  it('renders prediction review table with mock data', () => {
    render(<ReviewOverviewPage />)
    expect(screen.getByText('Recent Predictions')).toBeInTheDocument()
    expect(screen.getByText('#101')).toBeInTheDocument()
    expect(screen.getAllByText('BTC').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('82%')).toBeInTheDocument()
  })

  it('shows reasoning chain placeholder before selection', () => {
    render(<ReviewOverviewPage />)
    expect(screen.getByText(/Click a prediction above/)).toBeInTheDocument()
  })

  it('shows reasoning chain after clicking a prediction', () => {
    render(<ReviewOverviewPage />)
    fireEvent.click(screen.getByText('#101'))
    expect(screen.getByText(/Reasoning chain for prediction #101/)).toBeInTheDocument()
    expect(screen.getByText('Trigger Event')).toBeInTheDocument()
    expect(screen.getByText(/Macro CPI data release/)).toBeInTheDocument()
  })

  it('shows default reasoning for predictions without specific mock data', () => {
    render(<ReviewOverviewPage />)
    fireEvent.click(screen.getByText('#103'))
    expect(screen.getByText(/Reasoning chain for prediction #103/)).toBeInTheDocument()
    expect(screen.getByText(/Market event detected/)).toBeInTheDocument()
  })

  it('renders performance attribution section', () => {
    render(<ReviewOverviewPage />)
    expect(screen.getByText('Performance Attribution')).toBeInTheDocument()
    expect(screen.getByText(/reasoning factors contributed/)).toBeInTheDocument()
  })

  it('renders lessons learned cards', () => {
    render(<ReviewOverviewPage />)
    expect(screen.getByText('Patterns that work')).toBeInTheDocument()
    expect(screen.getByText('Patterns that fail')).toBeInTheDocument()
    expect(screen.getByText('Confidence calibration insights')).toBeInTheDocument()
    expect(screen.getByText(/Macro CPI\/PPI releases/)).toBeInTheDocument()
    expect(screen.getByText(/Gas fee spikes alone/)).toBeInTheDocument()
    expect(screen.getByText(/Confidence 80-100%/)).toBeInTheDocument()
  })

  it('highlights selected prediction row', () => {
    render(<ReviewOverviewPage />)
    const row = screen.getByText('#101').closest('tr')!
    expect(row.className).not.toContain('bg-blue-900/30')
    fireEvent.click(row)
    expect(row.className).toContain('bg-blue-900/30')
  })

  it('renders direction badges with correct colors', () => {
    render(<ReviewOverviewPage />)
    const longs = screen.getAllByText('LONG')
    const shorts = screen.getAllByText('SHORT')
    expect(longs[0].className).toContain('text-green-400')
    expect(shorts[0].className).toContain('text-red-400')
  })

  it('renders outcome badges with correct styling', () => {
    render(<ReviewOverviewPage />)
    const correctBadges = screen.getAllByText('Correct')
    const wrongBadges = screen.getAllByText('Wrong')
    expect(correctBadges[0].className).toContain('text-green-400')
    expect(wrongBadges[0].className).toContain('text-red-400')
  })
})
