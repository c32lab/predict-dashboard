import {
  BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer,
} from 'recharts'
import type { AccuracyBucket } from '../../types/backtest'
import { tooltipStyle, fmt } from './constants'
import { Section } from './Section'

export function ConfidenceBucketSection({ buckets }: { buckets: Record<string, AccuracyBucket> }) {
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
