import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccuracyStats } from '../../../components/accuracy/AccuracyStats'

describe('AccuracyStats', () => {
  it('shows no validations message when total is 0', () => {
    render(<AccuracyStats total={0} correct={0} accuracyPct={0} />)
    expect(screen.getByText('No validations for selected filter')).toBeInTheDocument()
  })

  it('renders total count', () => {
    render(<AccuracyStats total={10} correct={7} accuracyPct={70} />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('predictions')).toBeInTheDocument()
  })

  it('renders correct count', () => {
    render(<AccuracyStats total={10} correct={7} accuracyPct={70} />)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('of 10')).toBeInTheDocument()
  })

  it('renders accuracy percentage', () => {
    render(<AccuracyStats total={10} correct={7} accuracyPct={70} />)
    expect(screen.getByText('70.0%')).toBeInTheDocument()
  })

  it('applies green color for accuracy > 50%', () => {
    render(<AccuracyStats total={10} correct={7} accuracyPct={70} />)
    const pctEl = screen.getByText('70.0%')
    expect(pctEl.className).toContain('text-green-400')
  })

  it('applies yellow color for accuracy 40-50%', () => {
    render(<AccuracyStats total={10} correct={4} accuracyPct={45} />)
    const pctEl = screen.getByText('45.0%')
    expect(pctEl.className).toContain('text-yellow-400')
  })

  it('applies red color for accuracy < 40%', () => {
    render(<AccuracyStats total={10} correct={3} accuracyPct={30} />)
    const pctEl = screen.getByText('30.0%')
    expect(pctEl.className).toContain('text-red-400')
  })
})
