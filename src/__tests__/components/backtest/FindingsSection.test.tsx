import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FindingsSection } from '../../../components/backtest/FindingsSection'

describe('FindingsSection', () => {
  const findings = ['Model overestimates BTC', 'ETH accuracy is low']
  const suggestions = ['Increase confidence threshold', 'Add more training data']

  it('renders Findings and Suggestions headings', () => {
    render(<FindingsSection findings={findings} suggestions={suggestions} />)
    expect(screen.getByText('Findings')).toBeInTheDocument()
    expect(screen.getByText('Suggestions')).toBeInTheDocument()
  })

  it('renders all finding items', () => {
    render(<FindingsSection findings={findings} suggestions={suggestions} />)
    findings.forEach(f => expect(screen.getByText(f)).toBeInTheDocument())
  })

  it('renders all suggestion items', () => {
    render(<FindingsSection findings={findings} suggestions={suggestions} />)
    suggestions.forEach(s => expect(screen.getByText(s)).toBeInTheDocument())
  })

  it('handles empty arrays', () => {
    const { container } = render(<FindingsSection findings={[]} suggestions={[]} />)
    const listItems = container.querySelectorAll('li')
    expect(listItems).toHaveLength(0)
  })
})
