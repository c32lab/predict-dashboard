export const HORIZONS = ['1d', '3d', '7d'] as const
export const HORIZON_COLORS = { '1d': '#3b82f6', '3d': '#8b5cf6', '7d': '#f59e0b' }
export const REGIME_COLORS: Record<string, string> = { bull: '#22c55e', bear: '#ef4444', sideways: '#6b7280' }

export const tooltipStyle = { backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }

export function fmt(v: unknown): string {
  return `${Number(v) || 0}%`
}
