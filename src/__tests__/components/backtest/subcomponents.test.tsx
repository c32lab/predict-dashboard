import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  }
})

import { KpiCard } from '../../../components/backtest/KpiCard'
import { Section } from '../../../components/backtest/Section'
import { FindingsSection } from '../../../components/backtest/FindingsSection'
import { ConfusionMatrixSection } from '../../../components/backtest/ConfusionMatrixSection'
import { PatternHeatmapSection } from '../../../components/backtest/PatternHeatmapSection'
import { ConfidenceBucketSection } from '../../../components/backtest/ConfidenceBucketSection'

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Total" value="100" />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders sub text when provided', () => {
    render(<KpiCard label="Accuracy" value="55%" sub="44/80" />)
    expect(screen.getByText('44/80')).toBeInTheDocument()
  })
})

describe('Section', () => {
  it('renders title and children', () => {
    render(<Section title="Test Section"><span>Content</span></Section>)
    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

describe('FindingsSection', () => {
  it('renders findings and suggestions', () => {
    render(<FindingsSection findings={['Finding A']} suggestions={['Suggestion B']} />)
    expect(screen.getByText('Findings')).toBeInTheDocument()
    expect(screen.getByText('Finding A')).toBeInTheDocument()
    expect(screen.getByText('Suggestions')).toBeInTheDocument()
    expect(screen.getByText('Suggestion B')).toBeInTheDocument()
  })
})

describe('ConfusionMatrixSection', () => {
  it('renders matrix values', () => {
    const cm = {
      TP: 25, FP: 15, TN: 19, FN: 21,
      NEUTRAL_pred: 0, NEUTRAL_actual: 0,
      total: 80, accuracy_pct: 55, precision_pct: 62.5, recall_pct: 54.3, f1: 0.58,
    }
    render(<ConfusionMatrixSection cm={cm} />)
    expect(screen.getByText('True Positive')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('False Positive')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })
})

describe('PatternHeatmapSection', () => {
  it('renders pattern cards sorted by accuracy', () => {
    const patterns = {
      whale: { correct: 10, total: 15, accuracy_pct: 66.7 },
      news: { correct: 5, total: 10, accuracy_pct: 50 },
    }
    render(<PatternHeatmapSection patterns={patterns} />)
    expect(screen.getByText('Pattern Accuracy Heatmap')).toBeInTheDocument()
    expect(screen.getByText('whale')).toBeInTheDocument()
    expect(screen.getByText('news')).toBeInTheDocument()
  })
})

describe('ConfidenceBucketSection', () => {
  it('renders confidence bucket chart', () => {
    const buckets = {
      '0.6-0.7': { correct: 10, total: 20, accuracy_pct: 50 },
    }
    render(<ConfidenceBucketSection buckets={buckets} />)
    expect(screen.getByText('Confidence Bucket Analysis')).toBeInTheDocument()
  })
})
