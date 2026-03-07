import { useMemo } from 'react'
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { ChainNode, ChainEdge } from '../../types/predict'
import { NODE_COLORS, EDGE_COLORS, TYPE_ORDER, COL_WIDTH, ROW_HEIGHT } from './chainConstants'

export function ChainGraph({
  filteredNodes,
  edges,
}: {
  filteredNodes: ChainNode[]
  edges: ChainEdge[]
}) {
  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes])

  const rfNodes: Node[] = useMemo(() => {
    const grouped: Record<string, ChainNode[]> = {}
    for (const n of filteredNodes) {
      if (!grouped[n.type]) grouped[n.type] = []
      grouped[n.type].push(n)
    }
    const orderedTypes = TYPE_ORDER.filter((t) => grouped[t]?.length > 0)
    for (const t of Object.keys(grouped)) {
      if (!TYPE_ORDER.includes(t)) orderedTypes.push(t)
    }
    const result: Node[] = []
    orderedTypes.forEach((type, colIdx) => {
      const colNodes = grouped[type] ?? []
      const colors = NODE_COLORS[type] ?? { bg: '#1f2937', border: '#6b7280', text: '#d1d5db' }
      colNodes.forEach((n, rowIdx) => {
        result.push({
          id: n.id,
          position: { x: colIdx * COL_WIDTH, y: rowIdx * ROW_HEIGHT },
          data: { label: n.name },
          style: {
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 600,
            maxWidth: '220px',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        })
      })
    })
    return result
  }, [filteredNodes])

  const nodeTypeMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const n of filteredNodes) {
      map[n.id] = n.type
    }
    return map
  }, [filteredNodes])

  const rfEdges: Edge[] = useMemo(() => edges
    .filter((e) => filteredNodeIds.has(e.from_node) && filteredNodeIds.has(e.to_node))
    .map((e, i) => ({
      id: `e-${i}`,
      source: e.from_node,
      target: e.to_node,
      style: {
        stroke: EDGE_COLORS[e.relation] ?? '#6b7280',
        strokeWidth: Math.max(1, Math.round(e.strength * 3)),
        opacity: 0.6,
      },
    })), [edges, filteredNodeIds])

  if (filteredNodes.length === 0) {
    return <p className="text-gray-600 text-sm text-center py-6 mt-4">No nodes match the filter</p>
  }

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.1}
      maxZoom={2}
      colorMode="dark"
    >
      <Background variant={BackgroundVariant.Dots} color="#374151" gap={20} size={1} />
      <Controls />
      <MiniMap
        nodeColor={(n) => {
          const type = nodeTypeMap[n.id] ?? ''
          return (NODE_COLORS[type] ?? { border: '#6b7280' }).border
        }}
        style={{ background: '#111827' }}
      />
    </ReactFlow>
  )
}
