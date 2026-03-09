import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MarketCycleSelector } from '../../../components/backtest/TimeRangeSelector'

describe('MarketCycleSelector', () => {
  it('renders all cycle options', () => {
    render(<MarketCycleSelector selected="all" onSelect={() => {}} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Bull Market')).toBeInTheDocument()
    expect(screen.getByText('Bear Market')).toBeInTheDocument()
    expect(screen.getByText('Sideways')).toBeInTheDocument()
  })

  it('renders section title', () => {
    render(<MarketCycleSelector selected="all" onSelect={() => {}} />)
    expect(screen.getByText('Market Cycle Filter')).toBeInTheDocument()
  })

  it('highlights selected option', () => {
    render(<MarketCycleSelector selected="bull" onSelect={() => {}} />)
    const bullBtn = screen.getByText('Bull Market')
    expect(bullBtn.className).toContain('bg-green-600')
  })

  it('calls onSelect when option clicked', () => {
    const onSelect = vi.fn()
    render(<MarketCycleSelector selected="all" onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Bear Market'))
    expect(onSelect).toHaveBeenCalledWith('bear')
  })

  it('shows placeholder text when non-all selected', () => {
    render(<MarketCycleSelector selected="bull" onSelect={() => {}} />)
    expect(screen.getByText(/Filtering by Bull Market/)).toBeInTheDocument()
  })

  it('does not show placeholder text when all selected', () => {
    render(<MarketCycleSelector selected="all" onSelect={() => {}} />)
    expect(screen.queryByText(/Filtering by/)).not.toBeInTheDocument()
  })
})
