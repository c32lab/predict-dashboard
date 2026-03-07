import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from '../../../components/backtest/KpiCard'

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Accuracy" value="85%" />)
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('renders optional sub text', () => {
    render(<KpiCard label="Total" value="120" sub="out of 150" />)
    expect(screen.getByText('out of 150')).toBeInTheDocument()
  })

  it('omits sub when not provided', () => {
    const { container } = render(<KpiCard label="Score" value="42" />)
    const subElements = container.querySelectorAll('.text-xs.text-gray-400')
    expect(subElements).toHaveLength(0)
  })
})
