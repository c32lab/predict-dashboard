import { useState, useMemo } from 'react'
import type { ChainNode, ChainEdge } from '../../types/predict'
import { NODE_TYPE_COLORS } from './chainConstants'
import { ChainGraph } from './ChainGraph'

export function IndustryChainSection({ nodes, edges }: { nodes: ChainNode[]; edges: ChainEdge[] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const types = useMemo(() => Array.from(new Set(nodes.map((n) => n.type))).sort(), [nodes])

  const filteredNodes = useMemo(() => nodes.filter((n) => {
    const q = search.toLowerCase()
    const matchSearch = q === '' || n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
    const matchType = typeFilter === 'all' || n.type === typeFilter
    return matchSearch && matchType
  }), [nodes, search, typeFilter])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search nodes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-600 w-full sm:w-52"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter('all')}
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
                onClick={() => setTypeFilter(t)}
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

      {/* ReactFlow Graph */}
      <div className="h-[400px] md:h-[600px] bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
        <ChainGraph filteredNodes={filteredNodes} edges={edges} />
      </div>
    </div>
  )
}
