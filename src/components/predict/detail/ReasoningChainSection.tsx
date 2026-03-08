import type { ReasoningStep } from '../../../types/predict'

export function ReasoningChainSection({ chain }: { chain: ReasoningStep[] }) {
  if (!chain || chain.length === 0) {
    return (
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h2 className="text-sm font-semibold text-gray-200">Reasoning Chain</h2>
        <p className="text-gray-500 text-sm mt-2">No reasoning chain available</p>
      </section>
    )
  }

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200">Reasoning Chain</h2>
      </div>
      <div className="p-4 space-y-3">
        {chain.map((s, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-xs font-mono text-blue-400 bg-blue-950 border border-blue-800 rounded px-2 py-1 h-fit shrink-0 uppercase">
              {s.step}
            </span>
            <span className="text-sm text-gray-300">{s.content}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
