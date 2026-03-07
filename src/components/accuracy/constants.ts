export const SYMBOL_COLORS: Record<string, string> = {
  BTC: '#60a5fa',
  ETH: '#a78bfa',
  SOL: '#22d3ee',
  BNB: '#fbbf24',
  XRP: '#34d399',
}

export function getSymbolColor(symbol: string): string {
  const base = symbol.replace('/USDT', '').replace('/USD', '')
  return SYMBOL_COLORS[base] ?? '#9ca3af'
}
