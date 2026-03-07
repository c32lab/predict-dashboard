import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/usePredictApi', () => ({
  usePredictionDetail: vi.fn(() => ({ data: null, error: null, isLoading: false })),
  useReasoningGraph: vi.fn(() => ({ data: null, isLoading: false })),
}))

vi.mock('../../../components/predict/ReasoningFlowGraph', () => ({
  default: () => <div>Graph</div>,
}))

import { usePredictionDetail } from '../../../hooks/usePredictApi'
import { DetailPanel } from '../../../components/predict/DetailPanel'

describe('DetailPanel', () => {
  it('shows loading state', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    render(<DetailPanel id={1} reasoning="" />)
    expect(screen.getByText(/Loading details/)).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: undefined,
      error: new Error('Not found'),
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    render(<DetailPanel id={1} reasoning="" />)
    expect(screen.getByText(/Failed to load details/)).toBeInTheDocument()
  })

  it('renders reasoning text when provided', () => {
    vi.mocked(usePredictionDetail).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    } as ReturnType<typeof usePredictionDetail>)
    render(<DetailPanel id={1} reasoning="Strong accumulation" />)
    expect(screen.getByText('Strong accumulation')).toBeInTheDocument()
  })
})
