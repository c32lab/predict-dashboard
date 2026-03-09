import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FindingsCards } from '../../../components/backtest/FindingsCards'

const findings = [
  'Overall prediction accuracy: 52.6% (30/57 validations)',
  'Best horizon: 1d (61.9%), worst: 3d (26.7%)',
  'BTC event conduction: best altcoin=LINKUSDT (63.3%), worst=XRPUSDT (55.6%)',
]

const suggestions = [
  'SHORT direction accuracy (40.6%) is significantly lower than the other (68.0%). Consider adjusting thresholds.',
  'Parameter sweep recommends: confidence threshold=0.4, direction threshold=0.3%',
]

describe('FindingsCards', () => {
  it('renders findings section title', () => {
    render(<FindingsCards findings={findings} suggestions={suggestions} />)
    expect(screen.getByText('Key Findings')).toBeInTheDocument()
  })

  it('renders action items section title', () => {
    render(<FindingsCards findings={findings} suggestions={suggestions} />)
    expect(screen.getByText('Action Items')).toBeInTheDocument()
  })

  it('renders all findings', () => {
    render(<FindingsCards findings={findings} suggestions={suggestions} />)
    for (const f of findings) {
      expect(screen.getByText(f)).toBeInTheDocument()
    }
  })

  it('renders all suggestions', () => {
    render(<FindingsCards findings={findings} suggestions={suggestions} />)
    for (const s of suggestions) {
      expect(screen.getByText(s)).toBeInTheDocument()
    }
  })

  it('renders checkboxes for suggestions', () => {
    render(<FindingsCards findings={findings} suggestions={suggestions} />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(suggestions.length)
  })

  it('toggles checkbox on click', () => {
    render(<FindingsCards findings={findings} suggestions={suggestions} />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).not.toBeChecked()
    fireEvent.click(checkboxes[0])
    expect(checkboxes[0]).toBeChecked()
  })

  it('applies line-through style when checked', () => {
    render(<FindingsCards findings={findings} suggestions={suggestions} />)
    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)
    const label = screen.getByText(suggestions[0])
    expect(label.className).toContain('line-through')
  })

  it('classifies findings with "best" as success type', () => {
    render(<FindingsCards findings={['Best horizon: 1d']} suggestions={[]} />)
    const text = screen.getByText('Best horizon: 1d')
    // Walk up to the card div (p -> div.flex -> div.border)
    const card = text.closest('.border')
    expect(card?.className).toContain('bg-green-950')
  })

  it('renders empty findings gracefully', () => {
    render(<FindingsCards findings={[]} suggestions={[]} />)
    expect(screen.getByText('Key Findings')).toBeInTheDocument()
    expect(screen.getByText('Action Items')).toBeInTheDocument()
  })
})
