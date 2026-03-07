import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(),
}))

// Mock recharts
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  }
})

import useSWR from 'swr'
import BacktestPage from '../../pages/BacktestPage'

const mockFullResults = {
  generated_at: '2026-03-06',
  prediction_backtest: {
    total_predictions: 100,
    total_validations: 80,
    overall_accuracy_pct: 55,
    overall_correct: 44,
    overall_total: 80,
    by_horizon: {
      '1d': { correct: 20, total: 30, accuracy_pct: 66.7 },
      '3d': { correct: 15, total: 25, accuracy_pct: 60 },
      '7d': { correct: 9, total: 25, accuracy_pct: 36 },
    },
    by_trigger_pattern: {
      whale: { correct: 10, total: 15, accuracy_pct: 66.7 },
    },
    by_direction: {
      LONG: { correct: 25, total: 40, accuracy_pct: 62.5 },
      SHORT: { correct: 19, total: 40, accuracy_pct: 47.5 },
    },
    by_confidence_bucket: {
      '0.6-0.7': { correct: 10, total: 20, accuracy_pct: 50 },
      '0.7-0.8': { correct: 15, total: 20, accuracy_pct: 75 },
    },
    by_day: {},
    confusion_matrix: {
      TP: 25, FP: 15, TN: 19, FN: 21,
      NEUTRAL_pred: 0, NEUTRAL_actual: 0,
      total: 80, accuracy_pct: 55, precision_pct: 62.5, recall_pct: 54.3, f1: 0.58,
    },
  },
  decay_model_backtest: {
    total_events: 200,
    matched_events: 150,
    skipped_no_model: 30,
    skipped_no_price: 20,
    decay_models_used: ['exponential'],
    overall_accuracy: {},
    by_model: {},
    by_year: {},
    by_regime: {
      bull: { count: 50, horizons: { '1d': { correct: 30, total: 40, accuracy_pct: 75 } } },
      bear: { count: 50, horizons: { '1d': { correct: 15, total: 40, accuracy_pct: 37.5 } } },
      sideways: { count: 50, horizons: { '1d': { correct: 20, total: 40, accuracy_pct: 50 } } },
    },
    by_severity: {},
  },
  parameter_sweep: {
    sweep_grid: '6x3',
    confidence_thresholds: [0.5, 0.6, 0.7],
    direction_thresholds_pct: [1, 2, 3],
    results: [
      { confidence_threshold: 0.5, direction_threshold_pct: 1, horizons: {}, avg_accuracy_pct: 50, avg_coverage_pct: 60, composite_score: 55 },
      { confidence_threshold: 0.7, direction_threshold_pct: 2, horizons: {}, avg_accuracy_pct: 65, avg_coverage_pct: 40, composite_score: 52 },
    ],
    best_params: { confidence_threshold: 0.7, direction_threshold_pct: 2, horizons: {}, avg_accuracy_pct: 65, avg_coverage_pct: 40, composite_score: 52 },
  },
  findings: ['Finding 1', 'Finding 2'],
  suggestions: ['Suggestion 1'],
  multi_symbol_conduction: {
    by_symbol: {
      'BTC/USDT': { horizons: { '1d': { correct: 10, total: 15, accuracy_pct: 66.7 } }, overall_accuracy_pct: 66.7, overall_correct: 10, overall_total: 15 },
    },
  },
  before_after_comparison: {
    before: { overall_accuracy_pct: 45, overall_correct: 36, overall_total: 80, total_predictions: 100, by_horizon: { '1d': { correct: 15, total: 30, accuracy_pct: 50 } }, by_direction: {}, by_pattern: {} },
    after: { overall_accuracy_pct: 55, overall_correct: 44, overall_total: 80, total_predictions: 90, by_horizon: { '1d': { correct: 20, total: 30, accuracy_pct: 66.7 } }, by_direction: {}, by_pattern: {} },
    delta: { accuracy_change_pp: 10, predictions_removed: 10, validations_removed: 5 },
  },
}

const mockABResults = {
  generated_at: '2026-03-06',
  total_events: 200,
  skipped_no_model: 10,
  skipped_no_price: 5,
  strategy_descriptions: { baseline: 'Simple baseline strategy', improved: 'Improved strategy' },
  summary: {
    baseline: { horizons: { '1d': { correct: 20, total: 40, accuracy_pct: 50 }, '3d': { correct: 15, total: 30, accuracy_pct: 50 }, '7d': { correct: 10, total: 25, accuracy_pct: 40 } } },
    improved: { horizons: { '1d': { correct: 30, total: 40, accuracy_pct: 75 }, '3d': { correct: 20, total: 30, accuracy_pct: 66.7 }, '7d': { correct: 15, total: 25, accuracy_pct: 60 } } },
  },
}

function setupDataMock() {
  let callCount = 0
  vi.mocked(useSWR).mockImplementation(() => {
    callCount++
    if (callCount % 2 === 1) return { data: mockFullResults, error: undefined, isLoading: false, isValidating: false, mutate: vi.fn() }
    return { data: mockABResults, error: undefined, isLoading: false, isValidating: false, mutate: vi.fn() }
  })
}

describe('BacktestPage', () => {
  it('shows loading state when data is not available', () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    })
    render(<BacktestPage />)
    expect(screen.getByText('Loading backtest data...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    let callCount = 0
    vi.mocked(useSWR).mockImplementation(() => {
      callCount++
      if (callCount === 1) return { data: undefined, error: new Error('fail'), isLoading: false, isValidating: false, mutate: vi.fn() }
      return { data: undefined, error: undefined, isLoading: false, isValidating: false, mutate: vi.fn() }
    })
    render(<BacktestPage />)
    expect(screen.getByText('Failed to load backtest data.')).toBeInTheDocument()
  })

  it('renders all sections with data', () => {
    setupDataMock()
    render(<BacktestPage />)
    expect(screen.getByText('Backtest Results')).toBeInTheDocument()
    expect(screen.getByText('Total Predictions')).toBeInTheDocument()
    expect(screen.getByText('Overall Accuracy')).toBeInTheDocument()
    expect(screen.getByText('A/B Strategy Comparison')).toBeInTheDocument()
    expect(screen.getByText(/Regime Analysis/)).toBeInTheDocument()
    expect(screen.getByText(/Parameter Sweep/)).toBeInTheDocument()
    expect(screen.getByText('Findings')).toBeInTheDocument()
    expect(screen.getByText('Suggestions')).toBeInTheDocument()
    expect(screen.getByText('Pattern Accuracy Heatmap')).toBeInTheDocument()
    expect(screen.getByText('Confusion Matrix')).toBeInTheDocument()
    expect(screen.getByText('Confidence Bucket Analysis')).toBeInTheDocument()
    expect(screen.getByText('Multi-Symbol Comparison')).toBeInTheDocument()
    expect(screen.getByText('Before / After Comparison')).toBeInTheDocument()
  })

  it('renders KPI cards with correct values', () => {
    setupDataMock()
    render(<BacktestPage />)
    // Check total predictions KPI
    expect(screen.getByText('Total Predictions')).toBeInTheDocument()
    // Overall accuracy
    expect(screen.getByText('Overall Accuracy')).toBeInTheDocument()
  })

  it('renders findings and suggestions', () => {
    setupDataMock()
    render(<BacktestPage />)
    expect(screen.getByText('Finding 1')).toBeInTheDocument()
    expect(screen.getByText('Finding 2')).toBeInTheDocument()
    expect(screen.getByText('Suggestion 1')).toBeInTheDocument()
  })

  it('renders confusion matrix values', () => {
    setupDataMock()
    render(<BacktestPage />)
    expect(screen.getByText('True Positive')).toBeInTheDocument()
    expect(screen.getByText('False Positive')).toBeInTheDocument()
    expect(screen.getByText('True Negative')).toBeInTheDocument()
    expect(screen.getByText('False Negative')).toBeInTheDocument()
  })

  it('renders before/after comparison with delta', () => {
    setupDataMock()
    render(<BacktestPage />)
    expect(screen.getByText('Before')).toBeInTheDocument()
    expect(screen.getByText('After')).toBeInTheDocument()
    expect(screen.getByText('+10pp')).toBeInTheDocument()
  })

  it('shows error state when only AB results fail (e2)', () => {
    let callCount = 0
    vi.mocked(useSWR).mockImplementation(() => {
      callCount++
      if (callCount === 1) return { data: mockFullResults, error: undefined, isLoading: false, isValidating: false, mutate: vi.fn() }
      return { data: undefined, error: new Error('ab fail'), isLoading: false, isValidating: false, mutate: vi.fn() }
    })
    render(<BacktestPage />)
    expect(screen.getByText('Failed to load backtest data.')).toBeInTheDocument()
  })

  it('renders best and worst horizon KPI cards', () => {
    setupDataMock()
    render(<BacktestPage />)
    // Best horizon is 1d at 66.7%, worst is 7d at 36%
    expect(screen.getByText('Best Horizon')).toBeInTheDocument()
    expect(screen.getByText('Worst Horizon')).toBeInTheDocument()
    expect(screen.getByText(/1d 66.7%/)).toBeInTheDocument()
    expect(screen.getByText(/7d 36%/)).toBeInTheDocument()
  })

  it('renders LONG and SHORT accuracy KPI cards', () => {
    setupDataMock()
    render(<BacktestPage />)
    expect(screen.getByText('LONG Accuracy')).toBeInTheDocument()
    expect(screen.getByText('SHORT Accuracy')).toBeInTheDocument()
    expect(screen.getByText('25/40')).toBeInTheDocument()
    expect(screen.getByText('19/40')).toBeInTheDocument()
  })

  it('renders generated_at date', () => {
    setupDataMock()
    render(<BacktestPage />)
    expect(screen.getByText('Generated 2026-03-06')).toBeInTheDocument()
  })

  it('fetcher function calls fetch and returns json', async () => {
    const mockJson = { test: true }
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(mockJson) })
    const fetcher = (url: string) => fetch(url).then(r => r.json())
    const result = await fetcher('/test.json')
    expect(result).toEqual(mockJson)
    expect(global.fetch).toHaveBeenCalledWith('/test.json')
  })

  it('renders KPI cards when LONG/SHORT direction data is missing', () => {
    const modifiedResults = {
      ...mockFullResults,
      prediction_backtest: {
        ...mockFullResults.prediction_backtest,
        by_direction: {},
      },
    }
    let callCount = 0
    vi.mocked(useSWR).mockImplementation(() => {
      callCount++
      if (callCount % 2 === 1) return { data: modifiedResults, error: undefined, isLoading: false, isValidating: false, mutate: vi.fn() }
      return { data: mockABResults, error: undefined, isLoading: false, isValidating: false, mutate: vi.fn() }
    })
    render(<BacktestPage />)
    expect(screen.getByText('LONG Accuracy')).toBeInTheDocument()
    expect(screen.getByText('SHORT Accuracy')).toBeInTheDocument()
  })
})
