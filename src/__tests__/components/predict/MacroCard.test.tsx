import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MacroCard } from '../../../components/predict/MacroCard'

describe('MacroCard', () => {
  it('renders label and value', () => {
    render(<MacroCard label="Macro Score" value="7.5" />)
    expect(screen.getByText('Macro Score')).toBeInTheDocument()
    expect(screen.getByText('7.5')).toBeInTheDocument()
  })

  it('renders sub text when provided', () => {
    render(<MacroCard label="Fear & Greed" value="45" sub="Trending down" />)
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('Trending down')).toBeInTheDocument()
  })

  it('does not render sub when not provided', () => {
    const { container } = render(<MacroCard label="Volume" value="1.5" />)
    const spans = container.querySelectorAll('span')
    // Should have label + value = 2 spans, no sub
    expect(spans).toHaveLength(2)
  })

  it('renders dash for missing value', () => {
    render(<MacroCard label="Score" value="—" />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
