import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ChainNode, ChainEdge } from '../../../types/predict'

// Mock @xyflow/react — return simple divs for ReactFlow and its sub-components
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ nodes, edges, children }: { nodes: unknown[]; edges: unknown[]; children?: React.ReactNode }) => (
    <div data-testid="react-flow" data-node-count={nodes.length} data-edge-count={edges.length}>
      {children}
    </div>
  ),
  Background: () => <div data-testid="rf-background" />,
  Controls: () => <div data-testid="rf-controls" />,
  MiniMap: () => <div data-testid="rf-minimap" />,
  BackgroundVariant: { Dots: 'dots' },
}))

import { ChainGraph } from '../../../components/predict/ChainGraph'

const makeNode = (id: string, name: string, type: string): ChainNode => ({
  id,
  name,
  type,
  labels: [],
})

const makeEdge = (from: string, to: string, relation = 'chain_member', strength = 0.8): ChainEdge => ({
  from_node: from,
  to_node: to,
  relation,
  strength,
})

describe('ChainGraph', () => {
  it('renders "No nodes match the filter" when filteredNodes is empty', () => {
    render(<ChainGraph filteredNodes={[]} edges={[]} />)
    expect(screen.getByText('No nodes match the filter')).toBeInTheDocument()
  })

  it('does not render ReactFlow when no nodes', () => {
    render(<ChainGraph filteredNodes={[]} edges={[]} />)
    expect(screen.queryByTestId('react-flow')).not.toBeInTheDocument()
  })

  it('renders ReactFlow when nodes are provided', () => {
    const nodes = [makeNode('n1', 'Bitcoin', 'core')]
    render(<ChainGraph filteredNodes={nodes} edges={[]} />)
    expect(screen.getByTestId('react-flow')).toBeInTheDocument()
  })

  it('passes correct node count to ReactFlow', () => {
    const nodes = [
      makeNode('n1', 'Bitcoin', 'core'),
      makeNode('n2', 'Mining', 'upstream'),
      makeNode('n3', 'DeFi', 'downstream'),
    ]
    render(<ChainGraph filteredNodes={nodes} edges={[]} />)
    expect(screen.getByTestId('react-flow')).toHaveAttribute('data-node-count', '3')
  })

  it('filters edges to only include those connecting filtered nodes', () => {
    const nodes = [
      makeNode('n1', 'Bitcoin', 'core'),
      makeNode('n2', 'Mining', 'upstream'),
    ]
    const edges = [
      makeEdge('n1', 'n2'),                    // both nodes present — included
      makeEdge('n1', 'n_missing'),              // target not in nodes — excluded
      makeEdge('n_other', 'n2'),                // source not in nodes — excluded
    ]
    render(<ChainGraph filteredNodes={nodes} edges={edges} />)
    // Only 1 edge should pass the filter
    expect(screen.getByTestId('react-flow')).toHaveAttribute('data-edge-count', '1')
  })

  it('renders Background, Controls, and MiniMap sub-components', () => {
    const nodes = [makeNode('n1', 'Bitcoin', 'core')]
    render(<ChainGraph filteredNodes={nodes} edges={[]} />)
    expect(screen.getByTestId('rf-background')).toBeInTheDocument()
    expect(screen.getByTestId('rf-controls')).toBeInTheDocument()
    expect(screen.getByTestId('rf-minimap')).toBeInTheDocument()
  })

  it('handles nodes with unknown types gracefully', () => {
    const nodes = [
      makeNode('n1', 'CustomNode', 'unknown_type'),
    ]
    render(<ChainGraph filteredNodes={nodes} edges={[]} />)
    expect(screen.getByTestId('react-flow')).toHaveAttribute('data-node-count', '1')
  })

  it('handles multiple node types grouped into columns', () => {
    const nodes = [
      makeNode('n1', 'Bitcoin', 'core'),
      makeNode('n2', 'Ethereum', 'core'),
      makeNode('n3', 'Mining', 'upstream'),
      makeNode('n4', 'DeFi', 'downstream'),
    ]
    const edges = [
      makeEdge('n1', 'n3', 'has_ticker'),
      makeEdge('n1', 'n4', 'affects_ticker', 0.5),
    ]
    render(<ChainGraph filteredNodes={nodes} edges={edges} />)
    expect(screen.getByTestId('react-flow')).toHaveAttribute('data-node-count', '4')
    expect(screen.getByTestId('react-flow')).toHaveAttribute('data-edge-count', '2')
  })

  it('includes all edges when all referenced nodes are present', () => {
    const nodes = [
      makeNode('a', 'A', 'theme'),
      makeNode('b', 'B', 'core'),
      makeNode('c', 'C', 'ticker'),
    ]
    const edges = [
      makeEdge('a', 'b'),
      makeEdge('b', 'c'),
      makeEdge('a', 'c'),
    ]
    render(<ChainGraph filteredNodes={nodes} edges={edges} />)
    expect(screen.getByTestId('react-flow')).toHaveAttribute('data-edge-count', '3')
  })
})
