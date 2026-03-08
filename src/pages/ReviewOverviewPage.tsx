import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

// --- Mock data (TODO: replace with real API calls to predict /explain and /review endpoints) ---

interface MockPrediction {
  id: number
  symbol: string
  direction: 'LONG' | 'SHORT'
  confidence: number
  outcome: 'Correct' | 'Wrong'
  date: string
}

const MOCK_PREDICTIONS: MockPrediction[] = [
  { id: 101, symbol: 'BTC', direction: 'LONG', confidence: 82, outcome: 'Correct', date: '2026-03-08' },
  { id: 102, symbol: 'ETH', direction: 'SHORT', confidence: 65, outcome: 'Wrong', date: '2026-03-08' },
  { id: 103, symbol: 'SOL', direction: 'LONG', confidence: 74, outcome: 'Correct', date: '2026-03-07' },
  { id: 104, symbol: 'BTC', direction: 'SHORT', confidence: 58, outcome: 'Wrong', date: '2026-03-07' },
  { id: 105, symbol: 'ETH', direction: 'LONG', confidence: 91, outcome: 'Correct', date: '2026-03-06' },
  { id: 106, symbol: 'SOL', direction: 'SHORT', confidence: 45, outcome: 'Wrong', date: '2026-03-06' },
  { id: 107, symbol: 'BTC', direction: 'LONG', confidence: 88, outcome: 'Correct', date: '2026-03-05' },
  { id: 108, symbol: 'ETH', direction: 'LONG', confidence: 72, outcome: 'Correct', date: '2026-03-05' },
]

interface ReasoningStep {
  step: number
  label: string
  detail: string
}

const MOCK_REASONING: Record<number, ReasoningStep[]> = {
  101: [
    { step: 1, label: 'Trigger Event', detail: 'Macro CPI data release signaled cooling inflation' },
    { step: 2, label: 'Pattern Match', detail: 'Historical: BTC rallies 70% of the time after CPI miss' },
    { step: 3, label: 'Direction Logic', detail: 'Bullish macro + strong on-chain accumulation → LONG' },
    { step: 4, label: 'Confidence Calculation', detail: 'Pattern strength 0.78 × signal alignment 1.05 = 82%' },
  ],
  102: [
    { step: 1, label: 'Trigger Event', detail: 'ETH gas fees spiked indicating network congestion' },
    { step: 2, label: 'Pattern Match', detail: 'Gas spikes preceded sell-offs in 60% of cases' },
    { step: 3, label: 'Direction Logic', detail: 'Network stress + whale transfers to exchanges → SHORT' },
    { step: 4, label: 'Confidence Calculation', detail: 'Pattern strength 0.55 × signal alignment 1.18 = 65%' },
  ],
}

const DEFAULT_REASONING: ReasoningStep[] = [
  { step: 1, label: 'Trigger Event', detail: 'Market event detected (mock)' },
  { step: 2, label: 'Pattern Match', detail: 'Historical pattern identified (mock)' },
  { step: 3, label: 'Direction Logic', detail: 'Direction determined from signals (mock)' },
  { step: 4, label: 'Confidence Calculation', detail: 'Confidence score computed (mock)' },
]

// TODO: replace with real /review attribution data
const MOCK_ATTRIBUTION = [
  { factor: 'Macro Events', correct: 18, wrong: 4 },
  { factor: 'On-chain Data', correct: 14, wrong: 6 },
  { factor: 'Technical Patterns', correct: 10, wrong: 8 },
  { factor: 'Sentiment', correct: 7, wrong: 9 },
  { factor: 'Whale Tracking', correct: 12, wrong: 5 },
]

// TODO: replace with real /review lessons data
const MOCK_LESSONS = {
  workingPatterns: [
    'Macro CPI/PPI releases combined with on-chain accumulation signals',
    'Whale wallet tracking with >1000 BTC movements',
    'High-confidence (>80%) predictions on BTC have 85% accuracy',
  ],
  failingPatterns: [
    'Gas fee spikes alone are weak SHORT signals for ETH',
    'Low-confidence (<60%) predictions perform near random',
    'Weekend sentiment data is unreliable',
  ],
  calibrationInsights: [
    'Confidence 80-100%: actual accuracy 84% (well calibrated)',
    'Confidence 60-80%: actual accuracy 58% (slightly overconfident)',
    'Confidence 40-60%: actual accuracy 42% (near random, filter these)',
  ],
}

// --- Components ---

const tooltipStyle = {
  contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 },
  labelStyle: { color: '#9ca3af' },
  itemStyle: { color: '#e5e7eb' },
}

function PredictionReviewTable({
  predictions,
  selectedId,
  onSelect,
}: {
  predictions: MockPrediction[]
  selectedId: number | null
  onSelect: (id: number) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
            <th className="text-left py-2 px-3">ID</th>
            <th className="text-left py-2 px-3">Symbol</th>
            <th className="text-left py-2 px-3">Direction</th>
            <th className="text-right py-2 px-3">Confidence</th>
            <th className="text-left py-2 px-3">Outcome</th>
            <th className="text-left py-2 px-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p) => (
            <tr
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`cursor-pointer border-b border-gray-800/50 transition-colors ${
                selectedId === p.id ? 'bg-blue-900/30' : 'hover:bg-gray-800/50'
              }`}
            >
              <td className="py-2 px-3 text-gray-400">#{p.id}</td>
              <td className="py-2 px-3 font-medium">{p.symbol}</td>
              <td className="py-2 px-3">
                <span className={p.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}>
                  {p.direction}
                </span>
              </td>
              <td className="py-2 px-3 text-right">{p.confidence}%</td>
              <td className="py-2 px-3">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  p.outcome === 'Correct'
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-red-900/50 text-red-400'
                }`}>
                  {p.outcome}
                </span>
              </td>
              <td className="py-2 px-3 text-gray-400">{p.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReasoningChainViewer({ predictionId }: { predictionId: number | null }) {
  const steps = predictionId
    ? (MOCK_REASONING[predictionId] ?? DEFAULT_REASONING)
    : null

  if (!predictionId || !steps) {
    return (
      <p className="text-gray-500 text-sm">Click a prediction above to view its reasoning chain.</p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">Reasoning chain for prediction #{predictionId}</p>
      <div className="space-y-0">
        {steps.map((s, i) => (
          <div key={s.step} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                {s.step}
              </div>
              {i < steps.length - 1 && <div className="w-0.5 h-6 bg-gray-700" />}
            </div>
            <div className="pb-3 min-w-0">
              <p className="text-sm font-medium text-gray-200">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PerformanceAttributionChart() {
  const data = MOCK_ATTRIBUTION

  return (
    <div className="h-[220px] sm:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 80 }}>
          <XAxis
            type="number"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="factor"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="correct" stackId="a" fill="#22c55e" name="Correct">
            {data.map((_, i) => (
              <Cell key={`correct-${i}`} fill="#22c55e" opacity={0.8} />
            ))}
          </Bar>
          <Bar dataKey="wrong" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} name="Wrong">
            {data.map((_, i) => (
              <Cell key={`wrong-${i}`} fill="#ef4444" opacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function LessonsLearnedCards() {
  const sections = [
    { title: 'Patterns that work', items: MOCK_LESSONS.workingPatterns, color: 'green' },
    { title: 'Patterns that fail', items: MOCK_LESSONS.failingPatterns, color: 'red' },
    { title: 'Confidence calibration insights', items: MOCK_LESSONS.calibrationInsights, color: 'blue' },
  ] as const

  const colorMap = {
    green: { border: 'border-green-800/50', dot: 'bg-green-400', title: 'text-green-400' },
    red: { border: 'border-red-800/50', dot: 'bg-red-400', title: 'text-red-400' },
    blue: { border: 'border-blue-800/50', dot: 'bg-blue-400', title: 'text-blue-400' },
  } as const

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sections.map((s) => {
        const c = colorMap[s.color]
        return (
          <div key={s.title} className={`bg-gray-900 border ${c.border} rounded-xl p-4`}>
            <h3 className={`text-sm font-semibold ${c.title} mb-3`}>{s.title}</h3>
            <ul className="space-y-2">
              {s.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-300">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

// --- Page ---

export default function ReviewOverviewPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // TODO: replace with real API hook when /review endpoint is live
  const predictions = useMemo(() => MOCK_PREDICTIONS, [])

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">Prediction Review / Postmortem</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review past predictions, inspect reasoning chains, and learn from outcomes.
        </p>
      </div>

      {/* Section 1: Prediction Review List */}
      <SectionErrorBoundary title="Prediction Review List">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent Predictions</h2>
          <PredictionReviewTable
            predictions={predictions}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </SectionErrorBoundary>

      {/* Section 2: Reasoning Chain Viewer */}
      <SectionErrorBoundary title="Reasoning Chain">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Reasoning Chain</h2>
          <ReasoningChainViewer predictionId={selectedId} />
        </div>
      </SectionErrorBoundary>

      {/* Section 3: Performance Attribution */}
      <SectionErrorBoundary title="Performance Attribution">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Performance Attribution</h2>
          <p className="text-xs text-gray-500 mb-2">
            Which reasoning factors contributed most to correct vs wrong predictions
          </p>
          <PerformanceAttributionChart />
        </div>
      </SectionErrorBoundary>

      {/* Section 4: Lessons Learned */}
      <SectionErrorBoundary title="Lessons Learned">
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Lessons Learned</h2>
          <LessonsLearnedCards />
        </div>
      </SectionErrorBoundary>
    </div>
  )
}
