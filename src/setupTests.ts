import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { createElement } from 'react'

// Mock ResizeObserver for jsdom (needed by recharts ResponsiveContainer)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

// Mock recharts ResponsiveContainer to render children directly
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  }
})

// Mock @xyflow/react (ReactFlow requires DOM measurements)
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children, onNodeClick, nodes }: {
    children?: React.ReactNode
    onNodeClick?: (event: unknown, node: { id: string }) => void
    nodes?: Array<{ id: string; data: { label: string }; style?: Record<string, unknown> }>
  }) => createElement('div', { 'data-testid': 'reactflow' },
    ...(nodes ?? []).map((n) =>
      createElement('div', {
        key: n.id,
        'data-testid': `rf-node-${n.id}`,
        style: n.style,
        onClick: () => onNodeClick?.({}, n),
      }, String(n.data.label))
    ),
    children,
  ),
  Background: () => null,
  BackgroundVariant: { Dots: 'dots' },
  Controls: () => null,
  MiniMap: () => null,
}))
