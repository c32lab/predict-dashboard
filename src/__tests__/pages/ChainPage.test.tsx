import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock the hook
vi.mock('../../hooks/usePredictApi', () => ({
  useIndustryChain: vi.fn(),
}))

// Mock the child component
vi.mock('../../components/predict/IndustryChainSection', () => ({
  IndustryChainSection: () => <div data-testid="chain-section">Chain Graph</div>,
}))

import { useIndustryChain } from '../../hooks/usePredictApi'
import ChainPage from '../../pages/ChainPage'

describe('ChainPage', () => {
  it('shows loading state', () => {
    vi.mocked(useIndustryChain).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    } as ReturnType<typeof useIndustryChain>)
    render(<ChainPage />)
    expect(screen.getByText('Loading industry chain...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(useIndustryChain).mockReturnValue({
      data: undefined,
      error: new Error('Failed'),
      isLoading: false,
    } as ReturnType<typeof useIndustryChain>)
    render(<ChainPage />)
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    vi.mocked(useIndustryChain).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as ReturnType<typeof useIndustryChain>)
    const { container } = render(<ChainPage />)
    expect(container.innerHTML).toBe('')
  })

  it('renders chain section with data', () => {
    vi.mocked(useIndustryChain).mockReturnValue({
      data: { nodes: [{ id: '1', name: 'BTC', type: 'core', labels: [] }], edges: [] },
      error: undefined,
      isLoading: false,
    } as ReturnType<typeof useIndustryChain>)
    render(<ChainPage />)
    expect(screen.getByText('Industry Chain')).toBeInTheDocument()
    expect(screen.getByTestId('chain-section')).toBeInTheDocument()
  })
})
