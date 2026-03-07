import { useState } from 'react'
import type { AccuracyEntry, Validation } from '../../types/predict'
import { ValidationsTable } from './ValidationsTable'
import { AccuracyTrendChart } from './AccuracyTrendChart'
import { AccuracyFilterBar, AccuracyStats } from '../accuracy'

export function AccuracyAndValidationsSection({
  validations,
}: {
  accuracy: Record<string, AccuracyEntry>
  validations: Validation[]
}) {
  const [symbolFilter, setSymbolFilter] = useState('all')
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>('30d')

  const symbols = Array.from(new Set(validations.map((v) => v.symbol))).sort()

  const cutoff = (() => {
    if (timeRange === 'all') return null
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d
  })()

  const timeFiltered = cutoff
    ? validations.filter((v) => new Date(v.validated_at) >= cutoff)
    : validations

  const filtered =
    symbolFilter === 'all'
      ? timeFiltered
      : timeFiltered.filter((v) => v.symbol === symbolFilter)

  const total = filtered.length
  const correct = filtered.filter((v) => v.is_correct === 1).length
  const accuracyPct = total > 0 ? (correct / total) * 100 : 0

  const chartSymbols =
    symbolFilter === 'all'
      ? Array.from(new Set(filtered.map((v) => v.symbol))).sort()
      : [symbolFilter]

  const daySymbolMap: Record<string, Record<string, { correct: number; total: number }>> = {}
  for (const v of filtered) {
    const day = v.validated_at.slice(0, 10)
    if (!daySymbolMap[day]) daySymbolMap[day] = {}
    if (!daySymbolMap[day][v.symbol]) daySymbolMap[day][v.symbol] = { correct: 0, total: 0 }
    daySymbolMap[day][v.symbol].total++
    if (v.is_correct === 1) daySymbolMap[day][v.symbol].correct++
  }

  const trendData = Object.entries(daySymbolMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, symMap]) => {
      const point: Record<string, string | number> = { date: day }
      for (const sym of chartSymbols) {
        const s = symMap[sym]
        if (s) point[sym] = parseFloat(((s.correct / s.total) * 100).toFixed(1))
      }
      return point
    })

  return (
    <>
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">Prediction Accuracy</h2>
        </div>
        <div className="p-4 space-y-4">
          <AccuracyFilterBar
            symbolFilter={symbolFilter}
            onSymbolChange={setSymbolFilter}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            symbols={symbols}
          />
          <AccuracyStats total={total} correct={correct} accuracyPct={accuracyPct} />
          <AccuracyTrendChart trendData={trendData} chartSymbols={chartSymbols} />
        </div>
      </section>

      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Recent Validations
            {filtered.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({filtered.length})</span>
            )}
          </h2>
        </div>
        <div className="p-2">
          <ValidationsTable validations={filtered} />
        </div>
      </section>
    </>
  )
}
