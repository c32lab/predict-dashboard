import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IndustryChainSection } from '../../../components/predict/IndustryChainSection'
import type { ChainNode, ChainEdge } from '../../../types/predict'

const mockNodes: ChainNode[] = [
  { id: 'n1', name: 'Bitcoin', type: 'core', labels: ['crypto'] },
  { id: 'n2', name: 'Mining', type: 'upstream', labels: ['industry'] },
  { id: 'n3', name: 'DeFi', type: 'downstream', labels: ['sector'] },
]

const mockEdges: ChainEdge[] = [
  { from_node: 'n1', to_node: 'n2', relation: 'has_ticker', strength: 0.8 },
  { from_node: 'n1', to_node: 'n3', relation: 'affects_ticker', strength: 0.6 },
]

describe('IndustryChainSection', () => {
  it('renders search input', () => {
    render(<IndustryChainSection nodes={mockNodes} edges={mockEdges} />)
    expect(screen.getByPlaceholderText('Search nodes…')).toBeInTheDocument()
  })

  it('renders All filter button with count', () => {
    render(<IndustryChainSection nodes={mockNodes} edges={mockEdges} />)
    expect(screen.getByText(`All (${mockNodes.length})`)).toBeInTheDocument()
  })

  it('renders type filter buttons', () => {
    render(<IndustryChainSection nodes={mockNodes} edges={mockEdges} />)
    expect(screen.getByText('core (1)')).toBeInTheDocument()
    expect(screen.getByText('upstream (1)')).toBeInTheDocument()
    expect(screen.getByText('downstream (1)')).toBeInTheDocument()
  })

  it('renders with empty nodes', () => {
    render(<IndustryChainSection nodes={[]} edges={[]} />)
    expect(screen.getByText('All (0)')).toBeInTheDocument()
    expect(screen.getByText('No nodes match the filter')).toBeInTheDocument()
  })

  it('filters nodes by type when clicking type button', async () => {
    const user = userEvent.setup()
    render(<IndustryChainSection nodes={mockNodes} edges={mockEdges} />)
    const coreButton = screen.getByText('core (1)')
    await user.click(coreButton)
    expect(screen.queryByText('No nodes match the filter')).not.toBeInTheDocument()
  })

  it('renders legend panel', () => {
    render(<IndustryChainSection nodes={mockNodes} edges={mockEdges} />)
    expect(screen.getByText('Node types')).toBeInTheDocument()
    expect(screen.getByText('Edge relations')).toBeInTheDocument()
    expect(screen.getByText('Edge strength')).toBeInTheDocument()
  })

  it('keeps all nodes visible when searching (highlight mode)', async () => {
    const user = userEvent.setup()
    render(<IndustryChainSection nodes={mockNodes} edges={mockEdges} />)
    const searchInput = screen.getByPlaceholderText('Search nodes…')
    await user.type(searchInput, 'Bitcoin')
    // All nodes remain visible (not filtered out)
    expect(screen.queryByText('No nodes match the filter')).not.toBeInTheDocument()
  })
})
