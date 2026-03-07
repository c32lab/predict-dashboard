import { useState } from 'react'
import useSWR from 'swr'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell,
} from 'recharts'
import type { BaselineResults, ABResults } from '../types/backtest'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const HORIZONS = ['1d', '3d', '7d'] as const
const HORIZON_COLORS = { '1d': '#3b82f6', '3d': '#8b5cf6', '7d': '#f59e0b' }
const REGIME_COLORS: Record<string, string> = { bull: '#22c55e', bear: '#ef4444', sideways: '#6b7280' }

const tooltipStyle = { backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }

function fmt(v: unknown): string {
  return `${Number(v) ?? 0}%`
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
  const { data: baseline, error: e1 } = useSWR<BaselineResults>('/backtest-baseline-results.json', fetcher)
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
            formatter={(value: unknown, name?: string) => [`${Number(value) ?? 0}${name?.includes('Composite') ? '' : '%'}`, name ?? '']}
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
