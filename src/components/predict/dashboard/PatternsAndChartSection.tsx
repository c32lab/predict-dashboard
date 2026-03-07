import SectionErrorBoundary from '../../SectionErrorBoundary'
import { PatternCard } from '../PatternCard'
import { MacroHistoryChart } from '../MacroHistoryChart'
import type { Pattern, MacroSnapshot } from '../../../types/predict'

export function PatternsAndChartSection({
  patterns,
  macroHistory,
}: {
  patterns: Pattern[]
  macroHistory: MacroSnapshot[]
}) {
  return (
    <SectionErrorBoundary title="Patterns & Macro Chart">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Event Patterns</h2>
          {patterns.length === 0 ? (
            <p className="text-gray-600 text-sm">No patterns</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patterns.map((p) => (
                <PatternCard key={p.id} pattern={p} />
              ))}
            </div>
          )}
        </section>

        <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Macro History</h2>
          {macroHistory?.length > 0 ? (
            <MacroHistoryChart snapshots={macroHistory} />
          ) : (
            <p className="text-center text-gray-600 text-sm py-16">No history data</p>
          )}
        </section>
      </div>
    </SectionErrorBoundary>
  )
}
