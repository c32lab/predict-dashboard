import { Section } from './Section'
import type { BaselineResults } from '../../types/backtest'
import { HORIZONS, HORIZON_COLORS } from './constants'

type ByYear = BaselineResults['decay_model_backtest']['by_year']

interface Props {
  byYear: ByYear
  selected: string | null
  onSelect: (year: string | null) => void
}

export function TimeRangeSelector({ byYear, selected, onSelect }: Props) {
  const years = Object.keys(byYear).sort()
  if (years.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 mr-1">Year Filter:</span>
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
          selected === null ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
      >
        All Years
      </button>
      {years.map(year => {
        const d = byYear[year]
        return (
          <button
            key={year}
            onClick={() => onSelect(year)}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              selected === year ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {year} <span className="text-gray-500">({d.count})</span>
          </button>
        )
      })}
    </div>
  )
}

/* Selected year detail card */
export function YearDetailCard({ year, data }: { year: string; data: { count: number; horizons: Record<string, { correct: number; total: number; accuracy_pct: number }> } }) {
  return (
    <div className="bg-gray-900 border border-blue-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Year {year} Detail</h3>
        <span className="text-xs text-gray-500">{data.count} events</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {HORIZONS.map(h => {
          const hs = data.horizons[h]
          if (!hs) return null
          return (
            <div key={h} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{h}</div>
              <div className="text-lg font-bold" style={{ color: HORIZON_COLORS[h] }}>
                {hs.accuracy_pct}%
              </div>
              <div className="text-xs text-gray-500">{hs.correct}/{hs.total}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* --- Market Cycle Selector --- */
export type MarketCycle = 'all' | 'bull' | 'bear' | 'sideways'

const CYCLE_OPTIONS: { key: MarketCycle; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: 'bg-blue-600' },
  { key: 'bull', label: 'Bull Market', color: 'bg-green-600' },
  { key: 'bear', label: 'Bear Market', color: 'bg-red-600' },
  { key: 'sideways', label: 'Sideways', color: 'bg-gray-600' },
]

interface MarketCycleSelectorProps {
  selected: MarketCycle
  onSelect: (cycle: MarketCycle) => void
}

export function MarketCycleSelector({ selected, onSelect }: MarketCycleSelectorProps) {
  return (
    <Section title="Market Cycle Filter">
      <div className="flex items-center gap-2 flex-wrap">
        {CYCLE_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              selected === opt.key
                ? `${opt.color} text-white`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {selected !== 'all' && (
        <p className="mt-3 text-xs text-gray-500">
          Filtering by {CYCLE_OPTIONS.find(o => o.key === selected)?.label}. Data granularity for cycle-level filtering will be available in future backtest runs.
        </p>
      )}
    </Section>
  )
}
