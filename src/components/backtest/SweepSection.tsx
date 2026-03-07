import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ResponsiveContainer,
} from 'recharts'
import type { BaselineResults } from '../../types/backtest'
import { tooltipStyle } from './constants'
import { Section } from './Section'

export function SweepSection({ sweep }: { sweep: BaselineResults['parameter_sweep'] }) {
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
