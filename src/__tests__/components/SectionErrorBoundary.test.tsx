import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type React from 'react'
import SectionErrorBoundary from '../../components/SectionErrorBoundary'

function FailingChild(): React.JSX.Element {
  throw new Error('Test error message')
}

function WorkingChild() {
  return <div>Working content</div>
}

describe('SectionErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <SectionErrorBoundary>
        <WorkingChild />
      </SectionErrorBoundary>
    )
    expect(screen.getByText('Working content')).toBeInTheDocument()
  })

  it('shows error fallback when child throws', () => {
    // Suppress React error boundary console output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <SectionErrorBoundary title="Test Section">
        <FailingChild />
      </SectionErrorBoundary>
    )
    expect(screen.getByText(/Failed to render Test Section/)).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('shows fallback without title', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <SectionErrorBoundary>
        <FailingChild />
      </SectionErrorBoundary>
    )
    expect(screen.getByText('Failed to render')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('has a retry button', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <SectionErrorBoundary>
        <FailingChild />
      </SectionErrorBoundary>
    )
    expect(screen.getByText('Retry')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('toggles stack trace visibility', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    render(
      <SectionErrorBoundary>
        <FailingChild />
      </SectionErrorBoundary>
    )
    // Initially trace is hidden
    expect(screen.getByText(/Show trace/)).toBeInTheDocument()
    // Click to show trace
    await user.click(screen.getByText(/Show trace/))
    expect(screen.getByText(/Hide trace/)).toBeInTheDocument()
    spy.mockRestore()
  })
})
