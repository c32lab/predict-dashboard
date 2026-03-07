import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../../components/SectionErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../../../../components/predict/TrendsSection', () => ({
  TrendsSection: ({ trends }: { trends: unknown[] }) => <div>Trends({trends.length})</div>,
}))

import { TrendDiscoverySection } from '../../../../components/predict/dashboard/TrendDiscoverySection'

describe('TrendDiscoverySection', () => {
  it('renders section heading', () => {
    render(<TrendDiscoverySection trends={[]} isLoading={false} />)
    expect(screen.getByText(/Trend Discovery/)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<TrendDiscoverySection trends={[]} isLoading={true} />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders trends when loaded', () => {
    render(<TrendDiscoverySection trends={[{ id: 1 } as never]} isLoading={false} />)
    expect(screen.getByText('Trends(1)')).toBeInTheDocument()
  })
})
