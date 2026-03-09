import { NODE_COLORS, EDGE_COLORS } from './chainConstants'

export function ChainLegend() {
  return (
    <div className="flex flex-wrap items-start gap-6 text-xs text-gray-400">
      <div className="space-y-1">
        <span className="font-medium text-gray-300">Node types</span>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(NODE_COLORS).map(([type, colors]) => (
            <span key={type} className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
              />
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <span className="font-medium text-gray-300">Edge relations</span>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(EDGE_COLORS).map(([rel, color]) => (
            <span key={rel} className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5" style={{ background: color }} />
              {rel}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <span className="font-medium text-gray-300">Edge thickness</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-px bg-gray-400" />
            weak
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 bg-gray-400" style={{ height: '3px' }} />
            strong
          </span>
        </div>
      </div>
    </div>
  )
}
