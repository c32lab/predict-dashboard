import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ReasoningFlowGraph from '../../../components/predict/ReasoningFlowGraph'
import type { ReasoningGraph } from '../../../types/predict'

function makeGraph(overrides: Partial<ReasoningGraph> = {}): ReasoningGraph {
  return {
    prediction_id: 1,
    nodes: [
      { id: 'n1', type: 'source', data: { label: 'Source Node' }, position: { x: 0, y: 0 } },
      { id: 'n2', type: 'event', data: { label: 'Event Node' }, position: { x: 100, y: 0 } },
      { id: 'n3', type: 'symbol', data: { label: 'BTC', direction: 'SHORT' }, position: { x: 200, y: 0 } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', label: 'triggers' },
      { id: 'e2', source: 'n2', target: 'n3' },
    ],
    ...overrides,
  }
}

describe('ReasoningFlowGraph', () => {
  it('renders without crashing', () => {
    const { container } = render(<ReasoningFlowGraph graph={makeGraph()} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with empty nodes and edges', () => {
    const graph = makeGraph({ nodes: [], edges: [] })
    const { container } = render(<ReasoningFlowGraph graph={graph} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('handles unknown node types gracefully', () => {
    const graph = makeGraph({
      nodes: [
        { id: 'n1', type: 'unknown_type', data: { label: 'Unknown' }, position: { x: 0, y: 0 } },
      ],
      edges: [],
    })
    const { container } = render(<ReasoningFlowGraph graph={graph} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('handles nodes without label in data', () => {
    const graph = makeGraph({
      nodes: [
        { id: 'n1', type: 'source', data: {}, position: { x: 0, y: 0 } },
      ],
      edges: [],
    })
    const { container } = render(<ReasoningFlowGraph graph={graph} />)
    expect(container.firstChild).toBeTruthy()
  })
})
