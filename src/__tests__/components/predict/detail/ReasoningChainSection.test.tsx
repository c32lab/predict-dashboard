import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReasoningChainSection } from '../../../../components/predict/detail/ReasoningChainSection'
import type { ReasoningStep } from '../../../../types/predict'

const mockChain: ReasoningStep[] = [
  { step: 'trigger', content: 'Large whale transfer detected' },
  { step: 'match', content: 'Similar to Jan 2025 accumulation event' },
  { step: 'pattern', content: 'Whale Accumulation pattern identified' },
  { step: 'direction', content: 'Bullish signal confirmed' },
  { step: 'confidence', content: 'High confidence based on multiple factors' },
]

describe('ReasoningChainSection', () => {
  it('shows empty state when chain is empty', () => {
    render(<ReasoningChainSection chain={[]} />)
    expect(screen.getByText('No reasoning chain available')).toBeInTheDocument()
  })

  it('shows empty state when chain is null-ish', () => {
    render(<ReasoningChainSection chain={null as unknown as ReasoningStep[]} />)
    expect(screen.getByText('No reasoning chain available')).toBeInTheDocument()
  })

  it('renders section heading', () => {
    render(<ReasoningChainSection chain={mockChain} />)
    expect(screen.getByText('Reasoning Chain')).toBeInTheDocument()
  })

  it('renders all reasoning steps', () => {
    render(<ReasoningChainSection chain={mockChain} />)
    expect(screen.getByText('trigger')).toBeInTheDocument()
    expect(screen.getByText('Large whale transfer detected')).toBeInTheDocument()
    expect(screen.getByText('match')).toBeInTheDocument()
    expect(screen.getByText('Similar to Jan 2025 accumulation event')).toBeInTheDocument()
    expect(screen.getByText('pattern')).toBeInTheDocument()
    expect(screen.getByText('direction')).toBeInTheDocument()
    expect(screen.getByText('confidence')).toBeInTheDocument()
  })

  it('renders step labels as uppercase badges', () => {
    render(<ReasoningChainSection chain={[mockChain[0]]} />)
    const badge = screen.getByText('trigger')
    expect(badge.className).toContain('uppercase')
  })

  it('renders single step correctly', () => {
    render(<ReasoningChainSection chain={[{ step: 'summary', content: 'Final conclusion' }]} />)
    expect(screen.getByText('summary')).toBeInTheDocument()
    expect(screen.getByText('Final conclusion')).toBeInTheDocument()
  })
})
