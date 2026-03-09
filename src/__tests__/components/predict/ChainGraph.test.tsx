import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ChainNode, ChainEdge } from '../../../types/predict'

// Mock @xyflow/react — return simple divs for ReactFlow and its sub-components
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ nodes, edges, children, onNodeClick }: { nodes: Array<{ id: string; data: { label: string }; style?: Record<string, unknown> }>; edges: unknown[]; children?: React.ReactNode; onNodeClick?: (event: unknown, node: { id: string }) => void }) => (
    <div data-testid="react-flow" data-node-count={nodes.length} data-edge-count={edges.length}>
      {nodes.map((n) => (
        <div
          key={n.id}
          data-testid={`rf-node-${n.id}`}
          style={n.style as React.CSSProperties}
          onClick={() => onNodeClick?.({}, n)}
        >
          {String(n.data.label)}
        </div>
      ))}
      {children}
    </div>
  ),
  Background: () => <div data-testid="rf-background" />,
  Controls: () => <div data-testid="rf-controls" />,
  MiniMap: ({ nodeColor }: { nodeColor?: (n: { id: string }) => string }) => {
    const color1 = nodeColor?.({ id: 'n1' })
    const color2 = nodeColor?.({ id: 'nonexistent' })
    return <div data-testid="rf-minimap" data-color1={color1} data-color2={color2} />
  },
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
      makeEdge('n1', 'n2'),
      makeEdge('n1', 'n_missing'),
      makeEdge('n_other', 'n2'),
    ]
    render(<ChainGraph filteredNodes={nodes} edges={edges} />)
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
    const nodes = [makeNode('n1', 'CustomNode', 'unknown_type')]
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

  it('dims non-highlighted nodes when highlightedIds is provided', () => {
    const nodes = [
      makeNode('n1', 'Bitcoin', 'core'),
      makeNode('n2', 'Mining', 'upstream'),
    ]
    const highlighted = new Set(['n1'])
    render(<ChainGraph filteredNodes={nodes} edges={[]} highlightedIds={highlighted} />)
    const n1 = screen.getByTestId('rf-node-n1')
    const n2 = screen.getByTestId('rf-node-n2')
    expect(n1.style.opacity).toBe('1')
    expect(n2.style.opacity).toBe('0.3')
  })

  it('calls onNodeClick when a node is clicked', () => {
    const nodes = [makeNode('n1', 'Bitcoin', 'core')]
    const onClick = vi.fn()
    render(<ChainGraph filteredNodes={nodes} edges={[]} onNodeClick={onClick} />)
    fireEvent.click(screen.getByTestId('rf-node-n1'))
    expect(onClick).toHaveBeenCalledWith('n1', 'Bitcoin')
  })
})
