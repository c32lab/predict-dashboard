import { describe, it, expect } from 'vitest'
import { formatDateTime, formatTime, formatDate, formatChartTime, formatPrice } from '../../utils/format'

describe('formatDateTime', () => {
  it('formats an ISO string to "MM-DD HH:mm UTC+8"', () => {
    // 2026-03-06T09:09:00Z => UTC+8 = 17:09
    const result = formatDateTime('2026-03-06T09:09:00Z')
    expect(result).toBe('03-06 17:09 UTC+8')
  })

  it('formats a unix timestamp (ms)', () => {
    // 2026-01-01T00:00:00Z => UTC+8 = 08:00, Jan 01
    const ts = new Date('2026-01-01T00:00:00Z').getTime()
    const result = formatDateTime(ts)
    expect(result).toBe('01-01 08:00 UTC+8')
  })

  it('handles midnight UTC (rolls to next day in UTC+8)', () => {
    // 2026-03-05T16:30:00Z => UTC+8 = 2026-03-06 00:30
    const result = formatDateTime('2026-03-05T16:30:00Z')
    expect(result).toBe('03-06 00:30 UTC+8')
  })

  it('pads single-digit months and days', () => {
    const result = formatDateTime('2026-01-05T01:00:00Z')
    // UTC+8 = 09:00
    expect(result).toBe('01-05 09:00 UTC+8')
  })
})

describe('formatTime', () => {
  it('returns "HH:mm:ss" in UTC+8', () => {
    const result = formatTime('2026-03-06T09:09:23Z')
    expect(result).toBe('17:09:23')
  })

  it('handles midnight', () => {
    const result = formatTime('2026-03-05T16:00:00Z')
    expect(result).toBe('00:00:00')
  })

  it('handles numeric timestamp', () => {
    const ts = new Date('2026-06-15T12:30:45Z').getTime()
    const result = formatTime(ts)
    expect(result).toBe('20:30:45')
  })
})

describe('formatDate', () => {
  it('returns "YYYY-MM-DD" in UTC+8', () => {
    const result = formatDate('2026-03-06T09:09:00Z')
    expect(result).toBe('2026-03-06')
  })

  it('rolls to next day when past 16:00 UTC', () => {
    const result = formatDate('2026-12-31T17:00:00Z')
    expect(result).toBe('2027-01-01')
  })

  it('handles numeric timestamp', () => {
    const ts = new Date('2026-06-15T00:00:00Z').getTime()
    const result = formatDate(ts)
    expect(result).toBe('2026-06-15')
  })
})

describe('formatChartTime', () => {
  it('returns "HH:mm" in UTC+8', () => {
    const result = formatChartTime('2026-03-06T09:09:00Z')
    expect(result).toBe('17:09')
  })

  it('handles numeric timestamp', () => {
    const ts = new Date('2026-01-01T00:00:00Z').getTime()
    const result = formatChartTime(ts)
    expect(result).toBe('08:00')
  })
})

describe('formatPrice', () => {
  it('formats BTC with 2 decimals', () => {
    expect(formatPrice(65432.1, 'BTC/USDT')).toBe('$65,432.10')
  })

  it('formats ETH with 2 decimals', () => {
    expect(formatPrice(3200.5, 'ETH/USDT')).toBe('$3,200.50')
  })

  it('formats small coin below $1 with 4 decimals', () => {
    expect(formatPrice(0.1234, 'DOGE/USDT')).toBe('$0.1234')
  })

  it('formats value >= 1 without symbol with 2 decimals', () => {
    expect(formatPrice(1.5)).toBe('$1.50')
  })

  it('formats value < 1 without symbol with 4 decimals', () => {
    expect(formatPrice(0.0567)).toBe('$0.0567')
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.0000')
  })

  it('formats BTC with small value still using 2 decimals', () => {
    // BTC symbol means always 2 decimals regardless of value
    expect(formatPrice(0.5, 'BTC/USDT')).toBe('$0.50')
  })
})
