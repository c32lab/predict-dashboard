import { describe, it, expect } from 'vitest'
import { fmt } from '../../../components/backtest/constants'

describe('fmt', () => {
  it('formats a valid number', () => {
    expect(fmt(42)).toBe('42%')
  })

  it('falls back to 0 for NaN input', () => {
    expect(fmt('abc')).toBe('0%')
  })

  it('falls back to 0 for null input', () => {
    expect(fmt(null)).toBe('0%')
  })
})
