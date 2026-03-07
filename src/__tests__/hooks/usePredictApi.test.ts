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
  },
}))

// Mock SWR to avoid real network calls
vi.mock('swr', () => ({
  default: (key: unknown) => {
    if (key === null) return { data: undefined, error: undefined, isLoading: false }
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

  it('usePredictAccuracy returns SWR result', () => {
    const { result } = renderHook(() => usePredictAccuracy())
    expect(result.current).toHaveProperty('isLoading')
  })

  it('usePredictEvents accepts limit and pattern', () => {
    const { result } = renderHook(() => usePredictEvents(20, 'whale'))
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

  it('useLongShortRatio accepts symbol and limit', () => {
    const { result } = renderHook(() => useLongShortRatio('SOL/USDT', 12))
    expect(result.current).toHaveProperty('isLoading')
  })

  it('useTakerVolume accepts symbol and limit', () => {
    const { result } = renderHook(() => useTakerVolume('BNB/USDT', 6))
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
})
