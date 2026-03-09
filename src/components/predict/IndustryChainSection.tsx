import { useState, useMemo } from 'react'
import type { ChainNode, ChainEdge } from '../../types/predict'
import { ChainGraph } from './ChainGraph'
import { ChainSearchBar } from '../chain/ChainSearchBar'
import { ChainLegend } from '../chain/ChainLegend'
import { ChainNodeDetail } from '../chain/ChainNodeDetail'

export function IndustryChainSection({ nodes, edges }: { nodes: ChainNode[]; edges: ChainEdge[] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedNode, setSelectedNode] = useState<{ id: string; name: string } | null>(null)

  const filteredNodes = useMemo(() => nodes.filter((n) => {
    const matchType = typeFilter === 'all' || n.type === typeFilter
    return matchType
  }), [nodes, typeFilter])

  const highlightedIds = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return new Set<string>()
    return new Set(
      filteredNodes
        .filter((n) => n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q))
        .map((n) => n.id)
    )
  }, [filteredNodes, search])

  return (
    <div className="space-y-4">
      {/* Search & filter controls */}
      <ChainSearchBar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        nodes={nodes}
        matchCount={highlightedIds.size}
      />

      {/* Legend */}
      <ChainLegend />

      {/* ReactFlow Graph + Node Detail Panel */}
      <div className="relative h-[400px] md:h-[600px] bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
        <ChainGraph
          filteredNodes={filteredNodes}
          edges={edges}
          highlightedIds={highlightedIds}
          onNodeClick={(id, name) => setSelectedNode({ id, name })}
        />
        {selectedNode && (
          <ChainNodeDetail
            nodeId={selectedNode.id}
            nodeName={selectedNode.name}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  )
}
