import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../../components/predict/ReasoningFlowGraph', () => ({
  default: () => <div data-testid="flow-graph" />,
}))

import { ReasoningGraphSection } from '../../../../components/predict/detail/ReasoningGraphSection'
import type { ReasoningGraph } from '../../../../types/predict'

const mockGraph: ReasoningGraph = {
  prediction_id: 1,
  nodes: [
    { id: 'n1', type: 'source', data: { label: 'Source' }, position: { x: 0, y: 0 } },
    { id: 'n2', type: 'event', data: { label: 'Event' }, position: { x: 100, y: 0 } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', label: 'triggers' },
  ],
}

describe('ReasoningGraphSection', () => {
  it('renders section heading', () => {
    render(<ReasoningGraphSection graphData={undefined} isLoading={false} />)
    expect(screen.getByText('Reasoning Graph')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<ReasoningGraphSection graphData={undefined} isLoading={true} />)
    expect(screen.getByText('Loading reasoning graph...')).toBeInTheDocument()
  })

  it('shows empty state when no graph data', () => {
    render(<ReasoningGraphSection graphData={undefined} isLoading={false} />)
    expect(screen.getByText('No reasoning graph data')).toBeInTheDocument()
  })

  it('shows empty state when graph has no nodes', () => {
    const emptyGraph: ReasoningGraph = { prediction_id: 1, nodes: [], edges: [] }
    render(<ReasoningGraphSection graphData={emptyGraph} isLoading={false} />)
    expect(screen.getByText('No reasoning graph data')).toBeInTheDocument()
  })

  it('renders flow graph when data is available', () => {
    render(<ReasoningGraphSection graphData={mockGraph} isLoading={false} />)
    expect(screen.getByTestId('flow-graph')).toBeInTheDocument()
    expect(screen.queryByText('Loading reasoning graph...')).not.toBeInTheDocument()
    expect(screen.queryByText('No reasoning graph data')).not.toBeInTheDocument()
  })

  it('shows loading over graph data (loading takes priority)', () => {
    render(<ReasoningGraphSection graphData={mockGraph} isLoading={true} />)
    expect(screen.getByText('Loading reasoning graph...')).toBeInTheDocument()
    expect(screen.queryByTestId('flow-graph')).not.toBeInTheDocument()
  })
})
