import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApiError } from '../../../components/ui/ApiError'

describe('ApiError', () => {
  it('renders default message', () => {
    render(<ApiError />)
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('renders custom message', () => {
    render(<ApiError message="Network error" />)
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ApiError onRetry={onRetry} />)
    const btn = screen.getByRole('button', { name: 'Retry' })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not render retry button without onRetry', () => {
    render(<ApiError />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has red border styling', () => {
    const { container } = render(<ApiError />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('border-red-800')
  })
})
