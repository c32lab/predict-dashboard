import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConfidenceFactorsSection } from '../../../../components/predict/detail/ConfidenceFactorsSection'

describe('ConfidenceFactorsSection', () => {
  it('renders nothing when factors is empty', () => {
    const { container } = render(<ConfidenceFactorsSection factors={{}} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when factors is null-ish', () => {
    const { container } = render(<ConfidenceFactorsSection factors={null as unknown as Record<string, number>} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders section heading', () => {
    render(<ConfidenceFactorsSection factors={{ momentum: 0.8 }} />)
    expect(screen.getByText('Confidence Factors')).toBeInTheDocument()
  })

  it('renders factor names and percentages', () => {
    const factors = { momentum: 0.85, volume: 0.6, sentiment: 0.45 }
    render(<ConfidenceFactorsSection factors={factors} />)
    expect(screen.getByText('momentum')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('volume')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('sentiment')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()
  })

  it('renders progress bars with correct widths', () => {
    const { container } = render(<ConfidenceFactorsSection factors={{ test: 0.75 }} />)
    const progressBar = container.querySelector('.bg-blue-500')
    expect(progressBar).toHaveStyle({ width: '75%' })
  })

  it('caps progress bar width at 100%', () => {
    const { container } = render(<ConfidenceFactorsSection factors={{ overflow: 1.5 }} />)
    const progressBar = container.querySelector('.bg-blue-500')
    expect(progressBar).toHaveStyle({ width: '100%' })
  })

  it('renders multiple factors', () => {
    const factors = { a: 0.1, b: 0.2, c: 0.3, d: 0.4 }
    render(<ConfidenceFactorsSection factors={factors} />)
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(screen.getByText('c')).toBeInTheDocument()
    expect(screen.getByText('d')).toBeInTheDocument()
  })
})
