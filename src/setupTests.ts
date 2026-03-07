import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

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
  ReactFlow: ({ children }: { children?: React.ReactNode }) => children ?? null,
  Background: () => null,
  BackgroundVariant: { Dots: 'dots' },
  Controls: () => null,
  MiniMap: () => null,
}))
