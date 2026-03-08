export function ConfidenceFactorsSection({ factors }: { factors: Record<string, number> }) {
  if (!factors || Object.keys(factors).length === 0) {
    return (
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h2 className="text-sm font-semibold text-gray-200">Confidence Factors</h2>
        <p className="text-gray-500 text-sm mt-2">No confidence factors available</p>
      </section>
    )
  }

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200">Confidence Factors</h2>
      </div>
      <div className="p-4 space-y-2">
        {Object.entries(factors).map(([factor, weight]) => (
          <div key={factor} className="flex items-center gap-3">
            <span className="text-gray-400 text-sm w-40 shrink-0 truncate" title={factor}>{factor}</span>
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${Math.min(100, weight * 100)}%` }}
              />
            </div>
            <span className="text-gray-300 text-sm w-12 text-right font-mono">{(weight * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </section>
  )
}
