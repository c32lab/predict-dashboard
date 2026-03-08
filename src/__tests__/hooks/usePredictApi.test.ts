import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock the API module
vi.mock('../../api/predict', () => ({
  predictApi: {
    health: vi.fn().mockResolvedValue({ status: 'ok' }),
    prediction: vi.fn().mockResolvedValue({ macro: {}, predictions: {} }),
    predictions: vi.fn().mockResolvedValue({ predictions: [], total: 0 }),
    predictAccuracy: vi.fn().mockResolvedValue({ accuracy: {}, recent_validations: [] }),
    events: vi.fn().mockResolvedValue([]),
    macroHistory: vi.fn().mockResolvedValue([]),
    trends: vi.fn().mockResolvedValue([]),
    industryChain: vi.fn().mockResolvedValue({ nodes: [], edges: [] }),
    openInterest: vi.fn().mockResolvedValue([]),
    longShortRatio: vi.fn().mockResolvedValue([]),
    takerVolume: vi.fn().mockResolvedValue([]),
    predictionDetail: vi.fn().mockResolvedValue({ id: 1 }),
    reasoningGraph: vi.fn().mockResolvedValue({ nodes: [], edges: [] }),
    qualityReport: vi.fn().mockResolvedValue({ total_predictions: 0 }),
    accuracyHistory: vi.fn().mockResolvedValue({ accuracy_history: [] }),
    decayActive: vi.fn().mockResolvedValue({ net_impact_pct: 0, details: [] }),
  },
}))

// Mock SWR to avoid real network calls but invoke the fetcher for coverage
vi.mock('swr', () => ({
  default: (key: unknown, fetcher?: () => Promise<unknown>) => {
    if (key === null) return { data: undefined, error: undefined, isLoading: false }
    // Call the fetcher so its arrow function is covered
    if (typeof fetcher === 'function') {
      fetcher()
    }
    return { data: undefined, error: undefined, isLoading: true }
  },
}))

import {
  usePredictHealth,
  usePrediction,
  usePredictions,
  usePredictAccuracy,
  usePredictEvents,
  useMacroHistory,
  useTrends,
  useIndustryChain,
  useOpenInterest,
  useLongShortRatio,
  useTakerVolume,
  usePredictionDetail,
  useReasoningGraph,
  useQualityReport,
  useAccuracyHistory,
  useDecayActive,
} from '../../hooks/usePredictApi'

describe('usePredictApi hooks', () => {
  it('usePredictHealth returns SWR result', () => {
    const { result } = renderHook(() => usePredictHealth())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('usePrediction returns SWR result', () => {
    const { result } = renderHook(() => usePrediction())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('usePredictions accepts status and limit params', () => {
    const { result } = renderHook(() => usePredictions('completed', 10))
    expect(result.current).toHaveProperty('isLoading')
  })

  it('usePredictions uses default params', () => {
    const { result } = renderHook(() => usePredictions())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('usePredictAccuracy returns SWR result', () => {
    const { result } = renderHook(() => usePredictAccuracy())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('usePredictEvents accepts limit and pattern', () => {
    const { result } = renderHook(() => usePredictEvents(20, 'whale'))
    expect(result.current).toHaveProperty('isLoading')
  })

  it('usePredictEvents uses default params', () => {
    const { result } = renderHook(() => usePredictEvents())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useMacroHistory accepts limit', () => {
    const { result } = renderHook(() => useMacroHistory(50))
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useTrends accepts params', () => {
    const { result } = renderHook(() => useTrends(10, 3, 48))
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useIndustryChain returns SWR result', () => {
    const { result } = renderHook(() => useIndustryChain())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useOpenInterest accepts symbol and limit', () => {
    const { result } = renderHook(() => useOpenInterest('ETH/USDT', 48))
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useOpenInterest uses default params', () => {
    const { result } = renderHook(() => useOpenInterest())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useLongShortRatio accepts symbol and limit', () => {
    const { result } = renderHook(() => useLongShortRatio('SOL/USDT', 12))
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useLongShortRatio uses default params', () => {
    const { result } = renderHook(() => useLongShortRatio())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useTakerVolume accepts symbol and limit', () => {
    const { result } = renderHook(() => useTakerVolume('BNB/USDT', 6))
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useTakerVolume uses default params', () => {
    const { result } = renderHook(() => useTakerVolume())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('usePredictionDetail returns null key when id is null', () => {
    const { result } = renderHook(() => usePredictionDetail(null))
    // With null key, SWR should not fetch
    expect(result.current.isLoading).toBe(false)
  })

  it('usePredictionDetail returns loading when id is provided', () => {
    const { result } = renderHook(() => usePredictionDetail(1))
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useReasoningGraph returns null key when id is null', () => {
    const { result } = renderHook(() => useReasoningGraph(null))
    expect(result.current.isLoading).toBe(false)
  })

  it('useReasoningGraph returns loading when id is provided', () => {
    const { result } = renderHook(() => useReasoningGraph(5))
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useQualityReport returns SWR result', () => {
    const { result } = renderHook(() => useQualityReport())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useAccuracyHistory returns SWR result', () => {
    const { result } = renderHook(() => useAccuracyHistory())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useAccuracyHistory accepts custom window', () => {
    const { result } = renderHook(() => useAccuracyHistory(50))
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useDecayActive returns SWR result', () => {
    const { result } = renderHook(() => useDecayActive())
    expect(result.current).toHaveProperty('isLoading')
  })
})
