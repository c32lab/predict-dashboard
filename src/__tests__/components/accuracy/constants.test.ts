import { describe, it, expect } from 'vitest'
import { getSymbolColor, SYMBOL_COLORS } from '../../../components/accuracy/constants'

describe('getSymbolColor', () => {
  it('returns mapped color for known USDT symbol', () => {
    expect(getSymbolColor('BTC/USDT')).toBe(SYMBOL_COLORS['BTC'])
  })

  it('returns mapped color for known USD symbol', () => {
    expect(getSymbolColor('ETH/USD')).toBe(SYMBOL_COLORS['ETH'])
  })

  it('returns fallback gray for unknown symbol', () => {
    expect(getSymbolColor('DOGE/USDT')).toBe('#9ca3af')
  })
})
