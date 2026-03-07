import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MacroHistoryChart } from '../../../components/predict/MacroHistoryChart'
import type { MacroSnapshot } from '../../../types/predict'

function makeSnapshot(overrides: Partial<MacroSnapshot> = {}): MacroSnapshot {
  return {
    id: 1,
    timestamp: '2026-03-06T09:00:00Z',
    fear_greed: 45,
    fear_greed_trend: 'down',
    etf_flow_1d: 100000000,
    etf_flow_5d: 500000000,
    macro_score: 6.5,
    reasons: [],
    btc_price: 65000,
    ...overrides,
  }
}

describe('MacroHistoryChart', () => {
  it('renders without crashing with data', () => {
    const snapshots = [
      makeSnapshot({ timestamp: '2026-03-04T00:00:00Z', macro_score: 5 }),
      makeSnapshot({ timestamp: '2026-03-05T00:00:00Z', macro_score: 6 }),
      makeSnapshot({ timestamp: '2026-03-06T00:00:00Z', macro_score: 7 }),
    ]
    const { container } = render(<MacroHistoryChart snapshots={snapshots} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders without crashing with empty data', () => {
    const { container } = render(<MacroHistoryChart snapshots={[]} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders without crashing with single data point', () => {
    const { container } = render(<MacroHistoryChart snapshots={[makeSnapshot()]} />)
    expect(container.firstChild).toBeTruthy()
  })
})
