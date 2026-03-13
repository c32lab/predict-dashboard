import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, ResponsiveContainer,
} from 'recharts'
import type { FullResults, AccuracyBucket, BaselineResults } from '../../types/backtest'
import { HORIZONS, tooltipStyle, fmt } from './constants'
import { Section } from './Section'

interface Props {
  data: FullResults
}

type Tab = 'symbol' | 'pattern' | 'confidence'

export function EnhancedMetricsSection({ data }: Props) {
  const [tab, setTab] = useState<Tab>('symbol')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'symbol', label: 'Per-Symbol Accuracy' },
    { key: 'pattern', label: 'Per-Pattern Trends' },
    { key: 'confidence', label: 'Confidence Calibration' },
  ]

  return (
    <Section title="Enhanced Metrics">
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'symbol' && <SymbolAccuracyView symbols={data.multi_symbol_conduction?.by_symbol ?? {}} />}
      {tab === 'pattern' && <PatternTrendsView
        predictionPatterns={data.prediction_backtest.by_trigger_pattern}
        decayModels={data.decay_model_backtest.by_model}
      />}
      {tab === 'confidence' && <ConfidenceCalibrationView buckets={data.prediction_backtest.by_confidence_bucket} />}
    </Section>
  )
}

/* --- Per-Symbol Accuracy --- */
function SymbolAccuracyView({ symbols }: { symbols: FullResults['multi_symbol_conduction']['by_symbol'] }) {
  const sorted = Object.entries(symbols).sort((a, b) => b[1].overall_accuracy_pct - a[1].overall_accuracy_pct)

  if (sorted.length === 0) return <div className="text-gray-500 text-sm">No symbol data available</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 px-2">Symbol</th>
            <th className="text-right py-2 px-2">Overall</th>
            {HORIZONS.map(h => (
              <th key={h} className="text-right py-2 px-2">{h}</th>
            ))}
            <th className="text-right py-2 px-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(([symbol, s]) => (
            <tr key={symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30">
              <td className="py-2 px-2 font-mono">{symbol}</td>
              <td className="text-right py-2 px-2">
                <AccuracyBadge pct={s.overall_accuracy_pct} />
              </td>
              {HORIZONS.map(h => (
                <td key={h} className="text-right py-2 px-2 text-gray-400">
                  {s.horizons[h] ? `${s.horizons[h].accuracy_pct}%` : '—'}
                </td>
              ))}
              <td className="text-right py-2 px-2 text-gray-500">{s.overall_correct}/{s.overall_total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* --- Per-Pattern Trends (combined prediction patterns + decay models) --- */
function PatternTrendsView({ predictionPatterns, decayModels }: {
  predictionPatterns: Record<string, AccuracyBucket>
  decayModels: BaselineResults['decay_model_backtest']['by_model']
}) {
  // Merge prediction patterns and decay model patterns
  const allPatterns = new Map<string, { prediction?: AccuracyBucket; decay?: { count: number; horizons: Record<string, { correct: number; total: number; accuracy_pct: number }> } }>()

  for (const [k, v] of Object.entries(predictionPatterns)) {
    allPatterns.set(k, { prediction: v })
  }
  for (const [k, v] of Object.entries(decayModels)) {
    const existing = allPatterns.get(k) ?? {}
    allPatterns.set(k, { ...existing, decay: v })
  }

  const chartData = Array.from(allPatterns.entries())
    .map(([pattern, d]) => ({
      pattern: pattern.replace(/_/g, ' '),
      prediction: d.prediction?.accuracy_pct ?? 0,
      decay_1d: d.decay?.horizons['1d']?.accuracy_pct ?? 0,
      decay_3d: d.decay?.horizons['3d']?.accuracy_pct ?? 0,
      total: (d.prediction?.total ?? 0) + (d.decay?.count ?? 0),
    }))
    .sort((a, b) => b.prediction - a.prediction)

  return (
    <div>
      <ResponsiveContainer width="100%" height={Math.max(250, chartData.length * 35)}>
        <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
          <XAxis type="number" stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="pattern" stroke="#9ca3af" width={140} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: unknown) => fmt(value)} />
          <Legend />
          <Bar dataKey="prediction" name="Prediction" fill="#3b82f6" radius={[0, 4, 4, 0]}>
            <LabelList dataKey="total" position="right" fill="#9ca3af" fontSize={10} formatter={(v: unknown) => `n=${v}`} />
          </Bar>
          <Bar dataKey="decay_1d" name="Decay 1d" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* --- Confidence Calibration --- */
function ConfidenceCalibrationView({ buckets }: { buckets: Record<string, AccuracyBucket> }) {
  const data = Object.entries(buckets).map(([bucket, s]) => {
    // Parse midpoint of bucket for ideal calibration line
    const match = bucket.match(/([\d.]+)/)
    const lower = match ? parseFloat(match[1]) : 0.5
    const idealPct = lower * 100

    return {
      bucket,
      accuracy: s.accuracy_pct,
      ideal: Math.min(idealPct, 95),
      total: s.total,
      correct: s.correct,
    }
  })

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">Comparing actual accuracy vs expected accuracy based on confidence level. Well-calibrated models should track the diagonal.</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis dataKey="bucket" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name) => [fmt(value), name === 'ideal' ? 'Expected' : 'Actual']}
            labelFormatter={(label: unknown) => `Confidence: ${String(label ?? '')}`}
          />
          <Legend />
          <Bar dataKey="accuracy" name="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="total" position="top" fill="#9ca3af" fontSize={11} formatter={(v: unknown) => `n=${v}`} />
          </Bar>
          <Bar dataKey="ideal" name="Expected" fill="#374151" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {data.map(d => {
          const diff = d.accuracy - d.ideal
          const isOver = diff > 0
          return (
            <div key={d.bucket} className="text-xs text-gray-400 bg-gray-800/50 rounded p-2">
              <div className="font-mono">{d.bucket}</div>
              <div className={isOver ? 'text-green-400' : 'text-red-400'}>
                {isOver ? '+' : ''}{diff.toFixed(1)}pp {isOver ? 'overconfident' : 'underconfident'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AccuracyBadge({ pct }: { pct: number }) {
  const color = pct >= 60 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'
  return <span className={`font-bold ${color}`}>{pct}%</span>
}
