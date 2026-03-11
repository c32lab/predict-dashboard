import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DeltaBadge from '../../../components/ui/DeltaBadge'

describe('DeltaBadge', () => {
  it('renders positive delta with green arrow', () => {
    render(<DeltaBadge current={80} previous={60} format="number" />)
    const el = screen.getByText(/▲/)
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('text-green-400')
  })

  it('renders negative delta with red arrow', () => {
    render(<DeltaBadge current={40} previous={60} format="number" />)
    const el = screen.getByText(/▼/)
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('text-red-400')
  })

  it('renders neutral when values are equal', () => {
    render(<DeltaBadge current={50} previous={50} format="number" />)
    expect(screen.getByText(/→ 0%/)).toBeInTheDocument()
  })

  it('renders zero/zero case', () => {
    render(<DeltaBadge current={0} previous={0} format="number" />)
    expect(screen.getByText(/→ 0%/)).toBeInTheDocument()
  })

  it('renders zero/zero case with percent format', () => {
    render(<DeltaBadge current={0} previous={0} format="percent" />)
    expect(screen.getByText(/→ 0pp/)).toBeInTheDocument()
  })

  it('uses pp suffix for percent format', () => {
    render(<DeltaBadge current={70} previous={60} format="percent" />)
    expect(screen.getByText(/pp/)).toBeInTheDocument()
  })

  it('uses % suffix for number format', () => {
    render(<DeltaBadge current={120} previous={100} format="number" />)
    expect(screen.getByText(/%/)).toBeInTheDocument()
  })

  it('inverts colors when invertColor is true', () => {
    render(<DeltaBadge current={80} previous={60} format="number" invertColor />)
    const el = screen.getByText(/▲/)
    expect(el.className).toContain('text-red-400')
  })

  it('inverts colors for negative delta when invertColor is true', () => {
    render(<DeltaBadge current={40} previous={60} format="number" invertColor />)
    const el = screen.getByText(/▼/)
    expect(el.className).toContain('text-green-400')
  })

  it('shows pulse animation for changes > 15%', () => {
    const { container } = render(<DeltaBadge current={200} previous={100} format="number" />)
    const pulse = container.querySelector('.animate-pulse')
    expect(pulse).toBeInTheDocument()
  })

  it('does not show pulse animation for changes <= 15%', () => {
    const { container } = render(<DeltaBadge current={110} previous={100} format="number" />)
    const pulse = container.querySelector('.animate-pulse')
    expect(pulse).not.toBeInTheDocument()
  })

  it('handles previous=0 with non-zero current', () => {
    render(<DeltaBadge current={50} previous={0} format="number" />)
    const el = screen.getByText(/▲/)
    expect(el).toBeInTheDocument()
  })
})
