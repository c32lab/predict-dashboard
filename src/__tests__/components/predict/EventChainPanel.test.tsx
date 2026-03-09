import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EventChainPanel } from '../../../components/predict/EventChainPanel'

vi.mock('../../../hooks/usePredictApi', () => ({
  useEventChainLinks: vi.fn(),
}))

import { useEventChainLinks } from '../../../hooks/usePredictApi'

const mockUseEventChainLinks = vi.mocked(useEventChainLinks)

describe('EventChainPanel', () => {
  const defaultProps = {
    nodeId: 'n1',
    nodeName: 'Bitcoin',
    onClose: vi.fn(),
  }

  it('shows loading state', () => {
    mockUseEventChainLinks.mockReturnValue({ data: undefined, error: undefined, isLoading: true } as ReturnType<typeof useEventChainLinks>)
    render(<EventChainPanel {...defaultProps} />)
    expect(screen.getByText('Loading events…')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockUseEventChainLinks.mockReturnValue({ data: undefined, error: new Error('Network error'), isLoading: false } as ReturnType<typeof useEventChainLinks>)
    render(<EventChainPanel {...defaultProps} />)
    expect(screen.getByText(/Failed to load events/)).toBeInTheDocument()
  })

  it('shows empty state when no events', () => {
    mockUseEventChainLinks.mockReturnValue({
      data: { chain_node: 'n1', events: [] },
      error: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useEventChainLinks>)
    render(<EventChainPanel {...defaultProps} />)
    expect(screen.getByText('No linked events found')).toBeInTheDocument()
  })

  it('renders events with correct data', () => {
    mockUseEventChainLinks.mockReturnValue({
      data: {
        chain_node: 'n1',
        events: [
          { date: '2026-03-01', category: 'macro', event: 'Fed rate cut', price_change: 2.5 },
          { date: '2026-03-02', category: 'news', event: 'ETF approved', price_change: -1.3 },
        ],
      },
      error: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useEventChainLinks>)
    render(<EventChainPanel {...defaultProps} />)
    expect(screen.getByText('Fed rate cut')).toBeInTheDocument()
    expect(screen.getByText('ETF approved')).toBeInTheDocument()
    expect(screen.getByText('+2.50%')).toBeInTheDocument()
    expect(screen.getByText('-1.30%')).toBeInTheDocument()
  })

  it('shows node name in header', () => {
    mockUseEventChainLinks.mockReturnValue({ data: undefined, error: undefined, isLoading: true } as ReturnType<typeof useEventChainLinks>)
    render(<EventChainPanel {...defaultProps} />)
    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    mockUseEventChainLinks.mockReturnValue({ data: undefined, error: undefined, isLoading: false } as ReturnType<typeof useEventChainLinks>)
    render(<EventChainPanel {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close panel'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('colors positive price change green', () => {
    mockUseEventChainLinks.mockReturnValue({
      data: {
        chain_node: 'n1',
        events: [{ date: '2026-03-01', category: 'macro', event: 'Pump', price_change: 5.0 }],
      },
      error: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useEventChainLinks>)
    render(<EventChainPanel {...defaultProps} />)
    const priceEl = screen.getByText('+5.00%')
    expect(priceEl.className).toContain('text-green-400')
  })

  it('colors negative price change red', () => {
    mockUseEventChainLinks.mockReturnValue({
      data: {
        chain_node: 'n1',
        events: [{ date: '2026-03-01', category: 'macro', event: 'Dump', price_change: -3.0 }],
      },
      error: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useEventChainLinks>)
    render(<EventChainPanel {...defaultProps} />)
    const priceEl = screen.getByText('-3.00%')
    expect(priceEl.className).toContain('text-red-400')
  })
})
