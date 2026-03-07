import { useState } from 'react'
import useSWR from 'swr'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell, LabelList,
} from 'recharts'
import type { BaselineResults, ABResults, FullResults, AccuracyBucket } from '../types/backtest'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const HORIZONS = ['1d', '3d', '7d'] as const
const HORIZON_COLORS = { '1d': '#3b82f6', '3d': '#8b5cf6', '7d': '#f59e0b' }
const REGIME_COLORS: Record<string, string> = { bull: '#22c55e', bear: '#ef4444', sideways: '#6b7280' }

const tooltipStyle = { backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }

function fmt(v: unknown): string {
  return `${Number(v) || 0}%`
}

// ─── KPI Card ───
function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

// ─── Section wrapper ───
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </section>
  )
}

export default function BacktestPage() {
  const { data: baseline, error: e1 } = useSWR<FullResults>('/backtest-full-results.json', fetcher)
  const { data: ab, error: e2 } = useSWR<ABResults>('/backtest-ab-results.json', fetcher)

  if (e1 || e2) return <div className="p-8 text-red-400">Failed to load backtest data.</div>
  if (!baseline || !ab) return <div className="p-8 text-gray-500">Loading backtest data...</div>

  const pb = baseline.prediction_backtest
  const dm = baseline.decay_model_backtest
  const sweep = baseline.parameter_sweep

  // Find best/worst horizon
  const horizonEntries = Object.entries(pb.by_horizon)
  const best = horizonEntries.reduce((a, b) => b[1].accuracy_pct > a[1].accuracy_pct ? b : a)
  const worst = horizonEntries.reduce((a, b) => b[1].accuracy_pct < a[1].accuracy_pct ? b : a)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Backtest Results</h1>
      <p className="text-xs text-gray-500">Generated {baseline.generated_at}</p>

      {/* A. KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KpiCard label="Total Predictions" value={String(pb.total_predictions)} />
        <KpiCard label="Overall Accuracy" value={`${pb.overall_accuracy_pct}%`} sub={`${pb.overall_correct}/${pb.overall_total}`} />
        <KpiCard label="Best Horizon" value={`${best[0]} ${best[1].accuracy_pct}%`} sub={`${best[1].correct}/${best[1].total}`} />
        <KpiCard label="Worst Horizon" value={`${worst[0]} ${worst[1].accuracy_pct}%`} sub={`${worst[1].correct}/${worst[1].total}`} />
        <KpiCard label="LONG Accuracy" value={`${pb.by_direction['LONG']?.accuracy_pct ?? 0}%`} sub={`${pb.by_direction['LONG']?.correct ?? 0}/${pb.by_direction['LONG']?.total ?? 0}`} />
        <KpiCard label="SHORT Accuracy" value={`${pb.by_direction['SHORT']?.accuracy_pct ?? 0}%`} sub={`${pb.by_direction['SHORT']?.correct ?? 0}/${pb.by_direction['SHORT']?.total ?? 0}`} />
      </div>

      {/* B. A/B Strategy Comparison */}
      <ABSection ab={ab} />

      {/* C. Regime Analysis */}
      <RegimeSection regimes={dm.by_regime} />

      {/* D. Parameter Sweep */}
      <SweepSection sweep={sweep} />

      {/* E. Findings & Suggestions */}
      <FindingsSection findings={baseline.findings} suggestions={baseline.suggestions} />

      {/* F. Pattern Accuracy Heatmap */}
      <PatternHeatmapSection patterns={pb.by_trigger_pattern} />

      {/* G. Confusion Matrix */}
      <ConfusionMatrixSection cm={pb.confusion_matrix} />

      {/* H. Confidence Bucket Analysis */}
      <ConfidenceBucketSection buckets={pb.by_confidence_bucket} />

      {/* I. Multi-Symbol Comparison */}
      <SymbolComparisonSection symbols={baseline.multi_symbol_conduction.by_symbol} />

      {/* J. Before/After Comparison */}
      <BeforeAfterSection data={baseline.before_after_comparison} />
    </div>
  )
}

// ═══════════════════════════════════════
// B. A/B Strategy Comparison
// ═══════════════════════════════════════
function ABSection({ ab }: { ab: ABResults }) {
  const [showDesc, setShowDesc] = useState(false)
  const strategies = Object.keys(ab.summary).sort()

  const chartData = strategies.map(s => {
    const h = ab.summary[s].horizons
    return {
      strategy: s,
      '1d': h['1d']?.accuracy_pct ?? 0,
      '3d': h['3d']?.accuracy_pct ?? 0,
      '7d': h['7d']?.accuracy_pct ?? 0,
    }
  })

  // Find best strategy by 1d accuracy (with total > 0)
  const bestStrategy = strategies.reduce((best, s) => {
    const h = ab.summary[s].horizons
    const cur = h['1d']?.total ? h['1d'].accuracy_pct : 0
    const prev = ab.summary[best].horizons['1d']?.total ? ab.summary[best].horizons['1d'].accuracy_pct : 0
    return cur > prev ? s : best
  })

  return (
    <Section title="A/B Strategy Comparison">
      <div className="mb-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis dataKey="strategy" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: unknown) => fmt(value)} />
            <Legend />
            {HORIZONS.map(h => (
              <Bar key={h} dataKey={h} fill={HORIZON_COLORS[h]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left py-2 pr-4">Strategy</th>
              {HORIZONS.map(h => (
                <th key={h} className="text-right py-2 px-3">{h} Acc%</th>
              ))}
              {HORIZONS.map(h => (
                <th key={`n-${h}`} className="text-right py-2 px-3">{h} N</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {strategies.map(s => {
              const h = ab.summary[s].horizons
              const isBest = s === bestStrategy
              return (
                <tr key={s} className={`border-b border-gray-800/50 ${isBest ? 'bg-blue-950/30' : ''}`}>
                  <td className="py-2 pr-4 font-mono">
                    {s}{isBest && <span className="ml-2 text-xs text-blue-400">best</span>}
                  </td>
                  {HORIZONS.map(hz => (
                    <td key={hz} className="text-right py-2 px-3">
                      {h[hz]?.total ? `${h[hz].accuracy_pct}%` : '—'}
                    </td>
                  ))}
                  {HORIZONS.map(hz => (
                    <td key={`n-${hz}`} className="text-right py-2 px-3 text-gray-500">
                      {h[hz]?.total ?? 0}
                      {h[hz]?.neutral_skipped ? <span className="text-gray-600 ml-1">(+{h[hz].neutral_skipped} skip)</span> : null}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Strategy descriptions toggle */}
      <button
        className="mt-4 text-xs text-gray-500 hover:text-gray-300 underline"
        onClick={() => setShowDesc(!showDesc)}
      >
        {showDesc ? 'Hide' : 'Show'} strategy descriptions
      </button>
      {showDesc && (
        <div className="mt-2 space-y-1 text-xs text-gray-400">
          {Object.entries(ab.strategy_descriptions).map(([k, v]) => (
            <div key={k}><span className="font-mono text-gray-300">{k}:</span> {v}</div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ═══════════════════════════════════════
// C. Regime Analysis
// ═══════════════════════════════════════
function RegimeSection({ regimes }: { regimes: BaselineResults['decay_model_backtest']['by_regime'] }) {
  const chartData = Object.entries(regimes).map(([regime, data]) => ({
    regime,
    count: data.count,
    '1d': data.horizons['1d']?.accuracy_pct ?? 0,
    '3d': data.horizons['3d']?.accuracy_pct ?? 0,
    '7d': data.horizons['7d']?.accuracy_pct ?? 0,
  }))

  return (
    <Section title="Regime Analysis (Decay Model)">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barCategoryGap="20%">
          <XAxis dataKey="regime" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: unknown) => fmt(value)} />
          <Legend />
          {HORIZONS.map(h => (
            <Bar key={h} dataKey={h} fill={HORIZON_COLORS[h]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Regime detail cards */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {Object.entries(regimes).map(([regime, data]) => (
          <div key={regime} className="rounded-lg border border-gray-800 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: REGIME_COLORS[regime] ?? '#6b7280' }} />
              <span className="font-medium capitalize">{regime}</span>
              <span className="text-xs text-gray-500">({data.count} events)</span>
            </div>
            {Object.entries(data.horizons).map(([h, s]) => (
              <div key={h} className="flex justify-between text-sm text-gray-400">
                <span>{h}</span>
                <span>{s.total ? `${s.accuracy_pct}% (${s.correct}/${s.total})` : '—'}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════
// D. Parameter Sweep
// ═══════════════════════════════════════
function SweepSection({ sweep }: { sweep: BaselineResults['parameter_sweep'] }) {
  const bp = sweep.best_params

  const scatterData = sweep.results.map(r => ({
    x: r.avg_accuracy_pct,
    y: r.avg_coverage_pct,
    z: r.composite_score,
    label: `conf=${r.confidence_threshold} dir=${r.direction_threshold_pct}%`,
    isBest: r.confidence_threshold === bp.confidence_threshold && r.direction_threshold_pct === bp.direction_threshold_pct,
  }))

  return (
    <Section title="Parameter Sweep (18 combos)">
      <div className="mb-2 text-sm text-gray-400">
        Best: confidence&ge;{bp.confidence_threshold}, direction_thresh={bp.direction_threshold_pct}% —
        accuracy={bp.avg_accuracy_pct}%, coverage={bp.avg_coverage_pct}%, composite={bp.composite_score}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <XAxis type="number" dataKey="x" name="Avg Accuracy" unit="%" stroke="#9ca3af" domain={[20, 70]} />
          <YAxis type="number" dataKey="y" name="Avg Coverage" unit="%" stroke="#9ca3af" domain={[0, 70]} />
          <ZAxis type="number" dataKey="z" name="Composite" range={[40, 400]} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: unknown, name?: string) => [`${Number(value) || 0}${name?.includes('Composite') ? '' : '%'}`, name ?? '']}
            labelFormatter={() => ''}
          />
          <Scatter data={scatterData}>
            {scatterData.map((entry, i) => (
              <Cell key={i} fill={entry.isBest ? '#f59e0b' : '#3b82f6'} stroke={entry.isBest ? '#fbbf24' : 'none'} strokeWidth={entry.isBest ? 2 : 0} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left py-1.5">Confidence</th>
              <th className="text-left py-1.5">Dir Thresh%</th>
              <th className="text-right py-1.5">Avg Acc%</th>
              <th className="text-right py-1.5">Avg Cov%</th>
              <th className="text-right py-1.5">Composite</th>
            </tr>
          </thead>
          <tbody>
            {sweep.results.map((r, i) => {
              const isBest = r.confidence_threshold === bp.confidence_threshold && r.direction_threshold_pct === bp.direction_threshold_pct
              return (
                <tr key={i} className={`border-b border-gray-800/50 ${isBest ? 'bg-amber-950/30 font-semibold' : ''}`}>
                  <td className="py-1.5">{r.confidence_threshold}</td>
                  <td className="py-1.5">{r.direction_threshold_pct}</td>
                  <td className="text-right py-1.5">{r.avg_accuracy_pct}%</td>
                  <td className="text-right py-1.5">{r.avg_coverage_pct}%</td>
                  <td className="text-right py-1.5">{r.composite_score}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════
// E. Findings & Suggestions
// ═══════════════════════════════════════
function FindingsSection({ findings, suggestions }: { findings: string[]; suggestions: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Section title="Findings">
        <ul className="space-y-2">
          {findings.map((f, i) => (
            <li key={i} className="text-sm bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 text-blue-200">
              {f}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Suggestions">
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <li key={i} className="text-sm bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3 text-yellow-200">
              {s}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

// ═══════════════════════════════════════
// F. Pattern Accuracy Heatmap
// ═══════════════════════════════════════
function patternColor(pct: number) {
  if (pct >= 70) return 'bg-green-900 text-green-200'
  if (pct >= 50) return 'bg-green-950 text-green-300'
  return 'bg-red-900/60 text-red-200'
}

function PatternHeatmapSection({ patterns }: { patterns: Record<string, AccuracyBucket> }) {
  const sorted = Object.entries(patterns).sort((a, b) => b[1].accuracy_pct - a[1].accuracy_pct)
  return (
    <Section title="Pattern Accuracy Heatmap">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(([pattern, s]) => (
          <div key={pattern} className={`rounded-lg p-3 ${patternColor(s.accuracy_pct)}`}>
            <div className="font-mono text-sm">{pattern}</div>
            <div className="flex justify-between mt-1 text-xs">
              <span>{s.correct}/{s.total}</span>
              <span className="font-bold">{s.accuracy_pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════
// G. Confusion Matrix
// ═══════════════════════════════════════
function ConfusionMatrixSection({ cm }: { cm: FullResults['prediction_backtest']['confusion_matrix'] }) {
  return (
    <Section title="Confusion Matrix">
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="bg-green-900/40 border border-green-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400">True Positive</div>
          <div className="text-2xl font-bold text-green-300">{cm.TP}</div>
        </div>
        <div className="bg-red-900/40 border border-red-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400">False Positive</div>
          <div className="text-2xl font-bold text-red-300">{cm.FP}</div>
        </div>
        <div className="bg-red-900/40 border border-red-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400">False Negative</div>
          <div className="text-2xl font-bold text-red-300">{cm.FN}</div>
        </div>
        <div className="bg-green-900/40 border border-green-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400">True Negative</div>
          <div className="text-2xl font-bold text-green-300">{cm.TN}</div>
        </div>
      </div>
      <div className="flex gap-6 mt-4 text-sm text-gray-300">
        <span>Precision: <strong>{cm.precision_pct}%</strong></span>
        <span>Recall: <strong>{cm.recall_pct}%</strong></span>
        <span>F1: <strong>{cm.f1}</strong></span>
        <span>Accuracy: <strong>{cm.accuracy_pct}%</strong></span>
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════
// H. Confidence Bucket Analysis
// ═══════════════════════════════════════
function ConfidenceBucketSection({ buckets }: { buckets: Record<string, AccuracyBucket> }) {
  const chartData = Object.entries(buckets).map(([bucket, s]) => ({
    bucket,
    accuracy: s.accuracy_pct,
    total: s.total,
  }))

  return (
    <Section title="Confidence Bucket Analysis">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barCategoryGap="30%">
          <XAxis dataKey="bucket" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: unknown) => fmt(value)}
            labelFormatter={(label: unknown) => `Confidence: ${String(label ?? '')}`}
          />
          <Bar dataKey="accuracy" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="total" position="top" fill="#9ca3af" fontSize={11} formatter={(v: unknown) => `n=${v}`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Section>
  )
}

// ═══════════════════════════════════════
// I. Multi-Symbol Comparison
// ═══════════════════════════════════════
function SymbolComparisonSection({ symbols }: { symbols: FullResults['multi_symbol_conduction']['by_symbol'] }) {
  const sorted = Object.entries(symbols).sort((a, b) => b[1].overall_accuracy_pct - a[1].overall_accuracy_pct)
  const horizonKeys = sorted.length > 0 ? Object.keys(sorted[0][1].horizons) : []

  const chartData = sorted.map(([symbol, s]) => {
    const row: Record<string, string | number> = { symbol }
    for (const h of horizonKeys) {
      row[h] = s.horizons[h]?.accuracy_pct ?? 0
    }
    return row
  })

  return (
    <Section title="Multi-Symbol Comparison">
      <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 50)}>
        <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
          <XAxis type="number" stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="symbol" stroke="#9ca3af" width={90} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: unknown) => fmt(value)} />
          <Legend />
          {horizonKeys.map(h => (
            <Bar key={h} dataKey={h} fill={HORIZON_COLORS[h as keyof typeof HORIZON_COLORS] ?? '#6b7280'} radius={[0, 4, 4, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Section>
  )
}

// ═══════════════════════════════════════
// J. Before/After Comparison
// ═══════════════════════════════════════
function BeforeAfterSection({ data }: { data: FullResults['before_after_comparison'] }) {
  const { before, after, delta } = data
  const deltaColor = delta.accuracy_change_pp >= 0 ? 'text-green-400' : 'text-red-400'
  const deltaSign = delta.accuracy_change_pp >= 0 ? '+' : ''

  return (
    <Section title="Before / After Comparison">
      <div className="grid grid-cols-3 gap-4">
        {/* Before card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Before</h3>
          <div className="text-2xl font-bold">{before.overall_accuracy_pct}%</div>
          <div className="text-xs text-gray-400">{before.overall_correct}/{before.overall_total} correct</div>
          <div className="text-xs text-gray-500 mt-1">{before.total_predictions} predictions</div>
          <div className="mt-3 space-y-1">
            {Object.entries(before.by_horizon).map(([h, s]) => (
              <div key={h} className="flex justify-between text-sm text-gray-400">
                <span>{h}</span>
                <span>{s.accuracy_pct}% ({s.correct}/{s.total})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delta card */}
        <div className="flex flex-col items-center justify-center bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-2">Accuracy Change</div>
          <div className={`text-3xl font-bold ${deltaColor}`}>
            {deltaSign}{delta.accuracy_change_pp}pp
          </div>
          <div className="text-xs text-gray-500 mt-3">
            {delta.predictions_removed} predictions removed
          </div>
          <div className="text-xs text-gray-500">
            {delta.validations_removed} validations removed
          </div>
        </div>

        {/* After card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">After</h3>
          <div className="text-2xl font-bold">{after.overall_accuracy_pct}%</div>
          <div className="text-xs text-gray-400">{after.overall_correct}/{after.overall_total} correct</div>
          <div className="text-xs text-gray-500 mt-1">{after.total_predictions} predictions</div>
          <div className="mt-3 space-y-1">
            {Object.entries(after.by_horizon).map(([h, s]) => (
              <div key={h} className="flex justify-between text-sm text-gray-400">
                <span>{h}</span>
                <span>{s.accuracy_pct}% ({s.correct}/{s.total})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
