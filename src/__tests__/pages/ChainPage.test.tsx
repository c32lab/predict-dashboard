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
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof useIndustryChain>)
    const { container } = render(<ChainPage />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('shows error state', () => {
    vi.mocked(useIndustryChain).mockReturnValue({
      data: undefined,
      error: new Error('Failed'),
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof useIndustryChain>)
    render(<ChainPage />)
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    vi.mocked(useIndustryChain).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof useIndustryChain>)
    render(<ChainPage />)
    expect(screen.getByText('No industry chain data available')).toBeInTheDocument()
  })

  it('renders chain section with data', () => {
    vi.mocked(useIndustryChain).mockReturnValue({
      data: { nodes: [{ id: '1', name: 'BTC', type: 'core', labels: [] }], edges: [] },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof useIndustryChain>)
    render(<ChainPage />)
    expect(screen.getByText('Industry Chain')).toBeInTheDocument()
    expect(screen.getByTestId('chain-section')).toBeInTheDocument()
  })

  it('renders empty state with null nodes and edges', () => {
    vi.mocked(useIndustryChain).mockReturnValue({
      data: { nodes: null as unknown as never[], edges: null as unknown as never[] },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof useIndustryChain>)
    render(<ChainPage />)
    expect(screen.getByText('No chain nodes found')).toBeInTheDocument()
  })

  it('shows error without .message property', () => {
    vi.mocked(useIndustryChain).mockReturnValue({
      data: undefined,
      error: 'plain error string',
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as unknown as ReturnType<typeof useIndustryChain>)
    render(<ChainPage />)
    expect(screen.getByText(/plain error string/)).toBeInTheDocument()
  })
})
