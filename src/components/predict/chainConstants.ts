// Hex colors for ReactFlow nodes
export const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  asset:          { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  theme:          { bg: '#2d1b4e', border: '#a855f7', text: '#d8b4fe' },
  sector:         { bg: '#1a3a2a', border: '#22c55e', text: '#86efac' },
  macro:          { bg: '#3d2a00', border: '#f59e0b', text: '#fcd34d' },
  demand_driver:  { bg: '#2d1b4e', border: '#a855f7', text: '#d8b4fe' },
  core:           { bg: '#3d2a00', border: '#f59e0b', text: '#fcd34d' },
  ticker:         { bg: '#1a3a2a', border: '#22c55e', text: '#86efac' },
  upstream:       { bg: '#0c2e35', border: '#06b6d4', text: '#67e8f9' },
  downstream:     { bg: '#3a1e2a', border: '#ec4899', text: '#f9a8d4' },
  event:          { bg: '#1f2937', border: '#6b7280', text: '#d1d5db' },
}

// Tailwind classes for filter buttons
export const NODE_TYPE_COLORS: Record<string, { btn: string; text: string }> = {
  asset:          { btn: 'bg-blue-900/60 text-blue-300 border border-blue-700',      text: 'text-blue-300' },
  theme:          { btn: 'bg-purple-900/60 text-purple-300 border border-purple-700', text: 'text-purple-300' },
  sector:         { btn: 'bg-green-900/60 text-green-300 border border-green-700',    text: 'text-green-300' },
  macro:          { btn: 'bg-amber-900/60 text-amber-300 border border-amber-700',    text: 'text-amber-300' },
  demand_driver:  { btn: 'bg-purple-900/60 text-purple-300 border border-purple-700', text: 'text-purple-300' },
  core:           { btn: 'bg-amber-900/60 text-amber-300 border border-amber-700',    text: 'text-amber-300' },
  ticker:         { btn: 'bg-green-900/60 text-green-300 border border-green-700',    text: 'text-green-300' },
  upstream:       { btn: 'bg-cyan-900/60 text-cyan-300 border border-cyan-700',       text: 'text-cyan-300' },
  downstream:     { btn: 'bg-pink-900/60 text-pink-300 border border-pink-700',       text: 'text-pink-300' },
  event:          { btn: 'bg-gray-700/60 text-gray-300 border border-gray-600',       text: 'text-gray-400' },
}

export const EDGE_COLORS: Record<string, string> = {
  chain_member:  '#60a5fa',
  affects_ticker:'#f59e0b',
  has_ticker:    '#22c55e',
  correlation:   '#a855f7',
  transmits:     '#f43f5e',
}

export const TYPE_ORDER = ['asset', 'theme', 'sector', 'macro', 'demand_driver', 'core', 'ticker', 'upstream', 'downstream', 'event']
export const COL_WIDTH = 260
export const ROW_HEIGHT = 70

/** Map edge strength (0-1) to pixel width (1-4px) */
export function edgeWidth(strength: number): number {
  return 1 + Math.round(Math.min(Math.max(strength, 0), 1) * 3)
}
