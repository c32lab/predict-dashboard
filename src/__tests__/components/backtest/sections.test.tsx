import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock recharts – return simple divs for all chart components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  ScatterChart: ({ children }: { children: React.ReactNode }) => <div data-testid="scatter-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Scatter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  ZAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  LabelList: () => <div />,
}))

import { Section } from '../../../components/backtest/Section'
import { KpiCard } from '../../../components/backtest/KpiCard'
import { ABSection } from '../../../components/backtest/ABSection'
import { BeforeAfterSection } from '../../../components/backtest/BeforeAfterSection'
import { ConfidenceBucketSection } from '../../../components/backtest/ConfidenceBucketSection'
import { ConfusionMatrixSection } from '../../../components/backtest/ConfusionMatrixSection'
import { FindingsSection } from '../../../components/backtest/FindingsSection'
import { PatternHeatmapSection } from '../../../components/backtest/PatternHeatmapSection'
import { RegimeSection } from '../../../components/backtest/RegimeSection'
import { SweepSection } from '../../../components/backtest/SweepSection'
import { SymbolComparisonSection } from '../../../components/backtest/SymbolComparisonSection'
import type { ABResults, FullResults } from '../../../types/backtest'

// ── Mock data ──────────────────────────────────────────────────────────

const mockAB: ABResults = {
  generated_at: '2026-03-06',
  total_events: 200,
  skipped_no_model: 10,
  skipped_no_price: 5,
  strategy_descriptions: { baseline: 'Simple baseline', improved: 'Improved strategy' },
  summary: {
    baseline: {
      horizons: {
        '1d': { correct: 20, total: 40, accuracy_pct: 50 },
        '3d': { correct: 15, total: 30, accuracy_pct: 50 },
        '7d': { correct: 10, total: 25, accuracy_pct: 40 },
      },
    },
    improved: {
      horizons: {
        '1d': { correct: 30, total: 40, accuracy_pct: 75 },
        '3d': { correct: 20, total: 30, accuracy_pct: 66.7 },
        '7d': { correct: 15, total: 25, accuracy_pct: 60 },
      },
    },
  },
}

const mockBeforeAfter: FullResults['before_after_comparison'] = {
  before: {
    overall_accuracy_pct: 45,
    overall_correct: 36,
    overall_total: 80,
    total_predictions: 100,
    by_horizon: { '1d': { correct: 15, total: 30, accuracy_pct: 50 } },
    by_direction: {},
    by_pattern: {},
  },
  after: {
    overall_accuracy_pct: 55,
    overall_correct: 44,
    overall_total: 80,
    total_predictions: 90,
    by_horizon: { '1d': { correct: 20, total: 30, accuracy_pct: 66.7 } },
    by_direction: {},
    by_pattern: {},
  },
  delta: { accuracy_change_pp: 10, predictions_removed: 10, validations_removed: 5 },
}

const mockConfusionMatrix: FullResults['prediction_backtest']['confusion_matrix'] = {
  TP: 25, FP: 15, TN: 19, FN: 21,
  NEUTRAL_pred: 0, NEUTRAL_actual: 0,
  total: 80, accuracy_pct: 55, precision_pct: 62.5, recall_pct: 54.3, f1: 0.58,
}

const mockConfidenceBuckets = {
  '0.6-0.7': { correct: 10, total: 20, accuracy_pct: 50 },
  '0.7-0.8': { correct: 15, total: 20, accuracy_pct: 75 },
}

const mockPatterns = {
  whale: { correct: 10, total: 15, accuracy_pct: 66.7 },
  spike: { correct: 5, total: 20, accuracy_pct: 25 },
  breakout: { correct: 14, total: 18, accuracy_pct: 77.8 },
}

const mockRegimes = {
  bull: { count: 50, horizons: { '1d': { correct: 30, total: 40, accuracy_pct: 75 } } },
  bear: { count: 50, horizons: { '1d': { correct: 15, total: 40, accuracy_pct: 37.5 } } },
  sideways: { count: 50, horizons: { '1d': { correct: 20, total: 40, accuracy_pct: 50 } } },
}

const mockSweep = {
  sweep_grid: '6x3',
  confidence_thresholds: [0.5, 0.6, 0.7],
  direction_thresholds_pct: [1, 2, 3],
  results: [
    { confidence_threshold: 0.5, direction_threshold_pct: 1, horizons: {}, avg_accuracy_pct: 50, avg_coverage_pct: 60, composite_score: 55 },
    { confidence_threshold: 0.7, direction_threshold_pct: 2, horizons: {}, avg_accuracy_pct: 65, avg_coverage_pct: 40, composite_score: 52 },
  ],
  best_params: { confidence_threshold: 0.7, direction_threshold_pct: 2, horizons: {}, avg_accuracy_pct: 65, avg_coverage_pct: 40, composite_score: 52 },
}

const mockSymbols: FullResults['multi_symbol_conduction']['by_symbol'] = {
  'BTC/USDT': { horizons: { '1d': { correct: 10, total: 15, accuracy_pct: 66.7 } }, overall_accuracy_pct: 66.7, overall_correct: 10, overall_total: 15 },
  'ETH/USDT': { horizons: { '1d': { correct: 8, total: 15, accuracy_pct: 53.3 } }, overall_accuracy_pct: 53.3, overall_correct: 8, overall_total: 15 },
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('Section', () => {
  it('renders title and children', () => {
    render(<Section title="Test Section"><p>Hello</p></Section>)
    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Total" value="100" />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders optional sub text', () => {
    render(<KpiCard label="Accuracy" value="55%" sub="44/80 correct" />)
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
    expect(screen.getByText('44/80 correct')).toBeInTheDocument()
  })

  it('does not render sub when not provided', () => {
    const { container } = render(<KpiCard label="Count" value="10" />)
    // Sub text should not appear
    expect(container.querySelector('.text-gray-400')).toBeNull()
  })
})

describe('ABSection', () => {
  it('renders section title and strategy table', () => {
    render(<ABSection ab={mockAB} />)
    expect(screen.getByText('A/B Strategy Comparison')).toBeInTheDocument()
    expect(screen.getByText('baseline')).toBeInTheDocument()
    expect(screen.getByText('improved')).toBeInTheDocument()
  })

  it('marks the best strategy', () => {
    render(<ABSection ab={mockAB} />)
    expect(screen.getByText('best')).toBeInTheDocument()
  })

  it('renders horizon header columns', () => {
    render(<ABSection ab={mockAB} />)
    expect(screen.getByText('1d Acc%')).toBeInTheDocument()
    expect(screen.getByText('3d Acc%')).toBeInTheDocument()
    expect(screen.getByText('7d Acc%')).toBeInTheDocument()
  })

  it('toggles strategy descriptions on click', () => {
    render(<ABSection ab={mockAB} />)
    expect(screen.queryByText(/Simple baseline/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Show strategy descriptions'))
    expect(screen.getByText(/Simple baseline/)).toBeInTheDocument()
    expect(screen.getByText(/Improved strategy/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Hide strategy descriptions'))
    expect(screen.queryByText(/Simple baseline/)).not.toBeInTheDocument()
  })
})

describe('BeforeAfterSection', () => {
  it('renders before, after, and delta cards', () => {
    render(<BeforeAfterSection data={mockBeforeAfter} />)
    expect(screen.getByText('Before / After Comparison')).toBeInTheDocument()
    expect(screen.getByText('Before')).toBeInTheDocument()
    expect(screen.getByText('After')).toBeInTheDocument()
    expect(screen.getByText('Accuracy Change')).toBeInTheDocument()
  })

  it('shows correct accuracy values', () => {
    render(<BeforeAfterSection data={mockBeforeAfter} />)
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
  })

  it('shows positive delta with sign', () => {
    render(<BeforeAfterSection data={mockBeforeAfter} />)
    expect(screen.getByText('+10pp')).toBeInTheDocument()
  })

  it('shows negative delta without plus sign', () => {
    const negativeDelta = {
      ...mockBeforeAfter,
      delta: { accuracy_change_pp: -5, predictions_removed: 10, validations_removed: 5 },
    }
    render(<BeforeAfterSection data={negativeDelta} />)
    expect(screen.getByText('-5pp')).toBeInTheDocument()
  })

  it('shows predictions and validations removed', () => {
    render(<BeforeAfterSection data={mockBeforeAfter} />)
    expect(screen.getByText('10 predictions removed')).toBeInTheDocument()
    expect(screen.getByText('5 validations removed')).toBeInTheDocument()
  })
})

describe('ConfidenceBucketSection', () => {
  it('renders section title', () => {
    render(<ConfidenceBucketSection buckets={mockConfidenceBuckets} />)
    expect(screen.getByText('Confidence Bucket Analysis')).toBeInTheDocument()
  })

  it('renders chart container', () => {
    render(<ConfidenceBucketSection buckets={mockConfidenceBuckets} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })
})

describe('ConfusionMatrixSection', () => {
  it('renders section title', () => {
    render(<ConfusionMatrixSection cm={mockConfusionMatrix} />)
    expect(screen.getByText('Confusion Matrix')).toBeInTheDocument()
  })

  it('renders all four quadrant labels', () => {
    render(<ConfusionMatrixSection cm={mockConfusionMatrix} />)
    expect(screen.getByText('True Positive')).toBeInTheDocument()
    expect(screen.getByText('False Positive')).toBeInTheDocument()
    expect(screen.getByText('True Negative')).toBeInTheDocument()
    expect(screen.getByText('False Negative')).toBeInTheDocument()
  })

  it('renders confusion matrix values', () => {
    render(<ConfusionMatrixSection cm={mockConfusionMatrix} />)
    expect(screen.getByText('25')).toBeInTheDocument()  // TP
    expect(screen.getByText('15')).toBeInTheDocument()  // FP
    expect(screen.getByText('19')).toBeInTheDocument()  // TN
    expect(screen.getByText('21')).toBeInTheDocument()  // FN
  })

  it('renders precision, recall, f1, and accuracy', () => {
    render(<ConfusionMatrixSection cm={mockConfusionMatrix} />)
    expect(screen.getByText(/Precision/)).toBeInTheDocument()
    expect(screen.getByText(/62.5%/)).toBeInTheDocument()
    expect(screen.getByText(/Recall/)).toBeInTheDocument()
    expect(screen.getByText(/54.3%/)).toBeInTheDocument()
    expect(screen.getByText(/F1/)).toBeInTheDocument()
    expect(screen.getByText(/0.58/)).toBeInTheDocument()
  })
})

describe('FindingsSection', () => {
  it('renders findings and suggestions titles', () => {
    render(<FindingsSection findings={['Finding A', 'Finding B']} suggestions={['Suggestion X']} />)
    expect(screen.getByText('Findings')).toBeInTheDocument()
    expect(screen.getByText('Suggestions')).toBeInTheDocument()
  })

  it('renders all finding items', () => {
    render(<FindingsSection findings={['Finding A', 'Finding B']} suggestions={['Suggestion X']} />)
    expect(screen.getByText('Finding A')).toBeInTheDocument()
    expect(screen.getByText('Finding B')).toBeInTheDocument()
  })

  it('renders all suggestion items', () => {
    render(<FindingsSection findings={['Finding A']} suggestions={['Suggestion X', 'Suggestion Y']} />)
    expect(screen.getByText('Suggestion X')).toBeInTheDocument()
    expect(screen.getByText('Suggestion Y')).toBeInTheDocument()
  })

  it('renders empty lists without crashing', () => {
    render(<FindingsSection findings={[]} suggestions={[]} />)
    expect(screen.getByText('Findings')).toBeInTheDocument()
    expect(screen.getByText('Suggestions')).toBeInTheDocument()
  })
})

describe('PatternHeatmapSection', () => {
  it('renders section title', () => {
    render(<PatternHeatmapSection patterns={mockPatterns} />)
    expect(screen.getByText('Pattern Accuracy Heatmap')).toBeInTheDocument()
  })

  it('renders all pattern names', () => {
    render(<PatternHeatmapSection patterns={mockPatterns} />)
    expect(screen.getByText('whale')).toBeInTheDocument()
    expect(screen.getByText('spike')).toBeInTheDocument()
    expect(screen.getByText('breakout')).toBeInTheDocument()
  })

  it('renders accuracy percentages', () => {
    render(<PatternHeatmapSection patterns={mockPatterns} />)
    expect(screen.getByText('66.7%')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getByText('77.8%')).toBeInTheDocument()
  })

  it('renders correct/total counts', () => {
    render(<PatternHeatmapSection patterns={mockPatterns} />)
    expect(screen.getByText('10/15')).toBeInTheDocument()
    expect(screen.getByText('5/20')).toBeInTheDocument()
    expect(screen.getByText('14/18')).toBeInTheDocument()
  })

  it('sorts patterns by accuracy descending', () => {
    const { container } = render(<PatternHeatmapSection patterns={mockPatterns} />)
    const patternNames = Array.from(container.querySelectorAll('.font-mono')).map(el => el.textContent)
    expect(patternNames).toEqual(['breakout', 'whale', 'spike'])
  })
})

describe('RegimeSection', () => {
  it('renders section title', () => {
    render(<RegimeSection regimes={mockRegimes} />)
    expect(screen.getByText('Regime Analysis (Decay Model)')).toBeInTheDocument()
  })

  it('renders all regime names', () => {
    render(<RegimeSection regimes={mockRegimes} />)
    expect(screen.getByText('bull')).toBeInTheDocument()
    expect(screen.getByText('bear')).toBeInTheDocument()
    expect(screen.getByText('sideways')).toBeInTheDocument()
  })

  it('renders event counts', () => {
    render(<RegimeSection regimes={mockRegimes} />)
    const counts = screen.getAllByText('(50 events)')
    expect(counts).toHaveLength(3)
  })

  it('renders chart container', () => {
    render(<RegimeSection regimes={mockRegimes} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })
})

describe('SweepSection', () => {
  it('renders section title', () => {
    render(<SweepSection sweep={mockSweep} />)
    expect(screen.getByText('Parameter Sweep (18 combos)')).toBeInTheDocument()
  })

  it('renders best params info', () => {
    render(<SweepSection sweep={mockSweep} />)
    expect(screen.getByText(/accuracy=65%/)).toBeInTheDocument()
    expect(screen.getByText(/coverage=40%/)).toBeInTheDocument()
    expect(screen.getByText(/composite=52/)).toBeInTheDocument()
  })

  it('renders sweep results table headers', () => {
    render(<SweepSection sweep={mockSweep} />)
    expect(screen.getByText('Confidence')).toBeInTheDocument()
    expect(screen.getByText('Dir Thresh%')).toBeInTheDocument()
    expect(screen.getByText('Avg Acc%')).toBeInTheDocument()
    expect(screen.getByText('Avg Cov%')).toBeInTheDocument()
    expect(screen.getByText('Composite')).toBeInTheDocument()
  })

  it('renders result rows', () => {
    render(<SweepSection sweep={mockSweep} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('65%')).toBeInTheDocument()
  })

  it('renders chart container', () => {
    render(<SweepSection sweep={mockSweep} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })
})

describe('SymbolComparisonSection', () => {
  it('renders section title', () => {
    render(<SymbolComparisonSection symbols={mockSymbols} />)
    expect(screen.getByText('Multi-Symbol Comparison')).toBeInTheDocument()
  })

  it('renders chart container', () => {
    render(<SymbolComparisonSection symbols={mockSymbols} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders with empty symbols without crashing', () => {
    render(<SymbolComparisonSection symbols={{}} />)
    expect(screen.getByText('Multi-Symbol Comparison')).toBeInTheDocument()
  })
})
