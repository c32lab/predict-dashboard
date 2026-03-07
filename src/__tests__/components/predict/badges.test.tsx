import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DirectionBadge, StatusBadge } from '../../../components/predict/badges'

describe('DirectionBadge', () => {
  it('renders LONG with green styling', () => {
    render(<DirectionBadge direction="LONG" />)
    const badge = screen.getByText('LONG')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-green-900')
  })

  it('renders SHORT with red styling', () => {
    render(<DirectionBadge direction="SHORT" />)
    const badge = screen.getByText('SHORT')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-red-900')
  })

  it('is case-insensitive for direction check', () => {
    render(<DirectionBadge direction="long" />)
    const badge = screen.getByText('long')
    expect(badge.className).toContain('bg-green-900')
  })

  it('defaults to red styling for unknown direction', () => {
    render(<DirectionBadge direction="NEUTRAL" />)
    const badge = screen.getByText('NEUTRAL')
    expect(badge.className).toContain('bg-red-900')
  })
})

describe('StatusBadge', () => {
  it('renders active status', () => {
    render(<StatusBadge status="active" />)
    const badge = screen.getByText(/Active/)
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-blue-900')
  })

  it('renders validating status', () => {
    render(<StatusBadge status="validating" />)
    const badge = screen.getByText(/Validating/)
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-yellow-900')
  })

  it('renders validated status', () => {
    render(<StatusBadge status="validated" />)
    const badge = screen.getByText(/Validated/)
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-green-900')
  })

  it('renders expired status', () => {
    render(<StatusBadge status="expired" />)
    const badge = screen.getByText(/Expired/)
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-gray-700')
  })

  it('renders failed status', () => {
    render(<StatusBadge status="failed" />)
    const badge = screen.getByText(/Failed/)
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-red-900')
  })

  it('renders completed status', () => {
    render(<StatusBadge status="completed" />)
    const badge = screen.getByText(/Completed/)
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-green-900')
  })

  it('handles unknown status with fallback', () => {
    render(<StatusBadge status="unknown_status" />)
    const badge = screen.getByText('unknown_status')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-gray-700')
  })

  it('is case-insensitive', () => {
    render(<StatusBadge status="ACTIVE" />)
    const badge = screen.getByText(/Active/)
    expect(badge).toBeInTheDocument()
  })

  it('has title attribute with tooltip', () => {
    render(<StatusBadge status="active" />)
    const badge = screen.getByText(/Active/)
    expect(badge).toHaveAttribute('title', 'Prediction issued, awaiting market validation')
  })
})
