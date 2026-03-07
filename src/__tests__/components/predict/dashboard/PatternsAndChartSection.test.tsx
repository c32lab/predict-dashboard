import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../../components/SectionErrorBoundary', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="error-boundary" data-title={title}>{children}</div>
  ),
}))

vi.mock('../../../../components/predict/PatternCard', () => ({
  PatternCard: ({ pattern }: { pattern: { name: string } }) => (
    <div data-testid="pattern-card">{pattern.name}</div>
  ),
}))

vi.mock('../../../../components/predict/MacroHistoryChart', () => ({
  MacroHistoryChart: () => <div data-testid="macro-chart" />,
}))

import { PatternsAndChartSection } from '../../../../components/predict/dashboard/PatternsAndChartSection'
import type { Pattern, MacroSnapshot } from '../../../../types/predict'

const mockPatterns: Pattern[] = [
  {
    id: 1, name: 'Whale Accumulation', direction: 'up', avg_impact: 5.2,
    base_level: 3, keywords: ['whale'], boost_keywords: ['large'],
    example_dates: ['2025-01-01'], notes: 'test', created_at: '', updated_at: '',
  },
  {
    id: 2, name: 'Exchange Outflow', direction: 'up', avg_impact: 3.1,
    base_level: 2, keywords: ['exchange'], boost_keywords: [],
    example_dates: [], notes: '', created_at: '', updated_at: '',
  },
]

const mockMacroHistory: MacroSnapshot[] = [
  {
    id: 1, timestamp: '2025-01-01T00:00:00Z', fear_greed: 65,
    fear_greed_trend: 'up', etf_flow_1d: 100, etf_flow_5d: 500,
    macro_score: 7, reasons: ['Strong ETF inflows'], btc_price: 50000,
  },
]

describe('PatternsAndChartSection', () => {
  it('renders inside error boundary', () => {
    render(<PatternsAndChartSection patterns={[]} macroHistory={[]} />)
    expect(screen.getByTestId('error-boundary')).toHaveAttribute('data-title', 'Patterns & Macro Chart')
  })

  it('renders pattern cards for each pattern', () => {
    render(<PatternsAndChartSection patterns={mockPatterns} macroHistory={[]} />)
    const cards = screen.getAllByTestId('pattern-card')
    expect(cards).toHaveLength(2)
    expect(screen.getByText('Whale Accumulation')).toBeInTheDocument()
    expect(screen.getByText('Exchange Outflow')).toBeInTheDocument()
  })

  it('shows "No patterns" when patterns array is empty', () => {
    render(<PatternsAndChartSection patterns={[]} macroHistory={[]} />)
    expect(screen.getByText('No patterns')).toBeInTheDocument()
  })

  it('renders macro history chart when data exists', () => {
    render(<PatternsAndChartSection patterns={[]} macroHistory={mockMacroHistory} />)
    expect(screen.getByTestId('macro-chart')).toBeInTheDocument()
  })

  it('shows "No history data" when macro history is empty', () => {
    render(<PatternsAndChartSection patterns={[]} macroHistory={[]} />)
    expect(screen.getByText('No history data')).toBeInTheDocument()
  })

  it('renders section headings', () => {
    render(<PatternsAndChartSection patterns={mockPatterns} macroHistory={mockMacroHistory} />)
    expect(screen.getByText('Event Patterns')).toBeInTheDocument()
    expect(screen.getByText('Macro History')).toBeInTheDocument()
  })
})
