import type { ChainNode } from '../../types/predict'
import { NODE_TYPE_COLORS } from '../predict/chainConstants'

export function ChainSearchBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  nodes,
  matchCount,
}: {
  search: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (type: string) => void
  nodes: ChainNode[]
  matchCount: number
}) {
  const types = Array.from(new Set(nodes.map((n) => n.type))).sort()
  const hasSearch = search.trim().length > 0

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Search nodes…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600 w-full sm:w-52"
        />
        {hasSearch && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {matchCount} found
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onTypeFilterChange('all')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            typeFilter === 'all' ? 'bg-gray-600 text-gray-100' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All ({nodes.length})
        </button>
        {types.map((t) => {
          const colors = NODE_TYPE_COLORS[t]
          const count = nodes.filter((n) => n.type === t).length
          return (
            <button
              key={t}
              onClick={() => onTypeFilterChange(t)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                typeFilter === t && colors ? colors.btn : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t} ({count})
            </button>
          )
        })}
      </div>
    </div>
  )
}
