// Hex colors for ReactFlow nodes
export const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  asset:          { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  theme:          { bg: '#2d1b4e', border: '#a855f7', text: '#d8b4fe' },
  sector:         { bg: '#1a3a2a', border: '#22c55e', text: '#86efac' },
  macro:          { bg: '#3d2a00', border: '#f59e0b', text: '#fcd34d' },
  demand_driver:  { bg: '#3d3a00', border: '#eab308', text: '#fde047' },
  core:           { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  ticker:         { bg: '#1a3a2a', border: '#22c55e', text: '#86efac' },
  upstream:       { bg: '#0d3331', border: '#14b8a6', text: '#5eead4' },
  downstream:     { bg: '#0c2e35', border: '#06b6d4', text: '#67e8f9' },
  event:          { bg: '#3d2a00', border: '#f97316', text: '#fdba74' },
}

// Tailwind classes for filter buttons
export const NODE_TYPE_COLORS: Record<string, { btn: string; text: string }> = {
  asset:          { btn: 'bg-blue-900/60 text-blue-300 border border-blue-700',      text: 'text-blue-300' },
  theme:          { btn: 'bg-purple-900/60 text-purple-300 border border-purple-700', text: 'text-purple-300' },
  sector:         { btn: 'bg-green-900/60 text-green-300 border border-green-700',    text: 'text-green-300' },
  macro:          { btn: 'bg-amber-900/60 text-amber-300 border border-amber-700',    text: 'text-amber-300' },
  demand_driver:  { btn: 'bg-yellow-900/60 text-yellow-300 border border-yellow-700', text: 'text-yellow-300' },
  core:           { btn: 'bg-blue-900/60 text-blue-300 border border-blue-700',       text: 'text-blue-300' },
  ticker:         { btn: 'bg-green-900/60 text-green-300 border border-green-700',    text: 'text-green-300' },
  upstream:       { btn: 'bg-teal-900/60 text-teal-300 border border-teal-700',       text: 'text-teal-300' },
  downstream:     { btn: 'bg-cyan-900/60 text-cyan-300 border border-cyan-700',       text: 'text-cyan-300' },
  event:          { btn: 'bg-orange-900/60 text-orange-300 border border-orange-700', text: 'text-orange-300' },
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

/** Map edge strength (0-1) to pixel width (1-5px) */
export function edgeWidth(strength: number): number {
  return 1 + Math.round(Math.min(Math.max(strength, 0), 1) * 4)
}
