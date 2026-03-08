import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ExplainPanel } from '../../../../components/predict/detail/ExplainPanel'
import type { PredictionExplainResponse } from '../../../../types/predict'

const mockExplain: PredictionExplainResponse = {
  prediction_id: 421,
  summary: 'LONG BTC/USDT based on tariff_relief pattern with 0.51 confidence',
  reasoning_chain: {
    trigger: { event: 'US tariff relief announced', source: 'auto_extracted', timestamp: '2026-03-07T10:00:00Z' },
    classification: { pattern: 'tariff_relief', category: 'tariff_relief', confidence_score: 0.507 },
    historical_matches: [
      {
        event: 'Previous tariff relief event',
        date: '2025-11-15',
        similarity: 0.553,
        outcome: { direction: 'SHORT', price_change_pct: -1.2 },
      },
      {
        event: 'Another relief event',
        date: '2025-08-20',
        similarity: 0.48,
        outcome: { direction: 'LONG', price_change_pct: 2.5 },
      },
    ],
    decay_analysis: {},
    direction_decision: { direction: 'LONG', confidence: 0.51 },
    symbol_decision: { symbol: 'BTC/USDT' },
  },
  factors: [
    { name: 'Pattern Match', weight: 0.5, contribution: 'Strong historical pattern' },
    { name: 'Macro Score', weight: 0.3, contribution: 'Positive macro environment' },
  ],
}

// Wrap with MemoryRouter because DirectionBadge may use Link
const renderPanel = (data: PredictionExplainResponse) =>
  render(
    <MemoryRouter>
      <ExplainPanel data={data} />
    </MemoryRouter>
  )

describe('ExplainPanel', () => {
  it('renders summary section', () => {
    renderPanel(mockExplain)
    expect(screen.getByText('AI Explanation')).toBeInTheDocument()
    expect(screen.getByText(/LONG BTC\/USDT/)).toBeInTheDocument()
  })

  it('renders reasoning chain with all steps', () => {
    renderPanel(mockExplain)
    expect(screen.getByText('Reasoning Chain')).toBeInTheDocument()
    expect(screen.getByText('Trigger Event')).toBeInTheDocument()
    expect(screen.getByText('US tariff relief announced')).toBeInTheDocument()
    expect(screen.getByText('Pattern Classification')).toBeInTheDocument()
    expect(screen.getAllByText('Historical Matches')).toHaveLength(2) // chain step + table heading
    expect(screen.getByText('Direction Decision')).toBeInTheDocument()
    expect(screen.getByText('Symbol Selection')).toBeInTheDocument()
  })

  it('renders classification with confidence score multiplied by 100', () => {
    renderPanel(mockExplain)
    // Both classification (0.507→51%) and direction (0.51→51%) render as 51%
    expect(screen.getAllByText(/51%/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders historical matches table with similarity scores', () => {
    renderPanel(mockExplain)
    expect(screen.getByText('Previous tariff relief event')).toBeInTheDocument()
    expect(screen.getByText('55.3%')).toBeInTheDocument() // similarity × 100
    expect(screen.getByText('-1.20%')).toBeInTheDocument()
    expect(screen.getByText('Another relief event')).toBeInTheDocument()
    expect(screen.getByText('+2.50%')).toBeInTheDocument()
  })

  it('renders decision factors with weight bars', () => {
    renderPanel(mockExplain)
    expect(screen.getByText('Decision Factors')).toBeInTheDocument()
    expect(screen.getByText('Pattern Match')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument() // weight × 100
    expect(screen.getByText('Strong historical pattern')).toBeInTheDocument()
    expect(screen.getByText('Macro Score')).toBeInTheDocument()
  })

  it('hides historical matches table when no matches', () => {
    const noMatches = {
      ...mockExplain,
      reasoning_chain: { ...mockExplain.reasoning_chain, historical_matches: [] },
    }
    renderPanel(noMatches)
    // Chain step should say "No matches"
    expect(screen.getByText('No matches')).toBeInTheDocument()
    // Table headers should not appear
    expect(screen.queryByText('Similarity')).not.toBeInTheDocument()
  })

  it('hides factors section when no factors', () => {
    const noFactors = { ...mockExplain, factors: [] }
    renderPanel(noFactors)
    expect(screen.queryByText('Decision Factors')).not.toBeInTheDocument()
  })
})
