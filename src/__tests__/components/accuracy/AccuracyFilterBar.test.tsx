import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccuracyFilterBar } from '../../../components/accuracy/AccuracyFilterBar'

describe('AccuracyFilterBar', () => {
  const defaultProps = {
    symbolFilter: 'all',
    onSymbolChange: () => {},
    timeRange: '30d' as const,
    onTimeRangeChange: () => {},
    symbols: ['BTC/USDT', 'ETH/USDT'],
  }

  it('renders symbol select with all option', () => {
    render(<AccuracyFilterBar {...defaultProps} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('All Symbols')).toBeInTheDocument()
  })

  it('renders symbol options', () => {
    render(<AccuracyFilterBar {...defaultProps} />)
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument()
  })

  it('renders time range buttons', () => {
    render(<AccuracyFilterBar {...defaultProps} />)
    expect(screen.getByText('7d')).toBeInTheDocument()
    expect(screen.getByText('14d')).toBeInTheDocument()
    expect(screen.getByText('30d')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
  })

  it('highlights active time range', () => {
    render(<AccuracyFilterBar {...defaultProps} timeRange="7d" />)
    const btn = screen.getByText('7d')
    expect(btn.className).toContain('bg-blue-700')
  })

  it('calls onTimeRangeChange when clicking a range button', async () => {
    const onTimeRangeChange = vi.fn()
    render(<AccuracyFilterBar {...defaultProps} onTimeRangeChange={onTimeRangeChange} />)
    await userEvent.click(screen.getByText('7d'))
    expect(onTimeRangeChange).toHaveBeenCalledWith('7d')
  })

  it('calls onSymbolChange when selecting a symbol', async () => {
    const onSymbolChange = vi.fn()
    render(<AccuracyFilterBar {...defaultProps} onSymbolChange={onSymbolChange} />)
    await userEvent.selectOptions(screen.getByRole('combobox'), 'BTC/USDT')
    expect(onSymbolChange).toHaveBeenCalledWith('BTC/USDT')
  })
})
