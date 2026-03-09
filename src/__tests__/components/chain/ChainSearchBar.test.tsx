import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ChainNode } from '../../../types/predict'
import { ChainSearchBar } from '../../../components/chain/ChainSearchBar'

const mockNodes: ChainNode[] = [
  { id: 'n1', name: 'Bitcoin', type: 'asset', labels: [] },
  { id: 'n2', name: 'DeFi', type: 'theme', labels: [] },
  { id: 'n3', name: 'Finance', type: 'sector', labels: [] },
  { id: 'n4', name: 'Rates', type: 'macro', labels: [] },
]

describe('ChainSearchBar', () => {
  const defaultProps = {
    search: '',
    onSearchChange: vi.fn(),
    typeFilter: 'all',
    onTypeFilterChange: vi.fn(),
    nodes: mockNodes,
    matchCount: 0,
  }

  it('renders search input', () => {
    render(<ChainSearchBar {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search nodes…')).toBeInTheDocument()
  })

  it('renders All button with total count', () => {
    render(<ChainSearchBar {...defaultProps} />)
    expect(screen.getByText('All (4)')).toBeInTheDocument()
  })

  it('renders type filter buttons with counts', () => {
    render(<ChainSearchBar {...defaultProps} />)
    expect(screen.getByText('asset (1)')).toBeInTheDocument()
    expect(screen.getByText('theme (1)')).toBeInTheDocument()
    expect(screen.getByText('sector (1)')).toBeInTheDocument()
    expect(screen.getByText('macro (1)')).toBeInTheDocument()
  })

  it('calls onSearchChange when typing', async () => {
    const onSearchChange = vi.fn()
    render(<ChainSearchBar {...defaultProps} onSearchChange={onSearchChange} />)
    const input = screen.getByPlaceholderText('Search nodes…')
    await userEvent.setup().type(input, 'btc')
    expect(onSearchChange).toHaveBeenCalled()
  })

  it('calls onTypeFilterChange when clicking a type button', async () => {
    const onTypeFilterChange = vi.fn()
    render(<ChainSearchBar {...defaultProps} onTypeFilterChange={onTypeFilterChange} />)
    await userEvent.setup().click(screen.getByText('asset (1)'))
    expect(onTypeFilterChange).toHaveBeenCalledWith('asset')
  })

  it('calls onTypeFilterChange with "all" when clicking All button', async () => {
    const onTypeFilterChange = vi.fn()
    render(<ChainSearchBar {...defaultProps} typeFilter="asset" onTypeFilterChange={onTypeFilterChange} />)
    await userEvent.setup().click(screen.getByText('All (4)'))
    expect(onTypeFilterChange).toHaveBeenCalledWith('all')
  })

  it('shows match count when search is active', () => {
    render(<ChainSearchBar {...defaultProps} search="bit" matchCount={1} />)
    expect(screen.getByText('1 found')).toBeInTheDocument()
  })

  it('does not show match count when search is empty', () => {
    render(<ChainSearchBar {...defaultProps} search="" matchCount={0} />)
    expect(screen.queryByText('0 found')).not.toBeInTheDocument()
  })

  it('shows 0 found when search has no matches', () => {
    render(<ChainSearchBar {...defaultProps} search="xyz" matchCount={0} />)
    expect(screen.getByText('0 found')).toBeInTheDocument()
  })
})
