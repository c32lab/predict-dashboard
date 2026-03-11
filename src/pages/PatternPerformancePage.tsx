import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import { PageSkeleton } from '../components/PageSkeleton'
import { useValidationReport, useQualityReport } from '../hooks/usePredictApi'
import type { ValidationModelStats } from '../types/predict'

function formatPatternName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function accuracyColor(value: number): string {
  if (value > 60) return 'text-green-400'
  if (value >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

type SortKey = 'name' | 'count' | '1d_accuracy' | '3d_accuracy' | '7d_accuracy' | '1d_mae'
type SortDir = 'asc' | 'desc'

interface PatternRow {
  name: string
  count: number
  '1d_accuracy': number
  '3d_accuracy': number
  '7d_accuracy': number
  '1d_mae': number
}

function SummaryCards({ rows }: { rows: PatternRow[] }) {
  const totalPatterns = rows.length
  const eligible = rows.filter((r) => r.count >= 3)
  const best = eligible.length > 0
    ? eligible.reduce((a, b) => (a['1d_accuracy'] > b['1d_accuracy'] ? a : b))
    : null
  const worst = eligible.length > 0
    ? eligible.reduce((a, b) => (a['1d_accuracy'] < b['1d_accuracy'] ? a : b))
    : null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-500">Total Patterns</p>
        <p className="text-2xl font-bold text-gray-100" data-testid="total-patterns">{totalPatterns}</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-500">Best Pattern (1d)</p>
        {best ? (
          <>
            <p className="text-lg font-bold text-green-400" data-testid="best-pattern">{formatPatternName(best.name)}</p>
            <p className="text-sm text-gray-400">{best['1d_accuracy'].toFixed(1)}% accuracy ({best.count} predictions)</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">N/A</p>
        )}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-500">Worst Pattern (1d)</p>
        {worst ? (
          <>
            <p className="text-lg font-bold text-red-400" data-testid="worst-pattern">{formatPatternName(worst.name)}</p>
            <p className="text-sm text-gray-400">{worst['1d_accuracy'].toFixed(1)}% accuracy ({worst.count} predictions)</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">N/A</p>
        )}
      </div>
    </div>
  )
}

function PatternTable({ rows }: { rows: PatternRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('count')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aVal = sortKey === 'name' ? a.name : a[sortKey]
      const bVal = sortKey === 'name' ? b.name : b[sortKey]
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [rows, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const headerClass = 'px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-gray-200 select-none'
  const arrow = (key: SortKey) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '')

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto">
      <table className="w-full text-sm" data-testid="pattern-table">
        <thead>
          <tr className="border-b border-gray-800">
            <th className={headerClass} onClick={() => toggleSort('name')}>Pattern{arrow('name')}</th>
            <th className={headerClass} onClick={() => toggleSort('count')}>Count{arrow('count')}</th>
            <th className={headerClass} onClick={() => toggleSort('1d_accuracy')}>1d Accuracy{arrow('1d_accuracy')}</th>
            <th className={headerClass} onClick={() => toggleSort('3d_accuracy')}>3d Accuracy{arrow('3d_accuracy')}</th>
            <th className={headerClass} onClick={() => toggleSort('7d_accuracy')}>7d Accuracy{arrow('7d_accuracy')}</th>
            <th className={headerClass} onClick={() => toggleSort('1d_mae')}>1d MAE{arrow('1d_mae')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.name} className="border-b border-gray-800/50 hover:bg-gray-800/30">
              <td className="px-3 py-2 text-gray-100 font-medium">{formatPatternName(row.name)}</td>
              <td className="px-3 py-2 text-gray-300">{row.count}</td>
              <td className={`px-3 py-2 font-medium ${accuracyColor(row['1d_accuracy'])}`}>{row['1d_accuracy'].toFixed(1)}%</td>
              <td className={`px-3 py-2 font-medium ${accuracyColor(row['3d_accuracy'])}`}>{row['3d_accuracy'].toFixed(1)}%</td>
              <td className={`px-3 py-2 font-medium ${accuracyColor(row['7d_accuracy'])}`}>{row['7d_accuracy'].toFixed(1)}%</td>
              <td className="px-3 py-2 text-gray-300">{row['1d_mae'].toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CategoryDistributionChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data)
    .map(([name, count]) => ({ name: formatPatternName(name), count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Predictions by Pattern</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            width={140}
          />
          <Tooltip
            contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value: unknown) => [Number(value ?? 0), 'Count']}
          />
          <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function ConfidenceDistributionChart({
  data,
}: {
  data: Record<string, { count: number; accuracy: number }>
}) {
  const chartData = Object.entries(data)
    .map(([bucket, { count, accuracy }]) => ({
      bucket,
      count,
      accuracy: accuracy * 100,
    }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Confidence Distribution & Accuracy</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="bucket" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value: unknown, name: unknown) => {
              const n = String(name ?? '')
              return n === 'accuracy'
                ? [`${Number(value ?? 0).toFixed(1)}%`, 'Accuracy']
                : [Number(value ?? 0), 'Count']
            }}
          />
          <Bar yAxisId="left" dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function PatternPerformancePage() {
  const { data: validation, error: vError, isLoading: vLoading } = useValidationReport()
  const { data: quality, error: qError, isLoading: qLoading } = useQualityReport()

  if (vLoading || qLoading) return <PageSkeleton />

  const error = vError || qError
  if (error) {
    return (
      <div className="p-6 text-red-400">
        Failed to load pattern performance data: {error.message}
      </div>
    )
  }

  const rows: PatternRow[] = validation
    ? Object.entries(validation.summary_by_model).map(
        ([name, stats]: [string, ValidationModelStats]) => ({
          name,
          count: stats.count,
          '1d_accuracy': stats['1d_accuracy'],
          '3d_accuracy': stats['3d_accuracy'],
          '7d_accuracy': stats['7d_accuracy'],
          '1d_mae': stats['1d_mae'],
        })
      )
    : []

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">Pattern Performance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Accuracy and error metrics by prediction pattern, with confidence and category breakdowns.
        </p>
      </div>

      <SectionErrorBoundary title="Summary">
        <SummaryCards rows={rows} />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Pattern Table">
        <PatternTable rows={rows} />
      </SectionErrorBoundary>

      {quality && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionErrorBoundary title="Category Distribution">
            <CategoryDistributionChart data={quality.category_distribution} />
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Confidence Distribution">
            <ConfidenceDistributionChart data={quality.confidence_distribution} />
          </SectionErrorBoundary>
        </div>
      )}
    </div>
  )
}
