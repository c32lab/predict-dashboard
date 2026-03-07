import SectionErrorBoundary from '../../SectionErrorBoundary'
import { MacroCard } from '../MacroCard'

interface MacroData {
  score: number | null
  fear_greed: number | null
  fear_greed_trend?: string
  etf_flow_1d: number | null
  etf_flow_5d: number | null
  volume_ratio: number | null
  funding_rate: number | null
  funding_rate_avg: number | null
}

export function MacroOverviewSection({ macro }: { macro: MacroData }) {
  return (
    <SectionErrorBoundary title="Macro Overview">
      <section>
        <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Macro Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MacroCard
            label="Macro Score"
            value={macro.score != null ? macro.score.toFixed(1) : '—'}
            sub="0–10"
          />
          <MacroCard
            label="Fear & Greed"
            value={macro.fear_greed != null ? String(macro.fear_greed) : '—'}
            sub={macro.fear_greed_trend}
          />
          <MacroCard
            label="ETF Flow 1D"
            value={macro.etf_flow_1d != null ? `$${(macro.etf_flow_1d / 1e6).toFixed(0)}M` : '—'}
            sub={macro.etf_flow_5d != null ? `5D: $${(macro.etf_flow_5d / 1e6).toFixed(0)}M` : undefined}
          />
          <MacroCard
            label="Volume Ratio"
            value={macro.volume_ratio != null ? macro.volume_ratio.toFixed(2) : '—'}
          />
          <MacroCard
            label="Funding Rate"
            value={macro.funding_rate != null ? `${(macro.funding_rate * 100).toFixed(3)}%` : '—'}
            sub={macro.funding_rate_avg != null ? `Avg: ${(macro.funding_rate_avg * 100).toFixed(3)}%` : undefined}
          />
        </div>
      </section>
    </SectionErrorBoundary>
  )
}
