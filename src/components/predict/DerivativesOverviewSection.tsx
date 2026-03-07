import { useState } from 'react'
import { useOpenInterest, useLongShortRatio, useTakerVolume } from '../../hooks/usePredictApi'
import { useSymbols } from '../../hooks/useSymbols'
import { OIChart } from './OIChart'
import { LSRChart } from './LSRChart'
import { TakerVolumeChart } from './TakerVolumeChart'

export function DerivativesOverviewSection() {
  const symbols = useSymbols()
  const [derivSymbol, setDerivSymbol] = useState(symbols[0] ?? 'BTC/USDT')
  const { data: oiData, isLoading: oiLoading } = useOpenInterest(derivSymbol, 24)
  const { data: lsrData, isLoading: lsrLoading } = useLongShortRatio(derivSymbol, 24)
  const { data: tvData, isLoading: tvLoading } = useTakerVolume(derivSymbol, 24)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-200">Derivatives Overview</h2>
        <div className="flex gap-1">
          {symbols.map((s) => (
            <button
              key={s}
              onClick={() => setDerivSymbol(s)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                derivSymbol === s
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s.replace('/USDT', '')}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <OIChart data={oiData} isLoading={oiLoading} />
        <LSRChart data={lsrData} isLoading={lsrLoading} />
        <TakerVolumeChart data={tvData} isLoading={tvLoading} />
      </div>
    </section>
  )
}
